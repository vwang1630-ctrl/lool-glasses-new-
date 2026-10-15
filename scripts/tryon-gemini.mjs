// tryon-gemini.mjs — 眼镜虚拟试戴生成器（独立技能，2026-10-15）
// 用法: node --env-file=.env scripts/tryon-gemini.mjs <自拍> <镜框图...> [--out 目录] [--count N]
// 模型自动探活: gemini-3-pro-image → nano-banana-pro-preview → gemini-3.1-flash-image
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const OUT = outIdx >= 0 ? args[outIdx + 1] : "tryon-out";
const countIdx = args.indexOf("--count");
const COUNT = countIdx >= 0 ? Number(args[countIdx + 1]) || 2 : 2;
const files = args.filter((a, i) => !a.startsWith("--") && (outIdx < 0 || i !== outIdx + 1) && (countIdx < 0 || i !== countIdx + 1));
const KEY = (process.env.GEMINI_API_KEY || "").trim();

if (!KEY) { console.error("缺 GEMINI_API_KEY（.env 或环境变量）"); process.exit(1); }
if (files.length < 2) { console.error("用法: node tryon-gemini.mjs <自拍> <镜框图...> [--out 目录] [--count N]"); process.exit(1); }
for (const f of files) if (!existsSync(f)) { console.error("文件不存在:", f); process.exit(1); }

const CANDIDATES = ["gemini-3-pro-image", "nano-banana-pro-preview", "gemini-3.1-flash-image"];
const b64 = (f) => readFileSync(f).toString("base64");
const mime = (f) => ({ ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" })[path.extname(f).toLowerCase()] || "image/jpeg";

const PROMPT = `Take the eyeglasses from the product photo(s) and show them worn naturally by the person in the selfie.
Rules:
- Preserve the person's identity exactly: same face, same expression, same hairstyle, same background.
- Keep the frame EXACTLY as the product photo: same shape, same color, same proportions, same hinge and temple details.
- Natural fit: frame sits on the nose bridge, temples reach the ears, slight natural shadow where the frame touches the skin.
- Photorealistic. No text, no watermark, no extra people.`;

const call = async (model, parts) => {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts }] }),
  });
  return { res, body: await res.json() };
};

(async () => {
  // 探活: 用一次最小合成调用找可用图像模型
  let MODEL = process.env.GEMINI_MODEL || "";
  if (!MODEL) {
    const probeParts = [{ text: "Reply with one word: ready" }];
    for (const m of CANDIDATES) {
      try {
        const { res, body } = await call(m, probeParts);
        if (res.ok) { MODEL = m; break; }
        console.log(`[tryon] ${m} 不可用 (HTTP ${res.status}: ${JSON.stringify(body).slice(60, 140)})`);
      } catch (e) { console.log(`[tryon] ${m} 失败: ${String(e.message).slice(0, 60)}`); }
      await new Promise((r) => setTimeout(r, 1500));
    }
    if (!MODEL) { console.error("全部图像模型不可用（免费层过载属临时态，稍后重试）"); process.exit(1); }
  }
  console.log(`[tryon] 模型: ${MODEL}`);

  const parts = [{ text: PROMPT }, ...files.map((f) => ({ text: `Image: ${path.basename(f)}` })), ...files.map((f) => ({ inlineData: { mimeType: mime(f), data: b64(f) } }))];
  mkdirSync(OUT, { recursive: true });
  let saved = 0;
  for (let i = 1; i <= COUNT; i++) {
    process.stdout.write(`[tryon] 候选 ${i}/${COUNT} … `);
    try {
      const { res, body } = await call(MODEL, parts);
      if (!res.ok) { console.log(`HTTP ${res.status}`); continue; }
      const imgPart = (body.candidates?.[0]?.content?.parts ?? []).find((p) => p.inlineData);
      if (!imgPart) { console.log("无图返回:", JSON.stringify(body).slice(0, 120)); continue; }
      const ext = imgPart.inlineData.mimeType.includes("png") ? "png" : "jpg";
      const fp = path.join(OUT, `tryon-${Date.now()}-${i}.${ext}`);
      writeFileSync(fp, Buffer.from(imgPart.inlineData.data, "base64"));
      console.log("✓", fp);
      saved++;
    } catch (e) { console.log("失败:", String(e.message).slice(0, 80)); }
    await new Promise((r) => setTimeout(r, 3000));
  }
  console.log(`\n[tryon] 完成 ${saved}/${COUNT} 张 → ${OUT}/`);
  console.log("下一步: 用 Read 逐张过 QC 门（SKILL.md 第 4 步），全过才交付");
  process.exit(saved ? 0 : 1);
})();
