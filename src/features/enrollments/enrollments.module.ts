import * as React from "react";
import { useTranslations } from "next-intl";

import { Icons } from "@/config/icons.config";
import { storageApi } from "@/features/storage/api/storage.api";
import { PdfFileUploadInput } from "@/features/storage/components/pdf-file-upload-input";
import { Button } from "@/components/atoms/button";
import { Typography } from "@/components/atoms/typography";
import { StatusBadge } from "@/components/molecules/status-badge";
import { createCrudModule } from "@/shared/factories/create-crud-module";
import { maskEmail } from "@/shared/utils/mask-email";
import { notify } from "@/shared/utils/notify";

import { enrollmentsApi } from "./api/enrollments.api";
import { ContactHistoryTimeline } from "./components/contact-history-timeline";
import { PdfFilePreview } from "./components/create-pdf-file-viewer";
import { RecordContactModal } from "./components/record-contact-modal";
import { mapEnrollmentDtoToEnrollment } from "./mappers/enrollment.mapper";
import { enrollmentFormSchema } from "./schemas/enrollment-form.schema";
import type {
  Enrollment,
  EnrollmentDto,
  EnrollmentFormValues,
  EnrollmentsQueryParams,
  EnrollmentStatus,
} from "./types/enrollment";

function DownloadFormButton({ fileId }: { fileId?: string | null }) {
  const t = useTranslations("enrollments");
  const [originalName, setOriginalName] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    if (fileId) {
      storageApi
        .getFileInfo(fileId)
        .then((fileInfo) => {
          if (isMounted && fileInfo?.originalName) {
            setOriginalName(fileInfo.originalName);
          }
        })
        .catch((err) => {
          console.error("Failed to load file info for detail view", err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [fileId]);

  if (!fileId) {
    return React.createElement(
      "span",
      { className: "text-xs italic text-muted-foreground" },
      t("storage.noFileAttached")
    );
  }

  const handleDownload = async () => {
    try {
      const data = await storageApi.getDownloadUrl(fileId);
      window.open(data.downloadUrl, "_blank");
    } catch (err) {
      notify.error(t("storage.downloadErrorNotification"));
      console.error(err);
    }
  };

  return React.createElement(
    "div",
    { className: "flex flex-wrap items-center gap-3" },
    originalName
      ? React.createElement(
          Typography,
          { variant: "body", className: "font-medium text-foreground" },
          originalName
        )
      : null,
    React.createElement(
      Button,
      { type: "button", variant: "outline", size: "sm", onClick: handleDownload },
      `📄 ${t("storage.downloadButton")}`
    )
  );
}

function getEnrollmentStatusTone(status: EnrollmentStatus) {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "INVITED":
      return "secondary";
    case "PENDING_CAPACITATION":
      return "warning";
    case "IN_CAPACITATION":
      return "warning";
    case "COMPLETED":
      return "success";
    case "REJECTED":
      return "destructive";
    case "UNREACHABLE":
      return "destructive";
    case "NO_SHOW":
      return "destructive";
    case "INVITATION_EXPIRED":
      return "destructive";
    default:
      return "secondary";
  }
}

export const enrollmentsModule = createCrudModule<
  Enrollment,
  EnrollmentDto,
  EnrollmentFormValues,
  EnrollmentsQueryParams
>({
  entity: "enrollments",
  basePath: "/enrollments",
  translationNamespace: "enrollments",

  permissions: {
    read: "enrollment:read",
    create: "enrollment:create",
    update: "enrollment:update",
    delete: "enrollment:delete",
  },

  api: {
    endpoint: "/v1/enrollments",
    mapDtoToEntity: mapEnrollmentDtoToEnrollment,
  },

  table: {
    columns: [
      {
        id: "firstName",
        cell: (row) => `${row.firstName || ""} ${row.lastName || ""}`.trim() || "-",
      },
      {
        id: "phoneNumber",
        cell: (row) => `${row.countryCode || "+57"} ${row.phoneNumber}`,
      },
      {
        id: "email",
        cell: (row) =>
          React.createElement(
            Typography,
            { variant: "body", className: "font-medium" },
            maskEmail(row.email)
          ),
      },
      {
        id: "status",
        cell: (row) =>
          React.createElement(
            StatusBadge,
            { tone: getEnrollmentStatusTone(row.status) },
            row.status
          ),
      },
    ],
    sortableColumns: ["status"],
  },

  form: {
    schema: enrollmentFormSchema,
    defaultValues: {
      email: "",
      countryCode: "+57",
      phoneNumber: "",
      firstName: "",
      lastName: "",
      fileId: "",
      fileUrl: "",
    },
    fields: [
      {
        type: "text",
        name: "email",
        required: true,
        gridSpan: 1,
      },
      {
        type: "phone",
        name: "phoneNumber",
        countryCodeName: "countryCode",
        required: true,
        gridSpan: 1,
      },
      {
        type: "text",
        name: "firstName",
        gridSpan: 1,
      },
      {
        type: "text",
        name: "lastName",
        gridSpan: 1,
      },
      {
        type: "custom",
        name: "fileId",
        gridSpan: 2,
        render: ({ value, onChange, error }) =>
          React.createElement(PdfFileUploadInput, {
            value: value as string,
            onChange: (id: string) => onChange(id),
            error,
          }),
      },
    ],
  },

  detail: {
    mode: "stack",
    sections: [
      {
        id: "general",
        title: "detail.generalInfo",
        icon: Icons.info,
        fields: [
          { key: "firstName", label: "detail.firstName" },
          { key: "lastName", label: "detail.lastName" },
          {
            key: "phoneNumber",
            label: "detail.phoneNumber",
            render: (_, entity) => `${entity.countryCode || "+57"} ${entity.phoneNumber}`,
          },
          { key: "email", label: "detail.email", render: (_, entity) => maskEmail(entity.email) },
          {
            key: "status",
            label: "detail.status",
            render: (v) =>
              React.createElement(
                StatusBadge,
                { tone: v === "ACTIVE" || v === "CONFIRMED" ? "success" : "secondary" },
                String(v)
              ),
          },
        ],
      },
      {
        id: "pdf-document",
        title: "detail.pdf-document",
        gridCols: 1,
        renderCustom: (enrollment) =>
          React.createElement(
            "div",
            { className: "space-y-4" },
            React.createElement(PdfFilePreview, {
              fileId: enrollment.fileId,
            }),
            React.createElement(DownloadFormButton, {
              fileId: enrollment.fileId,
            })
          ),
      },
      {
        id: "contact-history",
        title: "detail.contactHistorySection",
        gridCols: 1,
        renderCustom: (enrollment) =>
          React.createElement(ContactHistoryTimeline, {
            attempts: enrollment.contactAttempts || [],
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
    { id: "view", type: "view", permission: "enrollment:read", icon: Icons.view },
    {
      id: "edit",
      type: "edit",
      permission: "enrollment:update",
      icon: Icons.edit,
      isVisible: (row) => row.status === "PENDING",
    },
    {
      id: "record-contact",
      type: "custom",
      permission: "enrollment:contact-attempt",
      icon: Icons["record-contact"],
      variant: "outline",
      isVisible: (row) => ["PENDING", "NO_SHOW", "UNREACHABLE"].includes(row.status),
      renderDialog: ({ entity, isOpen, onClose, refreshTable }) =>
        React.createElement(RecordContactModal, {
          enrollment: entity,
          isOpen,
          onClose,
          onSuccess: () => {
            refreshTable();
            onClose();
          },
        }),
    },
    {
      id: "confirm-contact",
      type: "custom",
      permission: "enrollment:confirm-contact",
      icon: Icons["confirm-contact"],
      variant: "success",
      isVisible: (row) => row.status === "PENDING",
      confirm: {
        translationKey: "actions.confirmContactTitle",
        descriptionKey: "actions.confirmContactDescription",
      },
      onClick: async (enrollment, helpers) => {
        await enrollmentsApi.confirmContact(enrollment.id);
        helpers.refreshTable();
        helpers.notifySuccess("notifications.contactConfirmedSuccess");
      },
    },
  ],
});
