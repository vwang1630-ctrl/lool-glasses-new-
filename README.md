# SYSTEM-KIT — 操盘手系统复制包
生成: 2026-10-07 · 来源: fuzzsofa.com 操盘手系统(全文说明见 docs/fuzz-produce-manual.md §19)

## 这是什么
一套完整可移植的独立站 AI 操盘手系统:闸门工具 + 三线内容管线 + 活库 schema +
战略层技能 + 运维脚本。**复制机器,不复制记忆**——管线照搬,产品事实/画像证据/关键词重造。

## 移植四步
1. 读 docs/fuzz-produce-manual.md **§19 系统复制指南**(七层移植清单+落地节奏+红线)。
   §19 之后的增量(§19.5/19.6/19.7/§20 决策系统/§21 移植全量抽取)同属机器列,一并带走
2. 本包按原路径铺进新项目仓库(.claude/skills → 新仓库 .claude/skills,scripts → scripts,docs → docs)
3. `node scripts/pdp-toolbox.mjs selftest` 必须全绿,再开始造产品数据
4. 密钥自行配置(不在本包内,故意排除):.env(DATABASE_URL/AUTH_JWT_SECRET/RESEND_API_KEY...)、
   GSC 服务账号与 token、Cloudflare API、DeepL key

## 目录图
- .claude/skills/ 两个技能(内容生产总闸门 + 战略层操盘手)
- scripts/ 闸门(pdp-toolbox)+ 部署(safe-deploy/keep-assets/smoke/watchdog)+ 运维(健康审计/cron/幽灵员工/预热/备份)+ 情报(gsc/fishing)
- docs/library/ 全部活库 schema(写入门禁:无 source 自动拒绝;knowledge-cards 空卡+learning/ 方法论随包)
- docs/fuzz-produce-manual.md 系统说明书(§0-§21;**§21.8 是打包带走清单**)
