import * as React from "react";

import { Icons } from "@/config/icons.config";
import { Typography } from "@/components/atoms/typography";
import { StatusBadge } from "@/components/molecules/status-badge";
import { createCrudModule } from "@/shared/factories/create-crud-module";

import { zonesModule } from "../zones";
import { mapCityDtoToCity } from "./mappers/city.mapper";
import { cityFormSchema } from "./schemas/city-form.schema";
import type { CitiesQueryParams, City, CityDto, CityFormValues } from "./types/city";

export const citiesModule = createCrudModule<City, CityDto, CityFormValues, CitiesQueryParams>({
  entity: "cities",
  basePath: "/cities",
  translationNamespace: "cities",

  permissions: {
    read: "city:read",
    create: "city:create",
    update: "city:update",
    delete: "city:delete",
  },

  api: {
    endpoint: "/v1/cities",
    mapDtoToEntity: mapCityDtoToCity,
  },

  table: {
    columns: [
      {
        id: "name",
        cell: (row) =>
          React.createElement(Typography, { variant: "body", className: "font-medium" }, row.name),
      },
      {
        id: "postalCode",
        cell: (row) => row.postalCode ?? "-",
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
    schema: cityFormSchema,
    defaultValues: {
      name: "",
      postalCode: "",
      status: "ACTIVE",
    },
    fields: [
      {
        type: "text",
        name: "name",
        required: true,
        gridSpan: 1,
      },
      {
        type: "text",
        name: "postalCode",
        gridSpan: 1,
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
    sections: [
      {
        title: "detail.generalInfo",
        fields: [
          { key: "name", label: "detail.name" },
          { key: "postalCode", label: "detail.postalCode" },
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
        title: "detail.zonesSection",
        gridCols: 1,
        renderCustom: (city) =>
          React.createElement(zonesModule.ListView, {
            searchParams: { cityId: city.id },
            hideHeader: true,
            hideFilters: true,
            omitColumns: ["city"],
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
    { id: "view", type: "view", permission: "city:read", icon: Icons.view },
    { id: "edit", type: "edit", permission: "city:update", icon: Icons.edit },
    {
      id: "delete",
      type: "delete",
      permission: "city:delete",
      icon: Icons.drop,
      confirm: {
        translationKey: "actions.deleteTitle",
        descriptionKey: "actions.deleteDescription",
      },
    },
  ],
});
