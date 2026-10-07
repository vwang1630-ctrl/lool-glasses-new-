// 每日健康巡检（WO-20260922-18 · 全站健康操盘手制度）
// 五类检查：结构化数据 / GA4 断流代理 / SSL / 基础SEO / （GSC 项由周任务+本脚本 JSON-LD 侧覆盖）
// 用法：node --env-file=.env scripts/daily-health-audit.mjs [origin]
//   origin 默认 http://localhost:80（生产）；传 http://localhost:8080 即巡检预发
// 输出：控制台人话一行 + docs/library/health-report-latest.json（结构化全量）
import fs from "node:fs";
import http from "node:http";

const ORIGIN = process.argv[2] || "http://localhost:80";
const PUBLIC = "https://fuzzsofa.com";
const out = { at: new Date().toISOString(), origin: ORIGIN, checks: {}, problems: [], fixedHint: [] };
const P = (c, name, detail) => {
  out.checks[name] = { ok: c, ...(detail ? { detail } : {}) };
  if (!c) out.problems.push({ name, ...(typeof detail === "string" ? { detail } : detail) });
};

/* ---------- DB 通道（复用 SQL-over-HTTP 网关） ---------- */
function sql(query, params = []) {
  const raw = fs.readFileSync(".env", "utf8");
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
      (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => (res.statusCode === 200 ? resolve(JSON.parse(d)) : reject(new Error(`SQL ${res.statusCode}`)))); },
    );
    req.on("error", reject); req.write(body); req.end();
  });
}

const fetchText = async (url, opts = {}) => {
  try {
    const r = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15000), ...opts });
    const t = r.status >= 300 && r.status < 400 ? "" : await r.text().catch(() => "");
    return { status: r.status, headers: r.headers, text: t };
  } catch (e) { return { status: 0, error: String(e).slice(0, 100) };
  }
};
// 巡检用：跟随 301/302（DB 商品与静态种子的规范路径不同，都合法）
const fetchPage = (url) => fetchText(url, { redirect: "follow" });

/* ---------- ① 结构化数据：全部已发布 PDP 的 JSON-LD 体检 ---------- */
// Google 商品摘要必填/推荐字段台账；aggregateRating/review=可选增强（无真实评论时留空=合规，占位假评=违规，见 WO-18 反对记录）
const REQUIRED_OFFERS = ["price", "priceCurrency", "availability"];
let pdpTotal = 0, pdpClean = 0;
const pdpIssues = [];
try {
  const { rows: prods } = await sql(`SELECT slug FROM products WHERE published IS NOT FALSE ORDER BY slug`);
  for (const { slug } of prods) {
    const path = `/en/products/${slug}.html`;
    const r = await fetchPage(ORIGIN + path);
    if (r.status !== 200) { pdpIssues.push({ slug, issue: `PDP ${r.status}` }); continue; }
    pdpTotal++;
    const blocks = [...r.text.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    let product = null;
    for (const b of blocks) {
      try { const j = JSON.parse(b); if (j["@type"] === "Product") product = j; } catch { pdpIssues.push({ slug, issue: "JSON-LD 语法错误" }); }
    }
    if (!product) { pdpIssues.push({ slug, issue: "缺 Product JSON-LD" }); continue; }
    const bad = [];
    if (!product.name || !product.image?.length) bad.push("name/image");
    if (!product.brand?.name) bad.push("brand");
    if (!product.offers) bad.push("offers 缺失");
    else {
      const o = product.offers;
      if (o["@type"] === "AggregateOffer") {
        // 变体价区间形状：lowPrice/highPrice 必填，returnPolicy 挂同层
        if (o.lowPrice === undefined || o.highPrice === undefined) bad.push("offers.low/highPrice");
        if (!o.hasMerchantReturnPolicy) bad.push("returnPolicy");
      } else {
        for (const k of REQUIRED_OFFERS) if (o[k] === undefined) bad.push(`offers.${k}`);
        if (!o.hasMerchantReturnPolicy) bad.push("returnPolicy");
      }
    }
    if (bad.length) pdpIssues.push({ slug, issue: bad.join(", ") }); else pdpClean++;
  }
  P(pdpIssues.length === 0, "structured-data", pdpIssues.length ? { count: pdpIssues.length, items: pdpIssues.slice(0, 6) } : `${pdpClean}/${pdpTotal} PDP 全绿`);
} catch (e) { P(false, "structured-data", `巡检异常 ${e.message}`); }

/* ---------- ② GA4 断流代理：站内埋点事件 24h/48h 计数 ---------- */
try {
  const { rows } = await sql(`SELECT action, count(*)::int AS n FROM consult_events WHERE created_at > now() - interval '48 hours' GROUP BY action`);
  const map = Object.fromEntries(rows.map((r) => [r.action, r.n]));
  const last48 = rows.reduce((s, r) => s + r.n, 0);
  P(true, "ga4-proxy", map); // 事件低频是常态，只报数不误报；8 天全 0 才升级告警
  const { rows: w } = await sql(`SELECT count(*)::int AS n FROM consult_events WHERE created_at > now() - interval '8 days'`);
  if (w[0].n === 0) out.problems.push({ name: "ga4-dead", detail: "8 天 0 埋点事件=断流实锤" });
} catch (e) { P(false, "ga4-proxy", `查询异常 ${e.message}`); }

/* ---------- ③ SSL / Cloudflare ---------- */
const httpProbe = await fetchText("http://fuzzsofa.com/en");
const httpsHome = await fetchText(PUBLIC + "/en");
const hsts = httpsHome.headers?.get("strict-transport-security") || null;
out.checks.ssl = {
  httpBare: httpProbe.status, // 200=明文仍裸访（等用户 CF 开 Always Use HTTPS）
  httpsHome: httpsHome.status,
  hsts: hsts || "无",
};
if (httpProbe.status === 200) out.problems.push({ name: "ssl-http-bare", detail: "明文 HTTP 仍对外服务（CF Always Use HTTPS 未开，用户侧开关）" });
if (!hsts) out.problems.push({ name: "ssl-hsts", detail: "无 HSTS（CF 后台开启）" });

/* ---------- ④ 基础 SEO ---------- */
const sm = await fetchText(PUBLIC + "/sitemap.xml");
const smUrls = sm.text ? (sm.text.match(/<loc>/g) || []).length : 0;
P(sm.status === 200 && smUrls >= 50, "sitemap", `${sm.status} / ${smUrls} 条 URL`);
const rb = await fetchText(PUBLIC + "/robots.txt");
P(rb.status === 200 && /GPTBot/.test(rb.text) && /sitemap/i.test(rb.text), "robots", `${rb.status} / AI 爬虫清单 ${/GPTBot/.test(rb.text) ? "在" : "缺"} / sitemap 行 ${/sitemap/i.test(rb.text) ? "在" : "缺"}`);
// 抽查 PDP canonical + og:image（跟随重定向到规范页）
try {
  const { rows: one } = await sql(`SELECT slug FROM products WHERE published IS NOT FALSE ORDER BY slug LIMIT 1`);
  const r = await fetchPage(ORIGIN + `/en/products/${one[0].slug}.html`);
  const canon = r.text?.match(/<link[^>]*rel="canonical"[^>]*>/)?.[0]?.match(/href="([^"]+)"/)?.[1];
  const ogimg = r.text?.match(/<meta[^>]*property="og:image"[^>]*>/)?.[0]?.match(/content="([^"]+)"/)?.[1];
  P(!!canon && !!ogimg, "canonical-og", { canonical: canon || "缺", ogImage: ogimg ? "在" : "缺" });
  if (ogimg) {
    const img = await fetchText(ogimg.startsWith("http") ? ogimg : PUBLIC + ogimg, { method: "HEAD" });
    P(img.status === 200, "og-image-200", `${img.status}`);
  }
} catch (e) { P(false, "canonical-og", e.message); }

/* ---------- ⑤ AI 爬虫遥测（GEO，WO-17 起有数） ---------- */
try {
  const { rows } = await sql(`SELECT bot, count(*)::int AS n FROM ai_bot_hits WHERE created_at > now() - interval '24 hours' GROUP BY bot ORDER BY n DESC`);
  out.checks.aiBots24h = rows;
} catch { out.checks.aiBots24h = "表未建"; }

/* ---------- ⑥ 客户端报错遥测（WO-19 起有数）：24h 前端崩溃/资产404 ---------- */
try {
  // 排除自测行：kind=smoke 是建表/curl 冒烟，msg 前缀 probe-synthetic 是无头浏览器
  // 合成探针（首日验证自留，2026-09-22 巡检曾误报）——真实用户报错才进问题清单
  const { rows } = await sql(`SELECT kind, count(*)::int AS n FROM client_errors WHERE created_at > now() - interval '24 hours' AND kind <> 'smoke' AND msg NOT LIKE '%probe-synthetic%' GROUP BY kind ORDER BY n DESC`);
  const total = rows.reduce((s, r) => s + r.n, 0);
  out.checks.clientErrors24h = { total, byKind: rows };

  // 安全检查:DB 网关必须走加密传输(http=明文 Basic auth+明文数据,2026-10-01 立项 P0-2)
  try {
    const dbUrl = ((fs.readFileSync(".env", "utf8").match(/^DATABASE_URL=(.*)$/m) || [])[1] || "").trim().replace(/^"+|"+$/g, "");
    const isHttp = dbUrl.startsWith("http://");
    out.checks.dbGatewayTransport = { ok: !isHttp, detail: isHttp ? "网关为明文 http——站主已联系供应商上 TLS,未完成前每日可见" : "https ✓" };
    if (isHttp) out.problems.push({ name: "db-gateway-transport", detail: "SQL 网关走明文 http(公网),修复后本项转绿" });
  } catch { /* env 缺失不阻断 */ }
  // 真实用户报错 >0 就列问题（噪声由上报端每页 5 条上限 + 100/h 预算压住）
  if (total > 0) {
    const { rows: top } = await sql(`SELECT kind, left(msg, 120) AS msg, count(*)::int AS n FROM client_errors WHERE created_at > now() - interval '24 hours' AND kind <> 'smoke' AND msg NOT LIKE '%probe-synthetic%' GROUP BY kind, left(msg, 120) ORDER BY n DESC LIMIT 5`);
    out.problems.push({ name: "client-errors", detail: { total, top } });
  }
} catch { out.checks.clientErrors24h = "表未建"; }

/* ---------- ⑦ GSC 搜索表现（WO-20260923-03，服务账号只读） ---------- */
try {
  const { execSync } = await import("node:child_process");
  execSync("node scripts/gsc-report.mjs --quiet", { stdio: "pipe", timeout: 60000 });
  const g = JSON.parse(fs.readFileSync("docs/library/gsc-latest.json", "utf8"));
  out.checks.gsc = { totals: g.totals, topQueries: g.topQueries.slice(0, 5), at: g.at };
} catch (e) {
  out.checks.gsc = { ok: false };
  out.problems.push({ name: "gsc-pull", detail: String(e.message).slice(0, 120) });
}

/* ---------- 汇总 ---------- */
const autoFixable = out.problems.filter((p) => !["ssl-http-bare", "ssl-hsts"].includes(p.name));
out.summary = { found: out.problems.length, userAction: out.problems.length - autoFixable.length };
fs.writeFileSync("docs/library/health-report-latest.json", JSON.stringify(out, null, 2));
const line = out.problems.length === 0
  ? `巡检干净：${pdpClean}/${pdpTotal} PDP JSON-LD 全绿，sitemap ${smUrls} 条，AI 爬虫 24h ${rows.length ? "有" : "无"}命中。`
  : `发现 ${out.problems.length} 个问题：${out.problems.map((p) => p.name).join("、")}`;
console.log(line);
console.log(JSON.stringify(out.summary));
