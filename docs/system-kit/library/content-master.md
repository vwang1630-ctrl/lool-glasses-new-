# 内容总纲 CONTENT MASTER — loollook.com

> **2026-10-07 建立：操盘手系统从 Fuzz Sofa 切换到 loollook.com 眼镜 DTC。**
> 此前的 Fuzz Sofa 内容排期全部作废。

---

## §A 发布规则

**1. 画像绑定**（答不出=不产）：

- early-presbyopia-professional → 去老年化叙事 + 虚拟试戴引导
- progressive-curious → 渐进镜片教育 + 3 周适应保障
- style-conscious-reader → 产品美学 + 搭配建议
- value-seeking-couple → 价格对比 + 退换保障 + 镜片品牌背书
- tech-savvy-presbyope → 技术创新叙事 + 工具教程
- gift-buyer-adult-child → 礼品场景 + 节日季推送

**2. 品牌写作规则**（继承 brand-library.json V1.1.0）：

- 禁用 senior/elderly/old/aging 等老年标签词
- 不说 "anti-aging"，说 "ageless design" 或 "redesigned for the 45-60 generation"
- 品牌名：小写 lool（不是 LOOL 或 Lool）
- 镜片品牌层级：lool House < Mingyue < Essilor/ZEISS < Transitions
- **禁止说"我们更便宜"或"价格低3-5x"** — 同价竞争，不打价格牌
- 竞品对比时不点名攻击，用'other online eyewear stores'或'typical AR try-on'暗示

**3. 内容结构**：

- 开头痛点钩子
- 中段产品=解法（≥2 产品内链）
- 结尾 CTA 回 PDP

---

## §B 首批内容计划（2026-10 月）

### Blog 首发批次（按优先级排序 — ZEELOOL截胡优先）

| 优先级 | 标题                                                                                 | 关键词                                                                                         | 画像                                                   | 状态          |
| ------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------- |
| **1**  | **Best Reading Glasses for 45-Year-Old Professionals (No Senior Look) - 2026 Guide** | reading glasses for 45+, ageless reading glasses, reading glasses that don't make you look old | early-presbyopia-professional + gift-buyer-adult-child | **首篇·待写** |
| 2      | I Tested Zeelool vs loollook PD Tool: Card vs 30s Camera (Same $19 Frame)            | zeelool alternative, zeelool vs loollook, measure PD at home                                   | tech-savvy-presbyope                                   | 待写          |
| 3      | Reading Glasses Guide: How to Choose Your First Pair                                 | reading glasses, how to choose reading glasses                                                 | early-presbyopia-professional                          | 待写          |
| 4      | Progressive Lenses vs Reading Glasses: Which Is Right for You?                       | progressive vs reading glasses                                                                 | progressive-curious                                    | 待写          |
| 5      | Lens Technology Guide: Blue Light, Photochromic, High Index                          | blue light glasses, photochromic lenses                                                        | tech-savvy-presbyope                                   | 待写          |

> **首篇策略调整（基于 SEMrush 流量结构分析）**：
> ZEELOOL 52%流量来自品牌词搜索，非品牌SEO空白，GEO几乎为零（ChatGPT仅16K=0.25%）。
> 因此首篇不写 `ZEELOOL Review`（品牌词截不到量），写 `Best Reading Glasses for 45-Year-Old Professionals (No Senior Look)`。
> 这篇同时打三个面：**SEO**（非品牌长尾词，ZEELOOL没排名）+ **GEO**（结构化内容AI可引用，ZEELOOL的SKU页不会被引）+ **TikTok脚本**（30s录屏对比 Zeelool AR vs lool True Try-On）。
> 画像4（老花羞耻10%但价值最高）— 全市场空白，loollook独占。

### 社媒首发（待 Admin 后台可用后启动）

| 平台      | 内容方向                             | 频率      |
| --------- | ------------------------------------ | --------- |
| Pinterest | 产品美图 + 搭配建议                  | 3 pin/周  |
| Instagram | 虚拟试戴 demo + 用户故事             | 2 reel/周 |
| Facebook  | 渐进镜片教育 + 问答                  | 2 post/周 |
| Reddit    | r/eyeglasses 专业回答 + r/presbyopia | 1 post/周 |

---

## §C GEO 采样计划

每月执行一次 ai-visibility.json prompt_bank 全量采样。
详见 `ai-visibility.json`。

---

## §D 回流数据

> 周报三件套：①网结位置 ②漏网之鱼（有曝光零点击→修钩子） ③归因
> 周日人工复盘。

### 判读线

| 指标               | 及格   | 优秀 | 不达标动作      |
| ------------------ | ------ | ---- | --------------- |
| Pinterest 出站 CTR | ≥0.3%  | ≥1%  | 换标题关键词    |
| IG 互动率          | ≥0.5%  | ≥2%  | 加 emotion 钩子 |
| AI 引用            | 30天≥1 | ≥3   | 加 blog 数量    |

---

## §E 当前阻塞项

1. **Admin 后台不可用**：admin_users 已插入，但 RESEND_API_KEY 未配置，无法发 OTP
2. **首页图片未上传**：仍为 Lovable 原型占位图
3. **Blog 未发布**：无 published 文章，SEO 零收录
4. **llms.txt 已部署**：`src/routes/llms[.]txt.ts` 已上线，线上 `/llms.txt` 可访问
5. **GSC 未提交**：sitemap.xml 存在但未提交到 Google Search Console
