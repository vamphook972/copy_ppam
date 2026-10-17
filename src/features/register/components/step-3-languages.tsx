"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button, Select } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { getErrorMessage } from "@/shared/utils/form-validation-helper";

import type { RegisterWizardFormValues } from "../schemas/register-wizard.schema";

interface Step3LanguagesProps {
  register: UseFormRegister<RegisterWizardFormValues>;
  errors: FieldErrors<RegisterWizardFormValues>;
  watch: UseFormWatch<RegisterWizardFormValues>;
  setValue: UseFormSetValue<RegisterWizardFormValues>;
}

const AVAILABLE_LANGUAGES = [
  { code: "ES", key: "ES" },
  { code: "EN", key: "EN" },
  { code: "FR", key: "FR" },
  { code: "PT", key: "PT" },
  { code: "DE", key: "DE" },
  { code: "IT", key: "IT" },
  { code: "LS", key: "LS" },
];

export function Step3Languages({ register, errors, watch, setValue }: Step3LanguagesProps) {
  const t = useTranslations("register.step3");
  const validationT = useTranslations("validation");

  const languages = watch("languages") || [{ languageCode: "ES", isPrimary: true }];

  const addAdditionalLanguage = () => {
    const unusedLang = AVAILABLE_LANGUAGES.find(
      (lang) => !languages.some((l) => l.languageCode === lang.code)
    );

    if (unusedLang) {
      setValue("languages", [...languages, { languageCode: unusedLang.code, isPrimary: false }]);
    }
  };

  const removeAdditionalLanguage = (indexToRemove: number) => {
    if (languages[indexToRemove]?.isPrimary) return;
    setValue(
      "languages",
      languages.filter((_, idx) => idx !== indexToRemove)
    );
  };

  return (
    <div className="space-y-6">
      <FormField
        id="baptismDate"
        label={t("baptismDate")}
        type="date"
        required
        error={getErrorMessage(errors.baptismDate, validationT)}
        {...register("baptismDate")}
      />

      <div className="border-border/60 space-y-4 border-t pt-4">
        <div className="space-y-1">
          <span className="text-foreground text-sm font-semibold">{t("languages")}</span>
          <p className="text-muted-foreground text-xs leading-relaxed">{t("languageNote")}</p>
        </div>

        {/* Idioma Principal */}
        <div className="space-y-2">
          <FormField
            id="primaryLanguage"
            label={t("primaryLanguage")}
            type="select"
            required
            error={getErrorMessage(errors.languages?.[0]?.languageCode, validationT)}
            {...register("languages")}
          >
            <Select
              id="primaryLanguage"
              value={languages[0]?.languageCode || "ES"}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const newLangCode = e.target.value;
                const updated = [...languages];
                updated[0] = { languageCode: newLangCode, isPrimary: true };
                setValue("languages", updated);
              }}
            >
              {AVAILABLE_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {t(`languageList.${lang.key}`)}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        {/* Idiomas Adicionales */}
        {languages.slice(1).map((langItem, sliceIndex) => {
          const actualIndex = sliceIndex + 1;
          return (
            <div key={actualIndex} className="flex items-center gap-2 pt-1">
              <div className="flex-1 space-y-1">
                <FormField
                  id={`additional-lang-${actualIndex}`}
                  label={t("additionalLanguage", { index: actualIndex })}
                  type="select"
                  error={getErrorMessage(
                    errors.languages?.[actualIndex]?.languageCode,
                    validationT
                  )}
                  {...register(`languages.${actualIndex}.languageCode`)}
                >
                  <Select
                    id={`additional-lang-${actualIndex}`}
                    value={langItem.languageCode}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const newCode = e.target.value;
                      const updated = [...languages];
                      updated[actualIndex] = { languageCode: newCode, isPrimary: false };
                      setValue("languages", updated);
                    }}
                  >
                    {AVAILABLE_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {t(`languageList.${lang.key}`)}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 mt-5 shrink-0"
                onClick={() => removeAdditionalLanguage(actualIndex)}
                aria-label="Eliminar idioma"
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
          );
        })}

        {languages.length < AVAILABLE_LANGUAGES.length && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs font-semibold"
            onClick={addAdditionalLanguage}
          >
            <PlusIcon className="size-3.5" />
            <span>{t("addLanguage")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
