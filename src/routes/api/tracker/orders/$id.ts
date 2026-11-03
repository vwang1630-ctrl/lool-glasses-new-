// GET /api/tracker/orders/:id
//
// Full detail for a single order, scoped to what a tracker needs to do their
// job: ship-to address, contact, items with frame/lens specs + supplier
// info + Rx snapshots + per-item fulfillment progress. No prices, no
// payment info, no affiliate columns.
//
// Suppliers are read live, not snapshotted, because the tracker cares about
// "which factory do I call about this order" — that's reality-now, not
// reality-when-ordered. A SKU can carry multiple suppliers
// (lens_skus.supplier_costs_json / products.supplier_costs_json — JSON map
// keyed by supplier id). We pull every referenced supplier id across all
// items and resolve names in one batch query against the merged suppliers
// table (post-0065).
//
// Prescription data, on the other hand, comes from the per-item snapshot
// columns that POST /api/orders wrote at order-creation time. The
// prescription_id is preserved for traceability but never used as the
// source of truth here — customer-edited Rx records don't drift into
// historical orders.

import { createFileRoute } from "@tanstack/react-router";
import { getDB } from "@/server/db";
import { requireTracker } from "@/server/tracker";

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  email: string;
  content_lang: string | null;
  ship_recipient: string;
  ship_country: string;
  ship_zip: string;
  ship_address: string;
  ship_phone: string;
  created_at: number;
  paid_at: number | null;
  tracker_id: string | null;
  tracker_assigned_at: number | null;
  tracker_name: string | null;
}

interface ItemRow {
  id: string;
  product_id: string;
  product_slug: string;
  product_name_zh: string;
  product_name_en: string;
  frame_color_id: string | null;
  frame_png_snapshot_url: string | null;
  qty: number;
  lens_option_id: string;
  lens_category_snapshot: string;
  lens_index_snapshot: string;
  lens_color_snapshot: string | null;
  lens_base_function_snapshot: string | null;
  lens_color_id_snapshot: string | null;
  lens_brand_id_snapshot: string | null;
  lens_brand_label_json: string | null;
  lens_progressive_tier_snapshot: string | null;
  lens_prescription_type: string | null;
  prescription_id: string | null;
  fulfillment_status: string | null;
  fulfillment_notes: string | null;

  // Per-product / per-sku supplier_costs_json (live; not snapshotted)
  product_supplier_costs_json: string | null;
  lens_supplier_costs_json: string | null;

  // Product-level fallback image when the order has no color-specific snapshot.
  // card_image_url is the storefront card shot when it's been seeded; for
  // legacy / minimal products it's NULL and we fall back to the first color's
  // first image — the same derivation the storefront product card uses.
  product_card_image_url: string | null;
  product_first_color_images_json: string | null;

  // Rx snapshot (frozen at order time)
  rx_source: string | null;
  rx_label_zh: string | null;
  rx_label_en: string | null;
  rx_sph_od: number | null;
  rx_sph_os: number | null;
  rx_cyl_od: number | null;
  rx_cyl_os: number | null;
  rx_axis_od: number | null;
  rx_axis_os: number | null;
  rx_add_od: number | null;
  rx_add_os: number | null;
  rx_prism_od: number | null;
  rx_prism_base_od: string | null;
  rx_prism_os: number | null;
  rx_prism_base_os: string | null;
  rx_pd_total: number | null;
  rx_pd_od_half: number | null;
  rx_pd_os_half: number | null;
  rx_reader_magnification: number | null;
  rx_exam_date: number | null;
  rx_notes: string | null;
}

interface SupplierRow {
  id: string;
  name_zh: string;
  name_en: string;
  kind: string;
}

// supplier_costs_json shape:
//   { "<supplier_id>": { "cost_cny_cents": <int|null>, "supplier_sku_code": <text|null> } }
// We don't need cost; the tracker only needs the supplier name + their SKU code.
interface SupplierCostsValue {
  cost_cny_cents?: number | null;
  supplier_sku_code?: string | null;
}

const DEFAULT_FRAME_SUPPLIERS = ["wenzhou-acetate", "shenzhen-titanium"];

function defaultLensSupplierId(brandId: string | null): string {
  if (brandId === "zeiss") return "zeiss-china";
  if (["essilor", "kammy", "conant", "transitions"].includes(brandId ?? ""))
    return "essilor-china";
  return "mingyue";
}

function firstImageFromJson(json: string | null): string | null {
  if (!json) return null;
  try {
    const arr = JSON.parse(json);
    if (Array.isArray(arr) && typeof arr[0] === "string") return arr[0];
  } catch {
    // fall through
  }
  return null;
}

function parseSupplierCosts(
  json: string | null,
): Array<{ supplierId: string; sku: string | null }> {
  if (!json) return [];
  let obj: unknown;
  try {
    obj = JSON.parse(json);
  } catch {
    return [];
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [];
  return Object.entries(obj as Record<string, unknown>).map(
    ([supplierId, raw]) => {
      const v = raw as SupplierCostsValue;
      const skuRaw =
        v && typeof v === "object" ? (v.supplier_sku_code ?? null) : null;
      return { supplierId, sku: typeof skuRaw === "string" ? skuRaw : null };
    },
  );
}

export const Route = createFileRoute("/api/tracker/orders/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          await requireTracker(request);
        } catch (resp) {
          return resp as Response;
        }
        const db = getDB();
        const orderId = params.id;

        const order = await db
          .prepare(
            `SELECT
               o.id, o.order_number, o.status, o.email, o.content_lang,
               o.ship_recipient, o.ship_country, o.ship_zip,
               o.ship_address, o.ship_phone,
               o.created_at, o.paid_at,
               o.tracker_id, o.tracker_assigned_at,
               tu.name AS tracker_name
             FROM orders o
             LEFT JOIN tracker_users tu ON tu.id = o.tracker_id
             WHERE o.id = ?
               AND o.status IN ('paid', 'processing')`,
          )
          .bind(orderId)
          .first<OrderRow>();
        if (!order) {
          return Response.json({ error: "not_found" }, { status: 404 });
        }

        // Pull items + the relevant supplier_costs_json blobs.  Lens join
        // skips the 'frame-only' sentinel so lens_supplier_costs_json comes
        // back NULL for frame-only items.
        const itemsRes = await db
          .prepare(
            `SELECT
               oi.id, oi.product_id, oi.product_slug, oi.product_name_zh, oi.product_name_en,
               oi.frame_color_id, oi.frame_png_snapshot_url, oi.qty,
               oi.lens_option_id, oi.lens_category_snapshot, oi.lens_index_snapshot,
               oi.lens_color_snapshot, oi.lens_base_function_snapshot,
               oi.lens_color_id_snapshot, oi.lens_brand_id_snapshot,
               oi.lens_brand_label_json, oi.lens_progressive_tier_snapshot,
               ls.prescription_type AS lens_prescription_type,
               oi.prescription_id,
               oi.fulfillment_status, oi.fulfillment_notes,

               p.supplier_costs_json   AS product_supplier_costs_json,
               ls.supplier_costs_json  AS lens_supplier_costs_json,
               p.card_image_url        AS product_card_image_url,
               (SELECT pc.images_json FROM product_colors pc
                 WHERE pc.product_id = p.id
                 ORDER BY pc.sort_order, pc.color_id LIMIT 1) AS product_first_color_images_json,

               oi.rx_source, oi.rx_label_zh, oi.rx_label_en,
               oi.rx_sph_od, oi.rx_sph_os, oi.rx_cyl_od, oi.rx_cyl_os,
               oi.rx_axis_od, oi.rx_axis_os, oi.rx_add_od, oi.rx_add_os,
               oi.rx_prism_od, oi.rx_prism_base_od, oi.rx_prism_os, oi.rx_prism_base_os,
               oi.rx_pd_total, oi.rx_pd_od_half, oi.rx_pd_os_half,
               oi.rx_reader_magnification, oi.rx_exam_date, oi.rx_notes

             FROM order_items oi
             LEFT JOIN products p   ON p.id = oi.product_id
             LEFT JOIN lens_skus ls ON ls.id = oi.lens_option_id AND oi.lens_option_id != 'frame-only'
             WHERE oi.order_id = ?
             ORDER BY oi.id`,
          )
          .bind(orderId)
          .all<ItemRow>();
        const items = itemsRes.results ?? [];

        // Build per-item supplier-with-sku lists from the JSON blobs, then
        // batch-fetch all referenced suppliers in one query.
        const frameSupplierList = items.map((i) => {
          const configured = parseSupplierCosts(i.product_supplier_costs_json);
          if (configured.length > 0) return configured;
          return DEFAULT_FRAME_SUPPLIERS.map((supplierId) => ({
            supplierId,
            sku: null,
          }));
        });
        const lensSupplierList = items.map((i) => {
          const configured = parseSupplierCosts(i.lens_supplier_costs_json);
          if (configured.length > 0 || i.lens_option_id === "frame-only")
            return configured;
          return [
            {
              supplierId: defaultLensSupplierId(i.lens_brand_id_snapshot),
              sku: null,
            },
          ];
        });
        const allSupplierIds = new Set<string>();
        for (const list of [...frameSupplierList, ...lensSupplierList]) {
          for (const e of list) allSupplierIds.add(e.supplierId);
        }
        let supplierById = new Map<string, SupplierRow>();
        if (allSupplierIds.size > 0) {
          const ids = [...allSupplierIds];
          const placeholders = ids.map(() => "?").join(",");
          const supRes = await db
            .prepare(
              `SELECT id, name_zh, name_en, kind FROM suppliers WHERE id IN (${placeholders})`,
            )
            .bind(...ids)
            .all<SupplierRow>();
          supplierById = new Map((supRes.results ?? []).map((r) => [r.id, r]));
        }

        const resolveSuppliers = (
          list: Array<{ supplierId: string; sku: string | null }>,
        ) =>
          list.map((e) => {
            const s = supplierById.get(e.supplierId);
            return {
              id: e.supplierId,
              nameZh: s?.name_zh ?? null,
              nameEn: s?.name_en ?? null,
              sku: e.sku,
            };
          });

        const safeJson = (s: string | null) => {
          if (!s) return null;
          try {
            return JSON.parse(s);
          } catch {
            return null;
          }
        };

        // True if any Rx field on the snapshot is non-null. Used by the UI
        // to decide whether to render the Rx panel or fall back to a hint.
        const hasRx = (it: ItemRow): boolean =>
          it.rx_sph_od != null ||
          it.rx_sph_os != null ||
          it.rx_cyl_od != null ||
          it.rx_cyl_os != null ||
          it.rx_add_od != null ||
          it.rx_add_os != null ||
          it.rx_pd_total != null ||
          it.rx_pd_od_half != null ||
          it.rx_pd_os_half != null ||
          it.rx_reader_magnification != null;

        return Response.json({
          order: {
            id: order.id,
            orderNumber: order.order_number,
            status: order.status,
            contentLang: order.content_lang,
            createdAt: order.created_at,
            paidAt: order.paid_at,
            customer: {
              email: order.email,
              recipient: order.ship_recipient,
              country: order.ship_country,
              zip: order.ship_zip,
              address: order.ship_address,
              phone: order.ship_phone,
            },
            tracker:
              order.tracker_id != null
                ? {
                    id: order.tracker_id,
                    name: order.tracker_name ?? "—",
                    assignedAt: order.tracker_assigned_at,
                  }
                : null,
            items: items.map((i, idx) => ({
              id: i.id,
              productId: i.product_id,
              productSlug: i.product_slug,
              productName: { zh: i.product_name_zh, en: i.product_name_en },
              frameColorId: i.frame_color_id,
              // Color-specific PNG captured at order time; falls back first to
              // the product's storefront card image, then to the first color's
              // first image (mirrors how the storefront product card derives
              // its image), so items ordered without a colorId still show.
              framePngUrl:
                i.frame_png_snapshot_url ??
                i.product_card_image_url ??
                firstImageFromJson(i.product_first_color_images_json),
              qty: i.qty,
              fulfillmentStatus: i.fulfillment_status ?? "pending",
              fulfillmentNotes: i.fulfillment_notes,
              isFrameOnly: i.lens_option_id === "frame-only",
              requiresPrescription: [
                "single-vision",
                "progressive",
                "reading",
              ].includes(i.lens_prescription_type ?? ""),
              lens: {
                optionId: i.lens_option_id,
                category: i.lens_category_snapshot,
                index: i.lens_index_snapshot,
                color: i.lens_color_snapshot,
                baseFunction: i.lens_base_function_snapshot,
                colorId: i.lens_color_id_snapshot,
                brandId: i.lens_brand_id_snapshot,
                brandLabel: safeJson(i.lens_brand_label_json),
                progressiveTier: i.lens_progressive_tier_snapshot,
              },
              frameSuppliers: resolveSuppliers(frameSupplierList[idx]),
              lensSuppliers: resolveSuppliers(lensSupplierList[idx]),
              prescriptionId: i.prescription_id,
              prescription: hasRx(i)
                ? {
                    source: i.rx_source,
                    label: { zh: i.rx_label_zh, en: i.rx_label_en },
                    sphOd: i.rx_sph_od,
                    sphOs: i.rx_sph_os,
                    cylOd: i.rx_cyl_od,
                    cylOs: i.rx_cyl_os,
                    axisOd: i.rx_axis_od,
                    axisOs: i.rx_axis_os,
                    addOd: i.rx_add_od,
                    addOs: i.rx_add_os,
                    prismOd: i.rx_prism_od,
                    prismBaseOd: i.rx_prism_base_od,
                    prismOs: i.rx_prism_os,
                    prismBaseOs: i.rx_prism_base_os,
                    pdTotal: i.rx_pd_total,
                    pdOdHalf: i.rx_pd_od_half,
                    pdOsHalf: i.rx_pd_os_half,
                    readerMagnification: i.rx_reader_magnification,
                    examDate: i.rx_exam_date,
                    notes: i.rx_notes,
                  }
                : null,
            })),
          },
        });
      },
    },
  },
});
