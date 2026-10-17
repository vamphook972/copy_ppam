"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

import { useAuth } from "@/providers";
import {
  ForgotPasswordFormValues,
  forgotPasswordSchema,
} from "@/features/auth/schemas/auth.schema";
import { AuthFeedback, FormActions, FormField } from "@/components/molecules";
import { AuthCard } from "@/components/templates/auth";
import { getErrorMessage } from "@/shared/utils/form-validation-helper";
import { saveResetTokenToSession } from "@/shared/utils/reset-token";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const validationT = useTranslations("validation");
  const locale = useLocale();
  const { forgotPassword } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: "",
    },
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const values = getValues();
    const parsed = forgotPasswordSchema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof ForgotPasswordFormValues;
        if (fieldName) {
          setError(fieldName, { type: "manual", message: issue.message });
        }
      });
      return;
    }

    setIsLoading(true);

    try {
      const normalizedEmail = parsed.data.email.trim();
      saveResetTokenToSession(normalizedEmail);
      await forgotPassword({ email: normalizedEmail });
    } catch {
      // Ignorar error intencionalmente para evitar la enumeración de usuarios
    } finally {
      setIsLoading(false);
      setIsSubmitted(true);
    }
  };

  return (
    <AuthCard title={t("title")} description={t("description")}>
      <div className="mb-4 grid gap-2">
        {isSubmitted ? <AuthFeedback tone="success" message={t("success")} /> : null}
      </div>

      <form className="space-y-4" method="POST" noValidate onSubmit={handleFormSubmit}>
        <FormField
          id="email"
          label={t("emailLabel")}
          type="email"
          autoComplete="email"
          required
          disabled={isLoading || isSubmitted}
          error={getErrorMessage(errors.email, validationT)}
          {...register("email")}
        />

        {isSubmitted ? (
          <div className="pt-2">
            <Link
              href={`/${locale}/reset-password`}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring flex h-10 w-full items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("submit")}
            </Link>
          </div>
        ) : (
          <FormActions
            submitLabel={isLoading ? t("loading") : t("submit")}
            isSubmitting={isLoading}
            isSubmitDisabled={isLoading}
            submitButtonProps={{ className: "w-full" }}
          />
        )}
      </form>

      <div className="mt-4">
        <Link href={`/${locale}/login`} className="text-primary text-sm hover:underline">
          {t("backToLogin")}
        </Link>
      </div>
    </AuthCard>
  );
}
