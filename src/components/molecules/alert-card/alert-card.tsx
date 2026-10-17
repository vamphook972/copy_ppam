import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { Icon, Typography } from "@/components/atoms";
import { cn } from "@/lib/utils";

import type { AlertCardProps } from "./alert-card.types";

const toneStyles = {
  default: "border-border bg-card text-card-foreground",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
} as const;

const toneIcon = {
  default: Info,
  success: CheckCircle2,
  error: AlertCircle,
} as const;

export function AlertCard({
  title,
  description,
  tone = "default",
  icon,
  actions,
  className,
}: AlertCardProps) {
  const ResolvedIcon = icon ?? toneIcon[tone];

  return (
    <section
      role="status"
      aria-live="polite"
      className={cn("grid gap-3 rounded-lg border p-4", toneStyles[tone], className)}
    >
      <div className="flex items-start gap-3">
        <Icon icon={ResolvedIcon} className="mt-0.5 size-5 shrink-0" />
        <div className="grid gap-1">
          <Typography variant="body" className="font-semibold">
            {title}
          </Typography>
          {description ? (
            <Typography variant="caption" className="text-current/90">
              {description}
            </Typography>
          ) : null}
        </div>
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </section>
  );
}
