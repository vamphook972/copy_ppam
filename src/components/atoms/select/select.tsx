import * as React from "react";

import { Select as UISelect, type SelectProps as UISelectProps } from "@/components/ui/select";

export type SelectProps = UISelectProps;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
  return <UISelect ref={ref} {...props} />;
});
Select.displayName = "Select";
