import { cva } from "class-variance-authority";

export const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "text-2xl font-bold leading-tight tracking-tight",
      h2: "text-xl font-bold leading-snug tracking-tight",
      body: "text-base leading-6",
      caption: "text-xs leading-4 text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});
