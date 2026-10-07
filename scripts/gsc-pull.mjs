#!/usr/bin/env node
// gsc-pull.mjs — Google Search Console 拉数 + 关键词复核（校准环 P0 基础设施，2026-09-14 建）
//
// 用法：
//   node scripts/gsc-pull.mjs auth          # 一次性：起本地回环口，打开浏览器让你点同意，token 缓存本地
//   node scripts/gsc-pull.mjs sites         # 列出账号下已验证的站点（确认 fuzzsofa.com 在）
//   node scripts/gsc-pull.mjs pull [天数]   # 拉查询×页面数据（默认 90 天）→ docs/library/gsc-export.json
//   node scripts/gsc-pull.mjs verify        # 只读复核：关键词库 11 词 vs 真实查询数据，出 T3→T1 建议表
//   node scripts/gsc-pull.mjs apply         # 按建议表升级 keyword-library（T1 升级 + 证据回填，写库动作）
//
// 前置（用户亲自，一次性 5 分钟）：
//   console.cloud.google.com → 建项目 → 启用 Search Console API → OAuth 同意屏(外部,加自己为测试用户)
//   → 凭据 → 创建 OAuth 客户端 ID → 桌面应用 → 下载 JSON 存为 scripts/gsc/client_secret.json
// 前提：fuzzsofa.com 已在 search.google.com/search-console 验证为资源
import fs from "fs";
import path from "path";
import http from "http";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "scripts", "gsc");
const SECRET = path.join(DIR, "client_secret.json");
const TOKEN = path.join(DIR, "token.json");
const EXPORT = path.join(ROOT, "docs", "library", "gsc-export.json");
const KWLIB = path.join(ROOT, "docs", "library", "keyword-library.json");
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const REDIRECT_PORT = 3796;

const log = (...a) => console.log(...a);
const die = (m) => { console.error("✗ " + m); process.exit(1); };

function loadSecret() {
  if (!fs.existsSync(SECRET)) die(`缺 ${SECRET} —— 照脚本头部注释去 Google Cloud Console 建 OAuth 桌面客户端（5 分钟，一次性）`);
  const j = JSON.parse(fs.readFileSync(SECRET, "utf8"));
  const s = j.installed || j.web;
  if (!s) die("client_secret.json 形状不对（要 Desktop 应用类型）");
  return s;
}

async function token() {
  if (!fs.existsSync(TOKEN)) die("无缓存 token —— 先跑: node scripts/gsc-pull.mjs auth");
  const t = JSON.parse(fs.readFileSync(TOKEN, "utf8"));
  if (t.expires_at && Date.now() < t.expires_at - 60000) return t.access_token;
  const s = loadSecret();
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: s.client_id, client_secret: s.client_secret, refresh_token: t.refresh_token, grant_type: "refresh_token" }),
  });
  const j = await r.json();
  if (!r.ok) die("刷新 token 失败: " + JSON.stringify(j));
  t.access_token = j.access_token;
  t.expires_at = Date.now() + (j.expires_in || 3600) * 1000;
  fs.writeFileSync(TOKEN, JSON.stringify(t, null, 2));
  return t.access_token;
}

async function api(pathname, opts = {}) {
  const at = await token();
  const r = await fetch("https://www.googleapis.com/webmasters/v3" + pathname, {
    ...opts,
    headers: { Authorization: "Bearer " + at, "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) die(`GSC API ${pathname} → ${r.status}: ` + JSON.stringify(j).slice(0, 300));
  return j;
}

// ── auth ──
async function auth() {
  const s = loadSecret();
  const redirect = `http://localhost:${REDIRECT_PORT}`;
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", s.client_id);
  url.searchParams.set("redirect_uri", redirect);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  log("\n浏览器将打开 Google 授权页（或手动复制下面的地址）——用拥有 fuzzsofa.com GSC 资源的账号点『允许』：\n\n" + url.toString() + "\n");
  import("child_process").then(({ exec }) => exec(`start "" "${url.toString()}"`, { shell: "cmd.exe" }, () => {}));
  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const u = new URL(req.url, redirect);
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("授权收到，可以关掉这个页面回到终端。");
      server.close();
      u.searchParams.get("code") ? resolve(u.searchParams.get("code")) : reject(new Error("回调缺 code: " + req.url));
    });
    server.on("error", reject);
    const authTimeoutMs = Number(process.env.GSC_AUTH_TIMEOUT_MS) || 900000; // 默认 15 分钟，后台挂着等可用 GSC_AUTH_TIMEOUT_MS 放宽
    server.listen(REDIRECT_PORT, () => log(`等待授权回调 (localhost:${REDIRECT_PORT})…`));
    setTimeout(() => { server.close(); reject(new Error(`授权等待超时（${Math.round(authTimeoutMs / 60000)} 分钟）`)); }, authTimeoutMs).unref?.();
  });
  await exchangeAndSave(code, redirect);
}

// 手动后门：回调跳转打不进本机回环口时（在另一台设备点的同意），把浏览器地址栏
// localhost:3796/?code=... 整段复制过来换 token——auth-code <整段回调URL或code>
async function authCode(arg) {
  if (!arg) die("用法: node scripts/gsc-pull.mjs auth-code '<localhost:3796/?code=... 整段地址>'");
  const m = String(arg).match(/[?&]code=([^&\s]+)/);
  const code = m ? decodeURIComponent(m[1]) : arg.trim();
  if (!code) die("回调地址里没找到 code");
  await exchangeAndSave(code, `http://localhost:${REDIRECT_PORT}`);
}

async function exchangeAndSave(code, redirect) {
  const s = loadSecret();
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: s.client_id, client_secret: s.client_secret, redirect_uri: redirect, grant_type: "authorization_code" }),
  });
  const j = await r.json();
  if (!r.ok || !j.refresh_token) die("换 token 失败（缺 refresh_token 就重跑 auth）: " + JSON.stringify(j).slice(0, 200));
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(TOKEN, JSON.stringify({ ...j, expires_at: Date.now() + (j.expires_in || 3600) * 1000 }, null, 2));
  log("✓ token 已缓存到", TOKEN, "（已 gitignore，不入库）");
}

// ── sites ──
async function sites() {
  const j = await api("/sites");
  const rows = (j.siteEntry || []).map((s) => `${s.permissionLevel.padEnd(10)} ${s.siteUrl}`);
  log(rows.length ? rows.join("\n") : "（账号下没有已验证站点——先去 search.google.com/search-console 添加 fuzzsofa.com）");
}

// ── pull ──
async function pull(days = 90) {
  const j = await api("/sites");
  const site = (j.siteEntry || []).find((s) => s.siteUrl.includes("fuzzsofa.com"));
  if (!site) die("fuzzsofa.com 不在已验证站点列表——先跑 sites 看看");
  const siteUrl = site.siteUrl;
  const end = new Date(); const start = new Date(Date.now() - days * 86400000);
  const iso = (d) => d.toISOString().slice(0, 10);
  const enc = encodeURIComponent(siteUrl);
  const all = []; let startRow = 0;
  while (true) {
    const body = { startDate: iso(start), endDate: iso(end), dimensions: ["query", "page"], rowLimit: 25000, startRow };
    const r = await api(`/sites/${enc}/searchAnalytics/query`, { method: "POST", body: JSON.stringify(body) });
    const rows = r.rows || [];
    all.push(...rows);
    if (rows.length < 25000) break;
    startRow += 25000;
  }
  const out = { manifest: "GSC search-analytics 导出（T1 第一方数据）", site: siteUrl, start: iso(start), end: iso(end), pulled_at: new Date().toISOString(), rows: all };
  fs.writeFileSync(EXPORT, JSON.stringify(out, null, 1));
  const clicks = all.reduce((a, r) => a + r.clicks, 0), imps = all.reduce((a, r) => a + r.impressions, 0);
  log(`✓ ${all.length} 行 → ${path.relative(ROOT, EXPORT)}`);
  log(`  合计: ${clicks} 点击 / ${imps} 展示 / ${all.length ? (clicks / imps * 100).toFixed(2) : "0"}% CTR`);
  if (imps === 0) log("  ⚠ 展示为 0：站点可能刚验证或流量极小——数据攒起来再跑 verify");
}

// ── verify（只读）/ apply（写库）──
function matchQueries(days) {
  if (!fs.existsSync(EXPORT)) die("缺 gsc-export.json —— 先跑 pull");
  const ex = JSON.parse(fs.readFileSync(EXPORT, "utf8"));
  const K = JSON.parse(fs.readFileSync(KWLIB, "utf8"));
  const kws = K.keywords || [];
  const agg = {};
  for (const r of ex.rows) {
    const q = (r.keys?.[0] || "").toLowerCase();
    const page = r.keys?.[1] || "";
    for (const k of kws) {
      const w = (k.keyword || k.word || "").toLowerCase();
      const hit = q === w || (q.includes(w) && w.split(" ").every((p) => q.includes(p)));
      if (!hit) continue;
      const a = (agg[k.keyword || k.word] ||= { impressions: 0, clicks: 0, pages: new Set(), queries: new Set(), tier_now: k.volume_tier, assigned: k.page_assigned });
      a.impressions += r.impressions; a.clicks += r.clicks; a.pages.add(page); a.queries.add(q);
    }
  }
  return { ex, kws, agg, days };
}

async function verify(days) {
  const { ex, kws, agg } = matchQueries(days);
  log(`GSC 数据窗口: ${ex.start} ~ ${ex.end}（拉取于 ${ex.pulled_at.slice(0, 10)}）| 关键词库 ${kws.length} 词\n`);
  log("词".padEnd(24), "展示".padStart(6), "点击".padStart(5), "CTR%".padStart(7), "均位置".padStart(7), "  现tier → 建议");
  for (const k of kws) {
    const name = k.keyword || k.word || "?";
    const a = agg[name];
    if (!a) { log(name.padEnd(24), "0".padStart(6), "0".padStart(5), "-".padStart(7), "-".padStart(7), "  维持（GSC 无数据，T3/未验证 保留）"); continue; }
    const pos = a.impressions ? "有" : "?"; // 均位置需按行加权，此处给存在性
    const sug = a.impressions >= 30 ? "T1" : a.impressions >= 10 ? "T1(弱)" : "维持";
    log(name.padEnd(24), String(a.impressions).padStart(6), String(a.clicks).padStart(5), String(a.impressions ? (a.clicks / a.impressions * 100).toFixed(1) : "0").padStart(7), pos.padStart(7), `  → ${sug}（${a.queries.size} 变体 / ${a.pages.size} 页）`);
  }
  log("\n（只读复核未写库——确认后跑 node scripts/gsc-pull.mjs apply 才升级 T1 并回填证据）");
}

async function apply(days) {
  const { kws, agg } = matchQueries(days);
  const K = JSON.parse(fs.readFileSync(KWLIB, "utf8"));
  let up = 0;
  for (const k of K.keywords || []) {
    const a = agg[k.keyword || k.word];
    if (!a || a.impressions < 10) continue;
    const newTier = (k.volume_tier || "").startsWith("T1") ? k.volume_tier : `T1 verified：GSC 实测 ${a.impressions} 展示 / ${a.clicks} 点击（gsc-export ${exDate()}）`;
    if (newTier !== k.volume_tier) { k.volume_tier = newTier; k.evidence_tier = "T1"; up++; }
  }
  K.updated = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(KWLIB, JSON.stringify(K, null, 2) + "\n");
  log(`✓ 升级 ${up} 词 → keyword-library（T1 + GSC 证据回填）`);
}
const exDate = () => (fs.existsSync(EXPORT) ? JSON.parse(fs.readFileSync(EXPORT, "utf8")).end : "");

const [cmd, days] = process.argv.slice(2);
({ auth, authCode: () => authCode(days), sites, pull: () => pull(Number(days) || 90), verify: () => verify(Number(days) || 90), apply: () => apply(Number(days) || 90) }[cmd] || (() => die("命令: auth | auth-code '<回调地址>' | sites | pull [天数] | verify | apply")))();
