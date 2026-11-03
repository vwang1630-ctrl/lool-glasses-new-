// GET  /api/admin/api-tokens — list this admin's tokens (no plaintext, no hash)
// POST /api/admin/api-tokens — create a new long-lived API token; plaintext returned ONCE
// Auth: requires admin session cookie or Bearer token.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import {
  requireAdmin,
  hashApiToken,
  newApiTokenPlaintext,
} from "@/server/admin";
import { nanoid } from "@/server/ids";
import { writeAudit } from "@/server/audit";

export const Route = createFileRoute("/api/admin/api-tokens/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        let me;
        try {
          me = await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        const db = getDB();
        const res = await db
          .prepare(
            `SELECT id, admin_user_id, name, scope, created_at, last_used_at, revoked_at
             FROM admin_api_tokens
             WHERE admin_user_id = ?
             ORDER BY created_at DESC`,
          )
          .bind(me.id)
          .all();
        return Response.json({ tokens: res.results ?? [] });
      },

      POST: async ({ request }) => {
        let me;
        try {
          me = await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        const name = String(body.name ?? "").trim();
        if (!name || name.length > 64) {
          return Response.json(
            { error: "bad_name", hint: "1-64 chars" },
            { status: 400 },
          );
        }
        const scope = body.scope === "read" ? "read" : "write";

        const plaintext = newApiTokenPlaintext();
        const tokenHash = await hashApiToken(plaintext);
        const id = `tok-${nanoid()}`;
        const now = Date.now();

        const db = getDB();
        try {
          await db
            .prepare(
              `INSERT INTO admin_api_tokens (id, admin_user_id, token_hash, name, scope, created_at)
               VALUES (?, ?, ?, ?, ?, ?)`,
            )
            .bind(id, me.id, tokenHash, name, scope, now)
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return Response.json(
            { error: "insert_failed", message: msg },
            { status: 500 },
          );
        }
        await writeAudit(request, {
          action: "POST",
          resource_type: "admin_api_tokens",
          resource_id: id,
          after: { name, scope, admin_user_id: me.id },
        });
        return Response.json(
          {
            id,
            name,
            scope,
            admin_user_id: me.id,
            created_at: now,
            token: plaintext, // returned only here; never retrievable again
          },
          { status: 201 },
        );
      },
    },
  },
});
