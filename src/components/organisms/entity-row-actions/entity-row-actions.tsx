"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Icons } from "@/config/icons.config";
import type { Permission } from "@/config/permissions";
import { Button, Icon } from "@/components/atoms";
import { ConfirmDialog, PermissionGate } from "@/components/molecules";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import type { ActionHelpers, ModuleAction } from "@/shared/types/crud-module.types";
import { notify } from "@/shared/utils/notify";

export interface EntityRowActionsProps<TEntity> {
  row: TEntity;
  actions?: ModuleAction<TEntity>[];
  basePath: string;
  translationNamespace: string;
  onDeleteRequest?: (row: TEntity) => void;
  onRefresh?: () => void;
  renderRowActions?: (row: TEntity) => React.ReactNode;
}

export function EntityRowActions<TEntity extends { id: string }>({
  row,
  actions = [],
  basePath,
  translationNamespace,
  onDeleteRequest,
  onRefresh,
  renderRowActions,
}: EntityRowActionsProps<TEntity>) {
  const t = useTranslations(translationNamespace as Parameters<typeof useTranslations>[0]);
  const [activeDialogActionId, setActiveDialogActionId] = React.useState<string | null>(null);
  const [activeConfirmAction, setActiveConfirmAction] =
    React.useState<ModuleAction<TEntity> | null>(null);

  const helpers: ActionHelpers = React.useMemo(
    () => ({
      refreshTable: () => onRefresh?.(),
      notifySuccess: (key) => notify.success(t(key as Parameters<typeof t>[0])),
      notifyError: (key) => notify.error(t(key as Parameters<typeof t>[0])),
    }),
    [onRefresh, t]
  );

  const visibleActions = React.useMemo(() => {
    return actions.filter((action) => (action.isVisible ? action.isVisible(row) : true));
  }, [actions, row]);

  if (renderRowActions) {
    return <>{renderRowActions(row)}</>;
  }

  if (visibleActions.length === 0) {
    return null;
  }

  const getActionLabel = (action: ModuleAction<TEntity>) => {
    if (action.translationKey) {
      return t(action.translationKey as Parameters<typeof t>[0]);
    }
    if (action.type === "view") return t("actions.view" as Parameters<typeof t>[0]);
    if (action.type === "edit") return t("actions.edit" as Parameters<typeof t>[0]);
    if (action.type === "delete") return t("actions.delete" as Parameters<typeof t>[0]);
    return action.id;
  };

  const getActionIcon = (action: ModuleAction<TEntity>) => {
    if (action.icon) return action.icon;
    if (action.type === "view") return Icons.view;
    if (action.type === "edit") return Icons.edit;
    if (action.type === "delete") return Icons.drop;
    return Icons.more;
  };

  const getActionHref = (action: ModuleAction<TEntity>) => {
    if (action.href) return action.href(row);
    if (action.type === "view") return `${basePath}/${row.id}`;
    if (action.type === "edit") return `${basePath}/${row.id}/edit`;
    return undefined;
  };

  const handleActionClick = (action: ModuleAction<TEntity>) => {
    if (action.type === "delete") {
      onDeleteRequest?.(row);
      return;
    }

    if (action.renderDialog) {
      setActiveDialogActionId(action.id);
      return;
    }

    if (action.confirm) {
      setActiveConfirmAction(action);
      return;
    }

    void action.onClick?.(row, helpers);
  };

  const handleConfirmSubmit = async () => {
    if (!activeConfirmAction?.onClick) return;
    try {
      await activeConfirmAction.onClick(row, helpers);
      setActiveConfirmAction(null);
    } catch {
      notify.error(t("states.errorDescription" as Parameters<typeof t>[0]));
    }
  };

  const renderDropdownItem = (action: ModuleAction<TEntity>) => {
    const label = getActionLabel(action);
    const IconComp = getActionIcon(action);
    const href = getActionHref(action);

    const content = (
      <div className="flex items-center gap-2">
        <Icon icon={IconComp} />
        <span>{label}</span>
      </div>
    );

    if (href) {
      return (
        <DropdownMenuItem key={action.id} asChild>
          <Link href={href}>{content}</Link>
        </DropdownMenuItem>
      );
    }

    return (
      <DropdownMenuItem key={action.id} onSelect={() => handleActionClick(action)}>
        {content}
      </DropdownMenuItem>
    );
  };

  const renderDesktopButton = (action: ModuleAction<TEntity>) => {
    const label = getActionLabel(action);
    const IconComp = getActionIcon(action);
    const href = getActionHref(action);
    const variant =
      action.variant ??
      (action.type === "delete" ? "destructive" : action.type === "edit" ? "secondary" : "ghost");

    const btn = (
      <Button
        size="icon"
        variant={variant}
        onClick={href ? undefined : () => handleActionClick(action)}
        aria-label={label}
        title={label}
      >
        <Icon icon={IconComp} />
      </Button>
    );

    if (href) {
      return (
        <Link key={action.id} href={href} aria-label={label} title={label}>
          {btn}
        </Link>
      );
    }

    return <React.Fragment key={action.id}>{btn}</React.Fragment>;
  };

  const wrapPermission = (action: ModuleAction<TEntity>, element: React.ReactNode) => {
    if (!action.permission) return element;
    return (
      <PermissionGate key={action.id} permission={action.permission}>
        {element}
      </PermissionGate>
    );
  };

  const allPermissions = visibleActions
    .map((a) => a.permission)
    .filter((p): p is Permission => p !== undefined);

  return (
    <>
      {/* Mobile Dropdown */}
      <div className="sm:hidden">
        <PermissionGate
          permission={allPermissions.length > 0 ? allPermissions : undefined}
          mode="any"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                aria-label={t("table.actions" as Parameters<typeof t>[0])}
                title={t("table.actions" as Parameters<typeof t>[0])}
              >
                <Icon icon={Icons.more} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {visibleActions.map((act) => wrapPermission(act, renderDropdownItem(act)))}
            </DropdownMenuContent>
          </DropdownMenu>
        </PermissionGate>
      </div>

      {/* Desktop Buttons */}
      <div className="hidden items-center gap-1 sm:flex">
        {visibleActions.map((act) => wrapPermission(act, renderDesktopButton(act)))}
      </div>

      {/* Render custom dialogs if registered */}
      {actions.map((act) => {
        if (!act.renderDialog) return null;
        return (
          <React.Fragment key={act.id}>
            {act.renderDialog({
              entity: row,
              isOpen: activeDialogActionId === act.id,
              onClose: () => setActiveDialogActionId(null),
              refreshTable: () => onRefresh?.(),
            })}
          </React.Fragment>
        );
      })}

      {/* Render confirmation dialog if defined */}
      {activeConfirmAction?.confirm && (
        <ConfirmDialog
          open={Boolean(activeConfirmAction)}
          title={t(activeConfirmAction.confirm.translationKey as Parameters<typeof t>[0])}
          description={
            activeConfirmAction.confirm.descriptionKey
              ? t(activeConfirmAction.confirm.descriptionKey as Parameters<typeof t>[0])
              : ""
          }
          confirmLabel={t("actions.confirm" as Parameters<typeof t>[0]) || "Confirmar"}
          cancelLabel={t("actions.cancel" as Parameters<typeof t>[0]) || "Cancelar"}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setActiveConfirmAction(null)}
        />
      )}
    </>
  );
}
