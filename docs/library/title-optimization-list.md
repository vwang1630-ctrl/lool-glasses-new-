# 标题优化清单 V1(2026-10-03,站主批后实施)

> 数据源:GSC 9-02→09-30 25 行(T1,已按页聚合);现状标题=线上实测(10-03 curl)。
> 纪律:一次一个变量——先改 Kong PDP 一页,两周看 GSC,有效再滚动;不改其它任何东西。

## 主战场:Kong PDP(词簇合并后 ~40 展示,pos 8-9,第 1 页,0 点击)

- 承接 URL:`/en/kong-tender-titan-monumental-sculpture-sofa.html`
  (`/en/king-kong-gorilla-sofa-sculpture.html` 已 301 到此——GSC 里的 26 次展示算它头上)
- 目标词:`king kong sofa`(35 次,词簇全部),排位 8-9=第 1 页底部,点击被上方案例页截走
- **现标题(95 字符,会被截断到 ~60)**:
  `King Kong Sofa $9,900 — Gorilla Monumental Sculpture Sofa 200cm | Fuzz Sofa`
  问题:①"$9,900"前置=价格劝退点击 ②无"真品/可买"钩子 ③超长被截
- **建议标题(方案 A,58 字符,钩子前置+保留准确词)**:
  `King Kong Gorilla Sofa — Real & Ready to Order | Fuzz Sofa`
- **建议标题(方案 B,守 "$" 价格筛选意图,52 字符)**:
  `King Kong Sofa — Real One, Made to Order | Fuzz Sofa`
- meta 描述同步(现缺钩子):一句话=实物在 Shanghai atelier + 全球配送 + 房间预览

## 次优先(暂不动,记录在案)

| 页 | 展示 | 判断 |
|---|---|---|
| journal 制作故事文 | 7 | 故事文标题合适,不动;它排 ai gorilla 词 pos 6 |
| animal-sofa-collection | 4(pos 15.25) | 第 2 页→第 1 页靠内容/内链,非标题;排 A 线选题 |
| studio/homepage 品牌词 | 6(pos 45-57) | 品牌词排位差是独立问题,量小,记档 |
| shipping-policy/meteorite 荷兰语/afbeeldingen | 各 1 | 噪声,剔除 |

## 实施路径(走既有流程)

1. 站主批方案 A 或 B →
2. DB 补丁改 Kong `seoTitle`+meta(既有 WO-20260927-01 同路径:备份→补丁→预发)→
3. 『上』上生产 → verify → **两周后 GSC 复盘 CTR**(对比基线 0 点击)

## 批

- [ ] 方案 A(Real & Ready to Order)
- [ ] 方案 B(Real One, Made to Order)
- [ ] 都不要,站主另给句式
