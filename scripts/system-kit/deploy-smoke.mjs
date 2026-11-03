// deploy-smoke.mjs — 部署后冒烟测试（loollook.com 版）
// 用法: node scripts/system-kit/deploy-smoke.mjs [origin,默认 https://loollook.com]
// 每次部署重启后必跑；任一失败 exit 1

const ORIGIN = (process.argv[2] || "https://loollook.com").replace(/\/$/, "");
let fail = 0;

async function fetchWithRetry(url, opts) {
  try {
    return await fetch(url, opts);
  } catch (e) {
    // One retry for transient network errors before giving up.
    await new Promise((r) => setTimeout(r, 1000));
    return fetch(url, opts);
  }
}

async function check(name, url, expect, opts = {}) {
  try {
    const res = await fetchWithRetry(ORIGIN + url, { redirect: "manual", ...opts });
    const ok = expect.includes(res.status);
    console.log(
      `${ok ? "✓" : "✗"} ${name}: ${res.status}${ok ? "" : ` (期望 ${expect.join("/")})`}`,
    );
    if (!ok) fail = 1;
    return res;
  } catch (e) {
    console.log(`✗ ${name}: ${e.message}`);
    fail = 1;
    return null;
  }
}

function assertSchema(name, html, types) {
  const missing = types.filter(
    (t) =>
      !html.includes(`"@type":"${t}"`) && !html.includes(`"@type": "${t}"`),
  );
  const ok = missing.length === 0;
  console.log(
    `${ok ? "✓" : "✗"} ${name} JSON-LD: ${ok ? types.join(", ") : "missing " + missing.join(", ")}`,
  );
  if (!ok) fail = 1;
}

(async () => {
  console.log(`=== 部署冒烟测试 ${ORIGIN} ===`);

  await check("首页", "/en", [200]);
  await check("PLP", "/en/products", [200]);

  const pdp = await check(
    "PDP (lool-tr90-square)",
    "/en/product/lool-tr90-square",
    [200],
  );
  if (pdp) {
    const html = await pdp.text();
    assertSchema("PDP", html, ["Product"]);
  }

  const blogIndex = await check("博客列表", "/en/blog", [200]);
  if (blogIndex) {
    const html = await blogIndex.text();
    assertSchema("Blog Index", html, ["ItemList"]);
  }

  const blogArticle = await check(
    "博客首文",
    "/en/blog/best-reading-glasses-45-professionals-2026",
    [200],
  );
  if (blogArticle) {
    const html = await blogArticle.text();
    assertSchema("Blog Article", html, ["Article"]);
  }

  await check("虚拟试戴", "/en/try-on", [200]);
  await check("量瞳距", "/en/measure-pd", [200]);
  await check("llms.txt", "/llms.txt", [200]);
  await check("sitemap.xml", "/sitemap.xml", [200]);
  await check("robots.txt", "/robots.txt", [200]);

  // OTP 验证接口拒绝无效验证码即为健康
  try {
    const res = await fetchWithRetry(ORIGIN + "/api/admin/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "smoke@loollook.com", code: "000000" }),
    });
    const ok = res.status === 400 || res.status === 401 || res.status === 429;
    console.log(`${ok ? "✓" : "✗"} admin OTP 验证接口: ${res.status}`);
    if (!ok) fail = 1;
  } catch (e) {
    console.log(`✗ admin OTP 验证接口: ${e.message}`);
    fail = 1;
  }

  console.log(
    fail
      ? "\nSMOKE: FAIL — 部署存在问题,检查上方 ✗ 项"
      : "\nSMOKE: ALL PASS — 部署成功",
  );
  process.exit(fail);
})();
