"use client";

import { useTranslations } from "next-intl";

import { Input, Label, Select } from "@/components/atoms";
import { Switch } from "@/components/ui/switch";

interface SpouseData {
  participatesInPpam: boolean;
  fullName?: string | null;
  marriedLastName?: string | null;
}

interface SpouseFormSectionProps {
  gender: "MALE" | "FEMALE";
  maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  spouse: SpouseData;
  onMaritalStatusChange: (status: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED") => void;
  onSpouseChange: (spouse: SpouseData) => void;
  disabled?: boolean;
}

export function SpouseFormSection({
  gender,
  maritalStatus,
  spouse,
  onMaritalStatusChange,
  onSpouseChange,
  disabled = false,
}: SpouseFormSectionProps) {
  const t = useTranslations("profile.personal");

  const isMarried = maritalStatus === "MARRIED";
  const isFemale = gender === "FEMALE";

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="maritalStatus" className="text-foreground text-xs font-semibold">
          {t("maritalStatus")}
        </Label>
        <Select
          id="maritalStatus"
          value={maritalStatus}
          onChange={(e) =>
            onMaritalStatusChange(e.target.value as "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED")
          }
          disabled={disabled}
          className="w-full"
        >
          <option value="SINGLE">{t("maritalStatusSingle")}</option>
          <option value="MARRIED">{t("maritalStatusMarried")}</option>
          <option value="DIVORCED">{t("maritalStatusDivorced")}</option>
          <option value="WIDOWED">{t("maritalStatusWidowed")}</option>
        </Select>
      </div>

      {isMarried && (
        <div className="border-border/70 bg-card/50 space-y-4 rounded-lg border p-4 shadow-sm">
          <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
            {t("spouseSection")}
          </h4>

          <div className="border-border/60 bg-muted/30 flex items-center justify-between gap-3 rounded-md border p-2.5">
            <label
              htmlFor="spouse-ppam-switch"
              className="text-foreground cursor-pointer text-xs font-medium select-none"
            >
              {t("spouseParticipatesInPpam")}
            </label>
            <Switch
              id="spouse-ppam-switch"
              checked={spouse.participatesInPpam}
              onCheckedChange={(checked) =>
                onSpouseChange({
                  ...spouse,
                  participatesInPpam: checked,
                })
              }
              disabled={disabled}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="spouseFullName" className="text-foreground text-xs font-medium">
              {t("spouseFullName")}
            </Label>
            <Input
              id="spouseFullName"
              type="text"
              placeholder={t("spouseFullNamePlaceholder")}
              value={spouse.fullName ?? ""}
              onChange={(e) =>
                onSpouseChange({
                  ...spouse,
                  fullName: e.target.value,
                })
              }
              disabled={disabled}
              className="h-9 text-xs"
            />
            {spouse.participatesInPpam && (
              <p className="text-muted-foreground text-[11px]">{t("spouseInPpamHelp")}</p>
            )}
          </div>

          {isFemale && (
            <div className="space-y-1.5">
              <Label htmlFor="marriedLastName" className="text-foreground text-xs font-medium">
                {t("marriedLastName")}
              </Label>
              <Input
                id="marriedLastName"
                type="text"
                value={spouse.marriedLastName ?? ""}
                onChange={(e) =>
                  onSpouseChange({
                    ...spouse,
                    marriedLastName: e.target.value,
                  })
                }
                disabled={disabled}
                className="h-9 text-xs"
              />
              <p className="text-muted-foreground text-[11px]">{t("marriedLastNameHelp")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
