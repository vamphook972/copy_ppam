import * as React from "react";

import { Icons } from "@/config/icons.config";
import { PlaceMonitoringTab } from "@/features/turns";
import { Typography } from "@/components/atoms/typography";
import { StatusBadge } from "@/components/molecules/status-badge";
import { createCrudModule } from "@/shared/factories/create-crud-module";

import { City } from "../cities";
import { Zone } from "../zones";
import { PlaceForm } from "./components/place-form";
import { PlaceMapView } from "./components/place-map-view";
import { PlaceSchedulesTab } from "./components/place-schedules-tab";
import { mapPlaceDtoToPlace } from "./mappers/place.mapper";
import { placeFormSchema } from "./schemas/place-form.schema";
import type { Place, PlaceDto, PlaceFormValues, PlacesQueryParams } from "./types/place";

export const placesModule = createCrudModule<Place, PlaceDto, PlaceFormValues, PlacesQueryParams>({
  entity: "places",
  basePath: "/places",
  translationNamespace: "places",

  permissions: {
    read: "place:read",
    create: "place:create",
    update: "place:update",
    delete: "place:delete",
  },

  api: {
    endpoint: "/v1/places",
    defaultParams: { include: "city,zone" as string },
    mapDtoToEntity: mapPlaceDtoToPlace,
  },

  table: {
    columns: [
      {
        id: "name",
        cell: (row) =>
          React.createElement(Typography, { variant: "body", className: "font-medium" }, row.name),
      },
      {
        id: "type",
        cell: (row) => row.type,
      },
      {
        id: "address",
        cell: (row) =>
          row.address && row.address.length > 25
            ? row.address.substring(0, 25) + "..."
            : row.address,
      },
      {
        id: "city",
        cell: (row) => row.cityName ?? "-",
      },
      {
        id: "zone",
        cell: (row) => row.zoneName ?? "-",
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
    sortableColumns: ["name", "city", "zone", "status"],
  },

  form: {
    schema: placeFormSchema,
    defaultValues: {
      name: "",
      cityId: "",
      zoneId: "",
      address: "",
      parkingAddress: "",
      parkingEmail: "",
      type: "REGULAR",
      minParticipants: 3,
      maxParticipants: 5,
      location: {
        latitude: 0,
        longitude: 0,
      },
      placeManagerId: "",
      status: "ACTIVE",
    },
    // Custom form renderer — bypasses the generic field renderer.
    // Handles geocodification, Leaflet map, and field-level Zod validation internally.
    renderForm: (props) => React.createElement(PlaceForm, props),
  },

  detail: {
    mode: "tabs",
    header: {
      metadataFields: [
        { key: "address", label: "detail.address" },
        { key: "zoneName", label: "detail.zone" },
        { key: "cityName", label: "detail.city" },
      ],
    },
    sections: [
      {
        id: "general",
        title: "detail.generalInfo",
        icon: Icons.place,
        fields: [
          { key: "name", label: "detail.name" },
          { key: "type", label: "detail.type" },
          { key: "address", label: "detail.address" },
          { key: "parkingAddress", label: "detail.parkingAddress" },
          { key: "parkingEmail", label: "detail.parkingEmail" },
          { key: "cityName", label: "detail.city" },
          { key: "zoneName", label: "detail.zone" },
          { key: "placeManagerName", label: "detail.placeManagerName" },
          { key: "minParticipants", label: "detail.minParticipants" },
          { key: "maxParticipants", label: "detail.maxParticipants" },
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
      // Map section — renders a read-only Leaflet map with the geocoded location
      {
        id: "map",
        title: "detail.locationMap",
        icon: Icons.location,
        renderCustom: (place) => React.createElement(PlaceMapView, { place }),
      },
      {
        id: "schedules",
        title: "masterSchedule.tabTitle",
        icon: Icons.clock,
        renderCustom: (place) => React.createElement(PlaceSchedulesTab, { place }),
      },
      {
        id: "monitoring",
        title: "masterSchedule.monitoringTabTitle",
        icon: Icons["calendar-days"],
        renderCustom: (place) => React.createElement(PlaceMonitoringTab, { placeId: place.id }),
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
      name: "zoneId",
      type: "relation",
      relation: {
        endpoint: "/v1/zones",
        queryParams: { status: "ACTIVE", pageSize: 200 },
        mapToOption: (zone: Zone) => ({
          value: zone.id,
          label: zone.name,
        }),
      },
    },
    {
      name: "type",
      type: "select",
      options: [
        { value: "REGULAR", translationKey: "form.typeRegular" },
        { value: "EVENT", translationKey: "form.typeEvent" },
        { value: "SPECIAL_EVENT", translationKey: "form.typeSpecialEvent" },
      ],
    },
  ],

  actions: [
    { id: "view", type: "view", permission: "place:read", icon: Icons.view },
    { id: "edit", type: "edit", permission: "place:update", icon: Icons.edit },
    {
      id: "delete",
      type: "delete",
      permission: "place:delete",
      icon: Icons.drop,
      confirm: {
        translationKey: "actions.deleteTitle",
        descriptionKey: "actions.deleteDescription",
      },
    },
  ],
});
