import * as React from "react";

import { Icons } from "@/config/icons.config";
import { Typography } from "@/components/atoms/typography";
import { StatusBadge } from "@/components/molecules/status-badge";
import { createCrudModule } from "@/shared/factories/create-crud-module";
import { User } from "@/types";

import { congregationsModule } from "../congregations";
import { mapCircuitDtoToCircuit } from "./mappers/circuit.mapper";
import { circuitFormSchema } from "./schemas/circuit-form.schema";
import type { Circuit, CircuitDto, CircuitFormValues, CircuitsQueryParams } from "./types/circuit";

export const circuitsModule = createCrudModule<
  Circuit,
  CircuitDto,
  CircuitFormValues,
  CircuitsQueryParams
>({
  entity: "circuits",
  basePath: "/circuits",
  translationNamespace: "circuits",

  permissions: {
    read: "circuit:read",
    create: "circuit:create",
    update: "circuit:update",
    delete: "circuit:delete",
  },

  api: {
    endpoint: "/v1/circuits",
    defaultParams: { include: "superintendent" },
    mapDtoToEntity: mapCircuitDtoToCircuit,
  },

  table: {
    columns: [
      {
        id: "name",
        cell: (row) =>
          React.createElement(Typography, { variant: "body", className: "font-medium" }, row.name),
      },
      {
        id: "superintendent",
        cell: (row) =>
          React.createElement(
            Typography,
            { variant: "body", className: "font-medium" },
            row.superintendent?.fullName ?? ""
          ),
      },
      {
        id: "status",
        cell: (row) =>
          React.createElement(
            StatusBadge,
            { tone: row.status === "ACTIVE" ? "success" : "secondary" },
            row.status === "ACTIVE" ? "Activo" : "Inactivo"
          ),
      },
    ],
    sortableColumns: ["name", "status"],
  },

  form: {
    schema: circuitFormSchema,
    defaultValues: {
      name: "",
      superintendentId: "",
      status: "ACTIVE",
    },
    fields: [
      {
        type: "text",
        name: "name",
        required: true,
        gridSpan: 2,
      },
      {
        type: "relation",
        name: "superintendentId",
        gridSpan: 1,
        relation: {
          endpoint: "/v1/users",
          queryParams: { status: "ACTIVE", role: "CIRCUIT_SUPERINTENDENT" },
          mapToOption: (user: User) => ({
            value: user.id,
            label: `${user.fullName} (${user.email})`,
          }),
          searchParam: "search",
        },
      },
      {
        type: "select",
        name: "status",
        gridSpan: 1,
        options: [
          { value: "ACTIVE", translationKey: "form.statusActive" },
          { value: "INACTIVE", translationKey: "form.statusInactive" },
        ],
      },
    ],
  },

  detail: {
    mode: "stack",
    header: {
      metadataFields: [{ key: "name" }],
    },
    sections: [
      {
        id: "general",
        title: "detail.generalInfo",
        icon: Icons.info,
        fields: [
          { key: "name", label: "detail.name" },
          {
            key: "superintendent",
            label: "detail.superintendent",
            render: (_, v) =>
              React.createElement(
                Typography,
                { variant: "body", className: "font-medium" },
                v.superintendent?.fullName ?? ""
              ),
          },
          {
            key: "status",
            label: "detail.status",
            render: (v) =>
              React.createElement(
                StatusBadge,
                { tone: v === "ACTIVE" ? "success" : "secondary" },
                v === "ACTIVE" ? "Activo" : "Inactivo"
              ),
          },
        ],
      },
      {
        id: "congregations",
        title: "detail.congregationsSection",
        icon: Icons.congregation,
        renderCustom: (circuit) =>
          React.createElement(congregationsModule.ListView, {
            searchParams: { circuitId: circuit.id },
            hideHeader: true,
            hideFilters: true,
            omitColumns: ["circuit"],
          }),
      },
    ],
  },

  filters: [
    { name: "search", type: "search" },
    {
      name: "status",
      type: "select",
      options: [
        { value: "ACTIVE", translationKey: "filters.statusActive" },
        { value: "INACTIVE", translationKey: "filters.statusInactive" },
      ],
    },
  ],

  actions: [
    { id: "view", type: "view", permission: "circuit:read", icon: Icons.view },
    { id: "edit", type: "edit", permission: "circuit:update", icon: Icons.edit },
    {
      id: "delete",
      type: "delete",
      permission: "circuit:delete",
      icon: Icons.drop,
      confirm: {
        translationKey: "actions.deleteTitle",
        descriptionKey: "actions.deleteDescription",
      },
    },
  ],
});
