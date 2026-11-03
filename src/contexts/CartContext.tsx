import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Product } from "@/data/products";
import type { RxSnapshot } from "@/lib/rx-snapshot";
import { trackCustomerEvent } from "@/lib/customer-audit";

export interface CartItem {
  product: Product;
  qty: number;
  // Real-DB references populated by PDP / Wizard so checkout can build a
  // valid POST /api/orders payload. All optional — undefined sends the
  // item through the frame-only branch on the orders API. Legacy carts
  // persisted in localStorage before this rollout simply won't have them.
  colorId?: string;
  lensSkuId?: string;
  lensColorId?: string;
  prescriptionId?: string;
  // Frozen at addToCart from the wizard's working rx state. Sent through
  // checkout so the tracker UI sees concrete diopters/PD on every order,
  // not just orders linked to a saved /account prescription.
  rxSnapshot?: RxSnapshot;
  lens: {
    // wizard LensCategory: single | progressive | readingReady | readingCustom | plano
    // (frame-only carts use "single" with extraUSD 0)
    type: string;
    // wizard LensIndexId: 1.56 | 1.61 | 1.67 | 1.74
    index: string;
    // Historical field name. For wizard-created cart rows this is the full
    // selected lens SKU retail price in USD, not just an upgrade delta.
    extraUSD: number;
  };
}

interface CartCtx {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  // Per-item selection. Only ticked items count toward the summary and get
  // POSTed at checkout; unticked items stay in the cart for next time. A
  // newly-added item is auto-selected so the natural "PDP → cart → checkout"
  // path is still a one-click checkout.
  selectedIds: string[];
  isSelected: (productId: string) => boolean;
  toggleSelected: (productId: string) => void;
  selectedItems: CartItem[];
  selectedSubtotal: number;
  removeSelected: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

const SELECTED_KEY = "lool-cart-selected-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    let parsedItems: CartItem[] = [];
    try {
      const raw = localStorage.getItem("lool-cart");
      parsedItems = raw ? (JSON.parse(raw) as CartItem[]) : [];
      setItems(parsedItems);
      const rawSel = localStorage.getItem(SELECTED_KEY);
      if (rawSel) {
        const parsed = JSON.parse(rawSel);
        if (Array.isArray(parsed)) {
          // Drop any selection ids that no longer match a cart row.
          const valid = new Set(parsedItems.map((i) => i.product.id));
          setSelectedIds(
            parsed.filter(
              (id: unknown): id is string =>
                typeof id === "string" && valid.has(id),
            ),
          );
        } else {
          // No prior selection state (or corrupt) → default to "all ticked" so
          // the legacy "open cart → checkout" flow stays a single click.
          setSelectedIds(parsedItems.map((i) => i.product.id));
        }
      } else {
        setSelectedIds(parsedItems.map((i) => i.product.id));
      }
    } catch {
      /* ignore corrupt/unavailable localStorage */
    }

    // Refresh stale product snapshots from /api/catalog. The cart row is
    // persisted at addToCart time — if D1 then gains new langs (vi/th/id/ms
    // added later), the user's saved cart still shows the old en/zh-only
    // name. On mount, fetch fresh products and rewrite each row's `product`
    // field so the next render picks up the latest name_json / colors etc.
    if (parsedItems.length === 0) return;
    let cancelled = false;
    fetch("/api/catalog")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          data: {
            products?: Array<{ slug: string; name: Record<string, string> }>;
          } | null,
        ) => {
          if (cancelled || !data?.products) return;
          const bySlug = new Map(data.products.map((p) => [p.slug, p]));
          setItems((prev) =>
            prev.map((it) => {
              const fresh = bySlug.get(it.product.slug);
              if (!fresh) return it;
              // Only refresh fields safe to overwrite: name (i18n), description,
              // hightlights — pricing / slug / id / framePng stay frozen.
              return {
                ...it,
                product: {
                  ...it.product,
                  name: { ...it.product.name, ...fresh.name },
                },
              };
            }),
          );
        },
      )
      .catch(() => {
        /* offline / network — keep stale snapshot, harmless */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("lool-cart", JSON.stringify(items));
    } catch {
      /* ignore corrupt/unavailable localStorage */
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_KEY, JSON.stringify(selectedIds));
    } catch {
      /* ignore */
    }
  }, [selectedIds]);

  const add = (item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === item.product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + item.qty };
        return copy;
      }
      return [...prev, item];
    });
    setSelectedIds((s) =>
      s.includes(item.product.id) ? s : [...s, item.product.id],
    );
    trackCustomerEvent({
      action: "CART_ADD",
      resourceType: "product",
      resourceId: item.product.id,
      meta: {
        slug: item.product.slug,
        qty: item.qty,
        colorId: item.colorId ?? null,
        lensSkuId: item.lensSkuId ?? null,
      },
    });
  };

  const remove = (id: string) => {
    const item = items.find((i) => i.product.id === id);
    setItems((p) => p.filter((i) => i.product.id !== id));
    setSelectedIds((s) => s.filter((x) => x !== id));
    trackCustomerEvent({
      action: "CART_REMOVE",
      resourceType: "product",
      resourceId: id,
      meta: { slug: item?.product.slug ?? null },
    });
  };
  const setQty = (id: string, qty: number) => {
    const nextQty = Math.max(1, Math.min(10, qty));
    setItems((p) =>
      p.map((i) => (i.product.id === id ? { ...i, qty: nextQty } : i)),
    );
    trackCustomerEvent({
      action: "CART_QTY",
      resourceType: "product",
      resourceId: id,
      meta: { qty: nextQty },
    });
  };
  const clear = () => {
    setItems([]);
    setSelectedIds([]);
  };

  const isSelected = (id: string) => selectedIds.includes(id);
  const toggleSelected = (id: string) =>
    setSelectedIds((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  // Post-checkout: drop just the rows that were paid for. Unticked items
  // survive so a buyer who only paid for one of two frames still has the
  // other one waiting.
  const removeSelected = () => {
    setItems((p) => p.filter((i) => !selectedIds.includes(i.product.id)));
    setSelectedIds([]);
  };

  const selectedItems = items.filter((i) => selectedIds.includes(i.product.id));

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce(
    (s, i) => s + (i.product.priceUSD + i.lens.extraUSD) * i.qty,
    0,
  );
  const selectedSubtotal = selectedItems.reduce(
    (s, i) => s + (i.product.priceUSD + i.lens.extraUSD) * i.qty,
    0,
  );

  return (
    <Ctx.Provider
      value={{
        items,
        add,
        remove,
        setQty,
        clear,
        count,
        subtotal,
        selectedIds,
        isSelected,
        toggleSelected,
        selectedItems,
        selectedSubtotal,
        removeSelected,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
