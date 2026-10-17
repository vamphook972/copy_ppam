"use client";

import type { UseFormRegisterReturn } from "react-hook-form";
import React, { useMemo } from "react";

import { cn } from "@/lib/utils";

export interface PhoneInputGroupProps {
  // Mode A: Separated Register Props
  countryCodeProps?: UseFormRegisterReturn;
  phoneNumberProps?: UseFormRegisterReturn;

  // Mode B: Unified / Controlled Props
  value?: string;
  onChange?: (val: string) => void;
  defaultCountryCode?: string;

  // Common Props
  countryCodeError?: string;
  phoneNumberError?: string;
  disabled?: boolean;
  placeholder?: string;
  hideErrorMessage?: boolean;
  className?: string;
}

export const COUNTRY_CODES = [
  { code: "+57", flag: "🇨🇴", country: "Colombia" },
  { code: "+1", flag: "🇺🇸", country: "Estados Unidos" },
  { code: "+52", flag: "🇲🇽", country: "México" },
  { code: "+51", flag: "🇵🇪", country: "Perú" },
  { code: "+54", flag: "🇦🇷", country: "Argentina" },
  { code: "+56", flag: "🇨🇱", country: "Chile" },
  { code: "+34", flag: "🇪🇸", country: "España" },
  { code: "+58", flag: "🇻🇪", country: "Venezuela" },
  { code: "+593", flag: "🇪🇨", country: "Ecuador" },
  { code: "+502", flag: "🇬🇹", country: "Guatemala" },
] as const;

export function parsePhoneString(
  fullPhone?: string,
  defaultCode = "+57"
): { countryCode: string; number: string } {
  if (!fullPhone) return { countryCode: defaultCode, number: "" };
  const trimmed = fullPhone.trim();
  const matched = COUNTRY_CODES.find(({ code }) => trimmed.startsWith(code));
  if (matched) {
    return {
      countryCode: matched.code,
      number: trimmed.slice(matched.code.length).trim(),
    };
  }
  if (trimmed.startsWith("+")) {
    return {
      countryCode: trimmed.slice(0, 3),
      number: trimmed.slice(3).trim(),
    };
  }
  return {
    countryCode: defaultCode,
    number: trimmed,
  };
}

export function PhoneInputGroup({
  countryCodeProps,
  phoneNumberProps,
  value,
  onChange,
  defaultCountryCode = "+57",
  countryCodeError,
  phoneNumberError,
  disabled = false,
  placeholder = "300 123 4567",
  hideErrorMessage = false,
  className,
}: PhoneInputGroupProps) {
  const isControlled = !countryCodeProps && !phoneNumberProps;

  const parsed = useMemo(
    () => parsePhoneString(value, defaultCountryCode),
    [value, defaultCountryCode]
  );

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    if (onChange) {
      onChange(parsed.number ? `${newCode}${parsed.number}` : "");
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNum = e.target.value.replace(/\D/g, "");
    if (onChange) {
      onChange(newNum ? `${parsed.countryCode}${newNum}` : "");
    }
  };

  const error = phoneNumberError || countryCodeError;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div
        className={cn(
          "border-input bg-background focus-within:border-ring focus-within:ring-ring/50 flex h-10 w-full items-center rounded-lg border px-2.5 shadow-2xs transition-all duration-150 focus-within:ring-2",
          error &&
            "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
          disabled && "pointer-events-none cursor-not-allowed opacity-50"
        )}
      >
        {/* Country Code Select Dropdown with Flag */}
        <div className="border-border/80 flex items-center gap-1.5 border-r pr-2">
          {isControlled ? (
            <select
              value={parsed.countryCode}
              onChange={handleCountryCodeChange}
              disabled={disabled}
              className="text-foreground cursor-pointer bg-transparent text-xs font-semibold outline-none"
            >
              {COUNTRY_CODES.map(({ code, flag }) => (
                <option key={code} value={code}>
                  {flag} {code}
                </option>
              ))}
            </select>
          ) : (
            <select
              className="text-foreground cursor-pointer bg-transparent text-xs font-semibold outline-none"
              disabled={disabled}
              {...countryCodeProps}
            >
              {COUNTRY_CODES.map(({ code, flag }) => (
                <option key={code} value={code}>
                  {flag} {code}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Phone Number Input */}
        {isControlled ? (
          <input
            type="tel"
            value={parsed.number}
            onChange={handleNumberChange}
            placeholder={placeholder}
            disabled={disabled}
            className="text-foreground placeholder:text-muted-foreground w-full bg-transparent px-3 text-sm font-medium outline-none"
          />
        ) : (
          <input
            type="tel"
            placeholder={placeholder}
            disabled={disabled}
            className="text-foreground placeholder:text-muted-foreground w-full bg-transparent px-3 text-sm font-medium outline-none"
            {...phoneNumberProps}
          />
        )}
      </div>

      {error && !hideErrorMessage && (
        <p className="text-destructive text-xs font-medium">{error}</p>
      )}
    </div>
  );
}
