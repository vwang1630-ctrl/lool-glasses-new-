// deploy-smoke.mjs — 部署后冒烟测试（loollook.com 版）
// 用法: node scripts/deploy-smoke.mjs [origin,默认 http://localhost]
// 每次部署后必跑:全部通过才算部署成功;任一失败 exit 1(看门狗兜底)
const ORIGIN = (process.argv[2] || "http://localhost").replace(/\/$/, "");
let fail = 0;

async function check(name, url, expect, opts = {}) {
  try {
    const res = await fetch(ORIGIN + url, { redirect: "manual", ...opts });
    const ok = expect.includes(res.status);
    console.log(`${ok ? "✓" : "✗"} ${name}: ${res.status}${ok ? "" : ` (期望 ${expect.join("/")})`}`);
    if (!ok) fail = 1;
    return res;
  } catch (e) {
    console.log(`✗ ${name}: ${e.message}`);
    fail = 1;
    return null;
  }
}

(async () => {
  console.log(`=== 部署冒烟测试 ${ORIGIN} ===`);
  await check("首页", "/", [200, 301, 302, 307]);
  await check("商品列表", "/en/products", [200]);
  const pdp = await check("PDP(TR90 方框)", "/en/product/lool-tr90-square", [200]);
  if (pdp) {
    const html = await pdp.text();
    const hasSchema = html.includes('"@type":"Product"') || html.includes('"@type": "Product"');
    console.log(`${hasSchema ? "✓" : "✗"} PDP Product JSON-LD`);
    if (!hasSchema) fail = 1;
  }
  // 不存在的商品必须是真 404(2026-11-06 修过软 404,防回归)
  await check("PDP 不存在 → 404", "/en/product/__smoke_missing__", [404]);
  // GA4 必须是 loollook 自己的资源,绝不能是 FUZZ 的(2026-11-06 修过混数)
  try {
    const res = await fetch(ORIGIN + "/en/");
    const html = await res.text();
    const own = html.includes("G-7LWMJZP0YE");
    const fuzz = html.includes("G-FD4MN4RM7G");
    const ok = own && !fuzz;
    console.log(`${ok ? "✓" : "✗"} GA4 ID${ok ? " G-7LWMJZP0YE" : fuzz ? " 混入 FUZZ 的 G-FD4MN4RM7G!" : " 缺失"}`);
    if (!ok) fail = 1;
  } catch (e) {
    console.log(`✗ GA4 ID: ${e.message}`);
    fail = 1;
  }
  await check("Blog 列表", "/en/blog", [200]);
  await check("Blog 首文", "/en/blog/best-reading-glasses-45-professionals-2026", [200]);
  await check("虚拟试戴", "/en/try-on", [200]);
  await check("量瞳距", "/en/measure-pd", [200]);
  await check("Help Center", "/en/help", [200]);
  await check("sitemap.xml", "/sitemap.xml", [200]);
  await check("robots.txt", "/robots.txt", [200]);
  await check("llms.txt", "/llms.txt", [200]);
  // catalog API 存活(200 且 JSON 含 products 数组)
  try {
    const res = await fetch(ORIGIN + "/api/catalog");
    const ok = res.status === 200;
    let hasProducts = false;
    let count = 0;
    if (ok) {
      const j = await res.json();
      hasProducts = Array.isArray(j.products) && j.products.length > 0;
      if (hasProducts) count = j.products.length;
    }
    console.log(`${ok && hasProducts ? "✓" : "✗"} catalog API: ${res.status}${hasProducts ? ` (${count} products)` : " 无产品!"}`);
    if (!ok || !hasProducts) fail = 1;
  } catch (e) {
    console.log(`✗ catalog API: ${e.message}`);
    fail = 1;
  }
  // admin OTP 请求接口存活(401/400=正常拒绝;500=坏了)
  try {
    const res = await fetch(ORIGIN + "/api/admin/me", { headers: { Accept: "application/json" } });
    const ok = res.status === 401 || res.status === 400 || res.status === 403;
    console.log(`${ok ? "✓" : "✗"} admin 鉴权接口: ${res.status}`);
    if (!ok) fail = 1;
  } catch (e) {
    console.log(`✗ admin 鉴权接口: ${e.message}`);
    fail = 1;
  }
  console.log(fail ? "\nSMOKE: FAIL — 部署存在问题,检查上方 ✗ 项" : "\nSMOKE: ALL PASS — 部署成功");
  process.exit(fail);
})();
