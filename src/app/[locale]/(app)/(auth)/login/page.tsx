"use client";

import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers";
import { AuthDivider } from "@/features/auth/components";
import {
  LoginFormValues,
  loginSchema,
  NewPasswordRequiredFormValues,
  newPasswordRequiredSchema,
} from "@/features/auth/schemas/auth.schema";
import { Button } from "@/components/atoms";
import { AuthFeedback, FormActions, FormField } from "@/components/molecules";
import { AuthCard } from "@/components/templates/auth/auth-card";
import { getErrorMessage } from "@/shared/utils/form-validation-helper";
import { notify } from "@/shared/utils/notify";

type LoginErrorKey =
  "invalidCredentials" | "challengeRequired" | "oauthNotConfigured" | "unexpectedError";

const interactiveFocusClassName =
  "focus-visible:ring-ring/50 rounded-sm outline-none focus-visible:ring-2";

const federatedProviderButtonClassName = [
  "border-border hover:bg-muted/70",
  "focus-visible:border-ring focus-visible:ring-ring/40",
].join(" ");

const federatedProviders = [
  {
    provider: "Google" as const,
    labelKey: "google" as const,
    iconSrc: "/images/google-icon.svg",
    className: federatedProviderButtonClassName,
  },
  {
    provider: "Apple" as const,
    labelKey: "apple" as const,
    iconSrc: "/images/apple-icon.svg",
    className: federatedProviderButtonClassName,
  },
  {
    provider: "Microsoft" as const,
    labelKey: "microsoft" as const,
    iconSrc: "/images/microsoft-icon.svg",
    className: federatedProviderButtonClassName,
  },
];

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const tFed = useTranslations("auth.federated");
  const validationT = useTranslations("validation");
  const locale = useLocale();
  const router = useRouter();
  const { signInWithCredentials, confirmSignInWithNewPassword, signInWithProvider } = useAuth();

  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);
  const [isFederatedLoading, setIsFederatedLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<LoginErrorKey | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Estado para controlar el challenge NEW_PASSWORD_REQUIRED
  const [isNewPasswordRequired, setIsNewPasswordRequired] = useState(false);

  const {
    register,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    register: registerNewPwd,
    getValues: getValuesNewPwd,
    setError: setErrorNewPwd,
    clearErrors: clearErrorsNewPwd,
    formState: { errors: errorsNewPwd },
  } = useForm<NewPasswordRequiredFormValues>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const isLoading = useMemo(
    () => isCredentialsLoading || isFederatedLoading,
    [isCredentialsLoading, isFederatedLoading]
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setErrorKey(null);

    const values = getValues();
    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof LoginFormValues;
        if (fieldName) {
          setError(fieldName, { type: "manual", message: issue.message });
        }
      });
      return;
    }

    setIsCredentialsLoading(true);

    try {
      const result = await signInWithCredentials({
        email: parsed.data.email.trim(),
        password: parsed.data.password,
      });
      if (result.session?.isAuthenticated) {
        notify.success(t("loginSuccess"));
        router.replace(`/${locale}/home`);
        return;
      }

      if (result.nextStep?.challenge === "NEW_PASSWORD_REQUIRED") {
        setIsNewPasswordRequired(true);
        return;
      }

      if (result.nextStep?.challenge && result.nextStep.challenge !== "NONE") {
        setErrorKey("challengeRequired");
        return;
      }

      setErrorKey("invalidCredentials");
    } catch (error) {
      const errorName =
        typeof error === "object" && error !== null && "name" in error
          ? String((error as { name?: string }).name)
          : "UnknownError";

      if (errorName === "NotAuthorizedException" || errorName === "UserNotFoundException") {
        setErrorKey("invalidCredentials");
      } else {
        setErrorKey("unexpectedError");
      }

      notify.error(t("unexpectedError"));
    } finally {
      setIsCredentialsLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrorsNewPwd();
    setErrorKey(null);

    const values = getValuesNewPwd();
    const parsed = newPasswordRequiredSchema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof NewPasswordRequiredFormValues;
        if (fieldName) {
          setErrorNewPwd(fieldName, { type: "manual", message: issue.message });
        }
      });
      return;
    }

    setIsCredentialsLoading(true);

    try {
      const result = await confirmSignInWithNewPassword({
        newPassword: parsed.data.newPassword,
      });

      if (result.session?.isAuthenticated) {
        notify.success(t("loginSuccess"));
        router.replace(`/${locale}/home`);
        return;
      }

      setErrorKey("unexpectedError");
    } catch {
      setErrorKey("unexpectedError");
      notify.error(t("unexpectedError"));
    } finally {
      setIsCredentialsLoading(false);
    }
  };

  const handleFederatedSignIn = async (provider: "Google" | "Apple" | "Microsoft") => {
    setErrorKey(null);
    setIsFederatedLoading(true);

    try {
      await signInWithProvider({ provider });
    } catch (error) {
      const errorName =
        typeof error === "object" && error !== null && "name" in error
          ? String((error as { name?: string }).name)
          : "UnknownError";

      if (errorName === "OAuthNotConfigureException") {
        setErrorKey("oauthNotConfigured");
      } else {
        setErrorKey("unexpectedError");
      }

      notify.error(t("unexpectedError"));
      setIsFederatedLoading(false);
    }
  };

  if (isNewPasswordRequired) {
    return (
      <AuthCard title={t("newPasswordRequiredTitle")} description={t("newPasswordRequiredSubhead")}>
        {errorKey ? <AuthFeedback tone="error" message={t(errorKey)} /> : null}

        <form className="space-y-4" method="POST" noValidate onSubmit={handleNewPasswordSubmit}>
          <FormField
            id="newPassword"
            label={t("newPasswordLabel")}
            type={showNewPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            disabled={isLoading}
            error={getErrorMessage(errorsNewPwd.newPassword, validationT)}
            endAdornment={
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className={`text-muted-foreground hover:text-foreground p-0.5 ${interactiveFocusClassName}`}
                aria-label={showNewPassword ? t("passwordHide") : t("passwordShow")}
                disabled={isLoading}
              >
                {showNewPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            }
            {...registerNewPwd("newPassword")}
          />

          <FormField
            id="confirmPassword"
            label={t("confirmPasswordLabel")}
            type={showNewPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            disabled={isLoading}
            error={getErrorMessage(errorsNewPwd.confirmPassword, validationT)}
            {...registerNewPwd("confirmPassword")}
          />

          <FormActions
            submitLabel={isCredentialsLoading ? t("savingNewPassword") : t("setNewPasswordButton")}
            isSubmitting={isCredentialsLoading}
            isSubmitDisabled={isLoading}
            submitButtonProps={{ className: "w-full" }}
          />
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("title")} description={t("subhead")}>
      {errorKey ? <AuthFeedback tone="error" message={t(errorKey)} /> : null}

      <form className="space-y-4" method="POST" noValidate onSubmit={handleFormSubmit}>
        <FormField
          id="email"
          label={t("emailField")}
          type="email"
          autoComplete="email"
          required
          disabled={isLoading}
          error={getErrorMessage(errors.email, validationT)}
          {...register("email")}
        />

        <FormField
          id="password"
          label={t("passwordField")}
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          disabled={isLoading}
          error={getErrorMessage(errors.password, validationT)}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={`text-muted-foreground hover:text-foreground p-0.5 ${interactiveFocusClassName}`}
              aria-label={showPassword ? t("passwordHide") : t("passwordShow")}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          }
          {...register("password")}
        />

        <FormActions
          submitLabel={isCredentialsLoading ? t("loading") : t("loginButton")}
          isSubmitting={isCredentialsLoading}
          isSubmitDisabled={isLoading}
          submitButtonProps={{ className: "w-full" }}
          align="between"
          startSlot={
            <Link
              href={`/${locale}/forgot-password`}
              className={`text-primary text-sm hover:underline ${interactiveFocusClassName}`}
            >
              {t("forgotPassword")}
            </Link>
          }
        />
      </form>

      <AuthDivider label={t("continueWith")} />
      <div className="grid grid-cols-3 justify-between gap-2">
        {federatedProviders.map(({ provider, labelKey, iconSrc, className }) => (
          <Button
            key={provider}
            type="button"
            variant="outline"
            disabled={isLoading}
            aria-label={tFed(labelKey)}
            onClick={() => handleFederatedSignIn(provider)}
            className={`justify-center gap-2 ${className}`}
          >
            <Image src={iconSrc} alt="" width={16} height={16} aria-hidden="true" />
            <span>{tFed(labelKey)}</span>
          </Button>
        ))}
      </div>
    </AuthCard>
  );
}
