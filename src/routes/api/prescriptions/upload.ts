// POST /api/prescriptions/upload
// Multipart upload for a paper/PDF prescription. The file goes to R2; the row
// in `prescriptions` only stores a reference. Subsequent /api/prescriptions
// patches (or admin tooling) fill in the parsed sph/cyl/etc. fields.
//
// FormData fields:
//   email: string
//   kind:  'single' | 'reading' | 'progressive'
//   file:  File (image/jpeg, image/png, image/webp, application/pdf, ≤10MB)
//   labelZh? / labelEn?: optional human label
//
// The (email, kind) pair UPSERTs into the matching row — same contract as
// POST /api/prescriptions — so re-uploading for the same kind swaps the R2
// reference (the old R2 object is left in place; no cleanup yet).
//
// Auth: requires a valid lool_account_session cookie; form's `email` must
// match the session's email. Without this, an anonymous caller could fill
// R2 with junk files keyed under any victim's email.
//
// Response: { ok: true, kind, key }

import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { getDB } from "@/server/db";
import { nanoid } from "@/server/ids";
import {
  getAccountSession,
  buildRefreshedAccountCookie,
} from "@/server/account-session";
import { isValidClientId, writeCustomerAudit } from "@/server/audit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RX_KINDS = new Set(["single", "reading", "progressive"]);
const MAX_BYTES = 10 * 1024 * 1024;
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export const Route = createFileRoute("/api/prescriptions/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await getAccountSession(request);
        if (!session) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }
        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ error: "invalid_form" }, { status: 400 });
        }

        const email = String(form.get("email") ?? "")
          .trim()
          .toLowerCase();
        if (!EMAIL_RE.test(email)) {
          return Response.json({ error: "invalid_email" }, { status: 400 });
        }
        if (email !== session.email) {
          return Response.json({ error: "email_mismatch" }, { status: 403 });
        }

        const kind = String(form.get("kind") ?? "");
        if (!RX_KINDS.has(kind)) {
          return Response.json({ error: "invalid_kind" }, { status: 400 });
        }

        const file = form.get("file");
        if (!(file instanceof File)) {
          return Response.json({ error: "missing_file" }, { status: 400 });
        }
        if (file.size === 0) {
          return Response.json({ error: "empty_file" }, { status: 400 });
        }
        if (file.size > MAX_BYTES) {
          return Response.json({ error: "file_too_large" }, { status: 413 });
        }

        const ext = MIME_EXT[file.type];
        if (!ext) {
          return Response.json({ error: "unsupported_mime" }, { status: 415 });
        }

        const id = nanoid();
        const key = `rx/${email}/${id}.${ext}`;
        const bucket = (env as unknown as { RX_BUCKET?: R2Bucket }).RX_BUCKET;
        if (!bucket) {
          return Response.json(
            { error: "r2_binding_missing" },
            { status: 500 },
          );
        }

        await bucket.put(key, file.stream(), {
          httpMetadata: { contentType: file.type },
          customMetadata: { email, originalFilename: file.name || "" },
        });

        const labelZh = (form.get("labelZh") as string | null) ?? null;
        const labelEn = (form.get("labelEn") as string | null) ?? null;
        const clientId = String(form.get("clientId") ?? "");
        const now = Date.now();
        const db = getDB();

        await db
          .prepare(
            `INSERT INTO prescriptions (
              id, email, kind, label_zh, label_en, source,
              upload_r2_key, upload_filename, upload_mime,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, 'upload', ?, ?, ?, ?, ?)
            ON CONFLICT(email, kind) DO UPDATE SET
              label_zh = excluded.label_zh,
              label_en = excluded.label_en,
              source = excluded.source,
              upload_r2_key = excluded.upload_r2_key,
              upload_filename = excluded.upload_filename,
              upload_mime = excluded.upload_mime,
              updated_at = excluded.updated_at`,
          )
          .bind(
            id,
            email,
            kind,
            labelZh,
            labelEn,
            key,
            file.name || null,
            file.type,
            now,
            now,
          )
          .run();

        if (isValidClientId(clientId)) {
          await writeCustomerAudit(request, {
            client_id: clientId,
            actor_email: email,
            action: "PRESCRIPTION_UPLOAD",
            resource_type: "prescription",
            resource_id: kind,
            meta: { kind, mime: file.type, size: file.size, r2Key: key },
          });
        }

        return Response.json(
          { ok: true, kind, key },
          {
            headers: {
              "Set-Cookie": await buildRefreshedAccountCookie(session.email),
            },
          },
        );
      },
    },
  },
});
