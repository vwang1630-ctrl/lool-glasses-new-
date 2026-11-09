import { LangLink } from "@/components/LangLink";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export interface InfoSection {
  heading: string;
  body: ReactNode | string;
}

export interface InfoPageProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  sections: InfoSection[];
  cta?: { label: string; to: string };
  /** Interactive block rendered above the editorial sections. */
  children?: ReactNode;
}

/**
 * Shared editorial page used by every static "info" route reachable
 * from the footer (About, How-to, Programs, Legal, etc.).
 * Keeps a consistent look without one-off layouts per page.
 */
export function InfoPage({
  eyebrow,
  title,
  intro,
  sections,
  cta,
  children,
}: InfoPageProps) {
  return (
    <div>
      {/* Hero band — unified across all info routes */}
      <section className="page-hero">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 pt-10 pb-16 md:pt-14 md:pb-20">
          <nav className="text-xs text-muted-foreground mb-8 flex items-center gap-1.5">
            <LangLink to="/" className="hover:text-primary transition-smooth">
              Home
            </LangLink>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80">{title}</span>
          </nav>
          <header className="text-center max-w-3xl mx-auto">
            {eyebrow && (
              <span className="eyebrow eyebrow-line mb-5">{eyebrow}</span>
            )}
            <h1 className="section-title text-4xl md:text-5xl">{title}</h1>
            {intro && (
              <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {intro}
              </p>
            )}
          </header>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto max-w-4xl px-6 lg:px-8 py-16 md:py-20">
        {children && <div className="mb-10 md:mb-14">{children}</div>}
        <div className="space-y-6 md:space-y-8">
          {sections.map((s) => (
            <section
              key={s.heading}
              className="rounded-3xl border border-border/60 bg-card shadow-card/50 p-7 md:p-10 transition-smooth hover:shadow-card"
            >
              <h2 className="text-xl md:text-2xl font-semibold font-display mb-4">
                {s.heading}
              </h2>
              <div className="text-sm md:text-base text-muted-foreground leading-relaxed space-y-3">
                {typeof s.body === "string"
                  ? s.body.split("\n").map((p, i) => <p key={i}>{p}</p>)
                  : s.body}
              </div>
            </section>
          ))}
        </div>

        {cta && (
          <div className="mt-16 text-center">
            {cta.to.startsWith("#") ? (
              <a
                href={cta.to}
                className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth shadow-soft"
              >
                {cta.label}
                <ChevronRight className="w-4 h-4" />
              </a>
            ) : (
            <LangLink
              to={cta.to}
              className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth shadow-soft"
            >
              {cta.label}
              <ChevronRight className="w-4 h-4" />
            </LangLink>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
