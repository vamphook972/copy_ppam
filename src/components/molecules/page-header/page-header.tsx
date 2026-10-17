import * as React from "react";

import { Typography } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}
    >
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="text-muted-foreground flex items-center gap-1.5 text-xs">
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={index} className="flex items-center gap-1.5">
                    {index > 0 && <span>/</span>}
                    {item.href && !isLast ? (
                      <Link href={item.href} className="hover:text-foreground transition-colors">
                        {item.label}
                      </Link>
                    ) : (
                      <span className={cn(isLast && "text-foreground font-medium")}>
                        {item.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {typeof title === "string" ? <Typography variant="h1">{title}</Typography> : title}

        {subtitle &&
          (typeof subtitle === "string" ? (
            <Typography variant="body" className="text-muted-foreground">
              {subtitle}
            </Typography>
          ) : (
            subtitle
          ))}
      </div>

      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </header>
  );
}
