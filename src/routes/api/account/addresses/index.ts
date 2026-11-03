// GET / POST /api/account/addresses
//
// GET  → list every saved shipping address for the cookie-bound account,
//        default first, then by updated_at desc. Used by the /account
//        Address tab and the checkout picker.
//
// POST → create a new address row. Caps at 10 per email (older ones must be
//        deleted first). If `setDefault` is true, the new row becomes the
//        default and any previous default is cleared.
//
// Auth: lool_account_session cookie. Identity is the session's email; the
// body cannot specify which email to write into.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { nanoid } from "@/server/ids";
import {
  getAccountSession,
  buildRefreshedAccountCookie,
} from "@/server/account-session";
import { isValidIsoCountry } from "@/lib/countries";
import { isValidClientId, writeCustomerAudit } from "@/server/audit";

export const ADDRESS_CAP_PER_USER = 10;

interface AddressBody {
  recipient: string;
  country: string;
  zip: string;
  address: string;
  phone: string;
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

export function serializeAddress(r: AddressRow) {
  return {
    id: r.id,
    recipient: r.recipient,
    country: r.country,
    zip: r.zip,
    address: r.address,
    phone: r.phone,
    isDefault: r.is_default === 1,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function validate(
  raw: unknown,
): { ok: true; v: AddressBody } | { ok: false; reason: string } {
  if (!raw || typeof raw !== "object")
    return { ok: false, reason: "invalid_body" };
  const b = raw as Partial<AddressBody>;
  const recipient = (b.recipient ?? "").trim();
  const country = (b.country ?? "").trim();
  const zip = (b.zip ?? "").trim();
  const address = (b.address ?? "").trim();
  const phone = (b.phone ?? "").trim();
  if (!recipient) return { ok: false, reason: "missing_recipient" };
  if (!country) return { ok: false, reason: "missing_country" };
  const upperCountry = country.toUpperCase();
  if (!isValidIsoCountry(upperCountry))
    return { ok: false, reason: "invalid_country" };
  if (!zip) return { ok: false, reason: "missing_zip" };
  if (!address) return { ok: false, reason: "missing_address" };
  if (!phone) return { ok: false, reason: "missing_phone" };
  return {
    ok: true,
    v: {
      recipient,
      country: upperCountry,
      zip,
      address,
      phone,
      setDefault: !!b.setDefault,
    },
  };
}

export const Route = createFileRoute("/api/account/addresses/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await getAccountSession(request);
        if (!session) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }
        const db = getDB();
        const res = await db
          .prepare(
            `SELECT id, email, recipient, country, zip, address, phone,
                    is_default, created_at, updated_at
             FROM addresses
             WHERE email = ?
             ORDER BY is_default DESC, updated_at DESC, id`,
          )
          .bind(session.email)
          .all<AddressRow>();
        return Response.json(
          { addresses: (res.results ?? []).map(serializeAddress) },
          {
            headers: {
              "Set-Cookie": await buildRefreshedAccountCookie(session.email),
              "Cache-Control": "private, no-store",
            },
          },
        );
      },
      POST: async ({ request }) => {
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
        const r = validate(raw);
        if (!r.ok) return Response.json({ error: r.reason }, { status: 400 });
        const b = r.v;

        const db = getDB();
        const countRow = await db
          .prepare("SELECT COUNT(*) AS n FROM addresses WHERE email = ?")
          .bind(session.email)
          .first<{ n: number }>();
        const count = countRow?.n ?? 0;
        if (count >= ADDRESS_CAP_PER_USER) {
          return Response.json(
            { error: "cap_reached", cap: ADDRESS_CAP_PER_USER },
            { status: 400 },
          );
        }

        const id = nanoid();
        const now = Date.now();
        // First address auto-defaults; otherwise honour the body flag.
        const makeDefault = count === 0 || b.setDefault === true;

        if (makeDefault) {
          await db.batch([
            db
              .prepare(
                "UPDATE addresses SET is_default = 0, updated_at = ? WHERE email = ?",
              )
              .bind(now, session.email),
            db
              .prepare(
                `INSERT INTO addresses
                   (id, email, recipient, country, zip, address, phone, is_default, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
              )
              .bind(
                id,
                session.email,
                b.recipient,
                b.country,
                b.zip,
                b.address,
                b.phone,
                now,
                now,
              ),
          ]);
        } else {
          await db
            .prepare(
              `INSERT INTO addresses
                 (id, email, recipient, country, zip, address, phone, is_default, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
            )
            .bind(
              id,
              session.email,
              b.recipient,
              b.country,
              b.zip,
              b.address,
              b.phone,
              now,
              now,
            )
            .run();
        }

        const rawBody = raw as Partial<AddressBody>;
        if (isValidClientId(rawBody.clientId)) {
          await writeCustomerAudit(request, {
            client_id: rawBody.clientId,
            actor_email: session.email,
            action: "ADDRESS_CHANGED",
            resource_type: "address",
            resource_id: id,
            meta: {
              operation: "create",
              country: b.country,
              isDefault: makeDefault,
            },
          });
        }

        return Response.json(
          { ok: true, id, isDefault: makeDefault },
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
