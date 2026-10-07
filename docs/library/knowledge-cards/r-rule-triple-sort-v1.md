# 知识卡 · r-rule-triple-sort-v1（r/rb 规则三档重排）

```yaml
id: "GOVERN-RULE-TRIPLE-SORT-001"
title: "29 条 r/rb 规则按 保命/提效/可暂缓 三档重排——保命档单跑验证维护成本"
type: "process"

hypothesis: "29 条 r/rb 规则按三档分档后，仅强制执行保命档（r2/rb2、r6/rb6、r7/rb7、r8/rb8、r9/rb9、r13、r14/rb14、r4/rb4、cannibal、t1 甄别、selftest）即可维持零致命事故（不再发生图文错配/死链/口径漂移/无出处主张上线），同时 validate 全量运行成本显著下降。若保命档-only 运行期间发生任何本应由提效/暂缓档拦截的事故 → 本卡被杀死，全部规则回滚全量强制。"

rationale: "每道闸=一次真实事故的回写（r7 死链/r13 MPa 命中/r8 口径漂移/r14 错配均有台账）。但闸门密度是按'未来团队'预制的，当前 1+AI 阶段部分层维护成本>拦截期望。三档重排=把保险按事故频率重新定价，不是拆保险。"

epistemic_status:
  source_quality: "high"        # 事故锚全部来自本店台账/judgment-log/实截,一手
  empirical_support: "untested" # 分档假设未经过运行验证
  consensus: "multiple_independent"  # 内部双 AI 交叉审计+外部评审同构结论

applicability:
  constraints: ["仅 PDP/blog validate 闸门体系", "expires 2026-10-20 前必须有运行判决"]

testable_predictions:
  - metric: "致命事故数（图文错配/死链/口径漂移/无出处上线）"
    baseline: "0（全量强制期的实际记录）"
    expected_direction: "↔"
    time_window: "至 2026-10-20"
    control_condition: "保命档-only vs 历史全量强制,事故数应同为 0"
    success_definition: "保命档-only 运行期零致命事故 + validate 运行成本下降"
    failure_definition: "任何由提效/暂缓档本可拦截的事故发生"
    sample_size_min: "全量 validate 每次发布均跑"

potential_risks:
  - risk_type: "process"
    trigger_hint: "提效档规则长期 pending 导致回归时遗忘其存在"
    severity_if_ignored: "low"
    note: "expires 2026-10-20 死线兜底:到期必须判决,不留坟场"

cost_estimate:
  time_hours_user: 1
  time_hours_ai: 2
  money_usd: 0
  opportunity_cost: "validate 维护简化省下的时间投入内容生产"
  reversibility: "reversible"

expires_at: "2026-10-20"
version: "1.0"
```

---

## 三档重排总表（26 规则+5 非规则项）

> 列说明：事故源=立规的那次事故；拦过什么=实际拦截记录；建议分档；暂缓代价（⚠️待周一 GSC 数据回填，现在填=T4 禁止）。

### 🛡️ 保命档（强制全量，不可暂缓——每条都是死过人的）

| rule_id | 事故源 | 拦过什么（实证） | source_quality |
|---|---|---|---|
| r2 / rb2 | 无出处红线（站主令 10-02）+47 单 45 自测甄别事故 | 假数字/无来源主张上线（均价 $5,400 差点进画像证据） | T1 |
| r6 / rb6 | 框架锁 14 节/分类/H2 布局（图文错配事故族） | 分类缺失/H2 超限/前 100 词无关键词 | T1 |
| r7 / rb7 | /en/returns 死链事故（外部审计确认） | DB 实查死链/内链指向不存在页 | T1 |
| r8 / rb8 | 交期口径漂移事故（9-17 旧口径残留） | 交期不统一/旧口径回潮 | T1 |
| r13 | 声音护栏禁词族 V8（站主 9-26 裁决） | **MPa 命中 COMPANION（10-06 实测）**/hand-sculpted/factory/评论送 | T1 |
| r14 | 价格带错配 | 价格主张与价格带不符 | T2 |
| r9 / rb9 | AI vs Real 双标裂缝（BoingBoing 主流报道=市场敏感度实证，10-06 入档） | meta 禁用失效/正文 AI 标注缺失 | T2 |
| r4 / rb4 | 关键词证据（禁假词） | 库外假词/无 GSC 依据词 | T2 |
| cannibal | 一词一主位（C 线校准） | 多页同词互食 | T1 |
| t1 甄别 | 47 单 45 自测事故 | 自测订单混入真实证据 | T1 |
| selftest | 闸门自身回归 | 工具失灵静默通过 | T1 |

### ⚡ 提效档（pending_data——暂缓代价待周一 GSC 回填）

| rule_id | 拦什么 | 暂缓代价 | source_quality |
|---|---|---|---|
| r1 / rb1 | 占位符残留 | 占位符上线（低概率——基础字段 r3 部分重叠） | T2 |
| r3 / rb3 | 基础字段缺失 | slug/status/title 缺失（发布前置流程已兜） | T2 |
| r5 / rb5 | 禁词（非声音护栏族） | 个别禁词漏网 | T2 |
| r10 / rb10 | 社证数字准入 | 社证数字无出处（与 r2 部分重叠） | T2 |
| r11 / rb11 | 买家画像准入 | 内容与画像错位（⚠️待核：与 r13 部分重叠） | T2 |
| r12 / rb12 | 社交出口块 | 社媒出口无结构化素材 | T2 |
| score 权重基线 V1 | 评分标尺（未校准） | 分级精度（本身标注"待 GSC 校准"） | T2 |

### ⏸️ 可暂缓档（pending_data——素材/量级到位后启用）

| 项 | 说明 | 暂缓代价 |
|---|---|---|
| 幽灵员工 4 表 | 按未来团队预制的分工台账 | 台账维护成本（当前 1+AI 用不满） |
| 5 画像×心理×经济层深潜 | 深度分层待真实顾客数据 | 内容颗粒度（现有画像层够发） |
| 部署检查 22 条中非核心项 | 单机部署的宽限/回退检查 | 今晚已实证过两次全绿 |
| 承接页 /reddit 栏目 | Reddit 流量>0 再建 | 0 流量建=过度工程 |
| AMA/KOL/自建 sub 扩量 | 需 karma 积累 | 错过早期窗口（可接受） |

---

## 判决流程（expires 2026-10-20）

1. 周一（10-13）GSC 大窗口：站主贴 gsc-export + social_calendar metrics
2. 回填提效档"暂缓代价"列（现在是 pending_data=T4 禁止）
3. 卡走 judgment-log 判决：保命档-only 运行零致命事故 → 卡存活，提效/暂缓档定去留；任何漏网事故 → 卡被杀死，全量回滚
4. operator-next 决定：降级保留/全量恢复/部分回收
