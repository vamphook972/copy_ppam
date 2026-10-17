"use client";

import { Check, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("dashboard.topbar");

  function handleSelectLanguage(nextLocale: string) {
    if (nextLocale === currentLocale) return;
    const search = window.location.search;
    const target = `${pathname}${search}`;
    router.replace(target, { locale: nextLocale as "es" | "en" });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="border-border bg-card text-foreground hover:bg-muted size-9 rounded-lg shadow-2xs transition-colors"
          aria-label={t("languageSwitcher")}
          title={t("languageSwitcher")}
        >
          <Languages className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {routing.locales.map((loc) => {
          const isActive = loc === currentLocale;
          const labelKey = `languages.${loc}`;
          const label = t.has(labelKey) ? t(labelKey) : loc.toUpperCase();

          return (
            <DropdownMenuItem
              key={loc}
              onClick={() => handleSelectLanguage(loc)}
              className="flex cursor-pointer items-center justify-between font-medium"
            >
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground w-5 text-xs font-bold uppercase">{loc}</span>
                <span>{label}</span>
              </span>
              {isActive && <Check className="text-primary size-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
