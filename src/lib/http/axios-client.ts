import { unwrapResponse } from "@/lib/http/mappers";
import { ApiResponse } from "@/shared/types/api";

import { ApiClient, RequestConfig } from "./api-client";
import { axiosInstance } from "./axios-instance";

export const axiosClient: ApiClient = {
  get: async function <TResponse>(url: string, config?: RequestConfig): Promise<TResponse> {
    const response = await axiosInstance.get<ApiResponse<TResponse>>(url, config);

    return unwrapResponse(response.data);
  },
  post: async function <TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: RequestConfig
  ): Promise<TResponse> {
    const response = await axiosInstance.post<ApiResponse<TResponse>>(url, body, config);

    return unwrapResponse(response.data);
  },
  put: async function <TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: RequestConfig
  ): Promise<TResponse> {
    const response = await axiosInstance.put<ApiResponse<TResponse>>(url, body, config);

    return unwrapResponse(response.data);
  },
  patch: async function <TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: RequestConfig
  ): Promise<TResponse> {
    const response = await axiosInstance.patch<ApiResponse<TResponse>>(url, body, config);

    return unwrapResponse(response.data);
  },
  delete: async function <TResponse>(url: string, config?: RequestConfig): Promise<TResponse> {
    const response = await axiosInstance.delete<ApiResponse<TResponse>>(url, config);

    return unwrapResponse(response.data);
  },
};
