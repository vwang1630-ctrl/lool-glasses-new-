# 电商决策系统 · 收编档案（decision-system-adoption v0.9）

> 缘起：2026-10-05，站主转入一份外部设计的《电商决策系统·完整交接文档 v1.0》征求意见。
> 操盘手四刀评审 → 原设计者全认+反补一刀 → 双方收敛 → 转出两张实物卡验证 schema。
> 本档案 = 全程结论固化，收编版唯一事实来源。后续争议以本档为准。

---

## 一、原系统定性（一句话）

**思想内核 A 级，照原样跑 C 级。** 它是把本店已有纪律（默认假+验证计划、无出处不给数、
平台研究先行）做成了可执行格式——方向对；但体量和自证方式不适合当前阶段，收编后可用。

## 二、原系统的真金白银（全保留）

| 资产 | 内容 | 状态 |
|---|---|---|
| knowledge_card schema | 可证伪假设+三元正交知识状态+可测预测+风险+成本 | ✅ 原样保留，收编版的核心资产 |
| epistemic 三元正交 | source_quality / empirical_support / consensus 互不污染 | ✅ |
| 不对称升级 | rejected 也是有效证据；untested→confirmed 需 high 实验 | ✅ |
| design_quality 因子推导 | 5 因子打分（6-8 high / 3-5 medium / 0-2 low），不靠 AI 感觉 | ✅（因子表见下文修正） |
| 止损纪律 | Day1 拿不到数据换题材 / 2 天写不出真卡就停 / "被证伪会惊讶吗"自检 | ✅ |
| Day 8 决策树 | 5/5 扩 v2；3-4/5 逐条归因；≤2/5 升级判断 | ✅ |

## 三、四大硬伤（评审结论，原设计者全认）

1. **实验引擎冷启动点不着火（打穿 MVP）**：新账号日均曝光 0-50，14 天最多 700，
   到不了卡里自己写的 sample_size_min:1000；单账号无对照组→randomization 永远 false
   →design_quality 封顶 medium→永远升不到 confirmed→系统永远输出"medium+待验证"空转。
2. **让 LLM 干它自己被禁止干的活**：置信度映射表是 first_match_wins 查表，
   必须 Sheet 公式/20 行脚本确定性执行；LLM 只做路由+检索。
3. **5/5 通过≠系统有用**：原成功标准全是可追溯性（管道没漏），没有一条
   "比裸 AI 好"；3 自出+2 盲出=循环论证。补第 4 条硬标准：**同题对比，系统输出 5 题不输裸答**。
4. **与活库抢地盘**：另开 Sheet 知识库=事实来源分叉。卡必须生在活库，Sheet 只做运行视图。

## 四、反向警告（原设计者补的，评审方深化）

**时间片对比 = 时间混淆**（季节/算法漂移/熟练度都在变）。简单把 randomization 因子
换成"时间片"给 +2 分 = 为跑通而降证据标准。

**修正后的 design_quality 因子表（收编版）**：
```
+2  sample_adequate（冷启动允许顺序设计枚举，见未决问题①）
+2  control_present（单账号并发交替算对照，双账号对照组更高档）
+2  randomization（真随机）或 +1 ABAB 交替（短周期天级/周级，时间混淆摊平）
+1  attribution_window_correct
+1  preregistered
→ 沿用 6-8 high / 3-5 medium / 0-2 low
关键封顶：仅 ABAB 交替（无真对照）→ 总分封顶 medium，永不升 high。
两个极端都禁止：既不做"永远待验证"的空转，也不做"什么都敢 confirmed"的放水。
```

## 五、收编骨架七条（双方收敛，唯一执行版本）

1. 卡 schema 保留；**卡生在活库**（docs/library/knowledge-cards/），Sheet 只做运行视图；
2. 映射表脚本化（Sheet 公式或脚本），LLM 只做路由+检索；
3. 实验标准改现实：ABAB 短周期交替 + 单账号并发对照，design_quality 按第四部分封顶；
4. 成功标准加第 4 条：**同题 5 问，系统输出不输操盘手裸答**；
5. Day 2-4 = 把活库现有未验证假设格式化成卡，不从零写；
6. Day 1 = 验证"活库假设能否转成可证伪的卡"（已验证：两张，十分钟转完）；
7. **治理层直接用 decision-ledger 四级授权，不重建**（confidence_flag→require_review
   ≡ ledger 现有的"待站主签授/逐条问"，两套并行=分叉）。

## 六、五层架构 → 活库资产映射（认知/校验/治理层原型早已存在）

| 原设计层 | 活库现有资产 | 差距 |
|---|---|---|
| 认知层 | INDEX.md（任务路由式索引+动手前必读红线） | 缺卡 schema 格式化 |
| 校验层 | T1/T2/T3 来源分级（判例012：第三方基准 T3 仅参照永不设及格线） | 缺映射表脚本 |
| 治理层 | judgment-log（决策→依据→结果→学到）+ decision-ledger（四级授权+30天同向升格） | 无，直接用 |
| 实验层 | ig-pump-battle（H 假设自带 falsify+试水→加码） | 缺 design_quality 分档接入 |
| 路由/执行层 | 无原型 | 收编版新建（LLM 路由+脚本查表） |

## 七、实物卡（收编版第一批，均 untested）

### IG-HOOK-001（转自 ig-pump-battle H1 假设 + ig-reel-h1-package）

```yaml
id: "IG-HOOK-001"
title: "真工坊原声实录钩子对陌生垂类人群的 Save/Share 驱动力"
type: "tactic"
hypothesis: "对动物家具/雕塑设计兴趣的陌生垂类人群，「真工坊手作过程原声实录」钩子的 Reel 产生的 Save/Share 率高于本账号其他钩子维度，并带动 profile 访问与 bio 链点击"
epistemic_status: {source_quality: medium, empirical_support: untested, consensus: single_source}
  # medium = 最弱环（机制 T2 官方 high，钩子假设是店内推断 medium）→ 宁低勿高
  # untested = 事实核验：Reel#1 未发布（素材到即剪），无任何自家数据
实验设计: 同账号 ABAB 交替（原声实录 vs 其他钩子维度），天级错开，首月 4 条/臂
成功: 原声臂 Save+Share 率连续 2 条高于对照臂 且 bio 链 UTM 命中 ≥1
失败: 2h 互动率 <1% 即时判换钩子重剪；或 4 条跑完两臂无差异
基线: 前 3 条 Reels 自建基线（判例012：T3 基准仅参照永不设及格线）
expires_at: "2026-12-31"   # 钩子有效性随账号成长失效，设死线防陈
风险: 工坊画面暴露代工痕迹(medium)→画面先过站主；口径已锁"不说纯手工也不否认"
惊讶测试: 被证伪会惊讶（竞品全发渲染、差异化空位实测）→ 真卡
```

### PIN-TAG-001（转自 judgment-log 2026-09-27 标签条目，挂账 8 天）

```yaml
id: "PIN-TAG-001"
title: "品类词 sweet spot 标签的出站点击驱动"
type: "tactic"
hypothesis: "对动物造型家具垂类，品类词标签 #AnimalShapedFurniture（85K-120K，sweet spot）带来的出站点击多于品牌泛词 #DesignerFurnitureDubai"
epistemic_status: {source_quality: medium, empirical_support: untested, consensus: single_source}
  # untested = 9/27 挂账至今，Pin 持续发但标签效果从未单独归因
实验设计: 同账号 ABAB 交替（品类词标签 vs 品牌+城市词标签），≥6 Pin/臂，2 周
成功: 品类词臂出站点击率高于对照臂 且 ≥2 次出站点击归因可复现
失败: 两臂无差异 → 收获新知识"Pinterest 标签权重存疑"，另立卡检验"描述关键词才是排名因子"
基线: Pin 1（旧标签）首日出站点击 1 次（self-test 已排除）
风险: 标签堆砌(>10/条)可能 spam → 每条 3-5 个精准标签
惊讶测试: 被证伪会惊讶 → 真卡；refuted 也是有效证据
```

## 八、schema 三处水土不服（已定口径，2026-10-05 站主『开工』令授权操盘手代裁，站主可否决）

| # | 问题 | 定案口径 | 状态 |
|---|---|---|---|
| ① | `statistical_power:0.8`/`sample_size_min:<数值>` 冷启动逼人造假 | 允许填 `cold_start_sequential` 枚举 + `design_constraint_note` 字段（两卡已用） | ✅ 已定并执行 |
| ② | Prompt#2"取最高" vs 纪律"最弱环"打架 | **按最弱环，宁低勿高**（IG-HOOK-001 已按此执行） | ✅ 已定并执行 |
| ③ | ABAB 交替塞不进 control_condition 单字段 | experiment_request/卡 增加 `interleave_scheme` 语义，接入 design_quality 分档（脚本已实现封顶） | ✅ 已定并执行 |

## 九、裁决与开工记录

- [x] 两张卡入库：`docs/library/knowledge-cards/IG-HOOK-001.yaml` / `PIN-TAG-001.yaml`（2026-10-05）
- [x] 未决问题①②③ 口径：按第八部分代裁
- [x] 映射表+因子表脚本化：`scripts/confidence-map.mjs`（自检 5/5 过；LLM 禁入查表）
- [x] 收编版排期：**不单开工程，嵌入既有节律**（见第十一部分）

## 十、明确不做的（红线继承）

- 不照原样跑 Day1-8（Pinterest 手工首饰题材与本店无关，原 MVP 场景作废）
- 不开第二个知识库 Sheet 当事实来源
- 不让 LLM 算置信度
- 不在低置信度下当建议执行
- 时间片对比不给满分（封顶 medium）

## 十一、执行节律（嵌入既有操盘流程，零新增仪式）

| 卡 | 嵌入点 | 启动 | 判决 |
|---|---|---|---|
| PIN-TAG-001 | 每日发布包流程：下一次发 Pin 起 ABAB 交替挂标签（品类词/品牌+城市词），发布包里标明当日臂别 | 下一批 Pin 发布即启动 | 每周一随 GSC/面板拉数，两臂各 ≥6 Pin 或各 800 曝光后按 success/failure 判决 |
| IG-HOOK-001 | IG Reel 剪辑流程：素材到后剪 4+4 条（原声臂/对照臂），天级错开发布 | 工坊素材到手即启动 | 每条发后 2h 即时判（<1% 互动率换钩子重剪）；周复盘累计 |
| 卡升级回写 | 实验跑完 → 填 empirical_evidence → 按 design_quality 分档升 epistemic_status（refuted 也回写） | — | 判决当日回写卡文件+judgment-log 记一笔 |
| 后续卡源 | Meteorite 90 天四指标（战略卡）、judgment-log 其他"待验证"条目按需转卡 | 站主点头即转 | 同上 |

## 十、明确不做的（红线继承）

- 不照原样跑 Day1-8（Pinterest 手工首饰题材与本店无关，原 MVP 场景作废）
- 不开第二个知识库 Sheet 当事实来源
- 不让 LLM 算置信度
- 不在低置信度下当建议执行
- 时间片对比不给满分（封顶 medium）

---
*建档：操盘手 2026-10-05 · 依据：站主『先总结全部，吸取内容，完善细化』*
