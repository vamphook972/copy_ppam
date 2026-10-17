import { PaginatedResponse } from "@/types/api";

import {
  NotificationLog,
  NotificationLogDto,
  NotificationTemplateDto,
  SseNotificationEvent,
  UiNotificationItem,
} from "../types/notification";

export function mapNotificationTemplate(dto: NotificationTemplateDto) {
  return {
    templateId: dto.templateId,
    language: dto.language,
    subject: dto.subject,
    body: dto.body,
    description: dto.description || "",
    variables: dto.variables || [],
  };
}

export function mapNotificationLog(dto: NotificationLogDto): NotificationLog {
  return {
    id: dto.id,
    type: dto.type,
    subject: dto.subject,
    body: dto.body,
    language: dto.language,
    status: dto.status,
    recipients: dto.recipients || [],
    recipientType: dto.recipientType,
    deliveredAt: dto.deliveredAt,
    errorMessage: dto.errorMessage,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    isRead: dto.isRead,
    payload: dto.payload,
  };
}

export function mapPaginatedNotificationTemplates(
  response: PaginatedResponse<NotificationTemplateDto>
) {
  return {
    data: response.data?.map(mapNotificationTemplate) ?? [],
    meta: response.meta,
  };
}

export function mapPaginatedNotificationLogs(response: PaginatedResponse<NotificationLogDto>) {
  return {
    data: response.data?.map(mapNotificationLog) ?? [],
    meta: response.meta,
  };
}

export type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

function formatRelativeTime(dateString: string, t: TranslateFn): string {
  const eventDate = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - eventDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return t ? t("timeJustNow") : "Hace un momento";
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return t ? t("timeMinutesAgo", { count: diffInMinutes }) : `Hace ${diffInMinutes} min`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return t
      ? t("timeHoursAgo", { count: diffInHours })
      : `Hace ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  return t
    ? t("timeDaysAgo", { count: diffInDays })
    : `Hace ${diffInDays} ${diffInDays === 1 ? "día" : "días"}`;
}

export interface FormattedNotificationContent {
  title: string;
  description: string;
  type: "info" | "alert" | "user";
}

export interface SseEventFormatterStrategy {
  supports: (event: SseNotificationEvent) => boolean;
  format: (event: SseNotificationEvent, t: TranslateFn) => FormattedNotificationContent;
}

const orientationMeetingScheduledFormatter: SseEventFormatterStrategy = {
  supports: (event) => event.eventType === "OrientationScheduled",
  format: (event, t) => ({
    title: t("orientationMeetingScheduledTitle"),
    description: t("orientationMeetingScheduledDescription", {
      date: new Date(event.payload?.scheduledAt as string).toUTCString(),
    }),
    type: "info",
  }),
};

const trainingApprovedFormatter: SseEventFormatterStrategy = {
  supports: (event) => event.eventType === "TrainingApproved",
  format: (event, t) => ({
    title: t("trainingApprovedTitle"),
    description:
      typeof event.payload?.message === "string"
        ? event.payload.message
        : t("trainingApprovedDefaultDesc"),
    type: "info",
  }),
};

const trainingRejectedFormatter: SseEventFormatterStrategy = {
  supports: (event) => event.eventType === "TrainingRejected",
  format: (event, t) => ({
    title: t("trainingRejectedTitle"),
    description:
      typeof event.payload?.reason === "string"
        ? t("rejectedReason", { reason: String(event.payload.reason) })
        : t("trainingRejectedDefaultDesc"),
    type: "alert",
  }),
};

const participantActivatedFormatter: SseEventFormatterStrategy = {
  supports: (event) => event.eventType === "ParticipantActivated" || event.module === "users",
  format: (event, t) => ({
    title: t("participantActivatedTitle"),
    description:
      typeof event.payload?.message === "string"
        ? event.payload.message
        : t("participantActivatedDefaultDesc"),
    type: "user",
  }),
};

const enrollmentUpdatedFormatter: SseEventFormatterStrategy = {
  supports: (event) => event.module === "enrollment",
  format: (event, t) => ({
    title: t("enrollmentUpdatedTitle"),
    description:
      typeof event.payload?.message === "string"
        ? event.payload.message
        : t("enrollmentUpdatedDefaultDesc"),
    type: "info",
  }),
};

const siteTrainingScheduledFormatter: SseEventFormatterStrategy = {
  supports: (event) => event.eventType === "SiteTrainingScheduled",
  format: (event, t) => {
    const locationName =
      typeof event.payload?.location === "object"
        ? (event.payload.location as { name: string }).name
        : "lugar desconocido";

    const dateString =
      typeof event.payload?.scheduledAt === "string" ? event.payload.scheduledAt : undefined;

    const formattedDate = dateString
      ? new Date(dateString).toLocaleDateString(undefined, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : undefined;

    return {
      title: t("siteTrainingScheduledTitle"),
      description:
        typeof event.payload?.location === "object" && formattedDate
          ? t("siteTrainingScheduledDescription", {
              location: locationName,
              date: formattedDate,
            })
          : t("siteTrainingScheduledDefaultDesc"),
      type: "info",
    };
  },
};

const defaultEventFormatter: SseEventFormatterStrategy = {
  supports: () => true,
  format: (_event, t) => ({
    title: t("defaultTitle"),
    description: t("defaultDescription"),
    type: "info",
  }),
};

export const SSE_EVENT_FORMATTERS: SseEventFormatterStrategy[] = [
  orientationMeetingScheduledFormatter,
  siteTrainingScheduledFormatter,
  trainingApprovedFormatter,
  trainingRejectedFormatter,
  participantActivatedFormatter,
  enrollmentUpdatedFormatter,
  defaultEventFormatter,
];

export function mapSseEventToUiNotification(
  event: SseNotificationEvent,
  t: TranslateFn
): UiNotificationItem {
  const formatter =
    SSE_EVENT_FORMATTERS.find((strategy) => strategy.supports(event)) ?? defaultEventFormatter;
  const { title, description, type } = formatter.format(event, t);

  return {
    id: event.id,
    title,
    description,
    time: formatRelativeTime(event.createdAt, t),
    unread: true,
    type,
    createdAt: event.createdAt,
  };
}
