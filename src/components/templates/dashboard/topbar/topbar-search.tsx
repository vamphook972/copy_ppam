"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

export function TopbarSearch() {
  const t = useTranslations("dashboard.topbar");

  return (
    <div className="relative hidden w-64 md:block lg:w-80">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <input
        type="search"
        placeholder={t("searchPlaceholder") || "Type to search..."}
        className="border-border bg-muted/40 dark:bg-secondary/40 text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-primary/20 h-9 w-full rounded-lg border pr-12 pl-9 text-xs font-medium transition-colors focus:ring-2 focus:outline-none"
      />
      <div className="border-border bg-background text-muted-foreground absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-semibold shadow-xs">
        <kbd>⌘</kbd>
        <kbd>K</kbd>
      </div>
    </div>
  );
}
