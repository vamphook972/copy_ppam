"use client";

import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  (
    {
      options,
      value: controlledValue,
      defaultValue,
      onValueChange,
      placeholder = "Select an option...",
      searchPlaceholder = "Search...",
      emptyMessage = "No options found.",
      disabled = false,
      clearable = true,
      className,
      id,
      name,
      required,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedValue, setSelectedValue] = React.useState(controlledValue ?? defaultValue ?? "");
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (controlledValue !== undefined) {
        setSelectedValue(controlledValue);
      }
    }, [controlledValue]);

    // Close when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };

      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [open]);

    const selectedOption = options.find((opt) => opt.value === selectedValue);

    const filteredOptions = React.useMemo(() => {
      if (!searchQuery.trim()) return options;
      const q = searchQuery.toLowerCase();
      return options.filter(
        (opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
      );
    }, [options, searchQuery]);

    const handleSelect = (val: string) => {
      if (controlledValue === undefined) {
        setSelectedValue(val);
      }
      onValueChange?.(val);
      setOpen(false);
      setSearchQuery("");
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (controlledValue === undefined) {
        setSelectedValue("");
      }
      onValueChange?.("");
      setSearchQuery("");
    };

    return (
      <div ref={containerRef} className="relative w-full">
        {/* Hidden native input for form submissions / refs */}
        <input
          ref={ref}
          type="hidden"
          id={id}
          name={name}
          value={selectedValue}
          required={required}
        />

        {/* Trigger Button */}
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? `${id || "combobox"}-listbox` : undefined}
          aria-haspopup="listbox"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            "border-border bg-background text-foreground flex h-10 w-full items-center justify-between rounded-lg border px-3.5 py-2 text-sm shadow-2xs transition-colors",
            "hover:bg-muted/40",
            "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-2 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selectedOption && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>

          <div className="ml-2 flex shrink-0 items-center gap-1">
            {clearable && selectedValue && !disabled && (
              <span
                role="button"
                tabIndex={-1}
                onClick={handleClear}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-0.5"
                title="Clear"
              >
                <X className="size-3.5" />
              </span>
            )}
            <ChevronsUpDown className="size-4 opacity-50" />
          </div>
        </button>

        {/* Dropdown Popover */}
        {open && (
          <div
            id={`${id || "combobox"}-listbox`}
            role="listbox"
            className="border-border bg-card shadow-dropdown animate-in fade-in-80 zoom-in-95 absolute top-full left-0 z-50 mt-1.5 w-full rounded-xl border p-1.5"
          >
            {/* Search Input Header */}
            <div className="border-border/60 relative mb-1 flex items-center border-b px-2 pt-0.5 pb-1.5">
              <Search className="text-muted-foreground mr-2 size-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-xs font-medium focus:outline-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Options List */}
            <div className="max-h-56 space-y-0.5 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="text-muted-foreground p-3 text-center text-xs font-medium">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === selectedValue;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-foreground hover:bg-muted",
                        opt.disabled && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="text-primary size-4 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);
Combobox.displayName = "Combobox";

export { Combobox };
