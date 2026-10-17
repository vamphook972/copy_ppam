import {
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  Session,
  SignInCredentialsInput,
  SignInWithProviderInput,
} from "@/types/auth";

export interface SignInResult {
  session: Session | null;
  nextStep?: {
    challenge?: string;
    message?: string;
  };
}

export interface ForgotPasswordResult {
  delivery?: {
    destination?: string;
    medium?: string;
  };
}

export interface ResetPasswordResult {
  done: boolean;
}

export interface ChangePasswordResult {
  done: boolean;
}

export interface ConfirmSignInWithNewPasswordInput {
  newPassword: string;
}

export interface AuthClient {
  initialize(): Promise<void>;
  getSession(): Promise<Session | null>;
  signInWithCredentials(input: SignInCredentialsInput): Promise<SignInResult>;
  confirmSignInWithNewPassword(input: ConfirmSignInWithNewPasswordInput): Promise<SignInResult>;
  signInWithProvider(input: SignInWithProviderInput): Promise<void>;
  forgotPassword(input: ForgotPasswordInput): Promise<ForgotPasswordResult>;
  resetPassword(input: ResetPasswordInput): Promise<ResetPasswordResult>;
  changePassword(input: ChangePasswordInput): Promise<ChangePasswordResult>;
  signOut(options?: { global?: boolean }): Promise<void>;
  refreshSession(): Promise<Session | null>;
}
