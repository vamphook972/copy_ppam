"use client";

import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/providers";
import { ResetPasswordFormValues, resetPasswordSchema } from "@/features/auth/schemas/auth.schema";
import { AuthFeedback, FormActions, FormField } from "@/components/molecules";
import { AuthCard } from "@/components/templates/auth";
import { getErrorMessage } from "@/shared/utils/form-validation-helper";
import { maskEmail } from "@/shared/utils/mask-email";
import { consumeResetToken } from "@/shared/utils/reset-token";

export default function ResetPasswordPage() {
  const t = useTranslations("auth.resetPassword");
  const validationT = useTranslations("validation");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);
  const urlToken = searchParams.get("token");
  const rawQueryEmail = searchParams.get("email");

  // Resolver el correo electrónico de forma síncrona en el render
  const resolvedEmail = useMemo(() => {
    return consumeResetToken(urlToken) || rawQueryEmail || "";
  }, [rawQueryEmail, urlToken]);

  // Limpiar inmediatamente parámetros sensibles de la barra de direcciones
  useEffect(() => {
    if (typeof window !== "undefined" && (urlToken || rawQueryEmail)) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [rawQueryEmail, urlToken]);

  const isEmailPrefilled = Boolean(resolvedEmail);

  const maskedEmailDisplay = useMemo(() => {
    return resolvedEmail ? maskEmail(resolvedEmail) : "";
  }, [resolvedEmail]);

  const {
    register,
    getValues,
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: {
      email: resolvedEmail,
      code: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    if (resolvedEmail) {
      setValue("email", resolvedEmail);
    }
  }, [resolvedEmail, setValue]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setHasError(false);
    setIsSuccess(false);

    const values = getValues();
    const parsed = resetPasswordSchema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof ResetPasswordFormValues;
        if (fieldName) {
          setError(fieldName, { type: "manual", message: issue.message });
        }
      });
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({
        email: parsed.data.email.trim(),
        code: parsed.data.code.trim(),
        newPassword: parsed.data.newPassword,
      });
      setIsSuccess(true);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title={t("title")} description={t("description")}>
      {isSuccess ? <AuthFeedback tone="success" message={t("success")} /> : null}
      {hasError ? <AuthFeedback tone="error" message={t("error")} /> : null}

      <form className="space-y-4" method="POST" noValidate onSubmit={handleFormSubmit}>
        {isEmailPrefilled ? (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-medium">{t("emailLabel")}</p>
            <div className="bg-muted text-foreground flex h-9 w-full items-center rounded-md border px-3 font-mono text-sm">
              {maskedEmailDisplay}
            </div>
            <input type="hidden" {...register("email")} />
          </div>
        ) : (
          <FormField
            id="email"
            label={t("emailLabel")}
            type="email"
            required
            disabled={isLoading}
            error={getErrorMessage(errors.email, validationT)}
            {...register("email")}
          />
        )}

        <FormField
          id="code"
          label={t("codeLabel")}
          type="text"
          required
          disabled={isLoading}
          error={getErrorMessage(errors.code, validationT)}
          {...register("code")}
        />

        <FormField
          id="newPassword"
          label={t("newPasswordLabel")}
          type="password"
          required
          disabled={isLoading}
          error={getErrorMessage(errors.newPassword, validationT)}
          {...register("newPassword")}
        />

        <FormActions
          submitLabel={isLoading ? t("loading") : t("submit")}
          isSubmitting={isLoading}
          isSubmitDisabled={isLoading}
          submitButtonProps={{ className: "w-full" }}
        />
      </form>

      <div className="mt-4">
        <Link href={`/${locale}/login`} className="text-primary text-sm hover:underline">
          {t("backToLogin")}
        </Link>
      </div>
    </AuthCard>
  );
}
