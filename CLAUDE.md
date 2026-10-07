# lool.work — Modern reading & eyeglasses, direct

DTC 眼镜独立站。设计稿来自 Lovable（fork：`lucasxue2/lool.work`，原仓库 `vwang1630-ctrl/spectacle-style`）。
根目录通用约定见 `../CLAUDE.md`。本站点详细文档见 [`docs/`](docs/)。

## 设计稿来源

- **C 端（用户面）设计稿**：[`vwang1630-ctrl/spectacle-style`](https://github.com/vwang1630-ctrl/spectacle-style)（fork: `lucasxue2/lool.work`）
- **后台（admin）页面设计稿**：[`vwang1630-ctrl/glasses-opus-studio`](https://github.com/vwang1630-ctrl/glasses-opus-studio) ← 后台 UI 改造时参照这里

### 设计稿使用原则（重要）

**1:1 复刻 Lovable 设计稿。** 用户面页面以设计稿为实现规范（C 端设计稿见 `spectacle-style`），
逐页与设计稿对齐：

1. **内容照搬**：标题、副标题、按钮、说明、文案措辞——按设计稿原样复刻，不重写、不精简、不"优化"。
2. **结构照搬**：页面 section 的组成、顺序、信息架构、交互流程与设计稿一致；不擅自增删 section、不重组布局。
3. **视觉照搬**：配色、栅格、间距、组件样式按设计稿。
4. **仅数据层适配真实 schema**（唯一允许的偏离，且不改变呈现）：
   - 设计稿 mock 字段名映射到真实 D1 schema 列名（见 [`docs/schema.md`](docs/schema.md)）
   - 硬编码 demo 数据换成真实 API（`/api/catalog`、`/api/lens/skus` 等）
   - 文案接入 10 语言 JSON + `pickLang()`——**设计稿文字即权威原文**，翻译铺满 10 语言，显示内容须与设计稿一致
5. **偏离设计稿前先核对设计稿**：确认设计稿确实没有该内容，而不是凭"产品判断"改动。

> 例外：当设计稿结构与真实 D1 schema 硬冲突（典型如镜片购买 wizard 的选项维度对不上
> `lens_skus` 字段），不要擅自取舍——停下来跟所有者确认。

## 速览

- **业务**：老花镜（presbyopia）+ 近视镜（myopia），主打"去老年化"。45–60 代际；海外为主。
- **特色功能**：`/measure-pd`（MediaPipe 量瞳距）、`/try-on`（虚拟试戴）、`/prescription-guide`、`/find-your-fit`、`/choose-eyeglasses`。
- **栈**：TanStack Start (SSR) + React 19 + Tailwind v4 + Cloudflare Workers + D1 + R2 + Resend + Stripe。
- **生产**：[https://lool.work](https://lool.work)（+ workers.dev fallback）。
- **收单**：Stripe（HongKong Lool Vision HK 主体）。订单币种 USD，账户结算 HKD（Stripe 自动换汇）。Webhook `POST /api/checkout/stripe-webhook`。前端 Payment Element 在 `/{lang}/checkout` 第二步。

## 运维注记

- **CF WAF：阻断中国大陆 IP**（2026-05-08 启用）
  - Custom rule `Block mainland China`：表达式 `(ip.src.country eq "CN")` → action `block` → 返回 CF 默认 1020 / HTTP 403
  - 仅大陆 CN，HK / MO / TW 不影响（与市场定位"海外为主"一致）
  - 修改入口：dash → lool.work → Security → WAF → Custom rules（zone id `16fff3d5eb115e8e2d225641e54ffe48`）
  - **用户报"国内打不开"是预期行为，不当 bug 排查**；如需排错，先到 dash → Security → Events 看是否被这条规则命中

## 并行开发约定

Lucas 经常同时打开多个窗口处理不同问题。**每个独立话题 / bug / 需求都应该有自己的 git worktree**，不要多个窗口共用主 checkout 改代码。

- 主 checkout `/Users/lucas/code/DTCS/lool.work` 尽量只用于阅读、同步、收口和临时小改。
- 只要一个问题会持续修改代码，就从 main 拉一个独立 worktree + 独立分支，例如 `../lool.work-<topic>`。
- 不同窗口处理不同问题时，各自只在自己的 worktree 里改、测、提交；不要在同一个工作树里交叉改文件。
- 这样可以避免并行修改时互相覆盖、lint/build 看到别的问题的半成品、以及提交时把不相关改动混在一起。

## 文档导航

| 文档                                                       | 内容                                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [`docs/schema.md`](docs/schema.md)                         | D1 schema 完整字段 + migration 历史（截至 `0036_split_production_suppliers.sql`）+ 设计原则 |
| [`docs/api.md`](docs/api.md)                               | 已实现 API endpoint 的请求/响应 shape + 错误码 + 前端集成笔记                               |
| [`docs/architecture.md`](docs/architecture.md)             | 技术栈、Cloudflare 资源 binding、secret 管理、本地 dev、部署、故障排查                      |
| [`docs/mcp-admin.md`](docs/mcp-admin.md)                   | Admin MCP server 安装 + tool 清单 + Bearer token 流程                                       |
| [`docs/lens-pricing-model.md`](docs/lens-pricing-model.md) | 镜片定价模型（brand × addon × SKU + 供应商成本 JSON）                                       |

## 快速命令

```bash
# 本地开发（需 Node 22.13+）
nvm use 22.13.0 && bun install
cp .dev.vars.example .dev.vars  # 填入 RESEND_API_KEY 等
bun run dev                     # http://localhost:8080
bun run lint                    # eslint .
bun run format                  # prettier --write .
bun run build                   # vite build
bun run preview                 # 本地起 SSR 预览

# D1 migrations
wrangler d1 migrations apply lool-work --local
wrangler d1 migrations apply lool-work --remote
wrangler d1 execute lool-work --local  --command "SELECT * FROM products LIMIT 3"

# 部署
bun run build && wrangler deploy

# 上游设计稿同步
git fetch upstream && git merge upstream/main
```

> 没有自动化测试套件。验证靠 `bun run lint` + 部署后跑 `lool-prod-tester` sub-agent（见下方 auto-test loop）。

## 文件结构 概览

```
lool.work/
├─ wrangler.jsonc          # Worker + D1 + R2 (RX_BUCKET, PRODUCTS_BUCKET) + vars
├─ vite.config.ts          # 直接组合 cloudflare/tanstack-start/react/tailwind/tsconfigPaths
├─ tsconfig.json           # @/* → ./src/*
├─ worker-configuration.d.ts  # wrangler types 生成的 Env 类型（勿手改）
├─ docs/                   # 人类审查文档（schema / api / architecture / lens-pricing-model / mcp-admin）
├─ migrations/             # D1 migrations 0001..0036（按文件名顺序）
├─ mcp-server/             # 独立 admin MCP server (Node)，详见 docs/mcp-admin.md
└─ src/
   ├─ data/products.ts     # 设计稿硬编码（占位，最终由 /api/catalog 取代）
   ├─ contexts/            # CartContext / FavoritesContext (localStorage)
   ├─ lib/i18n.tsx         # 多语言字典 + pickLang()
   ├─ components/
   │   ├─ ui/*             # Radix shadcn 风格
   │   ├─ layout/          # Header / Footer / NavMegaMenu / InfoPage
   │   ├─ product/         # ProductCard / ProductListPage / LensFlowWizard
   │   └─ admin/           # AdminLayout / ImageUpload / SuppliersCRUD ...
   ├─ server/              # 后端 helper：db / email / ids / otp / admin / audit / catalog-loader / lang
   └─ routes/
      ├─ __root.tsx        # 全局壳（I18n + Cart + Favorites + Header + Footer）
      ├─ $lang/            # ⭐ 所有用户面路由都在 i18n 前缀下（index, products, product.$slug,
      │                    #   try-on, measure-pd, account, checkout, blog, ...）
      ├─ admin.tsx + admin_.login.tsx + admin/*  # 22 个 admin 页面（products, lens-skus,
      │                                          # orders, shipments, suppliers, audit-log, ...）
      └─ api/              # ⭐ server endpoints
         ├─ catalog.ts, home-banners.ts
         ├─ lens/skus.ts
         ├─ orders/, otp/{request,verify}, prescriptions/{index,upload}
         └─ admin/         # login, logout, me, upload, r2/*, plus 17 资源 CRUD 子目录
```

> **重要**：用户面 URL 都带语言前缀（`/en/products`, `/zh/measure-pd` 等）。新增页面要放在 `src/routes/$lang/` 下，并用 `<LangLink>` / `pickLang()` 处理 i18n。

## 工作流（auto-test loop）

任务来源：`todo.md`（仓库根目录）。每条任务用 `## [ ] N. 标题` / `## [x] N. 标题`；
完成笔记紧跟标题下方；用户用 `![desc](todo-attachments/foo.png)` 贴截图（VSCode
里 paste 时它会问保存到哪，选 `todo-attachments/`，markdown 自动写入相对路径）。

每完成一项任务的循环：

1. 写代码 → 本地 typecheck + smoke
2. `bun run build && bunx wrangler deploy` → 拿到 `Version ID`
3. **触发 sub-agent**：`Agent` 工具，`subagent_type: "lool-prod-tester"`，prompt 里传 version id 和这次改了什么
4. sub-agent 写报告到 `test-results/run-<UTC>.md`，stdout 单行 `SMOKE: PASS|FAIL N/N — <path>`
5. 解析这一行：
   - PASS → 在 `todo.md` 把刚做的项标题改成 `## [x]`，并在下方写完成笔记，挑下一项继续
   - FAIL → 读 `test-results/<path>` 查看具体失败，修复 → goto 1

`test-results/` 和 `todo-attachments/` 都在 `.gitignore`，本地用，不入库。

## 设计原则

- **概念命名一致 / 数据库整洁** — schema 列名、API 字段名、前端类型字段名应保持同一概念在三层使用同一命名族；同一类资源的字段后缀（`_url` / `_cents` / `_at`）保持统一；新功能优先复用已有概念，不要平行造词。这条比短期省事更重要 —— 后续拓展（多图槽、更多供应商类型、价格分层等）都靠概念清晰扩出去，含混的命名会反复造成 schema migration 和前后端来回 patch。
