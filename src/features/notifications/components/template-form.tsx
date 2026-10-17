"use client";

import { Eye, Plus, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Button, Input, Label, Typography } from "@/components/atoms";
import { FormActions, FormField, RichTextEditor } from "@/components/molecules";

import { notificationTemplateSchema } from "../schemas/notification.schema";
import { NotificationTemplate } from "../types/notification";
import { TemplatePreviewDialog } from "./template-preview-dialog";

interface TemplateFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<NotificationTemplate>;
  onSubmit: (values: NotificationTemplate) => Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
}

export function TemplateForm({
  mode,
  initialValues,
  onSubmit,
  submitLabel,
  cancelLabel,
  onCancel,
}: TemplateFormProps) {
  const t = useTranslations("emailTemplates");
  const commonT = useTranslations("common");
  const validationT = useTranslations("validation");

  const [variables, setVariables] = useState<string[]>(initialValues?.variables || []);
  const [newVarInput, setNewVarInput] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors, isSubmitting: formIsSubmitting },
  } = useForm<NotificationTemplate>({
    defaultValues: {
      templateId: initialValues?.templateId || "",
      language: initialValues?.language || "es",
      subject: initialValues?.subject || "",
      description: initialValues?.description || "",
      body: initialValues?.body || "",
      variables: initialValues?.variables || [],
    },
  });

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      reset({
        templateId: initialValues.templateId || "",
        language: initialValues.language || "es",
        subject: initialValues.subject || "",
        description: initialValues.description || "",
        body: initialValues.body || "",
        variables: initialValues.variables || [],
      });
    }
  }, [initialValues, mode, reset]);

  const bodyValue = useWatch({ control, name: "body" });
  const currentFormValues = useWatch({ control });

  const handleAddVariable = () => {
    const trimmed = newVarInput.trim().replace(/[^a-zA-Z0-9_]/g, "");
    if (trimmed && !variables.includes(trimmed)) {
      const updated = [...variables, trimmed];
      setVariables(updated);
      setValue("variables", updated);
      setNewVarInput("");
    }
  };

  const handleRemoveVariable = (varToRemove: string) => {
    const updated = variables.filter((v) => v !== varToRemove);
    setVariables(updated);
    setValue("variables", updated);
  };

  const onFormSubmit = async (data: NotificationTemplate) => {
    clearErrors();

    const parsed = notificationTemplateSchema.safeParse(data);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (field === "templateId") {
          setError("templateId", { type: "validation", message: validationT("required") });
        } else if (field === "subject") {
          setError("subject", { type: "validation", message: validationT("required") });
        } else if (field === "body") {
          setError("body", { type: "validation", message: validationT("required") });
        }
      });

      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ ...parsed.data, variables });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border-border rounded-lg border p-6 shadow-sm">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Template ID */}
          <div className="flex flex-col gap-2">
            <FormField
              id="templateId"
              label={t("form.templateIdLabel")}
              placeholder={t("form.templateIdPlaceholder")}
              autoComplete="off"
              error={errors.templateId?.message}
              required
              disabled={mode === "edit"}
              {...register("templateId")}
            />
          </div>

          {/* Language */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="language">{t("form.languageLabel")}</Label>
            <select
              id="language"
              className="border-input bg-card text-foreground focus:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-hidden focus:ring-2"
              {...register("language")}
            >
              <option value="es">Español (es)</option>
              <option value="en">English (en)</option>
            </select>
            {errors.language && (
              <Typography variant="caption" className="text-destructive">
                {errors.language.message}
              </Typography>
            )}
          </div>
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-2">
          <FormField
            id="subject"
            label={t("form.subjectLabel")}
            placeholder={t("form.subjectPlaceholder", { app_name: "APPAM" })}
            autoComplete="off"
            error={errors.subject?.message}
            required
            {...register("subject")}
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <FormField
            id="description"
            label={t("form.descriptionLabel")}
            placeholder={t("form.descriptionPlaceholder")}
            autoComplete="off"
            error={errors.description?.message}
            {...register("description")}
          />
        </div>

        {/* Variables Section */}
        <div className="border-border bg-muted/20 flex flex-col gap-4 rounded-lg border p-4">
          <div className="flex flex-col gap-1">
            <Label className="font-semibold">{t("form.variablesLabel")}</Label>
            <Typography variant="caption" className="text-muted-foreground">
              {t("form.variablesHelp")}
            </Typography>
          </div>

          {/* Existing Tag Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {variables.map((variable) => (
              <span
                key={variable}
                className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium"
              >
                {`{${variable}}`}
                <button
                  type="button"
                  onClick={() => handleRemoveVariable(variable)}
                  className="hover:text-destructive focus:outline-hidden"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Variable Input Field */}
          <div className="flex max-w-sm items-center gap-2">
            <Input
              value={newVarInput}
              onChange={(e) => setNewVarInput(e.target.value)}
              placeholder={t("form.addVariablePlaceholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddVariable();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={handleAddVariable}>
              <Plus className="mr-1 h-4 w-4" />
              {t("form.addVariableButton")}
            </Button>
          </div>
        </div>

        {/* Body HTML Editor */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="body">
            {t("form.bodyLabel")} <span className="text-destructive">*</span>
          </Label>
          <RichTextEditor
            value={bodyValue || ""}
            onChange={(val) => setValue("body", val, { shouldValidate: true })}
            variables={variables}
          />
          {errors.body && (
            <Typography variant="caption" className="text-destructive">
              {errors.body.message}
            </Typography>
          )}
        </div>

        {/* Form Footer Action Buttons */}
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            disabled={!bodyValue && !currentFormValues.subject}
          >
            <Eye className="mr-2 h-4 w-4" />
            {t("actions.preview")}
          </Button>

          <FormActions
            submitLabel={
              submitLabel || (mode === "create" ? t("form.submitCreate") : t("form.submitUpdate"))
            }
            isSubmitting={isSubmitting || formIsSubmitting}
            cancelLabel={cancelLabel || commonT("cancel")}
            onCancel={onCancel}
            submitButtonProps={{ className: "min-w-32" }}
          />
        </div>
      </form>

      {/* Live Preview Modal */}
      <TemplatePreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        template={{
          templateId: currentFormValues.templateId || "draft-preview",
          language: currentFormValues.language || "es",
          subject: currentFormValues.subject || "",
          body: currentFormValues.body || "",
          description: currentFormValues.description || "",
          variables: variables,
        }}
      />
    </div>
  );
}
