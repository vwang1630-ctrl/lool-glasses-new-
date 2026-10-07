# Wikidata 建卡草稿 · Kong Tender Titan（提交版 v1.0）

> 目的：给 AI 一个可校验的实体锚点。本文是复制粘贴稿——你在 wikidata.org 注册后，按顺序照抄即可。
> 铁律：**引用只挂官方网址和独立目录页，永不挂付费通稿**（非独立来源会导致条目被删）。

## 第 0 步：注册
- wikidata.org 右上 Create account（免费，只需用户名+密码+邮箱）
- 建议用户名用品牌相关名（如 FuzzSofaStudio），透明身份反而加分

## 第 1 步：先建品牌条目（母条目）
入口：wikidata.org → 左侧 Create a new item

| 字段 | 填入 |
|---|---|
| Label (en) | Fuzz Sofa Studio |
| Description (en) | Chinese furniture design studio specializing in sculptural animal-shaped sofas |
| Aliases (en) | Fuzz Sofa, FuzzSofa |

**Statements（逐条添加，右侧 "add statement"）：**

| 属性 | 值 | 说明 |
|---|---|---|
| instance of (P31) | 搜索并选：business / design studio | UI 里输入关键词选择即可 |
| official website (P856) | https://fuzzsofa.com | |
| country (P17) | China | |
| industry (P452) | furniture manufacturing / furniture industry | |
| described at URL (P973) | https://fuzzsofa.com/en/about | |

每条 statement 右下角 "add reference" → 引用来源一律填 **official website（P856 对应的 https://fuzzsofa.com）**，retrieved 填当天日期。

## 第 2 步：建产品条目（子条目）
| 字段 | 填入 |
|---|---|
| Label (en) | Kong Tender Titan |
| Description (en) | Monumental gorilla-shaped sculptural sofa designed by Fuzz Sofa Studio |
| Aliases (en) | King Kong Sofa, Kong sofa, gorilla sofa |

**Statements：**

| 属性 | 值 |
|---|---|
| instance of (P31) | sofa |
| manufacturer (P176) | Fuzz Sofa Studio（选刚建的母条目） |
| official website (P856) | https://fuzzsofa.com/en/kong-tender-titan-monumental-sculpture-sofa.html |
| country of origin (P495) | China |
| described at URL (P973) | 官网产品页（同上） |

## 第 3 步：等目录收录通过后回来加固（关键）
Architonic / Houzz / DesignRush 审核通过后，把**它们的品牌页 URL** 作为 reference 加到品牌条目的 instance of / industry 上——这才是审核员认的**独立第三方来源**，条目从此站稳。

## 红线（审核员会看的）
1. ❌ 不挂任何付费通稿链接
2. ❌ 不写宣传语（description 只写"是什么"，不写 "luxury/flagship/best"）
3. ❌ 不一次填太多（先 5-6 条 statement，被接受后再补）
4. ✅ description 全英文、纯事实、不带形容词

## 提交后
- 条目 URL 发回给我 → 我把 URL 加进站内 Organization schema 的 sameAs（形成站内↔Wikidata 互指闭环）
- 两周后 Wikidata 搜索 "Fuzz Sofa" 应能直接命中
