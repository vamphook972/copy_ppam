import * as React from "react";

import {
  Combobox as UICombobox,
  type ComboboxProps as UIComboboxProps,
} from "@/components/ui/combobox";

export type ComboboxProps = UIComboboxProps;

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>((props, ref) => {
  return <UICombobox ref={ref} {...props} />;
});
Combobox.displayName = "Combobox";
