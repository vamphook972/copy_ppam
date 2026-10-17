import { env } from "./env";

export const apiConfig = Object.freeze({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
});
