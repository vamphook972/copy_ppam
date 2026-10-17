"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button, Input, Label } from "@/components/atoms";
import {
  parsePhoneString,
  PhoneInputGroup,
} from "@/components/molecules/phone-input-group/phone-input-group";

import { WhatsAppSwitch } from "./whatsapp-switch";

export interface AlternatePhoneItem {
  countryCode: string;
  number: string;
  label?: string | null;
  hasWhatsapp?: boolean;
}

interface PhoneInputListProps {
  phones: AlternatePhoneItem[];
  onChange: (phones: AlternatePhoneItem[]) => void;
  disabled?: boolean;
}

export function PhoneInputList({ phones, onChange, disabled = false }: PhoneInputListProps) {
  const t = useTranslations("profile.contact");

  const addPhone = () => {
    onChange([
      ...phones,
      {
        countryCode: "+57",
        number: "",
        label: "",
        hasWhatsapp: false,
      },
    ]);
  };

  const removePhone = (index: number) => {
    onChange(phones.filter((_, i) => i !== index));
  };

  const updatePhone = (index: number, patch: Partial<AlternatePhoneItem>) => {
    const next = [...phones];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-foreground text-sm font-semibold">{t("alternatePhones")}</h4>
          <p className="text-muted-foreground text-xs">{t("contactNotice")}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPhone}
          disabled={disabled}
          className="gap-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{t("addAlternatePhone")}</span>
        </Button>
      </div>

      {phones.length === 0 ? (
        <div className="border-border/80 text-muted-foreground rounded-lg border border-dashed p-4 text-center text-xs">
          {t("noAlternatePhones")}
        </div>
      ) : (
        <div className="space-y-3">
          {phones.map((phone, idx) => {
            const combinedPhone = `${phone.countryCode} ${phone.number}`.trim();

            return (
              <div
                key={idx}
                className="border-border/70 bg-card/60 relative space-y-3 rounded-lg border p-3.5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <Label
                      htmlFor={`alt-phone-label-${idx}`}
                      className="text-muted-foreground text-xs"
                    >
                      {t("phoneLabel")}
                    </Label>
                    <Input
                      id={`alt-phone-label-${idx}`}
                      type="text"
                      placeholder={t("phoneLabelPlaceholder")}
                      value={phone.label ?? ""}
                      onChange={(e) => updatePhone(idx, { label: e.target.value })}
                      disabled={disabled}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePhone(idx)}
                    disabled={disabled}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 self-end"
                    title={t("removePhone")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <PhoneInputGroup
                    value={combinedPhone}
                    onChange={(val) => {
                      const parsed = parsePhoneString(val, phone.countryCode || "+57");
                      updatePhone(idx, {
                        countryCode: parsed.countryCode,
                        number: parsed.number,
                      });
                    }}
                    defaultCountryCode={phone.countryCode || "+57"}
                    disabled={disabled}
                  />
                </div>

                <WhatsAppSwitch
                  id={`alt-phone-whatsapp-${idx}`}
                  checked={Boolean(phone.hasWhatsapp)}
                  onCheckedChange={(checked) => updatePhone(idx, { hasWhatsapp: checked })}
                  disabled={disabled}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
