// fishing-report.mjs — 捕鱼效率周报(2026-09-30 立,渔网理论三增量之一)
// 三路 join:①GSC 竞争词观察名单(位置/曝光) ②EDM 池按 source 归因 ③consult_events 近 7 天
// ④漏网之鱼:有曝光零点击的查询,点名修钩子
// 用法: node scripts/fishing-report.mjs  → 打印摘要 + 落 docs/library/fishing-report-latest.json
// 周一自动(gsc-weekly.bat 追加)或手动跑。
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "docs", "library", "fishing-report-latest.json");
const OUT_LINES = [];

function log(s) { OUT_LINES.push(s); console.log(s); }

function sql(query, params = []) {
  const raw = fs.readFileSync(path.join(ROOT, ".env"), "utf8");
  const line = raw.match(/^DATABASE_URL=(.+?)\r?$/m)?.[1]?.trim().replace(/^"|"$/g, "");
  const u = new URL(line);
  const user = decodeURIComponent(u.username || ""), pass = decodeURIComponent(u.password || "");
  u.username = ""; u.password = "";
  const headers = { "Content-Type": "application/json" };
  if (user || pass) headers.Authorization = `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, params });
    const req = http.request(
      { hostname: u.hostname, port: u.port || 80, path: u.pathname + u.search, method: "POST", headers: { ...headers, "Content-Length": Buffer.byteLength(body) } },
      (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => (res.statusCode === 200 ? resolve(JSON.parse(d)) : reject(new Error(`SQL ${res.status}`)))); },
    );
    req.on("error", reject); req.write(body); req.end();
  });
}

// ── ① GSC 观察名单 + 热门查询(gsc-latest.json 由 gsc-report 每日刷新) ──
let gsc = null;
try { gsc = JSON.parse(fs.readFileSync(path.join(ROOT, "docs", "library", "gsc-latest.json"), "utf8")); } catch {}

log(`=== 捕鱼效率周报 ${new Date().toISOString().slice(0, 10)} ===`);

const watch = gsc?.watchlist || [];
if (watch.length) {
  log(`\n【① 网结位置】GSC 观察名单(${watch.length} 词,31~3 天窗口)`);
  for (const w of watch) {
    log(`  ${w.term.padEnd(28)} ${w.position === null ? "— 无曝光(空位/未接网)" : `排名 ${w.position} · 曝光${w.impressions} · 点击${w.clicks}`}`);
  }
}

// 漏网之鱼:有曝光零点击。噪声分类器(2026-09-30,站主令):
// 噪声特征 = 查询语法(引号/括号/布尔)或超长(>80字符)或已知无关模式——
// ⚠️ 故意不按关键词过滤(如 duty):关税是 core 商业话题,"furniture customs duty"
// 是带钱包的真鱼。噪声进 noise 桶保留可审计,不丢弃。
const NOISE_PATTERNS = ["aluminium", "inter-ministerial", "rationalisation"];
function isNoise(q) {
  const k = q.keys[0] || "";
  if (k.length > 80) return "超长查询(>80字符,疑似程序串)";
  if (/["()]|\bor\b/i.test(k)) return "布尔/引号语法(调研式查询)";
  if (NOISE_PATTERNS.some((p2) => k.toLowerCase().includes(p2))) return "已知无关模式";
  return null;
}
const leaks = [], noise = [];
for (const q of (gsc?.topQueries || [])) {
  if (q.impressions > 0 && q.clicks === 0) {
    const why = isNoise(q);
    (why ? noise : leaks).push({ ...q, why });
  }
}
log(`\n【② 漏网之鱼】有曝光零点击(${leaks.length} 词)——钩子/标题修复候选:`);
for (const q of leaks) log(`  "${q.keys[0]}" 排名${q.position} · 曝光${q.impressions} · 0点击`);
if (noise.length) {
  log(`  噪声桶(${noise.length},已排除):`);
  for (const q of noise) log(`    ✗ "${q.keys[0].slice(0, 60)}" — ${q.why}`);
}

// ── ② EDM 池归因(按 source=平台:slug 拆) ──
let edm = [];
try {
  const r = await sql("select coalesce(source,'unknown') as source, count(*)::int as n from newsletter_subscribers group by source order by n desc");
  edm = r.rows;
} catch (e) { log(`EDM 池不可达: ${e.message}`); }
log(`\n【③ EDM 池归因】${edm.reduce((a, b) => a + b.n, 0)} 个邮箱,按来源:`);
for (const s of edm) log(`  ${s.source}: ${s.n}`);

// ── ③ consult_events 近 7 天(询盘信号) ──
let consult = [];
try {
  const r = await sql("select action, surface, count(*)::int as n from consult_events where created_at > now() - interval '7 days' group by action, surface, note order by n desc");
  consult = r.rows;
} catch (e) { log(`consult 不可达: ${e.message}`); }
log(`\n【④ 询盘信号】近 7 天 consult_events:`);
if (!consult.length) log("  (近 7 天无记录)");
for (const c of consult) log(`  ${c.action} · ${c.surface || "-"}: ${c.n}`);

const out = {
  at: new Date().toISOString(),
  gsc_range: gsc?.range || null,
  watchlist: watch,
  leaks,
  noise,
  edm_sources: edm,
  consult_7d: consult,
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
log(`\nsaved: ${OUT}`);
