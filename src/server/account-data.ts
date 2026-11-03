// Shared "everything tied to an email" loader used by both
// /api/otp/verify (gates on fresh OTP) and /api/account/me (gates on the
// session cookie). Kept in one place so the read shape stays in sync.

import { getDB } from "@/server/db";

type OrderRow = {
  id: string;
  order_number: string;
  email: string;
  status: string;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  ship_recipient: string;
  ship_country: string;
  ship_zip: string;
  ship_address: string;
  ship_phone: string;
  paid_at: number | null;
  shipped_at: number | null;
  delivered_at: number | null;
  cancelled_at: number | null;
  created_at: number;
};

type ItemRow = {
  id: string;
  order_id: string;
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
  lens_retail_cents_snapshot: number;
  prescription_id: string | null;
  unit_frame_cents: number;
  unit_lens_cents: number;
  line_total_cents: number;
};

type ShipmentRow = {
  id: string;
  order_id: string;
  carrier: string | null;
  tracking_number: string | null;
  status: string;
  shipped_at: number | null;
  delivered_at: number | null;
};

type RxRow = {
  id: string;
  email: string;
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

export async function getAccountData(email: string) {
  const db = getDB();
  const [ordersRes, itemsRes, shipmentsRes, rxRes] = await Promise.all([
    db
      .prepare("SELECT * FROM orders WHERE email = ? ORDER BY created_at DESC")
      .bind(email)
      .all<OrderRow>(),
    db
      .prepare(
        "SELECT i.* FROM order_items i JOIN orders o ON o.id = i.order_id WHERE o.email = ? ORDER BY o.created_at DESC",
      )
      .bind(email)
      .all<ItemRow>(),
    db
      .prepare(
        "SELECT s.id, s.order_id, s.carrier, s.tracking_number, s.status, s.shipped_at, s.delivered_at FROM shipments s JOIN orders o ON o.id = s.order_id WHERE o.email = ? ORDER BY s.created_at DESC",
      )
      .bind(email)
      .all<ShipmentRow>(),
    db
      .prepare(
        "SELECT * FROM prescriptions WHERE email = ? ORDER BY created_at DESC",
      )
      .bind(email)
      .all<RxRow>(),
  ]);

  const itemsByOrder = new Map<string, ItemRow[]>();
  for (const it of itemsRes.results ?? []) {
    const arr = itemsByOrder.get(it.order_id) ?? [];
    arr.push(it);
    itemsByOrder.set(it.order_id, arr);
  }

  // One order → many shipments theoretically, but the UI only renders the
  // most recent. shipmentsRes is sorted DESC so the first hit wins.
  const shipmentByOrder = new Map<string, ShipmentRow>();
  for (const sh of shipmentsRes.results ?? []) {
    if (!shipmentByOrder.has(sh.order_id)) shipmentByOrder.set(sh.order_id, sh);
  }

  const orders = (ordersRes.results ?? []).map((o) => {
    const sh = shipmentByOrder.get(o.id);
    return {
      id: o.id,
      orderNumber: o.order_number,
      email: o.email,
      status: o.status,
      subtotalCents: o.subtotal_cents,
      shippingCents: o.shipping_cents,
      taxCents: o.tax_cents,
      totalCents: o.total_cents,
      shipping: {
        recipient: o.ship_recipient,
        country: o.ship_country,
        zip: o.ship_zip,
        address: o.ship_address,
        phone: o.ship_phone,
      },
      paidAt: o.paid_at,
      shippedAt: o.shipped_at,
      deliveredAt: o.delivered_at,
      cancelledAt: o.cancelled_at,
      createdAt: o.created_at,
      shipment: sh
        ? {
            carrier: sh.carrier,
            trackingNumber: sh.tracking_number,
            status: sh.status,
          }
        : null,
      items: (itemsByOrder.get(o.id) ?? []).map((it) => ({
        id: it.id,
        productId: it.product_id,
        productSlug: it.product_slug,
        colorId: it.frame_color_id,
        qty: it.qty,
        name: { zh: it.product_name_zh, en: it.product_name_en },
        framePng: it.frame_png_snapshot_url,
        lens: {
          skuId: it.lens_option_id,
          category: it.lens_category_snapshot,
          index: it.lens_index_snapshot,
          color: it.lens_color_snapshot,
          retailCents: it.lens_retail_cents_snapshot,
        },
        prescriptionId: it.prescription_id,
        unitFrameCents: it.unit_frame_cents,
        unitLensCents: it.unit_lens_cents,
        lineTotalCents: it.line_total_cents,
      })),
    };
  });

  const prescriptions = (rxRes.results ?? []).map((r) => ({
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

  return { orders, prescriptions };
}
