import * as React from "react";

import { Icons } from "@/config/icons.config";
import { Typography } from "@/components/atoms/typography";
import { StatusBadge } from "@/components/molecules/status-badge";
import { createCrudModule } from "@/shared/factories/create-crud-module";

import { ManageUserRolesDialog } from "./components/manage-user-roles-dialog";
import { UserRolesCell } from "./components/user-roles-cell";
import { UserRolesDetailSection } from "./components/user-roles-detail-section";
import { mapUserDtoToUser } from "./mappers/user.mapper";
import { userFormSchema } from "./schemas/user-form.schema";
import type { User, UserDto, UserFormValues, UsersQueryParams } from "./types/user";

export const usersModule = createCrudModule<User, UserDto, UserFormValues, UsersQueryParams>({
  entity: "users",
  basePath: "/users",
  translationNamespace: "users",

  permissions: {
    read: "user:read",
    update: "user:update",
    delete: "user:delete",
  },

  api: {
    endpoint: "/v1/users",
    mapDtoToEntity: mapUserDtoToUser,
  },

  table: {
    columns: [
      {
        id: "firstName",
        cell: (row) =>
          React.createElement(
            Typography,
            { variant: "body", className: "font-medium" },
            row.firstName
          ),
      },
      {
        id: "lastName",
        cell: (row) =>
          React.createElement(
            Typography,
            { variant: "body", className: "font-medium" },
            row.lastName
          ),
      },
      {
        id: "email",
        cell: (row) =>
          React.createElement(Typography, { variant: "body", className: "font-medium" }, row.email),
      },
      {
        id: "roles",
        cell: (row) => React.createElement(UserRolesCell, { user: row }),
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
    schema: userFormSchema,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      status: "ACTIVE",
    },
    fields: [
      {
        type: "text",
        name: "firstName",
        required: true,
        gridSpan: 1,
      },
      {
        type: "text",
        name: "lastName",
        required: true,
        gridSpan: 1,
      },
      {
        type: "email",
        name: "email",
        required: true,
        gridSpan: 1,
      },
      {
        type: "phone",
        name: "phoneNumber",
        required: true,
        gridSpan: 1,
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
      metadataFields: [{ key: "firstName" }],
    },
    sections: [
      {
        id: "general",
        title: "detail.generalInfo",
        icon: Icons.info,
        fields: [
          { key: "firstName", label: "detail.firstName" },
          { key: "lastName", label: "detail.lastName" },
          { key: "email", label: "detail.email" },
          { key: "phoneNumber", label: "detail.phoneNumber" },
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
        id: "roles",
        title: "detail.rolesSection",
        gridCols: 1,
        renderCustom: (user) => React.createElement(UserRolesDetailSection, { user }),
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
    {
      id: "view",
      type: "view",
      permission: "user:read",
      icon: Icons.view,
    },
    {
      id: "manage-roles",
      type: "custom",
      permission: "user:assign-role",
      icon: Icons.roles,
      translationKey: "actions.manageRoles",
      renderDialog: ({ entity, isOpen, onClose, refreshTable }) =>
        React.createElement(ManageUserRolesDialog, {
          user: entity,
          isOpen,
          onClose,
          onSuccess: refreshTable,
        }),
    },
    {
      id: "delete",
      type: "delete",
      permission: "user:delete",
      icon: Icons.drop,
      confirm: {
        translationKey: "actions.deleteTitle",
        descriptionKey: "actions.deleteDescription",
      },
    },
  ],
});
