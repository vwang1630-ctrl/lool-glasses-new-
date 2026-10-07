# 站主作战清单 V2 — 全部任务 · 按时间排列 · 2026-09-28

> 一份文档，全部任务。打开照做，不用记。做完一项勾一项。

---

## 🔴 今天必须做（30 分钟）

### ① Pinterest Board 改名（30 秒）
打开 Pinterest → 你的 Board → 编辑 → 改名：
```
Designer Furniture Dubai — Tactile Luxury & Atelier Craft
```

### ② Pinterest 简介更新（30 秒）
编辑个人资料 → 简介栏粘贴：
```
FUZZ SOFA STUDIO — original sculptural sofas & animal shaped sofas (gorilla, owl, cat), designed and hand-finished in our Shanghai atelier. Every form is exclusive worldwide IP: no OEM, no catalog, one partner per city. Engineered like furniture: 200kg load tested, serialised QC. Made to order, shipped worldwide — duties handled at checkout. See it in your room: one photo, a visualization in about 2 minutes.
```

### ③ 发 FB 帖（如果 9/27 没发）
1. 上传图：https://nakwtxteihlvsocjibvq.supabase.co/storage/v1/object/public/product-images/product_main/1787550510729-pvlfgw1s.webp
2. 复制文案：`Not from the 3 catalogs — one partner per city. Would your showroom show it?`
3. 挂链接：https://fuzzsofa.com/en/journal/where-dubai-finds-original-furniture.html?utm_source=facebook&utm_medium=social&utm_campaign=where-dubai-finds-original-furniture
4. 评论区贴阿语首评：
   استوديو شنغهاي المستقل + تصاميم أصلية حصرية عالمياً + بحث وتطوير داخلي + ورشة خاصة. Atelier process: SKETCH→FOAM→SKIN→VISION. 200kg test video in comments.
5. 自评②：`Want to see this piece in your majlis? Send a photo of your room — we render it in about 2 hours.`

---

## 🟡 本周内做（按优先级）

### ④ 确认 IG 账号已切换为 Business/Creator
IG → 设置 → 账号 → 如果不是 Business/Creator → 切换（免费）。
没有这个，看不到 Insights 数据。

### ⑤ 竞品研究 30 分钟
打开桌面 `社媒竞品研究任务卡.html` → 按 5 个账号逐个看 → 把看到的打字发给我。
重点：@office_logix_shop 的猩猩椅互动数、评论区在问什么、他们卖多少钱。

### ⑥ 发媒体信第一封（MyModernMet）
发件邮箱：info@fuzzsofa.com
收件人：MyModernMet 网站投稿/联系邮箱
主题：`The viral AI gorilla sofa render — built for real by a Shanghai atelier`
正文：
```
Hi [Name] — MyModernMet has covered the moment when AI concepts become real creations, and that's exactly what happened here. The gorilla couch render that flooded social feeds was just an image — so our Shanghai atelier built it: clay form, welded steel core, high-density foam, hand-applied fur, 200 kg load-tested, inspection reports serialised in every crate. We documented the full process from sketch to sofa and can share high-res build photos, the load-test report, and Room Preview visualizations that place the piece inside a buyer's own room photo. Would this fit your coverage?

Cici, Founder, FUZZ SOFA STUDIO
fuzzsofa.com | trade@fuzzsofa.com
```

### ⑦ GIT_BACKUP_PASS 换真口令
编辑 .env 文件 → GIT_BACKUP_PASS=你自己设的真口令 → 存密码管理器

### ⑧ 加 DMARC DNS 记录
去域名管理后台（Cloudflare）→ DNS → 添加 TXT 记录：
名称：_dmarc.fuzzsofa.com
内容：v=DMARC1; p=none; rua=mailto:info@fuzzsofa.com

### ⑨ 确认 trade@ 测试信
查看你的邮箱（含垃圾箱）→ 确认 9/26 发的 trade@ 测试信收到了 → 告诉我结果

---

## 🟡 一次性任务（本周内随时）

### ⑩ 注册 Backup Daily 计划任务
管理员 PowerShell 执行：
```powershell
schtasks /Create /SC DAILY /ST 10:05 /TN "FUZZ Backup Daily" /TR "D:\data\code\cici\fuzz-couch-comfort\scripts\backup-daily-task.bat"
```

---

## 🟢 内容与发布

**已全部迁至 `content-master.md`(唯一内容文档,站主令 2026-09-29):排期/发布包/规则/回流数据/判读线。**
本文件此后只放非内容类任务清单。

（30 天后复盘用）

| 指标 | 及格 | 优秀 | 低于及格怎么办 |
|---|---|---|---|
| Pinterest 出站 CTR | ≥0.3% | ≥1% | 换标题关键词 |
| IG 互动率 | ≥0.5% | ≥2% | 加 emotion 钩子 |
| FB 触达 | ≥粉丝×1% | ≥粉丝×3% | 降频提质量 |
| AI 引用 | 30 天 ≥1 次 | ≥3 次 | 加 blog 数量 |
| consult_events | 14 天 ≥3 | ≥8 | 换钩子角度 |

---

*判读线/周日收件箱/发布内容 均已并入 `content-master.md`(2026-09-29 站主令:内容只写一个文档)。*

# 2026-09-28 总计划 V2 已退役（2026-10-04）——被 master-plan-20261004.md(V3 全量整合)取代,本文件仅作历史档案
