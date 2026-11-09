// POST /api/customer/audit-log
// Customer-facing event endpoint. The browser owns a long-lived client_id in
// localStorage and sends business-significant events here.

import { createFileRoute } from "@tanstack/react-router";
import {
  isValidClientId,
  writeCustomerAudit,
  type AuditAction,
} from "@/server/audit";
import { clientIp, isCrossOrigin, rateLimited } from "@/server/rate-limit";

const ALLOWED_ACTIONS = new Set<AuditAction>([
  "CLIENT_IDENTIFIED",
  "LOGIN",
  "LOGOUT",
  "PAGE_VIEW",
  "CART_ADD",
  "CART_REMOVE",
  "CART_QTY",
  "CHECKOUT_STARTED",
  "ORDER_CREATED",
  "PAYMENT_STARTED",
  "PAYMENT_SUCCEEDED",
  "PAYMENT_FAILED",
  "TRYON_UPLOAD",
  "TRYON_REQUEST",
  "TRYON_SUCCEEDED",
  "TRYON_FAILED",
  "PRESCRIPTION_UPLOAD",
  "ADDRESS_CHANGED",
  "CONTACT_STARTED",
  "SECURITY_SIGNAL",
]);

type Body = {
  clientId?: string;
  actorEmail?: string | null;
  action?: AuditAction;
  resourceType?: string;
  resourceId?: string | null;
  meta?: unknown;
};

export const Route = createFileRoute("/api/customer/audit-log")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (isCrossOrigin(request)) {
          return Response.json({ error: "forbidden" }, { status: 403 });
        }
        // A real visitor emits a handful of events per page; 200 per 10 min
        // per IP leaves plenty of room (shared NATs included) but stops floods.
        if (await rateLimited("audit", clientIp(request), 200, 600)) {
          return Response.json({ ok: true, dropped: true }, { status: 202 });
        }
        let body: Body;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        if (!isValidClientId(body.clientId)) {
          return Response.json({ error: "invalid_client_id" }, { status: 400 });
        }
        const action = body.action;
        if (!action || !ALLOWED_ACTIONS.has(action)) {
          return Response.json({ error: "invalid_action" }, { status: 400 });
        }

        await writeCustomerAudit(request, {
          client_id: body.clientId,
          actor_email: body.actorEmail ?? null,
          action,
          resource_type: sanitizeToken(body.resourceType, "customer"),
          resource_id:
            typeof body.resourceId === "string"
              ? body.resourceId.slice(0, 128)
              : null,
          meta: sanitizeMeta(body.meta),
        });
        return Response.json({ ok: true });
      },
    },
  },
});

function sanitizeToken(value: string | undefined, fallback: string): string {
  const raw = (value ?? "").trim().slice(0, 64);
  return /^[a-z0-9_.-]+$/i.test(raw) ? raw : fallback;
}

function sanitizeMeta(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(source).slice(0, 30)) {
    if (!/^[a-z0-9_.-]+$/i.test(key)) continue;
    if (typeof raw === "string") out[key] = raw.slice(0, 256);
    else if (typeof raw === "number" || typeof raw === "boolean" || raw == null)
      out[key] = raw;
    else if (Array.isArray(raw))
      out[key] = raw.slice(0, 20).map((v) => String(v).slice(0, 128));
  }
  return out;
}
