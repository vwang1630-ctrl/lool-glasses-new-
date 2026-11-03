// Regenerates .dev.vars (wrangler's local Worker secrets) from .env.
//
// Single source of truth: edit .env only. This runs automatically before
// `dev` / `preview` (see package.json), so .dev.vars is never hand-edited.
//
// Allowlist: only keys declared in .dev.vars.example are copied. Anything
// else in .env — CLOUDFLARE_API_TOKEN, FAL_KEY, FEISHU_*, ... — is a CLI /
// dev-tool secret and must NOT reach the Worker runtime, so it is skipped.
// Add a new Worker var by declaring it in .dev.vars.example first.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const examplePath = join(root, ".dev.vars.example");
const envPath = join(root, ".env");
const outPath = join(root, ".dev.vars");

/** Parse dotenv text into a key→value map (first `=` splits; `#` lines skipped). */
function parseEnv(text) {
  const map = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    map[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return map;
}

if (!existsSync(examplePath)) {
  console.error(
    "[sync-dev-vars] missing .dev.vars.example — cannot determine Worker keys",
  );
  process.exit(1);
}
if (!existsSync(envPath)) {
  console.error(
    "[sync-dev-vars] missing .env — create it and add the Worker secrets",
  );
  process.exit(1);
}

const allowKeys = Object.keys(parseEnv(readFileSync(examplePath, "utf8")));
const env = parseEnv(readFileSync(envPath, "utf8"));

const lines = [];
const missing = [];
for (const key of allowKeys) {
  if (env[key] !== undefined && env[key] !== "")
    lines.push(`${key}=${env[key]}`);
  else missing.push(key);
}

writeFileSync(outPath, lines.join("\n") + "\n");
console.log(
  `[sync-dev-vars] .dev.vars ← .env — ${lines.length}/${allowKeys.length} keys written`,
);
if (missing.length) {
  console.warn(
    `[sync-dev-vars] not set in .env (skipped): ${missing.join(", ")}`,
  );
}
