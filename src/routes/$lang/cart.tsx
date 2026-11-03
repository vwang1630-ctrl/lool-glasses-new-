import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/lib/i18n";
import { pickLang } from "@/lib/lang";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, Truck, PartyPopper, Check } from "lucide-react";

export const Route = createFileRoute("/$lang/cart")({
  head: () => ({ meta: [{ title: "lool — Cart" }] }),
  component: CartPage,
});

function CartPage() {
  const {
    items,
    remove,
    setQty,
    isSelected,
    toggleSelected,
    selectedItems,
    selectedSubtotal,
  } = useCart();
  const { t, lang, contentLang } = useI18n();
  const navigate = useNavigate();
  const FREE_SHIP_THRESHOLD = 69;
  // All money rows use the SELECTED-items subtotal — unticked rows are still
  // in the cart but don't count toward this checkout.
  const subtotal = selectedSubtotal;
  const shipping = subtotal > 0 ? (subtotal >= FREE_SHIP_THRESHOLD ? 0 : 8) : 0;
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);
  const reached = subtotal >= FREE_SHIP_THRESHOLD;
  const tax = +(subtotal * 0.05).toFixed(2);
  const total = subtotal + shipping + tax;
  const selectedCount = selectedItems.length;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold font-display">
          {t("cart.empty")}
        </h1>
        <Button asChild className="mt-6 rounded-full px-7 h-11">
          <Link to="/presbyopia">{t("cart.emptyCta")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <section className="page-hero">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 pt-10 pb-10 md:pt-14 md:pb-12">
          <h1 className="section-title">{t("cart.title")}</h1>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-6 lg:px-8 py-12 grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-4">
          {items.map((it) => {
            const selected = isSelected(it.product.id);
            return (
              <div
                key={it.product.id}
                className={`flex gap-3 p-4 rounded-2xl bg-card shadow-card transition-smooth ${selected ? "" : "opacity-60"}`}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  aria-label={t("cart.select.item")}
                  onClick={() => toggleSelected(it.product.id)}
                  className={`self-center flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-smooth ${
                    selected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/60"
                  }`}
                >
                  {selected && <Check className="w-3 h-3" strokeWidth={3} />}
                </button>
                <div
                  className={`w-24 h-24 rounded-xl flex-shrink-0 overflow-hidden ${it.product.categories.includes("presbyopia") ? "bg-gradient-presbyopia" : "bg-gradient-myopia"}`}
                >
                  <img
                    src={it.product.framePng}
                    alt=""
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="font-medium">
                        {pickLang(it.product.name, contentLang)}
                      </h3>
                      {it.product.fashion && (
                        <span className="text-[10px] text-primary uppercase tracking-wider">
                          {t("product.fashionTag")}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {it.lens.type} · {it.lens.index}
                      </p>
                    </div>
                    <p className="font-semibold whitespace-nowrap">
                      ${(it.product.priceUSD + it.lens.extraUSD) * it.qty}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center border border-border rounded-full">
                      <button
                        onClick={() => setQty(it.product.id, it.qty - 1)}
                        className="p-2 hover:bg-secondary rounded-l-full"
                        aria-label="decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-sm w-8 text-center">
                        {it.qty}
                      </span>
                      <button
                        onClick={() => setQty(it.product.id, it.qty + 1)}
                        className="p-2 hover:bg-secondary rounded-r-full"
                        aria-label="increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(it.product.id)}
                      className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> {t("cart.remove")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start rounded-2xl bg-secondary/40 p-6 space-y-3 h-fit">
          <div className="rounded-xl bg-background/70 border border-border p-3.5 mb-1">
            <div className="flex items-start gap-2.5">
              <span
                className={`flex-shrink-0 w-7 h-7 rounded-full inline-flex items-center justify-center ${reached ? "bg-primary/15 text-primary" : "bg-primary/10 text-primary"}`}
              >
                {reached ? (
                  <PartyPopper className="w-3.5 h-3.5" />
                ) : (
                  <Truck className="w-3.5 h-3.5" />
                )}
              </span>
              <p className="text-xs leading-relaxed text-foreground">
                {reached
                  ? (() => {
                      const [pre, post] = t("cart.shipping.unlocked").split(
                        "{bold}",
                      );
                      return (
                        <>
                          {pre}
                          <span className="font-semibold text-primary">
                            {t("cart.shipping.unlocked.bold")}
                          </span>
                          {post}
                        </>
                      );
                    })()
                  : (() => {
                      const [pre, post] = t("cart.shipping.addMore").split(
                        "{amount}",
                      );
                      return (
                        <>
                          {pre}
                          <span className="font-semibold text-primary">
                            ${remaining.toFixed(2)}
                          </span>
                          {post}
                        </>
                      );
                    })()}
              </p>
            </div>
            <div className="mt-2.5 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-[width] duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <Row label={t("cart.subtotal")} value={`$${subtotal.toFixed(2)}`} />
          <Row
            label={t("cart.shipping")}
            value={shipping === 0 ? t("cart.free") : `$${shipping}`}
          />
          <Row label={t("cart.tax")} value={`$${tax.toFixed(2)}`} />
          <div className="border-t border-border pt-3">
            <Row label={t("cart.total")} value={`$${total.toFixed(2)}`} bold />
          </div>
          <Button
            onClick={() => navigate({ to: `/${lang}/checkout` })}
            disabled={selectedCount === 0}
            className="w-full mt-3 rounded-full h-11 shadow-soft"
          >
            {selectedCount === 0
              ? t("cart.checkout.empty")
              : `${t("cart.checkout")} · ${t("cart.checkout.count").replace("{n}", String(selectedCount))}`}
          </Button>
          <Button asChild variant="ghost" className="w-full rounded-full h-11">
            <Link to="/presbyopia">{t("cart.continue")}</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex justify-between text-sm ${bold ? "font-semibold text-base" : "text-foreground/80"}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
