#!/usr/bin/env node
// kw-expiry-sweep.mjs — provisional 过期词清扫：keywords → retired（月度，C 线）
// 有出处但有过期时间的词：到期未升级（GSC 实测/订单证据）→ 移入 retired 保留记录，
// cannibal 按 CONFLICT 拦截流通；重新验证后从 retired 移回 keywords 即复活。
// 用法：node scripts/kw-expiry-sweep.mjs [--dry]
import fs from "fs";

const P = "docs/library/keyword-library.json";
const today = new Date().toISOString().slice(0, 10);
const j = JSON.parse(fs.readFileSync(P, "utf8"));
j.retired = j.retired || [];
const stay = [], move = [];
for (const k of j.keywords || []) {
  if (k.provisional_deadline && k.provisional_deadline < today) move.push(k);
  else stay.push(k);
}
if (!move.length) { console.log(`✓ 无过期 provisional 词（在册 ${stay.length} / retired ${j.retired.length}）`); process.exit(0); }
if (process.argv.includes("--dry")) {
  for (const k of move) console.log(`[DRY] 将退役: ${k.keyword}（deadline ${k.provisional_deadline}，tier ${k.volume_tier}）`);
  process.exit(0);
}
for (const k of move) {
  j.retired.push({ ...k, retired_at: today, revive_rule: "重新验证（GSC 实测 ≥10 展示 或 订单/客服证据）→ 手动移回 keywords 并更新 volume_tier/source" });
  console.log(`⏳ 退役: ${k.keyword}（deadline ${k.provisional_deadline}）`);
}
j.keywords = stay;
j.updated = today;
fs.writeFileSync(P, JSON.stringify(j, null, 2) + "\n");
console.log(`✓ 迁移 ${move.length} 词 → retired（在册 ${stay.length} / retired ${j.retired.length}）——cannibal 现在会拦截这些词`);
