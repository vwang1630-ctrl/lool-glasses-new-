// POST /api/contact
// Multipart submission from the "给我们发邮件" form on /:lang/contact.
//
// FormData fields:
//   name:         string (required)
//   email:        string (required, RFC-ish)
//   phoneCountry: string (optional, e.g. "+1")
//   phone:        string (optional)
//   subject:      string (required, one of SUBJECT_KEYS)
//   message:      string (required, ≤ 5000 chars)
//   files:        File[] (optional, total ≤ 10MB across all files)
//
// Sends an email via Resend to CONTACT_TO (defaults to hello@loollook.com),
// with attachments inlined as base64.

import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TOTAL_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MAX_MESSAGE_CHARS = 5000;
const MAX_NAME_CHARS = 200;
const MAX_PHONE_CHARS = 40;

const SUBJECT_KEYS = new Set([
  "order",
  "product",
  "prescription",
  "shipping",
  "partner",
  "other",
]);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

export const Route = createFileRoute("/api/contact/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ error: "invalid_form" }, { status: 400 });
        }

        const name = String(form.get("name") ?? "").trim();
        const email = String(form.get("email") ?? "")
          .trim()
          .toLowerCase();
        const phoneCountry = String(form.get("phoneCountry") ?? "").trim();
        const phone = String(form.get("phone") ?? "").trim();
        const subject = String(form.get("subject") ?? "").trim();
        const message = String(form.get("message") ?? "").trim();

        if (!name || name.length > MAX_NAME_CHARS) {
          return Response.json({ error: "invalid_name" }, { status: 400 });
        }
        if (!EMAIL_RE.test(email)) {
          return Response.json({ error: "invalid_email" }, { status: 400 });
        }
        if (phone.length > MAX_PHONE_CHARS) {
          return Response.json({ error: "invalid_phone" }, { status: 400 });
        }
        if (!SUBJECT_KEYS.has(subject)) {
          return Response.json({ error: "invalid_subject" }, { status: 400 });
        }
        if (!message || message.length > MAX_MESSAGE_CHARS) {
          return Response.json({ error: "invalid_message" }, { status: 400 });
        }

        const fileEntries = form
          .getAll("files")
          .filter((v): v is File => v instanceof File);
        let totalBytes = 0;
        for (const f of fileEntries) totalBytes += f.size;
        if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
          return Response.json(
            { error: "attachment_too_large" },
            { status: 413 },
          );
        }

        const attachments: { filename: string; content: string }[] = [];
        for (const f of fileEntries) {
          if (f.size === 0) continue;
          const buf = new Uint8Array(await f.arrayBuffer());
          attachments.push({
            filename: f.name || "attachment",
            content: bytesToBase64(buf),
          });
        }

        const phoneFull = phone ? `${phoneCountry || ""} ${phone}`.trim() : "";
        const html = `
          <h2>New contact form submission</h2>
          <table cellpadding="6" style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px">
            <tr><td><b>Name</b></td><td>${escapeHtml(name)}</td></tr>
            <tr><td><b>Email</b></td><td>${escapeHtml(email)}</td></tr>
            ${phoneFull ? `<tr><td><b>Phone</b></td><td>${escapeHtml(phoneFull)}</td></tr>` : ""}
            <tr><td><b>Subject</b></td><td>${escapeHtml(subject)}</td></tr>
          </table>
          <h3>Message</h3>
          <pre style="white-space:pre-wrap;font-family:system-ui,sans-serif;font-size:14px">${escapeHtml(message)}</pre>
          ${attachments.length ? `<p><i>${attachments.length} attachment(s)</i></p>` : ""}
        `;
        const text =
          `New contact form submission\n\n` +
          `Name: ${name}\nEmail: ${email}\n` +
          (phoneFull ? `Phone: ${phoneFull}\n` : "") +
          `Subject: ${subject}\n\nMessage:\n${message}\n` +
          (attachments.length
            ? `\n(${attachments.length} attachment(s))\n`
            : "");

        const apiKey = (env as unknown as { RESEND_API_KEY?: string })
          .RESEND_API_KEY;
        const contactTo =
          (env as unknown as { CONTACT_TO?: string }).CONTACT_TO ||
          "hello@loollook.com";
        const from = `lool contact form <${env.RESEND_FROM}>`;
        const mailSubject = `[lool contact] ${subject} — ${name}`;

        if (!apiKey) {
          console.warn(
            "[contact] RESEND_API_KEY missing — logging instead of sending.",
          );
          console.log({
            from,
            to: contactTo,
            subject: mailSubject,
            text,
            attachments: attachments.length,
          });
          return Response.json({ ok: true });
        }

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: contactTo,
            reply_to: email,
            subject: mailSubject,
            html,
            text,
            ...(attachments.length ? { attachments } : {}),
          }),
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          console.error("[contact] Resend failed:", res.status, detail);
          return Response.json({ error: "send_failed" }, { status: 502 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
