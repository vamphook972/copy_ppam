"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { getMenuIconComponent } from "@/config/icons.config";
import { Link, usePathname } from "@/i18n/navigation";
import type { MenuNode } from "@/types/menu";

interface SidebarMenuProps {
  items: MenuNode[];
  isCollapsed?: boolean;
}

function renderMenuIcon(iconName: string | undefined, className: string) {
  const Icon = getMenuIconComponent(iconName);
  return <Icon className={className} />;
}

function isActivePath(currentPath: string | null, href: string | null) {
  if (!currentPath || !href) return false;
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function hasActiveDescendant(item: MenuNode, currentPath: string | null): boolean {
  if (isActivePath(currentPath, item.href)) {
    return true;
  }
  return item.children.some((child) => hasActiveDescendant(child, currentPath));
}

interface SidebarMenuItemProps {
  item: MenuNode;
  level: number;
  pathname: string | null;
  t: ReturnType<typeof useTranslations>;
  isCollapsed?: boolean;
}

function SidebarMenuItem({ item, level, pathname, t, isCollapsed = false }: SidebarMenuItemProps) {
  const hasChildren = item.children.length > 0;
  const active = isActivePath(pathname, item.href);
  const activeInTree = hasActiveDescendant(item, pathname);
  const [expanded, setExpanded] = useState(activeInTree);

  // Safe translation helper
  const label = useMemo(() => {
    if (t.has(item.title)) {
      return t(item.title);
    }
    return item.title;
  }, [item.title, t]);

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className={`group flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
            activeInTree
              ? "bg-sidebar-accent font-semibold text-white"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
          } ${isCollapsed ? "justify-center px-2" : ""}`}
          title={isCollapsed ? label : undefined}
        >
          <div className="flex items-center gap-3 truncate">
            {renderMenuIcon(
              item.icon,
              `size-5 shrink-0 transition-colors ${
                activeInTree
                  ? "text-primary-foreground"
                  : "text-sidebar-foreground group-hover:text-white"
              }`
            )}
            {!isCollapsed && <span className="truncate">{label}</span>}
          </div>

          {!isCollapsed && (
            <div className="flex items-center gap-2">
              {item.badge !== undefined && (
                <span className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
                  {item.badge}
                </span>
              )}
              {expanded ? (
                <ChevronDown className="text-sidebar-foreground size-4 shrink-0 transition-transform group-hover:text-white" />
              ) : (
                <ChevronRight className="text-sidebar-foreground size-4 shrink-0 transition-transform group-hover:text-white" />
              )}
            </div>
          )}
        </button>

        {expanded && !isCollapsed && (
          <div className="border-sidebar-border/60 my-1 ml-4 space-y-1 border-l pl-3">
            {item.children.map((child) => (
              <SidebarMenuItem
                key={child.id}
                item={child}
                level={level + 1}
                pathname={pathname}
                t={t}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!item.href) {
    return (
      <div
        className={`text-sidebar-foreground/60 flex items-center gap-3 rounded-lg px-3.5 py-2 text-sm ${
          isCollapsed ? "justify-center px-2" : ""
        }`}
      >
        {renderMenuIcon(item.icon, "size-5 shrink-0 opacity-60")}
        {!isCollapsed && <span className="truncate">{label}</span>}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`group flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-primary font-semibold text-white shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
      } ${isCollapsed ? "justify-center px-2" : ""}`}
      title={isCollapsed ? label : undefined}
    >
      <div className="flex items-center gap-3 truncate">
        {renderMenuIcon(
          item.icon,
          `size-5 shrink-0 transition-colors ${
            active ? "text-white" : "text-sidebar-foreground group-hover:text-white"
          }`
        )}
        {!isCollapsed && <span className="truncate">{label}</span>}
      </div>

      {!isCollapsed && item.badge !== undefined && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            active
              ? "bg-white/20 text-white"
              : "bg-primary/20 text-primary group-hover:bg-white/20 group-hover:text-white"
          }`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function SidebarMenu({ items, isCollapsed = false }: SidebarMenuProps) {
  const pathname = usePathname();
  const t = useTranslations();

  // Dynamic Grouping logic: Check if items have the optional `group` property
  const groupedItems = useMemo(() => {
    const hasGroupProperty = items.some((item) => item.group !== undefined && item.group !== "");

    if (!hasGroupProperty) {
      return [{ groupName: null, items }];
    }

    const groupsMap = new Map<string, MenuNode[]>();
    items.forEach((item) => {
      const groupName = item.group || "MAIN";
      if (!groupsMap.has(groupName)) {
        groupsMap.set(groupName, []);
      }
      groupsMap.get(groupName)!.push(item);
    });

    return Array.from(groupsMap.entries()).map(([groupName, groupItems]) => ({
      groupName,
      items: groupItems,
    }));
  }, [items]);

  return (
    <nav aria-label={t("navigation.main")} className="space-y-6 px-3 py-4">
      {groupedItems.map(({ groupName, items: sectionItems }, index) => (
        <div key={groupName || index} className="space-y-1.5">
          {groupName && !isCollapsed && (
            <h3 className="text-sidebar-foreground/70 mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
              {groupName}
            </h3>
          )}
          {sectionItems.map((item) => (
            <SidebarMenuItem
              key={item.id}
              item={item}
              level={0}
              pathname={pathname}
              t={t}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}
