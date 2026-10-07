// DEEPL 直填：翻译 ui_strings 里缺失目标语言的条目 → translations 表
import { readFileSync } from "node:fs";
const env = readFileSync(".env", "utf8");
const get = (k) => ((env.match(new RegExp(`^${k}=(.*)$`, "m")) || [])[1]?.trim() || "").replace(/^["']|["']$/g, "");
const u = new URL(get("DATABASE_URL"));
const dbAuth = "Basic " + Buffer.from(`${decodeURIComponent(u.username || "")}:${decodeURIComponent(u.password || "")}`).toString("base64");
u.username = ""; u.password = "";
const DEEPL_KEY = get("DEEPL_API_KEY");
const DEEPL_BASE = DEEPL_KEY.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";

async function q(sql, params = []) {
  const r = await fetch(u.toString(), { method: "POST", headers: { "Content-Type": "application/json", Authorization: dbAuth }, body: JSON.stringify({ sql, query: sql, params }) });
  const t = await r.text();
  if (!r.ok) { console.error("SQLERR:", t.slice(0, 300)); process.exit(1); }
  return JSON.parse(t);
}
async function deepl(texts, target) {
  const r = await fetch(`${DEEPL_BASE}/v2/translate`, {
    method: "POST",
    headers: { Authorization: `DeepL-Auth-Key ${DEEPL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text: texts, target_lang: target.toUpperCase(), source_lang: "EN" }),
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`DeepL ${r.status}: ${t.slice(0, 150)}`);
  return JSON.parse(t).translations;
}

const TARGET = process.argv[2] || "zh";
const missing = (await q(
  `SELECT u.source_text FROM public.ui_strings u
    WHERE NOT EXISTS (
      SELECT 1 FROM public.translations t
       WHERE t.source_text = u.source_text AND t.target_lang = $1 AND t.category = 'ui')
    AND u.source_text ~ '[a-zA-Z]'
    ORDER BY u.source_text LIMIT 800`,
  [TARGET]
));
const list = (missing.rows ?? []).map(r => r.source_text);
console.log(`目标 ${TARGET}：待翻译 ${list.length} 条`);
if (!list.length) process.exit(0);

let done = 0;
for (let i = 0; i < list.length; i += 40) {
  const batch = list.slice(i, i + 40);
  try {
    const trs = await deepl(batch, TARGET);
    for (let k = 0; k < batch.length; k++) {
      const tr = trs[k]?.text;
      if (!tr) continue;
      await q(
        `INSERT INTO public.translations (source_lang, target_lang, source_text, translated_text, category, auto, provider)
         SELECT 'en', $1, $2, $3, 'ui', true, 'deepl'
         WHERE NOT EXISTS (SELECT 1 FROM public.translations WHERE source_lang='en' AND target_lang=$1 AND source_text=$2 AND category='ui')`,
        [TARGET, batch[k], tr]
      );
      done++;
    }
  } catch (e) {
    console.error(`批次 ${i} 失败:`, String(e).slice(0, 140));
  }
  await new Promise(r2 => setTimeout(r2, 300));
}
console.log(`完成：${done}/${list.length} 条已写入`);
