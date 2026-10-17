import { Button as UIButton } from "@/components/ui/button";

import type { ButtonProps } from "./button.types";

export function Button(props: ButtonProps) {
  return <UIButton {...props} />;
}
