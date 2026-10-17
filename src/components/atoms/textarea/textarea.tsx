import * as React from "react";

import {
  Textarea as UITextarea,
  type TextareaProps as UITextareaProps,
} from "@/components/ui/textarea";

export type TextareaProps = UITextareaProps;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  return <UITextarea ref={ref} {...props} />;
});
Textarea.displayName = "Textarea";
