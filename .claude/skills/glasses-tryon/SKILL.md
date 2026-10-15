---
name: glasses-tryon
description: 眼镜虚拟试戴生成器——给一张自拍 + 镜框产品图，用 Gemini 图像模型生成真实自然的"戴上效果"图。独立技能，不依赖任何项目。凡「试戴 / try-on / 上脸图 / 镜框效果图」都用本技能。
---

# glasses-tryon：眼镜虚拟试戴生成

你（Claude）是本技能的调度员。管线只有一条：**验图 → 组装 prompt → 生成 → QC 门 → 交付**。

## 用法

```bash
node scripts/tryon-gemini.mjs <自拍.jpg> <镜框正面图.jpg> [镜框侧面图] [更多镜框图...] --out 输出目录
```

- 需要 `GEMINI_API_KEY`（.env 或环境变量；免费层即可）
- 首参必须是**人脸照片**（用户自拍），其余都是**产品图**（镜框正面/侧面/细节）
- 可选参数 `--count 2`（每张自拍到 N 张候选，默认 2）

## 四步管线

### 1. 验图（生成前必做，用 Read 看图本体）

- 自拍：正脸或微侧、光线能看清面部、分辨率 ≥500px。躺脸/背脸/多人脸 → 退回让用户重拍
- 镜框图：正面清晰、无强反光遮细节、最好白底。镜框斜放/局部遮挡 → 提示用户补正面图
- **禁止跳过验图直接生成**——垃圾进垃圾出，浪费配额

### 2. 组装 prompt（模板在此，只准微调场景词）

```
Take the eyeglasses from the product photo(s) and show them worn naturally by the person in the selfie.
Rules:
- Preserve the person's identity exactly: same face, same expression, same hairstyle, same background.
- Keep the frame EXACTLY as the product photo: same shape, same color, same proportions, same hinge and temple details.
- Natural fit: frame sits on the nose bridge, temples reach the ears, slight natural shadow where the frame touches the skin.
- Photorealistic. No text, no watermark, no extra people.
〔场景词可换: studio portrait / outdoor daylight / warm indoor…〕
```

### 3. 生成

- 模型：`gemini-3-pro-image`（首选，多图合成强）；备选 `nano-banana-pro-preview`、`gemini-3.1-flash-image`
- 脚本已内置模型探活降级（同 geo 脚本模式）
- 候选 2 张起——生成有随机性，单张容易翻车

### 4. QC 门（生成后必做，用 Read 看结果图，逐条过）

| # | 检查 | 不过怎么办 |
|---|---|---|
| 1 | 镜框形状/颜色与产品图一致 | 重生成，prompt 强调 "keep exact frame shape" |
| 2 | 人脸身份未漂移（还是同一个人） | 重生成，强调 identity |
| 3 | 佩戴位置合理（鼻托/镜腿/松紧） | 重生成，强调 bridge/temple fit |
| 4 | 无畸变（镜片反光怪异/手指数量/背景扭曲） | 重生成 |
| 5 | 整体可信度——你自己会信这是真试戴吗 | 不过=不给用户看 |

**QC 全过才算交付。给用户看图时说明：AI 生成试戴效果，实物以产品图为准（诚实制）。**

## 边界

- 只做眼镜（光学镜/墨镜）。服装/家具/帽子不在本技能
- 每次生成记一行进 QC 记录（日期/模型/候选数/一次通过率），攒数据看哪个 prompt 变体最稳
- 商用上站（放产品页）前，同一镜框至少 3 张不同脸型测试通过
