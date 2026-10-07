#!/usr/bin/env node
// FUZZ SOFA PDP Toolbox — V4.3 FINAL TEMPLATE LOCKED 生产力工具
// 框架锁 + 活库 + 规则引擎的命令行入口。零依赖（node >= 18 内置 fetch/fs）。
//
// 用法:
//   node scripts/pdp-toolbox.mjs selftest                     全量回归：Noctua 正样本 + 负样本注入套件
//   node scripts/pdp-toolbox.mjs validate <patch.json>        规则引擎 r1–r14 校验补丁（r14=产品-市场-人-心理对齐）
//   node scripts/pdp-toolbox.mjs verify <url> <patch.json>    线上 DOM 回归（title/meta/h1/QC/旧文案清除）
//   node scripts/pdp-toolbox.mjs library show|search <t>|add <lib> <file>|bump <lib>
//   node scripts/pdp-toolbox.mjs scaffold <input.json>        由产品输入生成补丁骨架（含 r14 心理岗位卡）
//   node scripts/pdp-toolbox.mjs operator-intake <input.json> OP-01–05：Product DNA + 四层市场搜索 + 五信源 + 画像骨架（一号战略原则）
//   node scripts/pdp-toolbox.mjs persona infer <input.json|slug>  画像反推：图+参数/DB产品 → 目标买家（persona-library）
//   node scripts/pdp-toolbox.mjs persona brief <input.json|slug>  画像调研简报：信号盘点→库缺口→爬取计划→搜索词（管线第②③步）
//   node scripts/pdp-toolbox.mjs score <patch.json>           内容评分 0–100（溯源/结构/关键词落位/画像覆盖加权）
//   node scripts/pdp-toolbox.mjs cannibal <patch.json|kw>     关键词蚕食检测（DB 实查 products + site_articles）
//
// 补丁文件形状（patch shape）见 docs/fuzz-produce-manual.md §3.1，现成样本在 docs/library/fixtures/。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIB = (f) => path.join(ROOT, "docs", "library", f);
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const FRAME = () => readJson(LIB("framework-lock.json"));
const SEO_LIB = () => readJson(LIB("seo-meta-library.json"));
const SOCIAL = () => readJson(LIB("social-proof.json"));
const AIVREAL = () => readJson(LIB("ai-vs-real.json"));
const PERSONAS = () => readJson(LIB("persona-library.json"));

const DASH = "[–-]";
const OUT = [];
const log = (s = "") => { OUT.push(s); };

// ---------- 字段收集 ----------
function collectStrings(node, out = [], trail = "") {
  if (typeof node === "string") { if (node.trim()) out.push({ trail, text: node }); return out; }
  if (Array.isArray(node)) { node.forEach((v, i) => collectStrings(v, out, `${trail}[${i}]`)); return out; }
  if (node && typeof node === "object") { for (const [k, v] of Object.entries(node)) collectStrings(v, out, trail ? `${trail}.${k}` : k); }
  return out;
}
const isStory = (trail) => /storyText|storyHeading|quote/.test(trail);

// ---------- r1 占位符 ----------
function r1Placeholders(strings) {
  const bad = strings.filter((s) => /\[(PLACEHOLDER|MISSING)\]|\bTBD\b|\bTODO\b/i.test(s.text));
  return bad.map((b) => `${b.trail}: 占位符残留`);
}

// ---------- r2 数字溯源 ----------
function extractClaimNumbers(text) {
  const t = text.replace(/\b(18|19|20)\d{2}\b/g, " "); // 年份豁免
  const found = [];
  const money = t.match(/[$€£¥]\s?[\d,]+(?:\.\d+)?(?:\s*(?:million|M|billion|B))?\b/gi) || [];
  for (const m of money) {
    const mult = /million|\bM\b/i.test(m) ? 1e-6 : /billion|\bB\b/i.test(m) ? 1e-9 : 1;
    const mantissa = parseFloat(m.replace(/[^\d.]/g, ""));
    const v = mantissa * mult;
    if (Number.isFinite(v)) found.push({ raw: m.trim(), value: v, mantissa: mult !== 1 ? mantissa : undefined, kind: "money" });
  }
  const qty = t.match(/\d[\d,]*(?:\.\d+)?\s?(?:kg(?:\/m³|\/24h)?|mm|cm|%|㎡|rubs?|转|hours?|h\b|days?|天|[×x])/gi) || [];
  for (const q of qty) {
    const v = parseFloat(q.replace(/[^\d.]/g, ""));
    if (Number.isFinite(v)) found.push({ raw: q.trim(), value: v, kind: "qty" });
  }
  return found;
}
function r2Numbers(patch, frame) {
  const allow = new Set([
    ...frame.trust_kit.trusted_numbers,
    ...(patch.approved_numbers || []),
    ...frame.trust_kit.trusted_money.map((m) => parseFloat(String(m).replace(/[^\d.]/g, ""))),
  ]);
  const issues = [];
  for (const s of collectStrings({ seo: patch.seo, content: patch.content })) {
    for (const n of extractClaimNumbers(s.text)) {
      // million/billion 金额（如 £333M）按尾数与 trusted_money 对表
      if (!allow.has(n.value) && (n.mantissa === undefined || !allow.has(n.mantissa)))
        issues.push(`${s.trail}: "${n.raw}" 无出处（不在 QC 信任组/输入清单）`);
    }
  }
  return [...new Set(issues)];
}

// ---------- r4 引用逐字 ----------
function r4Quote(patch) {
  const q = patch.content?.quote;
  if (!q) return [];
  if (!q.source?.trim()) return ["quote.source 缺失"];
  if (!patch.content?.storyText?.includes(q.text)) return ["用户原话未逐字出现在 storyText"];
  return [];
}

// ---------- r5 关键词证据 ----------
function r5Keywords(patch, seoLib) {
  const issues = [];
  const clusterWords = new Set();
  for (const group of ["en", "cn"]) {
    for (const k of seoLib.keyword_clusters_verified?.[group] || []) clusterWords.add(k.keyword.toLowerCase());
  }
  const deprecated = new Set((seoLib.keyword_clusters_verified?.deprecated_fake_words || []).map((d) => d.keyword.toLowerCase()));
  for (const kw of patch.seo?.keywords || []) {
    const k = kw.toLowerCase();
    if (deprecated.has(k)) { issues.push(`假关键词 "${kw}" 在 deprecated 名单`); continue; }
    const hit = [...clusterWords].some((c) => c === k || c.includes(k) || k.includes(c));
    if (!hit) issues.push(`关键词 "${kw}" 库内无证据条目`);
  }
  return issues;
}

// ---------- r6 禁词 ----------
function r6Forbidden(strings, frame) {
  const issues = [];
  for (const w of frame.forbidden_words.zh) {
    for (const s of strings) if (s.text.includes(w)) issues.push(`${s.trail}: 禁词「${w}」`);
  }
  const en = frame.forbidden_words.en.map((w) => `${w}(?:s|d|ly|ion|ions)?`);
  const re = new RegExp(`\\b(?:${en.join("|")})\\b`, "i");
  for (const s of strings) if (re.test(s.text)) issues.push(`${s.trail}: 禁词 /${re.source}/ 命中`);
  return issues;
}

// ---------- r7 框架锁约束 ----------
const codepoints = (s) => [...String(s ?? "")].length;
function r7Framework(patch, frame) {
  const issues = [], warns = [];
  const c = patch.content || {};
  const sec = Object.fromEntries(frame.sections.map((s) => [s.name, s]));
  const feat = c.features?.length ?? 0;
  if (feat !== sec.KeyFeatures.constraints.items) issues.push(`Key Features 必须 ${sec.KeyFeatures.constraints.items} 条，现 ${feat}`);
  const mats = c.materials?.length ?? 0;
  const matsMax = sec.Materials.constraints.columns_max ?? sec.Materials.constraints.columns;
  if (mats > matsMax) issues.push(`Materials 最多 ${matsMax} 项（材料=简单名称列表），现 ${mats}`);
  // 材料区禁区（2026-09-12 用户定调：材料列表只写材料名，参数/可拆洗声明归其他模块）
  const matsBad = (c.materials || []).filter((m) =>
    /rubs|martindale|washable|removable|QC\s|SH\d{4}|\d/.test(String(m)));
  if (matsBad.length) issues.push(`Materials 列表出现参数/测试标注（禁区，只写材料名）：${matsBad.join(" | ")}`);
  const insp = c.interiorImages?.length ?? 0;
  if (insp > sec.Inspiration.constraints.cards) issues.push(`Inspiration 最多 ${sec.Inspiration.constraints.cards} 张，现 ${insp}`);
  if (new Set(c.interiorImages || []).size !== insp) issues.push("Inspiration 3 图存在重复（框架要求不重复）");
  const hero = c.heroImages?.length ?? 0;
  if (hero > sec.Hero.constraints.images_max) issues.push(`Hero 图超 ${sec.Hero.constraints.images_max} 张，现 ${hero}`);
  const t = codepoints(patch.seo?.title), d = codepoints(patch.seo?.description);
  const [tlo, thi] = sec.SEOMeta.constraints.title_chars, [dlo, dhi] = sec.SEOMeta.constraints.description_chars;
  if (t < tlo || t > thi) issues.push(`meta title ${t} 字符（要求 ${tlo}-${thi}）`);
  if (d < dlo || d > dhi) issues.push(`meta description ${d} 字符（要求 ${dlo}-${dhi}）`);
  if (!patch.seo?.h1?.trim()) issues.push("H1 缺失");
  if (!c.storyHeading?.trim()) issues.push("storyHeading 缺失");
  if (!c.leadTime?.trim()) issues.push("leadTime 缺失");
  // FAQ V1.1 契约：前 4 可见 + Show all 展开，≤8 条硬顶（constraints.max_rows）
  const faqRows = patch.content?.faq?.length ?? 0;
  if (faqRows > (sec.FAQ.constraints.max_rows ?? 4)) {
    warns.push(`FAQ ${faqRows} 条 > 组件契约硬顶 ${sec.FAQ.constraints.max_rows} 条 — FRAMEWORK_DRIFT（组件=4 可见+展开全部）`);
  }
  // Inspiration 卡（线上曾出现两卡描述完全相同的事故）：缺文案 / 描述重复 = 拦
  const inspCards = c.interiorInspirations || [];
  if (inspCards.length > sec.Inspiration.constraints.cards) issues.push(`Interior Inspiration 最多 ${sec.Inspiration.constraints.cards} 卡，现 ${inspCards.length}`);
  if (inspCards.some((x) => !(x.title || "").trim() || !(x.description || "").trim())) issues.push("Interior Inspiration 存在缺 title/description 的卡");
  // 卡必须带图（2026-09-13 noctua 事故）：桌面+移动渲染层都 filter 掉无图卡 → 区块静默空 grid，patch 必须拦在闸门
  if (inspCards.length && sec.Inspiration.constraints.image_required && inspCards.some((x) => !(x.image || "").trim())) issues.push("Interior Inspiration 存在缺 image 的卡：渲染层会静默丢弃无图卡（整区空白），每卡必带 image URL");
  const descSet = new Set(inspCards.map((x) => (x.description || "").trim()));
  if (descSet.size !== inspCards.length) issues.push("Interior Inspiration 存在重复描述（2026-09-09 线上事故，禁复发）");
  // 场景区禁区（2026-09-12 用户定调「模块属性不可跨界」）：场景卡=纯氛围描述，禁任何数字参数/QC/工业术语
  const sceneHay = inspCards.map((x) => `${x.title || ""} ${x.description || ""}`).join(" \n ");
  if (/\d/.test(sceneHay)) issues.push("Interior Inspiration 场景区出现数字/参数（禁区）：场景卡只做氛围描述，参数归 ProductData，可拆卸内容归 主要特点");
  // 词边界（2026-09-13）：无边界时 /MPa/i 误吞「COMPANION」、「EN\s?\d」误吞「often 5」——单位词必须 \b
  if (/martindale|\brubs\b|QC\s|SH\d{4}|\bASTM\b|\bEN\s?\d|\bMPa\b|kg\/m|washable|removable/i.test(sceneHay)) issues.push("Interior Inspiration 场景区出现工业术语/测试数据/可拆洗声明（禁区）");
  // 主要特点禁区（2026-09-12 铁律#9）：特点区禁钢材型号/屈服强度/QC 编号——归 ProductData/白手套/FAQ
  const featHay = (c.features || []).map((f) => `${f.title || ""} ${f.desc || ""}`).join(" \n ");
  if (/Q\d{3}|屈服|\byield\b|\bMPa\b|QC\s|SH\d{4}|FUZZ-LAB|\bASTM\b/i.test(featHay)) issues.push("Key Features 出现钢材型号/屈服强度/QC 编号（禁区）：规格归 ProductData，QC 编号归产品数据表/白手套/FAQ");
  return { issues, warns };
}

// ---------- r13 图像辨识先行（2026-09-13 kong/meteorite 图文错配事故，用户令建）----------
// r7 管「场景区写什么」（禁区/框架），r13 管「文案必须忠于图」：每张场景卡图必须先经视觉辨识，
// 登记 docs/library/scene-image-manifest.json（seen=图里实际内容），文案（title+description）
// 禁踩该图 banned_terms——图中没有的道具不许写。清单缺失 = 整条规则 FAIL（先建清单再写卡）。
function r13SceneManifest(patch) {
  const issues = [];
  const cards = patch.content?.interiorInspirations || [];
  let sceneManifest;
  try {
    sceneManifest = JSON.parse(fs.readFileSync(LIB("scene-image-manifest.json"), "utf8"));
  } catch {
    return ["scene-image-manifest.json 缺失或不可读：场景卡必须先图像辨识再写文案（r13）"];
  }
  for (const x of cards) {
    const key = String(x.image || "").split("/").pop();
    const m = (sceneManifest.images || {})[key];
    if (!m || !(m.seen || "").trim() || m.copy_verified !== true) {
      issues.push(`场景卡图 ${key} 未登记图像辨识清单（docs/library/scene-image-manifest.json）：写文案前必须先看图、把图里实际内容写入 seen 并标 copy_verified——图与文案错配防线（r13）`);
      continue;
    }
    const hay = `${x.title || ""} ${x.description || ""}`.toLowerCase();
    const hitBan = (m.banned_terms || []).find((t) => hay.includes(String(t).toLowerCase()));
    if (hitBan) issues.push(`场景卡文案踩 ${key} 的辨识禁区词「${hitBan}」：图中没有的道具不许写（虚构道具防线，r13）`);
  }
  return issues;
}

// ---------- r8 信任组 ----------
function r8Trust(patch, frame) {
  const all = collectStrings({ seo: patch.seo, content: patch.content }).map((s) => s.text).join("\n");
  return frame.trust_kit.qc_reports_required
    .filter((id) => !all.includes(id))
    .map((id) => `质检报告 ${id} 未出现在任何字段`);
}

// ---------- r9 交期口径（2026-09-12 用户裁决：全站统一，chargeable_kg 不再改变客户侧承诺） ----------
// 统一口径：1–3 天生产 + 7–14 天运输（海运 25–35 天，不推荐）。旧口径 9–17 废止。
function r9Delivery(patch, frame) {
  const lt = `${patch.content?.leadTime || ""} ${patch.content?.leadTimeNote || ""}`;
  const issues = [];
  for (const [pat, label] of [
    [`1${DASH}3`, "1–3 天生产"],
    [`7${DASH}14`, "7–14 天运输"],
    [`25${DASH}35`, "海运 25–35 天（不推荐）"],
  ]) {
    if (!new RegExp(pat).test(lt)) issues.push(`交期缺统一口径组成「${label}」— 全站标准：1–3 天生产 + 7–14 天运输（海运 25–35 天，不推荐）`);
  }
  if (new RegExp(`9${DASH}17`).test(lt)) issues.push("旧口径 9–17 天残留（2026-09-12 废止，改 1–3 天生产 + 7–14 天运输）");
  return issues;
}

// ---------- r10 AI vs Real ----------
function r10AiVsReal(patch, frame) {
  const issues = [];
  const hay = JSON.stringify({ seo: patch.seo, content: patch.content }).toLowerCase();
  const story = (patch.content?.storyText || "").toLowerCase();
  for (const subj of frame.ai_subjects) {
    const re = new RegExp(subj.replace(/ /g, "\\s+"), "i");
    for (const s of collectStrings({ seo: patch.seo, content: patch.content })) {
      if (isStory(s.trail)) continue;
      if (re.test(s.text)) issues.push(`${s.trail}: AI 概念对象 "${subj}" 出现在非 Story 字段（只能进 Design Story 叙事）`);
    }
    if (re.test(story)) {
      const labeled = frame.ai_label_tokens.some((lb) => story.includes(lb.toLowerCase()));
      if (!labeled) issues.push(`storyText 提到 AI 概念对象 "${subj}" 但缺 AI 标注词（${frame.ai_label_tokens.join("/")}）`);
    }
  }
  return issues;
}

// ---------- r11 社证数字 ----------
const SOCIAL_TOKENS = { "8.5M": "ig-animal-sofa-8.5m-50off", "710K": "fb-kingkong-710k", "17.6K": "tk-sunyao-17.6k-527k", "527K": "tk-sunyao-17.6k-527k" };
function r11Social(patch, social) {
  const issues = [], warns = [];
  const verifiedTexts = JSON.stringify(social.verified_entries || {}).toLowerCase();
  for (const s of collectStrings({ content: patch.content })) {
    for (const [tok, id] of Object.entries(SOCIAL_TOKENS)) {
      if (!s.text.includes(tok)) continue;
      const entry = (social.user_provided_pending || []).find((e) => e.id === id);
      if (isStory(s.trail)) {
        if (entry && !entry.confirmed) warns.push(`${s.trail}: 社证数字 ${tok} 为 user_provided 未确认 — 上页前需用户书面确认（链接/截图回填库）`);
      } else if (!verifiedTexts.includes(tok.toLowerCase())) {
        issues.push(`${s.trail}: 社证数字 ${tok} 不允许出现在非 Story 字段（库内无 verified 条目）`);
      }
    }
  }
  return { issues, warns };
}

// ---------- 买家画像反推（persona engine）----------
// 逻辑：图+参数（主题词/价格/尺寸/材质/轨道）→ triggers 匹配 → 画像排序。
// 画像决定内容钩子、平台、信任证据排序；画像不豁免溯源（数字仍走 r2/rb2）。
// 词边界匹配：ASCII 词用 \b（"ape" 不得命中 "shaped"），中文/非 ASCII 用包含。
const wordHit = (hay, needle) => {
  const n = String(needle).toLowerCase();
  if (!/[a-z0-9]/i.test(n)) return hay.toLowerCase().includes(n);
  return new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(hay.toLowerCase());
};
function personaInfer(input, plib) {
  const themeText = [input.slug, input.name, input.concept, input.track, ...(input.theme_keywords || [])]
    .filter(Boolean).join(" ").toLowerCase();
  const mats = (input.materials || []).map((m) => (typeof m === "string" ? m : m.name || "")).join(" ; ").toLowerCase();
  const price = Number(input.price ?? 0);
  const W = Number(input.W ?? 0);
  const ranked = [];
  for (const p of plib.personas || []) {
    const t = p.triggers || {}, why = [];
    const themeHit = (t.theme_keywords || []).find((k) => wordHit(themeText, k));
    if (themeHit) why.push(`主题命中 "${themeHit}"`);
    const matHit = (t.material_keywords || []).find((k) => wordHit(mats, k));
    if (matHit) why.push(`材质命中 "${matHit}"`);
    if (t.price_min != null && price >= t.price_min) why.push(`价格 $${price} ≥ $${t.price_min}（价格容忍：${p.price_tolerance}）`);
    if (t.price_max != null && price > 0 && price <= t.price_max) why.push(`价格 $${price} ≤ $${t.price_max}`);
    if (t.dims?.W_min != null && W >= t.dims.W_min) why.push(`W ${W}cm ≥ ${t.dims.W_min}cm 大件镇宅`);
    if (t.tracks?.length && input.track && t.tracks.includes(input.track)) why.push(`轨道 ${input.track}`);
    if ((input.personas || []).includes(p.id)) why.push("作者显式指定");
    const themeOrMat = Boolean(themeHit || matHit);
    if (why.length) ranked.push({ id: p.id, label: p.label, score: why.length + (themeOrMat ? 1 : 0), theme: themeOrMat, why, persona: p });
  }
  // 排序：加权分（主题/材质命中 ×2——主题决定"这是给谁的"，价格/尺寸只是门槛）→ 同分时主题画像优先
  ranked.sort((a, b) => b.score - a.score || (b.theme ? 1 : 0) - (a.theme ? 1 : 0));
  return ranked;
}

// persona infer 的 DB 直连模式：按 slug 拉真实产品参数反推（宽文本策略，容忍历史结构不一致）
// 真实字段为扁平结构（craftsmanshipText/specifications/specs/at_a_glance/packageDimensionsCm…），noctua 另有 data.data 嵌套
async function productToPersonaInput(slug) {
  const rows = await dbQuery("select slug, name, animal, tagline, description, price, data from products where slug = $1", [slug]);
  if (!rows.length) throw new Error(`产品不存在: ${slug}`);
  const r = rows[0];
  // HTTP SQL 端点把 jsonb 列序列化成字符串——必须先 parse，否则 d.xxx 全是 undefined（曾导致尺寸/材质永远读不到）
  const d = typeof r.data === "string" ? (() => { try { return JSON.parse(r.data) || {}; } catch { return {}; } })() : (r.data || {});
  const nested = d.data && typeof d.data === "object" && !Array.isArray(d.data) ? d.data : {};
  const s = (v) => (typeof v === "string" ? v : v && typeof v === "object" ? JSON.stringify(v) : "");
  const matsRaw = [d.craftsmanshipText, nested.craftsmanshipText, d.interiorContext, nested.interiorContext]
    .filter(Boolean).map(s).join(" ; ");
  // 尺寸只取产品规格：productDimensionsCm（用户提供的真实产品尺寸）优先；packageDimensionsCm 是运输包装尺寸，喂 W_min 会误判"大件"，排除
  const dimsText = [d.productDimensionsCm, nested.productDimensionsCm, d.specifications, d.specs, d.at_a_glance, nested.specifications, nested.specs]
    .filter(Boolean).map(s).join(" ");
  const wide = [r.name, r.tagline, r.animal, r.description, dimsText, matsRaw].filter(Boolean).join(" ").replace(/\s+/g, " ");
  const input = {
    slug: r.slug,
    name: r.name,
    concept: wide.slice(0, 800),
    price: Number(r.price) || null,
    materials: matsRaw ? [{ name: matsRaw.slice(0, 300) }] : [],
    theme_keywords: [],
    // track 不缺省：只有显式知道轨道时才参与匹配，否则"轨道"项会让所有画像白得 1 分
    track: null,
  };
  // 兼容三种写法：W 81cm / 81×62×130 / JSON 序列化后的 "W": 81
  const wm = wide.match(/\bW\s?"?\s*[:：]?\s*(\d{2,4})\s?(?:mm|cm|["']cm["'])?/i) || wide.match(/(\d{2,4})\s?[×x]\s?\d{2,4}\s?[×x]\s?\d{2,4}/);
  if (wm) {
    const n = parseInt(wm[1], 10);
    input.W = n >= 1000 ? Math.round(n / 10) : n; // mm → cm
  }
  return input;
}

function personaReport(ranked) {
  if (!ranked.length) return ["（无画像命中 — 补 theme_keywords/价格/材质输入，或 persona-library 加新画像）"];
  const lines = [];
  for (const r of ranked) {
    const p = r.persona;
    lines.push(`● ${p.id} — ${p.label}（匹配 ${r.score} 项）`);
    r.why.forEach((w) => lines.push(`    · ${w}`));
    lines.push(`    任务 (JTBD): ${p.jtbd}`);
    lines.push(`    核心疑虑: ${p.core_objection}`);
    if (p.psychology) {
      const sc = p.psychology.self_congruity || {};
      lines.push(`    心理结构: ${p.psychology.core_motivation || ""}`);
      if (sc.actual || sc.ideal) lines.push(`    自我一致: 现实「${sc.actual || "—"}」→ 理想「${sc.ideal || "—"}」`);
      if (p.psychology.collector_psychology) lines.push(`    收藏心理: ${p.psychology.collector_psychology}`);
      const be = p.psychology.behavioral_economics || [];
      if (be.length) lines.push(`    行为要素: ${be.map((b) => `${b.factor} → ${b.content_use}`).join(" · ")}`);
      if ((p.psychology.trigger_moments || []).length) lines.push(`    触发时刻: ${p.psychology.trigger_moments.join(" / ")}`);
    }
    if (p.economic_profile) {
      const ep = p.economic_profile, ib = ep.income_benchmark || {}, pp = ep.price_position || {};
      lines.push(`    经济对标: ${pp.verdict || ""}（${pp.math || "—"}）〔${pp.tier || "?"}〕`);
      lines.push(`    经济基准: ${ib.fact || "—"}〔${ib.tier || "?"}〕`);
      if (ep.payment_behavior) lines.push(`    支付行为: ${ep.payment_behavior}`);
    }
    const dist = {};
    for (const e of p.evidence || []) { const t = String(e.tier || "?").toUpperCase(); dist[t] = (dist[t] || 0) + 1; }
    lines.push(`    证据分级: ${Object.entries(dist).map(([t, n]) => `${t}×${n}`).join(" ")}${(p.hypotheses || []).length ? ` · 待验证假设 ${p.hypotheses.length} 条` : ""}`);
    // 降级保护：字段缺失显示占位而不炸报告（闸门层才该 fail loudly，报告层要可用）
    lines.push(`    信任证据优先级: ${(p.trust_evidence_priority || ["（缺 trust_evidence_priority — 补画像 schema）"]).join(" > ")}`);
    lines.push(`    内容角度: ${(p.content_angles || ["（缺 content_angles）"]).join(" / ")}`);
    lines.push(`    出没: ${(p.habitats || ["（缺 habitats）"]).join(", ")}`);
  }
  return lines;
}

// ---------- persona brief：反推管线的第②③步（收集数据 → 从数据提炼主题）----------
// infer 是第④步（拿库内触发器匹配）；brief 把『爬什么、去哪爬、验证什么、这批人怎么搜』变成可重复命令：
// ①产品信号盘点 ②库内命中 ③未覆盖主题信号探针 ④分渠道爬取计划（发现/验证）⑤『会怎么搜』关键词清单 ⑥回填回路
const BRIEF_STOP = new Set(("the a an and or of with for from to in on at is are was were this that it its as by be " +
  "sofa couch chair armchair furniture cm mm kg lbs lb inch inches size made design designed designs new " +
  "our your you we they their his her not can will more most very real true all any each which who what " +
  "frame steel fabric wood foam cover covers seat seats home house living room rooms").split(" "));
function personaBrief(input, plib) {
  const ranked = personaInfer(input, plib);
  const wide = [input.slug, input.name, input.concept, input.track, ...(input.theme_keywords || []),
    ...(input.materials || []).map((m) => (typeof m === "string" ? m : m?.name || ""))].filter(Boolean).join(" ");
  const lines = [];
  lines.push(`== 画像调研简报: ${input.slug || input.name || "(未命名)"}${input.price ? `（$${Number(input.price).toLocaleString()}）` : ""} ==`);
  const sig = [];
  if (input.price) sig.push(`价格 $${Number(input.price).toLocaleString()}`);
  if (input.W) sig.push(`W ${input.W}cm`);
  if (input.track) sig.push(`轨道 ${input.track}`);
  const mats = (input.materials || []).map((m) => (typeof m === "string" ? m : m?.name || "")).filter(Boolean);
  if (mats.length) sig.push(`材质 ${mats.join(" / ").slice(0, 120)}`);
  lines.push(`① 产品信号: ${sig.join(" · ") || "（无 —— 补图+参数输入）"}`);
  const hitIds = ranked.map((r) => r.id);
  lines.push(`② 库内命中: ${hitIds.length ? hitIds.join(", ") : "无 → 需从数据发现新画像（看④[发现]）"}`);
  // 主题信号探针：宽文本分词，剔除停用词与库内已覆盖词，剩下的就是『库里没人接的候选主题』
  const covered = new Set();
  for (const p of plib.personas || []) {
    const t = p.triggers || {};
    [...(t.theme_keywords || []), ...(t.material_keywords || []), ...(p.coverage_tokens || [])]
      .forEach((k) => String(k).toLowerCase().split(/\s+/).forEach((w) => covered.add(w)));
  }
  const freq = new Map();
  for (const w of wide.toLowerCase().match(/[a-z][a-z'-]{2,}/g) || []) {
    if (BRIEF_STOP.has(w) || covered.has(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  const byFreq = [...freq.entries()].sort((a, b) => b[1] - a[1]);
  lines.push(`③ 未覆盖主题信号（候选，需爬取验证）: ${byFreq.length ? byFreq.slice(0, 10).map(([w, n]) => `${w}×${n}`).join(", ") : "（宽文本无新增信号）"}`);
  lines.push("④ 爬取计划:");
  for (const r of ranked.slice(0, 3)) {
    // 查询词优先级：触发主题词 → 角度证据词（coverage_tokens）→ 画像 ID（最后手段）
    const t = r.persona.triggers || {};
    const kw = (t.theme_keywords || t.material_keywords || r.persona.coverage_tokens || [r.id])[0];
    lines.push(`   [验证·${r.id}] 强化/毕业 T4 → \`${kw} sofa review site:reddit.com\` · \`${kw} furniture 开箱 真实\` · TikTok/IG 标签内容盘点`);
  }
  for (const [w] of byFreq.slice(0, 3)) {
    lines.push(`   [发现·${w}] 无画像覆盖 → \`${w} sofa site:reddit.com\` · \`${w} armchair review\` · \`${w} 家具 小红书\` —— 有真实需求信号则建新画像`);
  }
  const primaryP = hitIds.length ? (plib.personas || []).find((p) => p.id === hitIds[0]) : null;
  const tokens = [...new Set([(primaryP?.triggers?.theme_keywords || primaryP?.triggers?.material_keywords || [])[0] || null, ...byFreq.slice(0, 5).map(([w]) => w)].filter(Boolean))].slice(0, 6);
  lines.push("⑤ 会怎么搜（该类人找我们产品的关键词候选 → cannibal/GSC 校验）:");
  for (const t of tokens) lines.push(`   ${t} sofa / ${t} armchair / buy ${t} chair / ${t} furniture`);
  lines.push("⑥ 回填回路: 爬取证据 → persona-library.evidence（带 tier+source）或 t1-evidence → 重跑 persona infer → patch.personas → validate（r12 画像闸门）");
  return lines;
}

// r12/rb11 画像闸门：personas 必填且必须在库；主画像角度证据词覆盖为 WARNING
function personaGate(patch, plib, scope) {
  const issues = [], warns = [];
  const ids = patch.personas;
  if (!Array.isArray(ids) || !ids.length)
    return { issues: [`personas 缺失/为空 — 先跑 persona infer 反推目标买家（${scope} 画像优先纪律）`], warns };
  const known = new Set((plib.personas || []).map((p) => p.id));
  for (const id of ids) if (!known.has(id)) issues.push(`画像 "${id}" 不在 persona-library（可选: ${[...known].join(", ")}）`);
  const primary = (plib.personas || []).find((p) => p.id === ids[0]);
  if (primary && (primary.coverage_tokens || []).length) {
    const hay = JSON.stringify(patch.content || "").toLowerCase();
    const hit = primary.coverage_tokens.some((t) => hay.includes(t.toLowerCase()));
    if (!hit) warns.push(`主画像 ${primary.id} 的角度证据词（${primary.coverage_tokens.join(" / ")}）无一出现在内容 — 内容可能没写给目标买家看`);
  }
  return { issues, warns };
}

// ---------- T1 第一方证据管线 ----------
// NN/g 规矩：画像必须靠一手研究收敛。t1 = 自动甄别自测数据 + 台账 + 假设毕业制度。
const T1CFG = () => readJson(LIB("t1-config.json"));
const T1LEDGER = () => readJson(LIB("t1-evidence.json"));
const isOwnerEmail = (email, cfg) => cfg.owner_emails.some((e) => String(email || "").toLowerCase() === e.toLowerCase());

async function t1Inventory() {
  const cfg = T1CFG();
  const lines = ["== T1 第一方数据盘点（自动甄别自测）=="];
  let ordBy, chatPairs, sess, revs, subs;
  try {
    ordBy = await dbQuery("select email, first_name, last_name, count(*) n, round(avg(total)) avg_total from orders group by email, first_name, last_name order by n desc");
    sess = await dbQuery("select id, source, ip_hash, lead, needs_human, handled, message_count from ai_chat_sessions");
    chatPairs = await dbQuery("select session_id, role, content from ai_chat_messages");
    revs = await dbQuery("select author_name, product_slug, verified, is_published from reviews");
    subs = await dbQuery("select email from newsletter_subscribers");
  } catch (e) {
    return [`DB 不可达: ${e.message}`];
  }
  // 订单甄别
  const totalOrders = ordBy.reduce((s, r) => s + r.n, 0);
  const selfTest = ordBy.filter((r) => isOwnerEmail(r.email, cfg));
  const selfN = selfTest.reduce((s, r) => s + r.n, 0);
  const other = ordBy.filter((r) => !isOwnerEmail(r.email, cfg));
  lines.push(`orders      总 ${totalOrders} · 自测 ${selfN}（${selfTest.map((r) => r.email).join(", ")}）· 存疑/真实 ${totalOrders - selfN}${other.length ? ` → ${other.map((r) => `${r.email}(x${r.n})`).join(", ")}` : ""}`);
  // AI 客服
  const msgsBySess = {};
  for (const m of chatPairs) (msgsBySess[m.session_id] = msgsBySess[m.session_id] || []).push(m);
  const userMsgs = chatPairs.filter((m) => m.role === "user");
  const intent = sess.filter((s) => (s.lead && (s.lead.ready || s.lead.product || s.lead.zip)) || userMsgs.some((m) => m.session_id === s.id && /owl|kong|mofu|meteorite|price|how much|order/i.test(m.content || "")));
  const humanReq = sess.filter((s) => s.needs_human).length;
  lines.push(`ai_chat     会话 ${sess.length} · 访客消息 ${userMsgs.length} · 意向会话 ${intent.length} · 转人工请求 ${humanReq}（needs_human）`);
  // 评论/订阅
  const selfRev = revs.filter((r) => cfg.owner_handles.some((h) => String(r.author_name || "").toLowerCase().includes(h)));
  lines.push(`reviews     ${revs.length} 条 · 疑似自评 ${selfRev.length}（命中 owner 昵称）· 其余 ${revs.length - selfRev.length}`);
  const selfSubs = subs.filter((s) => isOwnerEmail(s.email, cfg));
  lines.push(`newsletter  ${subs.length} · owner ${selfSubs.length} · 真实 ${subs.length - selfSubs.length}`);
  // 咨询漏斗（consult_events：WhatsApp/咨询点击第一方落库，WO-20260914-07）
  try {
    const cev = await dbQuery("select action, count(*) n from consult_events group by 1");
    const cevTotal = cev.reduce((s, r) => s + r.n, 0);
    lines.push(`consult     ${cevTotal} 次咨询点击（${cev.map((r) => `${r.action} x${r.n}`).join(", ") || "空"}）· 成交以 orders 甄别行为准`);
  } catch {
    lines.push("consult     consult_events 表不可达（未建/权限）");
  }
  // 台账摘要
  const led = T1LEDGER();
  lines.push(`t1-evidence 台账 V${String(led.version).replace(/^V/, "")} · ${led.entries.length} 条`);
  return lines;
}

function t1Ledger() {
  const led = T1LEDGER();
  const lines = [`== T1 证据台账（${led.version}）==`, `毕业规则: ${led.promotion_rule}`, ""];
  for (const e of led.entries) {
    lines.push(`● ${e.id} (${e.date}, n=${e.n})`);
    lines.push(`    ${e.claim}`);
    lines.push(`    来源: ${e.source} · 关联: ${e.persona_link?.length ? e.persona_link.join(", ") : "（运营项）"}`);
    if (e.caveat) lines.push(`    注意: ${e.caveat}`);
  }
  return lines;
}

// ---------- 画像库专业度审计（persona audit）----------
// 方法论合规 = Revella Five Rings 五要素 + JTBD + 证据分级（T1–T4）+ 假设强制带验证计划。
// 这是画像的『结构验收』：钢筋有牌号，画像有证据层级。
const R5_FIELDS = ["priority_initiative", "success_factors", "perceived_barriers", "decision_criteria", "buying_journey"];
function personaAudit(plib) {
  const lines = [];
  const dist = { T1: 0, T2: 0, T3: 0, T4: 0 };
  let ok = 0;
  for (const p of plib.personas || []) {
    const probs = [], warns = [];
    if (!p.jtbd) probs.push("缺 JTBD 任务陈述");
    for (const f of R5_FIELDS) if (!p[f] || !String(p[f]).trim()) probs.push(`缺 Revella 要素 ${f}`);
    const evs = p.evidence || [];
    if (!evs.length) probs.push("无证据条目");
    if (!evs.some((e) => ["T1", "T2", "T3"].includes(String(e.tier || "").toUpperCase()))) probs.push("无 T1–T3 级证据（全部是假设级）");
    for (const e of evs) {
      const t = String(e.tier || "").toUpperCase();
      if (t && dist[t] != null) dist[t]++;
      if (!t) warns.push(`证据未标层级: "${(e.claim || "").slice(0, 24)}…"`);
      else if (!e.source) probs.push(`证据缺 source: "${(e.claim || "").slice(0, 24)}…"`);
    }
    for (const h of p.hypotheses || []) if (!h.validation_plan) probs.push(`T4 假设缺 validation_plan: "${(h.claim || "").slice(0, 24)}…"`);
    // V4.5 心理×经济层强校验：心理结构（动机/自我一致/≥1 行为要素带锚）+ 经济对标（基准带出处 + 档位判定）
    const psy = p.psychology;
    if (!psy || !String(psy.core_motivation || "").trim()) probs.push("缺 psychology.core_motivation（心理结构层 V4.5）");
    else {
      const sc = psy.self_congruity || {};
      if (!String(sc.actual || "").trim() || !String(sc.ideal || "").trim()) probs.push("缺 psychology.self_congruity（现实自我/理想自我）");
      const be = psy.behavioral_economics || [];
      if (!be.length) probs.push("缺 psychology.behavioral_economics（行为经济学要素 ≥1）");
      for (const b of be) if (!b.factor || !b.anchor || !b.content_use) probs.push(`行为要素缺 factor/anchor/content_use: "${b.factor || "?"}"`);
    }
    const ep = p.economic_profile;
    if (!ep) probs.push("缺 economic_profile（经济对标层 V4.5）");
    else {
      const ib = ep.income_benchmark || {};
      if (!String(ib.fact || "").trim() || !String(ib.source || "").trim()) probs.push("economic_profile.income_benchmark 缺 fact/source（经济基准必须带出处）");
      if (!String((ep.price_position || {}).verdict || "").trim()) probs.push("economic_profile.price_position 缺 verdict（档位判定）");
    }
    if (!p.evidence_status) probs.push("缺 evidence_status（库规矩）");
    // V4.6 Evidence-Based Buyer Persona：证据级（H1–H4）+ 心理图（七字段）+ 市场信源（五类）
    const lv = String(p.evidence_level || "").toUpperCase();
    if (!/^H[1-4]$/.test(lv)) probs.push("缺 evidence_level（H1–H4）— 推测不可伪装成用户事实");
    else {
      if (lv !== "H1" && !(p.market_signals || []).length) probs.push(`标 ${lv} 但 market_signals 为空 — 市场支持必须给出信源`);
      if (lv === "H3" && !evs.some((e) => String(e.tier).toUpperCase() === "T1")) probs.push("标 H3（行为支持）但无 T1 证据 — H 级虚标");
    }
    for (const s of p.market_signals || [])
      if (!["competitor", "review", "question", "search", "social"].includes(s.type)) probs.push(`market_signals 信源类型非法: "${s.type}"（限五信源）`);
    const bp = p.buyer_psychology || {};
    const sevMissing = ["want", "desire", "fear", "doubt", "trigger", "proof", "action"].filter((k) => !String(bp[k] || "").trim());
    if (sevMissing.length) probs.push(`buyer_psychology 缺字段: ${sevMissing.join(", ")}（七字段必填）`);
    const pb = (p.economic_profile || {}).price_band;
    if (!pb || !(Number(pb.min) > 0) || !(Number(pb.max) >= Number(pb.min || 0))) probs.push("economic_profile.price_band 缺或非法（min/max）— r14 价格带错配检查的依据");
    // V4.7 反循环证伪层（WO-20260914-03）：画像必须定期被挑战；反例只认循环干净通道——
    // 站内互动/页面参与是我们内容塑造过的数据，不得拿来给画像自证清白
    if (!p.falsification_status) probs.push("缺 falsification_status（V4.7 反循环层：UNFALSIFIED≠确认，只是还没被证伪）");
    if (!p.last_challenged) probs.push("缺 last_challenged（V4.7：画像必须定期被挑战）");
    else {
      const days = (Date.now() - new Date(p.last_challenged).getTime()) / 86400000;
      if (days > 60 && !(p.counter_evidence || []).length)
        probs.push(`UNFALSIFIED 已 ${Math.round(days)} 天（>60）且 counter_evidence 为空 — 循环确认风险，先跑反画像挑战`);
    }
    for (const ce of p.counter_evidence || []) {
      if (!ce.source) probs.push("counter_evidence 缺 source（无出处反例=没有反例）");
      if (!["gsc_query", "cs_transcript", "payment_record", "review_text", "external_search"].includes(ce.channel))
        probs.push(`counter_evidence.channel 非法: "${ce.channel}"（限循环干净通道：gsc_query/cs_transcript/payment_record/review_text/external_search）`);
    }
    lines.push(`[${probs.length ? "FAIL" : "PASS"}] ${p.id} — ${p.label}`);
    probs.forEach((x) => lines.push(`      ✗ ${x}`));
    warns.forEach((x) => lines.push(`      ⚠ ${x}`));
    if (!probs.length) ok++;
  }
  const total = (plib.personas || []).length;
  const hDist = {};
  for (const p of plib.personas || []) { const l = String(p.evidence_level || "?").toUpperCase(); hDist[l] = (hDist[l] || 0) + 1; }
  lines.push(`\n画像库专业度: ${ok}/${total} 合规 · 证据分布 T1×${dist.T1} T2×${dist.T2} T3×${dist.T3} T4×${dist.T4} · 证据级 ${Object.entries(hDist).map(([k, v]) => `${k}×${v}`).join(" ")}`);
  lines.push("    T1=一手研究（访谈/订单/GSC/站内对话，过 t1 inventory 自测甄别） T2=社群一手 T3=报告/媒体 T4=假设（只能带 validation_plan 存在，不得直接写进文案）");
  return { ok, total, lines };
}

// r14 一号战略原则闸门：PRODUCT→MARKET→HUMAN→PSYCHOLOGY→CONTENT 对齐
// 检查三断层：①画像必须有证据级（H1–H4，推测不伪装成事实）②画像必须有心理图（七字段）
// ③每节内容必须有心理岗位且与 framework-lock canonical 对齐（内容不是填区块，是回答买家问题）
// ④价格带错配（Premium 产品 × Budget 画像 = 拦截）
function r14Alignment(patch, frame, plib) {
  const issues = [], warns = [];
  const ids = Array.isArray(patch.personas) ? patch.personas : [];
  const ps = (plib.personas || []);
  let anyH2Plus = false;
  for (const id of ids) {
    const p = ps.find((x) => x.id === id);
    if (!p) continue; // 不在库由 r12 拦
    const lv = String(p.evidence_level || "").toUpperCase();
    if (!/^H[1-4]$/.test(lv)) issues.push(`画像 ${id} 缺 evidence_level（H1–H4）— 推测不可伪装成用户事实`);
    if (lv === "H2" || lv === "H3" || lv === "H4") anyH2Plus = true;
    if (lv === "H2" && !(p.market_signals || []).length) issues.push(`画像 ${id} 标 H2（市场支持）但 market_signals 为空 — 市场支持必须给出信源`);
    const bp = p.buyer_psychology || {};
    const seven = ["want", "desire", "fear", "doubt", "trigger", "proof", "action"];
    const missing = seven.filter((k) => !String(bp[k] || "").trim());
    if (missing.length) issues.push(`画像 ${id} 心理图缺字段: ${missing.join(", ")}（buyer_psychology 七字段必填）`);
    const band = (p.economic_profile || {}).price_band;
    if (band && Number(band.min) > 0 && Number(patch.price) > 0) {
      if (patch.price < Number(band.min) || patch.price > Number(band.max))
        issues.push(`价格带错配：$${patch.price} 不在画像 ${id} 的价格带 $${band.min}–${band.max} 内（Premium 产品 × 错档画像 = 内容必然失焦）`);
    }
  }
  if (ids.length && !anyH2Plus) warns.push("全部画像仅 H1 推测级 — published 前需升 H2+（市场数据支持）");
  // 心理岗位卡：14 节每节一张，psychological_job 必须等于 framework-lock canonical
  const canon = Object.fromEntries((frame.sections || []).map((s) => [s.name, (s.psych || {}).psychological_job]));
  const jobs = Array.isArray(patch.psych_jobs) ? patch.psych_jobs : [];
  const seen = new Set();
  for (const j of jobs) {
    seen.add(j.section);
    const c = canon[j.section];
    if (!c) { issues.push(`psych_jobs 出现框架外区块 "${j.section}"`); continue; }
    if (String(j.psychological_job || "").trim() !== c) issues.push(`区块 ${j.section} 心理岗位错位：应为 "${c}"，实为 "${j.psychological_job || "（空）"}"`);
    if (j.persona && !ids.includes(j.persona)) issues.push(`区块 ${j.section} 心理卡指向画像 "${j.persona}" 不在 patch.personas`);
    if (!String(j.desired_action || "").trim()) warns.push(`区块 ${j.section} 缺 desired_action（这一节要让买家做什么？）`);
    if (!(Array.isArray(j.evidence_required) && j.evidence_required.length)) warns.push(`区块 ${j.section} 缺 evidence_required（回答该问题需要什么证据？）`);
  }
  for (const [name, c] of Object.entries(canon))
    if (!seen.has(name)) issues.push(`区块 ${name} 缺心理卡（psychological_job="${c}"）— 每节必须回答一个买家问题`);
  return { issues, warns };
}

// ---------- validate 主流程 ----------
export function validatePatch(patch, plibOverride = null) {
  const frame = FRAME();
  const plib = plibOverride || PERSONAS();
  const results = [];
  const strings = collectStrings({ seo: patch.seo, content: patch.content });
  const push = (id, name, issues, warns = []) => results.push({ id, name, status: issues.length ? "FAIL" : "PASS", issues, warns });
  push("r1", "占位符", r1Placeholders(strings));
  push("r2", "数字溯源", r2Numbers(patch, frame));
  push("r3", "价格字段", patch.price > 0 ? [] : ["price 缺失或 <=0"]);
  push("r4", "用户原话逐字+出处", r4Quote(patch));
  push("r5", "关键词证据（禁假词）", r5Keywords(patch, SEO_LIB()));
  push("r6", "禁词", r6Forbidden(strings, frame));
  const fw = r7Framework(patch, frame);
  push("r7", "框架锁约束", fw.issues, fw.warns);
  push("r8", "信任组 QC 报告", r8Trust(patch, frame));
  push("r9", "交期归级/括号写法", r9Delivery(patch, frame));
  push("r10", "AI vs Real 隔离", r10AiVsReal(patch, frame));
  const so = r11Social(patch, SOCIAL());
  push("r11", "社证数字准入", so.issues, so.warns);
  const pg = personaGate(patch, plib, "PDP");
  push("r12", "买家画像准入（persona-library）", pg.issues, pg.warns);
  push("r13", "图像辨识先行（scene-image-manifest）", r13SceneManifest(patch));
  const r14 = r14Alignment(patch, frame, plib);
  push("r14", "产品-市场-人-心理对齐（一号战略原则）", r14.issues, r14.warns);
  const fail = results.filter((r) => r.status === "FAIL").length;
  const warn = results.flatMap((r) => r.warns);
  return { status: fail ? "FAIL" : "PASS", results, warns: warn };
}

// ---------- verify（线上 DOM 回归） ----------
// 双 UA 抓取：部分字段（Design Story / quote）只在移动端变体渲染，桌面+移动 DOM 拼合后做存在性检查
const MOBILE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const DESKTOP_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
async function fetchHtml(url, ua) {
  const res = await fetch(url, { headers: { "cache-control": "no-cache", "user-agent": ua } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}
async function verifyLive(url, patch) {
  let html, dom;
  try {
    const pair = await Promise.all([fetchHtml(url, DESKTOP_UA), fetchHtml(url, MOBILE_UA)]);
    html = pair[0];
    dom = pair.map((h) => h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "")).join("\n");
  } catch (e) {
    return { status: "FAIL", checks: [{ name: "fetch 页面", ok: false, detail: `${e.message} — 线上服务未启动? node --env-file=.env .output/server/index.mjs` }] };
  }
  const checks = [];
  const add = (name, ok, detail = "") => checks.push({ name, ok, detail });
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  add("title == seo.title", title === patch.seo.title, `${title} vs ${patch.seo.title}`);
  const md = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/)?.[1]
    ?? html.match(/<meta[^>]*content="([^"]*)"[^>]*name="description"/)?.[1];
  add("meta description 匹配", !!md && md.replaceAll("&#x27;", "'") === patch.seo.description, md || "（未找到 meta description）");
  add("H1 在 DOM", dom.includes(patch.seo.h1));
  if (patch.content?.quote) add("用户原话在 DOM", dom.includes(patch.content.quote.text));
  // 场景卡图（2026-09-13 noctua 事故）：patch 带图的卡，线上 payload 必须仍有同一张图（DB 丢 image → 渲染层 filter → 整区空白）
  for (const s of patch.content?.interiorInspirations || []) {
    if (s.image) add(`场景卡图在线上: ${String(s.image).split("/").pop()}`, html.includes(s.image));
  }
  // QC 编号（2026-09-13 铁律#9 裁决）：合法区=产品数据表/白手套/交期备注/FAQ/JSON-LD——可见 DOM 或 Product JSON-LD 任一在场即可
  for (const id of FRAME().trust_kit.qc_reports_required) add(`QC ${id} 在 DOM 或 JSON-LD`, dom.includes(id) || html.includes(id));
  // leadTime（2026-09-13）：原句逐字 或 统一口径三件套（1–3 生产 / 7–14 运输 / 25–35 海运括号）任一渲染方式
  const ltOk = dom.includes(patch.content.leadTime || "�") || (/1[–-]3/.test(dom) && /7[–-]14/.test(dom) && /25[–-]35/.test(dom));
  add("leadTime 在 DOM（原句或统一口径 1–3/7–14/25–35）", ltOk);
  for (const bad of patch.must_not_contain || []) add(`旧文案已清除: ${bad}`, !dom.includes(bad));
  // known_issues: 已上报、待代码修复的线上缺陷 — 出现不判 FAIL（区别于回归），修复后移入 must_not_contain
  for (const ki of patch.known_issues || []) {
    const present = dom.includes(ki.pattern) || html.includes(ki.pattern);
    checks.push({ name: `已知未修复: ${ki.pattern}`, ok: !present, detail: present ? `仍在场 — ${ki.where}` : "已消失（可移入 must_not_contain 固化回归）", known: true });
  }
  add("Product JSON-LD", /"@type"\s*:\s*"Product"/.test(html));
  add("FAQPage JSON-LD", /"@type"\s*:\s*"FAQPage"/.test(html));
  const failed = checks.filter((c) => !c.ok && !c.known);
  return { status: failed.length ? "FAIL" : "PASS", checks };
}

// ---------- library 子命令 ----------
function libShow() {
  for (const [name, file] of [["seo-meta-library", "seo-meta-library.json"], ["social-proof", "social-proof.json"], ["ai-vs-real", "ai-vs-real.json"], ["framework-lock", "framework-lock.json"], ["blog-framework-lock", "blog-framework-lock.json"], ["persona-library", "persona-library.json"], ["t1-evidence", "t1-evidence.json"], ["keyword-library", "keyword-library.json"], ["competitor-library", "competitor-library.json"], ["ai-visibility", "ai-visibility.json"], ["brand-library", "brand-library.json"], ["operator-library", "operator-library.json"]]) {
    const j = readJson(LIB(file));
    const entries = j.verified_entries?.length ?? j.ai_concept_families?.length ?? j.sections?.length ?? j.keyword_clusters_verified?.en?.length ?? j.personas?.length ?? j.keywords?.length ?? j.entries?.length ?? j.prompt_bank?.length ?? j.literature?.length ?? "—";
    log(`${name.padEnd(18)} ${j.version}  entries=${entries}`);
  }
}
function libSearch(term) {
  const t = term.toLowerCase();
  let hits = 0;
  for (const file of ["seo-meta-library.json", "social-proof.json", "ai-vs-real.json", "framework-lock.json", "blog-framework-lock.json", "persona-library.json", "t1-evidence.json", "keyword-library.json", "competitor-library.json", "ai-visibility.json", "brand-library.json", "operator-library.json", "scene-image-manifest.json"]) {
    const walk = (node, trail) => {
      if (typeof node === "string") { if (node.toLowerCase().includes(t)) { log(`${file} :: ${trail}\n    ${node.slice(0, 140)}`); hits++; } return; }
      if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${trail}[${i}]`));
      if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) walk(v, trail ? `${trail}.${k}` : k);
    };
    walk(readJson(LIB(file)), "");
  }
  log(hits ? `\n${hits} 条命中` : "（无命中 — 走爬取回填流程）");
}
const LIB_FILES = { "seo-meta-library": "seo-meta-library.json", "social-proof": "social-proof.json", "ai-vs-real": "ai-vs-real.json", "brand-library": "brand-library.json" };
function bumpVersion(j) {
  const parts = j.version.replace(/^V/, "").split(".").map(Number);
  if (parts.length >= 3) { parts[2] += 1; j.version = `V${parts[0]}.${parts[1]}.${parts[2]}`; } // V4.3.x → 库版本三段式
  else { j.version = `V${parts[0]}.${(Math.round(parts[1] * 10) + 1) / 10}`; }
  j.updated = new Date().toISOString().slice(0, 10);
  return j;
}
function libAdd(libName, file) {
  const target = LIB(LIB_FILES[libName]);
  if (!target) { console.error(`未知库 "${libName}"（可选: ${Object.keys(LIB_FILES).join(" / ")}）`); process.exit(1); }
  const j = readJson(target);
  const entry = readJson(file);
  if (!entry.source || !entry.evidence_status) {
    console.error(`拒绝入库：条目缺 source 或 evidence_status（库规矩：无 source 数字不入库）`);
    process.exit(1);
  }
  if (entry.evidence_status === "user_provided") entry.confirmed = false;
  if (libName === "seo-meta-library") {
    const lang = entry.lang || "en";
    j.keyword_clusters_verified[lang] = j.keyword_clusters_verified[lang] || [];
    j.keyword_clusters_verified[lang].push(entry);
  } else {
    const key = libName === "ai-vs-real" ? "ai_concept_families" : libName === "brand-library" ? "case_studies" : "verified_entries";
    j[key] = j[key] || [];
    j[key].push(entry);
  }
  fs.writeFileSync(target, JSON.stringify(bumpVersion(j), null, 2) + "\n");
  log(`${libName} 回填 1 条 → ${j.version}`);
}
function libBump(libName) {
  const target = LIB(LIB_FILES[libName]);
  if (!target) { console.error(`未知库 "${libName}"`); process.exit(1); }
  const j = bumpVersion(readJson(target));
  fs.writeFileSync(target, JSON.stringify(j, null, 2) + "\n");
  log(`${libName} → ${j.version}`);
}

// ---------- scaffold ----------
function scaffold(input) {
  const frame = FRAME();
  const sea = (input.chargeable_kg ?? 0) > 30;
  const skeleton = {
    slug: input.slug || "[PLACEHOLDER-slug]",
    freight_class: sea ? "sea" : "air",
    chargeable_kg: input.chargeable_kg ?? 0,
    price: input.price ?? 0,
    approved_numbers: [input.W, input.D, input.H, input.SH, input.weight, input.capacity].filter(Boolean),
    seo: {
      title: `[PLACEHOLDER-title ${frame.sections.at(-1).constraints.title_chars.join("-")}chars]`,
      description: "[PLACEHOLDER-meta-description]",
      h1: "[PLACEHOLDER-h1]",
      keywords: [],
    },
    content: {
      tagline: "Atelier Made to Order | AR Room Preview | DDP Worldwide",
      storyHeading: "A Sanctuary of [PLACEHOLDER]",
      storyText: "[PLACEHOLDER-story 含 From Viral AI Concept to Real Atelier 叙事]",
      features: Array.from({ length: 4 }, () => ({ title: "[PLACEHOLDER]", desc: "[PLACEHOLDER]" })),
      materials: (input.materials || []).slice(0, 6).map((m) => (typeof m === "string" ? m : m.name)),
      leadTime: "Made in 1–3 days, delivered in 7–14 days. (Sea freight 25–35 days, not recommended.)",
      leadTimeNote: "Made in 1–3 days — hand-welded frame, hand-polished foam, hand-finished skins — delivered DDP door-to-door in 7–14 days (sea freight 25–35 days, not recommended).",
      faq: Array.from({ length: 4 }, () => ({ question: "[PLACEHOLDER]", answer: "[PLACEHOLDER]" })),
      ldProperties: [{ name: "Dimensions", value: `W${input.W} × D${input.D} × H${input.H} cm, seat height ${input.SH} cm` }],
      interiorImages: ["[PLACEHOLDER-1]", "[PLACEHOLDER-2]", "[PLACEHOLDER-3]"],
      heroImages: [],
      quote: { text: "[PLACEHOLDER 用户原话]", source: "[PLACEHOLDER post-id + 日期]" },
    },
    must_not_contain: [],
  };
  // 画像反推：scaffold 直接产出 personas + 画像报告（写文案前先想清楚写给谁）
  const ranked = personaInfer(input, PERSONAS());
  skeleton.personas = ranked.map((r) => r.id);
  skeleton.persona_report = personaReport(ranked);
  // r14 心理岗位卡：从 framework-lock canonical 自动生成（persona/desired_action 由作者按画像精修）
  skeleton.psych_jobs = (frame.sections || []).map((s) => ({
    section: s.name,
    persona: skeleton.personas[0] || "[PLACEHOLDER-先跑 persona infer]",
    buyer_question: (s.psych || {}).buyer_question ?? "",
    psychological_job: (s.psych || {}).psychological_job ?? "",
    content_goal: (s.psych || {}).content_goal ?? "",
    evidence_required: [],
    desired_action: "[PLACEHOLDER-这一节要让买家做什么]",
  }));
  return skeleton;
}

// ---------- operator intake：OP-01/02/03/04/05 产品驱动逆向推导 ----------
// 一号战略原则（2026-09-13 用户裁决）：Every product starts with itself.
// 市场搜索关键词不能脱离 Product DNA：PRODUCT → MARKET → USER SIGNAL → PERSONA → PSYCHOLOGY → CONTENT。
function operatorIntake(input) {
  const sea = (input.chargeable_kg ?? 0) > 30;
  const maxDim = Math.max(input.W || 0, input.D || 0, input.H || 0);
  const matNames = (input.materials || []).map((m) => (typeof m === "string" ? m : m.name));
  const form = String(input.form || "").toLowerCase();
  const style = String(input.style || "").toLowerCase();
  const formAnimal = /animal|gorilla|ape|owl|cat|bear|dog|tiger|lion|elephant|bird|swan|dino|shark|rhino|熊猫|猫|猩猩|猫头鹰/i.test(`${form} ${input.slug || ""}`);
  const noveltyMat = /fur|plush|boucle|teddy|毛绒/i.test(matNames.join(" "));
  const priceTier = input.price >= 5000 ? "Premium $5k+" : input.price >= 2000 ? "Upper-mid $2–5k" : "Mid <$2k";
  const lines = [`== OP-01/02 PRODUCT DNA — ${input.slug || "[未命名]"}（价格层 ${priceTier}） ==`, ""];
  const rows = [
    ["01 Image", `${(input.images || []).length} 张`],
    ["02 Category", input.category || "（必填）"],
    ["03 Form", input.form || "（必填——决定 Layer A 搜索词）"],
    ["04 Dimensions", `W${input.W} × D${input.D} × H${input.H} cm / SH ${input.SH ?? "?"} cm`],
    ["05 Price", `$${input.price}`],
    ["06 Material", matNames.join(", ") || "—"],
    ["07 Function", input.function || "Seating"],
    ["08 Weight", `${input.weight ?? "?"} kg（chargeable ${input.chargeable_kg ?? "?"} → ${sea ? "sea 海运" : "air"}）`],
    ["09 Craft", input.craft || "hand-built 72–90h"],
    ["10 Color", input.color || "—"],
    ["11 Visual Style", input.style || (formAnimal ? "Sculptural / Novelty" : "Contemporary")],
    ["12 Features", (input.features || []).join(", ") || "—"],
    ["13 Delivery", sea ? "海运层（ETA 25–35 天，不推荐口径 r9）" : "air 7–14 天 DDP"],
    ["14 Known Evidence", "persona infer 命中画像的证据条目（跑 persona brief 输出）"],
  ];
  for (const [k, v] of rows) lines.push(`  ${k.padEnd(16)} ${v}`);
  lines.push("", "  -- DNA 风险轴（决定信任证据优先级与 Layer B–D） --");
  lines.push(`  Visual Impact  ${formAnimal || /sculptural|statement/.test(style) ? "Very High" : "Medium"}`);
  lines.push(`  Uniqueness     ${formAnimal ? "Very High" : "Medium"}`);
  lines.push(`  Trust Risk     ${formAnimal || noveltyMat ? "High — 山寨重灾区，真实工厂/QC 证据必须前置" : "Standard"}`);
  lines.push(`  Delivery Risk  ${sea || maxDim > 120 ? "High — 巨物/海运，白手套叙事必须前置" : "Standard"}`);
  const cat = (input.category || "sofa").toLowerCase();
  lines.push("", "== OP-03 MARKET REVERSE — 四层市场搜索（词不可脱离 DNA） ==");
  lines.push(`  Layer A 直接产品市场: "${form} ${cat}"${formAnimal && form !== cat ? `, "animal ${cat}", "${form} furniture"` : formAnimal ? `, "animal ${cat}"` : ""}`);
  lines.push(`  Layer B 相似产品市场: "${style || "sculptural"} ${cat}", "statement furniture", "art furniture", "collectible furniture"`);
  lines.push(`  Layer C 相同用户市场: "unique interiors", "maximalist furniture", ${noveltyMat ? `"${(matNames[0] || "plush").toLowerCase()} interior"` : '"designer interiors"'}`);
  lines.push(`  Layer D 相同价格市场（${priceTier}·同购买风险·同决策周期）: ${input.price >= 5000 ? '"luxury art interiors", "designer furniture investment", "collectible design"' : input.price >= 2000 ? '"premium accent chair", "designer armchair", "statement piece under $5k"' : '"affordable designer furniture", "unique budget sofa"'}`);
  lines.push("", "== OP-04 USER SIGNAL MINING — 五信源（External Intelligence ≠ Competitor Research） ==");
  lines.push("  ① Competitor: Layer A–B 商家页 — 他们卖什么/定价/承诺");
  lines.push("  ② User Reviews: 同类产品评价 — 用户喜欢什么（差评=我们的机会）");
  lines.push("  ③ User Questions: Q&A/论坛提问 — 用户害怕什么（心理图 fear/doubt 直接来源）");
  lines.push("  ④ Search Intent: Trends/联想词 — 用户主动找什么（r5 关键词候选）");
  lines.push("  ⑤ Social Discussion: 社群讨论 — 用户如何描述欲望（r4 原话引用候选）");
  lines.push("", "== OP-05 PERSONA SKELETON（H1 推测级 — 升 H2 前禁止作为事实引用） ==");
  lines.push("  want:[ ] desire:[ ] fear:[ ] doubt:[ ] trigger:[ ] proof:[ ] action:[ ]");
  lines.push("  升级: H1 →(市场数据)→ H2 →(T1 行为)→ H3 →(订单/售后)→ H4 · 入库过 persona audit");
  return lines;
}

// ---------- Blog 生产线（journal.same 模式：框架锁 + 活库 + 爬数据 + 闸门 + 回归） ----------
const BLOGF = () => readJson(LIB("blog-framework-lock.json"));
const SPB = () => readJson(LIB("social-playbook.json"));

// DB 只读（rb7 内链校验 / blog-verify 前置）。写库走独立补丁脚本，工具箱不写生产表。
let _dbHeaders = null;
async function dbQuery(sql, params = []) {
  if (!_dbHeaders) {
    const env = fs.readFileSync(path.join(ROOT, ".env"), "utf8");
    const m = env.match(/^DATABASE_URL="?([^"\r\n]+)"?/m);
    if (!m) throw new Error(".env 无 DATABASE_URL");
    const url = new URL(m[1].trim());
    _dbHeaders = { "Content-Type": "application/json" };
    _dbHeaders.Authorization = "Basic " + Buffer.from(
      `${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`
    ).toString("base64");
    _dbHeaders.__endpoint = url.origin + url.pathname + url.search;
  }
  const res = await fetch(_dbHeaders.__endpoint, {
    method: "POST",
    headers: { "Content-Type": _dbHeaders["Content-Type"], Authorization: _dbHeaders.Authorization },
    body: JSON.stringify({ sql, query: sql, params }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`db error ${res.status}: ${text.slice(0, 200)}`);
  return JSON.parse(text || "{}").rows || [];
}

const mdLinks = (md) => [...md.matchAll(/\[[^\]]*\]\(([^)\s]+)[^)]*\)/g)].map((m) => m[1]);
const h2List = (md) => md.match(/^## (?!#).*$/gm) || [];
const normLink = (u) => String(u).replace(/^https?:\/\/(www\.)?fuzzsofa\.com/, "").split("?")[0].split("#")[0];

// rb1 占位符（title/excerpt/content）
const rb1Blog = (patch) => r1Placeholders([
  { trail: "title", text: patch.title || "" },
  { trail: "excerpt", text: patch.excerpt || "" },
  { trail: "content", text: patch.content || "" },
]);

// rb2 无出处不主张 + 来源白名单
function rb2Sourcing(patch, frame) {
  const issues = [];
  const allow = new Set([
    ...frame.trust_kit.trusted_numbers,
    ...(patch.approved_numbers || []),
  ]);
  for (const m of frame.trust_kit.trusted_money) {
    const v = parseFloat(String(m).replace(/[^\d.]/g, ""));
    if (Number.isFinite(v)) allow.add(v);
  }
  const srcUrls = new Set((patch.sources || []).map((s) => s.url));
  for (const u of mdLinks(patch.content)) {
    if (/^(https?:)?\/\//.test(u) && !u.includes("fuzzsofa.com") && !srcUrls.has(u))
      issues.push(`外链不在 sources 白名单: ${u}`);
  }
  const paras = patch.content.split(/\n\s*\n/);
  paras.forEach((para, pi) => {
    if (/^#{1,6}\s/.test(para.trim()) && !/\d/.test(para.replace(/^#+\s*/, "").replace(/(18|19|20)\d{2}/g, ""))) return;
    for (const n of extractClaimNumbers(para)) {
      if (allow.has(n.value) || (n.mantissa !== undefined && allow.has(n.mantissa))) continue;
      const paraLinks = mdLinks(para).filter((u) => srcUrls.has(u));
      if (!paraLinks.length) issues.push(`第 ${pi + 1} 段：数字 "${n.raw}" 无出处（不在信任组，段内无 sources 白名单链接）`);
    }
  });
  return [...new Set(issues)];
}

// rb3/rb6 结构与 SEO 长度（title 拼后缀 ≤60 / excerpt=meta description / 分类法 / H2 / 表格禁用 / 关键词进前100词）
function rb6Structure(patch, bf) {
  const issues = [];
  const c = bf.content_contract;
  if (!c.categories.includes(patch.category)) issues.push(`category "${patch.category}" 不在既有分类法（${c.categories.join("/")}）`);
  const tc = codepoints(patch.title);
  if (tc < c.title_chars[0] || tc > c.title_chars[1]) issues.push(`title ${tc} 字符（要求 ${c.title_chars[0]}-${c.title_chars[1]}，拼 head 后缀 22 字符后 SERP 总长 ≤60）`);
  const ec = codepoints(patch.excerpt);
  if (ec < c.excerpt_chars[0] || ec > c.excerpt_chars[1]) issues.push(`excerpt ${ec} 字符（= meta description，要求 ${c.excerpt_chars[0]}-${c.excerpt_chars[1]}）`);
  if (!patch.image || !/^(https?:\/\/|\/)/.test(patch.image)) issues.push("hero 图缺失或非 URL");
  const h2s = h2List(patch.content);
  if (h2s.length < c.h2_sections[0] || h2s.length > c.h2_sections[1]) issues.push(`H2 段 ${h2s.length}（要求 ${c.h2_sections[0]}-${c.h2_sections[1]}）`);
  if (/^#\s/m.test(patch.content)) issues.push("正文含 h1 — H1 由 title 字段渲染，正文从 h2 起");
  if (/\|.+\|\s*\n\|[-| :]+\|/.test(patch.content)) issues.push("markdown 表格不被渲染器支持（react-markdown 非 GFM）");
  if (patch.target_keyword) {
    const first100 = patch.content.replace(/^#+\s*/gm, " ").replace(/[#>*`_]/g, " ").split(/\s+/).filter(Boolean).slice(0, 100).join(" ").toLowerCase();
    if (!first100.includes(patch.target_keyword.toLowerCase())) issues.push(`目标关键词 "${patch.target_keyword}" 未出现在正文前 100 词`);
  }
  return issues;
}

// rb4 关键词证据（blog 版：目标关键词必须有库内证据；deprecated 假词禁入 title/excerpt/H2）
function rb4BlogKeywords(patch, seoLib) {
  const issues = [];
  const deprecated = (seoLib.keyword_clusters_verified?.deprecated_fake_words || []).map((d) => d.keyword.toLowerCase());
  const meta = `${patch.title}\n${patch.excerpt}`.toLowerCase();
  const h2s = h2List(patch.content).join("\n").toLowerCase();
  for (const d of deprecated) {
    if (meta.includes(d)) issues.push(`deprecated 假词 "${d}" 出现在 title/excerpt`);
    if (h2s.includes(d)) issues.push(`deprecated 假词 "${d}" 出现在 H2`);
  }
  const clusterWords = new Set();
  for (const g of ["en", "cn"]) for (const k of seoLib.keyword_clusters_verified?.[g] || []) clusterWords.add(k.keyword.toLowerCase());
  const tk = (patch.target_keyword || "").toLowerCase();
  if (tk && ![...clusterWords].some((c) => c === tk || c.includes(tk) || tk.includes(c)))
    issues.push(`目标关键词 "${patch.target_keyword}" 库内无证据条目 — 先爬取回填库（+0.1）再写文`);
  return issues;
}

// rb7 内链有效性（DB 实查：产品 slug 必须存在；journal 内链必须指向 published 文章）
async function rb7InternalLinks(patch, bf) {
  const issues = [];
  const links = mdLinks(patch.content).map(normLink);
  let prodRows, artRows;
  try {
    prodRows = await dbQuery("select slug from products");
    artRows = await dbQuery("select slug from site_articles where status = 'published'");
  } catch (e) {
    return [`内链校验失败（DB 不可达）: ${e.message}`];
  }
  const prodSlugs = new Set(prodRows.map((r) => r.slug));
  const journalSlugs = new Set(artRows.map((r) => r.slug));
  let prodLinks = 0, journalLinks = 0;
  for (const u of links) {
    const pm = u.match(/^\/(?:en\/)?products\/([^/]+?)(?:\.html)?\/?$/);
    const jm = u.match(/^\/(?:en\/)?journal\/([^/]+?)(?:\.html)?\/?$/);
    if (pm) { prodLinks++; if (!prodSlugs.has(pm[1])) issues.push(`产品内链指向不存在的产品: ${pm[1]}`); }
    else if (jm) { journalLinks++; if (!journalSlugs.has(jm[1])) issues.push(`Journal 内链指向不存在或未发布文章: ${jm[1]}`); }
    else if (!/^https?:\/\//.test(u) && !bf.content_contract.internal_static_links_allowlist.includes(u))
      issues.push(`未识别的内链（不在静态白名单）: ${u}`);
  }
  const c = bf.content_contract;
  if (prodLinks < c.product_links_min) issues.push(`产品内链 ${prodLinks} 条 < ${c.product_links_min}（结合产品契约）`);
  if (journalLinks < c.journal_links_min) issues.push(`Journal 内链 ${journalLinks} 条 < ${c.journal_links_min}（话题簇契约）`);
  return issues;
}

// rb8 交期口径（blog 版：提到 delivery 就必须统一口径；9–17 废止）
function rb8BlogDelivery(patch, frame) {
  if (!/\b(days?|delivery|ddp|天|收货)\b/i.test(`${patch.content}\n${patch.excerpt}`)) return [];
  const c = patch.content || "";
  const issues = [];
  if (new RegExp(`9${DASH}17`).test(c)) issues.push("旧口径 9–17 天残留（2026-09-12 废止，统一为 1–3 天生产 + 7–14 天运输）");
  if (!new RegExp(`1${DASH}3`).test(c) || !new RegExp(`7${DASH}14`).test(c))
    issues.push("正文提到 delivery/days 但缺统一口径（1–3 天生产 + 7–14 天运输）");
  return issues;
}

// rb9 AI vs Real（blog 版：meta 层禁 AI 对象；正文提及必须带标注词）
function rb9BlogAi(patch, frame) {
  const issues = [];
  const meta = `${patch.title}\n${patch.excerpt}`.toLowerCase();
  for (const subj of frame.ai_subjects) {
    if (new RegExp(subj.replace(/ /g, "\\s+"), "i").test(meta))
      issues.push(`AI 概念对象 "${subj}" 不得进入 title/excerpt（meta 层禁用）`);
  }
  const body = patch.content.toLowerCase();
  const hasSubject = frame.ai_subjects.some((s) => new RegExp(s.replace(/ /g, "\\s+"), "i").test(body));
  if (hasSubject && !frame.ai_label_tokens.some((lb) => body.includes(lb.toLowerCase())))
    issues.push("正文提到 AI 概念对象但缺 AI 标注词（AI-generated / viral AI …）— 不把 AI 当真");
  return issues;
}

// rb10 社证数字（blog 版：user_provided 必须挂 sources 且保持 WARNING；无库条目即 FAIL）
function rb10BlogSocial(patch, social) {
  const issues = [], warns = [];
  const verified = JSON.stringify(social.verified_entries || {}).toLowerCase();
  for (const [tok, id] of Object.entries(SOCIAL_TOKENS)) {
    if (!patch.content.includes(tok)) continue;
    const entry = (social.user_provided_pending || []).find((e) => e.id === id);
    if (entry) {
      const inSrc = (patch.sources || []).some((s) => `${s.backs || ""} ${s.label || ""}`.includes(tok));
      warns.push(`社证数字 ${tok} 为 user_provided 未确认 — 引用需用户书面确认后回填库`);
      if (!inSrc) issues.push(`社证数字 ${tok}（user_provided）必须挂 sources 条目（含链接）`);
    } else if (!verified.includes(tok.toLowerCase())) {
      issues.push(`社证数字 ${tok} 库内无 verified 条目 — 先入库再引用`);
    }
  }
  return { issues, warns };
}

// rb12 社交出口块（social-playbook：blog 是母体，社交是出口；链接强制挂本 blog slug + UTM）。
// 无 social 块 = 存量文章，不拦；有块才逐条校验。只拦结构，判断靠人。
// 实数承诺（描述/caption 层）：公制 WxDxH 或人类单位（ft/in/lbs/kg/m）皆可
// 标题层 2026-09-26 站主裁决改制：标题=钩子（好奇缺口/价值承诺），实数不进标题
const RB12_DIMS = /\d{2,3}\s*[x×]\s*\d{2,3}\s*[x×]\s*\d{2,3}|\d+(\.\d+)?\s*(ft|in|lbs|kg|m)\b/i;
function rb12SocialOutlet(patch, spb) {
  const s = patch.social;
  if (!s || typeof s !== "object") return { issues: [], warns: [] };
  const issues = [];
  const banned = spb.banned_terms || [];
  const hitBanned = (t) => banned.filter((b) => String(t || "").toLowerCase().includes(b.toLowerCase()));
  const linkIssue = (u, platform, tag) => {
    if (!u) return `${tag} 链接缺失`;
    const norm = String(u).replace(/^https?:\/\/(www\.)?fuzzsofa\.com/i, "");
    if (!norm.includes(`/journal/${patch.slug}`)) return `${tag} 链接必须挂本 blog slug（/journal/${patch.slug}）——首页/异页链接=13点击0出站复辟`;
    if (!String(u).includes(`utm_source=${platform}`)) return `${tag} 链接缺 utm_source=${platform}（第一方归因断链）`;
    return null;
  };
  // Pinterest：问句 + WDH + 禁词 + 链接 + 长度 + 图
  const pin = s.pinterest || {};
  if (!Array.isArray(pin.days) || !pin.days.length) issues.push("pinterest.days 缺失（21:00 ET 日更排期卡）");
  for (const [i, d] of (pin.days || []).entries()) {
    const tag = `pinterest.days[${i}]`;
    const title = String(d.title || "");
    if (!title.trim()) issues.push(`${tag} 标题缺失`);
    // 2026-09-26 钩子制：标题=好奇缺口或价值承诺（≤100 字符由 spec_limits 把关）；实数承诺下沉到描述层（RB12_DIMS 仍查描述）
    if (d.description && !RB12_DIMS.test(d.description)) issues.push(`${tag} 描述必含真实测量值（WxDxH 或 ft/in/lbs）——实数是「AI or real」疑虑的物理证明（可放标题则更佳，但不强制）`);
    const b = hitBanned(`${title} ${d.description || ""}`);
    if (b.length) issues.push(`${tag} 踩禁词「${b.join("、")}」（social-playbook banned_terms）`);
    const lk = linkIssue(d.link, "pinterest", tag);
    if (lk) issues.push(lk);
    if ((d.description || "").length > 500) issues.push(`${tag} 描述超 500 字符（Pinterest 上限）`);
    if (!d.description) issues.push(`${tag} 缺规格描述（W/D/H/seat/承重/包体/材质 + 链接）`);
    if (!d.image) issues.push(`${tag} 缺 1000x1500 图`);
  }
  // Instagram：caption 四要素 + Reel 4 镜
  const ig = s.instagram || {};
  const cap = String(ig.caption || "");
  if (!cap) issues.push("instagram.caption 缺失");
  else {
    if (!/\?/.test(cap)) issues.push("instagram.caption 缺问句钩子");
    if (!RB12_DIMS.test(cap)) issues.push("instagram.caption 必含真实测量值（WxDxH 或 ft/lbs 等人类单位）");
    if (!/comment\s+real/i.test(cap)) issues.push("instagram.caption 缺 Comment REAL CTA（评论喂 inbox，人工回禁自动 DM）");
  }
  if (!Array.isArray(ig.reel?.shots) || ig.reel.shots.length !== 4) issues.push("instagram.reel.shots 必须 4 镜（01线稿→02泡沫→03蒙皮→04场景）");
  // Facebook：≤80 字符 + 链接
  const fb = s.facebook || {};
  if (!fb.text) issues.push("facebook.text 缺失");
  else if (fb.text.length > (spb.spec_limits?.facebook?.text_chars ?? 80)) issues.push(`facebook.text 超 ${spb.spec_limits?.facebook?.text_chars ?? 80} 字符`);
  const fblk = linkIssue(fb.link, "facebook", "facebook");
  if (fblk) issues.push(fblk);
  return { issues, warns: [] };
}

// blog 主校验（异步：rb7 需 DB）
export async function blogValidate(patch) {
  const frame = FRAME(), bf = BLOGF();
  const results = [];
  const push = (id, name, issues, warns = []) => results.push({ id, name, status: issues.length ? "FAIL" : "PASS", issues, warns });
  push("rb1", "占位符", rb1Blog(patch));
  push("rb2", "无出处不主张 + 来源白名单", rb2Sourcing(patch, frame));
  push("rb3", "基础字段", [!patch.slug && "slug 缺失", !patch.status && "status 缺失（draft|published）", !patch.title && "title 缺失"].filter(Boolean));
  push("rb4", "关键词证据（库内目标词+禁假词）", rb4BlogKeywords(patch, SEO_LIB()));
  push("rb5", "禁词", r6Forbidden([
    { trail: "title", text: patch.title || "" },
    { trail: "excerpt", text: patch.excerpt || "" },
    { trail: "content", text: patch.content || "" },
  ], frame));
  push("rb6", "框架锁结构（分类/长度/H2/渲染器限制/前100词）", rb6Structure(patch, bf));
  push("rb7", "内链有效性（DB 实查）", await rb7InternalLinks(patch, bf));
  push("rb8", "交期口径", rb8BlogDelivery(patch, frame));
  push("rb9", "AI vs Real（meta 禁用+正文标注）", rb9BlogAi(patch, frame));
  const so = rb10BlogSocial(patch, SOCIAL());
  push("rb10", "社证数字准入", so.issues, so.warns);
  const pg = personaGate(patch, PERSONAS(), "Blog");
  push("rb11", "买家画像准入（persona-library）", pg.issues, pg.warns);
  const so12 = rb12SocialOutlet(patch, SPB());
  push("rb12", "社交出口块（social-playbook）", so12.issues, so12.warns);
  push("rb13", "声音护栏禁词族（V8：factory/镀锌/包装箱/hand-sculpted/评论送）", rb13VoiceGuard(patch));
  push("rb14", "IG caption 链接纪律（https 限流-80%，走 Bio+DM）", rb14IgLinkDiscipline(patch));
  const fail = results.filter((r) => r.status === "FAIL").length;
  return { status: fail ? "FAIL" : "PASS", results, warns: results.flatMap((r) => r.warns) };
}

// rb13 声音护栏（V8 养料，站主 2026-09-26 裁决）：社交卡面禁词族——factory/工厂类目毒词、
// Galvanized/镀锌/包装箱/crate/1-3 天=淘宝参数不上社媒、hand-sculpted=整体手工雕塑（铁律#4）、评论X送Y 诱导
const RB13_BAN = [
  /factory/i, /工厂/, /galvanized/i, /镀锌/, /包装箱/, /ships? in a crate/i, /crate dim/i,
  /handmade to order in 1-3 days/i, /1-3天内完成/, /hand-sculpted/i, /整体手工雕刻/, /手工雕塑/,
  /评论.{0,6}送/, /送.{0,8}(视频|工厂)/, /(send|get).{0,20}factory/i,
];
function rb13VoiceGuard(patch) {
  const issues = [];
  const s = patch.social || {};
  const texts = [];
  for (const d of (s.pinterest?.days || [])) texts.push([d.title, d.description, d.image_note]);
  if (s.instagram?.caption) texts.push([s.instagram.caption]);
  if (s.facebook?.text) texts.push([s.facebook.text]);
  for (const [i, group] of texts.entries()) {
    for (const piece of group) {
      const str = String(piece || "");
      if (!str) continue;
      for (const re of RB13_BAN) {
        const m = str.match(re);
        if (m) {
          issues.push("社交卡面[" + i + "] 踩 V8 声音护栏禁词「" + m[0] + "」——factory=廉价池毒词/淘宝参数不上社媒/hand-sculpted 禁(铁律#4)；替代=Shanghai atelier · hand-finished · 证据数字(200kg/300kg/5.5x)");
          break;
        }
      }
    }
  }
  return issues;
}
// rb14 IG caption 链接纪律（V8：caption 挂 https:// 限流 -80%——链接走 Bio+DM）
function rb14IgLinkDiscipline(patch) {
  const issues = [];
  const cap = String(patch.social?.instagram?.caption || "");
  if (cap && /https?:\/\//i.test(cap)) issues.push("instagram.caption 含 https:// ——IG 检出挂链限流 -80%；链接只走 Bio + 私信喂（rb14）");
  return issues;
}
// blog-scaffold（画像感知：H2 槽位由反推出的画像内容角度生成 — 写给谁，决定写什么）
function blogScaffold(input) {
  const bf = BLOGF();
  const ranked = personaInfer(input, PERSONAS());
  const personaBlocks = ranked.slice(0, 3).map((r) =>
    `## [PLACEHOLDER-${r.persona.label}角度：${r.persona.content_angles[0]}｜信任证据走：${r.persona.trust_evidence_priority[0]}]`);
  return {
    slug: input.slug || "[PLACEHOLDER-slug]",
    category: input.category || "Trends",
    status: "draft",
    title: `[PLACEHOLDER-title ${bf.content_contract.title_chars.join("-")}chars]`,
    excerpt: `[PLACEHOLDER-meta-description ${bf.content_contract.excerpt_chars.join("-")}chars]`,
    image: input.image || "[PLACEHOLDER-hero-image-url]",
    content: [
      `[PLACEHOLDER-lede：目标关键词进前 100 词；钩子对准主画像 ${ranked[0]?.persona.label ?? "（persona infer 无命中 — 补 theme_keywords）"}]`,
      `## [PLACEHOLDER-数据段：搜索/市场数据，每段数字挂 sources 链接]`,
      ...personaBlocks,
      `## [PLACEHOLDER-AI vs Real 段：标注词必须出现（仅当主题涉及 AI 概念对象）]`,
      `## [PLACEHOLDER-产品段：≥2 条 /en/products/<slug> 内链]`,
      `## [PLACEHOLDER-话题簇段：≥2 条 /journal/<slug>.html canonical 内链]`,
      `## [PLACEHOLDER-收货口径段：9–17（海运除外 25–35）或 25–35]`,
    ].join("\n\n"),
    target_keyword: input.target_keyword || "[PLACEHOLDER-目标关键词]",
    personas: ranked.map((r) => r.id),
    persona_report: personaReport(ranked),
    approved_numbers: [],
    sources: [{ url: "[PLACEHOLDER]", label: "[PLACEHOLDER]", backs: "[PLACEHOLDER]" }],
  };
}

// blog-verify：线上 DOM 回归（仅 published 可验）
async function blogVerify(url, patch) {
  let html, dom;
  try {
    const pair = await Promise.all([fetchHtml(url, DESKTOP_UA), fetchHtml(url, MOBILE_UA)]);
    html = pair[0];
    dom = pair.map((h) => h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "")).join("\n");
  } catch (e) {
    return { status: "FAIL", checks: [{ name: "fetch 页面", ok: false, detail: `${e.message}` }] };
  }
  const checks = [];
  const add = (name, ok, detail = "") => checks.push({ name, ok, detail });
  add("title 含文章标题", html.includes(patch.title), html.match(/<title>([^<]*)<\/title>/)?.[1] || "");
  const md = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/)?.[1]
    ?? html.match(/<meta[^>]*content="([^"]*)"[^>]*name="description"/)?.[1];
  add("meta description == excerpt", !!md && md.replaceAll("&#x27;", "'") === patch.excerpt, md || "（未找到）");
  add("H1 在 DOM", dom.includes(patch.title));
  for (const h2 of h2List(patch.content)) add(`H2 在 DOM: ${h2.slice(3, 48)}`, dom.includes(h2.slice(3).trim()));
  for (const s of (patch.sources || []).slice(0, 5)) add(`来源链接在 DOM: ${new URL(s.url).hostname}`, dom.includes(s.url));
  add("Article JSON-LD", /"@type"\s*:\s*"Article"/.test(html));
  const failed = checks.filter((c) => !c.ok);
  return { status: failed.length ? "FAIL" : "PASS", checks };
}

// ---------- 内容评分 0–100（P1）----------
// 权重 = 规则重要性：FAIL 扣满、WARNING 扣半；关键词落位与（评分制内的）画像覆盖单列。
const SCORE_W = {
  pdp: { r1: 4, r2: 20, r3: 2, r4: 8, r5: 8, r5c: 4, r6: 6, r7: 15, r8: 6, r9: 8, r10: 8, r11: 4, r12: 7, r13: 4 },
  blog: { rb1: 4, rb2: 20, rb3: 3, rb4: 8, rb4c: 4, rb5: 6, rb6: 15, rb7: 10, rb8: 8, rb9: 8, rb10: 4, rb11: 10, rb13: 6, rb14: 4 },
};
const isBlogPatch = (p) => typeof p.content === "string";

function keywordCoverage(patch, mode) {
  if (mode === "blog") {
    const tk = (patch.target_keyword || "").toLowerCase();
    if (!tk) return { frac: 0, note: "无目标关键词" };
    const spots = [
      ["title", (patch.title || "").toLowerCase().includes(tk)],
      ["excerpt", (patch.excerpt || "").toLowerCase().includes(tk)],
      ["H2", h2List(patch.content).join("\n").toLowerCase().includes(tk)],
    ].filter(([, ok]) => ok);
    return { frac: spots.length / 3, note: spots.map(([s]) => s).join("+") || "仅正文" };
  }
  const kws = (patch.seo?.keywords || []).map((k) => k.toLowerCase());
  if (!kws.length) return { frac: 0, note: "无关键词" };
  const hay = [patch.seo?.title, patch.seo?.description, patch.seo?.h1, patch.content?.storyText, patch.content?.tagline]
    .filter(Boolean).join("\n").toLowerCase();
  const hits = kws.filter((k) => hay.includes(k) || k.split(/\s+/).every((w) => hay.includes(w)));
  return { frac: hits.length / kws.length, note: `${hits.length}/${kws.length} 落位 title/desc/H1/story` };
}

// ---------- 欲望三查(score v2,2026-09-30:sales-intent-backlog A 项)----------
// 防御闸验「对不对」,欲望查验「想不想买」。启发式标记表在 sales-intent-rules.json,
// 未命中=扣分+提示人工复看(AI 无法穷尽好文案,此查只拦死胡同不定义好文案)。
function desireCheck(patch, mode) {
  let rules;
  try { rules = readJson(LIB("sales-intent-rules.json")).desire_checks; }
  catch { return { misses: [], note: "sales-intent-rules.json 缺失,欲望三查跳过" }; }
  const body = String(patch.content || "") + "\n" + String(patch.title || "") + "\n" + String(patch.excerpt || "");
  const storyExtra = [patch.content?.storyText, patch.content?.tagline].filter(Boolean).join("\n");
  const hay = body + (storyExtra ? "\n" + storyExtra : "");
  const misses = [];
  // 画面感:体感标记 或 明喻句式
  const v = rules.vivid;
  const vividHit = v.markers_en.some((m) => hay.toLowerCase().includes(m.toLowerCase()))
    || v.simile_patterns.some((p) => new RegExp(p, "i").test(hay));
  if (!vividHit) misses.push(`欲望-画面感钩子 −5(无体感标记/明喻句——人工复看是否确无画面感)`);
  // 对比:签名句公式或显式对照词
  const c = rules.contrast;
  const contrastHit = c.patterns_en.some((p) => new RegExp(p, "i").test(hay))
    || c.patterns_cn.some((p) => new RegExp(p).test(hay));
  if (!contrastHit) misses.push(`欲望-对比结构 −5(无对照结构——加「多数同类 X / 我们 Y」或对标物)`);
  // Offer:下一步动作可见
  const o = rules.offer;
  const offerHit = o.markers.some((m) => hay.toLowerCase().includes(m.toLowerCase()));
  if (!offerHit) misses.push(`欲望-Offer 清晰度 −5(无可见下一步——DM 照片/加购/trade@ 至少其一)`);
  return { misses };
}

function scoreFromValidation(validation, patch, mode) {
  const W = SCORE_W[mode];
  let score = 100;
  const detail = [];
  for (const r of validation.results) {
    const w = W[r.id];
    if (w == null) continue;
    const lost = r.status === "FAIL" ? w : r.warns?.length ? w / 2 : 0;
    if (lost) { score -= lost; detail.push(`${r.id} ${r.name} ${r.status === "FAIL" ? "FAIL" : "WARNING"} −${lost}`); }
  }
  const cw = mode === "blog" ? W.rb4c : W.r5c;
  const cov = keywordCoverage(patch, mode);
  const earned = Math.round(cw * cov.frac * 10) / 10;
  if (earned < cw) { score -= cw - earned; detail.push(`关键词落位 ${cov.note} −${(cw - earned).toFixed(1)}`); }
  // 欲望三查(score v2):画面感/对比/offer 各 5 分
  const desire = desireCheck(patch, mode);
  for (const m of desire.misses) {
    const w = parseFloat((m.match(/−(\d+(?:\.\d+)?)/) || [])[1] || "5");
    score -= w; detail.push(m);
  }
  score = Math.max(0, Math.round(score * 10) / 10);
  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : "D";
  return { score, grade, detail };
}


// ---------- craft-scan(跨页工艺话术一致性闸,2026-10-01 产品化)----------
// 起因:旧文 120 hours 整体手工雕刻话术漏网(单页闸满分,跨页零拦截)。
// 特征表:工艺动词诚实制(铁律4)+工时叙事废止(r9)。命中=FAIL(exit 1)。
// ⚠️ 白名单:hand-welded/hand-sewn/hand-finished/hand-polished(允许的细节动词)。
const CRAFT_PATTERNS = [
  "120 hours", "hours of precise", "hand-sculpt", "hand-sculpting",
  "carved by hand", "hand carved", "hand-crafted", "handcrafted",
  "hours of hand", "手工雕刻", "纯手工",
];
async function craftScan() {
  const pats = CRAFT_PATTERNS.map((p) => p.toLowerCase());
  const tables = [
    ["site_articles", "slug", "content"],
    ["products", "slug", "data::text"],
    ["content_blocks", "key", "value::text"],
    ["site_pages", "path", "data::text"],
  ];
  let fail = 0;
  for (const [table, idcol, textcol] of tables) {
    for (const pat of pats) {
      try {
        const r = await dbQuery(
          `select ${idcol} as id, strpos(lower(${textcol}), $1) as pos from ${table} where lower(${textcol}) like '%' || $1 || '%'`,
          [pat],
        );
        const rows = Array.isArray(r?.rows) ? r.rows : (Array.isArray(r) ? r : []);
        for (const row of rows) {
          if (!row.pos) continue;
          const f = await dbQuery(
            `select substring(${textcol}, greatest(1, strpos(lower(${textcol}), $1)-60), 140) as ctx from ${table} where ${idcol}=$2`,
            [pat, row.id],
          );
          fail++;
          console.log(`✗ [${table}/${row.id}] "${pat}"
    …${(f.rows[0].ctx || "").replace(/\s+/g, " ")}…`);
        }
      } catch (e) {
        console.log(`⚠ [${table}] 扫描跳过: ${e.message}`);
      }
    }
  }
  console.log(fail ? `\nCRAFT SCAN: FAIL(${fail} 处跨页漂移)` : `\nCRAFT SCAN: CLEAN(全库工艺话术一致)`);
  process.exit(fail ? 1 : 0);
}

// ---------- 关键词蚕食检测（P1，DB 实查）----------
// 谁在持有这个词：PDP（商业意图持有者）vs published/draft 文章。≥2 篇文章同抢一词 = CONFLICT。
async function cannibalCheck(patch, mode) {
  const kws = mode === "blog" ? [patch.target_keyword].filter(Boolean) : (patch.seo?.keywords || []);
  if (!kws.length) return { lines: ["无关键词可查"], level: "CLEAR" };
  let prodRows, artRows;
  try {
    prodRows = await dbQuery("select slug, data->'seo' as seo from products");
    artRows = await dbQuery("select slug, title, status, data->>'target_keyword' as tk from site_articles");
  } catch (e) {
    return { lines: [`DB 不可达: ${e.message}`], level: "ERROR" };
  }
  const lines = [];
  let level = "CLEAR";
  const kwlib = (() => { try { return readJson(LIB("keyword-library.json")); } catch { return null; } })();
  for (const kw0 of kws) {
    const kw = kw0.toLowerCase();
    // 词库保质期层（WO-20260914-03）：retired（provisional 过期未升级）词禁用——
    // 有出处但有保质期：过期不升级就退出流通，重新验证才能解禁
    const ret = ((kwlib || {}).retired || []).find((r) => String(r.keyword || "").toLowerCase() === kw);
    if (ret) { level = "CONFLICT"; lines.push(`关键词 "${kw0}":`, `    ✗ CONFLICT: 词已过 provisional 保质期退役（${ret.retired_at || "?"}）— 重新验证（GSC 实测/订单证据）升级后解禁`); continue; }
    const prov = ((kwlib || {}).keywords || []).find((k) => String(k.keyword || "").toLowerCase() === kw && k.provisional_deadline);
    if (prov && prov.provisional_deadline < new Date().toISOString().slice(0, 10))
      lines.push(`关键词 "${kw0}":`, `    ⚠ provisional 已过期（${prov.provisional_deadline}）未升级未清扫 — 跑 kw-expiry-sweep`), level = level === "CLEAR" ? "RISK" : level;
    const prodHits = prodRows.filter((r) => r.slug !== patch.slug && wordHit(JSON.stringify(r.seo || {}), kw0));
    const artHits = artRows.filter((r) => r.slug !== patch.slug
      && (String(r.tk || "").toLowerCase() === kw || wordHit(r.title || "", kw0)));
    lines.push(`关键词 "${kw0}":`);
    prodHits.forEach((r) => lines.push(`    PDP 持有: /en/products/${r.slug}.html（商业意图归产品页）`));
    artHits.forEach((r) => lines.push(`    文章 [${r.status}] ${r.slug} — "${r.title}"`));
    if (artHits.length >= 2) { level = "CONFLICT"; lines.push(`    ✗ CONFLICT: ${artHits.length} 篇文章同抢一词 — 合并或改词（画像角度词做长尾变体）`); }
    else if (artHits.length === 1 && prodHits.length) { if (level === "CLEAR") level = "RISK"; lines.push("    ▲ RISK: 文章与 PDP 同词 — 文章转信息/画像角度，别和产品页抢商业意图"); }
    else if (artHits.length === 1) lines.push("    ✓ 单文章持词，无蚕食");
    else if (prodHits.length) lines.push("    ✓ 仅 PDP 持词 — 文章走信息角度即可");
    else lines.push("    ✓ 无人占用");
  }
  return { lines, level };
}

// ---------- 操盘手战略板审计（2026-09-13 操盘手层落位）----------
// 操盘手 = fuzz-produce 之上的战略层；本命令只做确定性审计：
// 漏斗六阶段完整 + 覆盖全部在库产品 / 内容矩阵只挂 keyword-library 真词 / CRO 假设带证据级（T4 必带验证计划）/ AB 测试一次一个变量
function operatorAudit(board) {
  const lines = [], problems = [];
  const bad = (m) => { problems.push(m); lines.push(`      ✗ ${m}`); };
  const ob = board || readJson(LIB("operator-library.json"));
  const stages = ["attract", "resonate", "trust", "decision", "retain", "refer"];
  const fm = ob.funnel_map || {};
  for (const s of stages) {
    const st = fm[s];
    if (!st || typeof st !== "object") { bad(`funnel_map 缺阶段 ${s}`); continue; }
    if (!Array.isArray(st.assets) || !st.assets.length) bad(`funnel_map.${s} 缺 assets`);
    if (!Array.isArray(st.metrics) || !st.metrics.length) bad(`funnel_map.${s} 缺 metrics`);
  }
  // 在库产品（fixtures 里的 PDP patch）必须被漏斗资产覆盖
  const prodSlugs = fs.readdirSync(LIB("fixtures")).filter((f) => f.endsWith("-patch.json")).map((f) => {
    try { const p = readJson(LIB("fixtures/" + f)); return (!isBlogPatch(p) && p.slug) || null; } catch { return null; }
  }).filter(Boolean);
  const assetText = JSON.stringify(fm);
  for (const s of prodSlugs) if (!assetText.includes(s)) bad(`funnel_map 未覆盖在库产品 ${s}`);
  // 内容矩阵：关键词必须在册（禁假词）、pillar 必须是在库产品页或 journal: 簇、画像在册
  const kwIds = new Set((readJson(LIB("keyword-library.json")).keywords || []).map((k) => k.id));
  const personaIds = new Set((PERSONAS().personas || []).map((p) => p.id));
  const stageSet = new Set(stages);
  for (const c of ob.content_matrix || []) {
    const tag = c.id || "(无 id)";
    for (const kid of c.keywords || []) if (!kwIds.has(kid)) bad(`content_matrix[${tag}] 挂了不在册关键词 ${kid}（禁假词——先 keyword-library 登记）`);
    if (!c.pillar) bad(`content_matrix[${tag}] 缺 pillar`);
    else if (!String(c.pillar).startsWith("journal:") && !prodSlugs.includes(String(c.pillar).replace(/^products:/, ""))) bad(`content_matrix[${tag}] pillar「${c.pillar}」不是在库产品页也不是 journal: 簇`);
    if (c.persona_link && !personaIds.has(c.persona_link) && !String(c.persona_link).startsWith("多画像共享")) bad(`content_matrix[${tag}] persona_link「${c.persona_link}」不在 persona-library`);
    if (c.funnel_stage && !stageSet.has(c.funnel_stage)) bad(`content_matrix[${tag}] funnel_stage「${c.funnel_stage}」非法`);
  }
  // CRO 台账：假设+证据级+度量；T4 必带 validation_plan（铁律#2）
  const TIERS = new Set(["T1", "T2", "T3", "T4"]);
  const CRO_STATUS = new Set(["open", "testing", "done", "won", "lost", "parked", "blocked"]);
  for (const h of ob.cro_backlog || []) {
    const tag = h.id || "(无 id)";
    if (!(h.hypothesis || "").trim()) bad(`cro_backlog[${tag}] 缺 hypothesis`);
    if (!TIERS.has(h.evidence_tier)) bad(`cro_backlog[${tag}] evidence_tier 非法（T1–T4）`);
    else if (h.evidence_tier === "T4" && !(h.validation_plan || "").trim()) bad(`cro_backlog[${tag}] T4 假设缺 validation_plan（铁律#2：T4 只能带验证计划存在）`);
    if (!(h.metric || "").trim()) bad(`cro_backlog[${tag}] 缺 metric（无度量不开假设）`);
    if (!CRO_STATUS.has(h.status)) bad(`cro_backlog[${tag}] status「${h.status}」非法（open/testing/done/won/lost/parked/blocked）`);
    // ICE 打分：open/testing 项必带（operator next 的排序输入）
    if (h.status === "open" || h.status === "testing") {
      const ice = h.ice;
      const okIce = ice && ["i", "c", "e"].every((k) => Number.isInteger(ice[k]) && ice[k] >= 1 && ice[k] <= 5);
      if (!okIce) bad(`cro_backlog[${tag}] open/testing 项缺合法 ice{i,c,e}（1–5 整数）——先打分再进排序`);
    }
  }
  // 工单台账：提案→裁决→落地全链留痕（跨会话可审计）
  const RULINGS = new Set(["pending", "accepted", "lost", "parked", "absorbed"]);
  const croIds = new Set((ob.cro_backlog || []).map((h) => h.id));
  if (!Array.isArray(ob.work_orders) || !ob.work_orders.length) bad("work_orders 台账缺失（提案→裁决→落地必须留痕）");
  for (const w of ob.work_orders || []) {
    const tag = w.id || "(无 id)";
    if (!/^WO-\d{8}-\d{2}$/.test(w.id || "")) bad(`work_orders[${tag}] id 格式非法（应为 WO-YYYYMMDD-序号）`);
    if (!RULINGS.has(w.ruling)) bad(`work_orders[${tag}] ruling「${w.ruling}」非法（pending/accepted/lost/parked/absorbed）`);
    if (!(w.title || "").trim()) bad(`work_orders[${tag}] 缺 title`);
    if (!(w.proposed || "").trim()) bad(`work_orders[${tag}] 缺 proposed 日期`);
    if (w.ruling === "accepted" && !(w.executed_commit || "").trim()) bad(`work_orders[${tag}] ruling=accepted 缺 executed_commit（落地不留痕=没落地）`);
    if (w.ruling === "accepted" && !(w.user_ruling || "").trim()) bad(`work_orders[${tag}] ruling=accepted 缺 user_ruling（裁决原文必录）`);
    if ((w.target || "").startsWith("cro-") && !croIds.has(w.target)) bad(`work_orders[${tag}] target「${w.target}」不在 cro_backlog`);
  }
  // AB 纪律：一次一个变量（铁律#7）
  const pol = ob.ab_tests?.policy || {};
  const tests = ob.ab_tests?.tests || [];
  const active = tests.filter((t) => t.status === "active");
  if (active.length > (pol.max_concurrent ?? 1)) bad(`A/B 测试并发 ${active.length} > 上限 ${pol.max_concurrent ?? 1}（铁律#7：一次一个变量）`);
  for (const t of tests) {
    if (!(t.single_variable || "").trim()) bad(`ab_tests[${t.id || "?"}] 缺 single_variable（一次只准动一个变量）`);
    if (!(t.decision_rule || "").trim()) bad(`ab_tests[${t.id || "?"}] 缺 decision_rule（先定判停规则再开测）`);
  }
  // E-E-A-T：四面齐全
  for (const e of ob.eeat_audit || []) {
    for (const d of ["experience", "expertise", "authoritativeness", "trustworthiness"]) {
      if (!(e[d] || "").trim()) bad(`eeat_audit[${e.surface || "?"}] 缺 ${d}`);
    }
  }
  const cnt = (st) => (ob.cro_backlog || []).filter((h) => h.status === st).length;
  lines.push(`\n操盘手战略板: ${problems.length ? "FAIL" : "PASS"} · funnel ${Object.keys(fm).length}/6 阶段 · 产品覆盖 ${prodSlugs.length} · 矩阵 ${(ob.content_matrix || []).length} 簇 · CRO ${(ob.cro_backlog || []).length} 项（open ${cnt("open")} / parked ${cnt("parked")} / blocked ${cnt("blocked")}）· 工单 ${(ob.work_orders || []).length} · AB active ${active.length}/${pol.max_concurrent ?? 1} · E-E-A-T ${(ob.eeat_audit || []).length} 面`);
  return { lines, status: problems.length ? "FAIL" : "PASS" };
}

// operator-selftest：正样本（真实战略板）+ 负样本注入（内存改板，不动库文件）
function operatorSelftest() {
  log("== Operator 正样本：在库战略板 ==");
  const pass = operatorAudit();
  pass.lines.forEach((l) => log(l));
  log("");
  log("== Operator 负样本注入套件 ==");
  const clone = () => JSON.parse(JSON.stringify(readJson(LIB("operator-library.json"))));
  const negatives = [
    ["AB 并发超限（铁律#7）", (o) => { o.ab_tests.tests.push({ id: "t-x1", status: "active", single_variable: "cta copy", decision_rule: "ok" }, { id: "t-x2", status: "active", single_variable: "hero order", decision_rule: "ok" }); }, "一次一个变量"],
    ["矩阵挂假关键词", (o) => { o.content_matrix[0].keywords.push("kw-fake-not-registered"); }, "禁假词"],
    ["T4 假设无验证计划（铁律#2）", (o) => { o.cro_backlog.push({ id: "h-t4x", hypothesis: "x", evidence_tier: "T4", validation_plan: "", metric: "m", status: "open" }); }, "validation_plan"],
    ["CRO 缺度量", (o) => { o.cro_backlog.push({ id: "h-nom", hypothesis: "x", evidence_tier: "T1", metric: "", status: "open" }); }, "缺 metric"],
    ["漏斗缺阶段", (o) => { delete o.funnel_map.refer; }, "缺阶段 refer"],
    ["open 项缺 ICE 打分", (o) => { const h = o.cro_backlog.find((x) => x.status === "open"); if (h) delete h.ice; else o.cro_backlog.push({ id: "h-noice", hypothesis: "x", evidence_tier: "T1", metric: "m", status: "open" }); }, "缺合法 ice"],
    ["accepted 工单无落地 commit", (o) => { o.work_orders.push({ id: "WO-20260913-99", title: "x", target: "cro-blog-publish", proposed: "2026-09-13", ruling: "accepted", user_ruling: "y" }); }, "executed_commit"],
    ["工单 ruling 非法", (o) => { o.work_orders.push({ id: "WO-20260913-98", title: "x", proposed: "2026-09-13", ruling: "maybe" }); }, "ruling"],
    ["工单 target 指向不存在的 CRO 项", (o) => { o.work_orders.push({ id: "WO-20260913-97", title: "x", proposed: "2026-09-13", ruling: "parked", target: "cro-nonexistent" }); }, "不在 cro_backlog"],
  ];
  let caught = 0;
  for (const [name, mutate, expect] of negatives) {
    const o = clone();
    mutate(o);
    const res = operatorAudit(o);
    const hit = res.status === "FAIL" && res.lines.some((l) => l.includes(expect));
    if (hit) { caught++; log(`[CAUGHT] ${name} → 命中「${expect}」`); }
    else log(`[MISSED] ${name} → 未拦截「${expect}」！`);
  }
  log(`\n负样本拦截: ${caught}/${negatives.length}`);
  const allGreen = pass.status === "PASS" && caught === negatives.length;
  log(`\nOPERATOR SELFTEST: ${allGreen ? "ALL GREEN" : "HAS FAILURES"}`);
  return allGreen;
}

// operator-next：ICE 排序（i×c×e），AB 纪律下推 THE ONE + 落选原因 + 非候选喊话
function operatorNext() {
  const lines = [];
  const ob = readJson(LIB("operator-library.json"));
  const backlog = ob.cro_backlog || [];
  const candidates = backlog
    .filter((h) => (h.status === "open" || h.status === "testing"))
    .map((h) => ({ id: h.id, status: h.status, tier: h.evidence_tier, ice: h.ice, score: h.ice.i * h.ice.c * h.ice.e, hypothesis: h.hypothesis || "", metric: h.metric || "", next_action: h.next_action || "" }));
  candidates.sort((a, b) => b.score - a.score || b.ice.i - a.ice.i || b.ice.c - a.ice.c || String(a.id).localeCompare(String(b.id)));
  lines.push("== 操盘手优先级排序（ICE = 影响×信心×易行；排序即周节奏「影响×证据」的机器化）==\n");
  candidates.forEach((c, i) => {
    lines.push(` ${i + 1}. [${c.score}] ${c.id}（${c.ice.i}×${c.ice.c}×${c.ice.e} · ${c.tier} · ${c.status}）`);
    lines.push(`      度量: ${c.metric}`);
  });
  const top = candidates[0];
  lines.push("");
  if (top) {
    lines.push(`== THE ONE: ${top.id}（${top.ice.i}×${top.ice.c}×${top.ice.e} = ${top.score}）==`);
    lines.push(`   假设: ${top.hypothesis}`);
    if (top.next_action) lines.push(`   下一步: ${top.next_action}`);
    const rest = candidates.slice(1);
    if (rest.length) {
      lines.push("\n   落选原因（排它 = AB max_concurrent 纪律的精神）:");
      for (const r of rest) {
        const why = r.score < top.score ? `得分 ${r.score} < ${top.score}` : "同分平手，影响分低";
        lines.push(`   - ${r.id}：${why}`);
      }
    }
  }
  const off = backlog.filter((h) => ["parked", "blocked"].includes(h.status));
  if (off.length) {
    lines.push("\n非候选（对用户喊话一次，周节奏）:");
    for (const h of off) lines.push(`   - [${h.status}] ${h.id}：${h.next_action || "(无 next_action)"}`);
  }
  lines.push(`\nOPERATOR NEXT: ${top ? top.id : "(无候选)"}`);
  return { lines, ok: !!top };
}

// operator-intel：例行喝 DB（ai_chat 新消息 / 转人工破洞 / t1 甄别订单 / 事件计数 / ai_shares）+ 板对账
async function operatorIntel() {
  const lines = [];
  const STATE_FILE = LIB("intel-state.json");
  let state = { manifest: "operator intel 状态（游标+历史）——node scripts/pdp-toolbox.mjs operator-intel 读写", last_run: null, last_chat_time: null, runs: 0, history: [] };
  try { state = { ...state, ...JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) }; } catch { lines.push("(首次运行：建立基线，本枪只报存量不报增量)\n"); }

  // 游标用 created_at 原始串（ai_chat_messages.id 是 UUID 不可比；JS Date 只有毫秒，直接 Date 化会把微秒截掉导致重捞最后一行）
  let chat = [];
  if (state.last_chat_time) {
    chat = await dbQuery("select id, session_id, role, content, created_at from ai_chat_messages where created_at > $1::timestamptz order by created_at asc limit 200", [state.last_chat_time]);
  } else {
    const mx = await dbQuery("select max(created_at) as t from ai_chat_messages");
    state.last_chat_time = mx[0]?.t ? String(mx[0].t) : new Date(0).toISOString();
  }
  const humanAsk = await dbQuery("select count(*)::int n from ai_chat_messages where content ilike any($1)", [["%human%", "%real person%", "%human agent%", "%转人工%", "%人工%", "%customer service rep%"]]);
  const ownerEmails = (readJson(LIB("t1-config.json")).owner_emails || []).map((e) => e.toLowerCase());
  const ordAll = await dbQuery("select count(*)::int n from orders");
  // 非自测订单拉明细分两档：t1-config 明言「QQ/163 等邮箱存疑，不由工具代判」→ 存疑档单独列，真实候选档才计入真实订单
  const ordOther = await dbQuery("select order_number, email, status, payment_status, payment_method, total, currency, country, created_at from orders where lower(email) <> all($1) order by created_at desc", [ownerEmails]);
  const SUSPICIOUS = ["qq.com", "163.com", "126.com"]; // t1-config suspicious_domains_note
  const ordReal = ordOther.filter((o) => !SUSPICIOUS.includes(String(o.email).split("@")[1]?.toLowerCase()));
  const ordDoubt = ordOther.filter((o) => SUSPICIOUS.includes(String(o.email).split("@")[1]?.toLowerCase()));
  const events = await dbQuery("select event, count(*)::int n from product_events group by 1 order by n desc limit 8");
  const shares = await dbQuery("select count(*)::int n from ai_shares");
  const realOrders = ordReal.length;

  lines.push("== 操盘手情报例行（operator intel）==\n");
  lines.push(`[1] ai_chat 自上次（${state.last_chat_time || "基线"}）新增 ${chat.length} 条`);
  for (const m of chat.filter((x) => x.role === "user").slice(-12)) {
    lines.push(`    [${m.created_at ? new Date(m.created_at).toISOString().slice(0, 16) : "?"}] ${String(m.content).replace(/\s+/g, " ").slice(0, 120)}`);
  }
  lines.push(`\n[2] 转人工信号累计 ${humanAsk[0]?.n ?? 0} 条（cro-ai-chat-human 破洞口径）`);
  lines.push(`[3] 订单甄别（t1 口径）：总 ${ordAll[0]?.n ?? 0} · 真实候选 ${realOrders} · 存疑（QQ/163 域，待用户判）${ordDoubt.length}`);
  for (const o of ordDoubt) lines.push(`    [存疑] ${o.order_number} | ${o.email} | ${o.status}/${o.payment_status} | ${o.payment_method} | ${o.total} ${o.currency} | ${o.country} | ${o.created_at ? String(o.created_at).slice(0, 10) : "?"}`);
  for (const o of ordReal) lines.push(`    [真实候选] ${o.order_number} | ${o.email} | ${o.status}/${o.payment_status} | ${o.payment_method} | ${o.total} ${o.currency} | ${o.country} | ${o.created_at ? String(o.created_at).slice(0, 10) : "?"}`);
  lines.push(`[4] product_events：${events.length ? events.map((e) => `${e.event}×${e.n}`).join(" · ") : "(空)"}`);
  lines.push(`[5] ai_shares 累计 ${shares[0]?.n ?? 0}`);
  lines.push("\n[6] 板对账（operator-library）:");
  const ob = readJson(LIB("operator-library.json"));
  const flags = [];
  if (realOrders > 0 && String(ob.funnel_map?.retain?.data_status || "").includes("blind")) flags.push(`真实候选订单 ${realOrders}>0 但 retain/decision 仍标 blind → 漏斗 data_status 该更新（存疑单不计入）`);
  if ((humanAsk[0]?.n ?? 0) > 0 && (ob.cro_backlog || []).find((h) => h.id === "cro-ai-chat-human")?.status === "open") flags.push(`转人工 ${humanAsk[0].n} 条未清 → cro-ai-chat-human 仍 open，THE ONE 候选`);
  if (chat.some((m) => m.role === "user" && /\$\s?\d{3,4}|price|how much/i.test(m.content))) flags.push("新消息含问价 → 对 ai-products.json 报价面抽查一次（第 4 内容面漂移防线）");
  lines.push(flags.length ? flags.map((f) => "    ⚠ " + f).join("\n") : "    (无漂移信号)");

  state.last_run = new Date().toISOString().slice(0, 16) + "Z";
  if (chat.length) state.last_chat_time = String(chat[chat.length - 1].created_at);
  state.runs = (state.runs || 0) + 1;
  state.history = [...(state.history || []), { date: state.last_run, new_messages: chat.length, human_signals: humanAsk[0]?.n ?? 0, real_orders: realOrders }].slice(-20);
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
  lines.push(`\n状态已写 ${path.relative(ROOT, STATE_FILE)}（runs=${state.runs}，游标 ${state.last_chat_time}）`);
  lines.push("OPERATOR INTEL: DONE");
  return lines;
}

// blog-selftest：正样本（demo 文章 patch）+ 负样本注入
async function blogSelftest() {
  const fixture = readJson(LIB("fixtures/blog-animal-sofa-boom-2026.json"));
  log("== Blog 正样本：demo 文章（含 DB 内链实查）==");
  const pass = await blogValidate(fixture);
  for (const r of pass.results) {
    log(`[${r.status}] ${r.id} ${r.name}`);
    r.issues.forEach((i) => log(`      ✗ ${i}`));
    r.warns.forEach((w) => log(`      ⚠ ${w}`));
  }
  log(`正样本整体: ${pass.status}（warnings ${pass.warns.length}）\n`);

  log("== Blog 负样本注入套件 ==");
  const clone = () => JSON.parse(JSON.stringify(fixture));
  // rb12 正基底（合法出口块），负样本在其上注入单一违规
  const goodSocial = (slug) => ({
    pinterest: {
      days: [{
        day: 1,
        title: "Is Fuzz Sofa AI or real? 200x160x152 cm Gorilla Sofa",
        image: "https://fuzzsofa.com/social/x/pin-d1.jpg",
        description: `Same ten silhouettes from the same three catalogs — this one is in none of them. Designer furniture Dubai, One Partner Per City, no OEM. 200kg load test, 300kg frame, 5.5x stitching. 200x160x152 cm. Full atelier story: https://fuzzsofa.com/en/journal/${slug}.html?utm_source=pinterest&utm_medium=social&utm_campaign=${slug}-d1`,
        link: `https://fuzzsofa.com/en/journal/${slug}.html?utm_source=pinterest&utm_medium=social&utm_campaign=${slug}-d1`,
      }],
    },
    instagram: {
      caption: "Not from the 3 catalogs. He began as clay in our Shanghai atelier. 200x160x152 cm, holds 200 kg. Want the atelier process? Comment REAL DUBAI. Save this for your Dubai showroom meeting.",
      reel: { duration_s: 15, shots: ["sketch", "foam", "skin", "scene"] },
    },
    facebook: {
      text: "Is Fuzz Sofa AI or real? From sketch to penthouse — 200x160x152 cm.",
      link: `https://fuzzsofa.com/en/journal/${slug}.html?utm_source=facebook&utm_medium=social&utm_campaign=${slug}`,
    },
  });
  const negatives = [
    ["rb2 无出处数字（段内无链接）", (p) => { p.content = p.content.replace("## How to Spot", "Renders sell for $7,777 this month.\n\n## How to Spot"); }, "rb2"],
    ["rb2 外链不在白名单", (p) => { p.content += "\n\nSee [this study](https://example.com/paper)."; }, "rb2"],
    ["rb3/rb6 title 超长", (p) => { p.title = p.title + " Explained"; }, "rb6"],
    ["rb4 deprecated 假词进 excerpt", (p) => { p.excerpt = "oversized owl chair " + p.excerpt; }, "rb4"],
    ["rb5 禁词", (p) => { p.content += "\n\nWe recommend measuring twice."; }, "rb5"],
    ["rb6 category 越界", (p) => { p.category = "Random"; }, "rb6"],
    ["rb7 死产品内链", (p) => { p.content = p.content.replace("noctua-owl-armchair.html", "fake-owl-chair.html"); }, "rb7"],
    ["rb8 交期缺统一口径（丢 1–3 生产半句）", (p) => { p.content = p.content.replace(/1[–-]3\s*days?,?\s*/, ""); }, "rb8"],
    ["rb9 AI 对象进 title", (p) => { p.title = "Tiger Sofas: " + p.title; }, "rb9"],
    ["rb9 AI 提及无标注", (p) => { p.content = p.content.replaceAll("AI-generated", "internet").replace("imagined with AI", "dreamed up online"); }, "rb9"],
    ["rb10 社证数字无 sources", (p) => { p.content += "\n\nOne reel hit 17.6K likes overnight."; }, "rb10"],
    ["rb1 占位符", (p) => { p.content = p.content + "\n\n## TODO"; }, "rb1"],
    ["rb11 画像缺失", (p) => { delete p.personas; }, "rb11"],
    ["rb12 口号标题复辟（Sit on Art）+ 无尺寸", (p) => { p.social = goodSocial(p.slug); p.social.pinterest.days[0].title = "Sit on Art — own the frame"; }, "rb12"],
    ["rb12 出站链接缺 UTM", (p) => { p.social = goodSocial(p.slug); p.social.pinterest.days[0].link = `https://fuzzsofa.com/en/journal/${p.slug}.html`; }, "rb12"],
    ["rb12 FB 文案超 80 字符", (p) => { p.social = goodSocial(p.slug); p.social.facebook.text = p.social.facebook.text + " Handmade to order, shipped worldwide with white-glove delivery included."; }, "rb12"],
    ["rb13 factory 毒词进卡面", (p) => { p.social = goodSocial(p.slug); p.social.pinterest.days[0].title = "Factory direct gorilla sofa 200x160x152 cm"; }, "rb13"],
    ["rb13 hand-sculpted/淘宝参数", (p) => { p.social = goodSocial(p.slug); p.social.instagram.caption = p.social.instagram.caption.replace("atelier process","hand-sculpted in factory, ships in a crate"); }, "rb13"],
    ["rb14 IG caption 挂链接", (p) => { p.social = goodSocial(p.slug); p.social.instagram.caption = p.social.instagram.caption + " https://fuzzsofa.com"; }, "rb14"],
  ];
  let caught = 0;
  for (const [name, mutate, expectRule] of negatives) {
    const p = clone();
    mutate(p);
    const res = await blogValidate(p);
    const hit = res.results.find((r) => r.id === expectRule && r.status === "FAIL");
    if (hit) { caught++; log(`[CAUGHT] ${name} → ${expectRule}: ${hit.issues[0]}`); }
    else log(`[MISSED] ${name} → ${expectRule} 未拦截！`);
  }
  log(`\nBlog 负样本拦截: ${caught}/${negatives.length}`);
  if (fixture.status === "published") {
    log("\n== 线上 DOM 回归 ==");
    const live = await blogVerify(`http://localhost/journal/${fixture.slug}`, fixture);
    for (const c of live.checks) log(`[${c.ok ? "PASS" : "FAIL"}] ${c.name}${c.ok ? "" : " — " + c.detail}`);
    log(`线上整体: ${live.status}`);
    const allGreen = pass.status === "PASS" && caught === negatives.length && live.status === "PASS";
    log(`\nBLOG SELFTEST: ${allGreen ? "ALL GREEN" : "HAS FAILURES"}`);
    return allGreen;
  }
  log(`\n（fixture status=${fixture.status} — 未发布，线上 DOM 回归待发布后跑 blog-verify）`);
  log(`BLOG SELFTEST: ${pass.status === "PASS" && caught === negatives.length ? "ALL GREEN（离线部分）" : "HAS FAILURES"}`);
  return pass.status === "PASS" && caught === negatives.length;
}
// ---------- social-gen（WO-20260914-08：blog 是母体，社交是出口）----------
// 输入 = social-input JSON（blog_slug / product_slug / pin_days / ig shots）；
// 规格只从 products.data 取（r2 同源）；资产落到 public/social/<blog_slug>/；
// 产出 social 块 JSON，落盘前先过 rb12 自检——闸门不认的卡不许出工。
async function socialGen(inputFile) {
  const inp = readJson(path.isAbsolute(inputFile) ? inputFile : path.join(ROOT, inputFile));
  const spb = SPB();
  const rows = await dbQuery("select data::text as d from products where slug=$1", [inp.product_slug]);
  if (!rows.length) throw new Error(`产品不在库: ${inp.product_slug}`);
  const data = JSON.parse(rows[0].d);
  const sp = data.specs || {};
  const need = { W: sp.width, D: sp.depth, H: sp.height, SH: sp.seatHeight, LOAD: sp.capacity, PKG: data.packageDimensionsCm };
  for (const [k, v] of Object.entries(need)) if (v == null || v === "") throw new Error(`products.data 缺 ${k}——规格不全不出卡`);
  const dims = `${need.W}x${need.D}x${need.H}`;
  // 材质净化：长句条目切到主干（分号截断→破折号取段），滤掉"认证"类非材质项——描述须守 500 字符闸
  const cleanMat = (m) => { let s = String(m).split(";")[0]; if (s.length > 52) s = s.split(" — ")[0]; return s.trim(); };
  const mats = (data.materials || []).map(cleanMat).filter((m) => m && !/certification/i.test(m)).join(", ");
  const slug = inp.blog_slug;
  const origin = "https://fuzzsofa.com";
  const blogUrl = (platform, day) =>
    `${origin}/en/journal/${slug}.html?utm_source=${platform}&utm_medium=social&utm_campaign=${slug}${day ? `-d${day}` : ""}`;
  // V3.0 公式（V8 养料/站主裁决）：Pinterest=搜索引擎，描述给搜索词（designer furniture dubai 类）+场景+证据数字；
  // 禁：Handmade to order in 1-3 days/ships in a crate/factory footage（rb13 会拦）；场景与关键词由 input 按目标 blog 传入
  const pinScene = inp.pin_scene || "Alserkal, City Walk — same ten silhouettes from the same three catalogs. This piece is in none of them.";
  const pinKws = inp.pin_keywords || "Designer furniture Dubai — One Partner Per City, no OEM, global exclusive originals. Shanghai atelier.";
  const pinDesc = (link, sceneOverride) =>
    `${sceneOverride || pinScene} ${pinKws} 200kg load test, 300kg frame, 5.5x stitching. ${dims} cm, holds ${need.LOAD} kg. See it in your room — full atelier story: ${link}`;

  // ---- 资产：1000x1500 JPEG（sharp，attention 裁切）+ 15s Reel（ffmpeg-static 若在）----
  const assetDir = path.join(ROOT, "public", "social", slug);
  fs.mkdirSync(assetDir, { recursive: true });
  const sharp = (await import("sharp")).default;
  const pinDays = [];
  for (const [i, d] of (inp.pin_days || []).entries()) {
    const file = `pin-d${d.day ?? i + 1}.jpg`;
    const buf = Buffer.from(await (await fetch(d.image_url)).arrayBuffer());
    await sharp(buf).resize(1000, 1500, { fit: "cover", position: "attention" })
      .jpeg({ quality: 85, mozjpeg: true }).toFile(path.join(assetDir, file));
    const day = d.day ?? i + 1;
    const link = blogUrl("pinterest", day);
    d.scene = d.scene || "";
    // 描述超 500（长 slug 博客）：描述内链接降为无 UTM 短链——出站契约在 d.link 上，rb12 照拦
    const desc = (() => { const full = pinDesc(link, d.scene); return full.length > 500 ? pinDesc(`${origin}/en/journal/${slug}.html`, sceneOverride) : full; })();
    const tpl = spb.platforms.pinterest.hook.templates[d.template_index ?? 0];
    pinDays.push({
      day, slot: spb.spec_limits.pinterest.slot,
      // d.title 覆写（非金刚产品需自家问句；{W}{D}{H} 占位符同支持）——rb12 出厂自检照拦
      title: (d.title || tpl).replaceAll("{W}", String(need.W)).replaceAll("{D}", String(need.D)).replaceAll("{H}", String(need.H)),
      image: `${origin}/social/${slug}/${file}`,
      image_source: d.image_url, image_note: d.image_note || "",
      description: desc, link,
    });
  }
  const igShots = (inp.ig?.shots || []);
  if (igShots.length !== 4) throw new Error("ig.shots 必须 4 镜（01线稿→02泡沫→03蒙皮→04场景）");
  const igLink = blogUrl("instagram", 0).replace("-d0", "");
  const igCaption = (spb.platforms.instagram.hook.caption_template
    .replaceAll("{story_sentence}", inp.ig.story_sentence)
    .replaceAll("{W}", String(need.W)).replaceAll("{D}", String(need.D))
    .replaceAll("{H}", String(need.H)).replaceAll("{LOAD}", String(need.LOAD)));
  const fbText = (inp.fb?.text || "Same silhouettes from the same 3 catalogs. This one is in none of them — one partner per city. Would you show it?")
    .replaceAll("{W}", String(need.W)).replaceAll("{D}", String(need.D)).replaceAll("{H}", String(need.H));
  if (fbText.length > 80) throw new Error(`FB 文案 ${fbText.length} 字符 > 80`);

  const block = {
    playbook_version: spb.version,
    generated_at: new Date().toISOString().slice(0, 10),
    mother_blog: slug, product: inp.product_slug,
    price_usd: data.price ?? null,
    pinterest: { slot: spb.spec_limits.pinterest.slot, days: pinDays },
    instagram: {
      caption: igCaption,
      reel: { duration_s: 15, audio_note: "成片无音轨；BGM 在 IG 内挂热门音频（分发权重）", shots: igShots, asset: null },
      bio_link: igLink,
    },
    facebook: { text: fbText, image: inp.fb?.image || null, link: blogUrl("facebook", 0).replace("-d0", "") },
  };

  // ---- Reel 成片（ffmpeg-static 在才生成；否则 asset=null 卡面给人工组装指引）----
  try {
    const ff = (await import("ffmpeg-static")).default;
    if (ff) {
      const { spawnSync } = await import("node:child_process");
      const RW = 720, RH = 900, FPS = 24, SEG = Math.round(3.75 * FPS); // 90 帧=3.75s ×4=15s
      // 本机内存紧（x264 1080p malloc 失败实测）——720x900@24 ultrafast 是实测可跑档
      const local = [];
      for (const [i, sh] of igShots.entries()) {
        const f = path.join(assetDir, `reel-s${i + 1}.jpg`);
        const buf = Buffer.from(await (await fetch(sh.url)).arrayBuffer());
        await sharp(buf).resize(RW, RH, { fit: "cover", position: "attention" }).jpeg({ quality: 88 }).toFile(f);
        local.push(f);
      }
      const font = "C\\:/Windows/Fonts/arialbd.ttf";
      const parts = [], cons = [];
      for (const [i] of local.entries()) {
        parts.push(
          `[${i}:v]scale=${RW}:${RH}:force_original_aspect_ratio=increase,crop=${RW}:${RH},` +
          `zoompan=z='min(zoom+0.0006,1.06)':d=${SEG}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${RW}x${RH}:fps=${FPS},` +
          `drawtext=fontfile=${font}:text='${igShots[i].label}':fontsize=38:fontcolor=white:borderw=2:bordercolor=black:` +
          `x=40:y=h-100:enable='between(t,${(i * SEG / FPS).toFixed(2)},${((i + 1) * SEG / FPS).toFixed(2)})'[v${i}]`
        );
        cons.push(`[v${i}]`);
      }
      const out = path.join(assetDir, "reel.mp4");
      const r = spawnSync(ff, [
        "-y", ...local.flatMap((f) => ["-i", f]),
        "-filter_complex", parts.join(";") + `;${cons.join("")}concat=n=4:v=1:a=0[out]`,
        "-map", "[out]", "-r", String(FPS), "-t", "15", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "24",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", out,
      ], { encoding: "utf8" });
      if (r.status === 0 && fs.existsSync(out)) block.instagram.reel.asset = `${origin}/social/${slug}/reel.mp4`;
      else log(`[social-gen] reel 生成失败（可人工组装）: ${(r.stderr || "").slice(-300)}`);
    }
  } catch (e) {
    log(`[social-gen] ffmpeg-static 不可用，reel 跳过（卡面走人工组装指引）: ${e.message}`);
  }

  // ---- 出厂自检：rb12 不认的卡不出工 ----
  const gate = rb12SocialOutlet({ slug, social: block }, spb);
  if (gate.issues.length) throw new Error("rb12 拦截生成块:\n  - " + gate.issues.join("\n  - "));

  const outFile = inp.out || `scripts/db-patches-20260912/social-block-wo14-08.json`;
  fs.writeFileSync(path.join(ROOT, outFile), JSON.stringify(block, null, 2) + "\n");
  const lines = [
    `[social-gen] ${slug} ← ${inp.product_slug}（specs ${dims}, SH ${need.SH}, LOAD ${need.LOAD}, PKG ${need.PKG}）`,
    `  pin ×${pinDays.length}（${pinDays.map((d) => `d${d.day}:${path.basename(d.image)}`).join(" / ")}）`,
    `  reel: ${block.instagram.reel.asset ? "MP4 已成片" : "未成片（人工组装：4 镜×3.7s 快切，BGM in-app）"}`,
    `  rb12: PASS（出厂自检）→ ${outFile}`,
  ];
  return lines;
}
// ---------- PDP selftest ----------
async function selftest() {
  const fixture = readJson(LIB("fixtures/noctua-patch.json"));
  log("== 正样本：Noctua 线上内容（已上线）==");
  const pass = validatePatch(fixture);
  for (const r of pass.results) {
    log(`[${r.status}] ${r.id} ${r.name}`);
    r.issues.forEach((i) => log(`      ✗ ${i}`));
    r.warns.forEach((w) => log(`      ⚠ ${w}`));
  }
  log(`正样本整体: ${pass.status}（warnings ${pass.warns.length}）\n`);

  log("== 负样本注入套件 ==");
  const clone = () => JSON.parse(JSON.stringify(fixture));
  const negatives = [
    ["r1 占位符", (p) => { p.content.features[0].desc = "It is [PLACEHOLDER] good."; }, "r1"],
    ["r2 无出处数字", (p) => { p.content.storyText += " It weighs $9,999 in gold."; }, "r2"],
    ["r4 引用破坏", (p) => { p.content.quote = { text: "best chair ever, absolutely life-changing", source: "selftest-injected" }; }, "r4"],
    ["r5 假关键词", (p) => { p.seo.keywords.push("oversized owl chair"); }, "r5"],
    ["r6 禁词", (p) => { p.content.features[1].desc = "We recommend this for large rooms."; }, "r6"],
    ["r7 title 超长", (p) => { p.seo.title = p.seo.title + " Extra Words Here"; }, "r7"],
    ["r7 materials 参数标注", (p) => { p.content.materials.push("Corduroy — 10,000 rubs"); }, "r7"],
    ["r7 materials 超 6 项", (p) => { p.content.materials.push("Bouclé", "Chenille", "Canvas"); }, "r7"],
    ["r7 场景区数字", (p) => { p.content.interiorInspirations[1].description += " 120 cm footprint."; }, "r7"],
    ["r7 场景区工业术语", (p) => { p.content.interiorInspirations[2].description += " Martindale-tested velvet."; }, "r7"],
    ["r7 场景区缺图", (p) => { delete p.content.interiorInspirations[0].image; }, "r7"],
    ["r13 场景卡图未登记辨识清单", (p) => { p.content.interiorInspirations[0].image = "https://nakwtxteihlvsocjibvq.supabase.co/storage/v1/object/public/product-images/product_main/unseen-image-999.webp"; }, "r13"],
    ["r13 文案踩图中无道具", (p) => { p.content.interiorInspirations[1].description += " A slow coffee on the armrest."; }, "r13"],
    ["r7 特点区QC", (p) => { p.content.features[2].desc = "Frame steel QC SH2024-0945 tested."; }, "r7"],
    ["r8 QC 缺失", (p) => { const strip = (o) => { for (const [k, v] of Object.entries(o)) { if (typeof v === "string") o[k] = v.replaceAll("SH2024-0945", "SGS报告"); else if (v && typeof v === "object") strip(v); } }; strip(p.content); strip(p.seo); }, "r8"],
    ["r9 缺运输口径", (p) => { p.content.leadTime = "Made to Order DDP"; p.content.leadTimeNote = "Built to order, delivered door-to-door."; }, "r9"],
    ["r9 旧口径 9–17", (p) => { p.content.leadTime = "Made to Order: 1–3 Days Build + 7–14 Days (legacy 9–17) DDP"; }, "r9"],
    ["r10 AI 对象误入非Story", (p) => { p.content.features[3].title = "Tiger Posture"; }, "r10"],
    ["r10 AI 无标注", (p) => { p.content.storyText += " Bread sofas are trending."; }, "r10"],
    ["r11 社证数字未确认入非Story", (p) => { p.content.ldProperties.push({ name: "Social", value: "17.6K views on TikTok" }); }, "r11"],
    ["r12 画像缺失", (p) => { delete p.personas; }, "r12"],
    ["r12 画像不在库", (p) => { p.personas = ["wealthy-uncle"]; }, "r12"],
    ["r14 心理卡整体缺失", (p) => { delete p.psych_jobs; }, "r14"],
    ["r14 心理岗位错名", (p) => { p.psych_jobs[3].psychological_job = "made_up_job"; }, "r14"],
    ["r14 断掉一节心理卡", (p) => { p.psych_jobs.splice(7, 1); }, "r14"],
    ["r14 心理卡指向库外画像", (p) => { p.psych_jobs[0].persona = "wealthy-uncle"; }, "r14"],
  ];
  // r14 库级负样本：画像缺证据级 / 心理图缺字段（注入改板库，不动库文件）
  const stripLib = (mutate) => {
    const lib = JSON.parse(JSON.stringify(PERSONAS()));
    mutate(lib.personas.find((x) => x.id === "owl-nostalgia-collector"));
    const p = clone();
    const res = validatePatch(p, lib);
    return res.results.find((r) => r.id === "r14" && r.status === "FAIL");
  };
  let caught = 0;
  for (const [name, mutate, expectRule] of negatives) {
    const p = clone();
    mutate(p);
    const res = validatePatch(p);
    const hit = res.results.find((r) => r.id === expectRule && r.status === "FAIL");
    if (hit) { caught++; log(`[CAUGHT] ${name} → ${expectRule} 命中: ${hit.issues[0]}`); }
    else log(`[MISSED] ${name} → ${expectRule} 未拦截！`);
  }
  const libNegatives = [
    ["r14 画像缺 evidence_level", (p) => { delete p.evidence_level; }],
    ["r14 画像心理图缺字段", (p) => { delete p.buyer_psychology.fear; }],
    ["r14 价格带错配", (p) => { p.economic_profile.price_band = { min: 20000, max: 50000, note: "selftest 注入" }; }],
  ];
  for (const [name, mutate] of libNegatives) {
    const hit = stripLib(mutate);
    if (hit) { caught++; log(`[CAUGHT] ${name} → r14 命中: ${hit.issues[0]}`); }
    else log(`[MISSED] ${name} → r14 未拦截！`);
  }
  const totalNeg = negatives.length + libNegatives.length;

  log(`\n负样本拦截: ${caught}/${totalNeg}`);

  log("\n== 线上 DOM 回归 ==");
  const live = await verifyLive("http://localhost/en/products/noctua-owl-armchair.html", fixture);
  for (const c of live.checks) log(`[${c.ok ? "PASS" : c.known ? "KNOWN" : "FAIL"}] ${c.name}${c.ok ? "" : " — " + c.detail}`);
  log(`线上整体: ${live.status}`);
  const allGreen = pass.status === "PASS" && caught === totalNeg && live.status === "PASS";
  log(`\nSELFTEST: ${allGreen ? "ALL GREEN" : "HAS FAILURES"}`);
  return allGreen;
}

// ---------- CLI 入口 ----------
const [, , cmd, ...args] = process.argv;
const flush = () => console.log(OUT.join("\n"));
switch (cmd) {
  case "selftest": { const ok = await selftest(); flush(); process.exit(ok ? 0 : 1); break; }
  case "validate": {
    const r = validatePatch(readJson(path.resolve(args[0])));
    for (const res of r.results) {
      log(`[${res.status}] ${res.id} ${res.name}`);
      res.issues.forEach((i) => log(`      ✗ ${i}`));
      res.warns.forEach((w) => log(`      ⚠ ${w}`));
    }
    log(`\nVALIDATE: ${r.status}`);
    flush();
    process.exit(r.status === "PASS" ? 0 : 1);
    break;
  }
  case "verify": {
    const r = await verifyLive(args[0], readJson(path.resolve(args[1])));
    for (const c of r.checks) log(`[${c.ok ? "PASS" : c.known ? "KNOWN" : "FAIL"}] ${c.name}${c.ok ? "" : " — " + c.detail}`);
    log(`\nVERIFY: ${r.status}`);
    flush();
    process.exit(r.status === "PASS" ? 0 : 1);
    break;
  }
  case "library": {
    if (args[0] === "show") libShow();
    else if (args[0] === "search") libSearch(args[1] || "");
    else if (args[0] === "add") libAdd(args[1], path.resolve(args[2]));
    else if (args[0] === "bump") libBump(args[1]);
    else log("用法: library show | search <term> | add <lib> <file> | bump <lib>");
    console.log(OUT.join("\n"));
    break;
  }
  case "scaffold": {
    console.log(JSON.stringify(scaffold(readJson(path.resolve(args[0]))), null, 2));
    break;
  }
  case "operator-intake": {
    operatorIntake(readJson(path.resolve(args[0]))).forEach((l) => log(l));
    flush();
    break;
  }
  case "blog-validate": {
    const r = await blogValidate(readJson(path.resolve(args[0])));
    for (const res of r.results) {
      log(`[${res.status}] ${res.id} ${res.name}`);
      res.issues.forEach((i) => log(`      ✗ ${i}`));
      res.warns.forEach((w) => log(`      ⚠ ${w}`));
    }
    log(`\nBLOG VALIDATE: ${r.status}`);
    flush();
    process.exit(r.status === "PASS" ? 0 : 1);
    break;
  }
  case "blog-verify": {
    const r = await blogVerify(args[0], readJson(path.resolve(args[1])));
    for (const c of r.checks) log(`[${c.ok ? "PASS" : "FAIL"}] ${c.name}${c.ok ? "" : " — " + c.detail}`);
    log(`\nBLOG VERIFY: ${r.status}`);
    flush();
    process.exit(r.status === "PASS" ? 0 : 1);
    break;
  }
  case "blog-selftest": { const ok = await blogSelftest(); flush(); process.exit(ok ? 0 : 1); break; }
  case "social-gen": {
    try {
      const lines = await socialGen(args[0]);
      lines.forEach((l) => log(l));
      flush();
      process.exit(0);
    } catch (e) {
      log(`[social-gen] FAIL: ${e.message}`);
      flush();
      process.exit(1);
    }
    break;
  }
  case "operator": {
    log("== 操盘手战略板审计（operator-library）==");
    const r = operatorAudit();
    r.lines.forEach((l) => log(l));
    log(`\nOPERATOR AUDIT: ${r.status}`);
    flush();
    process.exit(r.status === "PASS" ? 0 : 1);
    break;
  }
  case "operator-selftest": { const ok = operatorSelftest(); flush(); process.exit(ok ? 0 : 1); break; }
  case "operator-next": {
    const r = operatorNext();
    r.lines.forEach((l) => log(l));
    flush();
    process.exit(r.ok ? 0 : 1);
    break;
  }
  case "operator-intel": {
    operatorIntel()
      .then((lines) => { lines.forEach((l) => log(l)); flush(); process.exit(0); })
      .catch((e) => { console.error("INTEL ERROR:", e.message); process.exit(1); });
    break;
  }
  case "blog-scaffold": {
    console.log(JSON.stringify(blogScaffold(readJson(path.resolve(args[0]))), null, 2));
    break;
  }
  case "persona": {
    if (args[0] === "infer" && args[1]) {
      let input;
      if (/\.json$/i.test(args[1])) input = readJson(path.resolve(args[1]));
      else {
        try { input = await productToPersonaInput(args[1]); }
        catch (e) { console.error(e.message); process.exit(1); }
      }
      const ranked = personaInfer(input, PERSONAS());
      log(`== 画像反推: ${input.slug || input.name || "(input)"}${input.price ? `（$${input.price}）` : ""} ==`);
      personaReport(ranked).forEach((l) => log(l));
      log(`\n建议 patch.personas: ${JSON.stringify(ranked.map((r) => r.id))}`);
    } else if (args[0] === "audit") {
      const a = personaAudit(PERSONAS());
      a.lines.forEach((l) => log(l));
      flush();
      process.exit(a.ok === a.total ? 0 : 1);
    } else if (args[0] === "brief" && args[1]) {
      let input;
      if (/\.json$/i.test(args[1])) input = readJson(path.resolve(args[1]));
      else {
        try { input = await productToPersonaInput(args[1]); }
        catch (e) { console.error(e.message); process.exit(1); }
      }
      personaBrief(input, PERSONAS()).forEach((l) => log(l));
    } else log("用法: persona infer <input.json|slug> | persona brief <input.json|slug> | persona audit");
    console.log(OUT.join("\n"));
    break;
  }
  case "craft-scan": {
    await craftScan();
    break;
  }
  case "score": {
    const patch = readJson(path.resolve(args[0]));
    const mode = isBlogPatch(patch) ? "blog" : "pdp";
    const v = mode === "blog" ? await blogValidate(patch) : validatePatch(patch);
    const s = scoreFromValidation(v, patch, mode);
    for (const res of v.results) {
      log(`[${res.status}] ${res.id} ${res.name}`);
      res.issues.forEach((i) => log(`      ✗ ${i}`));
      res.warns.forEach((w) => log(`      ⚠ ${w}`));
    }
    log(`\n内容评分: ${s.score}/100（${s.grade}）`);
    s.detail.forEach((d) => log(`    − ${d}`));
    log(`    权重基线 V2(score v2 + 欲望三查 15 分):治理假设,待 GSC/订单数据校准`);
    flush();
    process.exit(v.status === "PASS" ? 0 : 1);
    break;
  }
  case "t1": {
    if (args[0] === "inventory") {
      const lines = await t1Inventory();
      lines.forEach((l) => log(l));
    } else if (args[0] === "ledger") {
      t1Ledger().forEach((l) => log(l));
    } else log("用法: t1 inventory | t1 ledger");
    console.log(OUT.join("\n"));
    break;
  }
  case "cannibal": {
    const arg = args[0] || "";
    const patch = /\.json$/i.test(arg) ? readJson(path.resolve(arg)) : null;
    const mode = patch ? (isBlogPatch(patch) ? "blog" : "pdp") : "blog";
    const r = await cannibalCheck(patch || { target_keyword: arg }, mode);
    r.lines.forEach((l) => log(l));
    log(`\nCANNIBAL: ${r.level}`);
    console.log(OUT.join("\n"));
    process.exit(r.level === "CONFLICT" ? 1 : 0);
    break;
  }
  default:
    console.log("命令: selftest | validate <f> | verify <url> <f> | library ... | scaffold <f> | persona infer <f|slug>\n      persona brief <f|slug> | persona audit | score <f> | cannibal <f|kw> | blog-selftest | blog-validate <f> | blog-verify <url> <f> | blog-scaffold <f>\n      social-gen <input.json>（blog 母体 → 社交出口块 + pin 图/Reel 资产，出厂过 rb12）");
}
