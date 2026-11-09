// Small helper under the wizard's PD field: link to the camera tool (new tab,
// so the wizard keeps its state) and a one-click fill once a PD was measured.
import { Ruler } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { useMeasuredPd, type MeasuredPd } from "@/lib/measured-pd";
import { pdStrings } from "@/lib/pd-tool-i18n";

export function PdWizardHelper({
  lang,
  onUse,
}: {
  lang: Lang;
  onUse: (m: MeasuredPd) => void;
}) {
  const s = pdStrings(lang);
  const m = useMeasuredPd();
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      {m && (
        <button
          type="button"
          onClick={() => onUse(m)}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 font-medium text-primary hover:bg-primary/10"
        >
          {s.wizUseSaved.replace("{pd}", m.pd.toFixed(1))}
        </button>
      )}
      <a
        href={`/${lang}/measure-pd#pd-tool`}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-1.5 text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        <Ruler className="h-3.5 w-3.5" />
        {s.wizMeasure}
      </a>
    </div>
  );
}
