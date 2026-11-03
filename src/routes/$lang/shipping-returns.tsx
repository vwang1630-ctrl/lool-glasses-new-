import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/shipping-returns")({
  head: () => ({
    meta: [
      { title: "lool — Shipping & Returns" },
      {
        name: "description",
        content:
          "Free tracked shipping on orders over $69, 365-day quality warranty, and 30-day free returns & exchanges for non-prescription glasses. Policy v1.1, effective 2026-10-08.",
      },
    ],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  const { lang } = useI18n();
  const c = getInfoContent("shipping-returns", lang);
  return (
    <InfoPage
      eyebrow={c.eyebrow}
      title={c.title}
      intro={c.intro}
      sections={c.sections}
      cta={c.cta}
    />
  );
}
