"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useTranslations } from "next-intl";

import { settingsApi } from "@/features/tenants/api/settings.api";
import { Button, Checkbox, Typography } from "@/components/atoms";

import { trainingApi } from "../api/training.api";
import type { Training } from "../types/training";

export interface EvaluationItem {
  id: string;
  label: string;
  isRequired: boolean;
  passed: boolean;
}

export interface EvaluateTrainingModalProps {
  training: Training;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EvaluateTrainingModal({
  training,
  isOpen,
  onClose,
  onSuccess,
}: EvaluateTrainingModalProps) {
  // Load active tenant checklist settings
  const settingsQuery = useQuery({
    queryKey: ["tenant-settings", "current"],
    queryFn: () => settingsApi.getSettings(),
    enabled: isOpen,
  });

  const tenantChecklist = React.useMemo(
    () => settingsQuery.data?.evaluationChecklist ?? [],
    [settingsQuery.data?.evaluationChecklist]
  );

  if (!isOpen) return null;

  return (
    <EvaluateTrainingContent
      key={`${training.id}-${tenantChecklist.length}`}
      training={training}
      tenantChecklist={tenantChecklist}
      isLoadingSettings={settingsQuery.isLoading}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

interface EvaluateTrainingContentProps {
  training: Training;
  tenantChecklist: Array<{ id: string; label: string; isRequired: boolean }>;
  isLoadingSettings: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function EvaluateTrainingContent({
  training,
  tenantChecklist,
  isLoadingSettings,
  onClose,
  onSuccess,
}: EvaluateTrainingContentProps) {
  const t = useTranslations("training");

  const initialItems = React.useMemo(() => {
    const existingChecklist = training.evaluationChecklist as {
      items?: Array<{ id: string; label: string; isRequired?: boolean; passed?: boolean }>;
    } | null;

    if (
      existingChecklist?.items &&
      Array.isArray(existingChecklist.items) &&
      existingChecklist.items.length > 0
    ) {
      return existingChecklist.items.map((it) => ({
        id: String(it.id),
        label: String(it.label),
        isRequired: Boolean(it.isRequired ?? true),
        passed: Boolean(it.passed ?? false),
      }));
    }

    if (tenantChecklist.length > 0) {
      return tenantChecklist.map((it) => ({
        id: String(it.id),
        label: String(it.label),
        isRequired: Boolean(it.isRequired),
        passed: false,
      }));
    }

    return [];
  }, [training.evaluationChecklist, tenantChecklist]);

  const [items, setItems] = React.useState<EvaluationItem[]>(initialItems);
  const [notes, setNotes] = React.useState<string>(training.notes ?? "");
  const [nextScheduledAt, setNextScheduledAt] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [showRejectConfirm, setShowRejectConfirm] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleToggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, passed: !item.passed } : item))
    );
  };

  const handleSaveProgress = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await trainingApi.evaluate(training.id, { items }, notes);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("notifications.errorEvaluate");
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // First save evaluation
      await trainingApi.evaluate(training.id, { items }, notes);
      // Then approve
      await trainingApi.approve(training.id);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("notifications.errorApprove");
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectAction = async (retry: boolean) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const scheduledAtIso =
        retry && nextScheduledAt ? new Date(nextScheduledAt).toISOString() : undefined;

      // First save evaluation
      await trainingApi.evaluate(training.id, { items }, notes);
      // Then reject with retry option and new scheduled date if provided
      await trainingApi.reject(training.id, retry, scheduledAtIso);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("notifications.errorReject");
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allRequiredPassed = items.every((it) => !it.isRequired || it.passed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border-border max-h-[90vh] w-full max-w-2xl space-y-6 overflow-y-auto rounded-xl border p-6 shadow-xl">
        {/* Header */}
        <div className="flex flex-col gap-1 border-b pb-4">
          <Typography variant="h3">{t("evaluateModal.title")}</Typography>
          <Typography variant="body" className="text-muted-foreground text-xs">
            {t("evaluateModal.subtitle", {
              name: training.userName ?? training.userId,
            })}
          </Typography>
        </div>

        {/* Participant Context Summary */}
        <div className="border-primary/20 bg-primary/5 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold">
              {(training.userName ?? "P").substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col gap-0.5 text-xs">
              <span className="text-foreground font-semibold">
                {training.userName ?? training.userId}
              </span>
              {training.userEmail && (
                <span className="text-muted-foreground">{training.userEmail}</span>
              )}
              {training.userPhone && (
                <span className="text-muted-foreground font-mono">{training.userPhone}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 border-t pt-2 text-xs sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
            {training.capacitatorName && (
              <span className="text-muted-foreground">
                {t("evaluateModal.capacitatorLabel")}:{" "}
                <strong className="text-foreground">{training.capacitatorName}</strong>
              </span>
            )}
            {training.placeName && (
              <span className="text-muted-foreground">
                {t("evaluateModal.placeLabel")}:{" "}
                <strong className="text-foreground">{training.placeName}</strong>
              </span>
            )}
            {training.scheduledAt && (
              <span className="text-muted-foreground">
                {t("evaluateModal.scheduledAtLabel")}:{" "}
                <strong className="text-foreground">
                  {new Date(training.scheduledAt).toLocaleString("es-ES", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </strong>
              </span>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-3 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Reject Confirmation View */}
        {showRejectConfirm ? (
          <div className="bg-muted/20 space-y-5 rounded-xl border p-5">
            <div className="space-y-2">
              <Typography variant="h3" className="text-destructive">
                {t("evaluateModal.rejectDialogTitle")}
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                {t("evaluateModal.rejectDialogDescription")}
              </Typography>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-foreground text-xs font-semibold">
                {t("evaluateModal.nextScheduledAtLabel")}
              </label>
              <input
                type="datetime-local"
                value={nextScheduledAt}
                onChange={(e) => setNextScheduledAt(e.target.value)}
                className="border-input bg-background focus:ring-primary w-full rounded-lg border p-2.5 text-xs shadow-2xs focus:ring-1 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleRejectAction(true)}
                className="flex-1 text-xs"
              >
                {t("evaluateModal.optionRetry")}
              </Button>

              <Button
                type="button"
                variant="destructive"
                disabled={isSubmitting}
                onClick={() => handleRejectAction(false)}
                className="flex-1 text-xs"
              >
                {t("evaluateModal.optionFinalFail")}
              </Button>
            </div>

            <div className="pt-2 text-right">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowRejectConfirm(false)}
                className="text-xs"
              >
                {t("actions.deleteCancel")}
              </Button>
            </div>
          </div>
        ) : (
          /* Normal Evaluation Form */
          <div className="space-y-6">
            {/* Checklist Section */}
            <div className="space-y-3">
              <div>
                <Typography variant="h3">{t("evaluateModal.checklistTitle")}</Typography>
                <Typography variant="body" className="text-muted-foreground">
                  {t("evaluateModal.checklistSubtitle")}
                </Typography>
              </div>

              {isLoadingSettings ? (
                <div className="text-muted-foreground p-4 text-center text-xs">
                  {t("states.loading")}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {items.map((item) => (
                    <label
                      key={item.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        item.passed
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : "bg-background border-border hover:bg-muted/30"
                      }`}
                    >
                      <Checkbox
                        checked={item.passed}
                        onChange={() => handleToggleItem(item.id)}
                        className="mt-0.5"
                      />
                      <div className="flex flex-1 items-center justify-between text-xs">
                        <span className="text-foreground font-medium">{item.label}</span>
                        {item.isRequired && (
                          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            {t("evaluateModal.isRequiredLabel")}
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <label className="text-foreground text-xs font-semibold">
                {t("evaluateModal.notesLabel")}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("evaluateModal.notesPlaceholder")}
                rows={3}
                maxLength={500}
                className="border-input bg-background focus:ring-primary w-full rounded-lg border p-3 text-xs shadow-2xs focus:ring-1 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full text-xs sm:w-auto"
              >
                {t("actions.deleteCancel")}
              </Button>

              <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                  onClick={handleSaveProgress}
                  className="w-full text-xs sm:w-auto"
                >
                  {t("evaluateModal.saveProgress")}
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  disabled={isSubmitting}
                  onClick={() => setShowRejectConfirm(true)}
                  className="w-full text-xs sm:w-auto"
                >
                  {t("evaluateModal.reject")}
                </Button>

                <Button
                  type="button"
                  variant="default"
                  disabled={isSubmitting || !allRequiredPassed}
                  onClick={handleApprove}
                  className="w-full text-xs font-semibold sm:w-auto"
                >
                  {t("evaluateModal.approve")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
