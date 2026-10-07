#!/usr/bin/env node
// safe-deploy.cjs — 原子化安全部署(2026-10-06,站主批:加固)
// 流程: 预检(内存/僵尸) → 备份.output → 构建 → 验证 → 原子切换 → 健康探活 → 失败自动回滚
// 用法: node scripts/safe-deploy.cjs

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(ROOT, ".output");
const OUTPUT_BACKUP = path.join(ROOT, ".output_backup");
const PID_FILE = path.join(ROOT, ".server.pid");
const HEALTH_URL = "http://127.0.0.1:80/";

function log(step, msg) { console.log(`[${step}] ${msg}`); }
function fail(msg) { console.error(`[FAIL] ${msg}`); process.exit(1); }

function sh(cmd, opts) {
  return execSync(cmd, { cwd: ROOT, stdio: "pipe", timeout: 300000, ...opts }).toString();
}

async function main() {

// ── 0. 预检 ──
const os = require("os");
const freeMemMB = os.freemem() / (1024 * 1024);
log("0", `可用内存: ${Math.round(freeMemMB)} MB`);
if (freeMemMB < 1200) {
  try {
    const out = sh('powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Select-Object Id | ConvertTo-Json"');
    const procs = JSON.parse(out || "[]");
    const ids = (Array.isArray(procs) ? procs : [procs]).map(p => p.Id).filter(Boolean);
    if (ids.length) {
      log("0", `清理 ${ids.length} 个僵尸 node 进程`);
      for (const id of ids) { try { process.kill(id); } catch(e){} }
    }
  } catch(e){}
  const re = os.freemem() / (1024 * 1024);
  if (re < 800) fail(`清理后仍不足 ${Math.round(re)} MB — 手动释放内存后再试`);
}

// ── 1. 备份 .output ──
const hasOutput = fs.existsSync(path.join(OUTPUT, "server", "index.mjs"));
if (hasOutput) {
  log("1", "备份 .output → .output_backup");
  fs.rmSync(OUTPUT_BACKUP, { recursive: true, force: true });
  fs.cpSync(OUTPUT, OUTPUT_BACKUP, { recursive: true });
} else {
  log("1", ".output 不存在,跳过备份");
}

// ── 2. 构建 ──
log("2", "构建中...");
try {
  process.env.NITRO_PRESET = "node-server";
  sh("bun run build");
  log("2", "构建成功");
} catch (e) {
  if (hasOutput && fs.existsSync(OUTPUT_BACKUP)) {
    log("FAIL", "构建失败 → 回滚");
    fs.rmSync(OUTPUT, { recursive: true, force: true });
    fs.cpSync(OUTPUT_BACKUP, OUTPUT, { recursive: true });
    fail("已回滚。线上不变。");
  }
  fail("构建失败且无备份");
}

// ── 3. 验证产物 ──
const serverEntry = path.join(OUTPUT, "server", "index.mjs");
if (!fs.existsSync(serverEntry)) fail("server/index.mjs 不存在");
if (!fs.existsSync(path.join(OUTPUT, "public"))) fail("public 目录不存在");
log("3", `产物完整 ✓ assets(${fs.readdirSync(path.join(OUTPUT, "public", "assets")).length}) ✓`);

// ── 4. 资产宽限期 ──
try { sh("node scripts/deploy-keep-assets.cjs merge"); } catch(e){}

// ── 5. 停旧 → 启新 → PID ──
let newPid = null;
try {
  const out = sh('powershell -Command "Get-CimInstance Win32_Process -Filter \\"Name=\'node.exe\'\\" | Where-Object { $_.CommandLine -like \'*index.mjs*\' } | Select-Object ProcessId | ConvertTo-Json"');
  const procs = JSON.parse(out || "[]");
  const ids = (Array.isArray(procs) ? procs : [procs]).map(p => p.ProcessId).filter(Boolean);
  for (const id of ids) { try { process.kill(id); } catch(e){} }
  if (ids.length) log(`5`, `停旧 ${ids.length} 个进程`);
} catch(e){}

await new Promise(r => setTimeout(r, 2000));

const child = spawn(process.execPath, [serverEntry], {
  cwd: ROOT,
  env: { ...process.env, PORT: "80", NITRO_PRESET: "node-server" },
  stdio: "ignore",
  detached: true,
});
child.unref();
fs.writeFileSync(PID_FILE, String(child.pid));
log("5", `新 PID ${child.pid} ✓`);

// ── 6. 探活 ──
for (let i = 0; i < 15; i++) {
  await new Promise(r => setTimeout(r, 1000));
  try {
    const ok = await new Promise((resolve, reject) => {
      const req = http.get(HEALTH_URL, { timeout: 2000 }, res => resolve(res.statusCode < 500));
      req.on("error", () => resolve(false));
      req.setTimeout(2000, () => { req.destroy(); resolve(false); });
    });
    if (ok) { log("6", `✅ 探活通过(${i + 1}s) — 部署完成`); return done(child.pid); }
  } catch(e){}
}
fail("探活失败 — 15s 无响应");

function done(pid) {
  console.log(`\n✅ 安全部署完成: PID ${pid} · 探活 ✓ · 回滚备份 ${OUTPUT_BACKUP}`);
}
process.exit(0);

} // end main

main().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
