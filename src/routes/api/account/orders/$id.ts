// PATCH /api/account/orders/:id
// Lets a customer update the contact email + shipping address snapshot on
// their own order before it has shipped. Orders store an address copy, not an
// address-book pointer, so historical fulfilment data remains self-contained.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import {
  getAccountSession,
  buildRefreshedAccountCookie,
} from "@/server/account-session";
import { isValidIsoCountry } from "@/lib/countries";

const EDITABLE_STATUSES = new Set(["pending", "paid", "processing"]);

function stringField(
  body: Record<string, unknown>,
  key: string,
): string | Response {
  const value = body[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    return Response.json({ error: `${key}_required` }, { status: 400 });
  }
  return value.trim();
}

export const Route = createFileRoute("/api/account/orders/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        const session = await getAccountSession(request);
        if (!session) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const email = stringField(body, "email");
        const recipient = stringField(body, "recipient");
        const countryRaw = stringField(body, "country");
        const zip = stringField(body, "zip");
        const address = stringField(body, "address");
        const phone = stringField(body, "phone");
        for (const value of [
          email,
          recipient,
          countryRaw,
          zip,
          address,
          phone,
        ]) {
          if (value instanceof Response) return value;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return Response.json({ error: "email_invalid" }, { status: 400 });
        }
        const country = countryRaw.toUpperCase();
        if (!isValidIsoCountry(country)) {
          return Response.json({ error: "country_invalid" }, { status: 400 });
        }

        const db = getDB();
        const order = (await db
          .prepare(
            "SELECT id, email, status, shipped_at FROM orders WHERE id = ?",
          )
          .bind(params.id)
          .first()) as {
          id: string;
          email: string;
          status: string;
          shipped_at: number | null;
        } | null;
        if (!order || order.email !== session.email) {
          return Response.json({ error: "not_found" }, { status: 404 });
        }
        if (order.shipped_at || !EDITABLE_STATUSES.has(order.status)) {
          return Response.json({ error: "not_editable" }, { status: 409 });
        }

        await db
          .prepare(
            `UPDATE orders
             SET email = ?,
                 ship_recipient = ?,
                 ship_country = ?,
                 ship_zip = ?,
                 ship_address = ?,
                 ship_phone = ?
             WHERE id = ?`,
          )
          .bind(
            email.toLowerCase(),
            recipient,
            country,
            zip,
            address,
            phone,
            params.id,
          )
          .run();

        return Response.json(
          {
            ok: true,
            order: {
              id: params.id,
              email: email.toLowerCase(),
              shipping: { recipient, country, zip, address, phone },
            },
          },
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
