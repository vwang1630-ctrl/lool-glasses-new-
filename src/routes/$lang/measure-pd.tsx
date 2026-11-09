import { createFileRoute } from "@tanstack/react-router";
import { pageDesc, pageOgDesc } from "@/lib/page-descriptions";
import { pageTitle } from "@/lib/page-titles";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";
import { PdMeasureTool } from "@/components/pd/PdMeasureTool";

export const Route = createFileRoute("/$lang/measure-pd")({
  head: ({ params }) => ({
    meta: [
      { title: pageTitle("measurePd", params.lang) },
      {
        name: "description",
        content:
          pageDesc("measurePd", params.lang),
      },
      { property: "og:description", content: pageOgDesc("measurePd", params.lang) },
      { name: "twitter:description", content: pageOgDesc("measurePd", params.lang) },
    ],
  }),
  component: MeasurePDPage,
});

function MeasurePDPage() {
  const { lang } = useI18n();
  const c = getInfoContent("measure-pd", lang);
  return (
    <InfoPage
      eyebrow={c.eyebrow}
      title={c.title}
      intro={c.intro}
      sections={c.sections}
      // The design's "Use the digital PD tool" CTA used to link back to this
      // same page; it now scrolls up to the camera tool.
      cta={c.cta ? { ...c.cta, to: "#pd-tool" } : undefined}
    >
      <PdMeasureTool />
    </InfoPage>
  );
}
