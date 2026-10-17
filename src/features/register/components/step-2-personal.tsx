"use client";

import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Checkbox, Label, Select } from "@/components/atoms";
import { FormField, PhoneInputGroup } from "@/components/molecules";
import { getErrorMessage } from "@/shared/utils/form-validation-helper";

import type { RegisterWizardFormValues } from "../schemas/register-wizard.schema";

interface Step2PersonalProps {
  register: UseFormRegister<RegisterWizardFormValues>;
  errors: FieldErrors<RegisterWizardFormValues>;
  watch: UseFormWatch<RegisterWizardFormValues>;
  setValue: UseFormSetValue<RegisterWizardFormValues>;
}

export function Step2Personal({ register, errors, watch, setValue }: Step2PersonalProps) {
  const t = useTranslations("register.step2");
  const validationT = useTranslations("validation");

  const maritalStatus = watch("maritalStatus");
  const spouseParticipates = watch("spouseParticipates");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <FormField
          id="primaryPhone"
          label={t("phoneNumber")}
          placeholder="+57"
          required
          error={getErrorMessage(errors.primaryPhone?.countryCode, validationT)}
          {...register("primaryPhone.countryCode")}
        >
          <PhoneInputGroup
            countryCodeProps={register("primaryPhone.countryCode")}
            phoneNumberProps={register("primaryPhone.number")}
            countryCodeError={getErrorMessage(errors.primaryPhone?.countryCode, validationT)}
            phoneNumberError={getErrorMessage(errors.primaryPhone?.number, validationT)}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FormField
            id="gender"
            label={t("gender")}
            type="select"
            required
            error={getErrorMessage(errors.gender, validationT)}
            {...register("gender")}
          >
            <Select id="gender" {...register("gender")}>
              <option value="MALE">{t("genderMale")}</option>
              <option value="FEMALE">{t("genderFemale")}</option>
            </Select>
          </FormField>
        </div>

        <FormField
          id="birthDate"
          label={t("birthDate")}
          type="date"
          required
          error={getErrorMessage(errors.birthDate, validationT)}
          {...register("birthDate")}
        />
      </div>

      <div className="space-y-2">
        <FormField
          id="maritalStatus"
          label={t("maritalStatus")}
          type="select"
          required
          error={getErrorMessage(errors.maritalStatus, validationT)}
          {...register("maritalStatus")}
        >
          <Select id="maritalStatus" {...register("maritalStatus")}>
            <option value="SINGLE">{t("maritalStatusSingle")}</option>
            <option value="MARRIED">{t("maritalStatusMarried")}</option>
            <option value="DIVORCED">{t("maritalStatusDivorced")}</option>
            <option value="WIDOWED">{t("maritalStatusWidowed")}</option>
          </Select>
        </FormField>
      </div>

      {maritalStatus === "MARRIED" && (
        <div className="border-border/60 space-y-3 border-t pt-4">
          <span className="text-foreground text-sm font-semibold">{t("spouseSection")}</span>

          <div className="flex items-center gap-2">
            <Checkbox
              id="spouseParticipates"
              checked={spouseParticipates}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setValue("spouseParticipates", e.target.checked)
              }
            />
            <Label htmlFor="spouseParticipates" className="cursor-pointer text-xs font-normal">
              {t("spouseParticipates")}
            </Label>
          </div>

          {spouseParticipates && (
            <FormField
              id="spouseFullName"
              label={t("spouseFullName")}
              placeholder={t("spouseFullNamePlaceholder")}
              required
              error={getErrorMessage(errors.spouseFullName, validationT)}
              {...register("spouseFullName")}
            />
          )}
        </div>
      )}
    </div>
  );
}
