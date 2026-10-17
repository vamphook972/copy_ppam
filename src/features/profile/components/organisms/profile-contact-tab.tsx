"use client";

import { useTranslations } from "next-intl";

import { Label } from "@/components/atoms";
import {
  parsePhoneString,
  PhoneInputGroup,
} from "@/components/molecules/phone-input-group/phone-input-group";

import { PhoneInputList, type AlternatePhoneItem } from "../molecules/phone-input-list";
import { WhatsAppSwitch } from "../molecules/whatsapp-switch";

interface ProfileContactTabProps {
  primaryPhone: {
    countryCode: string;
    number: string;
    hasWhatsapp?: boolean;
    label?: string | null;
  };
  onPrimaryPhoneChange: (phone: {
    countryCode: string;
    number: string;
    hasWhatsapp?: boolean;
    label?: string | null;
  }) => void;
  alternatePhones: AlternatePhoneItem[];
  onAlternatePhonesChange: (phones: AlternatePhoneItem[]) => void;
  disabled?: boolean;
}

export function ProfileContactTab({
  primaryPhone,
  onPrimaryPhoneChange,
  alternatePhones,
  onAlternatePhonesChange,
  disabled = false,
}: ProfileContactTabProps) {
  const t = useTranslations("profile.contact");

  const combinedPrimary = `${primaryPhone.countryCode || "+57"} ${primaryPhone.number}`.trim();

  return (
    <div className="space-y-6">
      {/* Primary Phone Block */}
      <div className="border-border/70 bg-card/60 space-y-3.5 rounded-lg border p-4 shadow-sm">
        <div>
          <Label className="text-foreground text-sm font-semibold">{t("primaryPhone")}</Label>
          <p className="text-muted-foreground mt-0.5 text-xs">{t("contactNotice")}</p>
        </div>

        <PhoneInputGroup
          value={combinedPrimary}
          onChange={(val) => {
            const parsed = parsePhoneString(val, primaryPhone.countryCode || "+57");
            onPrimaryPhoneChange({
              ...primaryPhone,
              countryCode: parsed.countryCode,
              number: parsed.number,
            });
          }}
          defaultCountryCode={primaryPhone.countryCode || "+57"}
          disabled={disabled}
        />

        <WhatsAppSwitch
          id="primary-phone-whatsapp"
          checked={Boolean(primaryPhone.hasWhatsapp)}
          onCheckedChange={(checked) =>
            onPrimaryPhoneChange({
              ...primaryPhone,
              hasWhatsapp: checked,
            })
          }
          disabled={disabled}
        />
      </div>

      {/* Alternate Phones Block */}
      <div className="border-border/70 bg-card/60 rounded-lg border p-4 shadow-sm">
        <PhoneInputList
          phones={alternatePhones}
          onChange={onAlternatePhonesChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
