// GSC 每日数据拉取 — WO-20260923-03
//
// 用服务账号 JWT(RS256, node:crypto 实现,零依赖)取 Search Console 数据:
// 近 28 天总览 + 热门查询 + 热门网页,打印人话摘要,落 docs/library/gsc-latest.json。
// 密钥: secrets/gsc-service-account.json(已 gitignore)。供 daily-health-audit 并入,
// 也可单独运行: node scripts/gsc-report.mjs [--quiet]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createSign } from "node:crypto";

const KEY_PATH = new URL("../secrets/gsc-service-account.json", import.meta.url);
const OUT_PATH = new URL("../docs/library/gsc-latest.json", import.meta.url);
const SITE = "https://fuzzsofa.com/";
const QUIET = process.argv.includes("--quiet");

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function accessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const b64u = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const header = b64u({ alg: "RS256", typ: "JWT" });
  const claim = b64u({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: key.token_uri,
    iat: now,
    exp: now + 3600,
  });
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const assertion = `${header}.${claim}.${signer.sign(key.private_key).toString("base64url")}`;
  const res = await fetch(key.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  const d = await res.json();
  if (!d.access_token) throw new Error("token exchange failed: " + JSON.stringify(d).slice(0, 200));
  return d.access_token;
}

async function gscApi(token, path, body) {
  const url = body
    ? `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/${path}`
    : `https://searchconsole.googleapis.com/webmasters/v3/${path}`;
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(d).slice(0, 300)}`);
  return d;
}

const rows = (d) =>
  (d.rows ?? []).map((r) => ({
    keys: r.keys ?? [],
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ? Math.round(r.position * 10) / 10 : 0,
  }));

// 竞争词观察名单(2026-09-29 竞品 SERP 分析后立)——层级见
// docs/library/evidence/2026-09-29-google-ai-overview-noctua.md 及会话记录。
// 第一层品类词不指望短期进榜,记录趋势即可;第二层 AI 渲染词是主攻。
const WATCHLIST = [
  "ai gorilla sofa",       // 二层·主攻(2026-09-29 实测第6)
  "ai gorilla couch",      // 二层
  "gorilla sofa real",     // 二层·拦截意图
  "gorilla sofa",          // 三层·大词承接(SERP 无真产品页=空门)
  "gorilla sofa price",    // 三层·blog #2 靶词
  "animal sofa",           // 一层·品类(实测 15.3)
  "animal shaped sofa",    // 一层·品类
  "animal shaped furniture", // 一层·品类(实测 23)
  "owl armchair",          // Noctua 品种词
  "owl chair",             // Noctua 品种词
  "cat sofa",              // Mofu 品种词
  "cat armchair",          // Mofu 品种词(购买意图变体)
  "meteorite sofa",        // Meteorite 品种词(自造品类,空词族)
  "space age sofa",        // Meteorite 趋势词(2026 Space Age 复兴带)
  "sculptural sofa",       // Meteorite/Kong 共用品类词
  "designer furniture dubai", // 四层·campaign
  // —— 浪潮桥词(2026-09-29 站主策略:meteorite 依附五波浪潮搜索)——
  "meteor shower",          // 流星雨浪·年度尖峰词,验证桥内容是否浮现
  "celestial decor",        // 天体美学浪·成熟奢华向
  "space themed room",      // 天体浪·长尾(B2B 兼用)
  // —— 意向词(细网·购买意图,与浪词粗网并行 7:3)——
  "meteorite for sale",     // 真陨石收藏家·自带钱包的词族
  "gifts for space lovers", // 礼物意向·Q4 主打
];

if (!existsSync(KEY_PATH)) {
  console.error("missing", KEY_PATH.pathname);
  process.exit(1);
}
const key = JSON.parse(readFileSync(KEY_PATH, "utf8"));
const token = await accessToken(key);

const sites = await gscApi(token, "sites", null);
const mine = (sites.siteEntry ?? []).find((s) => s.siteUrl === SITE);
if (!mine) {
  console.error(`service account cannot see ${SITE}. sites visible:`, (sites.siteEntry ?? []).map((s) => s.siteUrl).join(", ") || "NONE");
  console.error("→ GSC 设置 → 用户和权限 里把", key.client_email, "加为拥有者了吗?");
  process.exit(1);
}

const range = { startDate: daysAgo(31), endDate: daysAgo(3) };
const q = (dimensions, limit) =>
  gscApi(token, "searchAnalytics/query", { ...range, dimensions, rowLimit: limit, searchType: "web" });

const [totals, queries, pages] = await Promise.all([
  q([], 1),
  q(["query"], 15),
  q(["page"], 10),
]);

// 逐词点名:总榜 15 名看不到的长尾词,用过滤器单独取(无数据=无曝光,记 null)
const watchlist = [];
for (const term of WATCHLIST) {
  try {
    const r = await gscApi(token, "searchAnalytics/query", {
      ...range,
      dimensions: ["query"],
      rowLimit: 1,
      searchType: "web",
      dimensionFilterGroups: [{ filters: [{ dimension: "query", operator: "contains", expression: term }] }],
    });
    const row = (r.rows ?? [])[0];
    watchlist.push({
      term,
      clicks: row?.clicks ?? 0,
      impressions: row?.impressions ?? 0,
      position: row?.position ? Math.round(row.position * 10) / 10 : null,
    });
  } catch {
    watchlist.push({ term, clicks: 0, impressions: 0, position: null });
  }
}

const t = (totals.rows ?? [])[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
const out = {
  at: new Date().toISOString(),
  site: SITE,
  permission: mine.permissionLevel,
  range,
  totals: {
    clicks: t.clicks ?? 0,
    impressions: t.impressions ?? 0,
    ctr: Math.round((t.ctr ?? 0) * 1000) / 10,
    avgPosition: t.position ? Math.round(t.position * 10) / 10 : 0,
  },
  topQueries: rows(queries),
  topPages: rows(pages),
  watchlist,
};

writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
if (!QUIET) {
  console.log(`=== GSC ${range.startDate} ~ ${range.endDate} (权限: ${mine.permissionLevel})`);
  console.log(`总览: 点击 ${out.totals.clicks} | 曝光 ${out.totals.impressions} | CTR ${out.totals.ctr}% | 均排 ${out.totals.avgPosition}`);
  console.log("--- 热门查询:");
  for (const r of out.topQueries) console.log(`  "${r.keys[0]}" 点击${r.clicks} 曝光${r.impressions} 排名${r.position}`);
  console.log("--- 热门网页:");
  for (const r of out.topPages) console.log(`  ${String(r.clicks).padStart(3)}击/${String(r.impressions).padStart(4)}曝 ${r.keys[0]}`);
  console.log("--- 竞争词观察名单:");
  for (const r of out.watchlist)
    console.log(`  ${r.term.padEnd(28)} ${r.position === null ? "— 无曝光" : `排名 ${String(r.position).padEnd(5)} 曝光${r.impressions} 点击${r.clicks}`}`);
}
console.log("saved:", OUT_PATH.pathname);
