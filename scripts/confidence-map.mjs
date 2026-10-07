#!/usr/bin/env node
// confidence-map.mjs — 决策系统收编版：置信度查表 + 实验设计质量分档
// 纪律来源: decision-system-adoption.md（硬伤②：查表必须确定性执行，禁止 LLM 判断）
// 用法:
//   node scripts/confidence-map.mjs confidence --sq medium --es untested --cons single_source --ds available
//   node scripts/confidence-map.mjs design --sample y --control y --random n --interleave y --window y --pre y
//   node scripts/confidence-map.mjs selftest

const RULES = [
  { p: 1, when: { empirical_support: "refuted" },                                              confidence: "low",     flag: "warn_and_review", msg: "该知识与已有实验证据矛盾，请谨慎参考" },
  { p: 2, when: { consensus: "contested" },                                                    confidence: "low",     flag: "require_review",  msg: "该知识存在争议，建议人工复核（decision-ledger 待站主）" },
  { p: 3, when: { source_quality: "high", empirical_support: "confirmed", data_status: "available" },   confidence: "high",   flag: "none" },
  { p: 4, when: { source_quality: "high", empirical_support: "confirmed", data_status: "partial" },     confidence: "medium", flag: "none" },
  { p: 5, when: { source_quality: "medium", empirical_support: "untested", data_status: "available" },  confidence: "medium", flag: "none" },
  { p: 6, when: { source_quality: "medium", empirical_support: "untested", data_status: "partial" },    confidence: "low",    flag: "none" },
  { p: 7, when: { source_quality: "low" },                                                     confidence: "low",     flag: "none" },
  { p: 8, when: { data_status: ["unavailable", "insufficient"] },                              confidence: "unknown", flag: "none" },
];

function confidence({ source_quality: sq, empirical_support: es, consensus: cons, data_status: ds }) {
  for (const r of RULES) {
    const hit = Object.entries(r.when).every(([k, want]) => {
      const got = { source_quality: sq, empirical_support: es, consensus: cons, data_status: ds }[k];
      return Array.isArray(want) ? want.includes(got) : got === want;
    });
    if (hit) return { priority: `priority_${r.p}`, confidence: r.confidence, flag: r.flag, msg: r.msg || "" };
  }
  return { priority: "priority_8", confidence: "unknown", flag: "none", msg: "无规则命中，兜底 unknown" };
}

// design_quality 因子表（收编修正版，decision-system-adoption.md 第四部分）:
//   +2 sample_adequate  +2 control_present  +2 randomization（真随机）
//   或（无真随机且 ABAB 交替）+1 interleave  +1 attribution_window  +1 preregistered
//   封顶规则：无真随机 → 总分与档位封顶 medium（时间混淆未消除）
function designQuality(f) {
  const y = (v) => v === true || v === "y" || v === "yes";
  let score = 0;
  score += y(f.sample_adequate) ? 2 : 0;
  score += y(f.control_present) ? 2 : 0;
  const random = y(f.randomization);
  score += random ? 2 : (y(f.interleave) ? 1 : 0);
  score += y(f.attribution_window_correct) ? 1 : 0;
  score += y(f.preregistered) ? 1 : 0;
  const capped = !random;
  const base = score >= 6 ? "high" : score >= 3 ? "medium" : "low";
  const quality = capped && base === "high" ? "medium" : base;
  return {
    score,
    quality,
    capped,
    note: capped ? "无真随机（仅 ABAB 交替）→ 封顶 medium；升 confirmed 需真对照实验" : "满足 high 条件",
  };
}

function selftest() {
  const cases = [
    [confidence({ source_quality: "medium", empirical_support: "untested", consensus: "single_source", data_status: "available" }), { priority: "priority_5", confidence: "medium", flag: "none" }],
    [confidence({ source_quality: "low", empirical_support: "confirmed", consensus: "single_source", data_status: "available" }), { priority: "priority_7", confidence: "low", flag: "none" }],
    [confidence({ source_quality: "high", empirical_support: "refuted", consensus: "single_source", data_status: "available" }), { priority: "priority_1", confidence: "low", flag: "warn_and_review" }],
    [confidence({ source_quality: "high", empirical_support: "confirmed", consensus: "single_source", data_status: "unavailable" }), { priority: "priority_8", confidence: "unknown", flag: "none" }],
  ];
  let fail = 0;
  for (const [got, want] of cases) {
    const ok = got.priority === want.priority && got.confidence === want.confidence && got.flag === want.flag;
    if (!ok) fail++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${got.priority} → ${got.confidence}/${got.flag}`);
  }
  const dq = designQuality({ sample_adequate: "y", control_present: "y", randomization: "n", interleave: "y", attribution_window_correct: "y", preregistered: "y" });
  // 2+2+1+1+1 = 7 分但无真随机 → 封顶 medium
  const dqOk = dq.score === 7 && dq.quality === "medium" && dq.capped;
  console.log(`${dqOk ? "PASS" : "FAIL"}  design ABAB: score=${dq.score} → ${dq.quality}${dq.capped ? "（封顶）" : ""}`);
  if (!dqOk) fail++;
  console.log(fail ? `\n${fail} 项失败` : "\n自检全过");
  process.exit(fail ? 1 : 0);
}

const [cmd] = process.argv.slice(2);
const arg = (k) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : undefined; };

if (cmd === "selftest" || !cmd) selftest();
else if (cmd === "confidence")
  console.log(JSON.stringify(confidence({
    source_quality: arg("sq"), empirical_support: arg("es"), consensus: arg("cons"), data_status: arg("ds"),
  }), null, 2));
else if (cmd === "design")
  console.log(JSON.stringify(designQuality({
    sample_adequate: arg("sample"), control_present: arg("control"), randomization: arg("random"),
    interleave: arg("interleave"), attribution_window_correct: arg("window"), preregistered: arg("pre"),
  }), null, 2));
else { console.error("未知命令: " + cmd); process.exit(1); }
