// GET /api/admin/prescriptions — paginated prescription list filtered by email/source.
// Auth: requires admin session cookie.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireAdmin } from "@/server/admin";

const VALID_SOURCE = new Set(["manual", "upload", "measure-pd", "readers"]);

export const Route = createFileRoute("/api/admin/prescriptions/")({
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
        const source = url.searchParams.get("source");
        const email = url.searchParams.get("email");
        const limit = Math.min(
          200,
          Math.max(
            1,
            parseInt(url.searchParams.get("limit") ?? "50", 10) || 50,
          ),
        );
        const offset = Math.max(
          0,
          parseInt(url.searchParams.get("offset") ?? "0", 10) || 0,
        );

        const conds: string[] = [];
        const binds: unknown[] = [];
        if (source && VALID_SOURCE.has(source)) {
          conds.push("source = ?");
          binds.push(source);
        }
        if (email && email.trim()) {
          conds.push("email LIKE ?");
          binds.push(`%${email.trim()}%`);
        }
        const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

        const db = getDB();
        const sql = `SELECT id, email, kind, label_zh, label_en, source,
                            sph_od, sph_os, cyl_od, cyl_os, axis_od, axis_os,
                            add_od, add_os,
                            prism_od, prism_base_od, prism_os, prism_base_os,
                            pd_total, pd_od_half, pd_os_half,
                            reader_magnification,
                            upload_r2_key, upload_filename, upload_mime,
                            exam_date, notes,
                            created_at, updated_at
                     FROM prescriptions ${where}
                     ORDER BY created_at DESC
                     LIMIT ? OFFSET ?`;
        const res = await db
          .prepare(sql)
          .bind(...binds, limit, offset)
          .all();
        const total = await db
          .prepare(`SELECT COUNT(*) AS n FROM prescriptions ${where}`)
          .bind(...binds)
          .first<{ n: number }>();
        return Response.json({
          prescriptions: res.results ?? [],
          total: total?.n ?? 0,
          limit,
          offset,
        });
      },
    },
  },
});
