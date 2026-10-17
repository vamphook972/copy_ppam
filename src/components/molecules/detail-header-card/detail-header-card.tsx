"use client";

import { Edit } from "lucide-react";
import * as React from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/atoms/button";
import { Typography } from "@/components/atoms/typography";
import { StatusBadge } from "@/components/molecules/status-badge";
import { formatDate } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import type { BaseEntity, DetailHeaderConfig } from "@/shared/types/crud-module.types";

export interface DetailHeaderCardProps<
  TEntity extends BaseEntity & { name?: string; status?: string },
> {
  entity: TEntity;
  headerConfig?: DetailHeaderConfig<TEntity>;
  editHref?: string;
  editPermission?: string;
  editLabel?: string;
  translationNamespace?: string;
}

export function DetailHeaderCard<TEntity extends BaseEntity & { name?: string; status?: string }>({
  entity,
  headerConfig,
  editHref,
  editLabel,
  translationNamespace,
}: DetailHeaderCardProps<TEntity>) {
  const commonT = useTranslations("common");
  const finalEditLabel = editLabel || commonT("edit");
  const t = useTranslations(translationNamespace || "common");

  // Title resolution
  const titleValue = headerConfig?.titleKey
    ? (entity[headerConfig.titleKey as keyof TEntity] as string | undefined)
    : (entity.name ?? entity.id);

  // Status resolution
  const showBadge = headerConfig?.showStatusBadge !== false;
  const rawStatus = headerConfig?.statusKey
    ? entity[headerConfig.statusKey as keyof TEntity]
    : entity.status;

  const statusTone = headerConfig?.getStatusTone
    ? headerConfig.getStatusTone(rawStatus, entity)
    : rawStatus === "ACTIVE"
      ? "success"
      : "secondary";

  const statusLabel = headerConfig?.getStatusLabel
    ? headerConfig.getStatusLabel(rawStatus, entity)
    : rawStatus === "ACTIVE"
      ? "Activo"
      : rawStatus === "INACTIVE"
        ? "Inactivo"
        : String(rawStatus ?? "");

  // Metadata resolution
  const renderMetadata = () => {
    if (headerConfig?.metadataFields && headerConfig.metadataFields.length > 0) {
      const items: React.ReactNode[] = [];

      headerConfig.metadataFields.forEach((field, index) => {
        if (field.render) {
          items.push(<React.Fragment key={index}>{field.render(entity)}</React.Fragment>);
          return;
        }

        if (!field.key) return;

        const val = entity[field.key as keyof TEntity];
        if (val === undefined || val === null || val === "") return;

        let displayVal = String(val);
        if (field.format) {
          displayVal = field.format(val, entity);
        }

        const content = (
          <span key={index}>
            {field.label ? (
              <span className="text-muted-foreground mr-1">{t(field.label)}:</span>
            ) : null}
            <span
              className={
                field.monospace ? "text-foreground font-mono" : "text-foreground font-medium"
              }
            >
              {displayVal}
            </span>
          </span>
        );

        items.push(content);
      });

      if (items.length === 0) return null;

      return (
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs">
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span>•</span>}
              {item}
            </React.Fragment>
          ))}
        </div>
      );
    }

    // Default metadata if not explicitly provided (ID)
    return (
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs">
        <span>
          ID: <span className="text-foreground font-mono">{entity.id}</span>
        </span>
      </div>
    );
  };

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-3">
          <Typography variant="h2" className="text-2xl font-bold tracking-tight">
            {titleValue}
          </Typography>

          {showBadge && rawStatus !== undefined && rawStatus !== null ? (
            <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
          ) : null}
        </div>

        {renderMetadata()}

        {entity.createdAt ? (
          <Typography variant="caption" className="text-muted-foreground text-xs">
            {commonT("createdAt", { date: formatDate(entity.createdAt) })}
          </Typography>
        ) : null}
      </div>

      {editHref ? (
        <Link href={editHref}>
          <Button variant="outline" size="sm" className="shrink-0 gap-2">
            <Edit className="size-4" />
            <span>{finalEditLabel}</span>
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
