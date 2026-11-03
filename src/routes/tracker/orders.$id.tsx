// /tracker/orders/$id — single-order workbench.
//
// Per-item progress: each item shows its own status (待处理 → 加工中 → 已打包),
// its frame supplier + frame SKU, its lens supplier + lens SKU, the frozen
// Rx snapshot, and per-item action buttons. The order ships once, with one
// carrier + tracking — but only after EVERY item is packed.
//
// Prescription policy:
//   - frame-only items: "纯镜框" subtle hint
//   - lens items WITH Rx: full Rx panel from the order_items snapshot
//   - Rx-required lens items WITHOUT Rx: amber warning "处方缺失，请与客户确认"
//   - non-prescription lens items: no Rx warning

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { getCountryName, isValidIsoCountry } from "@/lib/countries";

export const Route = createFileRoute("/tracker/orders/$id")({
  component: TrackerOrderDetail,
});

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
  fulfillmentStatus: "pending" | "in_progress" | "packed" | "shipped";
  fulfillmentNotes: string | null;
  isFrameOnly: boolean;
  requiresPrescription: boolean;
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
  prescriptionId: string | null;
  prescription: RxData | null;
}

interface Detail {
  id: string;
  orderNumber: string;
  status: "paid" | "processing";
  contentLang: string | null;
  createdAt: number;
  paidAt: number | null;
  customer: {
    email: string;
    recipient: string;
    country: string;
    zip: string;
    address: string;
    phone: string;
  };
  tracker: { id: string; name: string; assignedAt: number | null } | null;
  items: Item[];
}

interface Me {
  id: string;
  email: string;
  name: string;
}

function fmtDateTime(ms: number | null): string {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fmtSigned(v: number | null): string {
  if (v == null) return "—";
  return v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2);
}

const STATUS_LABEL: Record<Item["fulfillmentStatus"], string> = {
  pending: "待处理",
  in_progress: "加工中",
  packed: "已打包",
  shipped: "已发货",
};

const STATUS_BADGE: Record<Item["fulfillmentStatus"], string> = {
  pending: "bg-slate-100 text-slate-700",
  in_progress: "bg-amber-100 text-amber-800",
  packed: "bg-emerald-100 text-emerald-800",
  shipped: "bg-blue-100 text-blue-800",
};

interface LogisticsAgent {
  agent_id: string;
  agent_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  supplier_id: string;
  supplier_name_zh: string;
  supplier_name_en: string;
}

function TrackerOrderDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [agents, setAgents] = useState<LogisticsAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [agentId, setAgentId] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const load = async () => {
    setLoading(true);
    const [meRes, dRes, cRes] = await Promise.all([
      fetch("/api/tracker/me", { credentials: "same-origin" }),
      fetch(`/api/tracker/orders/${id}`, { credentials: "same-origin" }),
      fetch("/api/tracker/carriers", { credentials: "same-origin" }),
    ]);
    if (meRes.ok) setMe(((await meRes.json()) as { tracker: Me }).tracker);
    if (cRes.ok)
      setAgents(((await cRes.json()) as { agents: LogisticsAgent[] }).agents);
    if (!dRes.ok) {
      setError(dRes.status === 404 ? "订单不存在或已发出" : "加载失败");
      setLoading(false);
      return;
    }
    const j = (await dRes.json()) as { order: Detail };
    setDetail(j.order);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> 加载中
      </div>
    );
  }
  if (error || !detail) {
    return (
      <div className="space-y-4">
        <Link
          to="/tracker"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> 返回订单列表
        </Link>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  const mine = !!(me && detail.tracker && detail.tracker.id === me.id);
  const unclaimed = !detail.tracker;
  const otherClaimed = !!(
    detail.tracker &&
    (!me || detail.tracker.id !== me.id)
  );

  const allPacked = detail.items.every(
    (it) => it.fulfillmentStatus === "packed",
  );

  const callOrderAction = async (action: "claim" | "release" | "ship") => {
    if (busy) return;
    setBusy(true);
    try {
      const body =
        action === "ship"
          ? JSON.stringify({ agentId, trackingNumber })
          : undefined;
      const r = await fetch(`/api/tracker/orders/${id}/${action}`, {
        method: "POST",
        credentials: "same-origin",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body,
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as {
          error?: string;
          unpackedCount?: number;
        };
        if (j.error === "items_not_all_packed") {
          alert(`还有 ${j.unpackedCount ?? "?"} 项未打包，无法发货`);
        } else {
          alert(`操作失败：${j.error ?? r.statusText}`);
        }
        return;
      }
      if (action === "ship") {
        navigate({ to: "/tracker" });
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  };

  const callItemAction = async (
    itemId: string,
    action: "start" | "pack" | "revert",
  ) => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/tracker/orders/${id}/items/${itemId}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        alert(`操作失败：${j.error ?? r.statusText}`);
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/tracker"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> 返回订单列表
      </Link>

      {/* Header */}
      <div className="bg-background rounded-2xl border border-border p-6">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">订单号</p>
            <h1 className="text-2xl font-semibold font-display font-mono">
              {detail.orderNumber}
            </h1>
          </div>
          <span
            className={
              detail.status === "paid"
                ? "inline-flex px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                : "inline-flex px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800"
            }
          >
            {detail.status === "paid" ? "待加工" : "加工中"}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">下单时间</dt>
            <dd>{fmtDateTime(detail.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">付款时间</dt>
            <dd>{fmtDateTime(detail.paidAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">处理人</dt>
            <dd>
              {detail.tracker ? (
                <>
                  {detail.tracker.name}
                  {mine && <span className="ml-1 text-primary">（我）</span>}
                </>
              ) : (
                <span className="text-muted-foreground">未认领</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">用户首选语言</dt>
            <dd>{detail.contentLang ?? "—"}</dd>
          </div>
        </dl>
      </div>

      {/* Order-level action panel */}
      <div className="bg-background rounded-2xl border border-border p-6">
        {unclaimed && (
          <button
            disabled={busy}
            onClick={() => callOrderAction("claim")}
            className="rounded-full px-6 h-11 bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"
          >
            认领此单
          </button>
        )}
        {otherClaimed && (
          <p className="text-sm text-muted-foreground">
            由{" "}
            <strong className="text-foreground">{detail.tracker?.name}</strong>{" "}
            处理中。等他完成或退回后才可接手。
          </p>
        )}
        {mine && (
          <div className="space-y-4">
            {detail.status === "paid" && (
              <button
                disabled={busy}
                onClick={() => callOrderAction("release")}
                className="rounded-full px-5 h-10 bg-background border border-border text-sm font-medium hover:bg-secondary/40 disabled:opacity-50"
              >
                退回待领（订单未开始加工才能退回）
              </button>
            )}
            <ShipForm
              allPacked={allPacked}
              busy={busy}
              agentId={agentId}
              setAgentId={setAgentId}
              agents={agents}
              trackingNumber={trackingNumber}
              setTrackingNumber={setTrackingNumber}
              onSubmit={() => void callOrderAction("ship")}
            />
            <div className="pt-3 border-t border-border">
              <a
                href={`/tracker/orders/${detail.id}/print/shipping-label`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-sm h-9 px-4 rounded-full bg-background border border-border hover:bg-secondary/40"
              >
                打印发货单（收件人地址）
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Shipping */}
      <div className="bg-background rounded-2xl border border-border p-6">
        <h2 className="text-base font-semibold mb-3">收货信息</h2>
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">收件人</dt>
            <dd>{detail.customer.recipient}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">国家 / 地区</dt>
            <dd>
              {isValidIsoCountry(detail.customer.country)
                ? `${getCountryName(detail.customer.country, "zh")} (${detail.customer.country})`
                : detail.customer.country}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">邮编</dt>
            <dd>{detail.customer.zip || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">电话</dt>
            <dd>{detail.customer.phone || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">详细地址</dt>
            <dd className="whitespace-pre-wrap">{detail.customer.address}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">
              客户邮箱（紧急联系）
            </dt>
            <dd className="font-mono text-xs">{detail.customer.email}</dd>
          </div>
        </dl>
      </div>

      {/* Items */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold px-1">
          商品（{detail.items.length} 项）
        </h2>
        {detail.items.map((it) => (
          <ItemCard
            key={it.id}
            orderId={detail.id}
            item={it}
            canActOn={mine}
            busy={busy}
            onAction={callItemAction}
          />
        ))}
      </div>
    </div>
  );
}

function SupplierBlock({
  title,
  suppliers,
  emptyText,
}: {
  title: string;
  suppliers: SupplierInfo[];
  emptyText: string;
}) {
  const supplierName = (s: SupplierInfo): string =>
    s.nameZh || s.nameEn || s.id;
  return (
    <div className="rounded-xl bg-secondary/30 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {suppliers.length === 0 ? (
        <p className="mt-1 text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="mt-1 space-y-1.5">
          {suppliers.map((s) => (
            <li key={s.id}>
              <p className="font-medium">{supplierName(s)}</p>
              <p className="text-xs text-muted-foreground">
                供应商 SKU：
                <span className="font-mono ml-1">{s.sku ?? "—"}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemCard({
  orderId,
  item,
  canActOn,
  busy,
  onAction,
}: {
  orderId: string;
  item: Item;
  canActOn: boolean;
  busy: boolean;
  onAction: (
    itemId: string,
    action: "start" | "pack" | "revert",
  ) => Promise<void>;
}) {
  const it = item;
  const missingRx = it.requiresPrescription && !it.prescription;
  const printWorkOrderHref = `/tracker/orders/${orderId}/print/work-order/${it.id}`;

  return (
    <div className="bg-background rounded-2xl border border-border p-6">
      <div className="flex items-start gap-4">
        {it.framePngUrl && (
          <img
            src={it.framePngUrl}
            alt=""
            className="w-24 h-24 object-contain rounded-lg bg-secondary/30 flex-shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="font-medium">
                {it.productName.zh} / {it.productName.en}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                型号 {it.productSlug} · 数量 ×{it.qty}
                {it.frameColorId && <> · 颜色 {it.frameColorId}</>}
              </p>
            </div>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[it.fulfillmentStatus]}`}
            >
              {STATUS_LABEL[it.fulfillmentStatus]}
            </span>
          </div>

          {/* Action buttons per item */}
          {canActOn && it.fulfillmentStatus !== "shipped" && (
            <div className="mt-3 flex flex-wrap gap-2">
              {it.fulfillmentStatus === "pending" && (
                <button
                  disabled={busy}
                  onClick={() => onAction(it.id, "start")}
                  className="rounded-full px-4 h-8 bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
                >
                  开始加工
                </button>
              )}
              {it.fulfillmentStatus === "in_progress" && (
                <>
                  <button
                    disabled={busy}
                    onClick={() => onAction(it.id, "pack")}
                    className="rounded-full px-4 h-8 bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    标记已打包
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => onAction(it.id, "revert")}
                    className="rounded-full px-4 h-8 bg-background border border-border text-xs font-medium hover:bg-secondary/40 disabled:opacity-50"
                  >
                    撤回为待处理
                  </button>
                </>
              )}
              {it.fulfillmentStatus === "packed" && (
                <button
                  disabled={busy}
                  onClick={() => onAction(it.id, "revert")}
                  className="rounded-full px-4 h-8 bg-background border border-border text-xs font-medium hover:bg-secondary/40 disabled:opacity-50"
                >
                  撤回为待处理
                </button>
              )}
              <a
                href={printWorkOrderHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-4 h-8 bg-background border border-border text-xs font-medium hover:bg-secondary/40 inline-flex items-center"
              >
                打印加工单
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Suppliers — each side may have multiple possible suppliers
          (supplier_costs_json is a multi-key JSON). We list them all and
          let the tracker pick whichever they'd contact this round. */}
      <div className="mt-5 grid sm:grid-cols-2 gap-4 text-sm">
        <SupplierBlock
          title="镜框供应商"
          suppliers={it.frameSuppliers}
          emptyText="—"
        />
        <SupplierBlock
          title="镜片供应商"
          suppliers={it.lensSuppliers}
          emptyText={it.isFrameOnly ? "无（纯镜框）" : "—"}
        />
      </div>

      {/* Lens specs */}
      {!it.isFrameOnly && (
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 mt-5 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">镜片类型</dt>
            <dd>{it.lens.category || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">折射率</dt>
            <dd>{it.lens.index}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">基础功能</dt>
            <dd>{it.lens.baseFunction || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">品牌</dt>
            <dd>
              {it.lens.brandLabel?.zh ||
                it.lens.brandLabel?.en ||
                it.lens.brandId ||
                "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">渐进等级</dt>
            <dd>{it.lens.progressiveTier || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">镜片颜色</dt>
            <dd>{it.lens.color || it.lens.colorId || "—"}</dd>
          </div>
        </dl>
      )}

      {/* Prescription */}
      {it.prescription && <PrescriptionPanel rx={it.prescription} />}
      {missingRx && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">处方缺失</p>
            <p className="text-xs text-amber-800 mt-1">
              此 item
              是带镜片的订单但没有关联处方。请联系客户确认是否需要度数（如确认无度数防蓝光等可忽略此提示）。
            </p>
          </div>
        </div>
      )}
      {it.isFrameOnly && (
        <p className="mt-3 text-xs text-muted-foreground">
          纯镜框订单，无需处方。
        </p>
      )}
    </div>
  );
}

function PrescriptionPanel({ rx }: { rx: RxData }) {
  return (
    <div className="mt-4 rounded-xl bg-secondary/40 p-4">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-sm font-medium">
          处方 {rx.label.zh || rx.label.en || rx.source}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr>
              <th className="text-left py-1 pr-3"></th>
              <th className="text-left py-1 pr-3">SPH</th>
              <th className="text-left py-1 pr-3">CYL</th>
              <th className="text-left py-1 pr-3">AXIS</th>
              <th className="text-left py-1 pr-3">ADD</th>
              <th className="text-left py-1 pr-3">PRISM</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-1 pr-3 font-medium">OD（右）</td>
              <td className="py-1 pr-3">{fmtSigned(rx.sphOd)}</td>
              <td className="py-1 pr-3">{fmtSigned(rx.cylOd)}</td>
              <td className="py-1 pr-3">{rx.axisOd ?? "—"}</td>
              <td className="py-1 pr-3">{fmtSigned(rx.addOd)}</td>
              <td className="py-1 pr-3">
                {rx.prismOd != null
                  ? `${rx.prismOd} ${rx.prismBaseOd ?? ""}`
                  : "—"}
              </td>
            </tr>
            <tr>
              <td className="py-1 pr-3 font-medium">OS（左）</td>
              <td className="py-1 pr-3">{fmtSigned(rx.sphOs)}</td>
              <td className="py-1 pr-3">{fmtSigned(rx.cylOs)}</td>
              <td className="py-1 pr-3">{rx.axisOs ?? "—"}</td>
              <td className="py-1 pr-3">{fmtSigned(rx.addOs)}</td>
              <td className="py-1 pr-3">
                {rx.prismOs != null
                  ? `${rx.prismOs} ${rx.prismBaseOs ?? ""}`
                  : "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <dl className="grid grid-cols-3 gap-x-4 gap-y-2 mt-3 text-xs">
        <div>
          <dt className="text-muted-foreground">PD 双瞳距</dt>
          <dd>{rx.pdTotal != null ? `${rx.pdTotal} mm` : "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">PD 右单</dt>
          <dd>{rx.pdOdHalf != null ? `${rx.pdOdHalf} mm` : "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">PD 左单</dt>
          <dd>{rx.pdOsHalf != null ? `${rx.pdOsHalf} mm` : "—"}</dd>
        </div>
        {rx.readerMagnification != null && (
          <div>
            <dt className="text-muted-foreground">老花放大</dt>
            <dd>+{rx.readerMagnification}</dd>
          </div>
        )}
        {rx.examDate && (
          <div>
            <dt className="text-muted-foreground">验光日期</dt>
            <dd>{new Date(rx.examDate).toISOString().slice(0, 10)}</dd>
          </div>
        )}
        {rx.source && (
          <div>
            <dt className="text-muted-foreground">来源</dt>
            <dd>{rx.source}</dd>
          </div>
        )}
      </dl>

      {rx.notes && (
        <p className="mt-3 text-xs">
          <span className="text-muted-foreground">备注：</span>
          {rx.notes}
        </p>
      )}
    </div>
  );
}

function ShipForm({
  allPacked,
  busy,
  agentId,
  setAgentId,
  agents,
  trackingNumber,
  setTrackingNumber,
  onSubmit,
}: {
  allPacked: boolean;
  busy: boolean;
  agentId: string;
  setAgentId: (v: string) => void;
  agents: LogisticsAgent[];
  trackingNumber: string;
  setTrackingNumber: (v: string) => void;
  onSubmit: () => void;
}) {
  const noAgents = agents.length === 0;
  const formDisabled = !allPacked || noAgents;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (formDisabled || !agentId.trim() || !trackingNumber.trim()) return;
        onSubmit();
      }}
      className="space-y-3 max-w-xl"
    >
      <h3 className="text-sm font-medium">整单发货</h3>
      {!allPacked && (
        <p className="text-xs text-muted-foreground">
          所有 item 都标记为「已打包」后才能发货。
        </p>
      )}
      {allPacked && noAgents && (
        <p className="text-xs text-amber-700">
          没有可用的货代代理。请去{" "}
          <a href="/admin/suppliers-logistics" className="underline">
            /admin/logistics-contacts
          </a>{" "}
          添加（需要管理员权限）。
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            货代代理
          </span>
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="mt-1.5 w-full h-11 px-4 rounded-xl border border-border focus:border-primary/40 outline-none bg-background"
            disabled={formDisabled}
          >
            <option value="">— 选择 —</option>
            {agents.map((a) => {
              const supplier =
                a.supplier_name_zh || a.supplier_name_en || a.supplier_id;
              const label = `${supplier} — ${a.agent_name}`;
              return (
                <option key={a.agent_id} value={a.agent_id}>
                  {label}
                </option>
              );
            })}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            运单号
          </span>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="跟踪号"
            className="mt-1.5 w-full h-11 px-4 rounded-xl border border-border focus:border-primary/40 outline-none bg-background"
            disabled={formDisabled}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={
          busy || formDisabled || !agentId.trim() || !trackingNumber.trim()
        }
        className="rounded-full px-6 h-11 bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "提交中..." : "标记整单发货"}
      </button>
    </form>
  );
}
