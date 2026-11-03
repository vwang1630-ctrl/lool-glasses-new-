import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/layout/InfoPage";
import { getInfoContent } from "@/lib/info-content";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/accessibility")({
  head: () => ({
    meta: [
      { title: "lool — Accessibility" },
      {
        name: "description",
        content:
          "lool is committed to making lool.com accessible to all users, including people with disabilities, and uses WCAG 2.1 AA as an accessibility target.",
      },
    ],
  }),
  component: AccessibilityPage,
});

function AccessibilityPage() {
  const { lang } = useI18n();
  const c = getInfoContent("accessibility", lang);
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
