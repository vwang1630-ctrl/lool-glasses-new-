// PATCH / DELETE /api/account/addresses/$id
//
// PATCH  → edit the row in place (any subset of fields). If `setDefault: true`,
//          this row becomes the default and any previous default is cleared.
// DELETE → remove the row. If it was the default, the most-recent remaining
//          address (if any) is promoted so the user always has a default
//          while ≥1 address exists.
//
// Both gate on lool_account_session and require the target row's email to
// match the session, so a verified caller cannot mutate someone else's data.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import {
  getAccountSession,
  buildRefreshedAccountCookie,
} from "@/server/account-session";
import { serializeAddress } from "./index";
import { isValidIsoCountry } from "@/lib/countries";
import { isValidClientId, writeCustomerAudit } from "@/server/audit";

interface PatchBody {
  recipient?: string;
  country?: string;
  zip?: string;
  address?: string;
  phone?: string;
  setDefault?: boolean;
  clientId?: string | null;
}

type AddressRow = {
  id: string;
  email: string;
  recipient: string;
  country: string;
  zip: string;
  address: string;
  phone: string;
  is_default: number;
  created_at: number;
  updated_at: number;
};

const trimOpt = (v: unknown): string | undefined =>
  typeof v === "string" ? v.trim() : undefined;

export const Route = createFileRoute("/api/account/addresses/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        const session = await getAccountSession(request);
        if (!session) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        const b = (raw ?? {}) as PatchBody;

        const db = getDB();
        const existing = await db
          .prepare("SELECT * FROM addresses WHERE id = ? AND email = ?")
          .bind(params.id, session.email)
          .first<AddressRow>();
        if (!existing) {
          return Response.json({ error: "not_found" }, { status: 404 });
        }

        const recipient = trimOpt(b.recipient) ?? existing.recipient;
        const rawCountry = trimOpt(b.country) ?? existing.country;
        const zip = trimOpt(b.zip) ?? existing.zip;
        const address = trimOpt(b.address) ?? existing.address;
        const phone = trimOpt(b.phone) ?? existing.phone;
        if (!recipient || !rawCountry || !zip || !address || !phone) {
          return Response.json({ error: "incomplete_fields" }, { status: 400 });
        }
        // Reject any user-supplied country that isn't a valid ISO code. If the
        // body didn't include country, fall through with existing's value
        // unchanged (which may still be a legacy free-text string for rows
        // that pre-date 0057 — we don't backfill on PATCH to keep this a
        // pure "this PATCH" validation gate).
        let country: string;
        if (b.country !== undefined) {
          const upper = rawCountry.toUpperCase();
          if (!isValidIsoCountry(upper))
            return Response.json({ error: "invalid_country" }, { status: 400 });
          country = upper;
        } else {
          country = rawCountry;
        }

        const now = Date.now();
        const makeDefault = b.setDefault === true && existing.is_default === 0;

        if (makeDefault) {
          await db.batch([
            db
              .prepare(
                "UPDATE addresses SET is_default = 0, updated_at = ? WHERE email = ? AND id != ?",
              )
              .bind(now, session.email, params.id),
            db
              .prepare(
                `UPDATE addresses
                   SET recipient = ?, country = ?, zip = ?, address = ?, phone = ?,
                       is_default = 1, updated_at = ?
                 WHERE id = ? AND email = ?`,
              )
              .bind(
                recipient,
                country,
                zip,
                address,
                phone,
                now,
                params.id,
                session.email,
              ),
          ]);
        } else {
          await db
            .prepare(
              `UPDATE addresses
                 SET recipient = ?, country = ?, zip = ?, address = ?, phone = ?,
                     updated_at = ?
               WHERE id = ? AND email = ?`,
            )
            .bind(
              recipient,
              country,
              zip,
              address,
              phone,
              now,
              params.id,
              session.email,
            )
            .run();
        }

        const fresh = await db
          .prepare("SELECT * FROM addresses WHERE id = ? AND email = ?")
          .bind(params.id, session.email)
          .first<AddressRow>();
        if (isValidClientId(b.clientId)) {
          await writeCustomerAudit(request, {
            client_id: b.clientId,
            actor_email: session.email,
            action: "ADDRESS_CHANGED",
            resource_type: "address",
            resource_id: params.id,
            meta: {
              operation: makeDefault ? "set_default" : "update",
              country,
            },
          });
        }
        return Response.json(
          { ok: true, address: fresh ? serializeAddress(fresh) : null },
          {
            headers: {
              "Set-Cookie": await buildRefreshedAccountCookie(session.email),
            },
          },
        );
      },
      DELETE: async ({ request, params }) => {
        const session = await getAccountSession(request);
        if (!session) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }
        let body: { clientId?: string | null } = {};
        try {
          body = await request.json();
        } catch {
          /* old clients may post an empty body */
        }
        const db = getDB();
        const existing = await db
          .prepare(
            "SELECT id, is_default FROM addresses WHERE id = ? AND email = ?",
          )
          .bind(params.id, session.email)
          .first<{ id: string; is_default: number }>();
        if (!existing) {
          return Response.json({ error: "not_found" }, { status: 404 });
        }

        await db
          .prepare("DELETE FROM addresses WHERE id = ? AND email = ?")
          .bind(params.id, session.email)
          .run();

        // If we just removed the default, promote the next-most-recent so the
        // account never sits in a "≥1 row, none default" state.
        if (existing.is_default === 1) {
          const successor = await db
            .prepare(
              `SELECT id FROM addresses
               WHERE email = ?
               ORDER BY updated_at DESC, id
               LIMIT 1`,
            )
            .bind(session.email)
            .first<{ id: string }>();
          if (successor) {
            await db
              .prepare(
                "UPDATE addresses SET is_default = 1, updated_at = ? WHERE id = ?",
              )
              .bind(Date.now(), successor.id)
              .run();
          }
        }

        if (isValidClientId(body.clientId)) {
          await writeCustomerAudit(request, {
            client_id: body.clientId,
            actor_email: session.email,
            action: "ADDRESS_CHANGED",
            resource_type: "address",
            resource_id: params.id,
            meta: { operation: "delete" },
          });
        }

        return Response.json(
          { ok: true },
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
