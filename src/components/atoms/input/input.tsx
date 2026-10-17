import * as React from "react";

import { Input as UIInput, type InputProps as UIInputProps } from "@/components/ui/input";

export type InputProps = UIInputProps;

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <UIInput ref={ref} {...props} />;
});
Input.displayName = "Input";
