import { Typography } from "@/components/atoms";
import { cn } from "@/lib/utils";

import type { FiltersPanelProps } from "./filters-panel.types";

export function FiltersPanel({
  title,
  description,
  children,
  actions,
  className,
}: FiltersPanelProps) {
  return (
    <section
      className={cn("bg-card text-card-foreground grid gap-4 rounded-lg border p-4", className)}
    >
      {title || description || actions ? (
        <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="grid gap-1">
            {title ? (
              <Typography variant="h2" className="text-lg">
                {title}
              </Typography>
            ) : null}
            {description ? (
              <Typography variant="caption" className="text-muted-foreground">
                {description}
              </Typography>
            ) : null}
          </div>

          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}
