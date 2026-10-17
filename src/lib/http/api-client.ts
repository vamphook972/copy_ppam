export interface ApiClient {
  get<TResponse>(url: string, config?: RequestConfig): Promise<TResponse>;

  post<TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: RequestConfig
  ): Promise<TResponse>;

  put<TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: RequestConfig
  ): Promise<TResponse>;

  patch<TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: RequestConfig
  ): Promise<TResponse>;

  delete<TResponse>(url: string, config?: RequestConfig): Promise<TResponse>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  params?: Record<string, unknown>;
  data?: unknown;
}
