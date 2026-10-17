"use client";

import { Eye, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Badge, Button } from "@/components/atoms";
import { ConfirmDialog } from "@/components/molecules";
import { DataTable } from "@/components/organisms";
import { formatDate } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import type { Pagination } from "@/shared/types/api";

import { tenantsApi } from "../api/tenants.api";
import { Tenant } from "../types/tenant";

interface TenantsTableProps {
  data: Tenant[];
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  status: "idle" | "loading" | "empty" | "error" | "success";
}

export function TenantsTable({
  data,
  pagination,
  onPageChange,
  onPageSizeChange,
  status,
}: TenantsTableProps) {
  const router = useRouter();
  const t = useTranslations("tenants");
  const commonT = useTranslations("common");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleStatus = async () => {
    if (!selectedTenant) return;
    setIsUpdating(true);
    try {
      const nextStatus = selectedTenant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      await tenantsApi.updateStatus(selectedTenant.id, nextStatus);
      setSelectedTenant(null);
      router.refresh();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <DataTable
        caption={t("table.caption")}
        columns={[
          {
            id: "name",
            header: t("table.columns.name"),
            cell: (row: Tenant) => (
              <span className="text-foreground font-semibold">{row.name}</span>
            ),
          },
          {
            id: "status",
            header: t("table.columns.status"),
            cell: (row: Tenant) => (
              <Badge variant={row.status === "ACTIVE" ? "success" : "error"}>
                {row.status === "ACTIVE" ? t("form.statusActive") : t("form.statusSuspended")}
              </Badge>
            ),
          },
          {
            id: "createdAt",
            header: t("table.columns.createdAt"),
            cell: (row: Tenant) => formatDate(row.createdAt),
          },
          {
            id: "updatedAt",
            header: t("table.columns.updatedAt"),
            cell: (row: Tenant) => formatDate(row.updatedAt),
          },
        ]}
        rows={data}
        getRowId={(row: Tenant) => row.id}
        status={status}
        emptyTitle={t("states.emptyTitle")}
        emptyDescription={t("states.emptyDescription")}
        errorTitle={t("states.errorTitle")}
        errorDescription={t("states.errorDescription")}
        loadingLabel={t("states.loading")}
        rowActions={(row: Tenant) => (
          <div className="flex items-center gap-1">
            <Link href={`/tenants/${row.id}`} aria-label={t("form.view")} title={t("form.view")}>
              <Button size="icon" variant="ghost">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>

            <Button
              size="icon"
              variant={row.status === "ACTIVE" ? "destructive" : "secondary"}
              onClick={() => setSelectedTenant(row)}
              aria-label={t("actions.changeStatus")}
              title={t("actions.changeStatus")}
            >
              {row.status === "ACTIVE" ? (
                <ShieldAlert className="h-4 w-4" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
            </Button>
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

      <ConfirmDialog
        open={Boolean(selectedTenant)}
        title={t("actions.changeStatusTitle")}
        description={
          selectedTenant?.name
            ? t("actions.changeStatusDescription", {
                name: selectedTenant.name,
              })
            : t("actions.changeStatusDescriptionFallback")
        }
        confirmLabel={isUpdating ? commonT("loading") : commonT("accept")}
        cancelLabel={commonT("cancel")}
        onConfirm={handleToggleStatus}
        onCancel={() => setSelectedTenant(null)}
      />
    </>
  );
}
