import { Spinner, Typography } from "@/components/atoms";
import { cn } from "@/lib/utils";

import type { LoadingCardProps } from "./loading-card.types";

export function LoadingCard({ title = "Loading", description, className }: LoadingCardProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      className={cn("bg-card text-card-foreground grid gap-3 rounded-lg border p-4", className)}
    >
      <div className="flex items-center gap-3">
        <Spinner size={20} />
        <Typography variant="body" className="font-semibold">
          {title}
        </Typography>
      </div>

      {description ? (
        <Typography variant="caption" className="text-muted-foreground">
          {description}
        </Typography>
      ) : null}
    </section>
  );
}
