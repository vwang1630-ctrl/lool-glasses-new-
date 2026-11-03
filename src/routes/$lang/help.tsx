import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { pickLang } from "@/lib/lang";
import { faqs } from "@/data/products";
import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { JsonLd, faqSchema } from "@/lib/jsonld";

export const Route = createFileRoute("/$lang/help")({
  head: () => ({ meta: [{ title: "lool — Help Center" }] }),
  component: HelpPage,
});

function HelpPage() {
  const { t, contentLang } = useI18n();
  const [q, setQ] = useState("");

  // FAQPage JSON-LD — emit en strings (LLM crawlers index in en) regardless
  // of the user's currently-displayed language.
  const faqJsonLd = faqSchema(
    faqs.flatMap((f) =>
      f.items.map((i) => ({ question: i.q.en, answer: i.a.en })),
    ),
  );

  return (
    <div>
      <JsonLd schema={faqJsonLd} />
      <section className="page-hero">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 pt-10 pb-12 md:pt-14 md:pb-16 text-center">
          <span className="eyebrow eyebrow-line mb-5">{t("help.eyebrow")}</span>
          <h1 className="section-title text-4xl md:text-5xl">
            {t("help.title")}
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            {t("help.sub")}
          </p>
          <div className="relative max-w-xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("help.search")}
              className="w-full h-12 pl-11 pr-4 rounded-full border border-border bg-background focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-smooth"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 lg:px-8 py-16">
        <div className="space-y-10">
          {faqs.map((f) => {
            const catLabel = pickLang(f.cat, contentLang);
            return (
              <div key={f.cat.en}>
                <h2 className="text-lg font-semibold font-display mb-4">
                  {catLabel}
                </h2>
                <div className="space-y-2.5">
                  {f.items
                    .map((i) => ({
                      q: pickLang(i.q, contentLang),
                      a: pickLang(i.a, contentLang),
                    }))
                    .filter(
                      (i) =>
                        !q ||
                        i.q.toLowerCase().includes(q.toLowerCase()) ||
                        i.a.toLowerCase().includes(q.toLowerCase()),
                    )
                    .map((i, idx) => (
                      <FAQ key={idx} q={i.q} a={i.a} />
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden transition-smooth hover:border-primary/30">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left px-5 py-4 hover:bg-secondary/40 transition-smooth"
      >
        <span className="text-sm font-medium">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}
