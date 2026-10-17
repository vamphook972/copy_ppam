import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, defaultChecked, onChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(Boolean(checked ?? defaultChecked ?? false));

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(Boolean(checked));
      }
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (checked === undefined) {
        setIsChecked(e.target.checked);
      }
      onChange?.(e);
    };

    return (
      <label className="relative inline-flex cursor-pointer items-center justify-center select-none">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          data-slot="checkbox"
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            "border-border bg-background flex size-5 items-center justify-center rounded-md border transition-all duration-150",
            "peer-focus-visible:border-primary peer-focus-visible:ring-primary/20 peer-focus-visible:ring-2",
            "peer-checked:border-primary peer-checked:bg-primary text-white",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            className
          )}
        >
          <Check
            className={cn("size-3.5 opacity-0 transition-opacity", isChecked && "opacity-100")}
          />
        </div>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
