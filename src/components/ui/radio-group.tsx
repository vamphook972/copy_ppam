import * as React from "react";

import { cn } from "@/lib/utils";

export type RadioProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

const RadioGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("grid gap-2.5", className)} role="radiogroup" {...props} />;
  }
);
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <label className="inline-flex cursor-pointer items-center gap-3 select-none">
        <input
          type="radio"
          ref={ref}
          data-slot="radio"
          className={cn(
            "border-border bg-background size-4 shrink-0 cursor-pointer appearance-none rounded-full border transition-all",
            "checked:border-primary checked:bg-primary checked:ring-primary/20 checked:ring-offset-background checked:ring-2 checked:ring-offset-2",
            "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-2 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        {children && <span className="text-foreground text-sm font-medium">{children}</span>}
      </label>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
