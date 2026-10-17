"use client";

import { useQuery } from "@tanstack/react-query";
import { History, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/atoms";
import { StatusBadge } from "@/components/molecules";

import { auditLogsApi } from "../api/audit-logs.api";
import type { AuditLogDto } from "../types/audit-logs";

export interface AuditLogDialogProps {
  /** ID del recurso u objetivo (ej: userId, enrollmentId, placeId). Opcional si se quiere filtrar por objetivo */
  targetId?: string;
  /** Título o nombre descriptivo para la cabecera (ej: "Juan Pérez", "Punto Terminal Pasoancho") */
  targetTitle?: string;
  /** Filtro de tipo de entidad si la llamada se hace desde un módulo específico (ej: "Enrollment", "User", "Place") */
  entityType?: string;
  /** Control de visibilidad del modal */
  isOpen: boolean;
  /** Handler de cierre */
  onClose: () => void;
}

export function AuditLogDialog({
  targetId,
  targetTitle,
  entityType,
  isOpen,
  onClose,
}: AuditLogDialogProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null);
  const t = useTranslations("auditLogs");

  const query = useQuery({
    queryKey: ["audit-logs", entityType, targetId],
    queryFn: () =>
      auditLogsApi.list({
        targetUserId: targetId,
        entityType,
      }),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const logs = query.data?.items ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border-border flex max-h-[85vh] w-full max-w-3xl flex-col rounded-lg border p-6 shadow-lg">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 text-xl font-bold">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <span>{t("title", { targetTitle: targetTitle ? `: ${targetTitle}` : "" })}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t("closeModal")}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto py-4">
          {query.isPending && (
            <div className="flex justify-center p-8 text-slate-500">
              <History className="mr-2 h-6 w-6 animate-spin" />
              {t("loading")}
            </div>
          )}

          {query.isError && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{t("error")}</div>
          )}

          {!query.isPending && logs.length === 0 && (
            <div className="rounded-lg border bg-slate-50 p-8 text-center text-slate-500">
              {t("empty")}
            </div>
          )}

          {!query.isPending && logs.length > 0 && (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="space-y-2 rounded-lg border bg-white p-4 shadow-sm transition-colors hover:border-slate-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge tone="secondary">{log.entityType}</StatusBadge>
                      <StatusBadge
                        tone={
                          log.action.toLowerCase().includes("read") ||
                          log.action.toLowerCase().includes("list")
                            ? "secondary"
                            : "warning"
                        }
                      >
                        {log.action}
                      </StatusBadge>
                    </div>
                    <span className="font-mono text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString("es-CO")}
                    </span>
                  </div>

                  <div className="text-sm text-slate-700">
                    <span className="font-semibold">{t("actorId")}:</span>{" "}
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">{log.actorId}</code>
                  </div>

                  {(log.oldValue || log.newValue) && (
                    <button
                      onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                      className="pt-1 text-xs font-medium text-indigo-600 hover:underline"
                    >
                      {selectedLog?.id === log.id ? t("hideChanges") : t("viewChanges")}
                    </button>
                  )}

                  {selectedLog?.id === log.id && (
                    <div className="grid grid-cols-2 gap-2 pt-2 font-mono text-xs">
                      <div className="rounded border border-red-200 bg-red-50 p-2">
                        <p className="mb-1 font-sans font-bold text-red-700">{t("oldValue")}:</p>
                        <pre className="overflow-x-auto whitespace-pre-wrap">
                          {log.oldValue ? JSON.stringify(log.oldValue, null, 2) : t("noOldChanges")}
                        </pre>
                      </div>
                      <div className="rounded border border-emerald-200 bg-emerald-50 p-2">
                        <p className="mb-1 font-sans font-bold text-emerald-700">
                          {t("newValue")}:
                        </p>
                        <pre className="overflow-x-auto whitespace-pre-wrap">
                          {log.newValue ? JSON.stringify(log.newValue, null, 2) : t("noNewChanges")}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
