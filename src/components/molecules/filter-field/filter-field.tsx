"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Combobox } from "@/components/ui/combobox";
import { useRelationOptions } from "@/hooks/use-relation-options";
import type { FilterConfig } from "@/shared/types/crud-module.types";

export interface FilterFieldProps {
  config: FilterConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  translationNamespace: string;
}

export function FilterField({ config, value, onChange, translationNamespace }: FilterFieldProps) {
  const t = useTranslations(translationNamespace);

  const labelText =
    "label" in config && config.label ? config.label : t(`filters.${config.name}Label`);

  if (config.type === "search") {
    return (
      <div className="grid gap-2">
        <Label htmlFor={`filter-${config.name}`}>{labelText}</Label>
        <Input
          id={`filter-${config.name}`}
          name={config.name}
          defaultValue={typeof value === "string" ? value : ""}
          placeholder={
            config.placeholder ? config.placeholder : t(`filters.${config.name}Placeholder`)
          }
          type="search"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (config.type === "select") {
    return (
      <div className="grid gap-2">
        <Label htmlFor={`filter-${config.name}`}>{labelText}</Label>
        <select
          id={`filter-${config.name}`}
          name={config.name}
          className="border-input bg-background text-foreground focus-visible:border-primary focus-visible:ring-primary/20 h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-1"
          value={typeof value === "string" ? value : "all"}
          onChange={(e) => onChange(e.target.value === "all" ? undefined : e.target.value)}
        >
          <option value="all">{t("filters.statusAll")}</option>
          {config.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.translationKey)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (config.type === "relation") {
    return (
      <RelationFilterField
        config={config}
        value={value}
        onChange={onChange}
        labelText={labelText}
      />
    );
  }

  if (config.type === "custom") {
    return <>{config.render({ value, onChange })}</>;
  }

  return null;
}

function RelationFilterField({
  config,
  value,
  onChange,
  labelText,
}: {
  config: Extract<FilterConfig, { type: "relation" }>;
  value: unknown;
  onChange: (value: unknown) => void;
  labelText: string;
}) {
  const { options, isLoading } = useRelationOptions(config.relation);

  return (
    <div className="grid gap-2">
      <Label htmlFor={`filter-${config.name}`}>{labelText}</Label>
      <Combobox
        id={`filter-${config.name}`}
        options={options}
        value={typeof value === "string" ? value : ""}
        onValueChange={(val) => onChange(val || undefined)}
        disabled={isLoading}
        placeholder={isLoading ? "..." : undefined}
        clearable
      />
    </div>
  );
}
