"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import type { BaseEntity } from "@/shared/types/crud-module.types";

export interface DeleteDialogProps<TEntity extends BaseEntity> {
  entity: TEntity | null;
  entityNameKey?: string;
  translationNamespace: string;
  isDeleting?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function DeleteDialog<TEntity extends BaseEntity & { name?: string }>({
  entity,
  entityNameKey = "name",
  translationNamespace,
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteDialogProps<TEntity>) {
  const t = useTranslations(translationNamespace as Parameters<typeof useTranslations>[0]);
  const commonT = useTranslations("common");

  if (!entity) {
    return null;
  }

  const entityRecord = entity as Record<string, unknown>;
  const nameValue = String(entityRecord[entityNameKey] ?? entity.id);

  const description = nameValue
    ? t("actions.deleteDescription" as Parameters<typeof t>[0], { name: nameValue })
    : t("actions.deleteDescriptionFallback" as Parameters<typeof t>[0]);

  return (
    <ConfirmDialog
      open={Boolean(entity)}
      title={t("actions.deleteTitle" as Parameters<typeof t>[0])}
      description={description}
      confirmLabel={
        isDeleting
          ? t("actions.deleting" as Parameters<typeof t>[0])
          : t("actions.delete" as Parameters<typeof t>[0])
      }
      cancelLabel={commonT("cancel")}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
