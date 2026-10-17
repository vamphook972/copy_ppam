import type { HTMLAttributes } from "react";

export type TypographyVariant = "h1" | "h2" | "h3" | "subtitle" | "body" | "caption";

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
}
