import * as React from "react";

import {
  DatePicker as UIDatePicker,
  type DatePickerProps as UIDatePickerProps,
} from "@/components/ui/date-picker";

export type DatePickerProps = UIDatePickerProps;

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>((props, ref) => {
  return <UIDatePicker ref={ref} {...props} />;
});
DatePicker.displayName = "DatePicker";
