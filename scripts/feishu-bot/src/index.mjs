import * as lark from "@larksuiteoapi/node-sdk";
import { spawn } from "node:child_process";
import { readFile, writeFile, mkdir, readdir, rename } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOT_ROOT = path.resolve(__dirname, ".."); // scripts/feishu-bot/
const REPO_ROOT = path.resolve(__dirname, "../../.."); // lool.work/
const ENV_FILE = path.resolve(REPO_ROOT, ".env"); // lool.work/.env

try {
  process.loadEnvFile(ENV_FILE);
} catch (e) {
  console.warn(`[feishu-bot] could not load ${ENV_FILE}: ${e.message}`);
}

const {
  FEISHU_APP_ID,
  FEISHU_APP_SECRET,
  FEISHU_AGENT = "codex",
  FEISHU_CHAT_ID,
  FEISHU_CODEX_CHAT_ID,
  FEISHU_CLAUDE_CHAT_ID,
  FEISHU_DISCOVER,
  CODEX_BIN = "codex",
  CLAUDE_BIN = "claude",
} = process.env;

const discover = FEISHU_DISCOVER === "1";
const FEISHU_TARGET_CHAT_ID =
  FEISHU_CHAT_ID || FEISHU_CODEX_CHAT_ID || FEISHU_CLAUDE_CHAT_ID;
const ACTIVE_AGENT = FEISHU_AGENT.toLowerCase();

if (!["codex", "claude"].includes(ACTIVE_AGENT)) {
  console.error('[feishu-bot] FEISHU_AGENT must be "codex" or "claude".');
  process.exit(1);
}

process.on("beforeExit", (code) => {
  console.error(`[feishu-bot] beforeExit code=${code}`);
});
process.on("exit", (code) => {
  console.error(`[feishu-bot] exit code=${code}`);
});
process.on("uncaughtException", (e) => {
  console.error("[feishu-bot] uncaughtException:", e);
});
process.on("unhandledRejection", (e) => {
  console.error("[feishu-bot] unhandledRejection:", e);
});

if (!FEISHU_APP_ID || !FEISHU_APP_SECRET) {
  console.error(
    `[feishu-bot] missing FEISHU_APP_ID / FEISHU_APP_SECRET in ${ENV_FILE}`,
  );
  process.exit(1);
}
if (!discover && !FEISHU_TARGET_CHAT_ID) {
  console.error(
    "[feishu-bot] missing FEISHU_CHAT_ID / FEISHU_CODEX_CHAT_ID / FEISHU_CLAUDE_CHAT_ID.",
  );
  console.error(
    "  Run with FEISHU_DISCOVER=1 to log incoming events and find it.",
  );
  process.exit(1);
}

console.log(`[feishu-bot] cwd             = ${REPO_ROOT}`);
console.log(`[feishu-bot] discover mode   = ${discover}`);
if (!discover) {
  console.log(`[feishu-bot] agent          = ${ACTIVE_AGENT}`);
  console.log(`[feishu-bot] target chat    = ${FEISHU_TARGET_CHAT_ID}`);
  if (!FEISHU_CHAT_ID && !FEISHU_CODEX_CHAT_ID && FEISHU_CLAUDE_CHAT_ID) {
    console.log("[feishu-bot] chat env       = FEISHU_CLAUDE_CHAT_ID (legacy)");
  }
  console.log(
    "[feishu-bot] allowlist      = OFF (any group member can trigger)",
  );
}

// ---------- session persistence ----------
//
// Shape:
//   { [threadId]: { sessionIds: { codex?: string|null, claude?: string|null }, totals: ThreadTotals } }
//
// Legacy entries (just a sessionId string, or { sessionId }) are auto-migrated.
// We copy ambiguous legacy ids into both slots so switching agents never erases
// the previous agent's context; a bad resume only clears the active slot.
const SESSIONS_PATH = path.join(BOT_ROOT, "sessions.json");
const sessions = new Map();

function emptyTotals() {
  return {
    input_tokens: 0,
    output_tokens: 0,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
    reasoning_output_tokens: 0,
    cost_usd: 0,
    duration_ms: 0,
    turns: 0,
  };
}

function getSession(threadId) {
  return sessions.get(threadId) || { sessionIds: {}, totals: emptyTotals() };
}

function getAgentSessionId(session) {
  return session.sessionIds?.[ACTIVE_AGENT] || null;
}

function setAgentSessionId(session, sessionId) {
  session.sessionIds = session.sessionIds || {};
  session.sessionIds[ACTIVE_AGENT] = sessionId || null;
}

function accumulateTotals(totals, agentResult) {
  const u = agentResult.usage || {};
  totals.input_tokens += u.input_tokens || 0;
  totals.output_tokens += u.output_tokens || 0;
  totals.cache_read_input_tokens +=
    u.cache_read_input_tokens || u.cached_input_tokens || 0;
  totals.cache_creation_input_tokens += u.cache_creation_input_tokens || 0;
  totals.reasoning_output_tokens += u.reasoning_output_tokens || 0;
  totals.cost_usd += agentResult.costUsd || 0;
  totals.duration_ms += agentResult.durationMs || 0;
  totals.turns += agentResult.numTurns || 1;
}

async function loadSessions() {
  try {
    const data = await readFile(SESSIONS_PATH, "utf-8");
    for (const [k, v] of Object.entries(JSON.parse(data))) {
      let normalized;
      if (typeof v === "string") {
        normalized = {
          sessionIds: { codex: v, claude: v },
          totals: emptyTotals(),
        };
      } else {
        const sessionIds = { ...(v.sessionIds || {}) };
        if (v.sessionId && !sessionIds.codex && !sessionIds.claude) {
          if (v.agent === "codex" || v.agent === "claude") {
            sessionIds[v.agent] = v.sessionId;
          } else {
            sessionIds.codex = v.sessionId;
            sessionIds.claude = v.sessionId;
          }
        }
        normalized = {
          sessionIds,
          totals: { ...emptyTotals(), ...(v.totals || {}) },
        };
      }
      sessions.set(k, normalized);
    }
    console.log(`[feishu-bot] loaded ${sessions.size} thread session(s)`);
  } catch (e) {
    if (e.code !== "ENOENT")
      console.error("[feishu-bot] loadSessions:", e.message);
  }
}

async function saveSessions() {
  await writeFile(
    SESSIONS_PATH,
    JSON.stringify(Object.fromEntries(sessions), null, 2),
  );
}

// ---------- topic records ----------
//
// One JSON file per Feishu topic (thread) under topics/, plus a regenerated
// INDEX.md for at-a-glance status query. A topic = one problem; each message
// in the thread is a "round". Shape of <threadId>.json:
//   { threadId, status, problem, createdAt, updatedAt,
//     rounds: [ { at, in, out, status } ] }
// status ∈ { 处理中, 待处理, 已完成, 出错 }.
const TOPICS_DIR = path.join(BOT_ROOT, "topics");
const topics = new Map();

// Downloaded message attachments (images) land here so the spawned agent
// can inspect them. gitignored along with the rest of feishu-bot/. Files are not
// auto-pruned — low-volume group, and they're handy for debugging.
const TMP_DIR = path.join(BOT_ROOT, "tmp");

/** Truncate keeping content (newlines preserved). */
function clip(s, n) {
  s = s || "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

/** Truncate to a single line for table cells. */
function snippet(s, n) {
  return clip((s || "").replace(/\s+/g, " ").trim(), n);
}

async function loadTopics() {
  try {
    for (const f of await readdir(TOPICS_DIR)) {
      if (!f.endsWith(".json")) continue;
      try {
        const t = JSON.parse(await readFile(path.join(TOPICS_DIR, f), "utf-8"));
        if (t?.threadId) topics.set(t.threadId, t);
      } catch (e) {
        console.error(`[feishu-bot] bad topic file ${f}:`, e.message);
      }
    }
    console.log(`[feishu-bot] loaded ${topics.size} topic record(s)`);
  } catch (e) {
    if (e.code !== "ENOENT")
      console.error("[feishu-bot] loadTopics:", e.message);
  }
}

async function writeTopicIndex() {
  const all = [...topics.values()].sort((a, b) =>
    (b.updatedAt || "").localeCompare(a.updatedAt || ""),
  );
  const rows = all.map((t) => {
    const id = t.threadId;
    const upd = (t.updatedAt || "").replace("T", " ").slice(0, 16);
    return `| ${t.status || "?"} | [\`${id.slice(-8)}\`](${id}.json) | ${snippet(t.problem, 60)} | ${t.rounds?.length || 0} | ${upd} |`;
  });
  const md = [
    "# feishu-bot 话题记录",
    "",
    "> 每个飞书话题 = 一个问题。本文件与 `<threadId>.json` 由 bot 自动生成，勿手改。",
    `> 共 ${all.length} 个话题 · 更新于 ${new Date().toISOString().replace("T", " ").slice(0, 19)}`,
    "",
    "| 状态 | 话题 | 问题 | 轮次 | 最后更新 |",
    "| --- | --- | --- | --- | --- |",
    ...rows,
    "",
  ].join("\n");
  await writeFile(path.join(TOPICS_DIR, "INDEX.md"), md);
}

async function saveTopic(threadId) {
  const t = topics.get(threadId);
  if (!t) return;
  await writeFile(
    path.join(TOPICS_DIR, `${threadId}.json`),
    JSON.stringify(t, null, 2),
  );
  await writeTopicIndex();
}

/** A new message arrived — open the topic if new, push a round. Returns the round. */
function recordIncoming(threadId, text) {
  const now = new Date().toISOString();
  let t = topics.get(threadId);
  if (!t) {
    t = {
      threadId,
      status: "处理中",
      problem: clip(text, 500),
      createdAt: now,
      updatedAt: now,
      rounds: [],
    };
    topics.set(threadId, t);
  }
  const round = { at: now, in: clip(text, 2000), out: null, status: "处理中" };
  t.rounds.push(round);
  t.status = "处理中";
  t.updatedAt = now;
  return round;
}

/** A round finished — fill its outcome and recompute topic status. */
function recordOutcome(threadId, round, ok, outText) {
  const t = topics.get(threadId);
  if (!t) return;
  round.out = clip(outText, 4000);
  round.status = ok ? "已完成" : "出错";
  t.status = t.rounds.some((r) => r.status === "处理中")
    ? "处理中"
    : (t.rounds[t.rounds.length - 1]?.status ?? "已完成");
  t.updatedAt = new Date().toISOString();
}

const BUSY_ACK = "我正在处理，下回合会将这句话加入上下文";

/**
 * One-time backfill: rebuild topic records from the Feishu group's message
 * history. Pages through all messages, groups by thread, pairs each user
 * message with the bot reply that follows it. Runs only when topics/ is empty.
 */
async function backfillTopics() {
  console.log("[feishu-bot] topics/ empty — backfilling from Feishu history…");
  const byThread = new Map();
  let pageToken;
  let scanned = 0;
  do {
    let resp;
    try {
      resp = await client.im.message.list({
        params: {
          container_id_type: "chat",
          container_id: FEISHU_TARGET_CHAT_ID,
          sort_type: "ByCreateTimeAsc",
          page_size: 50,
          page_token: pageToken,
        },
      });
    } catch (e) {
      console.error("[feishu-bot] backfill: message.list failed:", e.message);
      return;
    }
    const data = resp?.data ?? resp ?? {};
    for (const m of data.items ?? []) {
      const tid = m.thread_id;
      if (!tid || m.deleted) continue;
      if (!byThread.has(tid)) byThread.set(tid, []);
      byThread.get(tid).push(m);
      scanned++;
    }
    pageToken = data.has_more ? data.page_token : undefined;
  } while (pageToken);

  let created = 0;
  for (const [threadId, msgs] of byThread) {
    if (topics.has(threadId)) continue; // never clobber a live record
    msgs.sort((a, b) => Number(a.create_time) - Number(b.create_time));
    const iso = (ms) => new Date(Number(ms)).toISOString();
    const rounds = [];
    let problem = "";
    for (const m of msgs) {
      const text = extractMessageText(m.body?.content, m.msg_type);
      if (!text || text === BUSY_ACK || text === "This message was recalled")
        continue;
      if (m.sender?.sender_type === "app") {
        const last = rounds[rounds.length - 1];
        if (last && last.out === null) {
          last.out = clip(text, 4000);
          last.status = "已完成";
        }
      } else {
        if (!problem) problem = clip(text, 500);
        // 待处理 = a user message that never got a bot reply (bot was offline,
        // or it's genuinely unhandled). Not 处理中 — nothing is running it.
        rounds.push({
          at: iso(m.create_time),
          in: clip(text, 2000),
          out: null,
          status: "待处理",
        });
      }
    }
    if (!rounds.length) continue;
    topics.set(threadId, {
      threadId,
      status: rounds.some((r) => r.status === "待处理") ? "待处理" : "已完成",
      problem: problem || "(无文本)",
      createdAt: iso(msgs[0].create_time),
      updatedAt: iso(msgs[msgs.length - 1].create_time),
      rounds,
      backfilled: true,
    });
    created++;
  }

  for (const [threadId, t] of topics) {
    await writeFile(
      path.join(TOPICS_DIR, `${threadId}.json`),
      JSON.stringify(t, null, 2),
    );
  }
  console.log(
    `[feishu-bot] backfill: scanned ${scanned} msgs → ${created} topic record(s)`,
  );
}

// ---------- per-thread serial queue ----------
const queues = new Map();
function enqueue(threadId, fn) {
  const prev = queues.get(threadId) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(fn);
  queues.set(threadId, next);
  next.finally(() => {
    if (queues.get(threadId) === next) queues.delete(threadId);
  });
  return next;
}

// ---------- codex runner ----------
function runCodex(text, opts = {}) {
  const { sessionId } = opts;
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const args = sessionId
      ? [
          "exec",
          "resume",
          "--json",
          "--dangerously-bypass-approvals-and-sandbox",
          sessionId,
          "-",
        ]
      : [
          "exec",
          "--json",
          "--dangerously-bypass-approvals-and-sandbox",
          "-C",
          REPO_ROOT,
          "-",
        ];
    const proc = spawn(CODEX_BIN, args, {
      cwd: REPO_ROOT,
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let out = "";
    let err = "";
    proc.stdout.on("data", (d) => (out += d));
    proc.stderr.on("data", (d) => (err += d));
    proc.on("error", reject);
    proc.on("exit", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`codex exit ${code}: ${(err || out).slice(0, 800)}`),
        );
      }
      try {
        let threadId = sessionId || null;
        let result = "";
        let usage = {};
        for (const line of out.split(/\r?\n/)) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);
          if (event.type === "thread.started" && event.thread_id) {
            threadId = event.thread_id;
          } else if (
            event.type === "item.completed" &&
            event.item?.type === "agent_message"
          ) {
            result = event.item.text || result;
          } else if (event.type === "turn.completed" && event.usage) {
            usage = event.usage;
          }
        }
        resolve({
          result,
          sessionId: threadId,
          usage,
          costUsd: 0,
          durationMs: Date.now() - startedAt,
          numTurns: 1,
        });
      } catch (e) {
        reject(
          new Error(
            `parse codex output failed: ${e.message} / head: ${out.slice(0, 400)}`,
          ),
        );
      }
    });
    proc.stdin.end(text);
  });
}

// ---------- claude runner ----------
function runClaude(text, opts = {}) {
  const { sessionId } = opts;
  return new Promise((resolve, reject) => {
    const args = [
      "-p",
      "--output-format",
      "json",
      "--dangerously-skip-permissions",
    ];
    if (sessionId) args.push("--resume", sessionId);
    const proc = spawn(CLAUDE_BIN, args, {
      cwd: REPO_ROOT,
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let out = "";
    let err = "";
    proc.stdout.on("data", (d) => (out += d));
    proc.stderr.on("data", (d) => (err += d));
    proc.on("error", reject);
    proc.on("exit", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`claude exit ${code}: ${(err || out).slice(0, 800)}`),
        );
      }
      try {
        const parsed = JSON.parse(out);
        resolve({
          result: parsed.result,
          sessionId: parsed.session_id,
          usage: parsed.usage,
          costUsd: parsed.total_cost_usd,
          durationMs: parsed.duration_ms,
          numTurns: parsed.num_turns,
        });
      } catch (e) {
        reject(
          new Error(
            `parse claude output failed: ${e.message} / head: ${out.slice(0, 400)}`,
          ),
        );
      }
    });
    proc.stdin.end(text);
  });
}

function getAgentRunner() {
  return ACTIVE_AGENT === "claude"
    ? {
        name: "claude",
        skillPrefix: "/feishu-claude-skill ",
        run: runClaude,
      }
    : {
        name: "codex",
        skillPrefix: "/feishu-codex-skill ",
        run: runCodex,
      };
}

// ---------- lark ----------
const client = new lark.Client({
  appId: FEISHU_APP_ID,
  appSecret: FEISHU_APP_SECRET,
});

const wsClient = new lark.WSClient({
  appId: FEISHU_APP_ID,
  appSecret: FEISHU_APP_SECRET,
  loggerLevel: lark.LoggerLevel.info,
});

function formatFooter(totals) {
  const fmt = (n) => (n || 0).toLocaleString("en-US");
  const inTok = totals.input_tokens || 0;
  const outTok = totals.output_tokens || 0;
  const cacheHit = totals.cache_read_input_tokens || 0;
  const cacheWrite = totals.cache_creation_input_tokens || 0;
  const reasoning = totals.reasoning_output_tokens || 0;
  const turns = totals.turns || 1;
  const seconds = ((totals.duration_ms ?? 0) / 1000).toFixed(1);
  const cost = totals.cost_usd || 0;
  const parts = [`in ${fmt(inTok)}`, `out ${fmt(outTok)}`];
  if (cacheHit) parts.push(`cache hit ${fmt(cacheHit)}`);
  if (cacheWrite) parts.push(`cache write ${fmt(cacheWrite)}`);
  if (reasoning) parts.push(`reasoning ${fmt(reasoning)}`);
  const meta = cost > 0 ? `$${cost.toFixed(4)} · ${seconds}s` : `${seconds}s`;
  return `\n\n———\n${parts.join(" · ")} · cumulative\n${meta} · ${turns} turn${turns === 1 ? "" : "s"}`;
}

const MAX_TEXT = 29000; // Lark text-message hard limit
const CHUNK_LIMIT = MAX_TEXT - 32; // leave room for the "(i/n)\n" prefix

/** Split text into <=CHUNK_LIMIT pieces, preferring newline boundaries. */
function splitText(text) {
  if (text.length <= CHUNK_LIMIT) return [text];
  const chunks = [];
  let rest = text;
  while (rest.length > CHUNK_LIMIT) {
    let cut = rest.lastIndexOf("\n", CHUNK_LIMIT);
    if (cut < CHUNK_LIMIT * 0.5) cut = CHUNK_LIMIT; // no good newline — hard cut
    chunks.push(rest.slice(0, cut));
    rest = rest.slice(cut).replace(/^\n/, "");
  }
  if (rest) chunks.push(rest);
  return chunks;
}

async function replyToMessage(messageId, text) {
  const chunks = splitText(text);
  for (let i = 0; i < chunks.length; i++) {
    const prefix = chunks.length > 1 ? `(${i + 1}/${chunks.length})\n` : "";
    await client.im.message.reply({
      path: { message_id: messageId },
      data: {
        msg_type: "text",
        content: JSON.stringify({ text: prefix + chunks[i] }),
        reply_in_thread: true,
      },
    });
  }
}

/** Extract plain text from a text or rich-text (post) message. */
function extractMessageText(content, messageType) {
  try {
    const parsed = JSON.parse(content || "{}");
    if (messageType === "text") {
      return (parsed.text || "").trim();
    }
    if (messageType === "file") {
      // No real "text" on a file message — surface the original filename so the
      // topic record and displayText show something meaningful.
      return (parsed.file_name || "").trim();
    }
    if (messageType === "post") {
      const lines = Array.isArray(parsed.content) ? parsed.content : [];
      const parts = [];
      for (const line of lines) {
        for (const node of line || []) {
          if (node?.tag === "text") parts.push(node.text || "");
          // Feishu uses `a` (or sometimes `link`) for inline hyperlinks — the
          // user's visible anchor text lives there. We still extract URLs
          // separately via extractPostUrls(), so href stays out of the text.
          else if ((node?.tag === "a" || node?.tag === "link") && node.text) {
            parts.push(node.text);
          }
        }
        parts.push("\n");
      }
      const title = parsed.title ? parsed.title + "\n" : "";
      return (title + parts.join("")).trim();
    }
  } catch {}
  return "";
}

// ---------- attachments: images + Feishu docs ----------

/** Guess an image extension from magic bytes; default png. */
function sniffImageExt(buf) {
  if (buf.length >= 12) {
    if (buf[0] === 0x89 && buf[1] === 0x50) return "png";
    if (buf[0] === 0xff && buf[1] === 0xd8) return "jpg";
    if (buf[0] === 0x47 && buf[1] === 0x49) return "gif";
    if (buf[0] === 0x52 && buf[1] === 0x49 && buf[8] === 0x57) return "webp";
  }
  return "png";
}

/** Download one image attachment to TMP_DIR; returns its absolute path. */
async function downloadImage(messageId, fileKey) {
  const resp = await client.im.messageResource.get({
    path: { message_id: messageId, file_key: fileKey },
    params: { type: "image" },
  });
  const base = path.join(
    TMP_DIR,
    `${messageId}_${fileKey.replace(/[^A-Za-z0-9]/g, "").slice(0, 20)}`,
  );
  const tmp = base + ".bin";
  await resp.writeFile(tmp);
  const ext = sniffImageExt(await readFile(tmp));
  const finalPath = base + "." + ext;
  await rename(tmp, finalPath);
  return finalPath;
}

/** Download one file attachment (non-image) to TMP_DIR; returns absolute path. */
async function downloadFile(messageId, fileKey, fileName) {
  const resp = await client.im.messageResource.get({
    path: { message_id: messageId, file_key: fileKey },
    params: { type: "file" },
  });
  const safe =
    (fileName || fileKey).replace(/[^\w.-]/g, "_").slice(0, 80) ||
    "attachment.bin";
  const finalPath = path.join(TMP_DIR, `${messageId}_${safe}`);
  await resp.writeFile(finalPath);
  return finalPath;
}

/**
 * Derive a frames/<slug>/ directory name from a zip filename.
 * Strips .zip, keeps [A-Za-z0-9_-], collapses runs of separators, caps at 60.
 */
function slugFromZipName(fileName) {
  const base = (fileName || "").replace(/\.zip$/i, "").trim();
  const slug = base
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || null;
}

/**
 * Extract a zip into REPO_ROOT/frames/<slug>/. If the zip contains a single
 * top-level directory (typical for supplier deliveries), flatten one level so
 * frames/<slug>/sku/... ends up at frames/<slug>/sku/... not nested twice.
 * Returns the absolute target directory.
 */
async function unzipToFrames(zipPath, fileName, tag) {
  const slug =
    slugFromZipName(fileName) || slugFromZipName(path.basename(zipPath));
  if (!slug) throw new Error("zip 文件名无法派生合法目录名");
  const targetDir = path.join(REPO_ROOT, "frames", slug);
  await mkdir(targetDir, { recursive: true });
  await new Promise((resolve, reject) => {
    const child = spawn("unzip", ["-o", "-q", zipPath, "-d", targetDir], {
      stdio: ["ignore", "inherit", "inherit"],
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`unzip 退出码 ${code}`)),
    );
  });
  // If zip wrapped everything in a single top-level dir, flatten it.
  try {
    const entries = await readdir(targetDir, { withFileTypes: true });
    const visible = entries.filter(
      (e) => !e.name.startsWith(".") && e.name !== "__MACOSX",
    );
    if (visible.length === 1 && visible[0].isDirectory()) {
      const inner = path.join(targetDir, visible[0].name);
      const innerEntries = await readdir(inner);
      for (const name of innerEntries) {
        await rename(path.join(inner, name), path.join(targetDir, name));
      }
      // Best-effort cleanup of the now-empty wrapper (and __MACOSX if it exists).
      await spawnVoid("rm", ["-rf", inner, path.join(targetDir, "__MACOSX")]);
    }
  } catch (e) {
    console.error(`[${tag}] zip flatten skipped:`, e.message);
  }
  return targetDir;
}

/** Fire-and-forget child-process helper; never throws. */
function spawnVoid(cmd, args) {
  return new Promise((resolve) => {
    const c = spawn(cmd, args, { stdio: "ignore" });
    c.on("error", () => resolve());
    c.on("exit", () => resolve());
  });
}

/** Collect image_key values embedded in a rich-text (post) message. */
function extractPostImageKeys(content) {
  const keys = [];
  try {
    const parsed = JSON.parse(content || "{}");
    for (const line of parsed.content || []) {
      for (const node of line || []) {
        if (node?.tag === "img" && node.image_key) keys.push(node.image_key);
      }
    }
  } catch {}
  return keys;
}

/**
 * Collect URLs hidden inside a post message's link nodes — these are how doc
 * "share to chat" cards arrive: the visible anchor text shows the doc title,
 * the real URL lives only in `href`, so the plain-text regex never finds it.
 */
function extractPostUrls(content) {
  const urls = [];
  try {
    const parsed = JSON.parse(content || "{}");
    for (const line of parsed.content || []) {
      for (const node of line || []) {
        if ((node?.tag === "a" || node?.tag === "link") && node.href) {
          urls.push(node.href);
        }
      }
    }
  } catch {}
  return urls;
}

// Feishu Docs URLs: docx (current docs), wiki (knowledge base nodes).
const DOC_URL_RE =
  /https?:\/\/[\w.-]+\.(?:feishu\.cn|larksuite\.com)\/(docx|wiki|docs)\/([A-Za-z0-9]+)/g;
const DOC_CONTENT_CAP = 120000;
const DOC_IMAGES_LIMIT = 30; // safety cap per doc

/** Find Feishu doc references in a block of text. */
function findDocUrls(text) {
  const out = [];
  if (!text) return out;
  DOC_URL_RE.lastIndex = 0;
  let m;
  while ((m = DOC_URL_RE.exec(text))) {
    out.push({ url: m[0], kind: m[1], token: m[2] });
  }
  return out;
}

/**
 * All doc refs in a message: plain-text URLs in the visible body + href on any
 * link node (covers share-as-card posts). Deduped by token.
 */
function collectDocRefs(msg, userText) {
  const refs = findDocUrls(userText);
  if (msg.message_type === "post") {
    for (const url of extractPostUrls(msg.content)) {
      DOC_URL_RE.lastIndex = 0;
      const m = DOC_URL_RE.exec(url);
      if (m) refs.push({ url: m[0], kind: m[1], token: m[2] });
    }
  }
  const seen = new Set();
  return refs.filter((r) =>
    seen.has(r.token) ? false : (seen.add(r.token), true),
  );
}

/** Walk every block of a docx and return the file tokens of its image blocks. */
async function listDocImageTokens(documentId) {
  const tokens = [];
  let pageToken;
  let pages = 0;
  do {
    const resp = await client.docx.documentBlock.list({
      path: { document_id: documentId },
      params: { page_size: 500, page_token: pageToken },
    });
    const data = resp?.data ?? {};
    for (const block of data.items || []) {
      // block_type 27 = image block; its file token lives at block.image.token
      if (block.block_type === 27 && block.image?.token) {
        tokens.push(block.image.token);
        if (tokens.length >= DOC_IMAGES_LIMIT) return tokens;
      }
    }
    pageToken = data.has_more ? data.page_token : undefined;
    if (++pages > 20) break; // sanity guard for absurdly long docs
  } while (pageToken);
  return tokens;
}

/**
 * Resolve each image token → temp download URL → file on disk under TMP_DIR.
 * batchGetTmpDownloadUrl accepts max 5 tokens per call; we batch accordingly.
 * Returns the absolute file paths (in token order, missing ones skipped).
 */
async function downloadDocImages(documentId, tokens, tag) {
  if (!tokens.length) return [];
  const paths = [];
  for (let i = 0; i < tokens.length; i += 5) {
    const batch = tokens.slice(i, i + 5);
    let resp;
    try {
      resp = await client.drive.media.batchGetTmpDownloadUrl({
        params: { file_tokens: batch },
      });
    } catch (e) {
      console.error(`[${tag}] doc image url batch failed:`, e.message);
      continue;
    }
    const list = resp?.data?.tmp_download_urls || [];
    // Response order is not guaranteed → map by token.
    const urlByToken = Object.fromEntries(
      list.map((u) => [u.file_token, u.tmp_download_url]),
    );
    for (const token of batch) {
      const url = urlByToken[token];
      if (!url) continue;
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`http ${r.status}`);
        const buf = Buffer.from(await r.arrayBuffer());
        const ext = sniffImageExt(buf);
        const idx = paths.length + 1;
        const filePath = path.join(
          TMP_DIR,
          `doc-${documentId.slice(0, 12)}-${String(idx).padStart(2, "0")}.${ext}`,
        );
        await writeFile(filePath, buf);
        paths.push(filePath);
      } catch (e) {
        console.error(
          `[${tag}] doc image download (${token.slice(0, 12)}) failed:`,
          e.message,
        );
      }
    }
  }
  return paths;
}

/**
 * Fetch a Feishu doc's title + plain-text body + every embedded image saved to
 * disk so the spawned agent can inspect them. Throws on no-access / non-docx.
 */
async function fetchDocBundle({ url, kind, token }, tag) {
  let documentId = token;
  let docKind = kind;
  if (kind === "wiki") {
    const n = await client.wiki.space.getNode({
      params: { token, obj_type: "wiki" },
    });
    const node = n?.data?.node;
    if (!node) throw new Error("wiki 节点解析失败");
    docKind = node.obj_type;
    documentId = node.obj_token;
  }
  if (docKind !== "docx") {
    throw new Error(`暂不支持的文档类型「${docKind}」（仅支持新版 docx）`);
  }
  const raw = await client.docx.document.rawContent({
    path: { document_id: documentId },
    params: { lang: 0 },
  });
  let content = raw?.data?.content ?? "";
  if (content.length > DOC_CONTENT_CAP) {
    content = content.slice(0, DOC_CONTENT_CAP) + "\n…（文档过长，已截断）";
  }
  let title = url;
  try {
    const meta = await client.docx.document.get({
      path: { document_id: documentId },
    });
    title = meta?.data?.document?.title || title;
  } catch {}
  let images = [];
  try {
    const tokens = await listDocImageTokens(documentId);
    images = await downloadDocImages(documentId, tokens, tag);
  } catch (e) {
    // Image extraction is best-effort — keep the doc body even if it fails.
    console.error(`[${tag}] doc image bundle (${url}) failed:`, e.message);
  }
  return { title, content, images };
}

/**
 * Build the full prompt body for the active agent from one incoming message:
 * the user's text, plus any downloaded image paths and inlined Feishu doc
 * bodies. Network work (image download, doc fetch) happens here.
 */
async function buildAgentInput(msg, tag) {
  const type = msg.message_type;
  const messageId = msg.message_id;
  const userText = extractMessageText(msg.content, type);
  const parts = [];

  // --- images: standalone image messages + images embedded in a post ---
  const imageKeys = [];
  if (type === "image") {
    try {
      const k = JSON.parse(msg.content || "{}").image_key;
      if (k) imageKeys.push(k);
    } catch {}
  } else if (type === "post") {
    imageKeys.push(...extractPostImageKeys(msg.content));
  }
  const imgPaths = [];
  for (const key of imageKeys) {
    try {
      imgPaths.push(await downloadImage(messageId, key));
    } catch (e) {
      console.error(`[${tag}] image download failed:`, e.message);
      parts.push(`（有一张图片下载失败：${e.message}）`);
    }
  }
  if (imgPaths.length) {
    parts.push(
      `用户发来 ${imgPaths.length} 张图片，已下载到本地。请先用本地图像查看工具逐张查看再分析：\n` +
        imgPaths.join("\n"),
    );
  }

  // --- file attachments: zip → unpack into REPO_ROOT/frames/<slug>/ ---
  if (type === "file") {
    let fileKey = null;
    let fileName = null;
    try {
      const c = JSON.parse(msg.content || "{}");
      fileKey = c.file_key || null;
      fileName = c.file_name || null;
    } catch {}
    if (!fileKey) {
      parts.push("用户发来一个文件，但 file_key 缺失，无法下载。");
    } else if (!/\.zip$/i.test(fileName || "")) {
      parts.push(
        `用户发来文件「${fileName || fileKey}」，但当前仅支持 .zip（用于镜框 SKU 素材包）。` +
          `其它类型暂时不处理。`,
      );
    } else {
      try {
        const localPath = await downloadFile(messageId, fileKey, fileName);
        const targetDir = await unzipToFrames(localPath, fileName, tag);
        const slug = path.basename(targetDir);
        parts.push(
          `用户发来一个 zip 文件「${fileName}」，已解压到 ${targetDir}。\n` +
            `这通常是镜框 SKU 素材包。请用 frame-sku-upload skill 处理：\n` +
            `  - model_no = ${slug}\n` +
            `  - 素材目录 = ${targetDir}\n` +
            `先 ls 一下确认目录结构（典型有 sku/、修/、主图/ 这些子目录），` +
            `然后按 frame-sku-upload 的 10 步流程走完。`,
        );
      } catch (e) {
        console.error(`[${tag}] file/unzip failed:`, e.message);
        parts.push(
          `用户发来 zip 文件「${fileName || fileKey}」，但下载/解压失败：${e.message}`,
        );
      }
    }
  }

  // --- Feishu docs referenced in the text or shared as a card ---
  for (const ref of collectDocRefs(msg, userText)) {
    try {
      const doc = await fetchDocBundle(ref, tag);
      const imgSection = doc.images.length
        ? `\n\n文档内嵌图片已下载到本地（${doc.images.length} 张，按文档中出现顺序），请用本地图像查看工具逐张查看：\n` +
          doc.images.join("\n")
        : "";
      parts.push(
        `用户引用了飞书云文档《${doc.title}》（${ref.url}），正文如下：\n` +
          `----- 文档正文开始 -----\n${doc.content}\n----- 文档正文结束 -----` +
          imgSection,
      );
    } catch (e) {
      console.error(`[${tag}] doc fetch failed (${ref.url}):`, e.message);
      parts.push(
        `用户引用了飞书云文档 ${ref.url}，但读取失败：${e.message}\n` +
          `（若是权限问题，需在文档里把本飞书应用加为协作者，或开通 docx 文档读取权限）`,
      );
    }
  }

  const body = [userText, ...parts].filter(Boolean).join("\n\n");
  return body || "（用户发来一条没有可识别内容的消息）";
}

// Every group message is routed through the active agent skill workflow:
//   codex  -> /feishu-codex-skill
//   claude -> /feishu-claude-skill
// The threadId is injected as a header line so the skill can derive a stable
// per-thread git branch ("claude/feishu-<threadId>") across multi-turn resumes.
// The historical branch prefix is kept so in-flight Feishu topics survive CLI
// switches.

async function handleAgentRequest(text, threadId, messageId, tag) {
  const agent = getAgentRunner();
  const session = getSession(threadId);
  const prompt = `${agent.skillPrefix}[feishu-thread: ${threadId}]\n${text}`;
  const sessionId = getAgentSessionId(session);
  let agentResult;
  try {
    agentResult = await agent.run(prompt, { sessionId });
  } catch (e) {
    // Resume fallback: if the persisted thread cannot be resumed (wrong agent
    // session id, local session file gone, CLI upgrade, etc.), drop only the
    // active agent slot and retry fresh. Other agent context remains intact.
    if (sessionId) {
      console.warn(
        `[${tag}] ${agent.name} failed with sessionId=${sessionId}: ${e.message.slice(0, 200)}`,
      );
      console.warn(`[${tag}] retrying without resume (starting a new session)`);
      setAgentSessionId(session, null);
      agentResult = await agent.run(prompt, { sessionId: null });
    } else {
      throw e;
    }
  }
  const { result, sessionId: newSid } = agentResult;
  if (newSid) setAgentSessionId(session, newSid);
  accumulateTotals(session.totals, agentResult);
  sessions.set(threadId, session);
  await saveSessions();
  const body = (result || "").trim() || "(empty response)";
  const reply = body + formatFooter(session.totals);
  await replyToMessage(messageId, reply);
  console.log(`[${tag}] < ${reply.slice(0, 120)}`);
  return body;
}

const dispatcher = new lark.EventDispatcher({}).register({
  "im.message.receive_v1": async (payload) => {
    const event = payload?.event ?? payload;
    const msg = event?.message ?? {};
    const sender = event?.sender ?? {};
    const openId = sender?.sender_id?.open_id;
    const chatId = msg?.chat_id;
    const threadId = msg?.thread_id;
    const messageId = msg?.message_id;
    const text = extractMessageText(msg?.content, msg?.message_type);

    if (discover) {
      console.log(
        "[discover]",
        JSON.stringify({
          chat_id: chatId,
          open_id: openId,
          thread_id: threadId,
          message_type: msg?.message_type,
          text: text.slice(0, 120),
        }),
      );
      return;
    }

    if (chatId !== FEISHU_TARGET_CHAT_ID) return;
    if (!threadId) {
      console.log("[skip] no thread_id (message is not in a topic thread)");
      return;
    }
    const type = msg.message_type;
    if (
      type !== "text" &&
      type !== "post" &&
      type !== "image" &&
      type !== "file"
    ) {
      console.log(`[skip] unsupported message_type: ${type}`);
      return;
    }
    if (type === "text" && !text) return;

    const tag = threadId.slice(-8);

    // What goes into the topic record's `in` field. Attachments (images, docs)
    // are resolved later inside the queue; the record just shows the gist.
    const displayText =
      type === "image"
        ? "[图片]"
        : type === "file"
          ? `[文件:${text || "?"}]`
          : text || `[${type}]`;

    // Open/append the topic record (topics/<threadId>.json) for status query.
    const round = recordIncoming(threadId, displayText);
    saveTopic(threadId).catch((e) =>
      console.error(`[${tag}] saveTopic failed:`, e.message),
    );

    // If this thread is already running (or has a queued) agent turn, the new
    // message can't be handled until that finishes. Send an interim ack now;
    // the message is still queued, so it lands in the next turn's context.
    const wasBusy = queues.has(threadId);
    if (wasBusy) {
      console.log(`[${tag}] busy — queued, sent interim ack`);
      replyToMessage(messageId, "我正在处理，下回合会将这句话加入上下文").catch(
        (e) => console.error(`[${tag}] busy-ack reply failed:`, e.message),
      );
    }

    enqueue(threadId, async () => {
      console.log(`[${tag}] > ${displayText.slice(0, 120)}`);
      try {
        const prompt = await buildAgentInput(msg, tag);
        const body = await handleAgentRequest(prompt, threadId, messageId, tag);
        recordOutcome(threadId, round, true, body);
      } catch (e) {
        console.error(`[${tag}] error:`, e.message);
        recordOutcome(threadId, round, false, `error: ${e.message}`);
        try {
          await replyToMessage(messageId, `error: ${e.message}`);
        } catch (e2) {
          console.error(`[${tag}] reply failed:`, e2.message);
        }
      }
      await saveTopic(threadId).catch((e) =>
        console.error(`[${tag}] saveTopic failed:`, e.message),
      );
    });
  },
});

await mkdir(TOPICS_DIR, { recursive: true });
await mkdir(TMP_DIR, { recursive: true });
await loadSessions();
await loadTopics();
if (topics.size === 0 && !discover) await backfillTopics(); // first run — seed from history
await writeTopicIndex(); // ensure topics/INDEX.md exists even before any message
wsClient.start({ eventDispatcher: dispatcher });
const keepAlive = setInterval(() => {}, 60 * 60 * 1000);
console.log("[feishu-bot] WSS started — waiting for messages…");

const shutdown = (sig) => {
  console.log(`\n[feishu-bot] ${sig} received, closing…`);
  clearInterval(keepAlive);
  try {
    wsClient.close();
  } catch {}
  process.exit(0);
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
