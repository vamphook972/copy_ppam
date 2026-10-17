import * as React from "react";

import {
  DateTimePicker as UIDateTimePicker,
  type DateTimePickerProps as UIDateTimePickerProps,
} from "@/components/ui/date-time-picker";

export type DateTimePickerProps = UIDateTimePickerProps;

export function DateTimePicker({ className, ...props }: DateTimePickerProps) {
  return <UIDateTimePicker className={className} {...props} />;
}
