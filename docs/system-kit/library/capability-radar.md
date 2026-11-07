# Capability Radar

> 能力等级雷达（SYSTEM-KIT E4 区⑥ 学习吸收）。
> 等级变动必须有实物证据；L0→L1 唯一路径 = 跑一次真的。

| Capability                       | Level | Evidence                                                                          | Last Evaluated | Next Trigger                            |
| -------------------------------- | ----- | --------------------------------------------------------------------------------- | -------------- | --------------------------------------- |
| PDP production gate (r1–r14)     | L2    | `pdp-toolbox.mjs` selftest green; `lool-tr90-square` + `lool-8663` shipped        | 2026-11-02     | next PDP SKU                            |
| Blog production gate (rb1–rb12)  | L1    | `blog-framework-lock.json` + scaffold exist; 0 articles published                 | 2026-11-02     | publish first blog post                 |
| Persona inference                | L2    | persona-library 6 personas; `persona brief/infer/audit` commands run for 2 SKUs   | 2026-10-08     | next SKU intake                         |
| Keyword cannibal detection       | L1    | `cannibal` command wired to `blog_posts` + `products`; DB config lool-native | 2026-11-02     | next keyword arbitration                |
| T1 evidence pipeline             | L1    | `t1-config.json` + `t1-evidence.json` schema ready; no real orders yet            | 2026-10-07     | first real order / customer interview   |
| Content bridge (operator → site) | L2    | `src/lib/operator/index.ts` live; homepage + global shell consuming libraries     | 2026-10-08     | next page wiring (list/PDP/blog)        |
| GA4 instrumentation              | L2    | tag `G-7LWMJZP0YE` (loollook's own; was FUZZ `G-FD4MN4RM7G` until 2026-11-06) | 2026-11-06     | verify live events after traffic        |
| GSC data pipeline                | L0    | `gsc-pull.mjs` ready; GSC property not verified                                   | 2026-11-02     | GSC verification (owner)                |
| Resend email pipeline            | L0    | `/api/contact` falls back to log when key missing                                 | 2026-11-02     | Resend key supplied (owner)             |
| Stripe webhook verification      | L0    | endpoint code exists; webhook not registered                                      | 2026-11-02     | Stripe Dashboard registration (owner)   |
| 3D virtual try-on                | L3    | tr90-square VTO calibrated; pivot fix deployed; live on `/try-on`                 | 2026-10-30     | next frame 3D model                     |
| Daily health audit               | L1    | 已指向 loollook.com（2026-11-04 修正）                   | 2026-11-02     | deploy `daily-health-audit-workers.mjs` |
| AI bot hit ledger (GEO)          | L0    | `ai_bot_hits` migration created; no middleware yet                                | 2026-11-02     | wire Worker UA detector                 |
| Consult attribution              | L1    | `consult_events` migration + `/api/public/consult-track` route created            | 2026-11-02     | first tracked consult click             |

### Level legend

- **L0** = unverified / not wired
- **L1** = framework exists
- **L2** = field-tested with real artifact
- **L3** = autonomous / running in production
