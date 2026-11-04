# loollook.com — 独立站 AI 操盘手系统

DTC 眼镜独立站（老花镜 + 近视镜，主打去老年化，45–60 代际，海外市场）。
业务与工程总说明见 [`CLAUDE.md`](CLAUDE.md)；本文件只描述 system-kit（操盘手系统）这一层。

## 这是什么

一套可移植的独立站 AI 操盘手系统：闸门工具 + 三线内容管线（PDP/blog/社媒）+
活库 schema + 战略层技能 + 运维脚本。方法论沿袭「可移植 OS brain」模式，
已针对 loollook.com 完成本地化（产品事实/画像证据/关键词全部为 lool 原生重建）。

## 系统总览

- **技能层** `.claude/skills/`
  - `lool-produce` — 内容生产总闸门（A 线 PDP / B 线 blog / C 线社媒 / D 线校准环）
  - `lool-operator` — 战略层操盘手（漏斗/CRO/内容矩阵/工单台账）
  - `glasses-tryon` — 虚拟试戴图生成
- **闸门层** `scripts/system-kit/pdp-toolbox.mjs` — r1–r14 / rb1–rb11 / score / selftest，
  一切内容产出的确定性校验（闸门说了算）
- **活库层** `docs/system-kit/library/` — keyword-library / persona-library /
  brand-library / operator-library（战略板）等 15+ 库
- **系统手册** `docs/system-kit/system-manual.md` — 命令/闸门/活库/部署/裁决/工作流总纲
- **运维脚本** `scripts/system-kit/` — qa-walk / deploy-smoke / daily-health-audit /
  gsc-report（GSC 数据管道，服务账号 `secrets/gsc-service-account.json` 不入仓）/ prerender-warmup

## 常用命令

```bash
node scripts/system-kit/pdp-toolbox.mjs operator        # 战略板审计
node scripts/system-kit/pdp-toolbox.mjs operator-next   # ICE 排序出 THE ONE
node scripts/system-kit/qa-walk.mjs                     # 上线前全站走查
node scripts/system-kit/gsc-report.mjs                  # GSC 搜索数据拉取
node scripts/system-kit/daily-health-audit*             # 每日健康巡检
```

## 密钥（不入仓，故意排除）

`.env`（DATABASE_URL / RESEND_API_KEY…）、`secrets/gsc-service-account.json`、
Cloudflare API token、DeepL key——均自行配置。
