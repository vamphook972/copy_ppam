"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, useContext, useMemo } from "react";

import { authClient } from "@/lib/auth";
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  SignInCredentialsInput,
  SignInWithProviderInput,
} from "@/types/auth";

import { useSession } from "./session-provider";

interface AuthContextValue {
  signInWithCredentials: (
    input: SignInCredentialsInput
  ) => ReturnType<typeof authClient.signInWithCredentials>;
  confirmSignInWithNewPassword: (
    input: Parameters<typeof authClient.confirmSignInWithNewPassword>[0]
  ) => ReturnType<typeof authClient.confirmSignInWithNewPassword>;
  signInWithProvider: (
    input: SignInWithProviderInput
  ) => ReturnType<typeof authClient.signInWithProvider>;
  forgotPassword: (input: ForgotPasswordInput) => ReturnType<typeof authClient.forgotPassword>;
  resetPassword: (input: ResetPasswordInput) => ReturnType<typeof authClient.resetPassword>;
  changePassword: (input: ChangePasswordInput) => ReturnType<typeof authClient.changePassword>;
  signOut: (options?: { global?: boolean }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setSession } = useSession();
  const queryClient = useQueryClient();

  const value = useMemo<AuthContextValue>(
    () => ({
      signInWithCredentials: async (input) => {
        const result = await authClient.signInWithCredentials(input);

        if (result.session) {
          setSession(result.session);

          if (result.session.tokens) {
            await fetch("/api/auth/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                accessToken: result.session.tokens.accessToken,
                idToken: result.session.tokens.idToken,
              }),
            });
          }
        }

        return result;
      },
      confirmSignInWithNewPassword: async (input) => {
        const result = await authClient.confirmSignInWithNewPassword(input);

        if (result.session) {
          setSession(result.session);

          if (result.session.tokens) {
            await fetch("/api/auth/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                accessToken: result.session.tokens.accessToken,
                idToken: result.session.tokens.idToken,
              }),
            });
          }
        }

        return result;
      },
      signInWithProvider: async (input) => {
        await authClient.signInWithProvider(input);
      },
      forgotPassword: async (input) => authClient.forgotPassword(input),
      resetPassword: async (input) => authClient.resetPassword(input),
      changePassword: async (input) => authClient.changePassword(input),
      signOut: async (options) => {
        await authClient.signOut(options);
        await fetch("/api/auth/session", { method: "DELETE" });
        queryClient.clear();
        setSession(null);
      },
    }),
    [queryClient, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
