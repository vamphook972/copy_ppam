"use client";

import { useTranslations } from "next-intl";

import { usePermission } from "@/providers";

interface SidebarFooterProps {
  isCollapsed?: boolean;
}

export function SidebarFooter({ isCollapsed = false }: SidebarFooterProps) {
  const t = useTranslations("dashboard");
  const { user } = usePermission();

  if (isCollapsed) return null;

  const tenantName = user?.tenant?.name || t("sidebar.footer");

  return (
    <div className="border-sidebar-border shrink-0 border-t px-5 py-4">
      <p className="text-sidebar-foreground/70 truncate text-xs font-medium" title={tenantName}>
        {tenantName}
      </p>
    </div>
  );
}
