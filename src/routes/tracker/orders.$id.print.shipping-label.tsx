// /tracker/orders/$id/print/shipping-label — printable recipient address
// label for the package. Tracker tapes this on the carton; the carrier's
// own system generates the actual barcode label separately.
//
// Big legible type, all the carrier-relevant fields (recipient, street
// address, country, zip, phone) + order number cross-reference. No items
// listed (carriers don't need that).

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getCountryName, isValidIsoCountry } from "@/lib/countries";

export const Route = createFileRoute(
  "/tracker/orders/$id/print/shipping-label",
)({
  component: ShippingLabelPrintPage,
});

interface Detail {
  id: string;
  orderNumber: string;
  customer: {
    recipient: string;
    country: string;
    zip: string;
    address: string;
    phone: string;
  };
}

function fmtDate(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function ShippingLabelPrintPage() {
  const { id } = Route.useParams();
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
      })
      .catch(
        (e) =>
          !cancelled && setError(e instanceof Error ? e.message : String(e)),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (order && !loading && !error) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [order, loading, error]);

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> 加载中
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="p-8 text-destructive">
        加载失败：{error ?? "订单不存在"}
      </div>
    );
  }

  const c = order.customer;
  return (
    <div className="print-page bg-white text-black mx-auto max-w-[640px] p-8 print:p-4">
      <div className="border-2 border-black p-6">
        <div className="flex items-baseline justify-between border-b border-black pb-2 mb-4">
          <p className="text-xs uppercase tracking-widest text-gray-600">
            Shipping Label
          </p>
          <p className="text-xs text-gray-600 font-mono">{order.orderNumber}</p>
        </div>

        <p className="text-xs uppercase tracking-wider text-gray-600 mb-2">
          TO / 收件人
        </p>
        <p className="text-2xl font-semibold leading-tight">{c.recipient}</p>

        <div className="mt-5 space-y-1.5 text-lg leading-snug">
          <p className="whitespace-pre-wrap">{c.address}</p>
          <p>
            {c.zip && <span className="font-mono">{c.zip}</span>}
            {c.zip && c.country && <span> · </span>}
            <span>
              {isValidIsoCountry(c.country)
                ? getCountryName(c.country, "en")
                : c.country}
            </span>
          </p>
          {c.phone && (
            <p className="mt-2">
              <span className="text-sm text-gray-600">Tel · 电话</span>{" "}
              <span className="font-mono">{c.phone}</span>
            </p>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-dashed border-gray-500 flex justify-between text-xs text-gray-600">
          <span>FROM: loollook eyewear</span>
          <span>{fmtDate(Date.now())}</span>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500 text-center print:hidden">
        贴在包装外侧。承运商条码请用快递公司系统单独打印。
      </p>
    </div>
  );
}
