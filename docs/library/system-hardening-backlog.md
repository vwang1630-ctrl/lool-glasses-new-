# 系统完善工单(system-hardening-backlog)

> 2026-09-30 立项。起因:站主判「系统不够完善,复制起来可能不能用,再优化再去做好」——
> 微技能化/插件化 **暂停**,先完成本清单。完成标准见 §验收。

## P0 不修复制必死

- [ ] **去硬编码审计**:pdp-toolbox.mjs + social-gen 模板里的项目专属常量全部抽出
  → 收敛为 `project.json`(品牌名/产品线/市场/时区/已废钩子表/信任句/轮换比例)
  已知硬编码点:social-gen 模板的 "Comment REAL DUBAI"、"200kg load test, 300kg frame, 5.5x stitching"
  (后者与 PDP 承重口径存疑,一并核对)、REAL 回复脚本、Dubai 场景默认值
- [ ] **模板-裁决一致性闸**:把「已废词表/已废钩子」做成机器可读(rules 区),
  rb12 出厂自检时比对,出已废内容=FAIL——今天 social-gen 出已废 REAL DUBAI 是实证
- [ ] **规则单一事实源**:散在 说明书§8/skills/content-master§A/闸门代码 四处的裁决
  收敛为一份机器可读 rules(文档只留人读版),闸门与模板从 rules 读

## P1 复制体验

- [ ] `fuzz-init`:新项目=project.json+空库骨架+脚本就位,一键
- [ ] 闸门工具去 fuzzsofa 化自检:`selftest` 增加「项目配置完整性」检查
- [ ] 文档导航刷新(§19 已立,补本清单链接)

## 并行工单

- sales-intent-backlog.md(2026-09-30 立):销售意图升级——欲望三查/卖点库/blog 送水定位/驾驶舱三仪表;加进攻层不拆防御层

## P2 完成后再议

- [ ] 微技能化(按闸门边界拆 10 个)+ 用户级/插件化(2026-09-30 讨论稿,见会话)
- [ ] Workflow 批量编排(多产品并行过闸/发布周批量生成)

## §验收(完成标准)

在干净沙箱目录做一次**全链路空跑演练**:
init → 假产品 intake → 闸门 → blog → social-gen → 发布包,
全程零 fuzzsofa 残留、零已废钩子、selftest 全绿 —— 演练通过才算「复制起来能用」。

## 里程碑裁决记录

- 2026-09-30 站主:复制暂缓,先优化(本清单);微技能化方案留档 P2

## 2026-10-05 新增：退役承重口径全站清点（P1）
- 背景：Mofu PDP 修复时发现页内仍见 300kg ×53（源自关联产品嵌入/社证数据，Mofu 本体 data 已清零）
- 钦定口径：全 4 品 rated 200kg；"300kg 静态"退役。⚠️ 待站主澄清："load-tested to 300kg"（动态测试证据，Blog#2 已用且过闸）是否保留
- 动作：全站递归审计（4 品 data + translations + social-proof + content blocks + blog 正文），区分"额定"与"测试证据"两类分别处理

## 2026-10-05 新增（P0）：SSR/浏览器双库渲染统一
- 发现：backend-config self-hosted 模式下，浏览器端 .from() 走 /api/rest/v1（自托管库），但 SSR 因"相对 URL 无法 fetch"回退 managed client = Supabase 云库（supabaseClient.ts 注释自认）——同一页面两套数据源
- 已实锤：自托管库 Mofu 行已全净（三只猫/Cat Friendly/300kg/ Family 全零），但线上 SSR payload 仍出 300kg×4-12（JSON-LD FAQ+内嵌翻译字典），Google/AI 爬虫可见
- 修复选项：A) 设 VITE_API_HOST 让 SSR 也走自托管（需评估当初回退设计的原因+重建）；B) 云库同步清理（本机直连 supabase.co 被拒，需经服务器出口/WARP）；C) 双写。建议 A，动前先查云库与自托管的表结构差异
- 关联：退役口径清点（上一条）在双库统一后才能终验

## 2026-10-06 新增（P1）：Supabase 云库 translations 残留（旧口径/旧叙事的渲染层源头）
- 机制实锤：SSR 的 i18n 层走"未切换的 managed client"=Supabase 云库 translations 表（category:ui,auto）——每次渲染自动回写 EN 缓存行。自托管库的清理无法触及云库副本，删除后渲染即再生
- 现状：自托管库已全净；云库残留 8 行（"rated 300 kg"/"three cats"/"Mofu Family" 等旧串，id 45147-45219 段）——仅存于 JSON-LD/字典 payload 层，爬虫可见，页面正文不可见
- **修复（站主 2 分钟）**：Supabase Dashboard → SQL Editor → 执行以下 DELETE（已按无出处红线核实这些行全部为退役口径/旧叙事）：
**⚠️ 2026-10-06 深夜补充实锤**：自托管库同款行已清零并验证；但 SSR 渲染仍出 300kg ×4-12/页——**确认残留真身在 CLOUD 库 translations 表**（SSR i18n 层走 managed client 读云库；自托管清理无法触及）。下方 SQL 就是打云库的，站主执行后即终清。另：云库 products 表同样未同步本店全部修复（三只猫/新描述等）——双库渲染统一（上一条 P0）为长期解。
```sql
delete from translations
where source_text ilike '%300 kg%' or source_text ilike '%300kg%'
   or translated_text ilike '%300 kg%' or translated_text ilike '%300kg%'
   or source_text ilike '%three cats%' or translated_text ilike '%three cats%'
   or translated_text like '%三只猫%'
   or source_text ilike '%Mofu Family%' or translated_text ilike '%Mofu Family%'
   or source_text ilike '%Cat Friendly Armchair%' or translated_text ilike '%Cat Friendly%';
```
- 删除后：SSR 渲染源已切净（VITE_API_HOST 对齐），不再再生
- 关联：P0 双库渲染统一（本文件上一条）——长期解仍建议 VITE_API_HOST 路线评估

### 2026-10-06 更新：双库统一 A 方案已试并回滚
- VITE_API_HOST 注入导致 admin 前端数据面同被切到自托管库（ai_chat 等表缺失→黑屏），已回滚
- 双库统一需另寻方案：server-only fetch 层区分（构建/运行时按环境注入不同 baseUrl）/ 自托管库补齐 admin 所需表 / 云库定期同步清洗——三项均挂起待专项设计
