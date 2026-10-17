"use client";

import { AlertCircle, Award, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

import { Label, Select } from "@/components/atoms";
import { Badge } from "@/components/ui/badge";

const SERVICE_PRIVILEGE_OPTIONS = [
  { id: 1, key: "1" },
  { id: 2, key: "2" },
  { id: 3, key: "3" },
  { id: 4, key: "4" },
  { id: 5, key: "5" },
] as const;

interface ServicePrivilege {
  id: number;
  code: string;
  name: string;
}

interface PendingRequest {
  id: string;
  servicePrivilegeId: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
}

interface ProfilePrivilegesTabProps {
  currentPrivileges: ServicePrivilege[];
  pendingRequest?: PendingRequest | null;
  selectedPrivilegeId?: number | null;
  onSelectedPrivilegeIdChange: (id: number | null) => void;
  disabled?: boolean;
}

export function ProfilePrivilegesTab({
  currentPrivileges,
  pendingRequest,
  selectedPrivilegeId,
  onSelectedPrivilegeIdChange,
  disabled = false,
}: ProfilePrivilegesTabProps) {
  const t = useTranslations("profile.privileges");

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-xs">{t("privilegesNotice")}</p>

      {/* Current Privileges */}
      <div className="border-border/70 bg-card/60 space-y-3 rounded-lg border p-4 shadow-sm">
        <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
          {t("currentPrivileges")}
        </h4>

        {currentPrivileges.length === 0 ? (
          <p className="text-muted-foreground text-xs italic">{t("noCurrentPrivileges")}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {currentPrivileges.map((p) => (
              <Badge key={p.id} variant="default" className="gap-1.5 px-3 py-1 text-xs">
                <Award className="text-primary h-3.5 w-3.5" />
                <span>{p.name}</span>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Pending Request Banner */}
      {pendingRequest && pendingRequest.status === "PENDING" && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-950 shadow-sm dark:text-amber-200">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <span className="font-semibold">{t("pendingRequestBadge")}</span>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              {t("pendingRequestedAt", {
                date: new Date(pendingRequest.requestedAt).toLocaleDateString(),
              })}
            </p>
          </div>
        </div>
      )}

      {/* Request Privilege Change */}
      <div className="border-border/70 bg-card/60 space-y-4 rounded-lg border p-4 shadow-sm">
        <div>
          <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
            {t("requestPrivilegeChange")}
          </h4>
          <div className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
            <AlertCircle className="text-muted-foreground/70 h-3.5 w-3.5 shrink-0" />
            <p>{t("privilegeDraftNotice")}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="servicePrivilegeSelect" className="text-foreground text-xs font-medium">
            {t("selectPrivilege")}
          </Label>
          <Select
            id="servicePrivilegeSelect"
            value={selectedPrivilegeId?.toString() ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onSelectedPrivilegeIdChange(val ? parseInt(val, 10) : null);
            }}
            disabled={disabled}
            className="h-9 w-full text-xs"
          >
            <option value="">{t("selectPrivilege")}</option>
            {SERVICE_PRIVILEGE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id.toString()}>
                {t(`options.${opt.key}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
