---
name: fuzz-produce
description: FUZZ SOFA 内容生产总闸门。凡「做产品详情页 / 上新一款沙发 / 写 blog 文章 / 数据校准复盘」都用本技能——一条管线跑通 画像反推 → 证据爬取 → 关键词对齐 → 内容生产 → 闸门校验 → 落库上线 → T1 回流。PDP 与 blog 双线 + 校准环。
---

# fuzz-produce：FUZZ SOFA 内容生产总管线

你（Claude）是这条管线的**调度员兼专业分析师**。三层分工不可越位：

| 层 | 载体 | 职责 |
|---|---|---|
| **调度层** | 本文件 | 判断路线、执行步骤、爬取证据、写内容、调命令 |
| **闸门层** | `scripts/pdp-toolbox.mjs` | 一切确定性校验。**闸门说了算，你不许绕过、不许口头辩护** |
| **记忆层** | `docs/library/`（11 库） | 唯一事实来源。写库必有门禁，读库优先于凭记忆 |

文档地图（细节在文档，本文只留路由和铁律）：
- **战略层（操盘手）** → `.claude/skills/fuzz-operator/SKILL.md`（`/fuzz-operator`：漏斗/内容矩阵/CRO 战略板 `docs/library/operator-library.json`，审计命令 `operator` / `operator-selftest`；**工单下来照走 A/B/C 线，闸门不变**；单件内容生产不经它）
- **唯一文档** → `docs/fuzz-produce-manual.md`：命令详解 §3 · 闸门规则 §4 · 活库 §5 · 数据库通道 §6 · 部署 §7 · 裁决 §8 · 模板锁+IP 纪律 §11 · GEO+画像架构蓝图 §12
- PDP 模板锁契约（机器可读，14 节布局不可改） → `docs/library/framework-lock.json`
- blog 模板锁 → `docs/library/blog-framework-lock.json`

## 品牌运营职能（2026-09-12 加，用户定调「Design Story=品牌的根」）

品牌叙事是本管线的正式职能，不是点缀。弹药库 = `docs/library/brand-library.json`（第 11 库），三件套：

- **case_studies**：成功品牌运营案例（Jellycat comfort economy / Poltronova Bocca 谱系 / collectible design 定位），每条带真实媒体出处 + applied_lesson。写 Story、品牌材料、blog 角度前先读。
- **literature**：品牌理论文献（Holt 文化品牌、Keller CBBE、Aaker 品牌识别、Fournier 品牌关系、Muñiz&O'Guinn 品牌社群、Schmitt 体验模块、Belk 延伸自我）——**概念不直接出现在文案里**，只写它指挥下的具体事实与场景。
- **writing_rules**：总结写作范式（品牌根四段：设计问题→签名决策→工坊工艺→名字+承诺；签名句公式『多数同类做 X，我们让 Y 成为 Z』）。**演进制**：凡用案例/文献实际写出内容，把有效句式回填本库。

硬约束：Story 区禁市场考据风（Jellycat 考据版弃用事件）、禁通用套话；引用案例谱系必须同句带原创区隔（original by Fuzz Sofa Atelier），禁 affiliation 暗示。

---

## 0. 铁律（任何一步违反 = 停下来修，不得继续）

1. **无出处不主张**：数字必须有 source 才能写；入库走 `library add`（缺 source 自动拒绝）。AI 生成的数字必须带它看到的出处，否则丢弃。
2. **证据分级 T1–T4**：T4（分析师假设）只能带 `validation_plan` 存在于 hypotheses，**禁止作为主张写进任何文案**。画像结论引用只准 T1–T3。
3. **AI 隔离**：AI 概念对象只准进 storyText/指定叙事段且必须带标注词（r10/rb9）；AI 图一律标 ai_generated，不与实物混写。**线上场景图豁免**（2026-09-12 用户裁决）：线上在售产品的场景图**暂不标注** AI——标注折损商业说服力，等真图替换或后期统一加标；文字侧隔离（r10/rb9）不变。
4. **交期写法**（2026-09-12 用户定调全站统一）：『1–3 天生产 + 7–14 天运输（海运 25–35 天，不推荐）』，客户侧字段格式＝时间：产品制作 1-3 天，交货 7-14 天。（海运 25–35，不推荐）；旧『9–17 天』括号写法与『72–90 手工工时』叙事均已废止（r9/rb8 强制，chargeable_kg 不再改变客户侧承诺）。工艺动词诚实制：固化成型+手工细节打磨（hand-polished），禁『整体手工雕刻/雕塑』；无缝纫工序的产品（如陨石）如实省略。
9. **模块属性不可跨界**（2026-09-12 用户定调，r6/r7 强制）：每个模块内容严格符合属性定位——**场景区**（Interior Inspiration）只做氛围描述、面向室内设计师/酒店采购/别墅业主，禁任何数字参数/QC 测试数据/工业术语/尺寸/可拆卸声明（r7 场景区检查）；**材料区**＝简单名称列表 ≤6 项（如：镀锌管/定型高密度海绵/人造皮/人造皮草/亚麻/天鹅绒），禁摩擦次数/Martindale/可拆洗/QC 编号（r7 材料区检查）；**主要特点**禁钢材型号/屈服强度/QC 编号；QC 测试数据只住产品数据表（ldProperties）与白手套服务（须明确数字）与 FAQ。摩擦次数/猫抓耐磨叙事全线撤下（不是产品主打）。
10. **产品不可拆卸**（2026-09-12 用户定调）：基本上所有产品都不可拆卸（含面料），全站禁 washable/removable/可拆卸/机洗/可拆洗 声明（r6 全局禁词）；护理话术统一为日常吸尘+局部清洁。
11. **保修统一 90 天**（2026-09-12 用户定调）：代码 WARRANTY_DAYS=90 + 保修页兜底文案 + 全部客户侧文案一律 90 天；旧 5/3/2 年与 365 天写法废止。
13. **图像辨识先行**（2026-09-13 用户令建，r13 强制）：场景卡（Interior Inspiration）写文案前必须先看图本体，登记 `docs/library/scene-image-manifest.json`（seen=图里实际内容；图中没有的道具进 banned_terms，文案禁踩）。**场景卡四步流水线**：①识图(r13) → ②规格/材料/参数反推目标用户（铁律#8）→ ③目标用户×图内容定画像与行为心理学角度 → ④四拍公式＝画像锚→图内真实细节→try-in-your-room 房间钩→社交转发钩。场景区功能定位＝场景展示+**用户画像区**+try-in-your-room 引导+社交转发触发器。
5. **闸门顺序**：`validate` exit 0 → `score` ≥B → 落库。draft 是安全暂存，**published 必须用户点头**。
6. **订单污染防线**：任何订单/均值分析前必跑 `t1 inventory`（45/47 历史订单是所有者自测）。
7. **一次一个变量**：校准期改 title 不改首图、改价不改文案。
8. **画像先行**：没有 `personas` 的内容不进闸门（r12/rb11 会拦），写之前先反推。**画像必须有证据级**（2026-09-13 一号战略原则，r14 强制）：evidence_level H1–H4 + buyer_psychology 七字段（want/desire/fear/doubt/trigger/proof/action）；H1 推测级禁作事实引用、published 前须升 H2+（市场数据支持）；价格带错配（Premium 产品 × 错档画像）= 拦截。
14. **一号战略原则：Every product starts with itself.**（2026-09-13 用户裁决，r14 强制）：内容不是『填区块』而是『回答该节买家问题』——每节 psychological_job 必须与 framework-lock canonical 对齐（patch.psych_jobs 心理卡，r14 校验）；市场搜索关键词不能脱离 Product DNA（四层市场 A 直接/B 相似/C 同用户/D 同价格带）；External Intelligence ≠ Competitor Research（五信源：competitor/review/question/search/social）。

---

## A 线：PDP 详情页（上新 / 改版）

**你只向用户要四样**：图 + W/D/H/SH/重量/承重 + 真实材质表 + 价格。其余全自动。

```
0. intake          node scripts/pdp-toolbox.mjs operator-intake input.json
                   → OP-01–05：Product DNA 卡 + 风险轴 + 四层市场搜索词 + 五信源清单 + H1 画像骨架
                   （一号战略原则：先理解产品是什么，再决定去市场找什么——词不可脱离 DNA）
1. scaffold        node scripts/pdp-toolbox.mjs scaffold input.json
                   → 补丁骨架自带 14 节 psych_jobs 心理卡（canonical 岗位自动填，persona/desired_action 由你精修）
2. 反推            node scripts/pdp-toolbox.mjs persona brief <slug|input.json>
                   → 读③未覆盖主题信号 + ④爬取计划 + ⑤会怎么搜
3. 定向爬取        按 intake 四层市场词 × 五信源执行（Reddit/Quora/Trends/竞品页）：
                   - 证据 → persona-library.evidence 或 t1-evidence（带 tier+source）
                   - 竞品话术 → competitor-library（必带 evidence_tier）
                   - 有关键词结论 → keyword-library
                   - 用户原话（social/question 信源）→ r4 quote 候选 + 心理图 fear/doubt 素材
4. 画像定稿        persona audit（exit 0）→ persona infer → patch.personas
                   → OP-06 Psychology Mapping：七字段心理图（库内画像已有，新画像必填）
5. 关键词裁决      brief ⑤ 候选 → keyword-library 登记（page_assigned 一词一主位）
                   → node scripts/pdp-toolbox.mjs cannibal <patch|kw>（CONFLICT exit 1 = 先裁决）
6. 内容生产        按 14 节模板锁写 patch（14 节不可增删，只换内容）；
                   OP-07：每节先看 psych_jobs 心理卡 + framework-lock psych.mandate（五区块投喂策略：
                   TryInRoom=AI 房间合成代入感 / DesignStory=工厂粗糙实拍破防 / ProductData=理性详参 /
                   DeliveredWorldwide=白手套四步拆包入户安装清运 / Reviews+FAQ=真实社证临门一脚）再动笔；
                   storyText 先读 brand-library（品牌根四段范式+签名句公式，案例/文献给叙事以骨架）；
                   社证数字只准 Story 段且先查库（r11）；FAQ 数字与正文一致（FAQ 漂移=WARNING）
7. 闸门            validate（r1–r14，exit 0）→ score。
                   **自迭代纪律（2026-09-13 一号战略指令）**：有区块不符合投喂逻辑必须自己修改重跑，
                   score 至 A 级才出工单交用户审批（≥B 只是闸门落库底线，A 是交作业线）
8. 上线            用户审批 → DB 补丁（写库即生效）→ verify <线上URL> <patch> DOM 回归
9. 归档            进 C 线周节奏；T1 回流走毕业制度（H 级升级：订单/售后 → H4）
```

**判断权在你**：主题信号该建新画像还是挂现有画像、爬取结果够不够 T2 门槛、内容角度选哪条——这些是分析师工作，做完在回复里说明理由。**判断不改变闸门**：闸门是机器的，理由是给人的。

## B 线：blog 文章

同构九步，差异点：
- 输入 = 目标关键词 + 挂载产品（≥2 内链）+ 画像角度（角度即 H2 骨架，blog-scaffold 自动带 personas）
- 模板锁 = blog-framework-lock（title 35–38 字符拼后缀、excerpt 150–160、H2 4–8、禁表格/h1、分类 7 类）
- 闸门 = blog-validate（rb1–rb11）→ score → 落 draft → **用户审批** → published → blog-verify
- 蚕食红线：目标关键词与任一 PDP/已有文章冲突 = 不开写，先 cannibal 裁决换词或换角度

## C 线：校准环（越跑越准的机器）

**周（~60 分钟）**：
```
t1 inventory            # 第一方信号 + 自测甄别（订单污染防线）
GSC 导出（用户已授权后）→ 聚类挂画像 → keyword-library 更新（volume_tier 升 T1）
cannibal 扫描           # 新内容 vs 存量抢词
转人工破洞清单          # ai_chat needs_human 未处理数，报给用户
```

**月（~半天）**：persona audit 全量 → ai-visibility 采样（prompt bank × ChatGPT/Perplexity/Gemini，结果写 check_log；连续 2 次未引用的词 → 对照 keyword-library 查内容缺口）→ competitor-library 刷新 → user_provided 社证催办 → score 权重复盘（GSC 攒满 90 天才动权重，一次一个变量）。

**毕业制度**：同一画像假设 ≥5 条同向 T1 → 升级进 evidence（标 n+日期）。画像退役：连续 2 个月关联查询词=0 且 ai_chat 命中=0 → 提议 deprecated（用户批）。

---

## 冲突与升级

- 工具输出与本文描述冲突 → **以 `selftest` 全绿的工具为准**，修文档
- 库与记忆冲突 → 以库为准；库内两条冲突 → 以 evidence_tier 高者为准，同 tier 以日期新者为准
- 模板锁与 SEO 建议冲突 → 模板锁赢（锁是转化结构，SEO 在锁内做）
- 任何「要不要 published」「要不要建新画像」「要不要动模板锁」→ 用户裁决，你给选项和推荐

## 用户必须亲自做的四件事（其余全自动）

1. 给物理事实：图 + 参数 + 材质表 + 价格（每款新品）
2. published 审批（PDP 补丁 / blog 上线）
3. GSC 授权（一次性，5 分钟——解锁查询词 T1 与权重校准）
4. user_provided 社证链接/截图确认
