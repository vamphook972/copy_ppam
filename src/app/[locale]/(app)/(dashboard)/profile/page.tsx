"use client";

import { AlertCircle, KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { ChangePasswordDialog } from "@/features/auth/components/change-password-dialog";
import { ProfileForm, useProfileMeQuery } from "@/features/profile";
import { Button, Typography } from "@/components/atoms";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth");
  const { data, isLoading, error } = useProfileMeQuery();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography variant="h1">{t("title")}</Typography>
          <Typography variant="subtitle">{t("subtitle")}</Typography>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsChangePasswordOpen(true)}
          className="w-fit gap-2"
        >
          <KeyRound className="text-muted-foreground size-4" />
          <span>{tAuth("changePassword.title")}</span>
        </Button>
      </header>

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-xs">{t("saving")}</p>
        </div>
      )}

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-3 rounded-lg border p-4 text-xs">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{t("updateError")}</p>
        </div>
      )}

      {data && <ProfileForm data={data} />}

      <ChangePasswordDialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen} />
    </main>
  );
}
