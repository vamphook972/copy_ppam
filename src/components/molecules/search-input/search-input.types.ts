import type { ComponentProps } from "react";

export interface SearchInputProps extends Omit<ComponentProps<"input">, "type"> {
  containerClassName?: string;
  iconLabel?: string;
}
