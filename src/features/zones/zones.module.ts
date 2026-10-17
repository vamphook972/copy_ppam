import * as React from "react";

import { Icons } from "@/config/icons.config";
import { Typography } from "@/components/atoms/typography";
import { StatusBadge } from "@/components/molecules/status-badge";
import { createCrudModule } from "@/shared/factories/create-crud-module";

import { City } from "../cities";
import { placesModule } from "../places";
import { ZoneManagersTab } from "./components/zone-managers-tab";
import { ZoneSchedulesTab } from "./components/zone-schedules-tab";
import { mapZoneDtoToZone } from "./mappers/zone.mapper";
import { zoneFormSchema } from "./schemas/zone-form.schema";
import type { Zone, ZoneDto, ZoneFormValues, ZonesQueryParams } from "./types/zone";

export const zonesModule = createCrudModule<Zone, ZoneDto, ZoneFormValues, ZonesQueryParams>({
  entity: "zones",
  basePath: "/zones",
  translationNamespace: "zones",

  permissions: {
    read: "zone:read",
    create: "zone:create",
    update: "zone:update",
    delete: "zone:delete",
  },

  api: {
    endpoint: "/v1/zones",
    defaultParams: { include: "city" },
    mapDtoToEntity: mapZoneDtoToZone,
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
        cell: (row) => row.cityName,
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
    sortableColumns: ["name", "city", "status"],
  },

  form: {
    schema: zoneFormSchema,
    defaultValues: {
      name: "",
      cityId: "",
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
    mode: "tabs",
    header: {
      metadataFields: [
        {
          key: "name",
          label: "detail.name",
        },
        {
          key: "cityName",
          label: "detail.city",
        },
      ],
    },
    sections: [
      {
        id: "places",
        title: "detail.placesSection",
        icon: Icons.mapPin,
        renderCustom: (zone) =>
          React.createElement(placesModule.ListView, {
            searchParams: { zoneId: zone.id },
            hideHeader: true,
            hideFilters: true,
            omitColumns: ["city", "zone"],
          }),
      },
      {
        id: "superintendents",
        title: "detail.superintendentsSection",
        icon: Icons.userCheck,
        renderCustom: (zone) => React.createElement(ZoneManagersTab, { zone }),
      },
      {
        id: "schedules",
        title: "masterSchedule.tabTitle",
        icon: Icons.clock,
        renderCustom: (zone) => React.createElement(ZoneSchedulesTab, { zone }),
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
  ],

  actions: [
    { id: "view", type: "view", permission: "zone:read", icon: Icons.view },
    { id: "edit", type: "edit", permission: "zone:update", icon: Icons.edit },
    {
      id: "delete",
      type: "delete",
      permission: "zone:delete",
      icon: Icons.drop,
      confirm: {
        translationKey: "actions.deleteTitle",
        descriptionKey: "actions.deleteDescription",
      },
    },
  ],
});
