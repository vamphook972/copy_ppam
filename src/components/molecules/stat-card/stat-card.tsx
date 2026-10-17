import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: "increase" | "decrease";
  };
  icon: LucideIcon;
  iconBgTone?: "primary" | "success" | "warning" | "destructive";
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconBgTone = "primary",
  description,
  className,
}: StatCardProps) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary dark:bg-primary/20",
    success: "bg-success/10 text-success dark:bg-success/20",
    warning: "bg-warning/10 text-warning dark:bg-warning/20",
    destructive: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  }[iconBgTone];

  return (
    <div
      className={cn(
        "border-border bg-card hover:shadow-card rounded-xl border p-6 shadow-xs transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-full transition-transform hover:scale-105",
            toneClasses
          )}
        >
          <Icon className="size-5" />
        </div>

        {change && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              change.type === "increase"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {change.type === "increase" ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}
            <span>{change.value}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{value}</h4>
          <span className="text-muted-foreground mt-1 block text-xs font-medium">{title}</span>
        </div>

        {description && <span className="text-muted-foreground text-xs">{description}</span>}
      </div>
    </div>
  );
}
