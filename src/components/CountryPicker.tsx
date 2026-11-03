import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getCountryName, getCountryOptions } from "@/lib/countries";
import { getTranslator, useI18nOptional, type Lang } from "@/lib/i18n";

interface CountryPickerProps {
  /** Stored value — ISO 3166-1 alpha-2 ("US", "CN", ...). Empty string = unset. */
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  /** Search-box placeholder ("Search countries…"). */
  searchPlaceholder?: string;
  /** Empty-state copy when the search has no hit. */
  emptyText?: string;
  className?: string;
  /** Render a different trigger style — useful for inline-edit contexts.
   *  Default is a full-width pill matching <Field>'s input style. */
  variant?: "input" | "ghost";
  ariaLabel?: string;
  /** Override the UI language for country names + default placeholders.
   *  Pass this when rendering outside an I18nProvider (e.g. /admin pages)
   *  or when you want to pin the picker to a specific language regardless
   *  of the user's UI lang. Defaults to the I18nProvider context, or "en"
   *  when no provider is present. */
  lang?: Lang;
}

export function CountryPicker({
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  className,
  variant = "input",
  ariaLabel,
  lang,
}: CountryPickerProps) {
  // Tolerate rendering outside an I18nProvider — /admin and /tracker
  // intentionally skip the customer provider, so `useI18n` would throw
  // there. Use the optional read + a URL-derived translator fallback.
  const ctx = useI18nOptional();
  const contentLang: Lang = lang ?? ctx?.contentLang ?? "en";
  const t = ctx?.t ?? getTranslator(contentLang);
  const [open, setOpen] = useState(false);

  const options = useMemo(() => getCountryOptions(contentLang), [contentLang]);
  const selectedName = value ? getCountryName(value, contentLang) : "";

  const isInput = variant === "input";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel ?? t("checkout.country" as never)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            isInput
              ? "flex w-full h-11 items-center justify-between gap-2 px-4 rounded-xl border border-border bg-background text-left text-sm transition-smooth outline-none focus:border-primary/40"
              : "inline-flex items-center gap-1.5 text-sm underline-offset-2 hover:underline",
            className,
          )}
        >
          <span
            className={cn(
              "truncate",
              !value &&
                (isInput ? "text-muted-foreground" : "text-muted-foreground"),
            )}
          >
            {value
              ? `${selectedName} (${value})`
              : (placeholder ?? t("checkout.country.placeholder" as never))}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[260px] p-0"
      >
        <Command
          filter={(itemValue, search) => {
            // itemValue = "US:United States" (set below). Match against either
            // the ISO code OR the localized name (case-insensitive substring).
            if (!search) return 1;
            const q = search.toLowerCase();
            return itemValue.toLowerCase().includes(q) ? 1 : 0;
          }}
        >
          <CommandInput
            placeholder={
              searchPlaceholder ?? t("checkout.country.search" as never)
            }
          />
          <CommandList>
            <CommandEmpty>
              {emptyText ?? t("checkout.country.empty" as never)}
            </CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.code}
                  // Encode both code and name into the CMDK-visible "value" so
                  // the search filter above can match either.
                  value={`${o.code}:${o.name}`}
                  onSelect={() => {
                    onChange(o.code);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === o.code ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex-1 truncate">{o.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {o.code}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
