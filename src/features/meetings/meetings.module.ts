import * as React from "react";

import { Icons } from "@/config/icons.config";
import { DateTimePicker } from "@/components/atoms/date-time-picker/date-time-picker";
import { Typography } from "@/components/atoms/typography";
import { FormField } from "@/components/molecules/form-field";
import { StatusBadge } from "@/components/molecules/status-badge";
import { createCrudModule } from "@/shared/factories/create-crud-module";

import { AttendanceDataTable } from "./components/attendance-data-table";
import { MeetingStatusActionsBar } from "./components/meeting-status-actions-bar";
import { mapMeetingDtoToMeeting } from "./mappers/meeting.mapper";
import { meetingFormSchema } from "./schemas/meeting-form.schema";
import type {
  Meeting,
  MeetingDto,
  MeetingFormValues,
  MeetingsQueryParams,
  MeetingStatus,
} from "./types/meeting";

function getMeetingStatusTone(status: MeetingStatus) {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "IN_PROGRESS":
      return "warning";
    case "CANCELED":
      return "destructive";
    case "SCHEDULED":
    default:
      return "secondary";
  }
}

export const meetingsModule = createCrudModule<
  Meeting,
  MeetingDto,
  MeetingFormValues,
  MeetingsQueryParams
>({
  entity: "meetings",
  basePath: "/meetings",
  translationNamespace: "meetings",

  permissions: {
    read: "meeting:read",
    create: "meeting:create",
    update: "meeting:update",
    delete: "meeting:cancel",
  },

  api: {
    endpoint: "/v1/meetings",
    mapDtoToEntity: mapMeetingDtoToMeeting,
  },

  table: {
    columns: [
      {
        id: "title",
        cell: (row) =>
          React.createElement(Typography, { variant: "body", className: "font-medium" }, row.title),
      },
      {
        id: "type",
        cell: (row) => row.type,
      },
      {
        id: "location",
        cell: (row) => row.location,
      },
      {
        id: "scheduledAt",
        cell: (row) => (row.scheduledAt ? new Date(row.scheduledAt).toLocaleString() : "-"),
      },
      {
        id: "status",
        cell: (row) =>
          React.createElement(StatusBadge, { tone: getMeetingStatusTone(row.status) }, row.status),
      },
    ],
    sortableColumns: ["title", "scheduledAt", "status"],
  },

  form: {
    schema: meetingFormSchema,
    defaultValues: {
      type: "INITIAL_ORIENTATION",
      title: "",
      description: "",
      location: "",
      scheduledAt: "",
      maxParticipants: 20,
      zoneId: undefined,
    },
    fields: [
      {
        type: "select",
        name: "type",
        required: true,
        gridSpan: 1,
        options: [
          { value: "INITIAL_ORIENTATION", translationKey: "form.typeOrientation" },
          { value: "ANNUAL_MEETING", translationKey: "form.typeAnnual" },
          { value: "MONTHLY_MEETING", translationKey: "form.typeMonthly" },
          { value: "EXTRAORDINARY_MEETING", translationKey: "form.typeExtraordinary" },
          { value: "OTHER", translationKey: "form.typeOther" },
        ],
      },
      {
        type: "text",
        name: "title",
        required: true,
        gridSpan: 1,
      },
      {
        type: "text",
        name: "location",
        required: true,
        gridSpan: 1,
      },
      {
        type: "custom",
        name: "scheduledAt",
        gridSpan: 1,
        render: ({ value, onChange, error }) =>
          React.createElement(
            FormField,
            {
              id: "scheduledAt",
              label: "Fecha y Hora Programada",
              error,
              required: true,
            },
            React.createElement(DateTimePicker, {
              id: "scheduledAt",
              value: (value as string) || "",
              onChange: (e) => onChange(e.target.value),
            })
          ),
      },
      {
        type: "number",
        name: "maxParticipants",
        required: true,
        gridSpan: 1,
      },
      {
        type: "relation",
        name: "zoneId",
        required: false,
        gridSpan: 1,
        relation: {
          endpoint: "/v1/zones",
          mapToOption: (zone: { id: string; name: string }) => ({
            value: zone.id,
            label: zone.name,
          }),
        },
      },
      {
        type: "text",
        name: "description",
        gridSpan: 2,
      },
    ],
  },

  detail: {
    mode: "stack",
    header: {
      titleKey: "title",
    },
    sections: [
      {
        id: "general",
        title: "detail.generalInfo",
        icon: Icons.info,
        fields: [
          { key: "title", label: "detail.title" },
          { key: "type", label: "detail.type" },
          { key: "location", label: "detail.location" },
          {
            key: "scheduledAt",
            label: "detail.scheduledAt",
            render: (v) => (v ? new Date(v as string).toLocaleString() : "-"),
          },
          { key: "maxParticipants", label: "detail.maxParticipants" },
          {
            key: "status",
            label: "detail.status",
            render: (v) =>
              React.createElement(
                StatusBadge,
                { tone: getMeetingStatusTone(v as MeetingStatus) },
                String(v)
              ),
          },
        ],
      },
      {
        id: "actions-bar",
        title: "detail.actionBar",
        gridCols: 1,
        renderCustom: (meeting) => React.createElement(MeetingStatusActionsBar, { meeting }),
      },
      {
        id: "attendances",
        title: "detail.attendancesSection",
        gridCols: 1,
        renderCustom: (meeting) =>
          React.createElement(AttendanceDataTable, { meetingId: meeting.id }),
      },
    ],
  },

  filters: [
    { name: "search", type: "search" },
    {
      name: "status",
      type: "select",
      options: [
        { value: "SCHEDULED", translationKey: "filters.statusScheduled" },
        { value: "IN_PROGRESS", translationKey: "filters.statusInProgress" },
        { value: "COMPLETED", translationKey: "filters.statusCompleted" },
        { value: "CANCELED", translationKey: "filters.statusCanceled" },
      ],
    },
  ],

  actions: [
    { id: "view", type: "view", permission: "meeting:read", icon: Icons.view },
    { id: "edit", type: "edit", permission: "meeting:update", icon: Icons.edit },
    {
      id: "delete",
      type: "delete",
      permission: "meeting:cancel",
      icon: Icons.drop,
      confirm: {
        translationKey: "actions.cancelTitle",
        descriptionKey: "actions.cancelDescription",
      },
    },
  ],
});
