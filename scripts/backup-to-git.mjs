// backup-to-git.mjs — 单机灾难恢复：全量备份进 git（站主令 2026-09-27，单机风险#1 实物交付）
// state 明文进 git / 客户数据 gpg 对称加密进 git / 无第三方依赖（Node 内置 + 既有 SQL 网关 + 系统 gpg）
// 用法：node scripts/backup-to-git.mjs   （GIT_BACKUP_PASS 未设置时只备 state，不报错）
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "backup", "git");
const OUT_STATE = path.join(OUT, "state");
const OUT_DB = path.join(OUT, "db");
fs.mkdirSync(OUT_STATE, { recursive: true });
fs.mkdirSync(OUT_DB, { recursive: true });

// ── env ──
const env = {};
for (const line of fs.readFileSync(path.join(ROOT, ".env"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
  if (m) env[m[1]] = m[2];
}
const PASS = env.GIT_BACKUP_PASS || "";

async function sql(text, params = []) {
  const u = new URL(env.DATABASE_URL);
  const auth = "Basic " + Buffer.from(`${decodeURIComponent(u.username)}:${decodeURIComponent(u.password)}`).toString("base64");
  const res = await fetch(u.origin + u.pathname + u.search, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: auth },
    body: JSON.stringify({ sql: text, query: text, params }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`db ${res.status}: ${raw.slice(0, 150)}`);
  return JSON.parse(raw || "{}").rows || [];
}

function saveState(name, objOrSrc) {
  // objOrSrc=对象则序列化；=路径则原样拷贝（保真）
  let data, src = "";
  if (typeof objOrSrc === "string") {
    const abs = path.join(ROOT, objOrSrc);
    data = fs.readFileSync(abs, "utf8");
    src = ` (src: ${objOrSrc})`;
  } else {
    data = JSON.stringify(objOrSrc, null, 2);
  }
  const f = path.join(OUT_STATE, name);
  fs.writeFileSync(f, data);
  console.log(`state ✓ ${name} ${(fs.statSync(f).size / 1024).toFixed(1)}KB${src}`);
}

async function exportTableJson(table, outName) {
  const rows = await sql(`select * from ${table}`);
  const f = path.join(OUT_DB, outName);
  fs.writeFileSync(f, JSON.stringify({ table, exported_at: new Date().toISOString(), count: rows.length, rows }, null, 2));
  const kb = (fs.statSync(f).size / 1024).toFixed(1);
  console.log(`db ✓ ${outName} ${rows.length} 行 ${kb}KB（明文，待加密）`);
  return rows.length;
}

function gpgEncrypt(file) {
  const out = file + ".gpg";
  execSync(`gpg --batch --yes --passphrase "${PASS}" --symmetric --cipher-algo AES256 --output "${out}" "${file}"`, { stdio: "pipe", timeout: 60000 });
  fs.unlinkSync(file); // 明文即删（验收只留 .gpg）
  const kb = (fs.statSync(out).size / 1024).toFixed(1);
  console.log(`gpg ✓ ${path.basename(out)} ${kb}KB`);
}

(async () => {
  console.log(`[backup-to-git] ${new Date().toISOString()}`);
  let total = 0;

  // ── ① state 明文（6 个 json）──
  saveState("gsc-export.json", "docs/library/gsc-export.json");
  saveState("gsc-latest.json", "docs/library/gsc-latest.json");
  saveState("fx-watch.json", "scripts/ghost/state/fx-watch.json");
  saveState("intel-state.json", "docs/library/intel-state.json");
  saveState("scene-image-manifest.json", "docs/library/scene-image-manifest.json");
  saveState("social-calendar-seed.json", "docs/library/social-calendar.json");
  // social_calendar 表全量
  try {
    const rows = await sql("select * from social_calendar order by created_at desc");
    saveState("social_calendar-table.json", rows);
  } catch (e) {
    console.warn("social_calendar 表导出失败（表可能未建）:", e.message.slice(0, 80));
  }

  // ── ② db 客户数据（7 张表 → json → gpg 加密，明文即删）──
  if (!PASS) {
    console.log("[backup-to-git] GIT_BACKUP_PASS 未设置——只备 state，跳过 db 加密导出（不报错）");
  } else {
    const tables = [
      "orders", "consult_events", "contact_messages", "ai_chat_sessions",
      "ai_chat_messages", "shipments", "shipment_events",
    ];
    for (const tname of tables) {
      try {
        const rows = await sql(`select * from ${tname}`);
        const f = path.join(OUT_DB, `${tname}.json`);
        fs.writeFileSync(f, JSON.stringify({ table: tname, exported_at: new Date().toISOString(), count: rows.length, rows }, null, 2));
        gpgEncrypt(f);
        total += rows.length;
      } catch (e) {
        console.error(`db ✗ ${tname}: ${e.message.slice(0, 100)}`);
      }
    }
    console.log(`db 合计 ${total} 行（7 表）已加密`);
  }

  console.log("[backup-to-git] 完成。后续：git add backup/git/ && git commit && git push");
})().catch((e) => { console.error("[backup-to-git] FAIL:", e.message); process.exit(1); });
