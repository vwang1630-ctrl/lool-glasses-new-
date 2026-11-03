# Capability Usage Map

> 反货架卷曲台账（Fuzz Sofa SYSTEM-KIT E4 区⑧ 运维台账）。
> 每项能力登记用途 + 触发点；🟡 超 30 天未触发给死线；🔴 无归档理由接线或退役（退役需站主批）。

| Capability               | Purpose                         | Trigger Point           | Last Used  | Days | Status | Deadline   | Action                                 |
| ------------------------ | ------------------------------- | ----------------------- | ---------- | ---- | ------ | ---------- | -------------------------------------- |
| `pdp-toolbox validate`   | gate PDP patches before publish | new SKU / PDP update    | 2026-10-30 | 3    | 🟢     | —          | —                                      |
| `pdp-toolbox score`      | score PDP content quality       | after validate pass     | 2026-10-30 | 3    | 🟢     | —          | —                                      |
| `pdp-toolbox verify`     | DOM regression on live URL      | after deploy            | 2026-10-30 | 3    | 🟢     | —          | —                                      |
| `persona infer`          | choose target buyer for new SKU | new product input       | 2026-10-08 | 25   | 🟡     | 2026-11-15 | schedule persona refresh on next SKU   |
| `persona brief`          | research brief for persona gaps | new SKU / monthly audit | 2026-10-08 | 25   | 🟡     | 2026-11-15 | schedule persona refresh on next SKU   |
| `cannibal`               | keyword conflict detection      | keyword arbitration     | 2026-11-02 | 0    | 🟢     | —          | —                                      |
| `blog-scaffold`          | generate blog patch skeleton    | target keyword selected | never      | —    | 🔴     | 2026-11-30 | wire or retire                         |
| `blog-validate`          | gate blog posts                 | blog draft ready        | never      | —    | 🔴     | 2026-11-30 | wire or retire                         |
| `social-gen`             | generate social outlet block    | blog published          | never      | —    | 🔴     | 2026-11-30 | implement or retire (owner)            |
| `gsc-pull`               | ingest GSC data                 | Monday 04:17 cron       | never      | —    | 🔴     | 2026-11-15 | unblock GSC verification               |
| `fishing-report`         | weekly attribution report       | Monday after GSC pull   | never      | —    | 🔴     | 2026-11-15 | depends on GSC + consult_events signal |
| `daily-health-audit`     | morning site health check       | daily 08:57 cron        | never      | —    | 🔴     | 2026-11-15 | deploy Workers rewrite                 |
| `make-system-kit`        | validate system docs snapshot   | pre-deploy / monthly    | never      | —    | 🔴     | 2026-11-30 | implement                              |
| `qa-walk`                | pre-deploy checklist            | before deploy           | never      | —    | 🔴     | 2026-11-30 | implement                              |
| `ai-visibility` sampling | GEO/AI search presence          | monthly manual          | 2026-10-07 | 26   | 🟡     | 2026-11-15 | run November sample                    |

### Status legend

- 🟢 使用中 / 7 天内触发
- 🟡 超 7 天未触发，需安排
- 🔴 超 30 天未触发或从未使用，接线或退役
