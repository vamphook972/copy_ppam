import type { InternalAxiosRequestConfig } from "axios";

import { authClient } from "@/lib/auth";

const PUBLIC_ENDPOINTS = new Set([
  "/v1/users/register",
  "/v1/enrollments/invitation",
  "/v1/auth/activate",
  "/v1/auth/activate/verify",
]);

function normalizePath(url?: string): string {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }

  const [path] = url.split("?");

  return path ?? "";
}

function isPublicEndpoint(pathname: string): boolean {
  return PUBLIC_ENDPOINTS.has(pathname);
}

export async function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  const pathname = normalizePath(config.url);

  if (isPublicEndpoint(pathname)) {
    return config;
  }

  const session = await authClient.getSession();
  const accessToken = session?.tokens?.accessToken;

  if (!accessToken) {
    return config;
  }

  config.headers.set("Authorization", `Bearer ${accessToken}`);

  return config;
}
