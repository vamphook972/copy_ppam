import { cn } from "@/lib/utils";

import type { DashboardCardsProps } from "./dashboard-cards.types";

export function DashboardCards({ children, className }: DashboardCardsProps) {
  return (
    <section
      aria-label="dashboard-cards"
      className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4", className)}
    >
      {children}
    </section>
  );
}
