import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/shipping-returns")({
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("shippingReturns", params.lang) },
      {
        name: "description",
        content:
          pageDesc("shippingReturns", params.lang),
      },
      { property: "og:description", content: pageOgDesc("shippingReturns", params.lang) },
      { name: "twitter:description", content: pageOgDesc("shippingReturns", params.lang) },
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
