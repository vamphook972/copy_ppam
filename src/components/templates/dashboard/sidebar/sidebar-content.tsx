import type { MenuNode } from "@/types/menu";

import { SidebarMenu } from "./sidebar-menu";

interface SidebarContentProps {
  items: MenuNode[];
  isCollapsed?: boolean;
}

export function SidebarContent({ items, isCollapsed = false }: SidebarContentProps) {
  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto">
      <SidebarMenu items={items} isCollapsed={isCollapsed} />
    </div>
  );
}
