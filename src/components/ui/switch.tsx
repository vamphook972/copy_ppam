import * as React from "react";

import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, defaultChecked, onChange, onCheckedChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(Boolean(checked ?? defaultChecked ?? false));

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(Boolean(checked));
      }
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextChecked = e.target.checked;
      if (checked === undefined) {
        setIsChecked(nextChecked);
      }
      onChange?.(e);
      onCheckedChange?.(nextChecked);
    };

    return (
      <label className="relative inline-flex cursor-pointer items-center select-none">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          data-slot="switch"
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            "bg-muted h-6 w-11 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
            "peer-focus-visible:border-primary peer-focus-visible:ring-primary/20 peer-focus-visible:ring-2",
            "peer-checked:bg-primary",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            className
          )}
        >
          <div
            className={cn(
              "size-5 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out",
              isChecked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </div>
      </label>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
