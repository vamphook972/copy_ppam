import type { MenuNode } from "@/types/menu";

import { SidebarContent } from "./sidebar-content";
import { SidebarFooter } from "./sidebar-footer";
import { SidebarHeader } from "./sidebar-header";

interface SidebarProps {
  items: MenuNode[];
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  items,
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop overlay */}
      <button
        type="button"
        aria-label="Close sidebar overlay"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity md:hidden ${
          isOpen ? "block opacity-100" : "pointer-events-none hidden opacity-0"
        }`}
      />

      {/* Main Sidebar */}
      <aside
        className={`bg-sidebar border-sidebar-border fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300 ease-in-out md:sticky md:top-0 md:z-30 md:h-screen ${
          isCollapsed ? "md:w-20" : "md:w-64"
        } ${isOpen ? "w-64 translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}`}
      >
        <SidebarHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          onCloseMobile={onClose}
        />
        <SidebarContent items={items} isCollapsed={isCollapsed} />
        <SidebarFooter isCollapsed={isCollapsed} />
      </aside>
    </>
  );
}
