# loollook.com 全系统工作流总纲 V1.0（2026-10-15 立）

> **编制方法**：本节不是增量拼出来的。按《fuzz-produce-manual.md》§22 的方法（"整个系统一次整理，不是逐个补"）对 loollook.com 全仓扫描重整——4 个技能、25+ 脚本、31 个活库文件、~53 张运行时建表（90 个 migration），逐件归属到流。
> **组织法**：按系统的生命周期分五幕——**建（一次）→ 造（供给环）→ 卖（变现环）→ 学（进化环）→ 守（底层闸）**。
> 每条流统一格式：触发 → 步骤 → 门 → 输出 → 回流。
> **与本说明书的关系**：系统手册仍是 `docs/system-kit/fuzz-produce-manual.md`（命令 §3 · 闸门 §4 · 活库 §5 · 数据库通道 §6 · 部署 §7 · 裁决 §8 · 模板锁+IP §11 · GEO+画像 §12 · 工作流总纲 §22 即本文件母版）。本文件只登记 **loollook 实际资产** 的归属，不重复说明书内规则。
> **完整性承诺**：章尾四张对账表逐件核销。今后任何新东西只问一句话：「进哪条流？」——答不出=系统有洞，立流或并流，不再零散加。

---

## 第一幕 · 建（跑一次）

**A1 基础设施流**（触发：新项目 D0 / 已建，2026-05 上线）
密钥 `.dev.vars`（RESEND_API_KEY 待站主给）→ 部署链（`bun run build && wrangler deploy`；wrangler.jsonc 绑 D1 `lool-work` + R2 `RX_BUCKET/PRODUCTS_BUCKET`；safe-deploy 带 `--env-file`；watchdog 守端口）→ Cloudflare DNS/WAF（大陆 CN 阻断已启用）/邮件路由 → Resend 发信（未配）→ GSC 资源验证+服务账号（待站主验证）→ sitemap 动态提交 + llms.txt（已上线 2026-10-08）+ robots（AI 爬虫全欢迎）→ GA4（G-FD4MN4RM7G 已注入）+ 归因埋点验证（C3）。
门：**自检门——pdp-toolbox selftest 全绿 + 线上冒烟七项，不全绿不许造数据。** GSC/Resend/Stripe webhook 三项待站主，见 §待决。

**A2 双库初始化流**（触发：D1）
运行时库建表（~53 表，90 个 migration：产品/内容/交易/客服/物流/支付/翻译/配置）→ 应用经 Worker D1 binding 直连（单库起步，不接双库）→ 活库骨架铺开（31 文件，E4 八区）→ 写入门禁启用（缺 source 自动拒）→ INDEX 索引立档（`docs/system-kit/library/INDEX.md`）。
门：**库文件 selftest / JSON 语法校验通过 + INDEX 每文件一行登记。**

**A3 技能装载流**（触发：D2，装"操盘手这个人"）
`.claude/skills` 本体（`lool-operator` 战略层 + `lool-produce` 生产闸门；`fuzz-operator/fuzz-produce` 为 Fuzz Sofa 原版残留，见 §差异）→ 方法论/知识域落位（comment-sop / edm-templates / visual-style-guide / 竞品拆解等）→ 制度初始化（operator-protocol V1.0 · decision-ledger 授权四级 · 工单台账铁律 · confidence-map 自检）→ 投喂通道开闸（D3）。
门：**能力雷达自审（未建，见 §差异）——lool-produce selftest 全绿为准。**

**A4 首品落地上新流**（触发：D5，已跑通）
站主供料〔图+光学参数+材质+价格〕→ B2 造 PDP → B3 发布战役首演 → 全链路穿透测试（发内容→自评问价→自测 DM→UTM 核对，断环修完才算建成）。
实况：lool-tr90-square（2026-10-08 全量 14 区上线，verify 23/23 PASS）+ lool-8663（上线，R2 有 4 张 404 待补图）。**穿透测试未完成**：社媒 0 发布、GSC 未验证、首笔真实询盘未到——A4 只算半闭环。

---

## 第二幕 · 造（核心供给环：有人→有货→有声量）

**B1 画像引擎流**（触发：新品/新市场/月度挑战；上游弹药库）
反推段：Product DNA 盘点〔度数范围/材质/价格带/禁忌（去老年化禁词）〕→ 四层市场扫描（A 同词/B 同形态/C 同用户/D 同价格带）→ 反推候选画像（每条指得回产品事实）。
构造段：购买五要素（JTBD 字段化）→ **心理七字段 want/desire/fear/doubt/trigger/proof/action（每个必挂证据，无证留空不编）**→ 经济层+价格容忍带。
证据段：三条推理通道（语料聚类/竞品评论区 mining/搜索词聚类+autocomplete 验证）→ 分级 H1-H4（H1 禁引用，published 前须 H2+）。
证伪段：falsification_status/counter_evidence/last_challenged 常挂；月度主动找反例，**60 天无反例检验=FAIL 自动降级**；价格带错配=拦截。
输出：content_angles/信任证据优先级/核心异议 → 直通 B2 心理卡与 B4 内容角度。
实况：persona-library 6 画像 · eyewear-glossary-library 搜索意图分库（V1.1.0）· keyword-library V1.1.0（Fashion Readers 词族 + banned_terms）。

**B2 内容生产流**（触发：上新/文章计划；A=PDP · B=blog 同构）
查库红线（扫 INDEX 禁重复发明）→ 画像 brief（无画像不进闸）→ 定向爬证据（T4 禁入文案）→ 关键词裁决（cannibal 一词一主位 + autocomplete/PAA 搜索表达验证）→ 生产（读心理卡；PDP 走模板锁 framework-lock 14 区；场景卡四拍公式；**去老年化红线 + 医学声明纪律，不可改**）→ **机器门** `node scripts/system-kit/pdp-toolbox.mjs validate` exit 0 + score≥B → **人门** published 站主点头 → 落库（D1 content_json / blog_posts）→ 多语言管线（14 语言 i18n + deepl-backfill 补翻）→ verify 线上回归 → INDEX 登记 → T1 回流通道开。
门：r1–r14（PDP）· rb 系列（blog）· check-design-tokens / check-mobile-typography / mobile-audit 质量门。

**B3 产品发布战役流**（触发：新品定档；B2 只造页，本流管发布）
配套一次做完：合集页收录+场景卡+关键词进观察名单+竞品首扫+口径对账（价格/交期/承重级口径全站一致）→ 发布物三件：社媒发布包（B4）+EDM（B7）+截流桥内容选题 → **发布检查门五项缺一不发**（verify 绿/alt 全写/JSON-LD 在/内链达标/三道闸）→ 发布编排 D0 PDP→D1 社媒→D3 EDM→D7 初判 → 24h/7d/30d 回流进 D1。
实况：**未正式开跑**（社媒未建立、EDM 未配）。lool-tr90-square / lool-8663 上线走的是简化路径。

**B4 社媒发布流**（触发：每帖）
情报定选题（借浪+竞品帖级监控，学选题不学卖法）→ 母体加工（AI 图不上 FB）→ **当日臂别**（A/B 交替）→ 三道闸（CTA 带 try-in-your-room/自评价值型/只对真人）→ 桌面发布包复制即发 → 站主手发〔时刻表按站主时区〕→ 24h 登记只记不判（自测打标不计）→ D1 判决。
平台矩阵：IG=泵水主阵地（Story 唯一挂链位=房间预览）· Pinterest=搜索长尾 mini-PDP · Reddit=借浪养帖（Update 序列，10 帖 0 互动停线）· FB=只发实拍 · EDM→B7。
实况：social-platform-rules / social-playbook / social-calendar 已建；social-accounts-registry 待站主登记账号；**全部平台"待建立"，0 发布。**

**B5 社媒互动流**（触发：评论/私信）
评论区三类话术（问价→价格显性化 / 质疑 AI→真工坊图+QC 序列号 / 求购→DM 接住）→ 私信触达（选人门槛+模板三选一，**每条引用对方原话开头**）→ SLA 私信 2h/评论 24h → 每条登记（账号+原话出处+模板号）→ 回复率 10 条 ≥2 正常，0 回复停线 → 原话进语料库（C1 回流）。
实况：comment-sop.md 已建（if/then 回复规则），未开跑。

**B6 账号治理流**（触发：新账号/月度）
开号登记〔平台/定位/Bio 链接〕→ 品牌全球向禁锁城市 → 多产品轮换配比 → 月度对齐（快照过期=回炉）→ social-accounts-registry 归档。
实况：departments.json 部门编制表已建；账号 0 注册。

**B7 EDM 邮件流**（触发：新品/月度栏目/预览捕获）
名单治理（source 标记：preview:<slug>/footer，禁买名单）→ edm-templates 取用 → **文案四道门**（事实铁律/能力=实际行为/价格逐一比对/读渲染成品）→ Resend 直发（**未配，blocked**）→ inbound 回信处理（cloudflare/email-inbound-worker 已备）→ 行为数据回流调频。
实况：preview-subscribe.route.ts（src/system-modules）已备捕获入口。

**B8 SEO/GEO 校准流**（触发：周一数据 / 月度采样；与 D1 周循环咬合）
GSC 逐词点名（谁爬/掉/新进门）→ searchAppearance 类型点名（multimodal 图搜一出现即报警）→ 行动裁决 → B2 内容行动 → 收录验证（sitemap 动态条目探针）→ GEO 月度采样（顾客原话问 AI 概览：被引→巩固 / 没被引→补 FAQ/清单文/结构化）。
实况：gsc-pull / gsc-report / kw-expiry-sweep 已备；GSC 待站主验证（d-gsc-verification）；ai-visibility 台账（7 prompt 组 × 3 AI）+ seo-geo-monthly 已建；llms.txt 上线。

---

## 第三幕 · 卖（变现环）

**C1 接待与成交流**（触发：任何咨询进站——AI 客服/表单/DM/邮件）
AI 客服接首问（chat_conversations / chat_messages 持久化）→ 会话进库 → 成交意向/复杂问题转人工（SLA 2h）→ 成交对话 playbook（六阶段+异议矩阵）→ **顾客原话进语料库（原话+画像+指向动作，缺一不收）**→ 高频问句沉淀 FAQ。
门：AI 不承诺交期价格以外的事；无原话不入库。
实况：AI chat 后端已建；**consult_events 运行时表缺失**（operator-library / operator-protocol 引用但 migration 无建表，见 §差异）；0 真实咨询（L0）。

**C2 订单履约流**（触发：新订单；L0 骨架待首单点亮）
验真（T0 纪律：测试单与真实单分开）→ 制作〔1-3 天〕→ QC 序列号装箱 → 发货〔DDP 7-14 天〕→ ghost 轨迹主动播报 → 送达确认+验收指引 → 售后/纠纷 → 保修 → 顾客晒图回流（→social-proof+语料库）→ 复购触达。
支付侧：Stripe webhook 对账 + refunds 台账。全程口径单一来源。
实况：orders/order*items/order_otp/shipments/shipment_events/logistics*\*/payouts/shipping_rules 表齐；**0 真实订单（8 笔测试 wire 已澄清均为测试，真实营收=0，P0-Human 清空）**；Stripe webhook 待站主配（d-stripe-webhook）。

**C3 归因流**（触发：落地自动/询盘瞬间/每周解析/第一单仪式）
埋点层：落地抓 utm+referrer→localStorage 首触；GA4 事件（同意门控内）→ 记录层：consult-track.ts 写 attr[first|last] token → 解析层：fishing-report 每周出「哪条内容在带询盘」排行 → 判决层：**第一单当天闭环复盘仪式**（单→内容→触达→词，写 decision-ledger+雷达升 L2 证据）。
门：出站必带 UTM；无 token 记 direct 不猜；自测永不计成绩。
实况：src/system-modules/attribution.ts + consult-track.ts 已建；GA4 已注入。

---

## 第四幕 · 学（进化环：越跑越准的部分）

**D1 周循环流**（周一数据进 · 周日判决出）
周一：B8 点名+C3 归因排行+fishing 询盘信号 → 行动裁决。周日：ABAB 实验判决回写知识卡（证实放量/证伪换钩子+负知识归档/过期杀卡）+ 穿透测试。
门：判决必须回写，不许挂账。
实况：operator cadence weekly = `operator intel → operator audit → operator next（ICE 排序）→ 出工单入 work_orders 台账 → GSC pull + 验证 → 对用户集中喊话 blocked/parked 项`。

**D2 月循环流**（触发：每月）
t1 inventory（订单污染防线）→ persona audit（B1 证伪段执行）→ GEO 采样（B8）→ 竞品亲手复访（基准 3 天过期）→ 能力雷达复盘（级别变动必须挂实物证据）→ 防吃灰巡检（🟡30 天死线/🔴接线或退役）。
实况：operator cadence monthly = t1 inventory → ai-visibility 采样 → content_matrix 刷新 → eeat_audit 更新 → keyword expiry sweep → persona falsification challenge → operator-library bump。

**D3 情报学习流**（触发：站主投喂「原料：」）
拆→滤→推→摸（**负知识也归档**）→ 条款落地（方法进库/红线升纪律/工具过两道门雷达）→ 挂验证知识卡（可证伪+死线+最弱环定级；查表走 confidence-map）→ 14 天实验 → 周日判决 → 晋级/归档。
门：外部建议不得直接抄数字。

**D4 决策流**（触发：任何拍板）
站主给方向 → 三纪律论证（有数据/有论证/用算法原理）→ 结论分级建议 → 授权四级（逐条请示→阈值放行→类别授权→全自治，红线永不越）→ 执行 → decision-ledger 记录 → 喂回。
门：欲望点站主定；推断挂验证计划；一次一个变量。
实况：decision-ledger V1.1.0（授权四级 + pending 5 项待站主）+ operator-protocol V1.0（Current Truth 一张表/两道门/默认假）+ 工单台账（WO-20261007-01~05 / WO-20261008-01，2 条 accepted 已执行）。

---

## 第五幕 · 守（底层闸：所有流共用）

**E1 每日自动流**（触发：cron 无人值守）
GSC 拉数 → 健康审计 → watchdog → cron-tick → tracking/payments 对账 → ghost-daily（物流日报+FX 监视，briefings 归档）→ git 备份 → prerender-warmup → audit_log/client_errors 巡检。**探针：sitemap 动态条目>0 / 站点五路探活。**
实况：cron-tick / daily-health-audit / ghost/ghost-daily / backup-to-git / prerender-warmup 已备；feishu-bot（scripts/feishu-bot，通知通道）已备；cloudflare/email-inbound-worker 已备。

**E2 部署与事故流**（触发：代码变更/异常）
预检（内存+僵尸）→ 备份 .output → 构建 → 产物验证 → keep-assets → 原子切换（safe-deploy.cjs）→ 五路探活 → 冒烟七项 → 失败自动回滚（先构建成功再停旧）。事故：先查环境再改代码→修根因→decision-ledger→说明书入册。应急：产物字符串手术（git 留源+可回滚）。
实况：safe-deploy / deploy-keep-assets / deploy-smoke 已备；**make-system-kit / qa-walk 缺失**（Fuzz Sofa 有，loollook 无，见 §差异）。

**E3 数据变更流**（触发：任何 DB 写）
安全写库七步：备份→补丁文件化→预检命中行数→执行→**returning strpos 验真**（假阳性+大小写变体排查）→线上复核→入册。jsonb 双编码读端解两层。
实况：db-gateway/env-sql.cjs 已备；实际 DB 写经 `wrangler d1 execute` + `src/server/db.ts` D1 binding。

**E4 活库治理流**（触发：常在——读在所有流前，写在所有流后）
**双层结构**：运行时库（~53 表=站上真数据，变更只走 E3）｜活库（31 文件进 git=操盘手记忆）。
**活库八区**：①画像关键词（persona/keyword/glossary）②内容母版（framework-lock/blog-framework-lock/content-master/selling-points/seo-meta/brand）③竞品情报（competitor-library + zeelool）④社媒作战件（social-\* 七件 + comment-sop）⑤证据口径（t1-config/t1-evidence/social-proof/ai-visibility/seo-geo-monthly）⑥学习吸收（——）⑦决策治理（decision-ledger/operator-protocol/operator-dashboard/system-versions）⑧运维台账（——）。
**五步读写**：读前扫 INDEX 红线 → 写过门禁（source 必带/T4 只进 hypotheses）→ 写必登记 → 回写必须及时（D1/D2/C1 回流）→ git 同步。
**增长纪律**：冻结令期不进新文件；负知识归档；只增不改史。

---

## 流与流的关系（一屏总览）

```
第一幕 建：A1 基建 → A2 双库 → A3 技能 → A4 首品穿透（已半闭环：2 款上线，穿透未完成）
                  ↓
第二幕 造：B1 画像引擎 ─→ B2 内容生产 ─→ B3 产品发布（未开跑）
                  ↑           ↓              ↓
              C3 归因 ←── B4 社媒（未开跑）/ B5 互动 / B6 账号 / B7 EDM
                  ↓           ↓
第三幕 卖：C1 接待成交 ─→ C2 订单履约（L0 骨架，0 真实订单）
                  ↓
第四幕 学：D1 周 ← D2 月 ← D3 情报 ← D4 决策（进化环喂回 B/C）
                  ↑
第五幕 守：E1 每日自动 / E2 部署事故 / E3 数据变更 / E4 活库（所有流的底座）
```

**抽离口诀**：A 抄步骤（已在建），B 抄门与引擎（已装），C 抄纪律（L0 待首单点亮），D 抄节律与制度（在跑），E 抄脚本与七步（已备）。〔方括号〕填新记忆，其余原样。

---

## 完整性对账（四张表，逐件核销）

**表 1 · 技能/系统文档 → 流**

| 件                                                   | → 流                                                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `.claude/skills/lool-operator`（战略层）             | A3/D4（发工单、授权、周月循环）                                                                                          |
| `.claude/skills/lool-produce`（调度层）              | A3/B2/B4/D1（A/B/C/D 四线执行）                                                                                          |
| `.claude/skills/fuzz-operator / fuzz-produce`        | 残留，见 §差异（指向 fuzzsofa.com / docs/library，本仓库无对应路径）                                                     |
| `docs/system-kit/fuzz-produce-manual.md`（系统手册） | 全流共用（命令 §3→E2/E3 · 闸门 §4→B2 · 活库 §5→E4 · 部署 §7→E2 · 裁决 §8→B2 门 · 模板锁 §11→B2/B4 · GEO+画像 §12→B1/B8） |
| `docs/system-kit/operator-flows.md`（本文件）        | 全流索引（本文件）                                                                                                       |
| `docs/system-kit/library/operator-protocol.md`       | A3/D4/C1/C2（Current Truth）                                                                                             |
| `docs/system-kit/library/INDEX.md`                   | E4（活库入口）                                                                                                           |

**表 2 · 脚本 → 流**

| 脚本                                                                                                                                      | → 流                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `scripts/system-kit/pdp-toolbox.mjs`（validate/score/selftest + operator/operator-intake/operator-intel/operator-next/operator-selftest） | B2 门 · A3/D4/C3                               |
| `scripts/system-kit/gsc-pull.mjs` / `gsc-report.mjs` / `kw-expiry-sweep.mjs`                                                              | B8/D1/D2                                       |
| `scripts/system-kit/fishing-report.mjs`                                                                                                   | C3/D1                                          |
| `scripts/system-kit/confidence-map.mjs`                                                                                                   | B1/D3                                          |
| `src/system-modules/attribution.ts` + `consult-track.ts`                                                                                  | C3                                             |
| `src/system-modules/preview-subscribe.route.ts`                                                                                           | B7                                             |
| `scripts/system-kit/deepl-backfill.mjs`                                                                                                   | B2（14 语言补翻）                              |
| `scripts/system-kit/ghost/ghost-daily.mjs`（+ briefings/）                                                                                | E1/C2（物流日报+FX+轨迹播报）                  |
| `scripts/system-kit/cron-tick.mjs`                                                                                                        | E1                                             |
| `scripts/system-kit/daily-health-audit.mjs`                                                                                               | E1                                             |
| `scripts/system-kit/prerender-warmup.mjs`                                                                                                 | E1                                             |
| `scripts/system-kit/backup-to-git.mjs` + `backup-daily-task.bat`                                                                          | A1/E1                                          |
| `scripts/system-kit/watchdog-server.bat` + `register-watchdog.bat`                                                                        | A1/E1                                          |
| `scripts/system-kit/safe-deploy.cjs` / `deploy-keep-assets.cjs` / `deploy-smoke.mjs`                                                      | E2                                             |
| `scripts/system-kit/db-gateway/env-sql.cjs`                                                                                               | E3                                             |
| `scripts/system-kit/check-design-tokens.mjs` / `check-mobile-typography.mjs` / `mobile-audit.mjs`                                         | B2 门（质量）                                  |
| `scripts/system-kit/cloudflare/email-inbound-worker.js`                                                                                   | C1/B7（邮件 inbound）                          |
| `scripts/feishu-bot/`                                                                                                                     | E1（通知通道）                                 |
| `scripts/sync-dev-vars.mjs`                                                                                                               | A1（env 同步）                                 |
| `scripts/create_admin.py`                                                                                                                 | A1（管理员账号）                               |
| **缺失（Fuzz Sofa 有，loollook 无）**                                                                                                     | `make-system-kit`（A3/E4）· `qa-walk`（A4/E2） |

**表 3 · 活库 → 读写流**（docs/system-kit/library/，31 文件）

| 活库                                                                                                                                 | → 读写流                                    |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `operator-library.json`（战略板 V2.1.0）                                                                                             | A3/D4 写 · 全流读                           |
| `keyword-library.json` / `eyewear-glossary-library.json`                                                                             | B1 写，B2/B8 读                             |
| `persona-library.json`                                                                                                               | B1 写，B2 读                                |
| `seo-meta-library.json` / `brand-library.json`                                                                                       | B1 写，B2/B8 读（含桥接层 resolveHeadMeta） |
| `framework-lock.json` / `blog-framework-lock.json`                                                                                   | B2 写读（模板锁，published 须站主）         |
| `content-master.md` / `selling-points.json`                                                                                          | B2/B3 写读                                  |
| `competitor-library.json` / `competitor-library-zeelool.md`                                                                          | D3 写，B1/B2/B4 读                          |
| `social-platform-rules.json` / `social-playbook.json` / `social-calendar.json` / `social-accounts-registry.md` / `social-proof.json` | B4/B5/B6 写读                               |
| `comment-sop.md` / `edm-templates.md`                                                                                                | B5/B7 读                                    |
| `ai-visibility.json` / `seo-geo-monthly.json`                                                                                        | B8 写，D1/D2 读                             |
| `t1-config.json` / `t1-evidence.json`                                                                                                | C1/C2 写，B1/B2 读                          |
| `decision-ledger.json`                                                                                                               | D1/D4 写读                                  |
| `operator-protocol.md` / `operator-dashboard.json` / `system-versions.json`                                                          | A3/D4/E4 写读                               |
| `departments.json` / `visual-style-guide.md`                                                                                         | B6/B2 读                                    |
| `INDEX.md`                                                                                                                           | E4（唯一入口，所有流开工前扫）              |

**表 4 · 运行时表（按族）→ 流**（~53 建表，90 个 migration，D1 `lool-work`）

| 表族                                                                                                                    | → 流                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `products` / `product_colors` / `product_lens_overrides` / `frame_suppliers` / `suppliers(_v2)`                         | B2/B3/E3                                                                                                                                                                     |
| `lens_*`（skus/options/addons/indices/colors/categories/brands/suppliers/catalog/mapping + 历史 \*\_new/\_v2）          | B2/E3（定价/镜片配置）                                                                                                                                                       |
| `blog_posts`                                                                                                            | B2                                                                                                                                                                           |
| `home_banners` / `home_promo_banners` / `home_ugc` / `audience_banners`                                                 | B2/B3（首页内容，桥接层消费）                                                                                                                                                |
| `orders` / `order_items` / `order_otp` / `shipments` / `shipment_events` / `logistics_*` / `payouts` / `shipping_rules` | C2/E1                                                                                                                                                                        |
| `chat_conversations` / `chat_messages` / `customers` / `addresses` / `customer_identity_links`                          | C1/E1                                                                                                                                                                        |
| `prescriptions`                                                                                                         | C1/C2                                                                                                                                                                        |
| `affiliates` / `affiliate_ledger_entries`                                                                               | refer 漏斗（未推广）                                                                                                                                                         |
| `admin_users` / `admin_api_tokens` / `admin_audit_log` / `audit_log_index` / `maker_users(_v2)`                         | A1/E1（后台/审计）                                                                                                                                                           |
| **缺失/查证**                                                                                                           | `consult_events`（operator 引用、无建表）· `reviews`（PDP Reviews Tab 有 1 条真实评价，存储位置待查——可能内嵌 content_json）· 历史 `_v2/_new` 表（orders_v2 等，可评估清理） |

**无遗漏声明**：以上四表覆盖 loollook 全仓已盘点件（技能 4 · 脚本 ~25 · 活库 31 · 运行时建表 ~53）。今后新件只答「进哪条流」；答不出=立流或并流，并在本表登记。

---

## 与 §22 母版的差异（loollook 实况）

1. **Fuzz Sofa 脚本在本仓库缺失**：`make-system-kit`（生成 SYSTEM-KIT 镜像）、`qa-walk`（上线前走查）——loollook 未移植，若需要可按 §22 表 2 补建。
2. **fuzz-operator / fuzz-produce 技能残留**：指向 `fuzzsofa.com` + `docs/library/`（本仓库无对应路径），已被 lool-operator / lool-produce 取代。**待站主决策**：保留作模板（建议移出 `.claude/skills/` 归档）或删除。
3. **能力雷达未建**：§22 要求 `capability-radar.md`（L0-L3 自审），loollook 库区⑥「学习吸收」与⑧「运维台账」目前空。
4. **consult_events 表缺失**：operator-library / operator-protocol / C3 归因流引用，但 migrations 无建表——归因数据实际落点需确认（chat_conversations 或新建表）。
5. **Reviews 存储待查**：PDP Reviews Tab 已有 1 条真实评价（cici·2026-10-08），但无 `reviews` 表，疑似内嵌 products.content_json——证据链要闭环需明确落点。
6. **运行时表有历史债**：`orders_v2 / order_items_v2 / suppliers_v2 / maker_users_v2 / lens_skus_new / lens_skus_v2` 等历史版本表仍在，属 `0082_drop_order_otp` 未覆盖的残留——**待站主决策**是否排期清理。
7. **A4 未闭环 / B 线未开跑**：2 款 SKU 已上线，但社媒 0 发布、EDM 未配、GSC/Resend/Stripe webhook 三件基础设施仍等站主（见 decision-ledger pending）。

**待站主决策清单**（并入 decision-ledger pending，不重复造表）：

- d-resend-api-key · d-admin-email-routing · d-gsc-verification · d-homepage-images · d-stripe-webhook（5 项既有）
- 新增：fuzz-\* 技能去留 · 历史 \_v2/\_new 表清理 · make-system-kit/qa-walk 是否补建
