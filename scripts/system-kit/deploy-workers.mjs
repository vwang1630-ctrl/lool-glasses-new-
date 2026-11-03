// deploy-workers.mjs — Cloudflare Workers 安全部署（loollook.com 版）
// 用法: node scripts/system-kit/deploy-workers.mjs [--dry-run]
// 流程: build → wrangler deploy → deploy-smoke → 失败自动 rollback

import { spawn } from "node:child_process";

const DRY_RUN = process.argv.includes("--dry-run");
const ORIGIN = "https://loollook.com";

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const cp = spawn(cmd, args, { stdio: "pipe", ...opts });
    let out = "";
    let err = "";
    cp.stdout?.on("data", (d) => {
      out += d.toString();
      process.stdout.write(d);
    });
    cp.stderr?.on("data", (d) => {
      err += d.toString();
      process.stderr.write(d);
    });
    cp.on("close", (code) => {
      if (code !== 0)
        reject(new Error(`${cmd} ${args.join(" ")} exit ${code}\n${err}`));
      else resolve(out);
    });
    cp.on("error", reject);
  });
}

async function main() {
  console.log(`=== deploy-workers ${DRY_RUN ? "(dry-run)" : ""} ===\n`);

  console.log("[1/3] build");
  await run("bun", ["run", "build"]);

  console.log("\n[2/3] wrangler deploy");
  const deployArgs = DRY_RUN ? ["deploy", "--dry-run"] : ["deploy"];
  const deployOut = await run("./node_modules/.bin/wrangler", deployArgs);

  const versionMatch =
    deployOut.match(/Version ID:\s*([a-f0-9-]+)/i) ||
    deployOut.match(/id\s+([a-f0-9-]{8,})/i);
  const versionId = versionMatch?.[1];
  if (versionId) console.log(`Deployed version: ${versionId}`);

  console.log("\n[3/3] deploy-smoke");
  let smokeCode;
  try {
    smokeCode = await new Promise((resolve) => {
      const cp = spawn(
        "node",
        ["scripts/system-kit/deploy-smoke.mjs", ORIGIN],
        { stdio: "inherit" },
      );
      cp.on("close", (code) => resolve(code ?? 1));
      cp.on("error", () => resolve(1));
    });
  } catch (e) {
    smokeCode = 1;
  }

  if (smokeCode !== 0) {
    console.log("\n[FAIL] smoke test failed — rolling back");
    if (!DRY_RUN) {
      try {
        await run("./node_modules/.bin/wrangler", [
          "rollback",
          "-y",
          "-m",
          "auto-rollback after failed smoke",
        ]);
        console.log("[OK] rollback complete");
      } catch (e) {
        console.error("[ERR] rollback failed:", e.message);
      }
    }
    process.exit(1);
  }

  console.log("\n[OK] deploy + smoke passed");
  process.exit(0);
}

main().catch((e) => {
  console.error("\n[FAIL]", e.message);
  process.exit(1);
});
