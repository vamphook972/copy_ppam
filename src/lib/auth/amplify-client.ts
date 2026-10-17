import {
  confirmResetPassword,
  confirmSignIn,
  resetPassword,
  signIn,
  signInWithRedirect,
  signOut,
  updatePassword,
} from "aws-amplify/auth";

import { configureAmplify } from "@/lib/auth/amplify";
import { Session } from "@/types/auth";

import {
  buildAnonymousSession,
  createSignInResult,
  mapChallengeType,
} from "./amplify-challenge-mapper";
import { resolveFederatedProvider } from "./amplify-provider-mapper";
import { AmplifySessionResolver, SessionResolver } from "./amplify-session-resolver";
import type {
  AuthClient,
  ChangePasswordResult,
  ConfirmSignInWithNewPasswordInput,
  ForgotPasswordResult,
  ResetPasswordResult,
  SignInResult,
} from "./auth-client";

export class AmplifyAuthClient implements AuthClient {
  constructor(private readonly sessionResolver: SessionResolver = new AmplifySessionResolver()) {}

  async initialize(): Promise<void> {
    configureAmplify();
  }

  async getSession(): Promise<Session | null> {
    return this.sessionResolver.resolveSession();
  }

  async refreshSession(): Promise<Session | null> {
    return this.sessionResolver.resolveSession({ forceRefresh: true });
  }

  async signInWithCredentials(input: { email: string; password: string }): Promise<SignInResult> {
    try {
      const result = await signIn({
        username: input.email,
        password: input.password,
      });

      return createSignInResult(result.nextStep?.signInStep, () => this.getSession());
    } catch (error) {
      if (this.isUserAlreadyAuthenticated(error)) {
        await this.signOut({ global: false });
        const retryResult = await signIn({
          username: input.email,
          password: input.password,
        });

        return createSignInResult(retryResult.nextStep?.signInStep, () => this.getSession());
      }

      throw error;
    }
  }

  async confirmSignInWithNewPassword(
    input: ConfirmSignInWithNewPasswordInput
  ): Promise<SignInResult> {
    const result = await confirmSignIn({
      challengeResponse: input.newPassword,
    });

    return createSignInResult(result.nextStep?.signInStep, () => this.getSession());
  }

  async signInWithProvider(input: {
    provider: "Google" | "Apple" | "Microsoft";
    redirectTo?: string;
  }): Promise<void> {
    const provider = resolveFederatedProvider(input.provider);

    await signInWithRedirect({
      provider,
      customState: input.redirectTo,
    });
  }

  async forgotPassword(input: { email: string }): Promise<ForgotPasswordResult> {
    const result = await resetPassword({ username: input.email });
    const delivery = result.nextStep?.codeDeliveryDetails;

    return {
      delivery: {
        destination: delivery?.destination,
        medium: delivery?.deliveryMedium,
      },
    };
  }

  async resetPassword(input: {
    email: string;
    code: string;
    newPassword: string;
  }): Promise<ResetPasswordResult> {
    await confirmResetPassword({
      username: input.email,
      confirmationCode: input.code,
      newPassword: input.newPassword,
    });

    return { done: true };
  }

  async changePassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ChangePasswordResult> {
    await updatePassword({
      oldPassword: input.currentPassword,
      newPassword: input.newPassword,
    });

    return { done: true };
  }

  async signOut(options?: { global?: boolean }): Promise<void> {
    await signOut({ global: Boolean(options?.global) });
  }

  private isUserAlreadyAuthenticated(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name?: string }).name === "UserAlreadyAuthenticatedException"
    );
  }
}

export { buildAnonymousSession, mapChallengeType };
