"use client";

import { useForm, useWatch } from "react-hook-form";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Switch } from "@/components/atoms/switch/switch";
import { Typography } from "@/components/atoms/typography";
import { PhoneInputGroup } from "@/components/molecules";
import { FormActions } from "@/components/molecules/form-actions";
import { FormField } from "@/components/molecules/form-field";
import { FormSection } from "@/components/molecules/form-section/form-section";
import { PageHeader } from "@/components/molecules/page-header";
import { RelationField } from "@/components/molecules/relation-field";
import type { ApiError } from "@/lib/http/interceptors/error.interceptor";
import type {
  BaseEntity,
  BaseQueryParams,
  CrudHooks,
  CrudModuleConfig,
  FormFieldConfig,
  FormRenderProps,
} from "@/shared/types/crud-module.types";
import { notify } from "@/shared/utils/notify";

export interface EntityFormPageProps<
  TEntity extends BaseEntity & { name?: string },
  TDto,
  TFormValues extends FieldValues,
  TQueryParams extends BaseQueryParams = BaseQueryParams,
  TColumnId extends string = string,
> {
  config: CrudModuleConfig<TEntity, TDto, TFormValues, TQueryParams, TColumnId>;
  hooks: CrudHooks<TEntity, TFormValues, TQueryParams>;
  mode: "create" | "edit";
  id?: string;
}

export function EntityFormPage<
  TEntity extends BaseEntity & { name?: string },
  TDto,
  TFormValues extends FieldValues,
  TQueryParams extends BaseQueryParams = BaseQueryParams,
  TColumnId extends string = string,
>({
  config,
  hooks,
  mode,
  id,
}: EntityFormPageProps<TEntity, TDto, TFormValues, TQueryParams, TColumnId>) {
  const t = useTranslations(config.translationNamespace);
  const commonT = useTranslations("common");
  const validationT = useTranslations("validation");
  const errorsT = useTranslations("errors");
  const router = useRouter();

  const isEdit = mode === "edit";
  const detailQuery = hooks.useDetail(id ?? "");
  const createMutation = hooks.useCreate();
  const updateMutation = hooks.useUpdate();

  const initialEntity = detailQuery.data;

  const formValues = React.useMemo<TFormValues>(() => {
    if (!config.form) return {} as TFormValues;
    if (isEdit && initialEntity) {
      if (typeof config.form.defaultValues === "function") {
        return config.form.defaultValues(initialEntity);
      }
      const values = { ...config.form.defaultValues } as Record<string, unknown>;
      const entityObj = initialEntity as Record<string, unknown>;
      Object.keys(values).forEach((key) => {
        if (key in entityObj && entityObj[key] !== undefined) {
          values[key] = entityObj[key];
        }
      });
      return values as TFormValues;
    }
    if (typeof config.form.defaultValues === "function") {
      return config.form.defaultValues(undefined);
    }
    return config.form.defaultValues;
  }, [config.form, initialEntity, isEdit]);

  const form = useForm<TFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: formValues as any,
  });

  React.useEffect(() => {
    if (initialEntity && isEdit) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form.reset(formValues as any);
    }
  }, [initialEntity, isEdit, formValues, form]);

  const handleCancel = React.useCallback(() => {
    router.back();
  }, [router]);

  const handleSubmit = React.useCallback(
    async (values: TFormValues) => {
      form.clearErrors();

      if (config.form?.schema) {
        const parsed = config.form.schema.safeParse(values);
        if (!parsed.success) {
          parsed.error.issues.forEach((issue) => {
            const fieldPath = issue.path[0] as FieldPath<TFormValues>;
            if (fieldPath) {
              let message = issue.message;
              const issueWithMeta = issue as typeof issue & { minimum?: number; maximum?: number };
              if (issue.code === "too_small") {
                const minVal = Number(issueWithMeta.minimum);
                message =
                  minVal === 1
                    ? validationT("required")
                    : validationT("minLength", { min: minVal });
              } else if (issue.code === "too_big") {
                const maxVal = Number(issueWithMeta.maximum);
                message = validationT("maxLength", { max: maxVal });
              } else if (
                String(issue.code).includes("invalid_string") ||
                String(issue.code).includes("email")
              ) {
                message = validationT("email");
              } else if (String(issue.code).includes("enum")) {
                message = validationT("invalidOption");
              }

              form.setError(fieldPath, {
                type: "validation",
                message,
              });
            }
          });
          return;
        }
        values = parsed.data;
      }

      try {
        if (isEdit && id) {
          await updateMutation.mutateAsync({ id, data: values });
        } else {
          await createMutation.mutateAsync(values);
        }
        router.back();
      } catch (e: unknown) {
        const apiErr = e as ApiError;
        const codeKey = apiErr?.code ? `codes.${apiErr.code}` : null;
        let displayMessage: string;

        if (codeKey && errorsT.has(codeKey as Parameters<typeof errorsT.has>[0])) {
          displayMessage = errorsT(codeKey as Parameters<typeof errorsT>[0]);
        } else if (apiErr?.message) {
          displayMessage = apiErr.message;
        } else {
          displayMessage = errorsT("generic");
        }

        notify.error(displayMessage);
      }
    },
    [config.form, createMutation, errorsT, form, id, isEdit, router, updateMutation, validationT]
  );

  if (isEdit && detailQuery.isPending) {
    return (
      <main className="space-y-6">
        <Typography variant="body" className="text-muted-foreground">
          {t("states.loading" as Parameters<typeof t>[0])}
        </Typography>
      </main>
    );
  }

  if (isEdit && (detailQuery.isError || !detailQuery.data)) {
    return (
      <main className="space-y-6">
        <Typography variant="h3">{t("states.errorTitle" as Parameters<typeof t>[0])}</Typography>
        <Typography variant="body" className="text-muted-foreground">
          {t("states.errorDescription" as Parameters<typeof t>[0])}
        </Typography>
      </main>
    );
  }

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || form.formState.isSubmitting;

  const title = isEdit
    ? t("actions.editTitle" as Parameters<typeof t>[0])
    : t("actions.createTitle" as Parameters<typeof t>[0]);
  const subtitle = isEdit
    ? t("actions.editDescription" as Parameters<typeof t>[0])
    : t("actions.createDescription" as Parameters<typeof t>[0]);

  const formProps: FormRenderProps<TEntity, TFormValues> = {
    mode,
    initialValues: initialEntity,
    onSubmit: handleSubmit,
    isSubmitting,
    onCancel: handleCancel,
  };

  return (
    <main className="space-y-6">
      <PageHeader title={title} subtitle={subtitle} />

      {config.form?.renderForm ? (
        config.form.renderForm(formProps)
      ) : (
        <FormSection className="p-6">
          <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
            <div className="grid gap-4 md:grid-cols-2">
              {config.form?.fields?.map((field) => (
                <RenderFormField
                  key={field.name}
                  field={field}
                  form={form}
                  translationNamespace={config.translationNamespace}
                />
              ))}
            </div>

            <FormActions
              submitLabel={
                isEdit
                  ? t("form.submitEdit" as Parameters<typeof t>[0])
                  : t("form.submitCreate" as Parameters<typeof t>[0])
              }
              isSubmitting={isSubmitting}
              cancelLabel={commonT("cancel")}
              onCancel={handleCancel}
              submitButtonProps={{ className: "min-w-32" }}
            />
          </form>
        </FormSection>
      )}
    </main>
  );
}

function RenderFormField<TFormValues extends FieldValues>({
  field,
  form,
  translationNamespace,
}: {
  field: FormFieldConfig;
  form: UseFormReturn<TFormValues>;
  translationNamespace: string;
}) {
  const t = useTranslations(translationNamespace);
  const { register, control, setValue, formState } = form;
  const fieldName = field.name as FieldPath<TFormValues>;
  const error = formState.errors[field.name]?.message?.toString();

  // useWatch must be called unconditionally — always observe; value may be undefined for non-switch/custom fields
  const watchedVal = useWatch({ control, name: fieldName });

  const label =
    field.type !== "custom" && "label" in field && field.label
      ? field.label
      : t(`form.${field.name}Label` as Parameters<typeof t>[0]);

  const gridSpanClass = field.gridSpan === 2 ? "md:col-span-2" : undefined;

  if (
    field.type === "text" ||
    field.type === "email" ||
    field.type === "number" ||
    field.type === "password"
  ) {
    return (
      <div className={gridSpanClass}>
        <FormField
          id={field.name}
          label={label}
          type={field.type}
          placeholder={
            field.placeholder ?? t(`form.${field.name}Placeholder` as Parameters<typeof t>[0])
          }
          autoComplete="off"
          error={error}
          required={field.required}
          {...register(fieldName)}
        />
      </div>
    );
  }

  if (field.type === "phone") {
    const countryCodeField = field.countryCodeName as FieldPath<TFormValues> | undefined;
    const countryCodeError = countryCodeField
      ? formState.errors[field.countryCodeName!]?.message?.toString()
      : undefined;

    return (
      <div className={gridSpanClass}>
        <FormField
          id={field.name}
          label={label}
          required={field.required}
          error={error || countryCodeError}
        >
          {countryCodeField ? (
            <PhoneInputGroup
              countryCodeProps={register(countryCodeField)}
              phoneNumberProps={register(fieldName)}
              countryCodeError={countryCodeError}
              phoneNumberError={error}
              defaultCountryCode={field.defaultCountryCode}
              placeholder={
                field.placeholder ?? t(`form.${field.name}Placeholder` as Parameters<typeof t>[0])
              }
              hideErrorMessage={true}
            />
          ) : (
            <PhoneInputGroup
              value={typeof watchedVal === "string" ? watchedVal : ""}
              onChange={(val: string) =>
                setValue(fieldName, val as Parameters<typeof setValue>[1], {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              phoneNumberError={error}
              defaultCountryCode={field.defaultCountryCode}
              placeholder={
                field.placeholder ?? t(`form.${field.name}Placeholder` as Parameters<typeof t>[0])
              }
              hideErrorMessage={true}
            />
          )}
        </FormField>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className={`grid gap-2 ${gridSpanClass || ""}`}>
        <label className="text-sm font-medium" htmlFor={field.name}>
          {label}
        </label>
        <select
          id={field.name}
          className="border-input bg-background text-foreground focus-visible:border-primary focus-visible:ring-primary/20 h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-1"
          {...register(fieldName)}
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.translationKey as Parameters<typeof t>[0])}
            </option>
          ))}
        </select>
        {error ? (
          <Typography variant="caption" className="text-destructive">
            {error}
          </Typography>
        ) : null}
      </div>
    );
  }

  if (field.type === "relation") {
    return (
      <RelationFormFieldWrapper
        field={field}
        form={form}
        label={label}
        error={error}
        gridSpanClass={gridSpanClass}
      />
    );
  }

  if (field.type === "switch") {
    return (
      <div className={`flex items-center gap-3 ${gridSpanClass || ""}`}>
        <Switch
          id={field.name}
          checked={Boolean(watchedVal)}
          onCheckedChange={(checked: boolean) =>
            setValue(fieldName, checked as Parameters<typeof setValue>[1])
          }
        />
        <label htmlFor={field.name} className="cursor-pointer text-sm font-medium">
          {label}
        </label>
      </div>
    );
  }

  if (field.type === "custom") {
    return (
      <div className={gridSpanClass}>
        {field.render({
          value: watchedVal,
          onChange: (v) => setValue(fieldName, v as Parameters<typeof setValue>[1]),
          error,
        })}
      </div>
    );
  }

  return null;
}

function RelationFormFieldWrapper<TFormValues extends FieldValues>({
  field,
  form,
  label,
  error,
  gridSpanClass,
}: {
  field: Extract<FormFieldConfig, { type: "relation" }>;
  form: UseFormReturn<TFormValues>;
  label: string;
  error?: string;
  gridSpanClass?: string;
}) {
  const { control, setValue } = form;
  const fieldName = field.name as FieldPath<TFormValues>;
  const val = useWatch({ control, name: fieldName });

  const dependsOnFieldName = field.relation.dependsOn?.field as FieldPath<TFormValues> | undefined;
  const watchedParentValue = useWatch({
    control,
    name: dependsOnFieldName as FieldPath<TFormValues>,
    disabled: !dependsOnFieldName,
  }) as string | undefined;

  const previousParentValueRef = React.useRef<string | undefined>(watchedParentValue);

  React.useEffect(() => {
    if (dependsOnFieldName) {
      if (
        previousParentValueRef.current !== undefined &&
        previousParentValueRef.current !== watchedParentValue
      ) {
        setValue(fieldName, "" as Parameters<typeof setValue>[1]);
      }
      previousParentValueRef.current = watchedParentValue;
    }
  }, [watchedParentValue, dependsOnFieldName, fieldName, setValue]);

  return (
    <div className={gridSpanClass}>
      <RelationField
        config={{ ...field, label }}
        value={typeof val === "string" ? val : ""}
        onChange={(newVal) => setValue(fieldName, newVal as Parameters<typeof setValue>[1])}
        error={error}
        watchedValue={watchedParentValue}
      />
    </div>
  );
}
