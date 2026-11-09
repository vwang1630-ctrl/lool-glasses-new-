// Transactional email via Resend. Used for OTP and order receipts.
// In dev with no RESEND_API_KEY, falls back to console logging.

import { env } from "cloudflare:workers";

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendArgs): Promise<void> {
  const apiKey = (env as unknown as { RESEND_API_KEY?: string }).RESEND_API_KEY;
  const from = `loollook <${env.RESEND_FROM}>`;

  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY missing — logging instead of sending.",
    );
    console.log({ from, to, subject, text: text ?? html });
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend send failed: ${res.status} ${detail}`);
  }
}
