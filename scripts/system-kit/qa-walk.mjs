// qa-walk.mjs — 上线前走查（loollook.com 版）
// 用法: node scripts/system-kit/qa-walk.mjs [origin,默认 https://loollook.com]
// 退出码: 0 = 可上线；1 = 有阻断缺陷

import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ORIGIN = (process.argv[2] || "https://loollook.com").replace(/\/$/, "");
const REPORT_PATH = resolve(
  process.cwd(),
  `docs/system-kit/archive/qa-walk-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
);

const results = [];

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const cp = spawn(cmd, args, { stdio: "inherit", ...opts });
    cp.on("close", (code) => resolve(code ?? 1));
    cp.on("error", () => resolve(1));
  });
}

async function fetchOk(url, opts = {}) {
  const fetchOpts = {
    redirect: "manual",
    headers: { "User-Agent": "loollook-qa-walk/1.0" },
    ...opts,
  };
  let lastErr = "unknown";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, fetchOpts);
      return res.status;
    } catch (e) {
      lastErr = e.message;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  return `ERR: ${lastErr}`;
}

async function originReachable() {
  const status = await fetchOk(`${ORIGIN}/robots.txt`);
  return typeof status === "number";
}

async function step(name, fn) {
  console.log(`\n▶ ${name}`);
  try {
    const r = await fn();
    results.push({ name, status: r.status, note: r.note || "" });
    console.log(
      `  ${r.status === "PASS" ? "✓" : r.status === "SKIP" ? "⊘" : "✗"} ${name}${r.note ? ` — ${r.note}` : ""}`,
    );
  } catch (e) {
    results.push({ name, status: "FAIL", note: String(e.message || e) });
    console.log(`  ✗ ${name} — ${e.message || e}`);
  }
}

async function main() {
  console.log(`=== qa-walk ${ORIGIN} ===`);

  await step("make-system-kit", async () => {
    const code = await run("node", ["scripts/system-kit/make-system-kit.mjs"], {
      stdio: "pipe",
    });
    return { status: code === 0 ? "PASS" : "FAIL", note: `exit ${code}` };
  });

  await step("lint", async () => {
    const code = await run("bun", ["run", "lint"], { stdio: "pipe" });
    return { status: code === 0 ? "PASS" : "FAIL", note: `exit ${code}` };
  });

  await step("build", async () => {
    const code = await run("bun", ["run", "build"], { stdio: "pipe" });
    return { status: code === 0 ? "PASS" : "FAIL", note: `exit ${code}` };
  });

  await step("D1 migrations list", async () => {
    if (!process.env.CLOUDFLARE_API_TOKEN) {
      return { status: "SKIP", note: "CLOUDFLARE_API_TOKEN not set" };
    }
    // `wrangler d1 migrations apply --dry-run` does not exist; `list` tells us
    // whether there are pending migrations without modifying the database.
    const code = await run(
      "./node_modules/.bin/wrangler",
      ["d1", "migrations", "list", "lool-work", "--remote"],
      { stdio: "pipe" },
    );
    return { status: code === 0 ? "PASS" : "FAIL", note: `exit ${code}` };
  });

  const reachable = await originReachable();

  await step("deploy-smoke", async () => {
    if (!reachable)
      return {
        status: "SKIP",
        note: "origin unreachable from this environment",
      };
    const code = await run(
      "node",
      ["scripts/system-kit/deploy-smoke.mjs", ORIGIN],
      { stdio: "inherit" },
    );
    return { status: code === 0 ? "PASS" : "FAIL", note: `exit ${code}` };
  });

  await step("system files", async () => {
    if (!reachable) return { status: "SKIP", note: "origin unreachable" };
    const robots = await fetchOk(`${ORIGIN}/robots.txt`);
    const sitemap = await fetchOk(`${ORIGIN}/sitemap.xml`);
    const llms = await fetchOk(`${ORIGIN}/llms.txt`);
    const note = `robots=${robots} sitemap=${sitemap} llms=${llms}`;
    const ok = robots === 200 && sitemap === 200 && llms === 200;
    return { status: ok ? "PASS" : "FAIL", note };
  });

  await step("blog article in sitemap", async () => {
    if (!reachable) return { status: "SKIP", note: "origin unreachable" };
    const res = await fetch(`${ORIGIN}/sitemap.xml`);
    if (res.status !== 200)
      return { status: "FAIL", note: `sitemap ${res.status}` };
    const xml = await res.text();
    const has = xml.includes(
      "/blog/best-reading-glasses-45-professionals-2026",
    );
    return { status: has ? "PASS" : "FAIL", note: has ? "found" : "missing" };
  });

  const pass = results.filter((r) => r.status === "PASS").length;
  const fail = results.filter((r) => r.status === "FAIL").length;
  const skip = results.filter((r) => r.status === "SKIP").length;

  const report = {
    origin: ORIGIN,
    generated_at: new Date().toISOString(),
    results,
    summary: { pass, fail, skip, total: results.length },
    ok: fail === 0,
  };
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2) + "\n", "utf8");

  console.log(`\n=== Summary ===`);
  console.log(`PASS: ${pass}  SKIP: ${skip}  FAIL: ${fail}`);
  console.log(`Report: ${REPORT_PATH}`);
  if (fail > 0) {
    console.log("\nQA-WALK: FAIL — do not release");
    process.exit(1);
  }
  console.log("\nQA-WALK: OK — release candidate");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
