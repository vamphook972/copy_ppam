import axios from "axios";

import { apiConfig } from "@/config/api.config";

import { setupHttpInterceptors } from "./interceptors";

export const axiosInstance = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

let ejectInterceptors: (() => void) | null = null;
export function initAxiosInterceptors() {
  if (ejectInterceptors) {
    ejectInterceptors();
  }
  ejectInterceptors = setupHttpInterceptors(axiosInstance);
}

initAxiosInterceptors();
