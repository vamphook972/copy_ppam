import * as React from "react";

import { Icons } from "@/config/icons.config";
import { Typography } from "@/components/atoms/typography";
import { StatusBadge } from "@/components/molecules/status-badge";
import { createCrudModule } from "@/shared/factories/create-crud-module";

import { Circuit } from "../circuits";
import { City } from "../cities";
import { usersModule } from "../users";
import { mapCongregationDtoToCongregation } from "./mappers/congregation.mapper";
import { congregationFormSchema } from "./schemas/congregation-form.schema";
import type {
  Congregation,
  CongregationDto,
  CongregationFormValues,
  CongregationsQueryParams,
} from "./types/congregation";

export const congregationsModule = createCrudModule<
  Congregation,
  CongregationDto,
  CongregationFormValues,
  CongregationsQueryParams
>({
  entity: "congregations",
  basePath: "/congregations",
  translationNamespace: "congregations",

  permissions: {
    read: "congregation:read",
    create: "congregation:create",
    update: "congregation:update",
    delete: "congregation:delete",
  },

  api: {
    endpoint: "/v1/congregations",
    defaultParams: { include: "city,circuit" },
    mapDtoToEntity: mapCongregationDtoToCongregation,
  },

  table: {
    columns: [
      {
        id: "name",
        cell: (row) =>
          React.createElement(Typography, { variant: "body", className: "font-medium" }, row.name),
      },
      {
        id: "city",
        cell: (row) =>
          React.createElement(
            Typography,
            { variant: "body", className: "font-medium" },
            row.city?.name
          ),
      },
      {
        id: "circuit",
        cell: (row) =>
          React.createElement(
            Typography,
            { variant: "body", className: "font-medium" },
            row.circuit?.name
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
    schema: congregationFormSchema,
    defaultValues: {
      name: "",
      cityId: "",
      circuitId: "",
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
        name: "cityId",
        required: true,
        gridSpan: 1,
        relation: {
          endpoint: "/v1/cities",
          queryParams: { status: "ACTIVE", pageSize: 200 },
          mapToOption: (city: City) => ({
            value: city.id,
            label: city.name,
          }),
          searchParam: "search",
        },
      },
      {
        type: "relation",
        name: "circuitId",
        required: true,
        gridSpan: 1,
        relation: {
          endpoint: "/v1/circuits",
          queryParams: { status: "ACTIVE", pageSize: 100 },
          mapToOption: (circuit: Circuit) => ({
            value: circuit.id,
            label: circuit.name,
          }),
          searchParam: "search",
        },
      },
      {
        type: "select",
        name: "status",
        gridSpan: 2,
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
            key: "city.name",
            label: "detail.city",
            render: (_, v) =>
              React.createElement(
                Typography,
                { variant: "body", className: "font-medium" },
                v.city?.name
              ),
          },
          {
            key: "circuit.name",
            label: "detail.circuit",
            render: (_, v) =>
              React.createElement(
                Typography,
                { variant: "body", className: "font-medium" },
                v.circuit?.name
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
        id: "members",
        title: "detail.membersSection",
        icon: Icons.userGroup,
        renderCustom: (congregation: Congregation) => {
          return React.createElement(usersModule.ListView, {
            searchParams: { congregationId: congregation.id },
            hideHeader: true,
            hideFilters: true,
          });
        },
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
    {
      name: "cityId",
      type: "relation",
      relation: {
        endpoint: "/v1/cities",
        queryParams: { status: "ACTIVE", pageSize: 200 },
        mapToOption: (city: City) => ({
          value: city.id,
          label: city.name,
        }),
      },
    },
    {
      name: "circuitId",
      type: "relation",
      relation: {
        endpoint: "/v1/circuits",
        queryParams: { status: "ACTIVE", pageSize: 200 },
        mapToOption: (circuit: Circuit) => ({
          value: circuit.id,
          label: circuit.name,
        }),
      },
    },
  ],

  actions: [
    { id: "view", type: "view", permission: "congregation:read", icon: Icons.view },
    { id: "edit", type: "edit", permission: "congregation:update", icon: Icons.edit },
    {
      id: "delete",
      type: "delete",
      permission: "congregation:delete",
      icon: Icons.drop,
      confirm: {
        translationKey: "actions.deleteTitle",
        descriptionKey: "actions.deleteDescription",
      },
    },
  ],
});
