"use client";

import { AlertTriangleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { Button, Spinner, Typography } from "@/components/atoms";
import { FormActions } from "@/components/molecules";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { notify } from "@/shared/utils/notify";

import { registerApi } from "../api/register-invitation.api";
import {
  registerWizardSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  type RegisterWizardFormValues,
} from "../schemas/register-wizard.schema";
import type { ValidateInvitationResponseDto } from "../types/register.types";
import { SignUpSuccessCard } from "./register-success-card";
import { Step1Account } from "./step-1-account";
import { Step2Personal } from "./step-2-personal";
import { Step3Languages } from "./step-3-languages";
import { Step4Availability } from "./step-4-availability";
import { WizardStepper } from "./wizard-stepper";

const INVITATION_TOKEN_STORAGE_KEY = "appam_invitation_token";

function resolveInvitationToken(rawUrlToken: string): string {
  if (rawUrlToken) {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(INVITATION_TOKEN_STORAGE_KEY, rawUrlToken);
      } catch {
        // Ignorar errores si storage está restringido
      }
    }
    return rawUrlToken;
  }

  if (typeof window !== "undefined") {
    try {
      return sessionStorage.getItem(INVITATION_TOKEN_STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  }

  return "";
}

export interface RegisterPageContentProps {
  className?: string;
}

export function RegisterPageContent({ className }: RegisterPageContentProps) {
  const t = useTranslations("register");
  const searchParams = useSearchParams();

  const rawUrlToken = searchParams.get("token")?.trim() ?? "";

  // Resolver y persistir el token de invitación para evitar pérdida al limpiar la URL
  const token = useMemo(() => resolveInvitationToken(rawUrlToken), [rawUrlToken]);

  const [isValidatingToken, setIsValidatingToken] = useState<boolean>(Boolean(token));
  const [tokenData, setTokenData] = useState<ValidateInvitationResponseDto | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(
    token ? null : t("invalidToken.description")
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sanitizar inmediatamente el token de la barra de direcciones del navegador
  useEffect(() => {
    if (typeof window !== "undefined" && rawUrlToken) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [rawUrlToken]);

  const stepsLabels = [
    t("stepper.step1"),
    t("stepper.step2"),
    t("stepper.step3"),
    t("stepper.step4"),
  ];

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<RegisterWizardFormValues>({
    defaultValues: {
      token: token || "",
      firstName: "",
      lastName: "",
      email: "",
      preferredName: "",
      password: "",
      confirmPassword: "",
      gender: "MALE",
      birthDate: "",
      primaryPhone: {
        countryCode: "+57",
        number: "",
      },
      alternatePhones: [],
      maritalStatus: "SINGLE",
      spouseParticipates: false,
      spouseFullName: "",
      baptismDate: "",
      languages: [{ languageCode: "ES", isPrimary: true }],
      availability: [],
    },
  });

  // Validar token de invitación al cargar la página
  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    registerApi
      .validateInvitationToken(token)
      .then((data) => {
        if (!isMounted) return;
        setTokenData(data);
        setValue("token", token);
        setValue("firstName", data.firstName || "");
        setValue("lastName", data.lastName || "");
        setValue("email", data.email);
        setIsValidatingToken(false);
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        const message =
          error && typeof error === "object" && "message" in error
            ? String((error as { message: unknown }).message)
            : t("invalidToken.description");
        setTokenError(message);
        setIsValidatingToken(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token, setValue, t]);

  const handleNextStep = async () => {
    let isValid = false;

    if (currentStep === 1) {
      const step1Values = {
        password: getValues("password"),
        confirmPassword: getValues("confirmPassword"),
      };
      const result = step1Schema.safeParse(step1Values);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof RegisterWizardFormValues;
          if (path) {
            setError(path, { type: "manual", message: issue.message });
          }
        });
        isValid = false;
      } else {
        clearErrors(["password", "confirmPassword"]);
        isValid = true;
      }
    } else if (currentStep === 2) {
      const step2Values = {
        gender: getValues("gender"),
        birthDate: getValues("birthDate"),
        primaryPhone: getValues("primaryPhone"),
        maritalStatus: getValues("maritalStatus"),
        spouseParticipates: getValues("spouseParticipates"),
        spouseFullName: getValues("spouseFullName"),
      };
      const result = step2Schema.safeParse(step2Values);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          if (issue.path[0] === "primaryPhone" && issue.path[1] === "number") {
            setError("primaryPhone.number", { type: "manual", message: issue.message });
          } else if (issue.path[0] === "primaryPhone" && issue.path[1] === "countryCode") {
            setError("primaryPhone.countryCode", { type: "manual", message: issue.message });
          } else {
            const path = issue.path[0] as keyof RegisterWizardFormValues;
            if (path) {
              setError(path, { type: "manual", message: issue.message });
            }
          }
        });
        isValid = false;
      } else {
        clearErrors(["gender", "birthDate", "primaryPhone", "maritalStatus", "spouseFullName"]);
        isValid = true;
      }
    } else if (currentStep === 3) {
      const step3Values = {
        baptismDate: getValues("baptismDate"),
        languages: getValues("languages"),
      };
      const result = step3Schema.safeParse(step3Values);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof RegisterWizardFormValues;
          if (path) {
            setError(path, { type: "manual", message: issue.message });
          }
        });
        isValid = false;
      } else {
        clearErrors(["baptismDate", "languages"]);
        isValid = true;
      }
    } else {
      isValid = true;
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onFinalSubmit = async (values: RegisterWizardFormValues) => {
    const activeToken = token || values.token;
    if (!activeToken) return;

    const valuesToValidate = {
      ...values,
      token: activeToken,
    };

    const fullResult = registerWizardSchema.safeParse(valuesToValidate);
    if (!fullResult.success) {
      notify.error(t("invalidToken.description"));
      return;
    }

    setIsSubmitting(true);
    try {
      await registerApi.registerParticipant({
        token: activeToken,
        password: values.password,
        phoneNumber: `${values.primaryPhone.countryCode}${values.primaryPhone.number}`,
        preferredName: values.preferredName || null,
        phones: {
          primary: {
            countryCode: values.primaryPhone.countryCode,
            number: values.primaryPhone.number,
          },
          alternate: values.alternatePhones || null,
        },
        gender: values.gender,
        birthDate: values.birthDate,
        baptismDate: values.baptismDate,
        congregationId: values.congregationId || null,
        languages: values.languages || [{ languageCode: "ES", isPrimary: true }],
        maritalStatus: values.maritalStatus,
        spouse: values.spouseParticipates
          ? {
              participatesInPpam: true,
              fullName: values.spouseFullName || null,
            }
          : null,
        availability: values.availability || null,
      });

      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem(INVITATION_TOKEN_STORAGE_KEY);
        } catch {
          // Ignorar
        }
      }

      setIsSuccess(true);
      notify.success(t("success.title"));
    } catch {
      notify.error(t("invalidToken.description"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "bg-card border-border w-full max-w-xl rounded-xl border p-6 shadow-sm sm:p-8",
        className
      )}
    >
      {/* Estado 1: Cargando validación de token */}
      {isValidatingToken && (
        <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
          <Spinner className="size-8" />
          <Typography variant="h2" className="text-foreground text-lg font-bold">
            {t("validating.title")}
          </Typography>
          <Typography variant="caption" className="text-muted-foreground text-xs">
            {t("validating.description")}
          </Typography>
        </div>
      )}

      {/* Estado 2: Error de token inválido / expirado */}
      {!isValidatingToken && tokenError && (
        <div className="space-y-6 py-4 text-center">
          <div className="bg-destructive/10 text-destructive mx-auto flex size-14 items-center justify-center rounded-full">
            <AlertTriangleIcon className="size-8" />
          </div>

          <div className="space-y-2">
            <Typography variant="h2" className="text-foreground text-xl font-bold">
              {t("invalidToken.title")}
            </Typography>
            <Typography
              variant="caption"
              className="text-muted-foreground block text-xs leading-relaxed"
            >
              {tokenError}
            </Typography>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/support"
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold shadow-xs"
              onClick={() => {
                if (typeof window !== "undefined") {
                  try {
                    sessionStorage.removeItem(INVITATION_TOKEN_STORAGE_KEY);
                  } catch {
                    // Ignorar
                  }
                }
              }}
            >
              {t("invalidToken.contactSupport")}
            </Link>
            <Link
              href="/login"
              className="border-border bg-card hover:bg-muted text-foreground flex h-10 w-full items-center justify-center rounded-lg border text-sm font-semibold shadow-2xs"
              onClick={() => {
                if (typeof window !== "undefined") {
                  try {
                    sessionStorage.removeItem(INVITATION_TOKEN_STORAGE_KEY);
                  } catch {
                    // Ignorar
                  }
                }
              }}
            >
              {t("invalidToken.goHome")}
            </Link>
          </div>
        </div>
      )}

      {/* Estado 3: Éxito tras registro */}
      {!isValidatingToken && !tokenError && isSuccess && <SignUpSuccessCard />}

      {/* Estado 4: Wizard de Registro activo */}
      {!isValidatingToken && !tokenError && !isSuccess && tokenData && (
        <div className="space-y-6">
          <div className="space-y-1">
            <Typography
              variant="h1"
              className="text-foreground text-2xl font-extrabold tracking-tight"
            >
              {t("title")}
            </Typography>
            <Typography variant="subtitle" className="text-muted-foreground text-xs">
              {t("subtitle")}
            </Typography>
          </div>

          <WizardStepper currentStep={currentStep} steps={stepsLabels} />

          <form onSubmit={handleSubmit(onFinalSubmit)} className="space-y-6">
            {currentStep === 1 && <Step1Account register={register} errors={errors} />}
            {currentStep === 2 && (
              <Step2Personal
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            )}
            {currentStep === 3 && (
              <Step3Languages
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            )}
            {currentStep === 4 && <Step4Availability watch={watch} setValue={setValue} />}

            {/* Botones de Navegación del Wizard */}
            <div className="border-border/60 flex items-center justify-between border-t pt-4">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={isSubmitting}
                >
                  {t("actions.previous")}
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <Button type="button" variant="default" onClick={handleNextStep}>
                  {t("actions.next")}
                </Button>
              ) : (
                <FormActions
                  submitLabel={isSubmitting ? t("actions.submitting") : t("actions.submit")}
                  isSubmitting={isSubmitting}
                  isSubmitDisabled={isSubmitting}
                />
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
