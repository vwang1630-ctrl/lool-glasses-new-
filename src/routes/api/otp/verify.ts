// POST /api/otp/verify
// Body: { email, purpose: "lookup_order" | "lookup_rx", code, ref? }
// On success returns the user's orders + prescriptions for this email AND
// sets the lool_account_session HttpOnly cookie so subsequent write endpoints
// (e.g. /api/prescriptions) can confirm the caller owns this email.
// If the email has no customer row yet, successful verification creates one:
// this OTP flow is the customer-side lightweight registration.
// One-shot: the OTP code is marked used_at after success.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { nanoid } from "@/server/ids";
import { verifyOtp, type OtpPurpose } from "@/server/otp";
import {
  signAccountSession,
  buildAccountSessionCookie,
} from "@/server/account-session";
import { getAccountData } from "@/server/account-data";
import {
  parseRefCookie,
  parseRefValue,
  resolveAttribution,
} from "@/server/affiliate-ledger";
import { isValidClientId, writeCustomerAudit } from "@/server/audit";

type CustomerRow = {
  id: string;
  affiliate_ref_slug: string | null;
  affiliate_ref_at: number | null;
};

export const Route = createFileRoute("/api/otp/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: {
          email?: string;
          purpose?: string;
          code?: string;
          ref?: string;
          clientId?: string | null;
        };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        const email = (body.email ?? "").trim().toLowerCase();
        const purpose = body.purpose as OtpPurpose | undefined;
        const code = (body.code ?? "").trim();

        if (!email || !purpose || !code) {
          return Response.json({ error: "missing_fields" }, { status: 400 });
        }
        if (purpose !== "lookup_order" && purpose !== "lookup_rx") {
          return Response.json({ error: "invalid_purpose" }, { status: 400 });
        }

        let result;
        try {
          result = await verifyOtp(email, purpose, code);
        } catch (err) {
          console.error("[otp/verify] verifyOtp threw:", err);
          return Response.json(
            {
              error: "verify_throw",
              message: err instanceof Error ? err.message : String(err),
            },
            { status: 500 },
          );
        }
        if (!result.ok) {
          return Response.json(
            { error: result.reason ?? "verify_failed" },
            { status: 401 },
          );
        }

        const db = getDB();
        const now = Date.now();
        const customer = await db
          .prepare(
            "SELECT id, affiliate_ref_slug, affiliate_ref_at FROM customers WHERE email = ?",
          )
          .bind(email)
          .first<CustomerRow>();
        const incomingRef = parseRefValue(body.ref) ?? parseRefCookie(request);
        const attribution = incomingRef
          ? await resolveAttribution(db, incomingRef, email)
          : null;

        await db
          .prepare(
            `INSERT INTO customers (
              id, email, affiliate_ref_slug, affiliate_ref_at,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET
              affiliate_ref_slug = COALESCE(excluded.affiliate_ref_slug, customers.affiliate_ref_slug),
              affiliate_ref_at = CASE
                WHEN excluded.affiliate_ref_slug IS NOT NULL THEN excluded.affiliate_ref_at
                ELSE customers.affiliate_ref_at
              END,
              updated_at = excluded.updated_at`,
          )
          .bind(
            customer?.id ?? nanoid(),
            email,
            attribution ? attribution.slug : null,
            attribution ? attribution.attributionAt : null,
            now,
            now,
          )
          .run();

        const savedCustomer = await db
          .prepare(
            "SELECT affiliate_ref_slug, affiliate_ref_at FROM customers WHERE email = ?",
          )
          .bind(email)
          .first<
            Pick<CustomerRow, "affiliate_ref_slug" | "affiliate_ref_at">
          >();
        const savedAttribution = savedCustomer?.affiliate_ref_slug
          ? await resolveAttribution(
              db,
              {
                slug: savedCustomer.affiliate_ref_slug,
                writtenAt: savedCustomer.affiliate_ref_at ?? now,
              },
              email,
            )
          : null;
        const { orders, prescriptions } = await getAccountData(email);
        const sessionCookie = await signAccountSession(email);
        if (isValidClientId(body.clientId)) {
          await writeCustomerAudit(request, {
            client_id: body.clientId,
            actor_email: email,
            action: "LOGIN",
            resource_type: "account",
            resource_id: email,
            meta: {
              purpose,
              orders: orders.length,
              prescriptions: prescriptions.length,
              source: "otp_verify",
            },
          });
        }
        return Response.json(
          {
            ok: true,
            orders,
            prescriptions,
            affiliateRef: savedAttribution
              ? {
                  slug: savedAttribution.slug,
                  writtenAt: savedAttribution.attributionAt,
                  discountPct: savedAttribution.customerDiscountPct,
                  discountPercent:
                    Math.round(savedAttribution.customerDiscountPct * 10000) /
                    100,
                }
              : null,
          },
          {
            headers: { "Set-Cookie": buildAccountSessionCookie(sessionCookie) },
          },
        );
      },
    },
  },
});
