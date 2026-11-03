// Shared suppliers CRUD component. All four admin supplier pages back the
// same merged `suppliers` table (post-0065) via /api/admin/suppliers, just
// scoped to different kinds:
//   - /admin/suppliers-product   → kindSet ∈ {lens, frame, both}  (allowKindSelect)
//   - /admin/suppliers-payment   → kindSet = {payment}
//   - /admin/suppliers-logistics → kindSet = {logistics}
//
// Pass `kindSet` + `defaultKind`; set `allowKindSelect` to expose a kind
// dropdown when more than one kind is in scope. Common columns:
//   id, name_zh, name_en, kind, contact_person, contact_email, contact_phone,
//   shipping_address, payment_terms, lead_time_days, notes, config_json,
//   active, sort_order.

import { Fragment, useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  Save,
  X,
  Pencil,
  Archive,
  ArchiveRestore,
} from "lucide-react";

export type SupplierKind =
  | "lens"
  | "frame"
  | "both"
  | "accessory"
  | "payment"
  | "logistics";

export interface Supplier {
  id: string;
  name_zh: string;
  name_en: string;
  /** Optional — only present on the `suppliers` table, not on lens_suppliers / frame_suppliers. */
  kind?: SupplierKind;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  shipping_address: string | null;
  payment_terms: string | null;
  lead_time_days: number | null;
  notes: string | null;
  config_json: string | null;
  active: number;
  sort_order: number;
}

interface Props {
  title: string;
  description: string;
  /** Default `/api/admin/suppliers`. Pass a sibling endpoint for the
      lens_suppliers / frame_suppliers tables (no `kind` column). */
  endpoint?: string;
  /** Required if the table has a `kind` column. Skip for lens/frame. */
  kindSet?: SupplierKind[];
  defaultKind?: SupplierKind;
  allowKindSelect?: boolean;
  /** Logistics carriers don't carry a single contact_person — they have a
      separate logistics agent directory (see /admin/logistics-contacts). Hide the
      contact_person/contact_email/contact_phone columns and form fields
      when true. */
  hideContactFields?: boolean;
}

const inputCls =
  "h-8 w-full rounded border border-input bg-background px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";
const textareaCls =
  "w-full rounded border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";
const monoTextareaCls =
  "w-full rounded border border-input bg-background px-2 py-1.5 text-xs font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

function validateJsonOrNull(
  s: string,
): { ok: true; value: string | null } | { ok: false; reason: string } {
  const trimmed = s.trim();
  if (trimmed === "") return { ok: true, value: null };
  try {
    JSON.parse(trimmed);
    return { ok: true, value: trimmed };
  } catch (e) {
    return {
      ok: false,
      reason: e instanceof Error ? e.message : "invalid JSON",
    };
  }
}

export function SuppliersCRUD({
  title,
  description,
  endpoint = "/api/admin/suppliers",
  kindSet,
  defaultKind,
  allowKindSelect,
  hideContactFields,
}: Props) {
  const [items, setItems] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Supplier | null>(null);
  const [draftConfig, setDraftConfig] = useState("");

  const [creating, setCreating] = useState(false);
  const [newId, setNewId] = useState("");
  const [newNameEn, setNewNameEn] = useState("");
  const [newNameZh, setNewNameZh] = useState("");
  const [newKind, setNewKind] = useState<SupplierKind | undefined>(defaultKind);
  const [newPerson, setNewPerson] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newShippingAddress, setNewShippingAddress] = useState("");
  const [newPaymentTerms, setNewPaymentTerms] = useState("");
  const [newLeadTime, setNewLeadTime] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newConfig, setNewConfig] = useState("");
  const [createBusy, setCreateBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (showInactive) params.set("inactive", "1");
      const r = await fetch(`${endpoint}?${params}`, {
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as { suppliers: Supplier[] };
      // Tables without a `kind` column return rows with `kind: undefined`,
      // so the filter only kicks in on the original `suppliers` endpoint.
      setItems(
        kindSet
          ? d.suppliers.filter((s) => s.kind && kindSet.includes(s.kind))
          : d.suppliers,
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [showInactive]);

  const startEdit = (s: Supplier) => {
    setEditingId(s.id);
    setDraft({ ...s });
    setDraftConfig(s.config_json ?? "");
    setErr(null);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
    setDraftConfig("");
  };

  const saveEdit = async () => {
    if (!draft) return;
    setErr(null);
    const cfg = validateJsonOrNull(draftConfig);
    if (!cfg.ok) {
      setErr(`config_json 不是合法 JSON：${cfg.reason}`);
      return;
    }
    try {
      const res = await fetch(`${endpoint}/${draft.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_zh: draft.name_zh,
          name_en: draft.name_en,
          ...(kindSet && draft.kind ? { kind: draft.kind } : {}),
          contact_person: draft.contact_person,
          contact_email: draft.contact_email,
          contact_phone: draft.contact_phone,
          shipping_address: draft.shipping_address,
          payment_terms: draft.payment_terms,
          lead_time_days: draft.lead_time_days,
          notes: draft.notes,
          config_json: cfg.value,
          active: draft.active === 1,
          sort_order: draft.sort_order,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        setErr(data.message ?? data.error ?? "保存失败");
        return;
      }
      await load();
      cancelEdit();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const archive = async (id: string) => {
    if (!confirm("停用此供应商？")) return;
    await fetch(`${endpoint}/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    load();
  };
  const restore = async (id: string) => {
    await fetch(`${endpoint}/${id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true }),
    });
    load();
  };
  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!/^[a-z0-9][a-z0-9-]{0,40}$/.test(newId.trim()))
      return setErr("ID 需是小写字母/数字/短横线");
    if (!newNameEn.trim() || !newNameZh.trim()) return setErr("中英文名都必填");
    const cfg = validateJsonOrNull(newConfig);
    if (!cfg.ok) {
      setErr(`config_json 不是合法 JSON：${cfg.reason}`);
      return;
    }
    setCreateBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newId.trim(),
          ...(kindSet ? { kind: newKind } : {}),
          name_en: newNameEn.trim(),
          name_zh: newNameZh.trim(),
          contact_person: newPerson.trim() || null,
          contact_email: newEmail.trim() || null,
          contact_phone: newPhone.trim() || null,
          shipping_address: newShippingAddress.trim() || null,
          payment_terms: newPaymentTerms.trim() || null,
          lead_time_days:
            newLeadTime.trim() === "" ? null : Number(newLeadTime),
          notes: newNotes.trim() || null,
          config_json: cfg.value,
          active: true,
          sort_order: items.length * 10,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        setErr(data.message ?? data.error ?? "创建失败");
        setCreateBusy(false);
        return;
      }
      setCreating(false);
      setNewId("");
      setNewNameEn("");
      setNewNameZh("");
      setNewPerson("");
      setNewEmail("");
      setNewPhone("");
      setNewShippingAddress("");
      setNewPaymentTerms("");
      setNewLeadTime("");
      setNewNotes("");
      setNewConfig("");
      setNewKind(defaultKind);
      await load();
    } finally {
      setCreateBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            新建
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-input"
          />
          显示停用
        </label>
        <div className="ml-auto text-sm text-muted-foreground">
          共 {items.length} 条
        </div>
      </div>

      {err && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      {creating && (
        <form
          onSubmit={submitCreate}
          className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-soft"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                ID *
              </label>
              <input
                value={newId}
                onChange={(e) => setNewId(e.target.value.toLowerCase())}
                placeholder="acme-frames"
                className={inputCls}
                autoFocus
              />
            </div>
            {allowKindSelect && (
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  类型
                </label>
                <select
                  value={newKind}
                  onChange={(e) => setNewKind(e.target.value as SupplierKind)}
                  className={inputCls}
                >
                  {kindSet.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                英文名 *
              </label>
              <input
                value={newNameEn}
                onChange={(e) => setNewNameEn(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                中文名 *
              </label>
              <input
                value={newNameZh}
                onChange={(e) => setNewNameZh(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div
            className={`grid grid-cols-1 gap-3 ${
              hideContactFields ? "md:grid-cols-1" : "md:grid-cols-4"
            }`}
          >
            {!hideContactFields && (
              <>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    联系人
                  </label>
                  <input
                    value={newPerson}
                    onChange={(e) => setNewPerson(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    电话
                  </label>
                  <input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </>
            )}
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                交期 (天)
              </label>
              <input
                type="number"
                value={newLeadTime}
                onChange={(e) => setNewLeadTime(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                付款条件
              </label>
              <input
                value={newPaymentTerms}
                onChange={(e) => setNewPaymentTerms(e.target.value)}
                placeholder="NET30 / COD / prepaid"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                收货地址
              </label>
              <input
                value={newShippingAddress}
                onChange={(e) => setNewShippingAddress(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              备注
            </label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={2}
              className={textareaCls}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              config_json — provider-specific 元数据，必须是合法 JSON（payment
              供应商：账号邮箱 / 货币；logistics：tracking_url 模板）
            </label>
            <textarea
              value={newConfig}
              onChange={(e) => setNewConfig(e.target.value)}
              rows={4}
              placeholder={
                '{"provider":"stripe","account_id":"acct_xxx","account_email":"name@example.com"}'
              }
              className={monoTextareaCls}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="submit"
              disabled={createBusy}
              className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {createBusy ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              创建
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="flex h-8 items-center gap-1 rounded-md border border-border px-3 text-xs hover:bg-secondary"
            >
              <X className="h-3 w-3" />
              取消
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">英文名</th>
              <th className="px-4 py-3">中文名</th>
              {allowKindSelect && <th className="px-4 py-3">类型</th>}
              {!hideContactFields && (
                <>
                  <th className="px-4 py-3">联系人</th>
                  <th className="px-4 py-3">邮箱</th>
                  <th className="px-4 py-3">电话</th>
                </>
              )}
              <th className="px-4 py-3">交期(天)</th>
              <th className="px-4 py-3 text-right">排序</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3 w-32 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(() => {
              // id, name_en, name_zh, lead_time, sort, status, ops = 7
              // + 1 if allowKindSelect, + 3 if contact fields shown.
              const cs =
                7 + (allowKindSelect ? 1 : 0) + (hideContactFields ? 0 : 3);
              return loading ? (
                <tr>
                  <td colSpan={cs} className="py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={cs}
                    className="py-12 text-center text-muted-foreground"
                  >
                    暂无数据
                  </td>
                </tr>
              ) : null;
            })()}
            {!loading &&
              items.length > 0 &&
              items.map((s) =>
                editingId === s.id && draft ? (
                  <Fragment key={s.id}>
                    <tr className="bg-secondary/20">
                      <td className="px-4 py-2 font-mono text-xs">{s.id}</td>
                      <td className="px-4 py-2">
                        <input
                          value={draft.name_en}
                          onChange={(e) =>
                            setDraft({ ...draft, name_en: e.target.value })
                          }
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={draft.name_zh}
                          onChange={(e) =>
                            setDraft({ ...draft, name_zh: e.target.value })
                          }
                          className={inputCls}
                        />
                      </td>
                      {allowKindSelect && (
                        <td className="px-4 py-2">
                          <select
                            value={draft.kind}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                kind: e.target.value as SupplierKind,
                              })
                            }
                            className={inputCls}
                          >
                            {kindSet.map((k) => (
                              <option key={k} value={k}>
                                {k}
                              </option>
                            ))}
                          </select>
                        </td>
                      )}
                      {!hideContactFields && (
                        <>
                          <td className="px-4 py-2">
                            <input
                              value={draft.contact_person ?? ""}
                              onChange={(e) =>
                                setDraft({
                                  ...draft,
                                  contact_person: e.target.value || null,
                                })
                              }
                              className={inputCls}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="email"
                              value={draft.contact_email ?? ""}
                              onChange={(e) =>
                                setDraft({
                                  ...draft,
                                  contact_email: e.target.value || null,
                                })
                              }
                              className={inputCls}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              value={draft.contact_phone ?? ""}
                              onChange={(e) =>
                                setDraft({
                                  ...draft,
                                  contact_phone: e.target.value || null,
                                })
                              }
                              className={inputCls}
                            />
                          </td>
                        </>
                      )}
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={draft.lead_time_days ?? ""}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              lead_time_days:
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value),
                            })
                          }
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={draft.sort_order}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              sort_order: Number(e.target.value) || 0,
                            })
                          }
                          className={inputCls}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <label className="flex items-center gap-1.5 text-xs">
                          <input
                            type="checkbox"
                            checked={draft.active === 1}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                active: e.target.checked ? 1 : 0,
                              })
                            }
                          />
                          启用
                        </label>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={saveEdit}
                          className="mr-1 inline-flex h-7 items-center gap-1 rounded bg-primary px-2 text-xs text-primary-foreground hover:bg-primary/90"
                        >
                          <Save className="h-3 w-3" />
                          保存
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="inline-flex h-7 items-center gap-1 rounded border border-border px-2 text-xs hover:bg-secondary"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                    <tr className="bg-secondary/20">
                      <td
                        colSpan={
                          7 +
                          (allowKindSelect ? 1 : 0) +
                          (hideContactFields ? 0 : 3)
                        }
                        className="px-4 pb-3 pt-0"
                      >
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs text-muted-foreground">
                              付款条件
                            </label>
                            <input
                              value={draft.payment_terms ?? ""}
                              onChange={(e) =>
                                setDraft({
                                  ...draft,
                                  payment_terms: e.target.value || null,
                                })
                              }
                              placeholder="NET30 / COD / prepaid"
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-muted-foreground">
                              收货地址
                            </label>
                            <input
                              value={draft.shipping_address ?? ""}
                              onChange={(e) =>
                                setDraft({
                                  ...draft,
                                  shipping_address: e.target.value || null,
                                })
                              }
                              className={inputCls}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="mb-1 block text-xs text-muted-foreground">
                              备注
                            </label>
                            <textarea
                              value={draft.notes ?? ""}
                              onChange={(e) =>
                                setDraft({
                                  ...draft,
                                  notes: e.target.value || null,
                                })
                              }
                              rows={2}
                              className={textareaCls}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="mb-1 block text-xs text-muted-foreground">
                              config_json — provider 元数据 (合法 JSON)
                            </label>
                            <textarea
                              value={draftConfig}
                              onChange={(e) => setDraftConfig(e.target.value)}
                              rows={4}
                              placeholder={
                                '{"provider":"stripe","account_id":"acct_xxx","account_email":"name@example.com"}'
                              }
                              className={monoTextareaCls}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                ) : (
                  <tr key={s.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                    <td className="px-4 py-3 font-medium">{s.name_en}</td>
                    <td className="px-4 py-3">{s.name_zh}</td>
                    {allowKindSelect && (
                      <td className="px-4 py-3 text-xs">
                        <span className="rounded bg-secondary px-2 py-0.5">
                          {s.kind}
                        </span>
                      </td>
                    )}
                    {!hideContactFields && (
                      <>
                        <td className="px-4 py-3 text-xs">
                          {s.contact_person ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {s.contact_email ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {s.contact_phone ?? "—"}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-xs tabular-nums">
                      {s.lead_time_days ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-xs">
                      {s.sort_order}
                    </td>
                    <td className="px-4 py-3">
                      {s.active === 1 ? (
                        <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          启用
                        </span>
                      ) : (
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          停用
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => startEdit(s)}
                        className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                        title="编辑"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {s.active === 1 ? (
                        <button
                          onClick={() => archive(s.id)}
                          className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="停用"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => restore(s.id)}
                          className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="重新启用"
                        >
                          <ArchiveRestore className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ),
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
