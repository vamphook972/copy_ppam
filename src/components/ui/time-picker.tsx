import { Clock } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type TimePickerProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type="time"
          ref={ref}
          data-slot="time-picker"
          className={cn(
            "border-border bg-background text-foreground flex h-10 w-full rounded-lg border px-3.5 py-2 pl-10 text-sm shadow-2xs transition-colors",
            "placeholder:text-muted-foreground",
            "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-2 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-2",
            className
          )}
          {...props}
        />
        <Clock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
      </div>
    );
  }
);
TimePicker.displayName = "TimePicker";

export { TimePicker };
