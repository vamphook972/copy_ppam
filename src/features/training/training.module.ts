import * as React from "react";

import { Icons } from "@/config/icons.config";
import { Typography } from "@/components/atoms/typography";
import { StatusBadge } from "@/components/molecules/status-badge";
import { createCrudModule } from "@/shared/factories/create-crud-module";

import { EvaluateTrainingModal } from "./components/evaluate-training-modal";
import { ScheduleTrainingModal } from "./components/schedule-training-modal";
import { mapTrainingDtoToTraining } from "./mappers/training.mapper";
import type {
  Training,
  TrainingDto,
  TrainingFormValues,
  TrainingQueryParams,
  TrainingStatus,
} from "./types/training";

const STATUS_TONE_MAP: Record<
  TrainingStatus,
  "default" | "success" | "warning" | "error" | "info" | "secondary"
> = {
  CREATED: "secondary",
  SCHEDULED: "info",
  IN_PROGRESS: "warning",
  REPROGRAMMED: "default",
  COMPLETED: "success",
  FAILED: "error",
};

const STATUS_LABEL_MAP: Record<TrainingStatus, string> = {
  CREATED: "Creada",
  SCHEDULED: "Agendada",
  IN_PROGRESS: "En Progreso",
  REPROGRAMMED: "Reprogramada",
  COMPLETED: "Aprobada",
  FAILED: "Reprobada",
};

export const trainingModule = createCrudModule<
  Training,
  TrainingDto,
  TrainingFormValues,
  TrainingQueryParams
>({
  entity: "training",
  basePath: "/training",
  translationNamespace: "training",

  permissions: {
    read: "training:read",
    update: "training:update",
    delete: "training:delete",
  },

  api: {
    endpoint: "/v1/trainings",
    mapDtoToEntity: mapTrainingDtoToTraining,
  },

  table: {
    columns: [
      {
        id: "userName",
        translationKey: "table.columns.participant",
        cell: (row) =>
          React.createElement(
            Typography,
            { variant: "body", className: "font-medium" },
            row.userName ?? row.userId
          ),
      },
      {
        id: "capacitatorName",
        translationKey: "table.columns.capacitator",
        cell: (row) => row.capacitatorName ?? row.capacitatorId ?? "-",
      },
      {
        id: "placeName",
        translationKey: "table.columns.place",
        cell: (row) => row.placeName ?? row.placeId ?? "-",
      },
      {
        id: "scheduledAt",
        cell: (row) =>
          row.scheduledAt
            ? new Date(row.scheduledAt).toLocaleString("es-ES", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "",
      },
      {
        id: "attemptNumber",
        cell: (row) => `Intento ${row.attemptNumber}`,
      },
      {
        id: "status",
        cell: (row) =>
          React.createElement(
            StatusBadge,
            { tone: STATUS_TONE_MAP[row.status] ?? "secondary" },
            STATUS_LABEL_MAP[row.status] ?? row.status
          ),
      },
    ],
    sortableColumns: ["scheduledAt", "status", "attemptNumber"],
  },

  detail: {
    mode: "stack",
    sections: [],
  },

  filters: [
    { name: "search", type: "search" },
    {
      name: "status",
      type: "select",
      options: [
        { value: "CREATED", translationKey: "filters.statusCreated" },
        { value: "SCHEDULED", translationKey: "filters.statusScheduled" },
        { value: "IN_PROGRESS", translationKey: "filters.statusInProgress" },
        { value: "REPROGRAMMED", translationKey: "filters.statusReprogrammed" },
        { value: "COMPLETED", translationKey: "filters.statusCompleted" },
        { value: "FAILED", translationKey: "filters.statusFailed" },
      ],
    },
  ],

  actions: [
    {
      id: "schedule",
      type: "custom",
      permission: "training:update",
      icon: Icons["calendar-days"] || Icons.edit,
      variant: "outline",
      isVisible: (row) => row.status === "CREATED",
      renderDialog: ({ entity, isOpen, onClose, refreshTable }) =>
        React.createElement(ScheduleTrainingModal, {
          training: entity,
          isOpen,
          onClose,
          onSuccess: () => {
            refreshTable();
            onClose();
          },
        }),
    },
    {
      id: "evaluate",
      type: "custom",
      permission: "training:update",
      icon: Icons.checklist || Icons.edit,
      variant: "default",
      isVisible: (row) =>
        row.status === "SCHEDULED" || row.status === "IN_PROGRESS" || row.status === "REPROGRAMMED",
      renderDialog: ({ entity, isOpen, onClose, refreshTable }) =>
        React.createElement(EvaluateTrainingModal, {
          training: entity,
          isOpen,
          onClose,
          onSuccess: () => {
            refreshTable();
            onClose();
          },
        }),
    },
  ],
});
