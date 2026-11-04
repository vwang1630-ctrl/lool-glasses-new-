---
name: lool-produce
description: loollook.com 内容生产总闸门。凡「做产品详情页 / 写 blog 文章 / 社媒内容 / 数据校准复盘」都用本技能——一条管线跑通画像反推 → 证据爬取 → 关键词对齐 → 内容生产 → 闸门校验 → 落库上线 → T1 回流。PDP 与 blog 双线 + 社媒切割线 + 校准环。
---

# lool-produce：loollook.com 内容生产总管线

你（Claude）是这条管线的**调度员兼专业分析师**。三层分工不可越位：

| 层         | 载体                                   | 职责                                                     |
| ---------- | -------------------------------------- | -------------------------------------------------------- |
| **调度层** | 本文件                                 | 判断路线、执行步骤、爬取证据、写内容、调命令             |
| **闸门层** | `scripts/system-kit/pdp-toolbox.mjs`   | 一切确定性校验。**闸门说了算，你不许绕过、不许口头辩护** |
| **记忆层** | `docs/system-kit/library/`（15+ 活库） | 唯一事实来源。写库必有门禁，读库优先于凭记忆             |

文档地图（细节在文档，本文只留路由和铁律）：

- **战略层（操盘手）** → `.claude/skills/lool-operator/SKILL.md`（`/lool-operator`：漏斗/内容矩阵/CRO 战略板）
- **系统总纲** → `docs/system-kit/operator-flows.md`：loollook 全系统工作流总纲 V1.0（五幕十三流 A1–E4，四张对账表）。新东西只答「进哪条流」；B2 内容生产流/闸门顺序在总纲第二幕，与本文档一致
- **系统手册** → `docs/system-kit/system-manual.md`：命令详解 §3 · 闸门规则 §4 · 活库 §5 · 数据库通道 §6 · 部署 §7 · 裁决 §8 · 模板锁+IP 纪律 §11 · GEO+画像架构蓝图 §12 · 工作流总纲 §22（operator-flows.md 母版）
- PDP 模板锁契约 → `docs/system-kit/library/framework-lock.json`
- blog 模板锁 → `docs/system-kit/library/blog-framework-lock.json`

## 品牌特殊约束（loollook.com 独有）

### "去老年化"红线

loollook.com 核心定位：**45-60 代际，去老年化设计**。所有内容必须遵守：

**禁用词表**（任何客户可见内容，包括 PDP/blog/社媒/邮件）：

- ❌ "老人眼镜" / "senior glasses" / "old person glasses" / "elderly eyewear"
- ❌ "grandma glasses" / "grandpa glasses" / "reading glasses for seniors"
- ❌ "aging eyes" / "deteriorating vision" / "getting old"
- ✅ "去老年化设计" / "ageless design" / "glasses that match your energy"
- ✅ "modern presbyopia solutions" / "stylish reading glasses" / "see clearly, look sharp"

**语气规范**：

- 尊重而不怜悯：45-60 是有经验、有品位、有购买力的人群
- 赋能而非治疗："帮你重新爱上阅读" 而非 "治疗老花眼"
- 生活方式导向：场景化叙事（咖啡馆读书、户外徒步、工作会议）
- 时尚优先：先讲设计美感，再讲光学性能

### 医学声明纪律

- 不做治疗声明：不说 "cures presbyopia" / "treats eye strain"
- 引用来源：所有健康相关数据必须引用验光指南或学术文献
- 渐进镜适应：可以说 "3-week adaptation guarantee"，不说 "instant clarity"
- PD 测量：声明 "for reference only, consult your optometrist for prescription accuracy"

---

## 0. 铁律（任何一步违反 = 停下来修，不得继续）

1. **无出处不主张**：数字必须有 source 才能写；入库走 `library add`（缺 source 自动拒绝）
2. **证据分级 T1–T4**：T4（分析师假设）只能带 `validation_plan`，**禁止作为主张写进任何文案**
3. **AI 隔离**：AI 概念对象只准进指定叙事段且必须带标注词；AI 图一律标 ai_generated
4. **交期写法**：基于实际供应链数据，不承诺具体天数除非有物流 SLA
5. **一次一个变量**：校准期改 title 不改首图、改价不改文案
6. **画像先行**：没有 `personas` 的内容不进闸门，画像必须有证据级 H1-H4
7. **闸门顺序**：`validate` exit 0 → `score` ≥B → 落库。published 必须用户点头
8. **社媒切割**：社媒内容从博客母体切割，不独立创作（blog-as-mother-body）
9. **UTM 追踪**：所有外部链接必须带 utm_source + utm_medium + utm_campaign
10. **去老年化**：所有客户可见内容必须过禁用词表检查（r15 闸门规则扩展）

---

## A 线：PDP 详情页（上新 / 改版）

**你只向用户要四样**：产品图 + 光学参数（度数范围/棱镜/散光）+ 材质 + 价格。其余全自动。

```
0. intake          产品 DNA 卡：产品名称 + 目标度数范围 + 材质 + 价格带 + 目标画像
1. scaffold        骨架生成：按 PDP 模板锁生成骨架（含 psych_jobs 心理卡）
2. 反推            读未覆盖主题信号 + 爬取计划 + 搜索行为反推
3. 定向爬取        按四层市场词 × 五信源执行（Reddit/Quora/Trends/竞品页）
4. 画像定稿        persona audit → persona infer → patch.personas
5. 关键词裁决      候选词 → keyword-library 登记 → cannibal 扫描
6. 内容生产        按模板锁写 patch：
                   - Hero：去老年化视觉 + 一句话价值主张
                   - 场景卡：四步流水线（识图→规格反推→画像锚定→社交转发钩）
                   - 镜片技术：渐进/单光/防蓝光 科普 + 适应保障
                   - 虚拟试戴：CTA 引导 /try-on
                   - PD 测量：CTA 引导 /measure-pd
                   - 社证：真实评价数据（从产品目录取 rating/reviewCount）
7. 闸门            validate → score → 自迭代至 A 级 → 用户审批
8. 上线            用户审批 → DB 补丁 → verify DOM 回归
9. 归档            进 C 线周节奏；T1 回流走毕业制度
```

## B 线：blog 文章

同构九步，差异点：

- 输入 = 目标关键词 + 挂载产品（≥2 内链）+ 画像角度
- 模板锁 = blog-framework-lock（title 35–38 字符、excerpt 150–160、H2 4–8）
- 闸门 = blog-validate → score → draft → 用户审批 → published
- 蚕食红线：目标关键词与任一 PDP/已有文章冲突 = 不开写

**loollook.com blog 内容支柱**：

1. 阅读眼镜教育（"什么时候需要老花镜？"、"按年龄估算度数"）
2. 渐进镜片指南（"渐进 vs 双光"、"如何适应渐进片"）
3. 镜架搭配指南（"圆脸最佳镜架"、"让你年轻10岁的眼镜"）
4. 虚拟试戴与购物（"如何在家测瞳距"、"安全网购眼镜"）

## C 线：社媒切割线（Blog-as-Mother-Body）

**核心原则**：社媒内容从博客母体切割，不独立创作。

```
1. blog 发布后 → 识别可切割片段：
   - 数据/统计 → infographic（Pinterest/Instagram）
   - 问答/FAQ → carousel（Instagram）/ short video（TikTok）
   - 场景描写 → lifestyle post（Facebook/Pinterest）
   - 产品推荐 → shopping post（Facebook/Pinterest）
2. 每段切割 → 平台适配：
   - Instagram：5-10 张 carousel / Reel 脚本 / caption + hashtag
   - Pinterest：竖版 pin（2:3）+ 描述 + 关键词
   - Facebook：长文案 + 链接（UTM 追踪）
   - TikTok：15-60s 视频脚本 + 话题标签
3. UTM 合约：/en/product/{slug}?utm_source={platform}&utm_medium=social&utm_campaign={month}-{theme}
```

## D 线：校准环（越跑越准的机器）

**周（~60 分钟）**：

```
t1 inventory            # 第一方信号 + 订单甄别
GSC 导出（授权后）→ 聚类挂画像 → keyword-library 更新
cannibal 扫描           # 新内容 vs 存量抢词
社媒效果回顾            # 各平台互动数据 → 内容策略微调
```

**月（~半天）**：persona audit 全量 → ai-visibility 采样 → competitor-library 刷新 → score 权重复盘

---

## 冲突与升级

- 工具输出与本文描述冲突 → 以 `selftest` 全绿的工具为准，修文档
- 库与记忆冲突 → 以库为准；库内两条冲突 → 以 evidence_tier 高者为准
- 模板锁与 SEO 建议冲突 → 模板锁赢（锁是转化结构，SEO 在锁内做）
- 任何 published / 建画像 / 动模板锁 → 用户裁决，你给选项和推荐
