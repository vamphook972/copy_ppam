"use client";

import { Controller, useForm } from "react-hook-form";
import * as React from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/atoms/button";
import { Typography } from "@/components/atoms/typography";
import { FormField } from "@/components/molecules/form-field";
import { Combobox } from "@/components/ui/combobox";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { notify } from "@/shared/utils/notify";

import { enrollmentsApi } from "../api/enrollments.api";
import {
  contactAttemptFormSchema,
  type ContactAttemptFormValues,
} from "../schemas/contact-attempt-form.schema";
import type { Enrollment } from "../types/enrollment";

export interface RecordContactModalProps {
  enrollment: Enrollment;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RecordContactModal({
  enrollment,
  isOpen,
  onClose,
  onSuccess,
}: RecordContactModalProps) {
  const t = useTranslations("enrollments");

  const form = useForm<ContactAttemptFormValues>({
    defaultValues: {
      method: "PHONE",
      result: "FAILED",
      notes: "",
      nextAttemptAt: "",
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  React.useEffect(() => {
    if (isOpen) {
      reset({
        method: "PHONE",
        result: "FAILED",
        notes: "",
        nextAttemptAt: "",
      });
    }
  }, [isOpen, reset]);

  if (!isOpen) {
    return null;
  }

  const handleFormSubmit = async (values: ContactAttemptFormValues) => {
    const parsed = contactAttemptFormSchema.safeParse(values);
    if (!parsed.success) {
      return;
    }

    try {
      await enrollmentsApi.recordContactAttempt(enrollment.id, {
        method: parsed.data.method,
        result: parsed.data.result,
        notes: parsed.data.notes || null,
        nextAttemptAt: parsed.data.nextAttemptAt
          ? new Date(parsed.data.nextAttemptAt).toISOString()
          : null,
      });

      notify.success(t("notifications.contactAttemptSuccess"));
      onSuccess();
    } catch {
      notify.error(t("states.errorDescription"));
    }
  };

  const methodOptions = [
    { value: "PHONE", label: t("contactAttempt.methodPhone") },
    { value: "WHATSAPP", label: t("contactAttempt.methodWhatsapp") },
    { value: "EMAIL", label: t("contactAttempt.methodEmail") },
    { value: "IN_PERSON", label: t("contactAttempt.methodInPerson") },
    { value: "OTHER", label: t("contactAttempt.methodOther") },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border-border w-full max-w-lg rounded-xl border p-6 shadow-xl">
        <div className="mb-5 flex flex-col gap-1">
          <Typography variant="h3">{t("contactAttempt.modalTitle")}</Typography>
          <Typography variant="body" className="text-muted-foreground text-xs">
            {t("contactAttempt.modalSubtitle")}
          </Typography>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
          {/* Method Select */}
          <Controller
            control={control}
            name="method"
            render={({ field }) => (
              <FormField
                id="contact-method"
                label={t("contactAttempt.methodLabel")}
                error={errors.method?.message}
                required
              >
                <Combobox
                  id="contact-method"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={methodOptions}
                />
              </FormField>
            )}
          />

          {/* Result Radio Group */}
          <Controller
            control={control}
            name="result"
            render={({ field }) => (
              <FormField
                id="contact-result"
                label={t("contactAttempt.resultLabel")}
                error={errors.result?.message}
                required
              >
                <RadioGroup className="grid gap-2 pt-1">
                  <RadioGroupItem
                    name={field.name}
                    value="SUCCESS"
                    checked={field.value === "SUCCESS"}
                    onChange={() => field.onChange("SUCCESS")}
                  >
                    {t("contactAttempt.resultSuccess")}
                  </RadioGroupItem>
                  <RadioGroupItem
                    name={field.name}
                    value="FAILED"
                    checked={field.value === "FAILED"}
                    onChange={() => field.onChange("FAILED")}
                  >
                    {t("contactAttempt.resultFailed")}
                  </RadioGroupItem>
                  <RadioGroupItem
                    name={field.name}
                    value="UNREACHABLE"
                    checked={field.value === "UNREACHABLE"}
                    onChange={() => field.onChange("UNREACHABLE")}
                  >
                    {t("contactAttempt.resultUnreachable")}
                  </RadioGroupItem>
                </RadioGroup>
              </FormField>
            )}
          />

          {/* Notes */}
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <FormField
                id="contact-notes"
                label={t("contactAttempt.notesLabel")}
                error={errors.notes?.message}
              >
                <Textarea
                  id="contact-notes"
                  placeholder={t("contactAttempt.notesPlaceholder")}
                  rows={3}
                  {...field}
                />
              </FormField>
            )}
          />

          {/* Next Attempt At Datetime Picker */}
          <Controller
            control={control}
            name="nextAttemptAt"
            render={({ field }) => (
              <FormField
                id="next-attempt-at"
                label={t("contactAttempt.nextAttemptAtLabel")}
                error={errors.nextAttemptAt?.message}
              >
                <DateTimePicker
                  id="next-attempt-at"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormField>
            )}
          />

          {/* Footer Actions */}
          <div className="mt-6 flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t("contactAttempt.cancelButton")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {t("contactAttempt.submitButton")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
