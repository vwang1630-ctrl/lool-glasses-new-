// Schtasks → local tick for the payment/fulfillment jobs.
//
//   node scripts/cron-tick.mjs          → runs the 7 operational jobs + tracking refresh (NOT daily-report)
//   node scripts/cron-tick.mjs --daily  → runs daily-report only (03:00-class task)
//
// Talks to POST /api/public/payments-cron with the PAYMENT_CRON_SECRET bearer
// (the route's own security boundary). Appends one line per run to
// logs/cron-tick.log; scheduled via:
//   schtasks /TN "FUZZ cron 10min"        /SC MINUTE /MO 10    → this file
//   schtasks /TN "FUZZ cron daily-report" /SC DAILY   /ST 03:07 → this file --daily
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const LOG = path.join(ROOT, "logs", "cron-tick.log");

const DAILY = process.argv.includes("--daily");
// Everything except daily-report, which freezes yesterday's reconciliation row
// and belongs to its own 03:00-class schedule (jobs.server.ts header comment).
const OPS_JOBS = [
  "expire-intents",
  "retry-events",
  "cancel-expired-payments",
  "auto-complete-deliveries",
  "escalate-stale-shipments",
  "escalate-expired-holds",
  "close-stale-aftercare",
];

const raw = fs.readFileSync(path.join(ROOT, ".env"), "utf8");
const secret = (raw.match(/^PAYMENT_CRON_SECRET=(.+?)\r?$/m)?.[1] ?? "").trim().replace(/^"|"$/g, "");
if (!secret) {
  console.error("PAYMENT_CRON_SECRET missing in .env — refusing to run");
  process.exit(1);
}

function log(line) {
  try {
    fs.mkdirSync(path.dirname(LOG), { recursive: true });
    if (fs.existsSync(LOG) && fs.statSync(LOG).size > 2_000_000) {
      fs.renameSync(LOG, LOG.replace(/\.log$/, ".old.log"));
    }
    fs.appendFileSync(LOG, `${new Date().toISOString()} ${line}\n`);
  } catch {
    /* logging must never break the tick */
  }
}

function runJob(job, endpoint = "/api/public/payments-cron") {
  const started = Date.now();
  const body = JSON.stringify(job ? { job } : {});
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: 80,
        path: endpoint,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
          "Content-Length": Buffer.byteLength(body),
        },
        timeout: 30_000,
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ job, status: res.statusCode, ms: Date.now() - started, data }));
      },
    );
    req.on("timeout", () => { req.destroy(); resolve({ job, status: 0, ms: Date.now() - started, data: "timeout" }); });
    req.on("error", (e) => resolve({ job, status: 0, ms: Date.now() - started, data: e.message }));
    req.write(body);
    req.end();
  });
}

const jobs = DAILY ? ["daily-report"] : OPS_JOBS;
const results = [];
for (const job of jobs) results.push(await runJob(job));
// Tracking refresh + arrival-evidence sweep (7-day auto-accept, photo
// reminders). No-op for carrier events until a carrier is configured with
// tracking_enabled + credentials, but the sweep always has real work.
if (!DAILY) results.push(await runJob(null, "/api/public/tracking-cron"));

for (const r of results) {
  let ok = r.status === 200;
  let detail = "";
  try {
    const parsed = JSON.parse(r.data);
    ok = parsed.ok === true;
    const res = Array.isArray(parsed.results) ? parsed.results[0] : null;
    if (res && res.detail) {
      detail = ` ${typeof res.detail === "string" ? res.detail : JSON.stringify(res.detail).slice(0, 120)}`;
    }
  } catch {
    detail = ` raw=${r.data.slice(0, 80)}`;
  }
  log(`${DAILY ? "daily" : "tick"} ${r.job} ${ok ? "OK" : "FAIL"} ${r.status} ${r.ms}ms${detail}`);
  if (!ok) process.exitCode = 1;
}
