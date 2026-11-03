# 活库索引 INDEX — loollook.com 操盘手系统

> **纪律**：任何任务开工前，先扫本索引找相关资产——禁止重复发明已有内容。
> 新产出文件必须在提交前于本索引登记一行。

## 核心战略板（操盘手直接依赖）

| 文件                            | 用途                                                                  |
| ------------------------------- | --------------------------------------------------------------------- |
| `operator-library.json`         | 战略板主文件（业务模型/漏斗/内容矩阵/CRO backlog/工单/品牌资产/EEAT） |
| `keyword-library.json`          | 眼镜关键词库                                                          |
| `eyewear-glossary-library.json` | 眼镜款式/材质/时尚术语 GEO 弹药库（搜索意图分）                       |
| `brand-library.json`            | 品牌运营库（定位/叙事/写作规则/案例）                                 |
| `persona-library.json`          | 买家画像（6 个人设）                                                  |
| `seo-meta-library.json`         | SEO meta 模板 + 关键词簇                                              |
| `competitor-library.json`       | 三层竞品库（Tier1同价7家 + Tier2高端4家 + Tier3线下恐惧）             |
| `competitor-library-zeelool.md` | ZEELOOL 深度拆解（6维对位 + 6篇blog母体 + Tier1复制模板）             |
| `blog-framework-lock.json`      | 博客路由/模板/分类/内容契约锁                                         |

## 度量 / GEO 台账

| 文件                   | 用途                                                      |
| ---------------------- | --------------------------------------------------------- |
| `ai-visibility.json`   | GEO 采样台账（7 prompt 组 × 3 AI）                        |
| `seo-geo-monthly.json` | 月度指标（GSC + 平台数据）                                |
| `content-master.md`    | 内容发布总计划（persona 绑定 + 品牌写作规则 + 首发 5 篇） |
| `decision-ledger.json` | 待裁决台账（授权分级 0-3）                                |

## 社媒五件套

| 文件                          | 用途                                              |
| ----------------------------- | ------------------------------------------------- |
| `social-platform-rules.json`  | 平台规则（IG/Pinterest/FB/YouTube 算法+执行规范） |
| `social-playbook.json`        | 社交出口层宪法（blog→社交切发规则）               |
| `social-calendar.json`        | 14 天测试日历                                     |
| `social-accounts-registry.md` | 平台账号资产登记表                                |
| `social-proof.json`           | 社证库（verified/pending/market context）         |

## 运营支撑

| 文件                    | 用途                                   |
| ----------------------- | -------------------------------------- |
| `selling-points.json`   | 卖点库（6 画像 × 证据句）              |
| `comment-sop.md`        | 评论区 SOP（if/then 回复规则）         |
| `edm-templates.md`      | EDM 邮件模板（新注册/唤醒/未付款跟进） |
| `visual-style-guide.md` | 视觉风格规范（三系列+硬规矩+禁用元素） |
| `departments.json`      | 部门编制表                             |

## 框架 / 协议 / 系统

| 文件                      | 用途                                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `../operator-flows.md`    | loollook 全系统工作流总纲 V1.0（五幕十三流 A1–E4，§22 母版 → loollook 全资产归属；全系统索引，新东西只答"进哪条流"） |
| `framework-lock.json`     | 操盘手框架锁                                                                                                         |
| `operator-protocol.md`    | 操盘手协议                                                                                                           |
| `operator-dashboard.json` | 操盘手仪表盘                                                                                                         |
| `system-versions.json`    | 系统版本追踪                                                                                                         |
| `t1-config.json`          | T1 配置                                                                                                              |
| `t1-evidence.json`        | T1 证据                                                                                                              |
| `ai-vs-real.json`         | AI 概念对象与标注词库（r10/rb9 闸门）                                                                                |
| `capability-radar.md`     | 能力等级雷达（L0–L3 证据级）                                                                                         |
| `capability-usage-map.md` | 反货架卷曲台账（触发点 / 死线 / 退役）                                                                               |

## 待办事项（来自 content-master.md）

1. ⚠️ Admin 后台——需 RESEND_API_KEY + admin@loollook.com 邮箱路由
2. ⚠️ 首页图片——需上传产品实拍/模特图
3. ⚠️ 博客未发布——5 篇首发文待写
4. ✅ llms.txt 路由——`src/routes/llms[.]txt.ts` 已部署，线上可访问 `/llms.txt`
5. ⚠️ GSC 提交——验证 + sitemap 提交
