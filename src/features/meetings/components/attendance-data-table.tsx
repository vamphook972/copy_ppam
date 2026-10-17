"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Typography } from "@/components/atoms/typography";
import { StatusBadge } from "@/components/molecules/status-badge";

import { useMeetingActions } from "../hooks/use-meeting-actions";
import type { AttendanceStatus } from "../types/meeting";

interface AttendanceDataTableProps {
  meetingId: string;
}

function getAttendanceTone(status: AttendanceStatus) {
  switch (status) {
    case "ATTENDED":
      return "success";
    case "NO_SHOW":
      return "destructive";
    case "PENDING":
    default:
      return "secondary";
  }
}

export function AttendanceDataTable({ meetingId }: AttendanceDataTableProps) {
  const t = useTranslations("meetings");
  const { useAttendancesQuery } = useMeetingActions(meetingId);
  const { data: attendancesData, isLoading, isError } = useAttendancesQuery();

  if (isLoading) {
    return (
      <div className="border-border bg-card text-muted-foreground rounded-lg border p-6 text-center">
        {t("detail.loadingAttendances")}
      </div>
    );
  }

  if (isError || !attendancesData) {
    return (
      <div className="border-border bg-card text-destructive rounded-lg border p-6 text-center">
        {t("detail.errorAttendances")}
      </div>
    );
  }

  const { data: attendances, total } = attendancesData;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography variant="h3" className="text-foreground text-base font-bold">
          {t("detail.participantsTitle")} ({total})
        </Typography>
      </div>

      {attendances.length === 0 ? (
        <div className="border-border bg-muted/20 text-muted-foreground rounded-lg border border-dashed p-8 text-center">
          {t("detail.noAttendances")}
        </div>
      ) : (
        <div className="border-border bg-card overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="border-border bg-muted/50 text-muted-foreground border-b text-xs font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">{t("detail.attendanceId")}</th>
                <th className="px-4 py-3">{t("detail.participantId")}</th>
                <th className="px-4 py-3">{t("detail.status")}</th>
                <th className="px-4 py-3">{t("detail.recordedAt")}</th>
                <th className="px-4 py-3">{t("detail.notes")}</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {attendances.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="text-muted-foreground px-4 py-3 font-mono text-xs">{item.id}</td>
                  <td className="text-foreground px-4 py-3 font-medium">
                    {item.participantId || item.enrollmentId || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={getAttendanceTone(item.status)}>{item.status}</StatusBadge>
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {item.recordedAt ? new Date(item.recordedAt).toLocaleString() : "-"}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">{item.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
