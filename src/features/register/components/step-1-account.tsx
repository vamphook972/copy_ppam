"use client";

import { Eye, EyeOff } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { FormField } from "@/components/molecules";
import { getErrorMessage } from "@/shared/utils/form-validation-helper";

import type { RegisterWizardFormValues } from "../schemas/register-wizard.schema";

interface Step1AccountProps {
  register: UseFormRegister<RegisterWizardFormValues>;
  errors: FieldErrors<RegisterWizardFormValues>;
}

export function Step1Account({ register, errors }: Step1AccountProps) {
  const t = useTranslations("register.step1");
  const validationT = useTranslations("validation");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="firstName" label={t("firstName")} disabled {...register("firstName")} />

        <FormField id="lastName" label={t("lastName")} disabled {...register("lastName")} />
      </div>

      <FormField id="email" label={t("email")} type="email" disabled {...register("email")} />

      <FormField
        id="preferredName"
        label={t("preferredName")}
        placeholder={t("preferredNamePlaceholder")}
        error={getErrorMessage(errors.preferredName, validationT)}
        {...register("preferredName")}
      />

      <FormField
        id="password"
        label={t("password")}
        type={showPassword ? "text" : "password"}
        required
        error={getErrorMessage(errors.password, validationT)}
        endAdornment={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-muted-foreground hover:text-foreground p-0.5"
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
        {...register("password")}
      />

      <FormField
        id="confirmPassword"
        label={t("confirmPassword")}
        type={showConfirmPassword ? "text" : "password"}
        required
        error={getErrorMessage(errors.confirmPassword, validationT)}
        endAdornment={
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="text-muted-foreground hover:text-foreground p-0.5"
            aria-label={showConfirmPassword ? t("hidePassword") : t("showConfirmPassword")}
          >
            {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
        {...register("confirmPassword")}
      />
    </div>
  );
}
