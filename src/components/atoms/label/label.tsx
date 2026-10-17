import * as React from "react";

import { Label as UILabel, type LabelProps as UILabelProps } from "@/components/ui/label";

export type LabelProps = UILabelProps;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>((props, ref) => {
  return <UILabel ref={ref} {...props} />;
});
Label.displayName = "Label";
