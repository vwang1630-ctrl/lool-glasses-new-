// daily-health-audit-workers.mjs — loollook.com 每日健康巡检（Cloudflare Workers 版）
// 用法: node scripts/system-kit/daily-health-audit-workers.mjs [origin,默认 https://loollook.com]
// 需 CLOUDFLARE_API_TOKEN 环境变量以查询远程 D1；否则 DB 项 SKIP。

import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ORIGIN = (process.argv[2] || "https://loollook.com").replace(/\/$/, "");
const REPORT_PATH = resolve(
  process.cwd(),
  `docs/system-kit/archive/health-report-${new Date().toISOString().slice(0, 10)}.json`,
);

const checks = [];

async function fetchWithRetry(url, opts = {}, retries = 1) {
  try {
    return await fetch(url, opts);
  } catch (e) {
    if (retries <= 0) throw e;
    await new Promise((r) => setTimeout(r, 1000));
    return fetchWithRetry(url, opts, retries - 1);
  }
}

async function fetchStatus(url, opts = {}) {
  try {
    const res = await fetchWithRetry(url, { redirect: "manual", ...opts });
    return { status: res.status, ok: res.status === 200 };
  } catch (e) {
    return { status: `ERR: ${e.message}`, ok: false };
  }
}

async function fetchSchema(url, type) {
  try {
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const present =
      html.includes(`"@type":"${type}"`) || html.includes(`"@type": "${type}"`);
    return { status: res.status, present };
  } catch (e) {
    return { status: `ERR: ${e.message}`, present: false };
  }
}

function record(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log(`  ${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function d1Count(label, sql) {
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    record(label, true, "SKIP: no CLOUDFLARE_API_TOKEN");
    return null;
  }
  try {
    const out = await new Promise((resolve, reject) => {
      let stdout = "";
      let stderr = "";
      const cp = spawn(
        "./node_modules/.bin/wrangler",
        ["d1", "execute", "lool-work", "--remote", "--json", "--command", sql],
        { stdio: "pipe" },
      );
      cp.stdout.on("data", (d) => (stdout += d));
      cp.stderr.on("data", (d) => (stderr += d));
      cp.on("close", (code) => {
        if (code !== 0) reject(new Error(stderr || `exit ${code}`));
        else resolve(stdout);
      });
      cp.on("error", reject);
    });
    const data = JSON.parse(out);
    const results = Array.isArray(data) ? data[0]?.results : data?.results;
    const n = results?.[0]?.n ?? results?.[0]?.["COUNT(*)"] ?? "?";
    record(label, true, `count=${n}`);
    return n;
  } catch (e) {
    record(label, false, e.message);
    return null;
  }
}

async function main() {
  console.log(`=== daily-health-audit ${ORIGIN} ===\n`);

  // HTTP probes
  const pages = [
    ["首页", "/en"],
    ["PLP", "/en/products"],
    ["PDP", "/en/product/lool-tr90-square"],
    ["博客列表", "/en/blog"],
    ["博客首文", "/en/blog/best-reading-glasses-45-professionals-2026"],
    ["虚拟试戴", "/en/try-on"],
    ["量瞳距", "/en/measure-pd"],
    ["llms.txt", "/llms.txt"],
    ["sitemap.xml", "/sitemap.xml"],
    ["robots.txt", "/robots.txt"],
  ];
  for (const [name, path] of pages) {
    const { status, ok } = await fetchStatus(ORIGIN + path);
    record(name, ok, `status=${status}`);
  }

  // JSON-LD
  const schemas = [
    ["PDP Product JSON-LD", "/en/product/lool-tr90-square", "Product"],
    ["Blog Index ItemList JSON-LD", "/en/blog", "ItemList"],
    [
      "Blog Article JSON-LD",
      "/en/blog/best-reading-glasses-45-professionals-2026",
      "Article",
    ],
  ];
  for (const [name, path, type] of schemas) {
    const { status, present } = await fetchSchema(ORIGIN + path, type);
    record(name, present, `status=${status}`);
  }

  // API probe
  try {
    const res = await fetchWithRetry(ORIGIN + "/api/catalog");
    record("/api/catalog", res.status === 200, `status=${res.status}`);
  } catch (e) {
    record("/api/catalog", false, e.message);
  }

  // D1 probes
  console.log("\nD1 probes:");
  await d1Count(
    "products",
    "SELECT COUNT(*) AS n FROM products WHERE archived_at IS NULL",
  );
  await d1Count(
    "active blog posts",
    "SELECT COUNT(*) AS n FROM blog_posts WHERE active = 1",
  );
  await d1Count(
    "consult_events 24h",
    "SELECT COUNT(*) AS n FROM consult_events WHERE created_at > (unixepoch()*1000 - 86400000)",
  );
  await d1Count(
    "ai_bot_hits 24h",
    "SELECT COUNT(*) AS n FROM ai_bot_hits WHERE created_at > (unixepoch()*1000 - 86400000)",
  );
  await d1Count(
    "orders 24h",
    "SELECT COUNT(*) AS n FROM orders WHERE created_at > (unixepoch()*1000 - 86400000)",
  );

  // Report
  const pass = checks.filter((c) => c.ok).length;
  const fail = checks.filter((c) => !c.ok).length;
  const report = {
    origin: ORIGIN,
    generated_at: new Date().toISOString(),
    checks,
    summary: { pass, fail, total: checks.length },
    ok: fail === 0,
  };
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2) + "\n", "utf8");

  console.log(`\n=== Summary ===`);
  console.log(`PASS: ${pass}  FAIL: ${fail}`);
  console.log(`Report: ${REPORT_PATH}`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
