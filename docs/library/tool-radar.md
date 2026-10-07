# 工具雷达（tool-radar）— 外部项目评估与回访触发器

> 站主 2026-09-27 起批量投喂外部仓库。入雷达纪律：每个项目回答「解决我们哪张工单」；答不出的记**跳过+回访触发器**，到触发条件自动重评，不再重复劳动。

## 评估批次 #1（2026-09-27，8 个）

| # | 项目 | 是什么 | 判定 | 回访触发器 |
|---|---|---|---|---|
| 1 | zhaoxuya520/reverse-skill（38k★） | 网络安全技能包（APK 逆向/渗透/CTF，45 技能） | **跳过**——零任务覆盖；JS 逆向竞品=踩未授权红线 | 无（安全研究场景才相关） |
| 2 | vectorize-io/hindsight（33k★） | AI 智能体记忆系统（Retain/Recall/Reflect，pgvector） | **跳过·方向认可**——我们已用「记忆文件+活库+台账」手工实现且可审计（站主逐条审 §17 的前提=明文存储）；黑箱向量库与无出处红线冲突 | 活库规模大到明文检索不动（数百篇 blog/数千证据）时重评 |
| 3 | afadtc/afa-dtc-skills（164★，CC BY-NC） | DTC 独立站 AI 顾问 30 模块（三层架构+200 方法论文件） | **不装·借图书馆**——NC 许可禁商用；架构与我们撞衫（互为平行演化）；RFM/LTV/复购模块需真实订单 | 首批真实订单（≥10）后：派读其 CRO/邮件/RFM 模块，重写为自产 playbooks（NC 合规：学习重写≠复制） |
| 4 | gege-circle/.github（2k★） | VTuber 社区公告板（非代码项目） | **跳过**——无关 | 无 |
| 5 | 11DingKing/cc-usr-…-continuity | 1 提交的空模板工程 | **跳过**——空仓库 | 无 |
| 6 | JingxuanC/vela-engine（1★，MIT） | Go 电商操作系统（215 路由：LTV/流失/归因/评价自动邀请/RAG/营销自动化） | **记名·订单后重评**——域完全对口但需 PostgreSQL+Redis+Go 常驻（单机内存不允许）且 0 订单喂不动 LTV/流失引擎；3 提交未经验证 | 真实订单 ≥50 后：评价自动邀请+统一归因两模块对标我们手工流程 |
| 7 | 0xCaptain888/AgentHub（28★，MIT，**已归档**） | Amazon+TikTok 5 Agent 运营台 | **跳过**——已停止维护（只读）+平台不对口（Amazon/TikTok Shop，非自建站） | 无（归档项目不会复活） |
| 8 | xiongjianzhizhi-alt/ecommerce-operation-master-ai（5★，MIT） | 中国电商 AI 技能库（10 skills：经营诊断/竞品/老板日报） | **吸收两个想法**（见下）——平台不对口（淘宝/天猫国内站）但方法论可迁移 | MIT 合规：吸收思想+自己实现，标注出处 |
| 9 | cwyhkyochen-a11y/social-content-ops（11★，MIT） | 多平台社媒统一发布台（Composio OAuth 接管 10+ 平台授权，一键多发+定时+重试） | **跳过·撞现行裁决**——其全部价值=接平台 API 自动发布，而站主 9-14 明令「不接平台 API，以后也不用」且 Composio=涉钱服务；能力真实解决我们手工复制的痛，但解法被否 | 触发器=站主主动推翻「不接 API」裁决时重评（技术可行，MIT） |
| 10 | justlovemaki/CloudFlare-AI-Insight-Daily（1.8k★，GPL-3.0，阮一峰推荐） | CF Workers+cron+Gemini 摘要+自动发布日报（零成本零本机依赖） | **记模式·暂不用**——内容（AI 资讯）非我们业务；模式（云端 cron+LLM 摘要+自动发布）正是幽灵简报的架构，价值=本机断电断网时简报不断档。GPL 内部使用合规 | 触发器=本机常驻不稳导致幽灵简报断档时，把简报迁此模式（DB 网关是 URL，云端可达） |

## 本批终审（站主）：全部不适用于初创阶段——非工具之过，是阶段未到。可吸收的 3 个想法不受影响（思想无阶段）

## 本批吸收的 3 个想法（MIT/无版权风险，吸收思想自行实现）

### 想法 1：对话四阶段识别 → 我们 ai_chat 的 needs_human 分诊增强
来源：merchant-agent v2.2「4 阶段对话识别（售前/改地址/使用说明/售后）」
落点：ai_chat_sessions 的 needs_human 判定可加「阶段」维度——售后类消息自动升优先级、售前类保持 AI 应答。**触发**=ai_chat 月量 ≥50 后值得做（现在量太小）。

### 想法 2：「老板日报」三段式 → 幽灵员工简报格式对齐
来源：ecommerce-operation-master-ai 的 business-report skill
其原则「不止展示数据，必须给出问题诊断、原因分析和可执行的优化动作」——与我们幽灵简报已同构；差异=它强制三段（诊断/原因/动作）。**落点**=ghost-daily 简报模板下次修订时对齐三段式。

### 想法 3：比价教育内容（已立）→ G-MWA 候选队列
来源：AgentHub/VERTEX-pro 共同验证的市场结构（同品类价格带从 $2,800 到 $9,900 并存）
已入 WO-20260928-01（价格教育内容候选），king kong 簇实验出分后决定。

## 雷达纪律

- 每批评估完必须更新本表（含判定+触发器），否则等于没评
- 回访触发器到期 → 自动重评入周报
- **总门卫问题**：「解决我们哪张工单？」答不出编号→跳过+触发器

**第二道门（2026-09-27 站主终审）**：「它服务的是哪个阶段的我们？」——工具必须与阶段匹配。初创期（0 真实订单/0 真实评价）的答案几乎必然是「订单和规模之后的阶段」→ 跳过+记触发器。本批 10 项终审确认：对刚起步的我们全部无用，非工具不好，是阶段未到。

## 行为→钩子推导表（2026-09-27，Pinterest 真实用户数据）

| 用户行为 | 数据源 | 推出的钩子 |
|---|---|---|
| 满屏 AI 渲染图无法购买 | Yanko Design 2026.6「几乎全部没有实物」 | The one you can actually order. |
| 把 gorilla sofa 当 dupe 搜 | Pinterest dupe corner | Not a dupe. The original. |
| 热评 Tag a friend | Instagram 17.1K 互动 | Tag the friend who keeps sending you AI renders. |
| 75% 带采购计划来 | Pinterest Business | You are already planning the room. We are already building the sofa. |

## 地域发现（2026-09-27 Pinterest Audience Insights）

- Pinterest 受众=美国城市（Seattle/Orlando/Charlotte/LA），非 GCC
- 意味：Pinterest=品牌认知+美国市场，GCC 转化走 EDM+Facebook
- 男 47% 异常高（平台均值 30%）→ One Partner Per City B2B 钩子已触达男性受众
- Art 亲和度 59.4% 仅次于 Home Decor → 收藏级设计定位被数据验证

## 竞品情报实战首战（2026-09-27，站主亲手收集）

- 站主亲自去 IG/Pinterest/1stDibs 收集了完整竞品情报——Office Logix(猩猩椅$3999)/Maximo Riera(£32k+)/Moooi($10k Horse Lamp)
- 发现1：白色工作室实拍=190K likes（所有内容形式最高）→ 下一批优先白底实拍
- 发现2：#fauxfurcouch #animalsofa 标签空白→可抢占
- 发现3：评论区100%=价格+物流→转化已就绪，信任是瓶颈
- 发现4：Office Logix $3,999/229cm vs Kong $9,900/200cm→站主裁决不改价，先跑数据
- 教训：站主亲手收集的竞品情报比 AI 推演的价值高10倍——下次新市场进场同模式

## 2026-10-06 新增候选
- **geo-aeo-tracker**(danishashko,开源本地优先):AI 可见性仪表板,追踪 ChatGPT/Perplexity/Gemini/Copilot/AI Overview/Grok 六引擎提及+可见性评分+竞品 battlecard——替代月度人工 ai-visibility 采样。两道门:解决 ai-visibility 人工采样自动化工单 OK;服务内容获客期 OK。部署前提:LLM API key(现有 GEMINI_API_KEY 可单引擎先行,OpenAI/Perplexity key 待配)。状态:已选型待部署
- **HubSpot AI Search Grader**(免费网页工具):一次性 AI 搜索快测,可跑分

### 2026-10-06 新增候选（用户画像/购买行为学方向,GitHub 扫描）
- **Microsoft TinyTroupe**(开源,微软出品):LLM 多智能体画像模拟——给 agent 设画像,模拟其对产品/营销场景的反应。两道门:解决"内容发布前预检"工单(草稿→虚拟焦点小组→改进)+decision-ledger SKU 概念测试的第二数据源;服务内容期 OK。⚠️ 局限判定:LLM 模拟≠真实市场(会复读 LLM 自身偏见),**绝不替代语料库/consult_events 真信号**——只做草稿预检用。级别:P2 候选(需 LLM key,现有 GEMINI 可跑)
- persona-generator 类(Gemini 驱动 Flask 应用×2/PyPI 包):❌ 拒收——凭空生成画像=无证据虚构,本店 persona-library T1-T4 证据体系严格优于此类
- Shop-R1/arXiv 购物行为模拟研究:仅记录,不可执行
