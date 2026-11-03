# lool Operator Protocol V1.0（操盘协议）

> **业务**：loollook.com — DTC 眼镜独立站（老花镜+近视镜），45-60 代际，去老年化定位。
> **阶段**：冷启动，从无真实客户订单。0→1 阶段，默认姿态泵水。
> **实现边界**：本协议=文档+操盘手纪律，一行代码不多写。

---

## 0. 最高运行规则

1. **信号不足，不允许优化，只允许建设。** 当前站况：冷启动——默认姿态泵水。
2. **P0-Human 未人工确认，不得 Closed。** 防假闭环。
3. **红线三硬顶不变**：不自导自演（假评论红线）· 不接 API 不买小号 · 涉钱站主拍板。
4. **无出处数字不入任何输出**（T1-T4；T4 须带 validation_plan）。
5. **禁用词红线**：senior / elderly / old / aging / anti-aging / presbyopia / factory / handmade。

---

## 1. Current Truth Protocol

**九个字：一张表、两道门、默认假。**

### 1.1 事实宪法表

| 事实      | 权威源         | 新鲜度策略 | 可解锁动作                     |
| --------- | -------------- | ---------- | ------------------------------ |
| 订单/收入 | D1 DB          | 实时读取   | 默认 T0（测试），站主盖章才 T1 |
| 咨询      | consult_events | 实时       | 过 t1 自测甄别                 |
| GSC/流量  | GSC API        | TTL 7d     | SEO/流量判断                   |
| 画像/口径 | framework-lock | 事件驱动   | 内容生产                       |

### 1.2 两道门

- **门一 Freshness**：有验证时间且未超适用策略 → FRESH；否则 → STALE
- **门二 Authenticity**：T0=自测 → 永不进真实商业学习；T1=真实客户一手 → 才进学习

### 1.3 默认假

**任何缺少可验证时间戳的事实，默认 STALE。**

---

## 2. Priority Engine

| 级           | 定义                        | 备注                      |
| ------------ | --------------------------- | ------------------------- |
| **P0-AI**    | 钱/客户/交易风险            | 当日最高                  |
| **P0-Human** | 只站主能动的                | AI 备料+提醒，永不 Closed |
| **P1**       | 制造成交机会（Signal Pump） | P0 为空时强制落 here      |
| **P2**       | 长期资产                    |                           |
| **P3**       | 优化效率                    | traffic L0/L1 整级冻结    |

---

## 3. Operator Runtime Layer

| 核心                | 输入                    | 规则                        | 输出          |
| ------------------- | ----------------------- | --------------------------- | ------------- |
| ① Revenue Sentinel  | 订单/支付               | 未回>24h 标红；继承两道门   | Brief 第一行  |
| ② Customer Memory   | 真实咨询原文            | 显著性四门槛才入库；T0 剔除 | 异议卡+话术卡 |
| ③ Decision Protocol | signal_state            | 28 天滚动定级；AI 无自评权  | Brief 引用    |
| ④ Heartbeat         | 任务时间戳              | 超期=环死，报警             | Brief 心跳行  |
| ⑤ Signal Pump       | content-master/社媒日历 | P1 默认去向；organic_only   | 今日泵水清单  |

---

## 4. Daily Brief

```
lool Operator Brief · [日期] · 信号:traffic L0 / commercial L0
① Revenue Status —— 未回咨询X / 真实订单0 / 支付异常X
② Customer Actions —— 今日必须回的人+备好的回复稿
③ Signal Pump —— 今日建设动作+昨日产出
④ System Health —— 各环心跳 OK/死
⑤ Decision Memory —— 新增判断/到期验证/复用命中
```

---

## 5. 判例库

| #   | 情况                     | 裁决                              |
| --- | ------------------------ | --------------------------------- |
| 001 | 48h 未回客户 vs 新关键词 | 客户回复 > P1 建设                |
| 002 | P0 为空的一天            | 强制 P1 泵水，禁 P3               |
| 003 | 收入信号未验真就挂 P0    | 禁止——收入默认 T0，盖章才 T1      |
| 004 | 产稿无数据依据           | 无简报不开工                      |
| 005 | 平台互动信号未问出处     | 先问出处——站主/自种互动=T0 不计数 |

---

## 6. 挂接点

`decision-ledger.json`（权限）· `judgment-log.md`（记忆）· `framework-lock`（口径总阀门）· `operator-dashboard.json`（泵水同频）
