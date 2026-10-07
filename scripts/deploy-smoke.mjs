// deploy-smoke.mjs — 部署后冒烟测试(2026-10-01 稳定性三件套之二)
// 用法: node scripts/deploy-smoke.mjs [origin,默认 http://localhost]
// 每次部署重启后必跑:五项全过才算部署成功;任一失败 exit 1(看门狗兜底)
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
  const pdp = await check("PDP(Kong)", "/en/kong-tender-titan-monumental-sculpture-sofa.html", [200]);
  if (pdp) {
    const html = await pdp.text();
    const hasSchema = html.includes('"@type":"Product"') || html.includes('"@type": "Product"');
    console.log(`${hasSchema ? "✓" : "✗"} PDP Product JSON-LD`);
    if (!hasSchema) fail = 1;
  }
  await check("集合页", "/en/animal-sofa-collection.html", [200]);
  await check("Journal 列表", "/en/journal.html", [200]);
  await check("Room Preview", "/en/ai-room-preview.html", [200]);
  // 登录接口存活(400=正常拒绝空凭据;500=坏了)
  try {
    const res = await fetch(ORIGIN + "/api/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "smoke@fuzzsofa.com", password: "x" }),
    });
    const ok = res.status === 400 || res.status === 429;
    console.log(`${ok ? "✓" : "✗"} 登录接口: ${res.status}`);
    if (!ok) fail = 1;
  } catch (e) {
    console.log(`✗ 登录接口: ${e.message}`);
    fail = 1;
  }
  console.log(fail ? "\nSMOKE: FAIL — 部署存在问题,检查上方 ✗ 项" : "\nSMOKE: ALL PASS — 部署成功");
  process.exit(fail);
})();
