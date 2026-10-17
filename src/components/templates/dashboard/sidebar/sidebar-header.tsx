"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { BrandLogo } from "@/components/atoms";

interface SidebarHeaderProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

export function SidebarHeader({ isCollapsed = false, onToggleCollapse }: SidebarHeaderProps) {
  return (
    <div className="border-sidebar-border flex h-16 shrink-0 items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-3 overflow-hidden">
        {isCollapsed ? (
          <BrandLogo variant="icon" theme="dark" width={32} height={32} priority />
        ) : (
          <BrandLogo variant="full" theme="dark" width={130} height={36} priority />
        )}
      </div>

      {onToggleCollapse && !isCollapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="text-sidebar-foreground hover:bg-sidebar-accent hidden size-7 items-center justify-center rounded-md transition-colors hover:text-white md:flex"
          title="Toggle Sidebar"
        >
          <PanelLeftClose className="size-5" />
        </button>
      )}

      {onToggleCollapse && isCollapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="text-sidebar-foreground hover:bg-sidebar-accent mx-auto hidden size-7 items-center justify-center rounded-md transition-colors hover:text-white md:flex"
          title="Expand Sidebar"
        >
          <PanelLeftOpen className="size-5" />
        </button>
      )}
    </div>
  );
}
