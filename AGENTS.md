# Repository Guidelines

## 项目结构与模块组织

这是一个部署到 Cloudflare Workers 的 TanStack Start React/TypeScript 应用。
源码在 `src/`：路由在 `src/routes`，UI 在 `src/components`，服务端逻辑在
`src/server`，工具函数在 `src/lib`，导入型资源在 `src/assets`。静态公开文件在
`public/`，D1 迁移在 `migrations/`，运维脚本在 `scripts/`，repo 级 Codex
skills 在 `.codex/skills/`。

## 构建、测试与开发命令

- `npm run dev`：同步本地变量，然后启动 Vite dev server。
- `npm run build`：构建生产版 client 和 Worker server 输出。
- `npm run build:dev`：以 development mode 构建。
- `npm run preview`：同步本地变量，然后本地预览构建产物。
- `npm run lint`：对整个仓库运行 ESLint。
- `npm run format`：用 Prettier 格式化代码。

Wrangler 从构建产物部署。上线时必须先 commit 再 build，因为页脚版本号会在构建时
写入当前 Git SHA。

## 代码风格与命名规范

使用 TypeScript、React function components，并遵循现有 route/component 模式。
复用逻辑优先抽成具名 helper。组件用 `PascalCase`，函数和变量用 `camelCase`，
路由文件名遵循附近 TanStack Router 约定。样式使用 Tailwind CSS；class 写法要与
相邻组件保持一致。格式化使用 Prettier；lint 使用 ESLint 和 React Hooks 规则。

## 测试指南

当前没有专门的 test script。改动后至少运行 `npm run lint` 和 `npm run build`。
UI 改动需要在浏览器验证受影响路由；布局变化要附截图。D1、支付或订单相关改动，
需要在安全环境验证对应 API 或后台流程。

## Commit 与 Pull Request 规范

历史提交采用简洁的 Conventional Commit 风格，例如
`fix: restrict l1 editing of buyer discounts`、`feat: add country product discounts`
和 `chore: add repo codex skills`。commit 要聚焦，只包含本任务改动的文件。PR
需要说明问题、改动摘要、验证方式、关联任务（如有），以及可见 UI 改动的截图。

## 安全与配置提示

不要提交 secrets。本地 secrets 放在 `.env` 和 `.dev.vars`；示例保留在
`.dev.vars.example`。Cloudflare bindings 定义在 `wrangler.jsonc`，生成后的 Worker
配置位于 `dist/`。

## Agent 专用指令

每个话题使用独立 worktree，避免并行修改互相冲突。处理仓库任务时，优先读取并使用
`.codex/skills` 中已有的 repo 级 skills。启动或接手新任务时，先自动检查
`.codex/skills/` 并加载与当前任务匹配的 repo 级 skill，不需要等待 Lucas 额外提醒。
如果 Lucas 让你创建新 skill，默认创建到 `.codex/skills/`，除非他明确要求创建
global skill。
