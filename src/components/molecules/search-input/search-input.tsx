import { Search } from "lucide-react";

import { Icon, Input } from "@/components/atoms";
import { cn } from "@/lib/utils";

import type { SearchInputProps } from "./search-input.types";

export function SearchInput({
  className,
  containerClassName,
  iconLabel,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative", containerClassName)}>
      <Icon
        icon={Search}
        ariaLabel={iconLabel}
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
      />
      <Input type="search" className={cn("pl-9", className)} {...props} />
    </div>
  );
}
