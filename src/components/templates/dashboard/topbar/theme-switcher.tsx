"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const t = useTranslations("dashboard.topbar");

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="border-border bg-card text-foreground hover:bg-muted size-9 rounded-lg"
        aria-label={t("themeSwitcher")}
      >
        <Sun className="text-muted-foreground size-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="border-border bg-card text-foreground hover:bg-muted size-9 rounded-lg shadow-2xs transition-colors"
      aria-label={t("themeSwitcher")}
      title={isDark ? t("themeLight") : t("themeDark")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun className="text-warning size-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="text-foreground size-4 transition-transform hover:-rotate-12" />
      )}
    </Button>
  );
}
