export interface ActivateUserInput {
  token: string;
  password: string;
}

export interface ActivateUserResponseDto {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface ActivateVerifyResponseDto {
  valid: boolean;
  email: string;
  tenantId: string;
  userId: string;
  name: string;
}

export type ActivationScreenState =
  "LOADING" | "ACCOUNT_ALREADY_ACTIVE" | "EXPIRED" | "INVALID" | "VALID" | "NETWORK_ERROR";
