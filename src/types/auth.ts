import { User } from "./user";

export type AuthStatus = "loading" | "authenticated" | "anonymous";
export type AuthFlow = "credentials" | "federated";

export type FederatedProvider = "Google" | "Apple" | "Microsoft";

export type AuthChallengeType =
  "NONE" | "NEW_PASSWORD_REQUIRED" | "SMS_MFA" | "SOFTWARE_TOKEN_MFA" | "MFA_SETUP" | "UNKNOWN";

export interface AuthChallenge {
  type: AuthChallengeType;
  sessionId?: string;
  metadata?: Record<string, string>;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface Session {
  user: User | null;
  tokens?: AuthTokens;
  flow?: AuthFlow;
  challenge?: AuthChallenge;
  isAuthenticated: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  recoverable: boolean;
}

export interface SignInCredentialsInput {
  email: string;
  password: string;
}

export interface SignInWithProviderInput {
  provider: FederatedProvider;
  redirectTo?: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
