"use client";

import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface WhatsAppSwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function WhatsAppSwitch({
  id = "whatsapp-switch",
  checked,
  onCheckedChange,
  disabled = false,
  className,
}: WhatsAppSwitchProps) {
  const t = useTranslations("profile.contact");

  return (
    <div
      className={cn(
        "border-border/70 bg-card/50 flex items-center justify-between gap-3 rounded-lg border p-2.5 transition-colors",
        checked && "border-emerald-500/30 bg-emerald-500/5",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
            checked ? "bg-emerald-500 text-white shadow-sm" : "bg-muted text-muted-foreground"
          )}
        >
          <MessageSquare className="h-4 w-4" />
        </div>
        <label
          htmlFor={id}
          className="text-foreground cursor-pointer text-xs font-medium select-none"
        >
          {t("hasWhatsapp")}
        </label>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
