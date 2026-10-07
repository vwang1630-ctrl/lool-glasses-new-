# WO-20260928-04 修复方案 V1.0 — dutyMode 持久化缺口

> 状态：pending → 待白天执行
> 责任：操盘手 + 站主（schema 变更需批）
> 风险等级：🔴 法务（DDU 订单发票显示 DDP 包税=虚假陈述）

---

## 问题

结账页客户选了 DDP 或 DDU，但 dutyMode 没有持久化到 orders 表。导致：
1. invoice.ts:218 无条件打印 "Prices are DDP"——DDU 订单下=虚假陈述
2. order.detail 无法显示客户选了什么关税模式
3. 后续任何跟这张订单有关的操作都无法追溯关税选择

## 修复方案（6 文件）

| # | 文件 | 改动点 |
|---|---|---|
| 1 | orders 表 + schema | 加 duty_mode 列 text notnull default 'DDP' + migration |
| 2 | checkout.tsx + payments.server.ts | createOrderFor 入参接 dutyMode（zod 已有），落库 |
| 3 | invoice.ts:218 | if duty_mode==='DDU' → "Duties self-pay at import" else DDP 原文 |
| 4 | order.detail.tsx | 读 duty_mode 显示对应政策原文 |
| 5 | order-confirmed.tsx | 同上 |
| 6 | MobileCheckout/MobileOrderDetail | 同上 |

## 验收

1. 本地建 DDU 测试单 → invoice PDF 显示 DDU 文案正确
2. 建 DDP 测试单 → invoice PDF 显示 DDP 文案正确
3. 详情页显示正确
4. score + verify 全过

## 今晚已完成的止血

invoice.ts:218 + 297 无条件 "Prices are DDP" → 中性 "Door-to-door delivery. Duties handled at checkout per selected mode."
invoice.ts:185/293 "DDP shipping" → "Shipping"

## 今晚备份首次实战

backup-to-git.mjs 首跑成功：7 表 116 行已 AES256 加密导出至 backup/git/db/*.json.gpg
GIT_BACKUP_PASS 需站主换成真口令（当前为测试值）
