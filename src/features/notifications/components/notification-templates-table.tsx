"use client";

import { Edit2, Eye } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Badge, Button } from "@/components/atoms";
import { DataTable } from "@/components/organisms";
import { Link } from "@/i18n/navigation";
import type { Pagination } from "@/shared/types/api";

import { NotificationTemplate } from "../types/notification";
import { TemplatePreviewDialog } from "./template-preview-dialog";

interface NotificationTemplatesTableProps {
  data: NotificationTemplate[];
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  status: "idle" | "loading" | "empty" | "error" | "success";
}

export function NotificationTemplatesTable({
  data,
  pagination,
  onPageChange,
  onPageSizeChange,
  status,
}: NotificationTemplatesTableProps) {
  const t = useTranslations("emailTemplates");
  const commonT = useTranslations("common");
  const [previewTemplate, setPreviewTemplate] = useState<NotificationTemplate | null>(null);

  return (
    <>
      <DataTable
        caption={t("table.caption")}
        columns={[
          {
            id: "templateId",
            header: t("table.columns.templateId"),
            cell: (row: NotificationTemplate) => (
              <span className="text-foreground font-mono text-xs font-semibold">
                {row.templateId}
              </span>
            ),
          },
          {
            id: "language",
            header: t("table.columns.language"),
            cell: (row: NotificationTemplate) => (
              <Badge variant="secondary" className="uppercase">
                {row.language}
              </Badge>
            ),
          },
          {
            id: "subject",
            header: t("table.columns.subject"),
            cell: (row: NotificationTemplate) => (
              <span className="text-foreground line-clamp-1 font-medium">{row.subject}</span>
            ),
          },
          {
            id: "description",
            header: t("table.columns.description"),
            cell: (row: NotificationTemplate) => (
              <span className="text-muted-foreground line-clamp-1 text-xs">
                {row.description || "—"}
              </span>
            ),
          },
          {
            id: "variables",
            header: t("table.columns.variables"),
            cell: (row: NotificationTemplate) => (
              <div className="flex flex-wrap gap-1">
                {row.variables && row.variables.length > 0 ? (
                  row.variables.slice(0, 3).map((v) => (
                    <span
                      key={v}
                      className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px]"
                    >
                      {`{{${v}}}`}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
                {row.variables && row.variables.length > 3 && (
                  <span className="text-muted-foreground self-center text-[10px]">
                    +{row.variables.length - 3}
                  </span>
                )}
              </div>
            ),
          },
        ]}
        rows={data}
        getRowId={(row: NotificationTemplate) => row.templateId}
        status={status}
        emptyTitle={t("states.emptyTitle")}
        emptyDescription={t("states.emptyDescription")}
        errorTitle={t("states.errorTitle")}
        errorDescription={t("states.errorDescription")}
        loadingLabel={t("states.loading")}
        rowActions={(row: NotificationTemplate) => (
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setPreviewTemplate(row)}
              aria-label={t("actions.preview")}
              title={t("actions.preview")}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Link
              href={`/email-templates/${row.templateId}/edit`}
              aria-label={t("actions.edit")}
              title={t("actions.edit")}
            >
              <Button size="icon" variant="secondary">
                <Edit2 className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
        pagination={{
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalItems: pagination.totalItems,
          totalPages: pagination.totalPages,
          hasNext: pagination.hasNext,
          hasPrevious: pagination.hasPrevious,
          total: pagination.totalItems ?? pagination.total,
          labels: {
            previous: commonT("pagination.previous"),
            next: commonT("pagination.next"),
            page: commonT("pagination.page"),
            of: commonT("pagination.of"),
            rowsPerPage: commonT("pagination.rowsPerPage"),
          },
        }}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      <TemplatePreviewDialog
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        template={previewTemplate}
      />
    </>
  );
}
