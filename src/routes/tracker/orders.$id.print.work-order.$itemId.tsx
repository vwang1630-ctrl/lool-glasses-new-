// /tracker/orders/$id/print/work-order/$itemId — printable per-item work
// order. Hand to the supplier (frame or lens) so they know what to make.
//
// Deliberately no customer PII (name / address / email / phone). The
// supplier doesn't need it; reducing data leakage is free. Order number
// + internal item id are enough cross-reference for any callback.
//
// Auto-triggers window.print() on mount. Print CSS hides the tracker
// header (handled in tracker.tsx layout). The on-screen preview shows the
// same layout so the tracker knows what's about to print.

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute(
  "/tracker/orders/$id/print/work-order/$itemId",
)({
  component: WorkOrderPrintPage,
});

// Mirror of the shapes /api/tracker/orders/$id returns. Kept local because we
// only use a slice and can be more permissive than the tracker detail page.
interface RxData {
  source: string | null;
  label: { zh: string | null; en: string | null };
  sphOd: number | null;
  sphOs: number | null;
  cylOd: number | null;
  cylOs: number | null;
  axisOd: number | null;
  axisOs: number | null;
  addOd: number | null;
  addOs: number | null;
  prismOd: number | null;
  prismBaseOd: string | null;
  prismOs: number | null;
  prismBaseOs: string | null;
  pdTotal: number | null;
  pdOdHalf: number | null;
  pdOsHalf: number | null;
  readerMagnification: number | null;
  examDate: number | null;
  notes: string | null;
}

interface SupplierInfo {
  id: string;
  nameZh: string | null;
  nameEn: string | null;
  sku: string | null;
}

interface Item {
  id: string;
  productSlug: string;
  productName: { zh: string; en: string };
  frameColorId: string | null;
  framePngUrl: string | null;
  qty: number;
  fulfillmentStatus: string;
  isFrameOnly: boolean;
  lens: {
    optionId: string;
    category: string;
    index: string;
    color: string | null;
    baseFunction: string | null;
    colorId: string | null;
    brandId: string | null;
    brandLabel: Record<string, string> | null;
    progressiveTier: string | null;
  };
  frameSuppliers: SupplierInfo[];
  lensSuppliers: SupplierInfo[];
  prescription: RxData | null;
}

interface Detail {
  id: string;
  orderNumber: string;
  createdAt: number;
  paidAt: number | null;
  items: Item[];
}

function fmtSigned(v: number | null): string {
  if (v == null) return "—";
  return v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2);
}

function fmtDate(ms: number | null): string {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function supplierName(s: SupplierInfo): string {
  return s.nameZh || s.nameEn || s.id;
}

function WorkOrderPrintPage() {
  const { id, itemId } = Route.useParams();
  const [item, setItem] = useState<Item | null>(null);
  const [order, setOrder] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/tracker/orders/${id}`, { credentials: "same-origin" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((j: { order: Detail }) => {
        if (cancelled) return;
        setOrder(j.order);
        setItem(j.order.items.find((i) => i.id === itemId) ?? null);
      })
      .catch(
        (e) =>
          !cancelled && setError(e instanceof Error ? e.message : String(e)),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, itemId]);

  // Fire the browser print dialog once the data is on screen so the user
  // gets a print preview without an extra click. The on-screen page is
  // still visible behind the dialog for review.
  useEffect(() => {
    if (item && order && !loading && !error) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [item, order, loading, error]);

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> 加载中
      </div>
    );
  }
  if (error || !item || !order) {
    return (
      <div className="p-8 text-destructive">
        加载失败：{error ?? "item 不存在"}
      </div>
    );
  }

  const rx = item.prescription;
  const itemRef = item.id.slice(-6).toUpperCase();

  return (
    <div className="print-page bg-white text-black mx-auto max-w-[760px] p-8 print:p-0 print:max-w-none">
      <div className="flex items-end justify-between border-b-2 border-black pb-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            加工单 · Work Order
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            lool eyewear · {fmtDate(Date.now())}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">订单号 / Order</p>
          <p className="text-lg font-mono font-semibold">{order.orderNumber}</p>
          <p className="text-xs text-gray-600 mt-1">单据编号 / Ref</p>
          <p className="font-mono">{itemRef}</p>
        </div>
      </div>

      {/* Frame */}
      <Section title="镜框 · Frame">
        <Field
          label="商品"
          value={`${item.productName.zh} / ${item.productName.en}`}
        />
        <Field label="型号 / SKU" value={item.productSlug} />
        <Field label="数量 / Qty" value={`×${item.qty}`} />
        <Field label="颜色 / Color" value={item.frameColorId ?? "—"} />
        {item.framePngUrl && (
          <div className="mt-3">
            <img
              src={item.framePngUrl}
              alt=""
              className="max-w-[200px] max-h-[120px] object-contain"
            />
          </div>
        )}
        <SuppliersList suppliers={item.frameSuppliers} emptyText="—" />
      </Section>

      {/* Lens */}
      {item.isFrameOnly ? (
        <Section title="镜片 · Lens">
          <p className="text-gray-600">纯镜框 · Frame only — 不需要加工镜片</p>
        </Section>
      ) : (
        <Section title="镜片 · Lens">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
            <Field label="类型 / Category" value={item.lens.category || "—"} />
            <Field label="折射率 / Index" value={item.lens.index} />
            <Field
              label="基础功能 / Function"
              value={item.lens.baseFunction || "—"}
            />
            <Field
              label="品牌 / Brand"
              value={
                item.lens.brandLabel?.zh ||
                item.lens.brandLabel?.en ||
                item.lens.brandId ||
                "—"
              }
            />
            <Field
              label="渐进等级 / Progressive"
              value={item.lens.progressiveTier || "—"}
            />
            <Field
              label="镜片颜色 / Color"
              value={item.lens.color || item.lens.colorId || "—"}
            />
          </div>
          <SuppliersList suppliers={item.lensSuppliers} emptyText="—" />
        </Section>
      )}

      {/* Prescription */}
      {rx && (
        <Section title="处方 · Prescription">
          <table className="w-full text-sm border border-black border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-black px-2 py-1.5 text-left"></th>
                <th className="border border-black px-2 py-1.5 text-left">
                  SPH
                </th>
                <th className="border border-black px-2 py-1.5 text-left">
                  CYL
                </th>
                <th className="border border-black px-2 py-1.5 text-left">
                  AXIS
                </th>
                <th className="border border-black px-2 py-1.5 text-left">
                  ADD
                </th>
                <th className="border border-black px-2 py-1.5 text-left">
                  PRISM
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1.5 font-medium">
                  OD（右 R）
                </td>
                <td className="border border-black px-2 py-1.5">
                  {fmtSigned(rx.sphOd)}
                </td>
                <td className="border border-black px-2 py-1.5">
                  {fmtSigned(rx.cylOd)}
                </td>
                <td className="border border-black px-2 py-1.5">
                  {rx.axisOd ?? "—"}
                </td>
                <td className="border border-black px-2 py-1.5">
                  {fmtSigned(rx.addOd)}
                </td>
                <td className="border border-black px-2 py-1.5">
                  {rx.prismOd != null
                    ? `${rx.prismOd} ${rx.prismBaseOd ?? ""}`
                    : "—"}
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1.5 font-medium">
                  OS（左 L）
                </td>
                <td className="border border-black px-2 py-1.5">
                  {fmtSigned(rx.sphOs)}
                </td>
                <td className="border border-black px-2 py-1.5">
                  {fmtSigned(rx.cylOs)}
                </td>
                <td className="border border-black px-2 py-1.5">
                  {rx.axisOs ?? "—"}
                </td>
                <td className="border border-black px-2 py-1.5">
                  {fmtSigned(rx.addOs)}
                </td>
                <td className="border border-black px-2 py-1.5">
                  {rx.prismOs != null
                    ? `${rx.prismOs} ${rx.prismBaseOs ?? ""}`
                    : "—"}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="grid grid-cols-3 gap-x-8 gap-y-1.5 mt-3 text-sm">
            <Field
              label="PD 双瞳距"
              value={rx.pdTotal != null ? `${rx.pdTotal} mm` : "—"}
            />
            <Field
              label="PD 右单"
              value={rx.pdOdHalf != null ? `${rx.pdOdHalf} mm` : "—"}
            />
            <Field
              label="PD 左单"
              value={rx.pdOsHalf != null ? `${rx.pdOsHalf} mm` : "—"}
            />
            {rx.readerMagnification != null && (
              <Field label="老花放大" value={`+${rx.readerMagnification}`} />
            )}
            <Field label="验光日期" value={fmtDate(rx.examDate)} />
          </div>
          {rx.notes && <p className="mt-3 text-sm">备注 / Note：{rx.notes}</p>}
        </Section>
      )}

      {!rx && !item.isFrameOnly && (
        <Section title="处方 · Prescription">
          <p className="text-red-600 font-semibold">⚠ 处方缺失，请与跟单确认</p>
        </Section>
      )}

      {/* Sign-off */}
      <div className="mt-10 grid grid-cols-2 gap-8 text-sm">
        <div>
          <p className="text-gray-600 mb-6">收件签字 / Received by</p>
          <div className="border-b border-black h-6"></div>
        </div>
        <div>
          <p className="text-gray-600 mb-6">完成签字 / Completed by</p>
          <div className="border-b border-black h-6"></div>
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-500 text-center print:fixed print:bottom-4 print:left-0 print:right-0">
        本单仅含加工所需信息，不含客户身份信息。loollook.com · 内部加工单
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2 className="text-base font-semibold border-b border-black pb-1 mb-3">
        {title}
      </h2>
      <div className="text-sm">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 py-0.5">
      <span className="text-gray-600 text-xs min-w-[110px]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function SuppliersList({
  suppliers,
  emptyText,
}: {
  suppliers: SupplierInfo[];
  emptyText: string;
}) {
  return (
    <div className="mt-3 pt-3 border-t border-dashed border-gray-400">
      <p className="text-xs text-gray-600 mb-1.5">供应商 / Supplier</p>
      {suppliers.length === 0 ? (
        <p className="text-gray-600">{emptyText}</p>
      ) : (
        <ul className="space-y-1">
          {suppliers.map((s) => (
            <li key={s.id} className="flex items-baseline gap-3">
              <span className="font-medium">{supplierName(s)}</span>
              <span className="text-xs text-gray-600">
                供应商 SKU：<span className="font-mono">{s.sku ?? "—"}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
