"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  Eye,
  KeyRound,
  Plus,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { NotificationLog, notificationsApi } from "@/features/notifications";
import { Badge, Button, Input, Label, Typography } from "@/components/atoms";
import { ConfirmDialog, FormField, LoadingState, PhoneInputGroup } from "@/components/molecules";
import { DataTable } from "@/components/organisms";
import { formatDate } from "@/lib/utils";

import { tenantsApi } from "../api/tenants.api";
import { AddCoordinatorRequest, Coordinator } from "../index";
import { addCoordinatorSchema } from "../schemas/tenant.schema";
import { TenantConfigPanel } from "./tenant-config-panel";

function createPhoneFieldProps(
  name: string,
  value: string,
  onChange: (val: string) => void
): UseFormRegisterReturn {
  return {
    name,
    value,
    onChange: async (e: { target: { value: unknown } }) => {
      onChange(String(e.target?.value ?? ""));
    },
    onBlur: async () => {},
    ref: () => {},
  } as unknown as UseFormRegisterReturn;
}

interface TenantDetailContentProps {
  id: string;
}

export function TenantDetailContent({ id }: TenantDetailContentProps) {
  const t = useTranslations("tenants");
  const commonT = useTranslations("common");
  const [activeTab, setActiveTab] = useState<"config" | "coordinators" | "logs">("config");

  // Add Coordinator Modal state
  const [isAddCoordinatorOpen, setIsAddCoordinatorOpen] = useState(false);
  const [coordinatorForm, setCoordinatorForm] = useState<AddCoordinatorRequest>({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: {
      countryCode: "+57",
      number: "",
    },
    alternatePhoneNumber: null,
  });
  const [coordinatorError, setCoordinatorError] = useState("");
  const [isAddingCoordinator, setIsAddingCoordinator] = useState(false);

  // Status Change Dialog
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Log Detail Modal
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);

  // Tenant Query
  const tenantQuery = useQuery({
    queryKey: ["tenant", id],
    queryFn: () => tenantsApi.getTenant(id),
  });

  // Coordinators Query
  const coordinatorsQuery = useQuery({
    queryKey: ["tenant-coordinators", id],
    queryFn: () => tenantsApi.getCoordinators(id),
    enabled: activeTab === "coordinators",
  });

  // Logs Query
  const logsQuery = useQuery({
    queryKey: ["tenant-logs", id],
    queryFn: () => notificationsApi.getLogs(id),
    enabled: activeTab === "logs",
  });

  const tenant = tenantQuery.data;

  const handleToggleStatus = async () => {
    if (!tenant) return;
    setIsUpdatingStatus(true);
    try {
      const nextStatus = tenant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      await tenantsApi.updateStatus(tenant.id, nextStatus);
      void tenantQuery.refetch();
      setIsStatusDialogOpen(false);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddCoordinatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCoordinatorError("");
    const payload: AddCoordinatorRequest = {
      ...coordinatorForm,
      alternatePhoneNumber:
        coordinatorForm.alternatePhoneNumber &&
        coordinatorForm.alternatePhoneNumber.number.trim() !== ""
          ? coordinatorForm.alternatePhoneNumber
          : null,
    };
    const parsed = addCoordinatorSchema.safeParse(payload);
    if (!parsed.success) {
      setCoordinatorError(parsed.error.message || "Datos de coordinador inválidos");
      return;
    }

    setIsAddingCoordinator(true);
    try {
      await tenantsApi.addCoordinator(id, parsed.data);
      setIsAddCoordinatorOpen(false);
      setCoordinatorForm({
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: {
          countryCode: "+57",
          number: "",
        },
        alternatePhoneNumber: null,
      });
      void coordinatorsQuery.refetch();
    } catch {
      setCoordinatorError("Error al agregar el coordinador");
    } finally {
      setIsAddingCoordinator(false);
    }
  };

  if (tenantQuery.isPending) {
    return (
      <div className="p-6">
        <LoadingState title={t("states.loading")} />
      </div>
    );
  }

  if (tenantQuery.isError || !tenant) {
    return (
      <div className="p-6 text-center">
        <Typography variant="h3">{t("states.errorTitle")}</Typography>
        <Typography variant="caption" className="text-muted-foreground mt-1">
          {t("states.errorDescription")}
        </Typography>
      </div>
    );
  }

  const coordinators = coordinatorsQuery.data?.items ?? [];
  const logs = logsQuery.data?.items ?? [];

  return (
    <main className="space-y-6">
      {/* Detail Header */}
      <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <Typography variant="h1">{tenant.name}</Typography>
            <Badge variant={tenant.status === "ACTIVE" ? "success" : "error"}>
              {tenant.status === "ACTIVE" ? t("form.statusActive") : t("form.statusSuspended")}
            </Badge>
          </div>
          <Typography variant="caption" className="text-muted-foreground">
            ID: <span className="text-foreground font-mono">{tenant.id}</span> • Creado el{" "}
            {formatDate(tenant.createdAt)}
          </Typography>
        </div>

        <Button
          variant={tenant.status === "ACTIVE" ? "destructive" : "secondary"}
          onClick={() => setIsStatusDialogOpen(true)}
        >
          {tenant.status === "ACTIVE" ? (
            <ShieldAlert className="mr-2 h-4 w-4" />
          ) : (
            <ShieldCheck className="mr-2 h-4 w-4" />
          )}
          {t("actions.changeStatus")}
        </Button>
      </div>

      {/* Tabs Navigation */}
      <div className="border-border border-b">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("config")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "config"
                ? "border-primary text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            <KeyRound className="h-4 w-4" />
            {t("tabs.config")}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("coordinators")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "coordinators"
                ? "border-primary text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            <Users className="h-4 w-4" />
            {t("tabs.coordinators")}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "logs"
                ? "border-primary text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            <Bell className="h-4 w-4" />
            {t("tabs.logs")}
          </button>
        </div>
      </div>

      {/* Tab 1: Configuración */}
      {activeTab === "config" && (
        <TenantConfigPanel tenantId={tenant.id} initialTenant={tenant} isNameDisabled={false} />
      )}

      {/* Tab 2: Coordinadores */}
      {activeTab === "coordinators" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Typography variant="h3">{t("coordinators.title")}</Typography>
            <Button onClick={() => setIsAddCoordinatorOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("coordinators.addButton")}
            </Button>
          </div>

          <DataTable
            columns={[
              {
                id: "email",
                header: t("coordinators.columns.email"),
                cell: (row: Coordinator) => (
                  <span className="text-foreground font-medium">{row.email}</span>
                ),
              },
              {
                id: "role",
                header: t("coordinators.columns.role"),
                cell: (row: Coordinator) => <Badge variant="outline">{row.role}</Badge>,
              },
              {
                id: "status",
                header: t("coordinators.columns.status"),
                cell: (row: Coordinator) => (
                  <Badge variant={row.status === "ACTIVE" ? "success" : "secondary"}>
                    {row.status}
                  </Badge>
                ),
              },
            ]}
            rows={coordinators}
            getRowId={(row: Coordinator) => row.id}
            status={
              coordinatorsQuery.isPending
                ? "loading"
                : coordinatorsQuery.isError
                  ? "error"
                  : coordinators.length === 0
                    ? "empty"
                    : "success"
            }
            emptyTitle={t("coordinators.emptyTitle")}
            emptyDescription={t("coordinators.emptyDescription")}
            loadingLabel={t("states.loading")}
          />
        </div>
      )}

      {/* Tab 3: Logs de Notificaciones */}
      {activeTab === "logs" && (
        <div className="flex flex-col gap-4">
          <Typography variant="h3">{t("logs.title")}</Typography>
          <DataTable
            columns={[
              {
                id: "type",
                header: t("logs.columns.type"),
                cell: (row: NotificationLog) => (
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    {row.type}
                  </Badge>
                ),
              },
              {
                id: "subject",
                header: t("logs.columns.subject"),
                cell: (row: NotificationLog) => (
                  <span className="text-foreground line-clamp-1 font-medium">{row.subject}</span>
                ),
              },
              {
                id: "recipients",
                header: t("logs.columns.recipients"),
                cell: (row: NotificationLog) => (
                  <span className="text-muted-foreground line-clamp-1 font-mono text-xs">
                    {row.recipients?.join(", ") || "—"}
                  </span>
                ),
              },
              {
                id: "status",
                header: t("logs.columns.status"),
                cell: (row: NotificationLog) => (
                  <Badge
                    variant={
                      row.status === "SENT"
                        ? "success"
                        : row.status === "FAILED"
                          ? "error"
                          : "secondary"
                    }
                  >
                    {row.status}
                  </Badge>
                ),
              },
              {
                id: "deliveredAt",
                header: t("logs.columns.deliveredAt"),
                cell: (row: NotificationLog) => formatDate(row.deliveredAt || row.createdAt),
              },
            ]}
            rows={logs}
            getRowId={(row: NotificationLog) => row.id}
            status={
              logsQuery.isPending
                ? "loading"
                : logsQuery.isError
                  ? "error"
                  : logs.length === 0
                    ? "empty"
                    : "success"
            }
            emptyTitle={t("logs.emptyTitle")}
            emptyDescription={t("logs.emptyDescription")}
            loadingLabel={t("states.loading")}
            rowActions={(row: NotificationLog) => (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedLog(row)}
                aria-label="Ver detalle de log"
                title="Ver detalle de log"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          />
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border-border flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border shadow-xl">
            {/* Header */}
            <div className="border-border flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <Typography variant="h3">{t("logs.modal.title")}</Typography>
                <Badge
                  variant={
                    selectedLog.status === "SENT"
                      ? "success"
                      : selectedLog.status === "FAILED"
                        ? "error"
                        : "secondary"
                  }
                >
                  {selectedLog.status}
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSelectedLog(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
              {/* Metadata Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Typography
                    variant="caption"
                    className="text-muted-foreground font-semibold uppercase"
                  >
                    Tipo de Evento:
                  </Typography>
                  <Typography variant="body" className="font-mono text-sm font-semibold">
                    {selectedLog.type}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="caption"
                    className="text-muted-foreground font-semibold uppercase"
                  >
                    Fecha de Envío:
                  </Typography>
                  <Typography variant="body" className="text-sm">
                    {formatDate(selectedLog.deliveredAt || selectedLog.createdAt)}
                  </Typography>
                </div>
                <div className="sm:col-span-2">
                  <Typography
                    variant="caption"
                    className="text-muted-foreground font-semibold uppercase"
                  >
                    Destinatario(s):
                  </Typography>
                  <Typography variant="body" className="font-mono text-sm">
                    {selectedLog.recipients?.join(", ") || "—"}
                  </Typography>
                </div>
                <div className="sm:col-span-2">
                  <Typography
                    variant="caption"
                    className="text-muted-foreground font-semibold uppercase"
                  >
                    Asunto:
                  </Typography>
                  <Typography variant="body" className="text-sm font-medium">
                    {selectedLog.subject}
                  </Typography>
                </div>
              </div>

              {/* Error Message Callout */}
              {selectedLog.errorMessage && (
                <div className="border-destructive/30 bg-destructive/10 text-destructive flex flex-col gap-1.5 rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{t("logs.modal.errorMessageTitle")}</span>
                  </div>
                  <Typography variant="caption" className="text-destructive font-mono text-xs">
                    {selectedLog.errorMessage}
                  </Typography>
                </div>
              )}

              {/* HTML Body Render */}
              {selectedLog.body && (
                <div className="flex flex-col gap-1.5">
                  <Typography
                    variant="caption"
                    className="text-muted-foreground font-semibold tracking-wider uppercase"
                  >
                    {t("logs.modal.htmlPreviewTitle")}:
                  </Typography>
                  <div
                    className="prose dark:prose-invert border-border bg-card max-h-[300px] max-w-none overflow-y-auto rounded-md border p-4 text-xs shadow-xs"
                    dangerouslySetInnerHTML={{ __html: selectedLog.body }}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-border bg-muted/20 flex justify-end border-t px-6 py-3">
              <Button type="button" variant="secondary" onClick={() => setSelectedLog(null)}>
                {commonT("cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Coordinator Modal */}
      {isAddCoordinatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border-border w-full max-w-md rounded-lg border p-6 shadow-xl">
            <div className="flex items-center gap-2 pb-4">
              <UserCheck className="text-primary h-5 w-5" />
              <Typography variant="h3">{t("coordinators.form.title")}</Typography>
            </div>

            <form onSubmit={handleAddCoordinatorSubmit} className="flex flex-col gap-4">
              {coordinatorError && (
                <div className="bg-destructive/10 text-destructive rounded-md p-3 text-xs font-medium">
                  {coordinatorError}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-email">{t("coordinators.form.emailLabel")}</Label>
                <Input
                  id="c-email"
                  type="email"
                  required
                  value={coordinatorForm.email}
                  onChange={(e) =>
                    setCoordinatorForm({ ...coordinatorForm, email: e.target.value })
                  }
                  placeholder="coordinador@ejemplo.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="c-firstName">{t("coordinators.form.firstNameLabel")}</Label>
                  <Input
                    id="c-firstName"
                    required
                    value={coordinatorForm.firstName}
                    onChange={(e) =>
                      setCoordinatorForm({ ...coordinatorForm, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="c-lastName">{t("coordinators.form.lastNameLabel")}</Label>
                  <Input
                    id="c-lastName"
                    required
                    value={coordinatorForm.lastName}
                    onChange={(e) =>
                      setCoordinatorForm({ ...coordinatorForm, lastName: e.target.value })
                    }
                  />
                </div>
              </div>

              <FormField id="c-phone" label={t("coordinators.form.phoneLabel")} required>
                <PhoneInputGroup
                  countryCodeProps={createPhoneFieldProps(
                    "phoneNumber.countryCode",
                    coordinatorForm.phoneNumber?.countryCode || "+57",
                    (val) =>
                      setCoordinatorForm((prev) => ({
                        ...prev,
                        phoneNumber: {
                          countryCode: val,
                          number: prev.phoneNumber?.number || "",
                        },
                      }))
                  )}
                  phoneNumberProps={createPhoneFieldProps(
                    "phoneNumber.number",
                    coordinatorForm.phoneNumber?.number || "",
                    (val) =>
                      setCoordinatorForm((prev) => ({
                        ...prev,
                        phoneNumber: {
                          countryCode: prev.phoneNumber?.countryCode || "+57",
                          number: val.replace(/\D/g, ""),
                        },
                      }))
                  )}
                />
              </FormField>

              <FormField id="c-altPhone" label={t("coordinators.form.alternatePhoneLabel")}>
                <PhoneInputGroup
                  countryCodeProps={createPhoneFieldProps(
                    "alternatePhoneNumber.countryCode",
                    coordinatorForm.alternatePhoneNumber?.countryCode || "+57",
                    (val) =>
                      setCoordinatorForm((prev) => ({
                        ...prev,
                        alternatePhoneNumber: {
                          countryCode: val,
                          number: prev.alternatePhoneNumber?.number || "",
                        },
                      }))
                  )}
                  phoneNumberProps={createPhoneFieldProps(
                    "alternatePhoneNumber.number",
                    coordinatorForm.alternatePhoneNumber?.number || "",
                    (val) => {
                      const newNum = val.replace(/\D/g, "");
                      setCoordinatorForm((prev) => ({
                        ...prev,
                        alternatePhoneNumber: newNum
                          ? {
                              countryCode: prev.alternatePhoneNumber?.countryCode || "+57",
                              number: newNum,
                            }
                          : null,
                      }));
                    }
                  )}
                />
              </FormField>

              <div className="mt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddCoordinatorOpen(false)}
                >
                  {commonT("cancel")}
                </Button>
                <Button type="submit" disabled={isAddingCoordinator}>
                  {isAddingCoordinator ? "Guardando..." : t("coordinators.form.submit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      <ConfirmDialog
        open={isStatusDialogOpen}
        title={t("actions.changeStatus")}
        description={`¿Estás seguro de que deseas ${
          tenant.status === "ACTIVE" ? "SUSPENDER" : "ACTIVAR"
        } el tenant "${tenant.name}"?`}
        confirmLabel={isUpdatingStatus ? "Actualizando..." : "Confirmar"}
        cancelLabel={commonT("cancel")}
        onConfirm={handleToggleStatus}
        onCancel={() => setIsStatusDialogOpen(false)}
      />
    </main>
  );
}
