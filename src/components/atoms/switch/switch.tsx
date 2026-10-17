import * as React from "react";

import { Switch as UISwitch, type SwitchProps as UISwitchProps } from "@/components/ui/switch";

export type SwitchProps = UISwitchProps;

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>((props, ref) => {
  return <UISwitch ref={ref} {...props} />;
});
Switch.displayName = "Switch";
