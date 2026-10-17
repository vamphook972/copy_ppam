import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

import { authClient } from "@/lib/auth";

interface BackendErrorData {
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown> | string | Array<{ field?: string; message?: string }>;
  };
  message?: string;
}

export interface ApiError extends Error {
  code?: string;
  status?: number;
  details?: Record<string, unknown> | string | Array<{ field?: string; message?: string }>;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export async function errorResponseInterceptor(
  error: AxiosError<BackendErrorData>,
  axiosInstance?: AxiosInstance
) {
  const originalRequest = error.config as CustomAxiosRequestConfig | undefined;
  const hasAuthHeader = Boolean(originalRequest?.headers?.get("Authorization"));

  // Manejo de Reintento 401 (Refresh Token Fall-back solo si la petición original tenía autenticación)
  if (
    error.response?.status === 401 &&
    originalRequest &&
    !originalRequest._retry &&
    hasAuthHeader
  ) {
    originalRequest._retry = true;

    try {
      const refreshedSession = await authClient.refreshSession();

      if (refreshedSession?.tokens?.accessToken) {
        // Actualizar la cookie del servidor con los nuevos tokens
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: refreshedSession.tokens.accessToken,
            idToken: refreshedSession.tokens.idToken,
          }),
        });

        // Actualizar el header Authorization de la petición original
        originalRequest.headers.set(
          "Authorization",
          `Bearer ${refreshedSession.tokens.accessToken}`
        );

        if (axiosInstance) {
          return axiosInstance(originalRequest);
        }
      }
    } catch {
      // Si la renovación falla, se asume sesión completamente revocada o expirada
    }
  }

  if (error.response?.data) {
    const errorData = error.response.data;
    const backendError = errorData.error;

    if (backendError) {
      const err: ApiError = new Error(backendError.message || "An error occurred");
      const detailCode =
        typeof backendError.details === "object" &&
        backendError.details !== null &&
        "code" in backendError.details
          ? String((backendError.details as Record<string, unknown>).code)
          : undefined;
      err.code = detailCode ?? backendError.code;
      err.status = error.response?.status;
      err.details = backendError.details;

      if (Array.isArray(backendError.details) && backendError.details.length > 0) {
        const detailMsgs = backendError.details
          .map((d) => (d.field ? `${d.field}: ${d.message}` : d.message))
          .filter(Boolean)
          .join(", ");
        err.message = backendError.message ? `${backendError.message} (${detailMsgs})` : detailMsgs;
      }

      return Promise.reject(err);
    }

    if (errorData.message) {
      return Promise.reject(new Error(errorData.message));
    }
  }

  return Promise.reject(error);
}
