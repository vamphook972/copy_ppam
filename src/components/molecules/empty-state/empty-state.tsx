import { Inbox } from "lucide-react";

import { Icon, Typography } from "@/components/atoms";
import { cn } from "@/lib/utils";

import type { EmptyStateProps } from "./empty-state.types";

export function EmptyState({
  title,
  description,
  icon = Inbox,
  actions,
  className,
}: EmptyStateProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      className={cn(
        "bg-card text-card-foreground grid place-items-center gap-4 rounded-lg border p-8 text-center",
        className
      )}
    >
      <span className="bg-muted text-muted-foreground inline-flex size-12 items-center justify-center rounded-full">
        <Icon icon={icon} className="size-5" />
      </span>

      <div className="grid gap-1">
        <Typography variant="h2">{title}</Typography>
        {description ? (
          <Typography variant="body" className="text-muted-foreground">
            {description}
          </Typography>
        ) : null}
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center justify-center gap-2">{actions}</div>
      ) : null}
    </section>
  );
}
