# 销售意图升级工单(sales-intent-backlog)

> 2026-09-30 立项(站主『入』)。外部诊断「100% 防死,30% 致富」判决后采纳部分成立。
> 原则:**加进攻层,不拆防御层**——防御闸每条都是真实事故换来的(§17 四道门/禁词两轮/DDP 漂移)。
> 与 system-hardening-backlog 并行;本单多项依赖流量数据,按闸门纪律逐项做,一次一个变量。

## A. 欲望三查进 score v2(不等流量,可先上)

- [x] 画面感钩子 ✅ 9/30:score v2 欲望维度上线(sales-intent-rules.json 标记表+desireCheck),回归 blog#2 98.7A
- [x] 对比结构 ✅ 9/30:签名句公式/对照词进标记表,blog#2 三查全命中
- [x] Offer 清晰度 ✅ 9/30:DM/加购/trade@ 标记表,blog#2 命中
- 实现方式:score 权重 v2 新增「欲望」维度;权重基线照旧先设假设值,GSC/订单数据攒到后校准(C 线既定节奏)

## B. 卖点库(新库 selling-points.json)

- [x] schema ✅ 9/30:selling-points.json V1.0, Kong 打样 4 画像×3 句全带出处(Noctua/Mofu/Meteorite 待各自产线启动时建)
- [ ] 素材源:各画像 trust_evidence_priority + 工厂实拍/QC 报告/竞品对比判决
- [ ] 生产接线:PDP/Blog/发布包写文案时从卖点库取句,不再临场发挥

## C. Blog 定位锁死:「给 PDP 送水的副产线」

- [x] blog-framework-lock 注释加唯一 KPI ✅ 9/30:V4.5.0 content_contract.kpi 落锁,selftest 绿:正文中至少一根内链让人「点了就想买」
  (形式仍 ≥2 内链,KPI 是质不是量)
- [ ] blog 骨架锁:开头痛点 → 产品当解法 → CTA 回 PDP(现有骨架本已如此,显式成文)

## D. 驾驶舱三仪表(operator-next 改造,依赖数据,分步上)

- [x] 仪表1「今日主推单」✅ 9/30:operator-dashboard.json V1.0(本周主推=Kong,与 blog#2 同频),每周更新
- [x] 仪表2「PDP 转化监控」✅ 9/30:GA4 事件上线——add_to_cart(站主『上』,已部署)+preview_submit×3 面(standalone/ai_global/pdp_mobile);Playwright 实测 add_to_cart value=4800 触发;同意门控照旧
- [ ] 仪表3「竞品骂点截流」:external-intel 管线加一环——竞品差评聚类 → 自动生成对比 blog 候选(过闸后人审)

## 判决存档(外部诊断采纳/拒绝记录,防翻烧饼)

| 诊断 | 判决 | 一句话理由 |
|---|---|---|
| 一 SKU 做 5 个画像版 PDP | 拒 | 关键词蚕食自杀 + 20 页维护不可守;14 节 psych_jobs 已是「一页五面孔」 |
| 14 闸合并 3 条、其余降 warning | 拒 | 防御闸=真实事故换的;打假叙事品牌,事实错误=主张自杀 |
| 缺欲望生死线 | 采纳 → A | 闸门验「对」不验「想买」,真缺口 |
| 缺卖点库 | 采纳 → B | 卖点散在画像里,应独立成库 |
| Blog=送水副产线 | 采纳 → C | 定位准确,锁死 KPI |
| 驾驶舱三仪表 | 修正采纳 → D | 「库存」仪表作废(无库存);转化仪表依赖流量,分步上 |
| 画像引擎放太边缘 | 证伪 | persona 已是 r12/rb11/r14 三闸强制的中心 |

## 验收

A 项:下一支 PDP/blog 用 score v2 出分,欲望三查全绿;B 项:Kong 一个 SKU 建满 4 画像×3 句;
C 项:框架锁注释含 KPI 条;D 项:GA4 事件上线且 operator-next 出三仪表(数据空位标「等流量」)。
