"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/http/interceptors/error.interceptor";
import { notify } from "@/shared/utils/notify";

import { meetingsApi } from "../api/meetings.api";
import type {
  AttendancesQueryParams,
  CancelMeetingPayload,
  CompleteMeetingPayload,
  MarkAttendancePayload,
  StartMeetingPayload,
} from "../types/meeting";

export function useMeetingActions(meetingId?: string) {
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: StartMeetingPayload }) =>
      meetingsApi.start(id, payload),
    onSuccess: (data) => {
      notify.success("Reunión iniciada correctamente.");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meetings", data.id] });
    },
    onError: (err) => {
      notify.error("Error al iniciar la reunión.");
      console.error(err);
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: CompleteMeetingPayload }) =>
      meetingsApi.complete(id, payload),
    onSuccess: (data) => {
      notify.success("Reunión completada correctamente.");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meetings", data.id] });
    },
    onError: (err) => {
      notify.error("Error al completar la reunión.");
      console.error(err);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CancelMeetingPayload }) =>
      meetingsApi.cancel(id, payload),
    onSuccess: (data) => {
      notify.success("Reunión cancelada.");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meetings", data.id] });
    },
    onError: (err) => {
      notify.error("Error al cancelar la reunión.");
      console.error(err);
    },
  });

  const markAttendanceMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MarkAttendancePayload }) =>
      meetingsApi.markAttendance(id, payload),
    onSuccess: (_, variables) => {
      notify.success("Asistencia registrada correctamente.");
      queryClient.invalidateQueries({ queryKey: ["meetings", variables.id, "attendances"] });
    },
    onError: (err: ApiError) => {
      if (err.status === 404) {
        notify.error("El código QR proporcionado no existe o ha expirado.");
      } else {
        notify.error(err.message || "Error al registrar la asistencia con el código QR provisto.");
      }
      console.error(err);
    },
  });

  const useAttendancesQuery = (params?: AttendancesQueryParams) =>
    useQuery({
      queryKey: ["meetings", meetingId, "attendances", params],
      queryFn: () => meetingsApi.getAttendances(meetingId!, params),
      enabled: Boolean(meetingId),
    });

  return {
    startMutation,
    completeMutation,
    cancelMutation,
    markAttendanceMutation,
    useAttendancesQuery,
  };
}
