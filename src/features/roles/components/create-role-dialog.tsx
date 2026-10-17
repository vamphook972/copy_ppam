"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Icons } from "@/config/icons.config";
import { Button, Icon, Spinner, Typography } from "@/components/atoms";
import { notify } from "@/shared/utils/notify";

import { useCreateRole } from "../hooks/use-roles";

export interface CreateRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRoleDialog({ isOpen, onClose }: CreateRoleDialogProps) {
  const t = useTranslations("roles");
  const commonT = useTranslations("common");

  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const createRoleMutation = useCreateRole();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim().toUpperCase();

    if (!trimmed || trimmed.length < 2) {
      setError("El nombre del rol debe tener al menos 2 caracteres");
      return;
    }

    if (!/^[A-Z0-9_\- ]+$/.test(trimmed)) {
      setError("Solo se permiten letras mayúsculas, números, guiones y espacios");
      return;
    }

    setError(null);

    try {
      await createRoleMutation.mutateAsync({ name: trimmed });
      notify.success(t("createRoleDialog.createSuccess"));
      setName("");
      onClose();
    } catch {
      notify.error(commonT("status.error"));
    }
  };

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-role-title"
    >
      <div className="bg-card border-border flex w-full max-w-md flex-col rounded-xl border p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <Icon icon={Icons.plus} className="size-5" />
            </div>
            <div>
              <Typography id="create-role-title" variant="h3" className="text-base font-semibold">
                {t("createRoleDialog.title")}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground text-xs">
                {t("createRoleDialog.description")}
              </Typography>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
          >
            <Icon icon={Icons.close} className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="role-name-input"
              className="text-foreground mb-1 block text-xs font-medium"
            >
              {t("createRoleDialog.nameLabel")}
            </label>
            <input
              id="role-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value.toUpperCase());
                if (error) setError(null);
              }}
              placeholder={t("createRoleDialog.namePlaceholder")}
              className="border-input bg-background focus:ring-primary h-9 w-full rounded-lg border px-3 text-xs tracking-wider uppercase focus:ring-1 focus:outline-none"
              autoFocus
            />
            {error && <p className="text-destructive text-2xs mt-1.5 font-medium">{error}</p>}
          </div>

          <div className="border-border mt-6 flex items-center justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={createRoleMutation.isPending}
              className="text-xs"
            >
              {commonT("actions.cancel")}
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={createRoleMutation.isPending}
              className="text-xs"
            >
              {createRoleMutation.isPending && <Spinner size={16} className="mr-1.5" />}
              {createRoleMutation.isPending
                ? t("createRoleDialog.creating")
                : t("createRoleDialog.create")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
