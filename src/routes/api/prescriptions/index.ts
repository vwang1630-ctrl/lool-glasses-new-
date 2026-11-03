// POST /api/prescriptions
// Creates or updates the signed-in user's saved prescription for the given
// kind. Each user has at most three saved prescriptions (single / reading /
// progressive); writing the same kind twice UPSERTs the row keyed by
// (email, kind) instead of stacking history.
//
// Image-uploaded prescriptions go through /api/prescriptions/upload instead.
//
// Auth: requires a valid lool_account_session cookie (set on successful
// /api/otp/verify). The body's `email` must match the session's email so
// a verified caller can't write into someone else's bucket.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { nanoid } from "@/server/ids";
import {
  getAccountSession,
  buildRefreshedAccountCookie,
} from "@/server/account-session";
import { isValidClientId, writeCustomerAudit } from "@/server/audit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRISM_BASES = new Set(["BU", "BD", "BI", "BO"]);
const RX_KINDS = new Set(["single", "reading", "progressive"] as const);
type RxKind = "single" | "reading" | "progressive";

interface RxBody {
  email: string;
  kind: RxKind;
  label?: { zh?: string; en?: string };
  source: "manual" | "measure-pd";
  sph?: { od?: number; os?: number };
  cyl?: { od?: number; os?: number };
  axis?: { od?: number; os?: number };
  add?: { od?: number; os?: number };
  prism?: { od?: number; baseOd?: string; os?: number; baseOs?: string };
  pd?: { total?: number; odHalf?: number; osHalf?: number };
  examDate?: number;
  notes?: string;
  clientId?: string | null;
}

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

const int = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? Math.round(v) : null;

const axisOk = (v: number | null): v is number =>
  v !== null && v >= 0 && v <= 180;

const prismBase = (v: unknown): string | null =>
  typeof v === "string" && PRISM_BASES.has(v) ? v : null;

type RxRow = {
  id: string;
  kind: string;
  label_zh: string | null;
  label_en: string | null;
  source: string;
  sph_od: number | null;
  sph_os: number | null;
  cyl_od: number | null;
  cyl_os: number | null;
  axis_od: number | null;
  axis_os: number | null;
  add_od: number | null;
  add_os: number | null;
  pd_total: number | null;
  pd_od_half: number | null;
  pd_os_half: number | null;
  upload_r2_key: string | null;
  upload_filename: string | null;
  exam_date: number | null;
  notes: string | null;
  created_at: number;
};

export const Route = createFileRoute("/api/prescriptions/")({
  server: {
    handlers: {
      // GET: returns the current account's saved prescriptions (at most one
      // per kind; arbitrary order). Cookie-gated so the wizard can auto-fill
      // by picking the row whose `kind` matches the current selection.
      GET: async ({ request }) => {
        const session = await getAccountSession(request);
        if (!session) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }
        const db = getDB();
        const res = await db
          .prepare(
            `SELECT id, kind, label_zh, label_en, source,
                    sph_od, sph_os, cyl_od, cyl_os, axis_od, axis_os,
                    add_od, add_os, pd_total, pd_od_half, pd_os_half,
                    upload_r2_key, upload_filename, exam_date, notes, created_at
             FROM prescriptions
             WHERE email = ?
             ORDER BY created_at DESC`,
          )
          .bind(session.email)
          .all<RxRow>();
        const prescriptions = (res.results ?? []).map((r) => ({
          id: r.id,
          kind: r.kind,
          label: { zh: r.label_zh, en: r.label_en },
          source: r.source,
          sph: { od: r.sph_od, os: r.sph_os },
          cyl: { od: r.cyl_od, os: r.cyl_os },
          axis: { od: r.axis_od, os: r.axis_os },
          add: { od: r.add_od, os: r.add_os },
          pd: { total: r.pd_total, odHalf: r.pd_od_half, osHalf: r.pd_os_half },
          hasUpload: !!r.upload_r2_key,
          examDate: r.exam_date,
          notes: r.notes,
          createdAt: r.created_at,
        }));
        return Response.json(
          { prescriptions },
          {
            headers: {
              "Set-Cookie": await buildRefreshedAccountCookie(session.email),
              // Per-session data; never cache at the CDN or in the browser
              // (otherwise a stale GET from before the user's last save
              // would shadow the freshly-written row).
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
        const b = (raw ?? {}) as Partial<RxBody>;
        const email = (b.email ?? "").trim().toLowerCase();
        if (!EMAIL_RE.test(email)) {
          return Response.json({ error: "invalid_email" }, { status: 400 });
        }
        if (email !== session.email) {
          return Response.json({ error: "email_mismatch" }, { status: 403 });
        }
        if (!b.kind || !RX_KINDS.has(b.kind)) {
          return Response.json({ error: "invalid_kind" }, { status: 400 });
        }
        if (b.source !== "manual" && b.source !== "measure-pd") {
          return Response.json({ error: "invalid_source" }, { status: 400 });
        }

        const axisOd = int(b.axis?.od);
        const axisOs = int(b.axis?.os);
        if (axisOd !== null && !axisOk(axisOd)) {
          return Response.json(
            { error: "axis_od_out_of_range" },
            { status: 400 },
          );
        }
        if (axisOs !== null && !axisOk(axisOs)) {
          return Response.json(
            { error: "axis_os_out_of_range" },
            { status: 400 },
          );
        }

        // Single-vision has no ADD by definition — strip it server-side so a
        // stray client field can't sneak it in and the /account card stays
        // honest about the three kinds being structurally different.
        const addOd = b.kind === "single" ? null : num(b.add?.od);
        const addOs = b.kind === "single" ? null : num(b.add?.os);

        const id = nanoid();
        const now = Date.now();
        const db = getDB();

        await db
          .prepare(
            `INSERT INTO prescriptions (
              id, email, kind, label_zh, label_en, source,
              sph_od, sph_os, cyl_od, cyl_os, axis_od, axis_os,
              add_od, add_os, prism_od, prism_base_od, prism_os, prism_base_os,
              pd_total, pd_od_half, pd_os_half,
              exam_date, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(email, kind) DO UPDATE SET
              label_zh = excluded.label_zh,
              label_en = excluded.label_en,
              source = excluded.source,
              sph_od = excluded.sph_od,
              sph_os = excluded.sph_os,
              cyl_od = excluded.cyl_od,
              cyl_os = excluded.cyl_os,
              axis_od = excluded.axis_od,
              axis_os = excluded.axis_os,
              add_od = excluded.add_od,
              add_os = excluded.add_os,
              prism_od = excluded.prism_od,
              prism_base_od = excluded.prism_base_od,
              prism_os = excluded.prism_os,
              prism_base_os = excluded.prism_base_os,
              pd_total = excluded.pd_total,
              pd_od_half = excluded.pd_od_half,
              pd_os_half = excluded.pd_os_half,
              exam_date = excluded.exam_date,
              notes = excluded.notes,
              updated_at = excluded.updated_at`,
          )
          .bind(
            id,
            email,
            b.kind,
            b.label?.zh ?? null,
            b.label?.en ?? null,
            b.source,
            num(b.sph?.od),
            num(b.sph?.os),
            num(b.cyl?.od),
            num(b.cyl?.os),
            axisOd,
            axisOs,
            addOd,
            addOs,
            num(b.prism?.od),
            prismBase(b.prism?.baseOd),
            num(b.prism?.os),
            prismBase(b.prism?.baseOs),
            num(b.pd?.total),
            num(b.pd?.odHalf),
            num(b.pd?.osHalf),
            int(b.examDate),
            b.notes ?? null,
            now,
            now,
          )
          .run();

        if (isValidClientId(b.clientId)) {
          await writeCustomerAudit(request, {
            client_id: b.clientId,
            actor_email: email,
            action: "PRESCRIPTION_UPLOAD",
            resource_type: "prescription",
            resource_id: b.kind,
            meta: { kind: b.kind, source: b.source },
          });
        }

        return Response.json(
          { ok: true, kind: b.kind },
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
