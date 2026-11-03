// GSC 每日数据拉取 — WO-20260923-03
//
// 用服务账号 JWT(RS256, node:crypto 实现,零依赖)取 Search Console 数据:
// 近 28 天总览 + 热门查询 + 热门网页,打印人话摘要,落 docs/library/gsc-latest.json。
// 密钥: secrets/gsc-service-account.json(已 gitignore)。供 daily-health-audit 并入,
// 也可单独运行: node scripts/gsc-report.mjs [--quiet]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createSign } from "node:crypto";

const KEY_PATH = new URL(
  "../../secrets/gsc-service-account.json",
  import.meta.url,
);
const OUT_PATH = new URL("../../docs/library/gsc-latest.json", import.meta.url);
const SITE = "https://loollook.com/";
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
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const d = await res.json();
  if (!d.access_token)
    throw new Error(
      "token exchange failed: " + JSON.stringify(d).slice(0, 200),
    );
  return d.access_token;
}

async function gscApi(token, path, body) {
  const url = body
    ? `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/${path}`
    : `https://searchconsole.googleapis.com/webmasters/v3/${path}`;
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await res.json();
  if (!res.ok)
    throw new Error(`${res.status}: ${JSON.stringify(d).slice(0, 300)}`);
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

// 竞争词观察名单（2026-11-03 · keyword-library V1.1.0 对齐）
// 层级映射：A 层品类词（不指望短期进榜，记录趋势）→ B/C 层主攻词 → D 层长尾验证。
// 第一层品类词看趋势；第二层 Fashion Readers 定位词是主攻；第三层功能/选框词辅助。
const WATCHLIST = [
  // —— A 层 · 品类大词（趋势观察）——
  "reading glasses", // 核心品类词
  "best reading glasses", // 购买意向词
  "reading glasses for women", // 性别细分
  "reading glasses for men", // 性别细分
  "progressive lenses", // 渐进镜片教育词
  // —— 2号位 Fashion Readers 主攻词 ——
  "fashion readers", // 2号位主词
  "fashion cheaters", // 2号位同义双拼（美区常用）
  "fashion readers women", // 性别辅词
  "square fashion readers", // 形状+定位组合
  "oversized fashion readers", // 风格辅词
  "oversized cheaters", // 风格辅词
  "stylish cheaters for women", // 去老年化心智
  "TR90 readers", // 材质维度
  // —— B/C 层 · 去老年化 + 选框 + 工具词 ——
  "ageless eyewear", // 品牌定位词，去老年化核心
  "stylish reading glasses", // 时尚诉求词
  "reading glasses that don't look old", // 痛点词，直接对应品牌叙事
  "glasses for my face shape", // 选框工具配套
  "how to choose eyeglass frames", // 指南类，引导 /choose-eyeglasses
  "best glasses for round face", // 脸型细分
  "virtual try on glasses online", // 虚拟试戴差异化
  "how to measure pupil distance at home", // PD 测量工具
  // —— D 层 · 长尾 GEO 验证 ——
  "affordable reading glasses online", // Core $6-29 同价位
  "reading glasses under $30", // 价格锚点，命中 $26
  "fashion readers that don't look like reading glasses", // 去医疗化心智
  "lightweight TR90 fashion readers", // 轻量化卖点（19.1g）
  "buy fashion readers online", // 交易意图长尾
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
  console.error(
    `service account cannot see ${SITE}. sites visible:`,
    (sites.siteEntry ?? []).map((s) => s.siteUrl).join(", ") || "NONE",
  );
  console.error(
    "→ GSC 设置 → 用户和权限 里把",
    key.client_email,
    "加为拥有者了吗?",
  );
  process.exit(1);
}

const range = { startDate: daysAgo(31), endDate: daysAgo(3) };
const q = (dimensions, limit) =>
  gscApi(token, "searchAnalytics/query", {
    ...range,
    dimensions,
    rowLimit: limit,
    searchType: "web",
  });

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
      dimensionFilterGroups: [
        {
          filters: [
            { dimension: "query", operator: "contains", expression: term },
          ],
        },
      ],
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

const t = (totals.rows ?? [])[0] ?? {
  clicks: 0,
  impressions: 0,
  ctr: 0,
  position: 0,
};
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
  console.log(
    `=== GSC ${range.startDate} ~ ${range.endDate} (权限: ${mine.permissionLevel})`,
  );
  console.log(
    `总览: 点击 ${out.totals.clicks} | 曝光 ${out.totals.impressions} | CTR ${out.totals.ctr}% | 均排 ${out.totals.avgPosition}`,
  );
  console.log("--- 热门查询:");
  for (const r of out.topQueries)
    console.log(
      `  "${r.keys[0]}" 点击${r.clicks} 曝光${r.impressions} 排名${r.position}`,
    );
  console.log("--- 热门网页:");
  for (const r of out.topPages)
    console.log(
      `  ${String(r.clicks).padStart(3)}击/${String(r.impressions).padStart(4)}曝 ${r.keys[0]}`,
    );
  console.log("--- 竞争词观察名单:");
  for (const r of out.watchlist)
    console.log(
      `  ${r.term.padEnd(28)} ${r.position === null ? "— 无曝光" : `排名 ${String(r.position).padEnd(5)} 曝光${r.impressions} 点击${r.clicks}`}`,
    );
}
console.log("saved:", OUT_PATH.pathname);
