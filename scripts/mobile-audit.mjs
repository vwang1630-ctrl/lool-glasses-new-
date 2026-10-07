// 全站移动端体验审计（iPhone 14 Pro UA：390x844 @3x, DPR=3）
import { readFileSync } from "node:fs";
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const PAGES = [
  ["首页", "/en"],
  ["商品列表(动物系列)", "/en/animal-sofa-collection"],
  ["PDP 金刚", "/en/kong-tender-titan-monumental-sculpture-sofa.html"],
  ["PDP 猫头鹰", "/en/noctua-owl-armchair.html"],
  ["PDP Mofu", "/en/mofu-cat-sofa-tender-hug-sculpture.html"],
  ["购物车", "/en/cart"],
  ["结账", "/en/checkout"],
  ["登录", "/en/login"],
  ["个人中心", "/en/account"],
  ["订单详情", "/en/order/detail"],
  ["Contact", "/en/contact"],
  ["Journal", "/en/journal"],
  ["关于我们", "/en/about"],
  ["工作室", "/en/studio"],
  ["场景页(别墅)", "/en/luxury-villa-interior"],
  ["政策(退款)", "/en/returns-refunds"],
];

const out = [];
for (const [name, path] of PAGES) {
  const t0 = Date.now();
  let status = 0, html = "";
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 25000);
    const res = await fetch(`https://fuzzsofa.com${path}`, {
      headers: { "User-Agent": UA, "Accept": "text/html" },
      signal: ctl.signal,
      redirect: "follow",
    });
    clearTimeout(timer);
    status = res.status;
    html = await res.text();
  } catch (e) {
    out.push({ name, path, status: "ERR", ms: Date.now() - t0 });
    continue;
  }
  const ms = Date.now() - t0;
  const bytes = Buffer.byteLength(html);
  const checks = {
    viewport: /<meta[^>]+name="viewport"/.test(html) ? 1 : 0,
    tabbar: /MobileTabBar|a-tabrail|pb-tabbar/.test(html) ? 1 : 0,
    // 视口溢出风险：渲染类/内联样式里出现 >430px 的固定宽度
    overflow: (html.match(/(?:w-\[|width:)\s*(?:4[3-9]\d|[5-9]\d{2,})px/g) || []).length,
    // 触控目标偏小：py-0.5/py-1/py-1.5/py-2 按钮（<32px 高度风险）
    smallTap: (html.match(/py-[0-1](?:\.\d)?\b/g) || []).length,
    // 超小字号（<12px）
    tinyFont: (html.match(/text-\[(?:9|10|11)px\]/g) || []).length,
    images: (html.match(/<img/g) || []).length,
    lazyImgs: (html.match(/loading="lazy"/g) || []).length,
    ldjson: (html.match(/application\/ld\+json/g) || []).length,
  };
  out.push({ name, path, status, ms, kb: Math.round(bytes / 1024), ...checks });
}
console.log("页面 | 状态 | 耗时ms | HTML KB | 视口 | 底栏 | 溢出风险 | 小触控 | 小字号 | 图片/懒加载 | LD");
for (const o of out) {
  console.log(`${o.name} | ${o.status} | ${o.ms} | ${o.kb ?? "?"} | ${o.viewport} | ${o.tabbar} | ${o.overflow} | ${o.smallTap} | ${o.tinyFont} | ${o.images}/${o.lazyImgs} | ${o.ldjson}`);
}
