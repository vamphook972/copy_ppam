import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "group/button",
    "inline-flex items-center justify-center",
    "shrink-0",
    "rounded-lg",
    "border border-transparent",
    "bg-clip-padding",
    "text-sm font-semibold",
    "whitespace-nowrap",
    "transition-all duration-200",
    "outline-none",
    "select-none",

    "focus-visible:border-ring",
    "focus-visible:ring-3",
    "focus-visible:ring-ring/50",

    "active:not-aria-[haspopup]:translate-y-px",

    "disabled:pointer-events-none",
    "disabled:opacity-50",

    "aria-invalid:border-destructive",
    "aria-invalid:ring-3",
    "aria-invalid:ring-destructive/20",

    "dark:aria-invalid:border-destructive/50",
    "dark:aria-invalid:ring-destructive/40",

    "[&_svg]:pointer-events-none",
    "[&_svg]:shrink-0",
    "[&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",

        outline:
          "border-border bg-card hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground shadow-2xs",

        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",

        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",

        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-xs focus-visible:border-destructive/40 focus-visible:ring-destructive/20",

        success:
          "bg-success text-white hover:bg-success/90 shadow-xs focus-visible:border-success/40 focus-visible:ring-success/20",

        warning:
          "bg-warning text-white hover:bg-warning/90 shadow-xs focus-visible:border-warning/40 focus-visible:ring-warning/20",

        link: "h-auto rounded-none p-0 text-primary underline-offset-4 hover:underline",
      },

      size: {
        xs: "h-8 px-3 text-xs gap-1 rounded-md has-data-[icon=inline-start]:pl-2 has-data-[icon=inline-end]:pr-2 [&_svg:not([class*='size-'])]:size-3",

        sm: "h-9 px-3.5 text-sm gap-1.5 has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3",

        default:
          "h-10 px-4 text-sm gap-2 has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3",

        lg: "h-11 px-5 text-base gap-2 has-data-[icon=inline-start]:pl-4 has-data-[icon=inline-end]:pr-4",

        icon: "size-10",

        "icon-xs": "size-8 rounded-md [&_svg:not([class*='size-'])]:size-3",

        "icon-sm": "size-9",

        "icon-lg": "size-11",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
