// POST /api/otp/request
// Body: { email, purpose: "lookup_order" | "lookup_rx" }
// Issues a fresh 6-digit OTP and emails it via Resend.

import { createFileRoute } from "@tanstack/react-router";
import { requestOtp } from "@/server/otp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Route = createFileRoute("/api/otp/request")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { email?: string; purpose?: string };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const email = (body.email ?? "").trim().toLowerCase();
        const purpose = body.purpose;

        if (!EMAIL_RE.test(email)) {
          return Response.json({ error: "invalid_email" }, { status: 400 });
        }
        if (purpose !== "lookup_order" && purpose !== "lookup_rx") {
          return Response.json({ error: "invalid_purpose" }, { status: 400 });
        }

        try {
          await requestOtp(email, purpose);
        } catch (err) {
          console.error("[otp/request] failed:", err);
          // Return generic OK to avoid leaking whether email exists / Resend status.
        }

        return Response.json({ ok: true });
      },
    },
  },
});
