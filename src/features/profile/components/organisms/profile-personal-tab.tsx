"use client";

import { Info, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import type { ProfileUserDto } from "@/features/auth/dto/profile.dto";
import { Button, Input, Label, Select } from "@/components/atoms";

import { VerifiedFieldBadge } from "../atoms/verified-field-badge";
import { SpouseFormSection } from "../molecules/spouse-form-section";

const AVAILABLE_LANGUAGES = [
  { code: "ES", key: "ES" },
  { code: "EN", key: "EN" },
  { code: "FR", key: "FR" },
  { code: "PT", key: "PT" },
  { code: "DE", key: "DE" },
  { code: "IT", key: "IT" },
  { code: "LS", key: "LS" },
] as const;

interface ProfilePersonalTabProps {
  user: ProfileUserDto;
  preferredName: string;
  onPreferredNameChange: (val: string) => void;
  maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  onMaritalStatusChange: (status: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED") => void;
  spouse: {
    participatesInPpam: boolean;
    fullName?: string | null;
    marriedLastName?: string | null;
  };
  onSpouseChange: (data: {
    participatesInPpam: boolean;
    fullName?: string | null;
    marriedLastName?: string | null;
  }) => void;
  languages: Array<{ languageCode: string; isPrimary: boolean }>;
  onLanguagesChange: (langs: Array<{ languageCode: string; isPrimary: boolean }>) => void;
  disabled?: boolean;
}

export function ProfilePersonalTab({
  user,
  preferredName,
  onPreferredNameChange,
  maritalStatus,
  onMaritalStatusChange,
  spouse,
  onSpouseChange,
  languages,
  onLanguagesChange,
  disabled = false,
}: ProfilePersonalTabProps) {
  const t = useTranslations("profile.personal");

  const effectiveLanguages =
    languages.length > 0 ? languages : [{ languageCode: "ES", isPrimary: true }];

  const addAdditionalLanguage = () => {
    const unusedLang = AVAILABLE_LANGUAGES.find(
      (lang) => !effectiveLanguages.some((l) => l.languageCode === lang.code)
    );
    if (unusedLang) {
      onLanguagesChange([
        ...effectiveLanguages,
        { languageCode: unusedLang.code, isPrimary: false },
      ]);
    }
  };

  const removeAdditionalLanguage = (indexToRemove: number) => {
    if (effectiveLanguages[indexToRemove]?.isPrimary) return;
    onLanguagesChange(effectiveLanguages.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div className="flex items-start gap-3 rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 text-xs text-sky-950 dark:text-sky-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
        <p className="leading-relaxed">{t("readOnlyNotice")}</p>
      </div>

      {/* Verified / Read-Only Fields Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-foreground text-xs font-semibold">{t("firstName")}</Label>
            <VerifiedFieldBadge />
          </div>
          <Input
            value={user.firstName}
            disabled
            className="bg-muted/50 h-9 cursor-not-allowed text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-foreground text-xs font-semibold">{t("lastName")}</Label>
            <VerifiedFieldBadge />
          </div>
          <Input
            value={user.lastName}
            disabled
            className="bg-muted/50 h-9 cursor-not-allowed text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-foreground text-xs font-semibold">{t("email")}</Label>
            <VerifiedFieldBadge />
          </div>
          <Input
            value={user.email}
            disabled
            className="bg-muted/50 h-9 cursor-not-allowed text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-foreground text-xs font-semibold">{t("gender")}</Label>
            <VerifiedFieldBadge />
          </div>
          <Input
            value={user.gender === "MALE" ? t("genderMale") : t("genderFemale")}
            disabled
            className="bg-muted/50 h-9 cursor-not-allowed text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-foreground text-xs font-semibold">{t("birthDate")}</Label>
            <VerifiedFieldBadge />
          </div>
          <Input
            value={user.birthDate ? user.birthDate.slice(0, 10) : "-"}
            disabled
            className="bg-muted/50 h-9 cursor-not-allowed text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-foreground text-xs font-semibold">{t("baptismDate")}</Label>
            <VerifiedFieldBadge />
          </div>
          <Input
            value={user.baptismDate ? user.baptismDate.slice(0, 10) : "-"}
            disabled
            className="bg-muted/50 h-9 cursor-not-allowed text-xs"
          />
        </div>
      </div>

      <div className="border-border/60 space-y-4 border-t pt-5">
        {/* Preferred Name (Editable) */}
        <div className="space-y-1.5">
          <Label htmlFor="preferredName" className="text-foreground text-xs font-semibold">
            {t("preferredName")}
          </Label>
          <Input
            id="preferredName"
            type="text"
            placeholder={t("preferredNamePlaceholder")}
            value={preferredName}
            onChange={(e) => onPreferredNameChange(e.target.value)}
            disabled={disabled}
            className="h-9 text-xs"
          />
        </div>

        {/* Marital Status & Spouse */}
        <SpouseFormSection
          gender={user.gender}
          maritalStatus={maritalStatus}
          spouse={spouse}
          onMaritalStatusChange={onMaritalStatusChange}
          onSpouseChange={onSpouseChange}
          disabled={disabled}
        />

        {/* Languages Section */}
        <div className="border-border/70 bg-card/50 space-y-4 rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
                {t("languagesSection")}
              </h4>
              <p className="text-muted-foreground mt-0.5 text-xs">{t("languagesHelp")}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAdditionalLanguage}
              disabled={disabled}
              className="h-8 gap-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t("addLanguage")}</span>
            </Button>
          </div>

          {/* Primary Language */}
          <div className="space-y-1.5">
            <Label htmlFor="primaryLanguage" className="text-foreground text-xs font-medium">
              {t("primaryLanguage")}
            </Label>
            <Select
              id="primaryLanguage"
              value={effectiveLanguages[0]?.languageCode || "ES"}
              onChange={(e) => {
                const next = [...effectiveLanguages];
                next[0] = { languageCode: e.target.value, isPrimary: true };
                onLanguagesChange(next);
              }}
              disabled={disabled}
              className="h-9 w-full text-xs"
            >
              {AVAILABLE_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {t(`languages.${lang.key}`)}
                </option>
              ))}
            </Select>
          </div>

          {/* Additional Languages */}
          {effectiveLanguages.slice(1).map((langItem, sliceIndex) => {
            const actualIndex = sliceIndex + 1;
            return (
              <div key={actualIndex} className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor={`additional-lang-${actualIndex}`}
                    className="text-foreground text-xs font-medium"
                  >
                    {t("additionalLanguage", { index: actualIndex })}
                  </Label>
                  <Select
                    id={`additional-lang-${actualIndex}`}
                    value={langItem.languageCode}
                    onChange={(e) => {
                      const next = [...effectiveLanguages];
                      next[actualIndex] = { languageCode: e.target.value, isPrimary: false };
                      onLanguagesChange(next);
                    }}
                    disabled={disabled}
                    className="h-9 w-full text-xs"
                  >
                    {AVAILABLE_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {t(`languages.${lang.key}`)}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAdditionalLanguage(actualIndex)}
                  disabled={disabled}
                  className="text-destructive hover:bg-destructive/10 h-9 w-9 self-end"
                  title={t("removeLanguage")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
