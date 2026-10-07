# 画像-标签-内容 联动台账（persona-hashtag-linkage）

> **联动规则（2026-10-04 站主令）**：新数据（截图/评论/市场情报）入库时，必须**同步更新三件套**——①本表对应市场行的用户画像 ②该市场的发布标签组 ③进行中的内容包（caption/钩子）。只更新其一 = 违反活库红线。
> 触发器：站主丢截图/数据 → 走数 → 更新本表 → 影响中的 Reel 包同枝更新 → INDEX 登记。
> 对账：每月与 ai_bot_hits / GSC 对一次账（标签有效性升降级）。

## 市场分段 × 画像 × 标签组（首版：2026-10-04，全部来自站主截图实证）

### S1 · GCC/迪拜（主攻段 · rules V8.5 原有）
- **画像**：设计师 / showroom 采购 / 高净值业主；重 Save（showroom meeting 用）与 Share（转给设计师）
- **标签组**：#AlserkalAvenue #DesignerFurnitureDubai #DubaiShowroom #ShanghaiAtelier #CollectibleDesign
- **内容钩子**：Save this for your showroom meeting / Share with your designer
- **数据源**：rules V8.5.0 实证标签 + 泵水第一战主战场设定

### S2 · 印度（NavHome 实证 · 观望教育段）
- **画像**：主动询价的中产购买者（评论区全 Price?/Size?/Availability），IG Reel 原生，价格敏感；当前客单错配——**只教育不下注**
- **标签组**（NavHome 实测有效标签照抄）：#furniture #homedecor #homedesign #interiordesign #furnituredesign #luxury #sofa #trending #reels #explore #GorillaSofa
- **内容钩子**：DM to know more（市场惯例）；教育向："the original vs the plush copies"
- **数据源**：NavHome 帖 32赞/67评 全 Price?（站主截图 10-04）

### S3 · 西语/拉美（pargazkidszone 实证 · 个性化疗养段）
- **画像**：重 exclusivity/personalización 话术响应者；西语内容；190赞/55评 Precio 洪水
- **标签组**：#MueblesDeLujo #GorillaArmchair #EdiciónLimitada #MueblesDeDiseño
- **内容钩子**：Edición única / personalización total / "La exclusividad te espera"（同行验证话术，我们用真实版：一人一款No two alike）
- **数据源**：pargazkidszone 帖 190赞/55评（站主截图 10-04）

### S4 · 美洲 meme 圈（LV Furniture 实证 · 传播节点段）
- **画像**：meme 流量/娱乐受众（"My wife left me because of this" 86 赞），非直接买家，是**免费二次传播节点**
- **标签组**：泛流量标签即可（此段不求精准求破圈）
- **内容钩子**：polarization 玩梗（"Everyone posts the render" 对垒姿态）；目标=Share 不是询盘
- **数据源**：LV Furniture 714 赞/玩梗评论 86 赞（站主截图 10-04）

## 联动纪律

1. 新市场数据入库 → 本表加行或改行（画像/标签/钩子三格全填）→ 影响中的内容包同枝更新 → INDEX 登记
2. 标签升降级：月度对账时，带来 UTM/询盘的标签升主位；连续两月零命中降副位
3. 跨段通用禁项不变：毒词 factory、caption 挂链接、假买家、报价进评论区
