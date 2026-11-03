// Shared editor for the supplier_costs_json column shape used by both
// lens_skus and products. Each row = one (sales SKU × supplier) tuple
// holding cost_cny_cents + supplier_sku_code; "+ add supplier" picker
// shows suppliers not yet attached.
//
// The caller owns fetching the suppliers list (lens_suppliers vs
// frame_suppliers) and passes it in as `suppliers`.

export interface SupplierLite {
  id: string;
  name_zh: string | null;
  name_en: string | null;
  active: number;
}

export interface SupplierCostEntry {
  cost_cny_cents: number | null;
  supplier_sku_code: string | null;
  /** Default true. false = 该供应商不再为此 SKU 供货，但保留在 JSON 中
      （历史订单 / 复盘可追溯）。绝不允许从 JSON 中硬删除。 */
  active?: boolean;
}

interface Props {
  /** May arrive `undefined` from a stale form-draft snapshot — tolerate it. */
  value: Record<string, SupplierCostEntry> | undefined;
  suppliers: SupplierLite[];
  onChange: (next: Record<string, SupplierCostEntry>) => void;
}

const inputCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

export function SupplierCostsEditor({ value, suppliers, onChange }: Props) {
  const map = value ?? {};
  const entries = Object.entries(map);
  const used = new Set(entries.map(([id]) => id));
  const available = suppliers.filter((s) => !used.has(s.id) && s.active === 1);

  const setEntry = (id: string, patch: Partial<SupplierCostEntry>) => {
    onChange({ ...map, [id]: { ...map[id], ...patch } });
  };
  const setActive = (id: string, active: boolean) => {
    setEntry(id, { active });
  };
  const addEntry = (id: string) => {
    if (!id) return;
    // Default new attachments to active=true; existing inactive entries
    // are kept in the map so they can be reactivated rather than re-added.
    onChange({
      ...map,
      [id]: { cost_cny_cents: null, supplier_sku_code: null, active: true },
    });
  };

  // Entries pointing to a globally-deactivated supplier are hidden from
  // the editor entirely (per user spec): the JSON record stays for
  // historical-order traceability, but admin shouldn't be tempted to edit
  // costs against a supplier we no longer engage with. Re-activate the
  // supplier in /admin/{lens,frame}-suppliers to bring it back into view.
  const visibleEntries = entries.filter(([supplierId]) => {
    const sup = suppliers.find((s) => s.id === supplierId);
    return !sup || sup.active === 1; // unknown sup → still show w/ deleted warning
  });
  const hiddenCount = entries.length - visibleEntries.length;

  return (
    <div className="space-y-3">
      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          尚未挂任何供应商。
        </p>
      )}
      {visibleEntries.map(([supplierId, entry]) => {
        const sup = suppliers.find((s) => s.id === supplierId);
        const label = sup ? (sup.name_en ?? sup.name_zh ?? sup.id) : supplierId;
        const costYuan =
          entry.cost_cny_cents == null
            ? ""
            : (entry.cost_cny_cents / 100).toString();
        const isActive = entry.active !== false;
        return (
          <div
            key={supplierId}
            className={`grid grid-cols-1 gap-3 rounded-md border p-3 md:grid-cols-[2fr_1fr_2fr_auto] md:items-end ${
              isActive
                ? "border-border bg-background"
                : "border-dashed border-muted-foreground/30 bg-muted/30 opacity-70"
            }`}
          >
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                供应商
              </span>
              <p className="text-sm font-medium">
                {label}
                {!isActive && (
                  <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    已停止供货
                  </span>
                )}
                {!sup && (
                  <span className="ml-2 text-xs text-destructive">
                    (供应商表已删除)
                  </span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                成本 (CNY)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costYuan}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "")
                    return setEntry(supplierId, { cost_cny_cents: null });
                  const n = Math.round(parseFloat(v) * 100);
                  setEntry(supplierId, {
                    cost_cny_cents: Number.isFinite(n) ? n : null,
                  });
                }}
                placeholder="例如 44 或 44.50"
                className={inputCls}
                disabled={!isActive}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                供应商内部 SKU
              </label>
              <input
                value={entry.supplier_sku_code ?? ""}
                onChange={(e) =>
                  setEntry(supplierId, {
                    supplier_sku_code: e.target.value || null,
                  })
                }
                placeholder="例如 60AS（开进货单时填）"
                className={inputCls}
                disabled={!isActive}
              />
            </div>
            {isActive ? (
              <button
                type="button"
                onClick={() => setActive(supplierId, false)}
                className="h-9 rounded-md border border-border px-3 text-xs hover:bg-secondary"
                title="标记此供应商不再为此 SKU 供货；记录保留供历史订单追溯。"
              >
                停止供货
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActive(supplierId, true)}
                className="h-9 rounded-md border border-primary/40 px-3 text-xs text-primary hover:bg-primary/10"
              >
                恢复供货
              </button>
            )}
          </div>
        );
      })}

      {available.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          <select
            value=""
            onChange={(e) => addEntry(e.target.value)}
            className="h-9 max-w-xs rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">＋ 添加供应商...</option>
            {available.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name_en ?? s.name_zh ?? s.id}
              </option>
            ))}
          </select>
        </div>
      )}
      {available.length === 0 && visibleEntries.length > 0 && (
        <p className="text-xs text-muted-foreground">
          所有可用供应商都已挂上。
        </p>
      )}
      {hiddenCount > 0 && (
        <p className="text-xs text-muted-foreground">
          另有 {hiddenCount} 条记录指向已停用的供应商，已从此处隐藏（保留在 JSON
          中以备追溯）。
        </p>
      )}
    </div>
  );
}
