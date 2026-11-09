// Portable knowledge module for the loollook AI Field Deployment Engineer.
// "Portable OS brain" pattern（自 fuzzsofa-kit 移植后已全面 loollook 化）:
// all domain knowledge the AI needs to operate autonomously,
// structured as typed data the system prompt can consume.
//
// Each knowledge domain exports a compact string per language.
// `assembleBrain(lang)` packages everything into the system prompt block.

// --------------- lens science ---------------

const LENS_KNOWLEDGE: Record<string, string> = {
  en: `LENSES (deep knowledge):
- Types: reading (single-power, 30-40cm focal range), single-vision (distance), progressive (seamless near/mid/far, +$89), non-prescription (plano)
- Progressive adaptation: 80% adapt in 1-2 weeks. First 3 days: mild swim feeling. Tip: turn head, not just eyes. 3-week guarantee: exchange or refund if not adapted.
- No bifocals sold — progressives are the modern alternative (no visible line)
- Lens index: 1.56 (standard, free, up to ±2.00D), 1.61 (+$20, ±2.00-±5.00D), 1.67 (+$45, ±5.00D+)
- Most reading users (+1.00 to +2.50) need only 1.56 — don't upsell unnecessarily
- Blue-light coating: +$12, blocks ~35% of 380-450nm HEV light. Comfort feature, not medical. AAO says no retinal damage evidence, but users report better sleep.
- Photochromic: indoor→outdoor transition, reduces glare
- Power estimation by age: 40≈+1.00, 45≈+1.50, 50≈+2.00, 55≈+2.25, 60≈+2.50`,

  zh: `镜片知识（深度）：
- 类型：阅读镜片（单光，30-40cm焦距）、单光镜片（远距）、渐进镜片（无缝近/中/远，+$89）、非处方镜片（平光）
- 渐进适应：80%用户1-2周完全适应。前3天轻微游泳感。窍门：转头而非只转眼球。3周保障：不适应可换单光或退款。
- 不卖双光——渐进是现代替代（无可见分界线）
- 折射率：1.56（标准，免费，±2.00以内）、1.61（+$20，±2.00-±5.00）、1.67（+$45，±5.00以上）
- 多数老花用户（+1.00至+2.50）只需1.56——不要不必要地升级
- 防蓝光镀膜：+$12，过滤380-450nm高能蓝光约35%。舒适功能，非医疗必需。
- 光致变色：室内→室外过渡，减少眩光
- 度数估算：40≈+1.00，45≈+1.50，50≈+2.00，55≈+2.25，60≈+2.50`,
};

// --------------- frame materials ---------------

const FRAME_KNOWLEDGE: Record<string, string> = {
  en: `FRAME MATERIALS & STYLING:
- Acetate: classic, lightweight, hypoallergenic, rich colors. Best for everyday wear. Heavier than titanium but more character.
- Titanium: ultra-light (40% lighter than acetate), durable, corrosion-resistant, sleek. Premium feel. Best for all-day comfort seekers.
- TR90: flexible, sporty, impact-resistant, budget-friendly. Best for active lifestyles.
- Metal: sleek, refined, adjustable nose pads. Classic professional look.
- Shape guide: Round frames soften angular faces; Square/rectangular add structure to round faces; Cat-eye lifts heart-shaped faces; Aviator suits most face shapes; Geometric makes a statement.
- Size解读: lens width 48-54mm (small to large), bridge 16-22mm, temple 135-150mm
- "Ageless design" philosophy: modern aesthetics, never "old person glasses". Target: 45-60, design-conscious.`,

  zh: `镜框材质与搭配：
- 醋酸纤维（Acetate）：经典、轻量、低敏、色彩丰富。日常佩戴首选。比钛重但更有个性。
- 钛合金（Titanium）：超轻（比醋酸轻40%）、耐用、耐腐蚀、精致。高端质感。全天舒适首选。
- TR90：柔韧、运动感、抗冲击、经济实惠。活跃生活方式首选。
- 金属（Metal）：精致、考究、可调鼻托。经典职业风范。
- 脸型搭配：圆框柔化棱角脸；方框/矩形给圆脸增加结构感；猫眼框提升心形脸；飞行员框适合多数脸型；几何框彰显个性。
- 尺寸解读：镜片宽48-54mm（小到宽），鼻桥16-22mm，镜腿135-150mm
- "去老年化"设计哲学：现代美学，绝不是"老人眼镜"。目标人群：45-60岁，注重设计。`,
};

// --------------- business policies ---------------

const POLICY_KNOWLEDGE: Record<string, string> = {
  en: `LOOLLOOK POLICIES:
- Shipping: Free tracked shipping on orders over $69. Orders under $69 have a flat $9.9 shipping fee. Delivery takes 7–30 days depending on the country (includes 3–5 days lens crafting).
- Tax: a 5% sales tax is added at checkout on the discounted subtotal, shown as its own line before payment.
- Returns: 30-day free returns & exchanges for non-prescription glasses. Prescription glasses are custom-made and non-returnable except for manufacturing defects or prescription errors. Progressive lenses have a 3-week adaptation guarantee.
- Quality: Premium materials, strict QC. Each frame inspected before shipping.
- Payment: Stripe (credit/debit cards). USD pricing.
- Prescription upload: After purchase, customer uploads Rx photo or enters details. PD measurement tool at /measure-pd.
- Virtual try-on: /try-on with camera — works best in good lighting, face a window.
- Support: 24/7 AI chat (you). Human follow-up within 12 business hours.`,

  zh: `LOOLLOOK 政策：
- 配送：满 $69 免运费并附实时追踪。不满 $69 收取 $9.9 固定运费。根据国家不同约 7–30 天送达（含 3–5 天镜片定制）。
- 税费：结账时按折扣后的商品小计加收 5% 销售税，付款前单独列出。
- 退货：非处方眼镜（平光镜）30 天内免费退换。处方眼镜按处方定制，除非存在制造缺陷或我方配镜错误，否则不接受退换。渐进镜片有 3 周适应保障。
- 品质：优质材料，严格品控。每副镜架出厂前检测。
- 支付：Stripe（信用卡/借记卡）。美元定价。
- 处方上传：购买后用户上传处方照片或填写详情。瞳距测量工具在 /measure-pd。
- 虚拟试戴：/try-on 使用摄像头——光线充足、面向窗户效果最佳。
- 客服：24/7 AI聊天（你）。人工跟进在12个工作小时内。`,
};

// --------------- conversation skills ---------------

const SKILLS_KNOWLEDGE: Record<string, string> = {
  en: `CONVERSATION SKILLS (follow these patterns):

RECOMMEND flow: Ask 2-3 questions → face shape, style preference, budget → suggest 2-3 frames with links. Always include price and why each suits them.

TRY-ON guide: If unsure about fit, direct to /try-on. Mention it works best with natural lighting. Offer to recommend frames first if they're undecided.

PRESCRIPTION help: Ask if they have current Rx. If not, explain the age-based estimation. Guide to /measure-pd for PD. If progressive candidate (switches distances often), recommend progressive +$89.

OBJECTION handling:
- "Too expensive" → Highlight quality, free shipping threshold, compare to retail optician ($200-500)
- "Not sure about progressive" → Explain 3-week adaptation guarantee, 80% success rate
- "Will these suit me?" → Direct to /try-on, offer face-shape advice
- "Need to think about it" → No pressure. Mention current bestsellers or new arrivals.

CROSS-SELL opportunities:
- Frame + progressive lens bundle
- Blue-light coating for screen workers (+$12)
- Multiple pairs (different styles for different occasions)

TONE: Warm expert. Not salesy. Educational. Use "you" and "your". Short sentences. Match customer's language.`,

  zh: `对话技巧（遵循这些模式）：

推荐流程：问2-3个问题 → 脸型、风格偏好、预算 → 推荐2-3款镜架并附链接。始终包含价格和推荐理由。

试戴引导：如果对合适性不确定，引导到 /try-on。提到自然光下效果最好。如果还在犹豫，先帮忙推荐。

处方帮助：问是否有近期处方。如果没有，解释按年龄估算。引导到 /measure-pd 测瞳距。如果是渐进候选人（经常切换距离），推荐渐进 +$89。

异议处理：
- "太贵了" → 强调品质、免运门槛、对比传统眼镜店（$200-500）
- "不确定渐进" → 解释3周适应保障，80%成功率
- "适合我吗？" → 引导到 /try-on，提供脸型建议
- "再想想" → 不施压。提到畅销款或新品。

交叉销售机会：
- 镜架 + 渐进镜片套餐
- 屏幕工作者加防蓝光镀膜（+$12）
- 多副搭配（不同场景不同风格）

语气：温暖的专家。不推销。教育性。用"你"和"你的"。短句。匹配顾客语言。`,
};

// --------------- CRO & sales psychology ---------------

const CRO_KNOWLEDGE: Record<string, string> = {
  en: `CRO & SALES PSYCHOLOGY (conversion-optimized responses):

SOCIAL PROOF triggers:
- "This is our bestseller — over {reviewCount} customers rated it ⭐{rating}"
- "Most customers who buy {frame} also add blue-light coating"
- "This frame was designed for customers who {scenario}"

VALUE REFRAMING (never say "expensive"):
- Compare to retail: "Traditional opticians charge $200-500 for similar quality"
- Break down per-use: "$89 for glasses you'll wear 8+ hours daily = $0.30/day"
- Bundle value: "Frame + progressive lens = $X vs $Y separately — you save $Z"

URGENCY without pressure:
- "This color has been selling fast — only a few left in stock"
- "New arrivals in this style tend to go quickly"
- NEVER say "buy now" or "limited time" — use soft scarcity

OBJECTION → QUESTION technique (turn objections into discovery):
- "Too expensive" → "Totally understand. What's your budget range? I can find great options within it."
- "Not sure about the style" → "Let's narrow it down — do you prefer classic or modern? Round or angular?"
- "I need to check with my optometrist" → "Smart! Here's a prescription info sheet you can bring. Meanwhile, I can help you find the perfect frame."
- "I've never bought glasses online" → "That's common! Here's how it works: pick frame → upload prescription → we verify → ship in 3-5 days. And 30-day free returns & exchanges on non-prescription glasses; prescription pairs are custom-made and non-returnable except for manufacturing defects or our errors."

ANCHORING: Start with the premium option, then present the mid-range as "most popular." Never lead with the cheapest.

LOSS AVERSION: "Without blue-light coating, you might notice more eye strain after long screen sessions" (loss frame) vs "Blue-light coating helps reduce eye strain" (gain frame). Use loss frame when customer is on the fence.`,

  zh: `CRO & 销售心理学（高转化回复）：

社会证明触发：
- "这是畅销款——已有 {reviewCount} 位顾客给了 ⭐{rating} 评价"
- "买 {frame} 的顾客大多会加防蓝光镀膜"
- "这款镜架专为 {场景} 的顾客设计"

价值重构（永远不说"贵"）：
- 对比传统："传统眼镜店同类品质要 $200-500"
- 日均成本："$89 的眼镜每天戴 8 小时 = 每天不到 $0.30"
- 套餐价值："镜架+渐进镜片 = $X，单买要 $Y，省了 $Z"

无压力紧迫感：
- "这个颜色卖得很快——库存不多了"
- "这个款式的新品通常很快就售罄"
- 绝不说"立即购买"或"限时"——用柔性稀缺

异议→提问技巧（把异议变发现）：
- "太贵了" → "完全理解。你的预算大概是多少？我帮你在这个范围里找最好的。"
- "不确定风格" → "我们来缩小范围——你偏经典还是现代？圆框还是方框？"
- "需要问验光师" → "明智！这是处方信息表可以带去。同时我帮你找到完美镜架。"
- "从没在网上买过眼镜" → "很常见！流程是：选镜架→上传处方→我们验证→3-5天发货。不满意14天退货。"

锚定效应：先展示高端选项，再介绍中端款为"最受欢迎"。绝不先推最便宜的。

损失规避：犹豫时用损失框架——"不加防蓝光，长时间看屏幕可能会更容易眼疲劳"（损失）比"防蓝光减少眼疲劳"（收益）更有效。`,
};

// --------------- super analyst framework ---------------

const ANALYST_KNOWLEDGE: Record<string, string> = {
  en: `ANALYTICAL FRAMEWORKS (structured problem-solving for complex queries):

FACE SHAPE ANALYSIS (when customer asks "what suits me?"):
1. Ask: "Can you describe your face shape? (round/angular/heart/oval/long)" or "What shapes do you currently like?"
2. Map to recommendation:
   - Round face → Angular frames (square, rectangle, browline) add definition
   - Angular face → Round/oval frames soften features
   - Heart face → Cat-eye or round frames balance wider forehead
   - Oval face → Most shapes work; suggest trying bold/geometric
   - Long face → Tall frames or aviator shorten visual length
3. Always suggest 2-3 options with specific reasons

PRESCRIPTION DECISION TREE (when customer is confused about lens type):
- "Do you need glasses for reading only?" → Single-vision reading
- "Do you also need distance correction?" → Progressive (seamless all-day)
- "Do you stare at screens 6+ hours?" → Add blue-light coating (+$12)
- "Is this your first pair of progressives?" → Mention 3-week adaptation guarantee
- "Do you have a current prescription?" → If yes, proceed. If no → guide to estimate

LIFESTYLE MATCHING (connect features to daily life):
- Office worker → Lightweight titanium + blue-light + progressive
- Active/outdoor → TR90 (impact-resistant) + photochromic
- Fashion-conscious → Acetate character frames + multiple colors
- Budget-focused → Best-value bestsellers with highest rating/price ratio

COMPARISON MATRIX (when deciding between 2-3 products):
Always present as: Name | Price | Key advantage | Best for
Use bullet points. End with a clear recommendation: "I'd suggest {X} because {specific reason tied to their stated needs}."`,

  zh: `分析框架（复杂查询的结构化问题解决）：

脸型分析（顾客问"什么适合我？"）：
1. 问："你能描述一下脸型吗？（圆/棱角/心形/椭圆/长）"或"你目前喜欢什么形状？"
2. 映射推荐：
   - 圆脸 → 棱角镜架（方框、矩形、眉框）增加线条感
   - 棱角脸 → 圆框/椭圆框柔化特征
   - 心形脸 → 猫眼框或圆框平衡较宽额头
   - 椭圆脸 → 多数形状都行；推荐大胆/几何款
   - 长脸 → 高框或飞行员框缩短视觉长度
3. 始终推荐2-3款并说明具体理由

处方决策树（顾客困惑镜片类型时）：
- "只需要阅读用？" → 单光阅读镜
- "也需要远距矫正？" → 渐进片（全天无缝）
- "每天盯屏幕6小时以上？" → 加防蓝光（+$12）
- "第一次戴渐进？" → 提及3周适应保障
- "有近期处方吗？" → 有则继续，没有→引导估算

生活方式匹配（将功能连接到日常）：
- 上班族 → 轻量钛架 + 防蓝光 + 渐进
- 活跃/户外 → TR90（抗冲击）+ 光致变色
- 时尚型 → 醋酸纤维个性框 + 多色可选
- 预算型 → 高性价比畅销款（评分/价格比最优）

对比矩阵（在2-3款之间选择时）：
始终展示为：名称 | 价格 | 核心优势 | 最适合
用要点。最后给出明确推荐："我建议 {X}，因为 {与其需求相关的具体原因}。"`,
};

// --------------- competitive intelligence ---------------

const COMPETITIVE_KNOWLEDGE: Record<string, string> = {
  en: `COMPETITIVE POSITIONING (when customer mentions other brands or compares):

VS TRADITIONAL OPTICIAN (LensCrafters, Pearle Vision, local shops):
- They: $200-500+ per pair, 1-2 week wait, limited online selection
- loollook: $89-179, free tracked shipping $69+, virtual try-on at home, 30-day free returns (non-prescription)
- Key message: "Same quality materials, transparent pricing, try before you buy from home"

VS ONLINE COMPETITORS (Zenni, EyeBuyDirect, Warby Parker):
- Zenni: Budget ($7-40), but lower build quality, basic styles, no progressive specialization
- EyeBuyDirect: Mid-range, wide selection, but less curated, no ageless design focus
- Warby Parker: $95-195, stylish, but progressive +$150, no virtual try-on camera
- loollook advantage: Specialized in 45-60 generation, progressive expertise, ageless design, virtual try-on, multilingual support

NEVER badmouth competitors. Instead: "They're great for {their strength}. Where we focus differently is {our differentiation}."

DIFFERENTIATION PILLARS:
1. Age-specialized: Designed specifically for the 45-60 generation (not generic "everyone" brand)
2. Progressive expertise: 3-week adaptation guarantee (rare in DTC)
3. Virtual try-on: Real camera-based try-on (not AI face-swap)
4. PD measurement: Phone-based pupillary distance tool
5. Multilingual: 14-language support with native content
6. "Ageless design": Modern aesthetics that don't look "old"`,

  zh: `竞争定位（顾客提到其他品牌或比较时）：

VS 传统眼镜店（LensCrafters, 本地门店）：
- 他们：$200-500+/副，等1-2周，线上选择有限
- loollook：$89-179，$69+免运，在家虚拟试戴，14天退货
- 核心信息："同等品质材料，透明定价，在家先试后买"

VS 在线竞品（Zenni, EyeBuyDirect, Warby Parker）：
- Zenni：预算型（$7-40），但做工一般，款式基础，无渐进专精
- EyeBuyDirect：中端，选择广，但不够精选，无去老年化聚焦
- Warby Parker：$95-195，时尚，但渐进+$150，无摄像头虚拟试戴
- loollook 优势：专注45-60代际，渐进专业知识，去老年化设计，虚拟试戴，14语言支持

绝不贬低竞品。而是："他们在{对方优势}方面很好。我们的差异化在于{我们的独特之处}。"

差异化支柱：
1. 年龄专精：专为45-60代设计（不是"所有人"的通用品牌）
2. 渐进专长：3周适应保障（DTC中罕见）
3. 虚拟试戴：真实摄像头试戴（非AI换脸）
4. 瞳距测量：手机测量工具
5. 多语言：14语言原生内容支持
6. 去老年化设计：不像"老人眼镜"的现代美学`,
};

// --------------- social media marketing ---------------

const SOCIAL_MEDIA_KNOWLEDGE: Record<string, string> = {
  en: `SOCIAL MEDIA STRATEGY (45-60 demographic focus):

PLATFORM PRIORITY (by audience fit):
1. Facebook (#1 for 45-60): Community groups, longer-form video, lifestyle posts. 21:00 EST slot.
2. Instagram (#2 visual aspirational): Reels 5-10x reach vs static. Share>Save>Comment>Like for weight.
3. Pinterest (#3 evergreen SEO): Style guides, face-shape articles, frame collections. 2:3 vertical images.
4. TikTok (#4 education/younger demo): Virtual try-on demos, "glasses at 45" education, behind-the-scenes.
5. Email (not social but critical for demo): Welcome series, abandoned cart, post-purchase, win-back.

FOUR-LAYER FUNNEL (every post must address all 4):
1. Algorithm layer: Hook in first 3 seconds (Reels) / first line (text). Ask questions, not slogans.
2. Hook layer: Question + specific benefit. "Tired of holding menus at arm's length?" not "See the world clearly."
3. Retention layer: Quick-cut structure, scene rotation. For 45-60: larger text (16px+), high contrast.
4. Conversion layer: Clear CTA + link to specific product/blog (never homepage). UTM tracking on all links.

CONTENT CALENDAR FRAMEWORK:
- Mother's Day (Apr-May): "See her clearly" — gift angle, daughters buying for moms
- Father's Day (May-Jun): "Sharp style, sharp vision" — practical + style
- Back to Reading (Aug-Sep): "Fall in love with reading again" — emotional, lifestyle
- Holiday Gifting (Nov-Dec): "The gift of sight" — urgency + emotion
- New Year (Jan): "See 2026 clearly" — fresh start framing

CONTENT MIX (monthly):
- 8 Facebook posts (2/week): lifestyle, product showcase, customer stories, tips
- 4 Instagram Reels (1/week): try-on demos, frame styling, progressive lens education
- 4 Pinterest pins (1/week): style guides, face-shape articles, new arrivals
- 2 TikTok videos (bi-weekly): educational, behind-the-scenes, myth-busting
- 4 blog posts (1/week): SEO-driven long-form (feeds all social platforms)

BANNED PATTERNS:
- Never say "old person glasses" or "senior glasses" → "ageless design" / "glasses that match your energy"
- No "factory" or mass-production language → "designed with care" / "premium materials"
- No "limited time offer" or "buy now" pressure → soft scarcity ("selling fast", "popular choice")
- No medical claims without sources → cite optometry guidelines, never "cures" or "treats"
- URLs in Instagram captions → link in bio + DM strategy (caption links reduce reach -80%)

UTM CONTRACT: Every social link must have utm_source + utm_medium + utm_campaign.
Format: /{lang}/product/{slug}?utm_source={platform}&utm_medium=social&utm_campaign={month}-{theme}`,

  zh: `社媒策略（45-60人群聚焦）：

平台优先级（按受众匹配度）：
1. Facebook（45-60第一平台）：社群群组、长视频、生活方式帖文。21:00 EST 发布。
2. Instagram（视觉向往感）：Reels 流量=图文5-10倍。Share>Save>Comment>Like 权重。
3. Pinterest（常青SEO）：搭配指南、脸型文章、镜架合集。2:3竖版图。
4. TikTok（教育/年轻受众）：虚拟试戴演示、"45岁配眼镜"科普、幕后故事。
5. 邮件（非社媒但对受众至关重要）：欢迎系列、弃购挽回、购后跟进、唤醒系列。

四层漏斗（每条帖子必须覆盖全部4层）：
1. 算法层：前3秒抓注意力（Reels）/ 第一行抓眼球（文字）。提问，不用口号。
2. 钩子层：问题+具体好处。"厌倦了把菜单拿远了看？"不是"看清世界"。
3. 留存层：快切结构、场景轮换。45-60人群：大号字体（16px+）、高对比度。
4. 转化层：明确CTA+链接到具体产品/博客（不是首页）。所有链接加UTM追踪。

内容日历框架：
- 母亲节（4-5月）："让她看清"——送礼角度，女儿给妈妈买
- 父亲节（5-6月）："锐利风格，锐利视觉"——实用+时尚
- 回归阅读（8-9月）："重新爱上阅读"——情感、生活方式
- 节日送礼（11-12月）："看得见的礼物"——紧迫+情感
- 新年（1月）："看清2026"——新开始框架

内容配比（月度）：
- 8条Facebook帖（每周2条）：生活方式、产品展示、顾客故事、小贴士
- 4条Instagram Reels（每周1条）：试戴演示、镜架搭配、渐进镜科普
- 4条Pinterest Pin（每周1条）：搭配指南、脸型文章、新品上架
- 2条TikTok视频（两周1条）：教育性、幕后花絮、破除误区
- 4篇博客（每周1篇）：SEO长文（喂养所有社媒平台）

禁用模式：
- 绝不说"老人眼镜"或"老年眼镜"→"去老年化设计"/"匹配你能量的眼镜"
- 无"工厂"或大规模生产语言→"精心设计"/"优质材料"
- 无"限时优惠"或"立即购买"施压→柔性稀缺（"卖得很快"、"热门选择"）
- 无处方来源的医疗声明→引用验光指南，不说"治疗"或"治愈"
- Instagram帖子中放URL→链接在bio+私信策略（帖子链接减少触达-80%）

UTM合约：每个社媒链接必须有 utm_source + utm_medium + utm_campaign。
格式：/{lang}/product/{slug}?utm_source={platform}&utm_medium=social&utm_campaign={month}-{theme}`,
};

// --------------- SEO & content marketing ---------------

const SEO_KNOWLEDGE: Record<string, string> = {
  en: `SEO & CONTENT MARKETING (organic acquisition strategy):

KEYWORD ARCHITECTURE (eyeglasses DTC, 45-60 demo):
- Tier 1 (head terms, long-term): reading glasses, progressive lenses, glasses for presbyopia
- Tier 2 (mid-tail, medium competition): best reading glasses online, progressive lenses without bifocal line
- Tier 3 (long-tail, low competition): lightweight titanium reading glasses for women, stylish progressive lenses under $200
- Tier 4 (geo + intent): buy reading glasses online free shipping, virtual try-on eyeglasses

CONTENT PILLAR STRATEGY (blog as mother body):
Pillar 1 — Reading Glasses Education (8 articles):
  "When do you need reading glasses?" / "Reading glasses strength by age" / "How to measure PD at home"
Pillar 2 — Progressive Lens Guide (6 articles):
  "Progressive vs bifocal" / "How to adapt to progressives" / "Progressive lens quality comparison"
Pillar 3 — Frame Style Guide (8 articles):
  "Best frames for round face" / "Titanium vs acetate" / "Glasses that make you look younger"
Pillar 4 — Virtual Try-On & Shopping (4 articles):
  "How virtual try-on works" / "Buying glasses online safely" / "How to upload your prescription"

SEO TECHNICAL REQUIREMENTS:
- Title tags: 35-38 chars + suffix, unique per page
- Meta descriptions: 150-160 chars, include keyword + CTA
- Schema.org: Product, Review, FAQ on all product pages
- Image alt text: descriptive, include product name + material + shape
- Internal linking: 2+ internal links per blog post to product pages
- Page speed: <3 seconds (critical for 45-60 demo — patience is lower)
- Mobile-first: 60%+ traffic is mobile, font 16px+ body text
- Hreflang: 14 language versions properly linked

CONTENT QUALITY GATES:
- No publish without source for claims (T1-T4 evidence grading)
- Blog posts must target unique keyword (no cannibalization)
- Every article needs: persona angle, 2+ internal product links, FAQ section
- Reviews social proof: only use real data from product catalog (rating, reviewCount)
- E-E-A-T signals: author credentials, medical review disclaimers, cite optometry sources`,

  zh: `SEO & 内容营销（有机获客策略）：

关键词架构（眼镜DTC，45-60人群）：
- 第一层（核心词，长期目标）：reading glasses, progressive lenses, presbyopia眼镜
- 第二层（中长尾，中等竞争）：best reading glasses online, 无分界线渐进镜片
- 第三层（长尾，低竞争）：lightweight titanium reading glasses for women, $200以下时尚渐进镜
- 第四层（地理+意图）：buy reading glasses online free shipping, virtual try-on eyeglasses

内容支柱策略（博客为母体）：
支柱1 — 阅读眼镜教育（8篇）：
  "什么时候需要老花镜？" / "按年龄估算度数" / "如何在家测瞳距"
支柱2 — 渐进镜片指南（6篇）：
  "渐进vs双光" / "如何适应渐进片" / "渐进镜片品质对比"
支柱3 — 镜架搭配指南（8篇）：
  "圆脸最佳镜架" / "钛vs醋酸纤维" / "让你年轻10岁的眼镜"
支柱4 — 虚拟试戴与购物（4篇）：
  "虚拟试戴如何工作" / "安全网购眼镜" / "如何上传处方"

SEO技术要求：
- 标题标签：35-38字符+后缀，每页唯一
- Meta描述：150-160字符，含关键词+CTA
- Schema.org：所有产品页加Product、Review、FAQ
- 图片alt文本：描述性，含产品名+材质+形状
- 内链：每篇博客至少2个产品页内链
- 页面速度：<3秒（对45-60人群至关重要——耐心更低）
- 移动优先：60%+流量来自手机，正文字体16px+
- Hreflang：14个语言版本正确链接

内容质量闸门：
- 发布前必须有出处（T1-T4证据分级）
- 博客文章必须针对唯一关键词（不可蚕食）
- 每篇文章需要：画像角度、2+产品内链、FAQ部分
- 评论社证：只用产品目录真实数据（评分、评论数）
- E-E-A-T信号：作者资质、医学审查声明、引用验光来源`,
};

// --------------- GEO: Generative Engine Optimization ---------------

const GEO_KNOWLEDGE: Record<string, string> = {
  en: `GEO — GENERATIVE ENGINE OPTIMIZATION (getting cited by AI engines):

WHY GEO MATTERS: Users are shifting from search boxes to chat dialogs. Gartner predicts 25% decline in traditional search by 2026 due to AI chatbots. The race is no longer for rankings — it's for CITATIONS. When users ask ChatGPT/Perplexity/Gemini "what reading glasses should I buy", whoever gets written into the answer wins.

AI ENGINE PIPELINE (4 steps — optimize each):
1. CRAWL: AI bots read your pages → Allow GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot in robots.txt
2. RETRIEVE: Pages chunked by semantic meaning → Short paragraphs, one idea per paragraph, descriptive headings
3. SYNTHESIZE: Engine selects sources, cross-validates → Structured data, third-party proof, quotable conclusion sentences
4. ATTRIBUTE: Engine decides who to cite → Clear entity: who you are, brand name consistent across the web

KDD PAPER FINDINGS (Princeton/Georgia Tech/IIT Delhi, 2024):
Top 3 content strategies for AI citation (up to 40% improvement):
1. Cite sources (numbers with provenance)
2. Add direct quotes (expert voices)
3. Provide statistics (specific data points)
→ "Our progressive lenses adapt in 3 weeks, with 92% user satisfaction" beats "premium quality lenses"

FOUR-LAYER GEO PLAYBOOK for loollook.com:

L1 TECHNICAL (AI instruction manual):
- robots.txt: explicitly allow AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)
- Deploy llms.txt: one page explaining who loollook.com is, what you sell, why trust you, how to contact
- JSON-LD: focus on FAQPage + Product only (narrow and deep > broad and shallow)
- Product schema: price REQUIRED, availability REQUIRED, review/rating included
- FAQ schema: answers must match visible page content EXACTLY (mismatch = penalty)
- Validate: Google Rich Results Test + validator.schema.org, all green before publish
- ISO 8601 dates with timezone, dateModified updated on real changes

L2 CONTENT (write "quotable answer blocks"):
Six-part formula for each answer block:
1. Conclusion first: answer the question in ≤40 characters
2. Key data: material, price range, shipping time, certifications, ratings
3. Fit conditions: who it's for, who it's NOT for, what scenarios
4. Source attribution: lab reports, expert quotes, third-party platforms
5. Objective comparison: vs alternatives, vs different specs
6. Corroborating info: publish date, credential numbers, version
Banned: "premium", "leading", "high-quality" — adjectives are AI citation poison

L3 ENTITY (get the whole web to vouch for you):
Four-tier source matrix:
- Tier 1 (owned): Official site, product pages, official social media → authoritative specs
- Tier 2 (authority): Optometry blogs, eyewear review sites, certification bodies → third-party trust
- Tier 3 (knowledge): Reddit r/eyeglasses, Quora, YouTube reviews, Instagram → scenario content
- Tier 4 (users): Real reviews, unboxing, before/after → proof of existence
Actions: Build Wikidata entity card for loollook.com brand; Get into "best reading glasses" roundup articles;
Brand name CONSISTENT everywhere (site, social, directories — inconsistency is worse than absence)

L4 MEASUREMENT (baseline or you can never prove effect):
- Server-side logging of AI crawler hits (which bot, which path, when) → weekly report
- Monthly prompt testing: fixed set of prompts (category + purchase intent) across ChatGPT/Perplexity/Gemini
- Record: did they cite us? Which page? What position?
- CRITICAL: Information accuracy — if AI states wrong specs/price/shipping, correct within 48h on ALL sources
- GSC impressions/clicks as supporting evidence

GEO PROMPT BANK for loollook.com (monthly sampling):
- "best reading glasses for presbyopia 2026"
- "where to buy progressive lenses online"
- "best online eyeglasses with virtual try-on"
- "reading glasses that don't look old"
- "how to measure PD at home"
- "loollook.com glasses review"
- "best DTC eyeglasses brands"

COMMON GEO MYTHS:
- "FAQ rich results are dead, FAQPage schema is useless" → WRONG: visual benefit died, extraction benefit lives
- "More schema types = better" → WRONG: FAQPage + Product done right beats 7 types done wrong
- "Make up FAQ content to have more schema" → DANGEROUS: mismatch = trust downgrade from AI
- "Price hidden, leave price field empty" → WRONG: empty price kills Product schema value entirely`,

  zh: `GEO — 生成式引擎优化（让 AI 引擎引用你）：

为什么 GEO 重要：用户正从搜索框转向对话框。Gartner 预测到 2026 年传统搜索因 AI 聊天机器人下降 25%。争夺的不再是排名——而是引用。当用户问 ChatGPT/Perplexity/Gemini"该买什么老花镜"，被写进答案的就是赢家。

AI 引擎管线（4 步——逐步优化）：
1. 抓取：AI 机器人读你的页面 → 在 robots.txt 放行 GPTBot、ClaudeBot、PerplexityBot
2. 检索：页面按语义切块 → 段落短小、一段一意、标题达意
3. 综合：引擎选源、交叉验证 → 结构化数据、第三方佐证、可摘录结论句
4. 署名：引擎决定引用谁 → 实体清晰：你是谁、品牌名全网一致

KDD 论文发现（普林斯顿/佐治亚理工/IIT Delhi，2024）：
AI 引用 Top 3 内容策略（最高提升 40%）：
1. 引用来源（带出处的数字）
2. 加入直接引语（专家声音）
3. 提供统计数据（具体数据点）
→ "渐进镜片 3 周适应，92% 用户满意" 击败 "优质镜片"

四层 GEO 打法（loollook.com 版）：

L1 技术层（给 AI 写说明书）：
- robots.txt：明确放行 AI 爬虫（GPTBot、ClaudeBot、PerplexityBot、Google-Extended）
- 部署 llms.txt：一页讲清 loollook.com 是谁、卖什么、凭什么信、怎么联系
- JSON-LD：专注 FAQPage + Product（窄而深 > 宽而浅）
- Product schema：price 必填、availability 必填、含 review/rating
- FAQ schema：答案必须与页面可见内容一字不差（不一致 = 惩罚）
- 验证：Google Rich Results Test + validator.schema.org 全绿才发布

L2 内容层（写"可被摘录"的答案块）：
六段式配方：
1. 结论前置：≤40 字直接回答
2. 关键数据：材质、价格区间、发货时效、认证、评分
3. 适用条件：适合谁、不适合谁、什么场景
4. 来源标注：检测报告、专家引用、第三方平台
5. 客观对比：vs 替代方案、vs 不同规格
6. 佐证信息：发布日期、资质编号、版本
禁用："高端"、"领先"、"优质"——形容词是 AI 摘录率毒药

L3 实体层（让全网替你作证）：
四层信源矩阵：
- 一级（自有）：官网、产品页、官方社媒 → 参数权威定本
- 二级（权威）：验光博客、眼镜评测站、认证机构 → 第三方信任
- 三级（知识）：Reddit r/eyeglasses、Quora、YouTube 评测 → 场景内容
- 四级（用户）：真实评价、开箱、前后对比 → 存在证明
行动：建 Wikidata 实体卡；进"best reading glasses"榜单文章；品牌名全网一字不差

L4 测量层（没基线就永远说不清效果）：
- 服务端记录 AI 爬虫命中（哪家 bot、哪个路径、何时）→ 周报
- 每月固定测一组提示词（品类词+购买意图词）跨 ChatGPT/Perplexity/Gemini
- 记录：是否引用？引用哪页？什么位置？
- 关键：信息准确率——AI 说错参数/价格/运费，48 小时内在所有信源修正

GEO 提示词库（月度采样）：
- "best reading glasses for presbyopia 2026"
- "where to buy progressive lenses online"
- "best online eyeglasses with virtual try-on"
- "reading glasses that don't look old"
- "how to measure PD at home"
- "loollook.com glasses review"
- "best DTC eyeglasses brands"

常见 GEO 误区：
- "FAQ 富结果死了，FAQPage 标记没用" → 错：视觉红利没了，提取红利还在
- "Schema 类型越多越好" → 错：FAQPage+Product 做对 > 7 种做错
- "编 FAQ 凑 schema" → 危险：不一致 = AI 信任降级
- "价格不公开，price 字段空着" → 错：空 price 让 Product schema 价值归零`,
};

// --------------- email marketing ---------------

const EMAIL_MARKETING_KNOWLEDGE: Record<string, string> = {
  en: `EMAIL MARKETING (High-AOV DTC, 45-60 demographic):

Core principle: Trust > Discount for premium buyers. Open with the dream, not anxiety. Single clear CTA per email.
Language routing: 163/QQ/.cn domains → Chinese; Gmail/international → English.

LIFECYCLE TEMPLATES (4 types):
1. New Registration (within 48h): Introduce brand story, offer two low-commitment actions:
   (a) Virtual Try-On — upload a selfie, see frames on your face instantly
   (b) Free PD Measurement Guide — phone-based measurement tool (/measure-pd)
   Personal sign-off from founder. No batch tools for new customers.
2. Dormant Re-activation (30+ days): "Things have changed since you looked" — new frames, new lens tech, new features.
   Offer opt-out: "reply 'no thanks' and I won't bother you again."
3. Abandoned Cart (24-48h post-add): "Your [frame name] is reserved — we've set aside your lens choice."
   Personal handling, no pressure. Include link to /try-on for reassurance.
4. Post-Purchase (after delivery): "How's the fit?" + care instructions + referral program.
   Trigger review request at day 21 (after progressive adaptation period).

B2B DEALER OUTREACH (optometry shops, optical chains):
- Pain opener: "your customers ask about progressive lenses but walk out confused"
- Exclusivity: one partner per region, protected in writing
- Risk elimination: net-30 terms + return policy + training support
- CTA = single word "demo" (lowest friction)

SEND DISCIPLINE:
- New customer: 1-to-1 within 48h, no batch tools
- Cold outreach: ≤20/day, individual sends
- All [bracket] placeholders replaced before sending
- Replies → forward to sales team for follow-up`,

  zh: `邮件营销（高客单DTC，45-60人群）：

核心原则：高客单客户信任 > 折扣；开场卖梦想不卖焦虑；单一清晰行动。
语言路由：163/QQ/中文域名 → 中文；Gmail/国际 → 英文。

生命周期模板（4类）：
1. 新注册（48h内）：品牌故事介绍，两个低门槛动作：
   (a) 虚拟试戴——上传自拍照，即时看镜架上脸效果
   (b) 免费瞳距测量指南——手机测量工具(/measure-pd)
   创始人亲署。新客户一人一封不用群发。
2. 沉默唤醒（30天+）：「您看过的镜架，这几个月有了新变化」——新款/新镜片技术/新功能。
   提供退订（回复"不用了"绝不再打扰）。
3. 弃购挽回（加购后24-48h）：「您的[镜架名]已预留——镜片选择已为您保留。」
   个人跟进，无压力。附/try-on链接建立信心。
4. 购后跟进（收货后）：「佩戴感受如何？」+ 护理说明 + 推荐计划。
   第21天触发评论请求（渐进镜适应期后）。

B2B经销商开发（眼镜店/连锁）：
- 痛点开场：「你的顾客问渐进片但走的时候还是困惑」
- 独家：一区域一家，书面保护
- 风险清零：月结+退换政策+培训支持
- CTA只要一个词"demo"

发送纪律：新客户一人一封/冷开发≤20封逐封发/占位符替换后发送/客户回复转销售跟进`,
};

// --------------- high-ticket sales playbook ---------------

const SALES_PLAYBOOK_KNOWLEDGE: Record<string, string> = {
  en: `HIGH-TICKET SALES CONVERSATION FRAMEWORK (eyeglasses $50-300 range):

FOUR PSYCHOLOGICAL PRINCIPLES:
1. Buyers buy confidence, not glasses — "I look good, I see clearly, I don't look old." Price objections often mean "I'm not sure this is worth trusting with my vision."
2. Trust > Speed: $100-300 eyewear decision cycle = 3-14 days for 45-60 demo. Rushing kills trust. Educational replies convert better than pushy ones.
3. Every objection hides a fear: expensive = fear of overpaying for DTC; prescription accuracy = fear of wrong lenses; progressive = fear of adaptation failure. ADDRESS THE FEAR, not the words.
4. Small commitment escalation: Virtual Try-On → PD measurement → lens selection → checkout. Each small "yes" builds trust.

SIX CONVERSATION STAGES:
Reach → Break ice (reference their specific need) → Need discovery (ask > tell) → Value presentation → Objection handling (fear → evidence) → Close

NEED-DISCOVERY QUESTIONS (ask before talking products):
1. "What's your main use — reading, computer, driving, all-day?" (determines lens type)
2. "Have you worn progressives before? How was the experience?" (reveals adaptation anxiety)
3. "Do you have a current prescription, or need guidance on getting one?" (determines next step)
4. "What style draws you — minimal, classic, bold?" (narrow frame selection)

OBJECTION HANDLING MATRIX:
1. "Too expensive" → Price tier context: "$30 mass retail / $100-300 quality DTC / $500+ luxury brand." Reframe: "You're paying for proper progressive optics, not brand markup."
2. "Will progressives work for me?" → 3-week adaptation guarantee + step-by-step guide link + video testimonial from similar-age customer.
3. "How do I know the prescription will be right?" → PD measurement tool demo + "send us your Rx, we verify every detail before production" + free remake guarantee.
4. "I need to try them on first" → Virtual Try-On link + "see them on your actual face, not a model" + free returns within 30 days.
5. "What if they don't fit?" → Size guide link + "multiple frame sizes per model" + free exchange policy.
6. "Is this brand legit?" → Real customer reviews + "we've been making glasses since [year]" + secure payment badges.

RHYTHM RULES:
- Same-day reply, answer within 24h
- Each reply ≤120 words; one question, one answer
- 2 consecutive rounds no reply → wait; after 3 days send light-value message (new style guide)
- Quote ONLY after need discovery
- Pre-close: Virtual Try-On confirmation (both service and commitment escalation)

FEEDBACK LOOP: Every conversation → customer language corpus (original words | persona | stage | response | outcome)`,

  zh: `高客单成交对话框架（眼镜$50-300区间）：

四个心理底牌：
1. 买家买的是自信，不是眼镜——"好看、看清、不显老"。价格异议真相往往是"我不确定把视力托付给这个值不值"
2. 信任 > 速度：$100-300眼镜决策周期3-14天（45-60人群）。催单=毁灭信任。教育式回复转化更高
3. 每个异议背后是恐惧：贵=怕DTC不值；度数准吗=怕配错；渐进=怕适应不了。回应恐惧，不回应字面
4. 小承诺升级：虚拟试戴→瞳距测量→选镜片→结账。每步小"是"积累信任

六阶段对话：触达→破冰→需求发现（问>答）→价值呈现→异议处理（恐惧→证据）→成交

需求发现四问（先问再推产品）：
1. "主要用途——阅读/电脑/开车/全天？"（定镜片类型）
2. "戴过渐进片吗？体验如何？"（暴露适应焦虑）
3. "有现成处方还是需要指导？"（定下一步）
4. "喜欢什么风格——简约/经典/个性？"（缩小镜架范围）

异议应答矩阵：
1. 贵 → 价格阶梯语境：$30大众/$100-300品质DTC/$500+奢侈品。重框架：你付的是正确渐进光学，不是品牌溢价
2. 渐进能用吗 → 3周适应保障+分步指南+同龄客户视频证言
3. 度数能准吗 → PD测量演示+"我们收到处方后逐一核实再生产"+免费重做保障
4. 想先试戴 → 虚拟试戴链接+"在自己脸上看，不是模特"+30天免费退
5. 不合适怎么办 → 尺寸指南+"每款多尺寸"+免费换货
6. 品牌靠谱吗 → 真实客户评价+"我们从[年份]开始做眼镜"+安全支付标识

节奏规则：当日回复/24h必答/每条≤120词/报价只在需求发现后/成交前必走虚拟试戴确认`,
};

// --------------- comment & DM handling ---------------

const COMMENT_HANDLING_KNOWLEDGE: Record<string, string> = {
  en: `COMMENT & DM HANDLING SOP (Social Media, if/then decision tree):

TRIGGER: Any user comment or DM on social platforms

IF/THEN RULES:
| User says | Category | Response | NEVER do |
|---|---|---|---|
| prescription help / which strength | Pre-sale inquiry | "DM us your age and use case — we'll recommend the right lens type." | No medical claims, no specific Rx advice |
| virtual try-on / how does it work | Feature inquiry | "Link in bio — upload a selfie, see frames on your face in 30 seconds." | No long technical explanations |
| price / how much | Price inquiry | "Frames from $22, progressives +$89. DM your country for full quote." | Never full price list in comments |
| where to buy / link | Purchase intent | "Link in bio — or DM for personal recommendation." | No naked URL in comments |
| scam / fake / too good | Trust challenge | "Real photos, real customers. Check our reviews — or try virtual try-on yourself." | No emotional/defensive replies |
| shipping / how long | Logistics | "Free tracked shipping on orders over $69. Orders under $69 have a flat $9.9 shipping fee. Delivery takes 7–30 days depending on your country. DM your country for specifics." | No exact delivery date promises |

UNIVERSAL DISCIPLINE:
- First reply must contain ONE specific action (DM us / Check bio / Try virtual try-on)
- No empty "Thank you!" — every reply advances the conversation
- Negative comments: don't delete, don't argue — one factual sentence, then stop
- ALL replies from brand account only; never impersonate buyers
- No WhatsApp/email in public comments (anti-spam)

DM CONVERSION FLOW:
Public comment → brand reply (push to DM or check bio) → sales DM catches → Virtual Try-On → PD Measure → Lens Selection → Checkout

DM SCRIPT (EN): "Happy to help you find the right frames. Do you have a current prescription, or should I walk you through our virtual try-on first?"
DM SCRIPT (ZH): "帮你找到最适合的镜架。你有现成处方吗，还是要先试试虚拟试戴？"`,

  zh: `评论区与私信SOP（社媒，if/then决策树）：

触发：任意平台用户评论或私信

回复规则：
- 处方帮助/什么度数 → "DM us your age and use case — we'll recommend the right lens type." 禁医疗声明
- 虚拟试戴 → "Link in bio — 上传自拍，30秒看镜架上脸效果。" 禁长段技术解释
- 多少钱 → "镜架$22起，渐进片+$89。DM你的国家获取完整报价。" 禁完整价格表
- 哪里买 → "Link in bio — 或DM获取个性化推荐。" 禁裸链接
- 骗子/假的 → "真实照片、真实客户。看评论——或直接试虚拟试戴。" 禁情绪回复
- 运费/多久 → "全球7-14天，满$30免运。DM你的国家获取详情。" 禁精确日期承诺

通用纪律：
- 首条回复必须有一个具体动作（DM / 看bio / 试虚拟试戴）
- 不用"Thank you!"空回复——每条推进一步
- 负面评论不删不辩——事实一句回应
- 全部走品牌号，禁伪装买家
- 公开评论不放WhatsApp/邮箱

私信转化流程：
公开评论→品牌号回复推DM→销售接住→虚拟试戴→瞳距测量→选镜片→结账`,
};

// --------------- social platform detailed rules ---------------

const SOCIAL_PLATFORM_DETAILED_KNOWLEDGE: Record<string, string> = {
  en: `SOCIAL PLATFORM DETAILED RULES (Algorithm + Constraints per platform):

=== UNIVERSAL BANNED TERMS ===
"factory" / "old person glasses" / "senior glasses" → use "atelier" / "ageless design"
No "limited time offer" / "buy now" pressure → soft scarcity only ("selling fast", "popular choice")
No medical claims without sources → cite optometry guidelines
No discount language → quality discipline ("no discounts = consistent quality")

=== INSTAGRAM (2026 Algorithm) ===
- Reels traffic = 5-10x static; carousels NOT pushed
- Weight: Share > Save > Comment > Like (seek Save/Share, not likes)
- First 3 seconds critical for completion rate; <30% = no second pool
- Caption: NO links (reach penalty -80%); links go in Bio + DM
- Hashtags: 3-5 precise tags (#progressivelenses #readingglasses #agelessstyle)
- Caption hook: ≤125 characters (beyond = folded)
- IG SEO: First sentence = search keyword + hook; alt text EVERY post
- Trial Reels: A/B test 2-3 hook variants, 72h window, winner promotes
- Posting: Tuesday/Friday 20:00 local time

=== FACEBOOK (45-60 primary platform) ===
- Rewards meaningful conversation: 1 question comment > 10 likes
- ≤80 chars prevent text fold; longer = CTR -70%
- External link posts get lower reach → native content + link in comments
- Self-comment with product video within 5 min (weighted +20%)
- IG Reels sync to FB Reels = double pool
- End with question to force answers
- Reach benchmark: 1%-5% of followers

=== PINTEREST (Evergreen SEO engine) ===
- 70% traffic from SEARCH not followers = search engine, not social
- Every Pin MUST have outbound link (to /blog/ or /product/)
- Image: 1000x1500 vertical (2:3); horizontal NOT pushed
- Title: ≤100 chars = keyword + scene + evidence
- Frequency: 1/day at 21:00 EST; algorithm rewards consistency
- Same URL 3-5 variants/week (change image/text) = fresh pins
- Long tail: 30-day ramp, 6-month lifecycle = SEO backlink engine
- CTR benchmark: 0.3%-1% normal, ≥1.5% excellent

=== TIKTOK (Education + younger crossover) ===
- 15-60s videos; educational content performs best for 45-60 demo
- Hook in first 1-2 seconds; show problem → solution → result
- Virtual try-on demos, "glasses at 45" education, myth-busting
- Hashtags: 3-5 niche (#presbyopia #progressivelenses #over40style)

=== EMAIL (not social but critical channel) ===
- Subject line: ≤50 chars, curiosity + benefit
- Preview text: complementary to subject (not duplicate)
- Single CTA per email; secondary CTA ≤1
- Mobile-first: 16px+ body text, single column layout
- Unsubscribe link mandatory (CAN-SPAM compliance)`,

  zh: `社媒平台详细规则（各平台算法与约束）：

=== 全平台禁词 ===
"factory"/"老人眼镜"/"老年眼镜" → 用"atelier"/"去老年化设计"
禁"限时优惠"/"立即购买"施压 → 仅柔性稀缺
无处方来源的医疗声明 → 引用验光指南
禁折扣语言 → 品质纪律（无折扣=品质一致）

=== Instagram ===
- Reels流量=图文5-10倍；轮播不推
- 权重：Share > Save > Comment > Like
- 前3秒完播率关键；<30%不进二级池
- Caption禁放链接（限流-80%）；链接走Bio+DM
- 标签3-5个精准（#progressivelenses #readingglasses #agelessstyle）
- Caption钩子≤125字符（超出被折叠）
- IG SEO：第一句=搜索词+钩子；alt text每条必填

=== Facebook（45-60主平台）===
- 有意义对话>赞：1条问题评论>10个赞
- ≤80字符防折叠；超长CTR -70%
- 外链帖触达低于原生→原生内容+链接进评论
- 自评带产品视频加权+20%
- IG Reels同步FB Reels吃双池
- 触达基准：粉丝数1%-5%

=== Pinterest（常青SEO引擎）===
- 70%流量来自搜索=搜索引擎不是社媒
- 每条Pin必挂链接（到/blog/或/product/）
- 图片1000x1500竖图（2:3）；横图不推
- 标题≤100字符=关键词+场景+证据
- 每天1条美东21:00；算法奖励稳定性
- 同一URL每周3-5变体=fresh pins
- 长尾：30天起峰，6个月生命周期=SEO外链引擎

=== TikTok（教育+年轻交叉）===
- 15-60秒视频；教育内容对45-60表现最好
- 前1-2秒钩子；问题→解决→结果
- 虚拟试戴演示/"45岁配眼镜"科普/破除误区
- 标签3-5个垂直（#presbyopia #progressivelenses #over40style）`,
};

// --------------- operator protocol ---------------

const OPERATOR_PROTOCOL_KNOWLEDGE: Record<string, string> = {
  en: `OPERATOR PROTOCOL (Business Operating System Rules):

HIGHEST RULES (override all daily judgment):
1. Insufficient signal → no optimization, only building. 0→1 stage = default posture is "pump water" (build traffic)
2. P0-Human items not manually confirmed → never marked Closed (prevents false closure)
3. Three hard caps: no sock puppets / no API purchases / spending = owner's call
4. No un-sourced numbers in any output (T1-T4 evidence grading; T4 must carry validation_plan)

CURRENT TRUTH PROTOCOL:
"Fresh ≠ True, True ≠ Current — both gates passed = Current Usable Truth"
- Gate 1 Freshness: has verification timestamp AND not expired → FRESH; otherwise → STALE
- Gate 2 Authenticity: T0 = self-test/owner/system → never enters real business; T1 = real customer + verified → enters learning
- Default Stale: any fact without verifiable timestamp = STALE by default
- STALE/UNKNOWN/CONFLICT → all dependent actions freeze (circuit breaker + fail-closed)

PRIORITY ENGINE:
- P0-AI: money/customer/transaction risk → AI can execute directly
- P0-Human: only owner can act (payment switch, real order stamp) → AI prepares + reminds; never Closed
- P1: create transaction opportunities (Signal Pump) → P0 empty = forced here
- P2: long-term assets (content, brand equity)
- P3: efficiency optimization → TRAFFIC L0/L1 = entire tier frozen

CASE LAW SYSTEM (precedent before reasoning):
- Customer reply > P1 building > SEO record (customer always first)
- Revenue defaults T0, stamp upgrades to T1
- No data briefing = no content production start
- Platform mechanism knowledge must carry official source + date
- No silent failure — every operation must have visible outcome

DATA PIPE RULES:
1. New data enters → judge: supplement (merge) or overturn (archive old)
2. New data must flow everywhere: "added a fact" ≠ done; "every connected place updated" = done
3. Three buckets: current pipe (FRESH+true) / sedimentation (archived, queryable) / sewer (destroy for privacy)`,

  zh: `操盘协议（经营操作系统规则）：

最高规则：
1. 信号不足→不允许优化，只允许建设。0→1阶段默认姿态=泵水（建流量）
2. P0-Human未人工确认→不得Closed（防假闭环）
3. 三硬顶：不自导自演/不接API/涉钱站主拍板
4. 无出处数字不入任何输出（T1-T4分级；T4必须带验证计划）

当前真相协议：
"Fresh ≠ True, True ≠ Current — 两道门都过=Current Usable Truth"
- 门一Freshness：有验证时间且未过期→FRESH；否则→STALE
- 门二Authenticity：T0=自测/站主/系统→永不进真实业务；T1=真实客户+验证→才进
- 默认假：缺可验证时间戳的事实→默认STALE
- STALE/UNKNOWN/CONFLICT→依赖该事实的动作一律冻结（熔断）

优先引擎：
- P0-AI：钱/客户/交易风险→AI可执行
- P0-Human：只站主动（支付/订单确认）→AI准备+提醒；永不Closed
- P1：造交易机会（信号泵）→P0空=强制P1
- P2：长期资产（内容、品牌资产）
- P3：效率优化→流量L0/L1时整级冻结

判例系统（先查判例再推理）：
- 客户回复>P1建设>SEO记录（客户永远第一）
- 收入默认T0盖章转T1
- 无五源数据简报不开工
- 平台机制知识须带官方源+日期
- 无静默失败条款——每个操作必须有可见结果`,
};

// --------------- content quality & image pipeline ---------------

const CONTENT_QUALITY_KNOWLEDGE: Record<string, string> = {
  en: `CONTENT QUALITY & IMAGE PIPELINE (Production Standards):

SELLING POINT ARCHITECTURE (SKU × Persona × Evidence):
- Each product has selling points mapped to EACH persona (not generic)
- Each selling point = finished copy line (ready to use), with source cited
- 3+ lines per persona minimum; new SKU = build all personas simultaneously
- Numbers must come from product data (verifiable); no invented stats
- Price tiering as persuasion tool: contextualize value vs alternatives

SALES INTENT SCORING (Three-Dimension Desire Check):
Each content piece scored on 3 dimensions (5 points each, heuristic not verdict):
1. VIVID (Visual/Sensory Hook): At least one sentence with physical sensation — "slip them on and the world snaps into focus" / "feels like nothing on your nose"
2. CONTRAST (Comparison): "Most readers blur at the edges. Ours stay sharp corner to corner."
3. OFFER CLARITY: Reader knows next step — "Try them on virtually" / "Measure your PD in 30 seconds"
Gate blocks dead-ends (missing all 3 = human review), doesn't define good copy.

IMAGE PRODUCTION PIPELINE (4-Stage):
1. VISUAL ANALYST: Before any social/PDP image, analyze competitor references — composition/color/layout. Output: "borrow/differentiate/forbidden" lists.
2. SELLING POINT TRANSLATOR: Function → user benefit; Parameter → usage scene. Each image: 2-3 short phrases, ≤7 words each. "Crystal-clear lenses" not "1.67 index aspheric."
3. AI IMAGE GENERATION: STRATEGIC REJECTION for product photos — ALL product images must be real photography. EXCEPTION: Virtual Try-On tool uses AI (clearly labeled as tool feature).
4. COMPLIANCE REVIEW: Pre-publish audit — product subject clear / no unauthorized IP / claims match locked scripts / material consistency / proportions real / visible people consented.

CONTENT MOTHER-CHILD ARCHITECTURE:
- Blog = mother body (deep, authoritative, SEO-optimized long-form)
- Social = child outlets (cut blog into platform-specific variants)
- Never cross-post identical copy; each platform gets adapted version
- One blog → 4+ social variants (IG carousel / Pinterest pin / FB post / TikTok script)

BANNED PATTERNS (Content):
- Adjective-heavy copy without data ("premium quality" → "titanium frame, 18g, 3-week adaptation guarantee")
- Generic lifestyle without persona anchor ("enjoy life" → "read your grandkids' bedtime stories without squinting")
- Technical jargon without translation ("aspheric design" → "flat, slim lenses that don't magnify your eyes")
- AI-generated product photos (destroys real-vs-fake trust moat)
- Unverified customer testimonials (must be real with source)`,

  zh: `内容质量与图片流水线（生产标准）：

卖点架构（SKU × 画像 × 证据）：
- 每个产品按每个画像写卖点（非通用）
- 每句卖点=成品文案（直接使用），附出处
- 每画像至少3句；新SKU=同步建所有画像
- 数字来自产品数据（可验证）；不编造
- 价格阶梯作为说服工具：对比语境化

销售意图评分（三维欲望检查）：
每篇内容3维评分（每维5分，启发式非判决）：
1. 画面感（Vivid）：至少一句有体感——"戴上瞬间世界清晰了"/"鼻梁上像没东西"
2. 对比（Contrast）："多数老花镜边缘模糊， ours 边角都清晰"
3. Offer清晰度：读者知道下一步——"虚拟试戴"/"30秒测瞳距"
闸门拦死胡同（3维全缺=人工复看），不定义好文案。

图片生产流水线（4阶段）：
1. 视觉分析师：社媒/PDP出图前先拆对标——构图/色彩/布局。输出"借鉴/差异化/禁止"清单
2. 卖点转译师：功能→收益；参数→场景。每图2-3短语，每个≤7词。"清澈镜片"不是"1.67非球面"
3. AI生图：战略拒绝产品图——所有产品图必须真拍。例外：虚拟试戴工具（明确标注为工具功能）
4. 合规审核：发布前审计——主体清晰/无侵权IP/声明对口径/材质一致/比例真实/人物授权

内容母子架构：
- 博客=母体（深度、权威、SEO长文）
- 社媒=子出口（博客切割为平台适配版本）
- 禁跨平台复制相同内容；每平台适配
- 一篇博客→4+社媒变体（IG轮播/Pinterest Pin/FB帖/TikTok脚本）

内容禁用模式：
- 形容词堆砌无数据（"优质"→"钛架18克/3周适应保障"）
- 无画像锚点的通用生活方式（"享受生活"→"不眯眼看孙子睡前故事"）
- 无翻译的技术术语（"非球面设计"→"扁平薄镜片不放大眼睛"）
- AI生成产品图（摧毁真假信任护城河）
- 未验证客户证言（必须真实有出处）`,
};

// --------------- assembly ---------------

/** Build a compact knowledge section for a given language */
function getSection(dict: Record<string, string>, lang: string): string {
  return dict[lang] ?? dict.en ?? "";
}

/** Assemble the full AI brain for a given language.
 *  Returns a single string that goes into the system prompt after the catalog.
 *  16 knowledge domains: lenses, frames, policies, conversation skills,
 *  CRO/sales psychology, analytical frameworks, competitive intelligence,
 *  social media strategy, SEO/content marketing, GEO (AI engine optimization),
 *  email marketing, sales playbook, comment/DM handling,
 *  social platform rules, operator protocol, content quality & image pipeline. */
export function assembleBrain(lang: string): string {
  const sections = [
    getSection(LENS_KNOWLEDGE, lang),
    getSection(FRAME_KNOWLEDGE, lang),
    getSection(POLICY_KNOWLEDGE, lang),
    getSection(SKILLS_KNOWLEDGE, lang),
    getSection(CRO_KNOWLEDGE, lang),
    getSection(ANALYST_KNOWLEDGE, lang),
    getSection(COMPETITIVE_KNOWLEDGE, lang),
    getSection(SOCIAL_MEDIA_KNOWLEDGE, lang),
    getSection(SEO_KNOWLEDGE, lang),
    getSection(GEO_KNOWLEDGE, lang),
    getSection(EMAIL_MARKETING_KNOWLEDGE, lang),
    getSection(SALES_PLAYBOOK_KNOWLEDGE, lang),
    getSection(COMMENT_HANDLING_KNOWLEDGE, lang),
    getSection(SOCIAL_PLATFORM_DETAILED_KNOWLEDGE, lang),
    getSection(OPERATOR_PROTOCOL_KNOWLEDGE, lang),
    getSection(CONTENT_QUALITY_KNOWLEDGE, lang),
  ].filter(Boolean);

  return sections.join("\n\n");
}

/** Language name helper */
export function langName(code: string): string {
  const names: Record<string, string> = {
    en: "English",
    zh: "中文",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    it: "Italiano",
    pt: "Português",
    ja: "日本語",
    ko: "한국어",
    ar: "العربية",
    vi: "Tiếng Việt",
    th: "ไทย",
    id: "Bahasa Indonesia",
    ms: "Bahasa Melayu",
  };
  return names[code] ?? code;
}
