import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  gridCols?: 1 | 2 | 3 | 4;
}

export function FormSection({
  title,
  description,
  children,
  className,
  gridCols = 1,
}: FormSectionProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[gridCols];

  return (
    <Card className={cn("border-border overflow-hidden border shadow-xs", className)}>
      {(title || description) && (
        <CardHeader className="p-5 pb-4">
          {title && <CardTitle className="text-base font-bold">{title}</CardTitle>}
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn("grid gap-4 p-5", gridClasses)}>{children}</CardContent>
    </Card>
  );
}
