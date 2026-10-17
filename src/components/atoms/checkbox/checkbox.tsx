import * as React from "react";

import {
  Checkbox as UICheckbox,
  type CheckboxProps as UICheckboxProps,
} from "@/components/ui/checkbox";

export type CheckboxProps = UICheckboxProps;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
  return <UICheckbox ref={ref} {...props} />;
});
Checkbox.displayName = "Checkbox";
