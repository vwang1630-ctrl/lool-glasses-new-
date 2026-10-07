// env-sql.cjs — 共享 SQL 网关客户端（.env 解析 + Basic auth + sql/query 双键）
// 用法：const { sql } = require("./env-sql.cjs"); await sql("select 1", []);
const fs = require("fs");

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

async function sql(text, params = []) {
  const env = loadEnv();
  const u = new URL(env.DATABASE_URL);
  const auth =
    "Basic " +
    Buffer.from(
      `${decodeURIComponent(u.username)}:${decodeURIComponent(u.password)}`,
    ).toString("base64");
  const res = await fetch(u.origin + u.pathname + u.search, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: auth },
    body: JSON.stringify({ sql: text, query: text, params }),
  });
  const raw = await res.text();
  let j;
  try {
    j = JSON.parse(raw);
  } catch {
    throw new Error(`SQL gateway non-JSON (HTTP ${res.status}): ${raw.slice(0, 300)}`);
  }
  if (!res.ok || j.error) throw new Error("SQL gateway error: " + JSON.stringify(j).slice(0, 500));
  return j;
}

module.exports = { sql, loadEnv };
