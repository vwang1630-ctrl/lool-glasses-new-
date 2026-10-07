/**
 * FUZZ SOFA — 邮件入站中继（Cloudflare Email Worker）
 *
 * 作用：任何寄到 fuzzsofa.com 的邮件（info@ / hello@ / support@ / trade@ / 任意地址）
 *  1. 转发一份副本到站主私人信箱（FORWARD_TO）
 *  2. 把原始 MIME 转投给站点端点，落进后台「咨询留言」
 *
 * 部署：Cloudflare 控制台 → Workers & Pages → Create Worker → 粘贴本文件，
 *       绑定 Email Routing 规则。完整步骤见 docs/email-inbound-setup.md。
 *
 * 环境变量（Worker → Settings → Variables）：
 *   INBOUND_URL    = https://fuzzsofa.com/api/public/email-inbound
 *   INBOUND_SECRET = 与站点 .env 的 EMAIL_INBOUND_SECRET 相同
 *   FORWARD_TO     = 站主私人信箱（收副本）
 */

const MAX_BYTES = 6 * 1024 * 1024; // 与站点端点上限一致

export default {
  async email(message, env) {
    // 1. 副本转发永不缺席（站点端点挂了信也不丢）
    if (env.FORWARD_TO) {
      try {
        await message.forward(env.FORWARD_TO);
      } catch (e) {
        console.error("forward failed:", e);
      }
    }

    // 2. 转投站点。失败不 reject —— reject 会退信，宁可靠副本兜底。
    try {
      const buf = new Uint8Array(await new Response(message.raw).arrayBuffer());
      if (buf.length > MAX_BYTES) {
        console.error("email too large, forward-only");
        return;
      }
      let bin = "";
      const CHUNK = 0x8000;
      for (let i = 0; i < buf.length; i += CHUNK) {
        bin += String.fromCharCode.apply(null, buf.subarray(i, i + CHUNK));
      }
      const res = await fetch(env.INBOUND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-inbound-secret": env.INBOUND_SECRET,
        },
        body: JSON.stringify({ raw_base64: btoa(bin), rcpt: message.to, sender: message.from }),
      });
      if (!res.ok) console.error("inbound endpoint returned", res.status);
    } catch (e) {
      console.error("ingest failed:", e);
    }
  },
};
