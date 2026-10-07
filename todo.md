# lool.work TODO

工作笔记。截图放 `todo-attachments/`，用相对路径引用。Claude 会按本文件顺序处理。

- `[ ]` = 待办
- `[x]` = 完成
- 完成笔记紧跟标题下面（说"做了什么/版本号/smoke 结果"）

---

## [x] 1. 后台要默认中文版

## [x] 2. 后台目前只显示 product，需要显示 product_color，不然我无法比对前后端

## [x] 3. 其他表也应该通过这种方式，把字段显示出来

## [x] 4. PDP 八个颜色选择是否来自数据库？

已经是动态的：lool.work/product/aurora-tortoise PDP 通过 fetch /api/catalog → product_colors 表渲染按钮，验证拿到 8 个颜色按钮（Tortoise / Matte Black / Champagne Gold / Crystal Clear / Burgundy / Navy Blue / Soft Pink / Gunmetal Silver），完全来自 D1。在 admin 增删颜色立刻反映到前端。Lovable preview URL（chic-sight-makers.lovable.app）是设计稿独立部署，那个是 hardcode，不影响我们的 prod。

## [x] 5. /try-on 是否能开摄像头并把眼镜按面部识别叠到眼睛上

功能完整：lool.work/try-on 用 MediaPipe FaceLandmarker（本地推理，视频不离开设备）+ getUserMedia 拿摄像头流 + canvas drawImage 把镜框 PNG 按面部特征点 33/263（双眼外眼角）+ 168（鼻梁）算 angle/scale 叠加。本轮把 PICK A FRAME 选择器从硬编码 3 框改为 DB 驱动（useCatalogProducts → 取前 8 个 product，第一个 color 的 frontUrl 作 overlay PNG），admin 加新商品立刻在 try-on 出现。已部署 17/17 smoke 通过。

## [x] 6. 进入 /try-on 应携带 product；右侧 PICK A FRAME 显示该 product 的颜色；MORE FRAMES 随机抽 3 个其他 product

完成 v931b14d7：try-on Route 加 validateSearch 接 `?frame=<slug>`；activeProduct 来自 slug，PICK A FRAME 渲染 activeProduct.colors[]，MORE FRAMES 确定性随机抽 3 个其他 product（hash 排序），点击导航 /try-on?frame=<other>。aside 顶部"当前商品"卡片可点回 PDP。19/19 smoke。

## [x] 7. 首页 banner 4 张图对应 4 个产品，admin 可改图 + 改 product，价格不能 hardcode；Try them on 跳到该 product 的 try-on

完成 v=e4ea3cbc：migration 0016 新建 home_banners 表（slot 1-8 / product_id FK / image_url / subtitle_zh,en / active）；4 个 seed 行 slot1-4 对应已有商品 + /banners/hero-{1..4}.jpg 静态图。Public `GET /api/home-banners` JOIN product 返回完整字段；admin `GET/PUT /api/admin/home-banners` 全量替换。homepage Index() 加 Banner 类型 + state + fetch；hero 轮播图、editor pick 卡片名称/价格、"Try them on" 按钮的 ?frame= 参数全部从 activeBanner = banners[heroIdx] 读。admin SPA 加"🖼 首页 Banner" tab + BannersView：4 个 slot 卡片，每张可改商品下拉、上传图、副标题、启用，"保存全部"一次 PUT 写回。22/22 smoke。

## [x] 8. 首页两个大的 banner（Modern readers / Everyday eyeglasses）应该对应数据库的 lens type；某些镜框可同属两类，进入对应入口时显示符合的产品

完成 v=`6c2a5ea0`：

- `/api/catalog` 暴露每个 product 的 4 个 lens-compat flag：`supportsReader / supportsSingleVision / supportsProgressive / supportsNonPrescription`
- `Product` 类型 + 三处 adapter（`use-catalog-products`、`ProductListPage`、`product.$slug`）都补上 4 个 flag，缺省值 `reader/single/non=true, progressive=false`
- `/presbyopia` 路由的过滤条件从 `category="presbyopia"` 改成 `supportsReader !== false`
- `/myopia` 路由从 `category="myopia"` 改成 `supportsSingleVision !== false`
- 一个 frame 同时支持两类 → 两边都出现（user 显式诉求）
- PLP 侧栏"镜片类型"4 个 checkbox（reading/single/progressive/non）也从基于 `category` 的代理改成真 `supports_*` 检查
- 首页 CATEGORY DUO（"Modern Readers" / "Everyday Eyeglasses"）URL 维持 `/presbyopia` `/myopia`，文案保留，语义现在和 lens-compat 对齐
- Smoke：把 aurora-tortoise 临时设 single_vision=0，`/products`=6 / `/presbyopia`=6 / `/myopia`=5 (aurora 隐藏) / `/presbyopia` 仍含 aurora，已还原

---

<!-- 新需求贴这下面 -->

## [x] 数据库用 JSON 支持多语言（banner / product / color）

完成 v=`637117f5`：

- **Migration 0021**：`home_banners` (4 字段)、`products` (4 字段)、`product_colors` (1 字段) 的 `_zh/_en` 列对合并成单个 `_json TEXT`，shape `{"zh":"…","en":"…","ja"?:"…","ko"?:"…","es"?:"…","fr"?:"…","de"?:"…","it"?:"…","pt"?:"…","ar"?:"…"}`。SQLite `json_object` 回填、`DROP COLUMN` 旧列。
- **新 helper** `src/lib/lang.ts`：`pickLang(field, lang)`、`parseLangJson()` 等，fallback 链 `lang → en → zh → 其他非空`。
- **API**：catalog / home-banners / admin endpoints 全部 SELECT `_json` 并返回 lang-keyed 对象（不再是 `{zh, en}` pair）。
- **顺手修了一个潜伏 bug**：`/api/home-banners` 还在引用 migration 0020 已经 drop 掉的 `product_colors.front_url` → 改用 `json_extract(images_json, '$[0]')`。
- **前端**：`Product.name`、`Product.colors[].label`、`Product.highlights` 类型改成 `Record<string, string>`；adapter 适配；`pickBannerText` 从"非 zh 一律 en"改成真按 contentLang 优先。
- **Admin SPA**：新增 `LangTextEditor` 组件，10 个语言 tab 横排（已填高亮、未填灰色）。BannersView 4 个文本字段 + ProductsView 的 `Name` 都用它。Color label 暂时仍是 zh+en 双输入（写进 `label: {zh, en}` JSON）。
- **Smoke**：admin Banner 在 ja tab 输入"テスト"保存→ DB 出现 `eyebrow.ja`；清空再存→ `ja` key 自动移除。日语用户切换语言时 banner 现在 fallback 到英文 DB 内容（不再是 i18n 硬写日语）。

---

## [x] 9. PLP 形状筛选只有 5 种，但首页 Shape Guide 是 9 种

完成 v=`3bcfb01a`（PLP 侧栏）+ v=`4edfce23`（导航 mega menu）：

- `Shape` type union 从 5 种扩到 9 种：square / rectangle / cateye / butterfly / round / geometric / aviator / browline / oval
- `SHAPE_OPTIONS` 在 `ProductListPage.tsx` 加 4 个 entry（rectangle / butterfly / browline / geometric），每个配 mini SVG icon
- `NavMegaMenu.tsx` 顶部导航的 "SHOP BY SHAPE" 列也从 5 个扩到 9 个
- `i18n.tsx` 所有 10 种语言（en/zh/es/fr/de/it/pt/ja/ko/ar）补 4 个新 key：`menu.shape.{rectangle,butterfly,browline,geometric}`
- 三处 adapter（`use-catalog-products`、`ProductListPage`、`product.$slug`）的 shape 归一化从 `.toLowerCase()` 改成 `.toLowerCase().replace(/\s+/g, "")` —— DB 里的 "Cat eye" / "Browline" 这些带空格或大写的值正确归一到 `cateye` / `browline`，跟 SHAPE_OPTIONS 的 id 一致
- Smoke：PLP 形状区可见 9 种、Mega menu SHOP BY SHAPE 列可见 9 种 ✅

## [x] 10. style 全栈强约束 + PLP 加 style 筛选 + 1 个 seed 商品改成 classic

完成 v=`b3cea6cb`：

- **Migration 0022**：把 noir-rectangle 的 style 从 `character` 改成 `classic`，确保 4 个 bucket（minimal/business/character/classic）都至少有 1 个商品
- **后端强约束**：`api/admin/products/index.ts` 加 `VALID_STYLE = {minimal,business,character,classic}`，POST 用 `checkEnum(body.style, VALID_STYLE)`；`$id.ts` 把 `style` 从 `PATCHABLE_STR` 移到 `PATCHABLE_ENUM`。运营随手输入 "vintage" / "buisness" 之类的拼错会 400 拒绝。
- **Admin 编辑器**：`<input>` → `<select>`，4 个写死选项（minimal · 极简 / business · 商务 / character · 个性 / classic · 经典）
- **PLP 加风格筛选**：`ProductListPage.tsx` 加 `STYLE_OPTIONS` + 状态 `styles[]` + 过滤 `if (styles.length) list = list.filter(...)` + 侧栏新增 "风格 / Style" CheckRow 4 选组（位于"形状"下方"颜色"上方）
- **没做 SQL CHECK 约束**：因为 SQLite 不支持给现有列加 CHECK，要做的话得 CREATE TABLE products_new + INSERT SELECT + DROP + RENAME，FK 关联 product_colors / home_banners 太重。后端枚举验证已经覆盖所有写路径，效果一致
- **Smoke**：catalog 4 bucket 都有 product；PLP 点 "Classic" → 1 件 (noir-rectangle)；admin PATCH `{"style":"vintage"}` → 400 invalid_style，PATCH `"classic"` → 200；admin 编辑器 Style 是 dropdown ✅

## [x] 11. Mega menu 链接跳到 PLP 时默认勾选对应筛选

完成 v=`359329ee` + 修 v=`939a50b5`：

- **Mega menu** (`NavMegaMenu.tsx`)：每个 SHOP BY SHAPE / MATERIAL / STYLE 项的 Link 加 `search={{shape: s}}` / `{material: m}` / `{style: s}`；MenuItem 组件加 `search?: Record<string,string>` prop
- **3 个路由** (`/products`, `/presbyopia`, `/myopia`)：加 `validateSearch` 解析 `?shape=&material=&style=`，component 用 `Route.useSearch()` 透给 `ProductListPage`
- **PLP** (`ProductListPage.tsx`)：导出 `PreselectFilters` 类型，组件接 `preselect?` prop；`useState(materials/shapes/styles)` 初始值用 lazy initializer 从 preselect 取 `[preselect.shape]` 等
- **修了一个 bug**（v=`939a50b5`）：Style filter 用 `CheckRow` 时把 prop 写成 `checked={...}` 但组件期望 `active={...}` —— 视觉上选不上但实际过滤逻辑对。改成 `active=` 后正常
- **Smoke**：`/products?shape=aviator` Aviator 已勾选 + 2 件 ✅；`?material=titanium` Titanium 已勾 + 1 件 ✅；`?style=character` 已勾 + 1 件 ✅；`?style=classic` 已勾 + 1 件 (noir-rectangle) ✅；点 mega menu "Aviator" 链接跳转后已勾选 ✅

## [x] 12. PLP "Showing N results" 旁加 active filter chips（方便测试 / 用户感知当前筛选）

完成 v=`979e4096`：

- "Showing N results" 那一行右边并排显示所有 active filter 为 chip：material / shape / style / color / price / lens / gender 都覆盖
- 每个 chip 是 `[标签 ×]` 样式，点 × 单独移除该筛选
- 末尾追加 "Clear all / 清空" 链接，一键清所有筛选
- 标签按 contentLang 取当前语言显示
- Smoke：单选 character 显示 1 chip ✅；双选 aviator+titanium 显示 2 chip + 1 件结果 ✅；点 × 单独移除 OK ✅；Clear all 全清 + 显示全部 6 件 ✅

## [x] 13. 主页菜单 All / Eyeglasses / Reading + 页脚链接全部要带筛选条件跳转

完成 v=`767e1e17`：

- **Header 3 个 mega menu**：因为 NavMegaMenu 的 MenuItem 共用同一个 `to` prop（按顶层菜单决定 /products / /myopia / /presbyopia），#11 已经在每个 MenuItem 上加了 `search={{shape/material/style}}`，3 个目标路由都加了 `validateSearch`，所以"Reading > Aviator"会跳到 `/presbyopia?shape=aviator` 并自动勾选。✅ 不用再改
- **Footer**：
  - `Col` 类型加 `search?: Record<string, string>` 字段
  - Shape 列 5 个链接加 `{shape: "round/square/aviator/cateye/oval"}`
  - Color 列 5 个链接加 `{color: "black/tortoise/gold/clear/pink"}`
  - Material 列 4 个链接加 `{material: "acetate/titanium/tr90/metal"}`
  - 渲染处给 `<Link>` 透传 `search={l.search as never}`
- **PLP**：`PreselectFilters` 加 `color?` 字段，`useState(colors)` 用 lazy initializer 从 preselect 取值；3 个路由的 `validateSearch` 加 `color` 解析
- **Smoke**（5/5）：
  - Reading 菜单 → Aviator → `/presbyopia?shape=aviator` 已勾选 ✅
  - Eyeglasses 菜单 → Titanium → `/myopia?material=titanium` 已勾选 ✅
  - Footer Shape > Round → `/products?shape=round` 已勾选 ✅
  - Footer Color > Tortoise → `/products?color=tortoise` 色块高亮 ✅
  - Footer Material > Acetate → `/products?material=acetate` 已勾选 ✅
- **补充修复 v=`58500139`**：首页 "Shape Guide" 9 张缩略图原本是 `/products` 不带 query，已改为 `search={{shape: s.key}}`。点 Aviator 缩略图 → `/products?shape=aviator` 已勾选 ✅
- **完整 8 路径全点过 + 9 个 Shape Guide tile 也通过**：Header All / Eyeglasses / Reading 三个 mega menu 共 27 个菜单项 + Footer 三列 14 个链接 + 首页 Shape Guide 9 个 tile，全部带正确 query 跳转 + PLP 自动勾选 + 显示 chip ✅
- **追加修复 v=`ed95974b`**：mega menu 点完一个项目后下拉不消失（Header 不重新挂载，hover state 留住）。给 NavMegaMenu 里所有 Link / MenuItem / 顶部菜单触发 / featured 商品卡片都加 `onClick={() => setOpen(false)}`，Smoke：点 All > Aviator / Reading > Round / featured 卡片三种场景，下拉菜单都立即消失 ✅
- **再修复 v=`b5ef63fa`**：用户报告"先点 Round 看到结果，再点 Square 没反应"。根因：在同一个 PLP 路由上 mega menu 跳转复用组件实例，`useState` 的 lazy initializer 只跑一次，URL 变了 state 不变。修复：加 4 个 `useEffect` 监听 `preselect.{shape,material,style,color}`，URL 变化时 setState 同步成 `[新值]`。每个 effect 只动对应 bucket，留住其他维度的侧栏选择。Smoke：Round → Square → Aviator 链式点击，sidebar/chip 每步都正确切换 ✅

## [x] 14. PLP 颜色筛选改成 DB distinct 动态读取

完成 v=`d728ba72`：

- **问题**：`COLOR_OPTIONS` 在 `ProductListPage.tsx` 写死 8 色（`black/tortoise/clear/gold/silver/brown/pink/blue`），跟 DB 里实际的 8 色（`black/burgundy/crystal/gold/navy/pink/silver/tortoise`）有 3 个 ID 对不上：clear vs crystal、brown 不存在、blue vs navy。点 PLP 的 Clear/Brown/Blue → 0 件结果；DB 里的 burgundy 压根选不了
- **修复**：删掉硬编码 `COLOR_OPTIONS` 常量；新增 `useMemo(colorOpts)` 从 `products` 数组遍历 `colors[]`，按 `color.id` 去重，第一次出现 wins 决定 hex 和 label
- **多语言**：标签用 `pickLang(c.label, contentLang)`（之前是 `c[contentLang]`）—— 自动支持 10 种语言的 label_json
- **轻色高亮**：原来只对 `id === "clear"` 渲染 Check icon，改成正则判断 hex 起始 `#f.. / #e[0-9a-f]..` 的浅色，更通用（适用于 crystal、pink 等浅色）
- **Smoke**：PLP 颜色区现在显示 8 个正确的 swatch（Black/Burgundy/Crystal Clear/Champagne Gold/Navy Blue/Soft Pink/Gunmetal Silver/Tortoise），老的 Clear/Brown/Blue 不再出现；点 Burgundy → ring-primary + Burgundy chip + 6 件结果（多数商品都有 8 色） ✅
- **后续好处**：admin 在 `product_colors` 增删颜色立刻反映到 PLP 筛选，不用改前端代码

## [x] 15. Eyeglasses 菜单进入默认勾 Single Vision，Reading 默认勾 Reading

完成 v=`4a2c3a1a`：

- `ProductListPage` 的 `lenses` state 改成跟着 `category` prop 默认：`/myopia` → `["single"]`，`/presbyopia` → `["reading"]`，`/products` → `[]`
- 加 `useEffect` 监听 `category`，路由切换时重置默认值（虽然 TanStack 跨 file route 会 unmount，加这个 effect 是安全网）
- URL 不污染 lens 参数 —— 默认值由路由本身蕴含
- 子菜单跳转（shape/material/style）行为不变，附带的 lens 默认值跟随路由：从 Eyeglasses > Aviator → `/myopia?shape=aviator`，sidebar 同时勾上 Aviator + Single Vision；从 Reading > Round → `/presbyopia?shape=round`，勾 Round + Reading
- 用户随时可以点 chip 上的 × 取消默认值，结果立即扩展（如 /myopia 取消 Single Vision → 从 2 件到 6 件）
- Smoke 6/6：/myopia ✅、/presbyopia ✅、/products 不勾 ✅、Eyeglasses + Aviator combo ✅、Reading + Round combo ✅、× 移除 ✅

## [x] 16. 手机版导航子菜单点不出来

完成 v=`2f7989ed`：

- **问题**：mobile drawer 只有 5 个顶级 link（首页/所有产品/近视镜/老花镜/博客），没法选 shape/material/style，desktop mega menu 的子菜单功能完全缺失
- **修复**：mobile drawer 里给 3 个有 category 的菜单项加 ChevronDown 切换按钮，点击展开 accordion，展开内容是 3 段（SHOP BY SHAPE 9 chips / MATERIAL 4 chips / STYLE 4 chips），每个 chip 是个 Link，带正确 search query 跳到对应路由
- **新组件 `SubGroup`**：title + chip 列表，传 `searchKey`（shape/material/style）+ `to`（路由路径）+ `onClose`，可复用
- **行为**：点 chip 后立刻关掉整个 drawer（`onClose` 同时关 `open` 和 `expandedMenu`），跳转后 PLP 自动勾选对应过滤器（既有逻辑生效）
- 一次只展开一个 menu accordion（点另一个会自动收前一个），保持紧凑
- Smoke 4/4 mobile viewport (390×844)：drawer 5 项 + 3 个 chevron ✅；展开"所有产品"→ 17 chips ✅；点 Aviator → /products?shape=aviator + Aviator 勾选 ✅；近视镜 → Square → /myopia?shape=square + Square + Single Vision ✅；老花镜 → Aviator → /presbyopia?shape=aviator + Aviator + Reading ✅
