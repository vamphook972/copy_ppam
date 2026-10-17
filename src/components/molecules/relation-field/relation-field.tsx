"use client";

import { FormField } from "@/components/molecules/form-field";
import { Combobox } from "@/components/ui/combobox";
import { useRelationOptions } from "@/hooks/use-relation-options";
import type { RelationFieldConfig } from "@/shared/types/crud-module.types";

export interface RelationFieldProps {
  config: RelationFieldConfig;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  watchedValue?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export function RelationField({
  config,
  value,
  onChange,
  error,
  disabled = false,
  watchedValue,
  placeholder,
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron opciones.",
}: RelationFieldProps) {
  const { options, isLoading } = useRelationOptions(config.relation, watchedValue);

  const isParentMissing = Boolean(config.relation.dependsOn && !watchedValue);
  const effectiveDisabled = disabled || isLoading || isParentMissing;

  const effectivePlaceholder = isParentMissing
    ? "Seleccione la dependencia..."
    : isLoading
      ? "Cargando..."
      : placeholder;

  return (
    <FormField id={config.name} label={config.label ?? ""} error={error} required={config.required}>
      <Combobox
        id={config.name}
        options={options}
        value={value}
        onValueChange={onChange}
        disabled={effectiveDisabled}
        placeholder={effectivePlaceholder}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        clearable
      />
    </FormField>
  );
}
