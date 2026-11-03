# 幽灵员工 · Phase 1（每日情报员）

只读、不碰钱、不做法律动作。每天早上把三件事写进简报，代替人肉巡检：

1. **FX 哨兵** — 美元/人民币现价 vs 系统换汇率（价卡入库口径 7.15），漂移 >2% 告警
2. **在途包裹** — `orders` 表有 `tracking_number` 的未完成订单，按承运商拟人访问官网查单页（顺丰/京东/DHL 官网是 JS SPA + 反爬，Phase 1 只做握手确认，抓不到结构化轨迹如实标"待 Phase 2"；6 小时本地缓存 + 1.5–3s 随机节流）
3. **承运商公告** — 顺丰/DHL 页面标题抓取，与上次比对，新公告提醒（公告关键词：运价/调价/附加费/高峰/surcharge/rate…）

产物：

- `briefings/YYYY-MM-DD.md` — 当日简报
- `runs.jsonl` — 每次运行一行（结构化留痕）
- `state/*.json` — 缓存与已见公告（可随时删，删了下次全量重抓）

## 手动运行

```powershell
node scripts\ghost\ghost-daily.mjs
```

## 注册 Windows 计划任务（每天 10:00）

```powershell
$node = (Get-Command node).Source
schtasks /Create /SC DAILY /ST 10:00 /TN "FUZZ Ghost Daily" /TR "`"$node`" D:\data\code\cici\fuzz-couch-comfort\scripts\ghost\ghost-daily.mjs"
```

验证 / 删除：

```powershell
schtasks /Query /TN "FUZZ Ghost Daily" /V
schtasks /Delete /TN "FUZZ Ghost Daily" /F
```

## 边界（为什么叫 Phase 1）

- 全程只读数据库；任何比价、改价、理赔、商务决策都是**建议写进简报**，由操盘手裁决
- 结构化轨迹解析（顺丰反爬指纹、DHL API）→ Phase 2 浏览器自动化
- 简报里的失败（HTTP 404 / fetch failed / 反爬拦截）本身就是情报：说明该链路要升级，不静默吞

## 已知边界（2026-09-18 首跑记录）

- 顺丰 `customer-service/notice` 404、燃油页本机 connect timeout → 公告源改用 `we/ow/chn/sc/`（SSR 372KB 可达）
- DHL newsroom 本机 fetch failed（连接级）→ 每日如实报错，网络环境变化后自动恢复
- FX 首跑告警：现价 6.72 vs 系统 7.15（−5.99%）→ 待操盘手裁决是否重定换汇基準
