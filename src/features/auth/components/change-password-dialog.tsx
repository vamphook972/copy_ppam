"use client";

import { Check, Eye, EyeOff, KeyRound, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/providers";
import { Button, Input, Label } from "@/components/atoms";
import { notify } from "@/shared/utils/notify";

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const t = useTranslations("auth.changePassword");
  const { changePassword } = useAuth();
  const mounted = useMounted();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    if (isLoading) return;
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage(null);
    onOpenChange(false);
  }, [isLoading, onOpenChange]);

  // Close on Escape key & lock body scroll
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleClose]);

  if (!open || !mounted) return null;

  // Password requirements checklist
  const hasMinLength = newPassword.length >= 8;
  const hasCase = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const hasNumberOrSymbol = /[0-9]/.test(newPassword) || /[^a-zA-Z0-9]/.test(newPassword);

  const passedRequirementsCount = [hasMinLength, hasCase, hasNumberOrSymbol].filter(Boolean).length;

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const hasMismatch = confirmPassword.length > 0 && !passwordsMatch;
  const canSubmit =
    currentPassword.trim().length > 0 &&
    passedRequirementsCount === 3 &&
    passwordsMatch &&
    !isLoading;

  const getStrengthLabel = () => {
    if (newPassword.length === 0) return null;
    if (passedRequirementsCount === 1) return t("strengthWeak");
    if (passedRequirementsCount === 2) return t("strengthMedium");
    return t("strengthStrong");
  };

  const getStrengthColor = () => {
    if (passedRequirementsCount === 1) return "bg-destructive text-destructive";
    if (passedRequirementsCount === 2) return "bg-amber-500 text-amber-500";
    return "bg-emerald-500 text-emerald-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      notify.success(t("success"));
      handleClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("error");
      setErrorMessage(msg);
      notify.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleClose();
        }
      }}
    >
      <div className="bg-card border-border animate-in zoom-in-95 relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border p-6 shadow-2xl duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className="text-muted-foreground hover:text-foreground absolute top-4 right-4 rounded-full p-1 transition-colors"
          aria-label={t("cancel")}
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
            <KeyRound className="size-5" />
          </div>
          <div>
            <h2 className="text-foreground text-base font-bold">{t("title")}</h2>
            <p className="text-muted-foreground text-xs">{t("description")}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" className="text-xs font-semibold">
              {t("currentPasswordLabel")}
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="pr-10 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                tabIndex={-1}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs font-semibold">
              {t("newPasswordLabel")}
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="pr-10 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                tabIndex={-1}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {newPassword.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Seguridad:</span>
                  <span className={`font-semibold ${getStrengthColor()}`}>
                    {getStrengthLabel()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      passedRequirementsCount >= 1 ? getStrengthColor() : "bg-muted"
                    }`}
                  />
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      passedRequirementsCount >= 2 ? getStrengthColor() : "bg-muted"
                    }`}
                  />
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      passedRequirementsCount >= 3 ? getStrengthColor() : "bg-muted"
                    }`}
                  />
                </div>

                {/* Requirements Checklist */}
                <div className="bg-muted/30 space-y-1 rounded-lg p-2.5 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Check
                      className={`size-3.5 ${
                        hasMinLength ? "text-emerald-500" : "text-muted-foreground/40"
                      }`}
                    />
                    <span
                      className={
                        hasMinLength ? "text-foreground font-medium" : "text-muted-foreground"
                      }
                    >
                      {t("requirementMinLength")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check
                      className={`size-3.5 ${
                        hasCase ? "text-emerald-500" : "text-muted-foreground/40"
                      }`}
                    />
                    <span
                      className={hasCase ? "text-foreground font-medium" : "text-muted-foreground"}
                    >
                      {t("requirementCase")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check
                      className={`size-3.5 ${
                        hasNumberOrSymbol ? "text-emerald-500" : "text-muted-foreground/40"
                      }`}
                    />
                    <span
                      className={
                        hasNumberOrSymbol ? "text-foreground font-medium" : "text-muted-foreground"
                      }
                    >
                      {t("requirementNumberOrSymbol")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold">
              {t("confirmPasswordLabel")}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className={`pr-10 text-xs ${hasMismatch ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {hasMismatch && <p className="text-destructive text-[11px]">{t("mismatchError")}</p>}
          </div>

          {errorMessage && (
            <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-lg border p-2.5 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={!canSubmit}>
              {isLoading ? t("loading") : t("submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
