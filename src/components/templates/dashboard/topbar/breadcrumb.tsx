"use client";

import { ChevronRight, Home } from "lucide-react";
import { Fragment, useMemo } from "react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";

// Regex to identify UUIDs or long technical hex IDs
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LONG_HEX_REGEX = /^[0-9a-f]{20,}$/i;

function isIdSegment(segment: string): boolean {
  return UUID_REGEX.test(segment) || LONG_HEX_REGEX.test(segment);
}

function formatSegmentLabel(
  segment: string,
  isUUID: boolean,
  t: (key: string) => string,
  tHas: (key: string) => boolean
): string {
  if (isUUID) {
    // Truncate UUID to clean #hash format (e.g. #9ec06bc6)
    return `#${segment.slice(0, 8)}`;
  }

  const key = segment.toLowerCase().replace(/-/g, "_");
  if (tHas(key)) {
    return t(key);
  }

  // Fallback to title case
  return segment
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function Breadcrumb() {
  const pathname = usePathname();
  const t = useTranslations("navigation");

  const segments = useMemo(() => {
    // Split and filter out empty segments or locale prefix if present
    const raw = pathname.split("/").filter(Boolean);
    if (raw[0] === "es" || raw[0] === "en") {
      return raw.slice(1);
    }
    return raw;
  }, [pathname]);

  const breadcrumbItems = useMemo(() => {
    const items: Array<{ label: string; href: string; isLast: boolean }> = [];

    // Always start with Home
    items.push({
      label: t.has("home") ? t("home") : "Inicio",
      href: "/home",
      isLast: segments.length === 0,
    });

    let currentPath = "";

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      const isUUID = isIdSegment(segment);
      const label = formatSegmentLabel(
        segment,
        isUUID,
        (k) => t(k),
        (k) => t.has(k)
      );

      items.push({
        label,
        href: currentPath,
        isLast,
      });
    });

    return items;
  }, [segments, t]);

  const currentLabel = useMemo(() => {
    if (breadcrumbItems.length === 0) return t.has("home") ? t("home") : "Inicio";
    const lastItem = breadcrumbItems[breadcrumbItems.length - 1];
    return lastItem.label;
  }, [breadcrumbItems, t]);

  return (
    <nav
      className="text-foreground min-w-0"
      aria-label={t.has("breadcrumb") ? t("breadcrumb") : "Breadcrumb"}
    >
      {/* Current Page Title */}
      <p className="truncate text-sm font-bold tracking-tight">{currentLabel}</p>

      {/* Interactive Breadcrumb Trail */}
      <ol className="text-muted-foreground mt-0.5 hidden items-center gap-1.5 text-xs font-medium sm:flex">
        {breadcrumbItems.map((item, index) => {
          const isHome = index === 0;

          return (
            <Fragment key={`${item.href}-${index}`}>
              <li className="flex min-w-0 items-center gap-1.5">
                {item.isLast ? (
                  <span className="text-foreground truncate font-semibold" aria-current="page">
                    {isHome && <Home className="mr-1 inline size-3.5 shrink-0" />}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-foreground flex items-center gap-1 truncate transition-colors"
                  >
                    {isHome && <Home className="size-3.5 shrink-0" />}
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>

              {index < breadcrumbItems.length - 1 ? (
                <ChevronRight className="text-muted-foreground/60 size-3.5 shrink-0 select-none" />
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
