"use client";

import { AlertTriangle, Check, CheckCircle2, Eye, EyeOff, UserCheck } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button, Spinner, Typography } from "@/components/atoms";
import { AuthFeedback, FormActions, FormField } from "@/components/molecules";
import { AuthCard } from "@/components/templates/auth/auth-card";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/shared/utils/form-validation-helper";

import { activateApi } from "../api/activate.api";
import { ActivateUserFormValues, activateUserSchema } from "../schemas/auth.schema";
import type { ActivateVerifyResponseDto, ActivationScreenState } from "../types/activate.types";

const ACTIVATION_TOKEN_STORAGE_KEY = "appam_activation_token";

function resolveActivationToken(rawUrlToken: string): string {
  if (rawUrlToken) {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(ACTIVATION_TOKEN_STORAGE_KEY, rawUrlToken);
      } catch {
        // Ignorar errores en entornos con storage restringido
      }
    }
    return rawUrlToken;
  }

  if (typeof window !== "undefined") {
    try {
      return sessionStorage.getItem(ACTIVATION_TOKEN_STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  }

  return "";
}

function cleanupActivationToken(): void {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(ACTIVATION_TOKEN_STORAGE_KEY);
    } catch {
      // Ignorar
    }
  }
}

function mapVerificationErrorToState(err: unknown): ActivationScreenState {
  const errorStatus = (err as { status?: number })?.status;
  const errorDetails = (err as { details?: unknown })?.details;

  if (
    errorStatus === 409 ||
    errorDetails === "ACCOUNT_ALREADY_ACTIVE" ||
    errorDetails === "TOKEN_ALREADY_USED"
  ) {
    return "ACCOUNT_ALREADY_ACTIVE";
  }

  if (errorStatus === 401) {
    if (errorDetails === "TOKEN_EXPIRED") {
      return "EXPIRED";
    }
    if (errorDetails === "TOKEN_INVALID") {
      return "INVALID";
    }
  }

  if (errorStatus && errorStatus >= 400 && errorStatus < 500) {
    return "INVALID";
  }

  return "NETWORK_ERROR";
}

export interface ActivatePageContentProps {
  className?: string;
}

export function ActivatePageContent({ className }: ActivatePageContentProps) {
  const t = useTranslations("auth.activate");
  const validationT = useTranslations("validation");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawUrlToken = searchParams.get("token")?.trim() ?? "";

  // Resolver y preservar el token síncronamente en el render
  const token = useMemo(() => {
    return resolveActivationToken(rawUrlToken);
  }, [rawUrlToken]);

  // Si no hay token provisto, ir directo a INVALID sin consultar el backend
  const [screenState, setScreenState] = useState<ActivationScreenState>(() => {
    return token ? "LOADING" : "INVALID";
  });
  const [verifiedData, setVerifiedData] = useState<ActivateVerifyResponseDto | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sanitizar inmediatamente el token de la barra de direcciones del navegador
  useEffect(() => {
    if (typeof window !== "undefined" && rawUrlToken) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [rawUrlToken]);

  const handleRetry = useCallback(() => {
    if (!token) return;

    setScreenState("LOADING");
    activateApi
      .verifyActivationToken(token)
      .then((data) => {
        setVerifiedData(data);
        setScreenState("VALID");
      })
      .catch((err: unknown) => {
        setScreenState(mapVerificationErrorToState(err));
      });
  }, [token]);

  // Verificación temprana del token contra el backend
  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    activateApi
      .verifyActivationToken(token)
      .then((data) => {
        if (!isMounted) return;
        setVerifiedData(data);
        setScreenState("VALID");
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setScreenState(mapVerificationErrorToState(err));
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const {
    register,
    getValues,
    setError,
    clearErrors,
    setValue,
    control,
    formState: { errors },
  } = useForm<ActivateUserFormValues>({
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (token) {
      setValue("token", token);
    }
  }, [token, setValue]);

  // Manejo de cuenta regresiva al activar exitosamente
  useEffect(() => {
    if (!isSuccess) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(`/${locale}/login`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess, locale, router]);

  // Cálculo interactivo de fortaleza de contraseña
  const passwordValue = useWatch({ control, name: "password" }) || "";
  const hasMinLength = passwordValue.length >= 8;
  const hasCase = /[a-z]/.test(passwordValue) && /[A-Z]/.test(passwordValue);
  const hasNumberOrSymbol = /[0-9]/.test(passwordValue) || /[^a-zA-Z0-9]/.test(passwordValue);

  const passedRequirementsCount = [hasMinLength, hasCase, hasNumberOrSymbol].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (passwordValue.length === 0) return null;
    if (passedRequirementsCount === 1) return t("strengthWeak");
    if (passedRequirementsCount === 2) return t("strengthMedium");
    return t("strengthStrong");
  };

  const getStrengthColor = () => {
    if (passedRequirementsCount === 1) return "bg-destructive text-destructive";
    if (passedRequirementsCount === 2) return "bg-amber-500 text-amber-500";
    return "bg-emerald-500 text-emerald-500";
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setErrorMessage(null);

    const values = getValues();
    if (!values.token && token) {
      values.token = token;
    }

    const parsed = activateUserSchema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof ActivateUserFormValues;
        if (fieldName) {
          setError(fieldName, { type: "manual", message: issue.message });
        }
      });
      return;
    }

    setIsLoading(true);

    try {
      await activateApi.activateUser({
        token: parsed.data.token.trim(),
        password: parsed.data.password,
      });

      cleanupActivationToken();
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : t("errorGeneric");
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Estado 1: LOADING (Cargando verificación temprana)
  if (screenState === "LOADING") {
    return (
      <div className={cn("w-full", className)}>
        <AuthCard title={t("loadingTitle")} description={t("loadingDescription")}>
          <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
            <Spinner className="size-8" />
            <Typography variant="body" className="text-muted-foreground text-xs">
              {t("loadingDescription")}
            </Typography>
          </div>
        </AuthCard>
      </div>
    );
  }

  // Estado 2: ACCOUNT_ALREADY_ACTIVE (Cuenta ya activada previamente)
  if (screenState === "ACCOUNT_ALREADY_ACTIVE") {
    return (
      <div className={cn("w-full", className)}>
        <AuthCard title={t("alreadyActiveTitle")} description={t("alreadyActiveDescription")}>
          <div className="space-y-6 pt-4 text-center">
            <div className="border-border bg-muted/40 flex flex-col items-center justify-center rounded-xl border p-6">
              <div className="bg-primary/10 text-primary mb-3 flex size-14 items-center justify-center rounded-full">
                <CheckCircle2 className="size-8" aria-hidden="true" />
              </div>
              <Typography variant="h3" className="text-foreground text-base font-semibold">
                {t("alreadyActiveTitle")}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground mt-1 text-xs">
                {t("alreadyActiveDescription")}
              </Typography>
            </div>

            <Button
              type="button"
              className="w-full"
              onClick={() => {
                cleanupActivationToken();
                router.push(`/${locale}/login`);
              }}
            >
              {t("goToLogin")}
            </Button>
          </div>
        </AuthCard>
      </div>
    );
  }

  // Estado 3: EXPIRED (Token expirado >24 horas)
  if (screenState === "EXPIRED") {
    return (
      <div className={cn("w-full", className)}>
        <AuthCard title={t("expiredTitle")} description={t("expiredDescription")}>
          <div className="space-y-6 pt-4 text-center">
            <div className="border-border bg-warning/10 text-warning flex flex-col items-center justify-center rounded-xl border p-6">
              <div className="bg-warning/20 mb-3 flex size-14 items-center justify-center rounded-full">
                <AlertTriangle className="size-8" aria-hidden="true" />
              </div>
              <Typography variant="h3" className="text-foreground text-base font-semibold">
                {t("expiredTitle")}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground mt-1 text-xs">
                {t("expiredDescription")}
              </Typography>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  cleanupActivationToken();
                  router.push(`/${locale}/forgot-password`);
                }}
              >
                {t("requestNewLink")}
              </Button>
              <Link
                href={`/${locale}/login`}
                className="text-muted-foreground hover:text-foreground text-xs underline"
                onClick={() => cleanupActivationToken()}
              >
                {t("goToLogin")}
              </Link>
            </div>
          </div>
        </AuthCard>
      </div>
    );
  }

  // Estado 4: INVALID (Token inválido, alterado o no provisto)
  if (screenState === "INVALID") {
    return (
      <div className={cn("w-full", className)}>
        <AuthCard title={t("invalidTitle")} description={t("invalidDescription")}>
          <div className="space-y-6 pt-4 text-center">
            <div className="border-border bg-destructive/10 text-destructive flex flex-col items-center justify-center rounded-xl border p-6">
              <div className="bg-destructive/20 mb-3 flex size-14 items-center justify-center rounded-full">
                <AlertTriangle className="size-8" aria-hidden="true" />
              </div>
              <Typography variant="h3" className="text-foreground text-base font-semibold">
                {t("invalidTitle")}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground mt-1 text-xs">
                {t("invalidDescription")}
              </Typography>
            </div>

            <Button
              type="button"
              className="w-full"
              onClick={() => {
                cleanupActivationToken();
                router.push(`/${locale}/login`);
              }}
            >
              {t("goToLogin")}
            </Button>
          </div>
        </AuthCard>
      </div>
    );
  }

  // Estado de Fallo de Red o Servidor (500 / Network error)
  if (screenState === "NETWORK_ERROR") {
    return (
      <div className={cn("w-full", className)}>
        <AuthCard title={t("networkErrorTitle")} description={t("networkErrorDescription")}>
          <div className="space-y-6 pt-4 text-center">
            <div className="border-border bg-muted/40 flex flex-col items-center justify-center rounded-xl border p-6">
              <div className="bg-muted text-foreground mb-3 flex size-14 items-center justify-center rounded-full">
                <AlertTriangle className="size-8" aria-hidden="true" />
              </div>
              <Typography variant="h3" className="text-foreground text-base font-semibold">
                {t("networkErrorTitle")}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground mt-1 text-xs">
                {t("networkErrorDescription")}
              </Typography>
            </div>

            <Button type="button" className="w-full" onClick={handleRetry}>
              {t("retryVerification")}
            </Button>
          </div>
        </AuthCard>
      </div>
    );
  }

  // Estado de Éxito tras enviar el formulario (Post-submit)
  if (isSuccess) {
    return (
      <div className={cn("w-full", className)}>
        <AuthCard title={t("successTitle")} description={t("successDescription")}>
          <div className="space-y-6 pt-4 text-center">
            <div className="border-border bg-muted/40 flex flex-col items-center justify-center rounded-xl border p-6">
              <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="size-8" aria-hidden="true" />
              </div>
              <Typography variant="h3" className="text-foreground text-base font-semibold">
                {t("successTitle")}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground mt-1 text-xs">
                {t("successDescription")}
              </Typography>
            </div>

            <Typography variant="caption" className="text-muted-foreground block text-xs">
              {t("redirectingCountdown", { seconds: countdown })}
            </Typography>

            <Button
              type="button"
              className="w-full"
              onClick={() => router.push(`/${locale}/login`)}
            >
              {t("goToLoginNow")}
            </Button>
          </div>
        </AuthCard>
      </div>
    );
  }

  // Estado 5: VALID (Formulario activo para ingresar y confirmar contraseña)
  return (
    <div className={cn("w-full", className)}>
      <AuthCard title={t("title")} description={t("description")}>
        {/* Banner de saludo personalizado con correo y nombre */}
        {verifiedData && (
          <div className="bg-primary/10 border-primary/20 mb-4 flex items-start gap-3 rounded-lg border p-3.5">
            <UserCheck className="text-primary mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div>
              <Typography variant="caption" className="text-foreground text-xs font-semibold">
                {t("personalGreeting", {
                  name: verifiedData.name,
                  email: verifiedData.email,
                })}
              </Typography>
            </div>
          </div>
        )}

        {errorMessage ? (
          <div className="mb-4">
            <AuthFeedback tone="error" message={errorMessage} />
          </div>
        ) : null}

        <form className="space-y-4" method="POST" noValidate onSubmit={handleFormSubmit}>
          <input type="hidden" {...register("token")} />

          {/* Campo: Nueva Contraseña */}
          <div className="space-y-1.5">
            <FormField
              id="password"
              label={t("newPasswordLabel")}
              type={showPassword ? "text" : "password"}
              required
              disabled={isLoading}
              placeholder="••••••••"
              error={getErrorMessage(errors.password, validationT)}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="hover:text-foreground cursor-pointer focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
              {...register("password")}
            />

            {/* Medidor visual de fortaleza */}
            {passwordValue.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{t("strengthLabel")}</span>
                  <span className={cn("font-semibold", getStrengthColor())}>
                    {getStrengthLabel()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div
                    className={cn(
                      "h-1.5 rounded-full transition-colors",
                      passedRequirementsCount >= 1 ? getStrengthColor() : "bg-muted"
                    )}
                  />
                  <div
                    className={cn(
                      "h-1.5 rounded-full transition-colors",
                      passedRequirementsCount >= 2 ? getStrengthColor() : "bg-muted"
                    )}
                  />
                  <div
                    className={cn(
                      "h-1.5 rounded-full transition-colors",
                      passedRequirementsCount >= 3 ? getStrengthColor() : "bg-muted"
                    )}
                  />
                </div>

                {/* Checklist de requisitos */}
                <div className="bg-muted/30 border-border/50 space-y-1 rounded-lg border p-2.5 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "size-3.5",
                        hasMinLength ? "text-emerald-500" : "text-muted-foreground/40"
                      )}
                    />
                    <span
                      className={
                        hasMinLength ? "text-foreground font-medium" : "text-muted-foreground"
                      }
                    >
                      {t("requirementMinLength")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "size-3.5",
                        hasCase ? "text-emerald-500" : "text-muted-foreground/40"
                      )}
                    />
                    <span
                      className={hasCase ? "text-foreground font-medium" : "text-muted-foreground"}
                    >
                      {t("requirementCase")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "size-3.5",
                        hasNumberOrSymbol ? "text-emerald-500" : "text-muted-foreground/40"
                      )}
                    />
                    <span
                      className={
                        hasNumberOrSymbol ? "text-foreground font-medium" : "text-muted-foreground"
                      }
                    >
                      {t("requirementNumberOrSymbol")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Campo: Confirmar Contraseña */}
          <FormField
            id="confirmPassword"
            label={t("confirmPasswordLabel")}
            type={showConfirmPassword ? "text" : "password"}
            required
            disabled={isLoading}
            placeholder="••••••••"
            error={getErrorMessage(errors.confirmPassword, validationT)}
            endAdornment={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                className="hover:text-foreground cursor-pointer focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            {...register("confirmPassword")}
          />

          <FormActions
            submitLabel={isLoading ? t("loading") : t("submit")}
            isSubmitting={isLoading}
            isSubmitDisabled={isLoading}
            submitButtonProps={{ className: "w-full" }}
          />
        </form>

        <div className="mt-4 text-center">
          <Link href={`/${locale}/login`} className="text-primary text-sm hover:underline">
            {t("backToLogin")}
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}
