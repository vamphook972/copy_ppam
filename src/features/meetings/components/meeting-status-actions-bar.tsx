"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/atoms/button";

import { useMeetingActions } from "../hooks/use-meeting-actions";
import type { Meeting } from "../types/meeting";
import { AttendanceQrScannerModal } from "./attendance-qr-scanner-modal";

interface MeetingStatusActionsBarProps {
  meeting: Meeting;
}

export function MeetingStatusActionsBar({ meeting }: MeetingStatusActionsBarProps) {
  const t = useTranslations("meetings");
  const { startMutation, completeMutation, cancelMutation } = useMeetingActions();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = React.useState(false);
  const [cancelComment, setCancelComment] = React.useState("");

  const handleStart = () => {
    startMutation.mutate({ id: meeting.id });
  };

  const handleComplete = () => {
    completeMutation.mutate({ id: meeting.id });
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelComment.trim()) return;

    cancelMutation.mutate(
      { id: meeting.id, payload: { comments: cancelComment } },
      {
        onSuccess: () => {
          setIsCancelDialogOpen(false);
          setCancelComment("");
        },
      }
    );
  };

  return (
    <div className="border-border bg-card flex flex-wrap items-center gap-3 rounded-lg border p-4">
      <div className="flex-1">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {t("detail.statusSectionTitle")}
        </span>
        <div className="text-foreground text-sm font-medium">
          {t("detail.currentStatus")}: <strong className="text-primary">{meeting.status}</strong>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {meeting.status === "SCHEDULED" && (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleStart}
            disabled={startMutation.isPending}
          >
            ▶️ {t("actions.start")}
          </Button>
        )}

        {meeting.status === "IN_PROGRESS" && (
          <>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setIsQrModalOpen(true)}
            >
              📷 {t("actions.scanQr")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleComplete}
              disabled={completeMutation.isPending}
            >
              ⏹️ {t("actions.complete")}
            </Button>
          </>
        )}

        {meeting.status === "SCHEDULED" && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setIsCancelDialogOpen(true)}
          >
            ❌ {t("actions.delete")}
          </Button>
        )}
      </div>

      {/* Cancel Dialog */}
      {isCancelDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="border-border bg-card w-full max-w-md rounded-lg border p-6 shadow-lg">
            <h3 className="text-foreground mb-2 text-lg font-bold">{t("actions.cancelTitle")}</h3>
            <p className="text-muted-foreground mb-4 text-sm">{t("actions.cancelDescription")}</p>
            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <textarea
                value={cancelComment}
                onChange={(e) => setCancelComment(e.target.value)}
                placeholder={t("actions.cancelPlaceholder")}
                required
                className="border-border bg-background focus:ring-primary min-h-[100px] w-full rounded-md border p-3 text-sm focus:ring-2 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCancelDialogOpen(false)}
                >
                  {t("qrModal.cancelButton")}
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={cancelMutation.isPending || !cancelComment.trim()}
                >
                  {t("actions.cancelConfirm")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {isQrModalOpen && (
        <AttendanceQrScannerModal
          meetingId={meeting.id}
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
        />
      )}
    </div>
  );
}
