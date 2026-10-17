"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notify } from "@/shared/utils/notify";

import { enrollmentsApi } from "../api/enrollments.api";
import type { RecordContactAttemptPayload } from "../types/enrollment";

export function useEnrollmentActions() {
  const queryClient = useQueryClient();

  const recordContactAttemptMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RecordContactAttemptPayload }) =>
      enrollmentsApi.recordContactAttempt(id, payload),
    onSuccess: (data) => {
      notify.success("Intento de contacto registrado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments", data.id] });
    },
    onError: (err) => {
      notify.error("Error al registrar el intento de contacto.");
      console.error(err);
    },
  });

  const confirmContactMutation = useMutation({
    mutationFn: (id: string) => enrollmentsApi.confirmContact(id),
    onSuccess: (data) => {
      notify.success("Contacto confirmado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments", data.id] });
    },
    onError: (err) => {
      notify.error("Error al confirmar el contacto.");
      console.error(err);
    },
  });

  return {
    recordContactAttemptMutation,
    confirmContactMutation,
  };
}
