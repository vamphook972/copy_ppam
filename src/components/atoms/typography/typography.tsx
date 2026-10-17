import type { ElementType } from "react";

import { cn } from "@/lib/utils";

import type { TypographyProps, TypographyVariant } from "./typography.types";

const variantClasses: Record<TypographyVariant, string> = {
  h1: "text-2xl font-bold text-foreground tracking-tight sm:text-3xl",
  h2: "text-lg font-semibold text-foreground",
  h3: "text-lg font-semibold tracking-tight",
  subtitle: "mt-1 text-sm font-medium text-muted-foreground max-w-2xl",
  body: "text-base",
  caption: "text-xs text-muted-foreground",
};

const defaultElementByVariant: Record<TypographyVariant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  subtitle: "p",
  body: "p",
  caption: "span",
};

export function Typography({ variant = "body", as, className, ...props }: TypographyProps) {
  const Component = (as ?? defaultElementByVariant[variant]) as ElementType;

  return <Component className={cn(variantClasses[variant], className)} {...props} />;
}
