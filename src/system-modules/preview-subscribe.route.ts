// preview-subscribe — 合成后邮件捕获(sales-intent-backlog 第二批,站主『同意』9/30)
// 流程:客户端把合成图缩到 ≤1280px jpeg(base64)POST 上来 →
//   ①newsletter_subscribers upsert(EDM 池,source=preview:<slug>)
//   ②Resend 品牌邮件把合成图作为附件回发给用户(房间照不落公开目录,隐私)
import { createFileRoute } from "@tanstack/react-router";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// 轻量频控:每 IP 每小时 8 次(防灌水;重启清零可接受)
const RL = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now(), win = 3600_000;
  const arr = (RL.get(ip) || []).filter((t) => now - t < win);
  arr.push(now);
  RL.set(ip, arr);
  return arr.length > 8;
}
function clientIp(request: Request): string {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
const LABELS: Record<string, string> = {
  "kong-tender-titan-monumental-sculpture-sofa": "Kong",
  "noctua-owl-armchair": "Noctua",
  "meteorite-statement-sofa": "Meteorite",
  "mofu-cat-sofa-tender-hug-sculpture": "Mofu",
};

export const Route = createFileRoute("/api/public/preview-subscribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          if (rateLimited(clientIp(request))) return json({ error: "Too many requests." }, 429);
          const body = await request.json().catch(() => null) as {
            email?: string; product_slug?: string; image_data_url?: string;
          } | null;
          const email = String(body?.email || "").trim().toLowerCase();
          const slug = String(body?.product_slug || "").slice(0, 80);
          const img = String(body?.image_data_url || "");
          if (!EMAIL_RE.test(email)) return json({ error: "Invalid email." }, 400);
          if (img && !img.startsWith("data:image/")) return json({ error: "Invalid image." }, 400);
          // 体积护栏:合成图缩过后 ~0.3-0.8MB base64,超 6MB 直接拒
          if (img.length > 6_000_000) return json({ error: "Image too large." }, 413);

          // ①EDM 池 upsert(表无唯一约束,先查后写)
          const existing = await dbQuery("select id, source from newsletter_subscribers where lower(email)=$1", [email]);
          if (existing.rows?.length) {
            await dbQuery("update newsletter_subscribers set source=$2, updated_at=now() where id=$1", [
              existing.rows[0].id, `preview:${slug || "unknown"}`,
            ]);
          } else {
            await dbQuery("insert into newsletter_subscribers (email, source) values ($1,$2)", [
              email, `preview:${slug || "unknown"}`,
            ]);
          }

          // ②入池即止——EDM 由站主另行发送(站主令 2026-10-01:停域名自动发信)
          // 旧自动回发逻辑已移除;附件回发代码保留在 git 历史(9e2c04b 附近)可随时恢复
          return json({ ok: true });
        } catch (e: any) {
          console.error("[preview-subscribe]", e?.message || e);
          return json({ error: "Something went wrong. Please try again." }, 500);
        }
      },
    },
  },
});

// DB 通道(与 ai-room-preview.ts 同模式):动态 import,失败不阻断响应
async function dbQuery(query: string, params: unknown[] = []): Promise<{ rows: any[] }> {
  const { query: q } = await import("@/lib/api/db.server");
  return q(query, params);
}
