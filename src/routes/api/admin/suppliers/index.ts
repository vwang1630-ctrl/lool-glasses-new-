// GET  /api/admin/suppliers — list (default active only; ?inactive=1 includes archived)
// POST /api/admin/suppliers — create new supplier
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";

const VALID_KIND = new Set([
  "lens",
  "frame",
  "both",
  "accessory",
  "payment",
  "logistics",
]);
const ID_RE = /^[a-z0-9][a-z0-9-]{0,40}$/;

export const Route = createFileRoute("/api/admin/suppliers/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAdmin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        const url = new URL(request.url);
        const kind = url.searchParams.get("kind");
        const includeInactive = url.searchParams.get("inactive") === "1";

        const conds: string[] = [];
        const binds: unknown[] = [];
        if (kind && VALID_KIND.has(kind)) {
          conds.push("kind = ?");
          binds.push(kind);
        }
        if (!includeInactive) conds.push("active = 1");
        const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

        const db = getDB();
        const res = await db
          .prepare(
            `SELECT * FROM suppliers ${where} ORDER BY sort_order, name_en`,
          )
          .bind(...binds)
          .all();
        return Response.json({ suppliers: res.results ?? [] });
      },

      POST: async ({ request }) => {
        try {
          await requireAdmin(request);
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

        const id = String(body.id ?? "")
          .trim()
          .toLowerCase();
        if (!ID_RE.test(id))
          return Response.json({ error: "invalid_id" }, { status: 400 });
        const name_zh = String(body.name_zh ?? "").trim();
        const name_en = String(body.name_en ?? "").trim();
        if (!name_zh || !name_en)
          return Response.json({ error: "name_required" }, { status: 400 });
        const kind = String(body.kind ?? "");
        if (!VALID_KIND.has(kind))
          return Response.json({ error: "invalid_kind" }, { status: 400 });

        // Accept either body.config (object → stringify) or body.config_json (raw string).
        // Validate raw string is parseable JSON to keep stored values well-formed.
        let configJson: string | null = null;
        if (body.config != null) {
          configJson = JSON.stringify(body.config);
        } else if (
          typeof body.config_json === "string" &&
          body.config_json.trim() !== ""
        ) {
          try {
            JSON.parse(body.config_json);
            configJson = body.config_json;
          } catch {
            return Response.json(
              { error: "invalid_config_json" },
              { status: 400 },
            );
          }
        }

        const db = getDB();
        try {
          await db
            .prepare(
              `INSERT INTO suppliers (
               id, name_zh, name_en, kind,
               contact_person, contact_email, contact_phone, shipping_address,
               payment_terms, lead_time_days, notes, config_json,
               active, sort_order
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            )
            .bind(
              id,
              name_zh,
              name_en,
              kind,
              body.contact_person == null ? null : String(body.contact_person),
              body.contact_email == null ? null : String(body.contact_email),
              body.contact_phone == null ? null : String(body.contact_phone),
              body.shipping_address == null
                ? null
                : String(body.shipping_address),
              body.payment_terms == null ? null : String(body.payment_terms),
              body.lead_time_days == null
                ? null
                : Math.round(Number(body.lead_time_days)),
              body.notes == null ? null : String(body.notes),
              configJson,
              body.active === false ? 0 : 1,
              Number.isFinite(Number(body.sort_order))
                ? Math.round(Number(body.sort_order))
                : 0,
            )
            .run();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("UNIQUE") || msg.includes("PRIMARY KEY"))
            return Response.json({ error: "id_taken" }, { status: 409 });
          return Response.json(
            { error: "insert_failed", message: msg },
            { status: 500 },
          );
        }
        return Response.json({ id });
      },
    },
  },
});
