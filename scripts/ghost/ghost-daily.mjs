// 幽灵员工 · Phase 1 —— 每日情报员（只读，不碰钱、不做法律动作）
//
//   1. FX 哨兵      美元/人民币中间价 vs 系统换汇率（价卡入库用的 FX）→ 漂移告警
//   2. 在途包裹     orders 表有 tracking_number 的单 → 承运商官网拟人抓取最新事件
//   3. 承运商公告   顺丰 / DHL 官网页面标题抓取 → 与上次比对 → 新公告提醒
//   输出：scripts/ghost/briefings/YYYY-MM-DD.md + runs.jsonl 追加一行
//
// 纪律：Phase 1 全程只读数据库；外网低频（每次运行每单最多一次请求）+ 本地缓存 6 小时；
//       抓取失败如实写进简报，绝不静默吞掉（失败本身就是情报：说明要升级 Phase 2）。
//
// Windows 计划任务注册见同目录 README.md。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..", "..");
const STATE = path.join(HERE, "state");
const BRIEFINGS = path.join(HERE, "briefings");
for (const d of [STATE, BRIEFINGS]) fs.mkdirSync(d, { recursive: true });

const SYSTEM_FX = 7.15; // 顺丰价卡入库换汇（WO-20260918-01）；漂移 >2% 触发提醒
// 站主裁决 2026-09-26（选项1「先不动」）：价卡换汇基准维持 7.15，不随行市调价；
// 触发线（命中任一 → 简报升级为「站主裁决触发」，其余情况 FX 告警仅记录不催办）：
//   a. 现价 <= 6.60（硬线）  b. 连续 >=30 天现价 < 6.80（趋势线，天数存 state/fx-watch.json）
const FX_TRIGGER_HARD = 6.60;
const FX_TRIGGER_TREND = { rate: 6.80, days: 30, stateFile: new URL("./state/fx-watch.json", import.meta.url) };
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

/* ── DB client（HTTP SQL 协议：sql + query 字段都必带） ─────────────── */

function dbConfig() {
  const raw = fs.readFileSync(path.join(ROOT, ".env"), "utf8");
  const line = raw.match(/^DATABASE_URL=(.+?)\r?$/m)?.[1]?.trim().replace(/^"|"$/g, "");
  if (!line) throw new Error("DATABASE_URL missing");
  const parsed = new URL(line);
  const user = decodeURIComponent(parsed.username || "");
  const pass = decodeURIComponent(parsed.password || "");
  parsed.username = "";
  parsed.password = "";
  const headers = { "Content-Type": "application/json" };
  if (user || pass) headers.Authorization = `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
  return { endpoint: parsed.toString(), headers };
}

function sql(text, params = []) {
  const { endpoint, headers } = dbConfig();
  const attempt = (n) =>
    new Promise((resolve, reject) => {
      const u = new URL(endpoint);
      const body = JSON.stringify({ sql: text, query: text, params });
      const req = http.request(
        {
          hostname: u.hostname, port: u.port || 80, path: u.pathname + u.search,
          method: "POST", headers: { ...headers, "Content-Length": Buffer.byteLength(body) },
        },
        (res) => {
          let data = "";
          res.on("data", (c) => { data += c; });
          res.on("end", () => {
            if (res.statusCode !== 200) return reject(new Error(`SQL ${res.statusCode}: ${data.slice(0, 200)}`));
            try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
          });
        },
      );
      req.on("error", (e) => {
        if (n < 3) setTimeout(() => attempt(n + 1).then(resolve, reject), 400);
        else reject(e);
      });
      req.write(body);
      req.end();
    });
  return attempt(0);
}

/* ── 小工具 ─────────────────────────────────────────────────────────── */

const readJson = (p, dflt) => {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return dflt; }
};
const writeJson = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function humanGet(url, { referer } = {}) {
  const headers = {
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.6",
  };
  if (referer) headers.Referer = referer;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

/* ── 1. FX 哨兵 ─────────────────────────────────────────────────────── */

async function collectFx() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(15000) });
    const data = await res.json();
    const cny = Number(data?.rates?.CNY);
    if (!Number.isFinite(cny) || cny <= 0) throw new Error("er-api 响应无 CNY");
    const drift = ((cny - SYSTEM_FX) / SYSTEM_FX) * 100;
    // 站主裁决 2026-09-26 选项1：价卡不动，触发线记账（a 硬线 6.60 / b 趋势线 连续 30 天 <6.80）
    let watch = { belowTrendStreak: 0, lastDate: null, triggered: false };
    try { watch = { ...watch, ...JSON.parse(fs.readFileSync(FX_TRIGGER_TREND.stateFile, "utf8")) }; } catch {}
    const today = new Date().toISOString().slice(0, 10);
    if (watch.lastDate !== today) {
      watch.belowTrendStreak = cny < FX_TRIGGER_TREND.rate ? (watch.belowTrendStreak || 0) + 1 : 0;
      watch.lastDate = today;
    }
    const hardHit = cny <= FX_TRIGGER_HARD;
    const trendHit = watch.belowTrendStreak >= FX_TRIGGER_TREND.days;
    watch.triggered = hardHit || trendHit;
    fs.mkdirSync(new URL("./state/", import.meta.url), { recursive: true });
    fs.writeFileSync(FX_TRIGGER_TREND.stateFile, JSON.stringify(watch, null, 2));
    return { ok: true, spot: cny, system: SYSTEM_FX, driftPct: Math.round(drift * 100) / 100, alert: Math.abs(drift) > 2,
      trigger: { hardHit, trendHit, streak: watch.belowTrendStreak, fired: watch.triggered } };
  } catch (e) {
    return { ok: false, error: String(e?.message || e), system: SYSTEM_FX };
  }
}

/* ── 2. 在途包裹（拟人抓官网） ──────────────────────────────────────── */

function detectCarrier(order) {
  const c = `${order.carrier ?? ""} ${order.shipping_carrier_name ?? ""}`.toLowerCase();
  if (c.includes("sf") || c.includes("顺丰") || c.includes("sf_express")) return "sf";
  if (c.includes("dhl")) return "dhl";
  if (c.includes("jd") || c.includes("京东")) return "jd";
  return "unknown";
}

async function trackSf(number) {
  // 顺丰官网查单是 JS SPA + 反爬指纹。Phase 1 用最轻的拟人 GET 打查单页，
  // 拿得到运单确认即算握手成功；拿不到结构化轨迹 → 如实报"待 Phase 2"。
  const r = await humanGet(
    `https://www.sf-express.com/chn/sc/waybill/waybill-detail/${encodeURIComponent(number)}`,
    { referer: "https://www.sf-express.com/chn/sc/" },
  );
  if (!r.ok) throw new Error(`SF 页面 HTTP ${r.status}`);
  if (r.text.includes("验证") || r.text.includes("captcha") || r.text.length < 4000)
    throw new Error("SF 反爬拦截（SPA 壳/验证页）——轨迹结构化抓取需 Phase 2 浏览器指纹");
  return { note: "SF 查单页握手成功，但轨迹为 JS 渲染，Phase 1 不解析 —— 待 Phase 2" };
}

async function trackDhl(number) {
  // DHL 官网查单页同样 SPA；尝试公开 JSON 端点（无需 Key 的站点内部接口形态可能变动）。
  const candidates = [
    `https://www.dhl.com/shipment-tracking?tracking-id=${encodeURIComponent(number)}`,
  ];
  for (const url of candidates) {
    const r = await humanGet(url, { referer: "https://www.dhl.com/" });
    if (r.ok && r.text.length > 4000 && !r.text.includes("captcha"))
      return { note: "DHL 查单页握手成功，但轨迹为 JS 渲染，Phase 1 不解析 —— 待 Phase 2" };
  }
  throw new Error("DHL 官网未响应结构化内容 —— 需 Phase 2");
}

async function collectParcels() {
  let orders = [];
  try {
    const res = await sql(
      `SELECT order_number, tracking_number, carrier, shipping_carrier_name, status, updated_at
         FROM public.orders
        WHERE tracking_number IS NOT NULL AND tracking_number <> ''
          AND status NOT IN ('completed', 'cancelled')
        ORDER BY updated_at DESC
        LIMIT 30`,
    );
    orders = res.rows ?? [];
  } catch (e) {
    return { ok: false, error: `DB 查询失败: ${e?.message || e}` };
  }
  if (orders.length === 0) return { ok: true, parcels: [], note: "当前无在途（无 tracking_number 的未完成订单）" };

  const cache = readJson(path.join(STATE, "tracking-cache.json"), {});
  const now = Date.now();
  const parcels = [];
  for (const o of orders) {
    const key = `${o.tracking_number}`;
    const hit = cache[key];
    if (hit && now - hit.fetchedAt < CACHE_TTL_MS) {
      parcels.push({ number: key, order: o.order_number, carrier: detectCarrier(o), fromCache: true, ...hit.result });
      continue;
    }
    let result;
    try {
      const carrier = detectCarrier(o);
      if (carrier === "sf") result = { ok: true, ...(await trackSf(key)) };
      else if (carrier === "dhl") result = { ok: true, ...(await trackDhl(key)) };
      else result = { ok: false, error: `未知承运商（carrier=${o.carrier ?? "?"}）——手动查` };
    } catch (e) {
      result = { ok: false, error: String(e?.message || e) };
    }
    cache[key] = { fetchedAt: now, result };
    parcels.push({ number: key, order: o.order_number, carrier: detectCarrier(o), fromCache: false, ...result });
    await sleep(1500 + Math.floor(Math.random() * 1500)); // 拟人节流
  }
  writeJson(path.join(STATE, "tracking-cache.json"), cache);
  return { ok: true, parcels };
}

/* ── 3. 承运商公告 ──────────────────────────────────────────────────── */

const ANNOUNCE_SOURCES = [
  // 顺丰公告专区在本机只此路径可达（SSR 372KB）；customer-service/notice 404、
  // 燃油页从本机 connect timeout —— 失败如实进简报，换网络环境后自动恢复。
  { name: "顺丰国际", url: "https://www.sf-express.com/we/ow/chn/sc/" },
  { name: "DHL Newsroom", url: "https://www.dhl.com/cn-zh/home/about-us/newsroom.html" },
];

async function collectAnnouncements() {
  const seen = readJson(path.join(STATE, "announcements-seen.json"), {});
  const out = [];
  for (const src of ANNOUNCE_SOURCES) {
    try {
      const r = await humanGet(src.url, {});
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      // 粗提标题级链接文本（SSR 才有；SPA 壳会自然为空 → 如实标注）
      const titles = [...r.text.matchAll(/<a[^>]*>([^<]{8,80})<\/a>/g)]
        .map((m) => m[1].trim())
        .filter((t) => /运价|公告|调价|附加费|高峰|suspend|rate|surcharge|peak|notice|update/i.test(t))
        .slice(0, 10);
      const prev = new Set(seen[src.name] ?? []);
      const fresh = titles.filter((t) => !prev.has(t));
      seen[src.name] = titles;
      out.push({ source: src.name, ok: true, fetched: titles.length, fresh });
    } catch (e) {
      out.push({ source: src.name, ok: false, error: String(e?.message || e) });
    }
    await sleep(1200 + Math.floor(Math.random() * 1000));
  }
  writeJson(path.join(STATE, "announcements-seen.json"), seen);
  return out;
}

/* ── 简报 + 运行日志 ───────────────────────────────────────────────── */

function renderBriefing(dateStr, fx, parcels, announcements) {
  const lines = [`# 幽灵员工日报 · ${dateStr}`, ""];

  lines.push("## 1. FX 哨兵");
  if (fx.ok) {
    lines.push(
      `- 美元/人民币现价 **${fx.spot}**，系统换汇 ${fx.system}（漂移 ${fx.driftPct > 0 ? "+" : ""}${fx.driftPct}%）`,
    );
    lines.push(
      fx.trigger?.fired
        ? `- 🚨 **站主裁决触发（2026-09-26 选项1 触发线）**：硬线 6.60 命中=${fx.trigger.hardHit} / 连续<6.80 天数=${fx.trigger.streak}/30 —— 价卡重校议题上浮站主`
        : fx.alert
        ? `- ℹ️ 漂移 ${fx.driftPct}%（超 2%）。站主 2026-09-26 裁决：价卡不动，仅记录，未触发重校线（硬线 6.60 / 连续 30 天 <6.80；当前连续 ${fx.trigger?.streak ?? 0} 天）`
        : `- 漂移在 ±2% 内，价卡换汇不用动`,
    );
  } else {
    lines.push(`- ⚠️ FX 抓取失败：${fx.error}（系统仍按 ${fx.system} 计价）`);
  }
  lines.push("");

  lines.push("## 2. 在途包裹");
  if (!parcels.ok) {
    lines.push(`- ⚠️ 查询失败：${parcels.error}`);
  } else if (parcels.parcels.length === 0) {
    lines.push(`- ${parcels.note}`);
  } else {
    for (const p of parcels.parcels) {
      lines.push(
        p.ok
          ? `- \`${p.number}\`（${p.order} · ${p.carrier}${p.fromCache ? " · 缓存" : ""}）：${p.note}`
          : `- \`${p.number}\`（${p.order} · ${p.carrier}）：❌ ${p.error}`,
      );
    }
  }
  lines.push("");

  lines.push("## 3. 承运商公告");
  for (const a of announcements) {
    if (!a.ok) lines.push(`- ${a.source}：❌ ${a.error}`);
    else if (a.fresh.length > 0) lines.push(`- ${a.source}：**${a.fresh.length} 条新公告**\n${a.fresh.map((t) => `  - ${t}`).join("\n")}`);
    else lines.push(`- ${a.source}：无新公告（抓到 ${a.fetched} 条候选）`);
  }
  lines.push("");

  lines.push("---");
  lines.push("*Phase 1 只读：本简报不含任何自动执行的商务/法律动作。轨迹结构化解析与比价建议在 Phase 2。*");
  return lines.join("\n");
}

async function main() {
  const started = new Date();
  const dateStr = started.toISOString().slice(0, 10);
  console.log(`[ghost] run ${dateStr}`);

  const fx = await collectFx();
  console.log(`[ghost] fx: ${fx.ok ? `${fx.spot} (${fx.driftPct}%)` : fx.error}`);

  const parcels = await collectParcels();
  console.log(`[ghost] parcels: ${parcels.ok ? parcels.parcels.length : parcels.error}`);

  const announcements = await collectAnnouncements();
  console.log(`[ghost] announcements: ${announcements.map((a) => `${a.source}:${a.ok ? a.fresh.length : "ERR"}`).join(", ")}`);

  const briefing = renderBriefing(dateStr, fx, parcels, announcements);
  fs.writeFileSync(path.join(BRIEFINGS, `${dateStr}.md`), briefing);

  const runs = path.join(HERE, "runs.jsonl");
  fs.appendFileSync(runs, JSON.stringify({ at: started.toISOString(), fx, parcels: parcels.ok ? parcels.parcels.length : parcels.error, announcements }) + "\n");
  console.log(`[ghost] briefing → briefings/${dateStr}.md`);
}

main().catch((e) => {
  console.error("[ghost] FATAL", e);
  process.exit(1);
});
