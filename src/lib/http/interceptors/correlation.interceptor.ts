import type { InternalAxiosRequestConfig } from "axios";

const CORRELATION_HEADER = "x-correlation-id";

function createCorrelationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `cid_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function correlationRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (!config.headers.has(CORRELATION_HEADER)) {
    config.headers.set(CORRELATION_HEADER, createCorrelationId());
  }

  return config;
}
