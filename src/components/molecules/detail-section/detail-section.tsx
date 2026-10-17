import * as React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface DetailSectionProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  gridCols?: 1 | 2 | 3 | 4;
}

export function DetailSection({
  title,
  description,
  children,
  className,
  gridCols = 2,
}: DetailSectionProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[gridCols];

  return (
    <Card className={cn("border-border overflow-hidden border shadow-xs", className)}>
      {(title || description) && (
        <CardHeader className="border-border/60 bg-muted/20 border-b p-5 pb-4">
          {title && <CardTitle className="text-base font-bold">{title}</CardTitle>}
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn("grid gap-5 p-5", gridClasses)}>{children}</CardContent>
    </Card>
  );
}
