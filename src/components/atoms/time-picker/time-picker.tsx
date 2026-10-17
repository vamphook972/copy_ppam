import * as React from "react";

import {
  TimePicker as UITimePicker,
  type TimePickerProps as UITimePickerProps,
} from "@/components/ui/time-picker";

export type TimePickerProps = UITimePickerProps;

export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>((props, ref) => {
  return <UITimePicker ref={ref} {...props} />;
});
TimePicker.displayName = "TimePicker";
