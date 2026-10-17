import type { AxiosInstance } from "axios";

import { authRequestInterceptor } from "./auth.interceptor";
import { correlationRequestInterceptor } from "./correlation.interceptor";
import { errorResponseInterceptor } from "./error.interceptor";

export function setupHttpInterceptors(axios: AxiosInstance) {
  const requestInterceptorId = axios.interceptors.request.use(async (config) => {
    const withCorrelation = correlationRequestInterceptor(config);
    const withAuth = await authRequestInterceptor(withCorrelation);

    return withAuth;
  });

  const responseInterceptorId = axios.interceptors.response.use(
    (response) => response,
    (error) => errorResponseInterceptor(error, axios)
  );

  return () => {
    axios.interceptors.request.eject(requestInterceptorId);
    axios.interceptors.response.eject(responseInterceptorId);
  };
}
