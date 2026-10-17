"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

import { Breadcrumb } from "./breadcrumb";
import { LanguageSwitcher } from "./language-switcher";
import { NotificationsDropdown } from "./notifications-dropdown";
import { ThemeSwitcher } from "./theme-switcher";
import { UserMenu } from "./user-menu";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const t = useTranslations("dashboard.topbar");

  return (
    <header className="border-border bg-card/80 sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-4 backdrop-blur-md transition-colors sm:px-6">
      {/* Left side: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="text-foreground hover:bg-muted md:hidden"
          aria-label={t("openSidebar")}
          onClick={onToggleSidebar}
        >
          <Menu className="size-4" />
        </Button>
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        <ThemeSwitcher />
        <LanguageSwitcher />
        <NotificationsDropdown />
        <UserMenu />
      </div>
    </header>
  );
}
