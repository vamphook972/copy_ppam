import {
  confirmResetPassword,
  fetchAuthSession,
  getCurrentUser,
  resetPassword,
  signIn,
  signInWithRedirect,
  signOut,
  updatePassword,
} from "aws-amplify/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { configureAmplify } from "@/lib/auth/amplify";
import { AmplifyAuthClient, mapChallengeType } from "@/lib/auth/amplify-client";

vi.mock("@/lib/auth/amplify", () => ({
  configureAmplify: vi.fn(),
}));

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn(),
  getCurrentUser: vi.fn(),
  signIn: vi.fn(),
  signInWithRedirect: vi.fn(),
  resetPassword: vi.fn(),
  confirmResetPassword: vi.fn(),
  updatePassword: vi.fn(),
  signOut: vi.fn(),
}));

const mockConfigureAmplify = vi.mocked(configureAmplify);
const mockFetchAuthSession = vi.mocked(fetchAuthSession);
const mockGetCurrentUser = vi.mocked(getCurrentUser);
const mockSignIn = vi.mocked(signIn);
const mockSignInWithRedirect = vi.mocked(signInWithRedirect);
const mockSignOut = vi.mocked(signOut);
const mockResetPassword = vi.mocked(resetPassword);
const mockConfirmResetPassword = vi.mocked(confirmResetPassword);
const mockUpdatePassword = vi.mocked(updatePassword);

describe("mapChallengeType", () => {
  it("maps known Cognito steps", () => {
    expect(mapChallengeType("CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED")).toBe(
      "NEW_PASSWORD_REQUIRED"
    );
    expect(mapChallengeType("CONFIRM_SIGN_IN_WITH_SMS_CODE")).toBe("SMS_MFA");
    expect(mapChallengeType("CONFIRM_SIGN_IN_WITH_TOTP_CODE")).toBe("SOFTWARE_TOKEN_MFA");
    expect(mapChallengeType("CONTINUE_SIGN_IN_WITH_MFA_SETUP_SELECTION")).toBe("MFA_SETUP");
    expect(mapChallengeType("DONE")).toBe("NONE");
  });

  it("maps unknown step to UNKNOWN", () => {
    expect(mapChallengeType("SOMETHING_ELSE")).toBe("UNKNOWN");
  });
});

describe("AmplifyAuthClient", () => {
  const client = new AmplifyAuthClient();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchAuthSession.mockReset();
    mockGetCurrentUser.mockReset();
  });

  it("initialize configures amplify", async () => {
    await client.initialize();
    expect(mockConfigureAmplify).toHaveBeenCalledTimes(1);
  });

  it("returns null session when amplify session is unavailable", async () => {
    mockFetchAuthSession.mockResolvedValueOnce({ tokens: undefined } as never);
    mockGetCurrentUser.mockRejectedValueOnce(new Error("no-user"));

    const session = await client.getSession();

    expect(session).toBeNull();
  });

  it("returns mapped authenticated session", async () => {
    mockFetchAuthSession.mockResolvedValueOnce({
      tokens: {
        accessToken: {
          toString: () => "access-token",
          payload: { exp: 12345 },
        },
        idToken: {
          toString: () => "id-token",
          payload: { exp: 12345 },
        },
      },
    } as never);

    mockGetCurrentUser.mockResolvedValueOnce({
      userId: "user-1",
      username: "john.doe@example.com",
      signInDetails: { loginId: "John Doe" },
    } as never);

    const session = await client.getSession();

    expect(session).not.toBeNull();
    expect(session?.isAuthenticated).toBe(true);
    expect(session?.user?.id).toBe("user-1");
    expect(session?.tokens?.accessToken).toBe("access-token");
    expect(session?.tokens?.idToken).toBe("id-token");
  });

  it("signInWithCredentials returns challenge when required", async () => {
    mockSignIn.mockResolvedValueOnce({
      isSignedIn: false,
      nextStep: {
        signInStep: "CONFIRM_SIGN_IN_WITH_SMS_CODE",
      },
    } as never);

    const result = await client.signInWithCredentials({
      email: "test@example.com",
      password: "secret",
    });

    expect(result.session).toBeNull();
    expect(result.nextStep?.challenge).toBe("SMS_MFA");
  });

  it("signInWithCredentials maps unknown challenge", async () => {
    mockSignIn.mockResolvedValueOnce({
      isSignedIn: false,
      nextStep: {
        signInStep: "CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE",
      },
    } as never);

    const result = await client.signInWithCredentials({
      email: "test@example.com",
      password: "secret",
    });

    expect(result.session).toBeNull();
    expect(result.nextStep?.challenge).toBe("UNKNOWN");
    expect(result.nextStep?.message).toContain("Unsupported sign-in step");
  });

  it("signInWithCredentials returns session when done", async () => {
    mockSignIn.mockResolvedValueOnce({
      isSignedIn: true,
      nextStep: {
        signInStep: "DONE",
      },
    } as never);

    mockFetchAuthSession.mockResolvedValueOnce({
      tokens: {
        accessToken: {
          toString: () => "access-token",
          payload: { exp: 54321 },
        },
        idToken: {
          toString: () => "id-token",
          payload: { exp: 54321 },
        },
      },
    } as never);

    mockGetCurrentUser.mockResolvedValueOnce({
      userId: "user-2",
      username: "jane.doe@example.com",
      signInDetails: { loginId: "Jane Doe" },
    } as never);

    const result = await client.signInWithCredentials({
      email: "jane.doe@example.com",
      password: "secret",
    });

    expect(result.nextStep?.challenge).toBe("NONE");
    expect(result.session?.isAuthenticated).toBe(true);
    expect(result.session?.user?.fullName).toBe("Jane Doe");
  });

  it("signs out and retries signIn when UserAlreadyAuthenticatedException occurs", async () => {
    const error = new Error("User is already authenticated");
    error.name = "UserAlreadyAuthenticatedException";

    mockSignIn.mockRejectedValueOnce(error).mockResolvedValueOnce({
      isSignedIn: true,
      nextStep: { signInStep: "DONE" },
    } as never);

    mockFetchAuthSession.mockResolvedValueOnce({
      tokens: {
        accessToken: { toString: () => "new-access-token", payload: { exp: 54321 } },
        idToken: { toString: () => "new-id-token", payload: { exp: 54321 } },
      },
    } as never);

    mockGetCurrentUser.mockResolvedValueOnce({
      userId: "new-user-id",
      username: "new.user@example.com",
      signInDetails: { loginId: "New User" },
    } as never);

    const result = await client.signInWithCredentials({
      email: "new.user@example.com",
      password: "new-password",
    });

    expect(mockSignOut).toHaveBeenCalledWith({ global: false });
    expect(mockSignIn).toHaveBeenCalledTimes(2);
    expect(mockSignIn).toHaveBeenLastCalledWith({
      username: "new.user@example.com",
      password: "new-password",
    });
    expect(result.session?.isAuthenticated).toBe(true);
    expect(result.session?.user?.email).toBe("new.user@example.com");
  });

  it("starts federated sign in with redirect for Google", async () => {
    await client.signInWithProvider({
      provider: "Google",
      redirectTo: "/dashboard",
    });

    expect(mockSignInWithRedirect).toHaveBeenCalledWith({
      provider: "Google",
      customState: "/dashboard",
    });
  });

  it("starts federated sign in with redirect for Apple", async () => {
    await client.signInWithProvider({
      provider: "Apple",
      redirectTo: "/dashboard",
    });

    expect(mockSignInWithRedirect).toHaveBeenCalledWith({
      provider: "Apple",
      customState: "/dashboard",
    });
  });

  it("starts federated sign in with redirect for Microsoft", async () => {
    await client.signInWithProvider({
      provider: "Microsoft",
      redirectTo: "/dashboard",
    });

    expect(mockSignInWithRedirect).toHaveBeenCalledWith({
      provider: { custom: "LoginWithMicrosoft" },
      customState: "/dashboard",
    });
  });

  it("forgotPassword returns delivery info", async () => {
    mockResetPassword.mockResolvedValueOnce({
      nextStep: {
        resetPasswordStep: "CONFIRM_RESET_PASSWORD_WITH_CODE",
        codeDeliveryDetails: {
          destination: "***@mail.com",
          deliveryMedium: "EMAIL",
        },
      },
    } as never);

    const result = await client.forgotPassword({ email: "test@example.com" });

    expect(result.delivery?.destination).toBe("***@mail.com");
    expect(result.delivery?.medium).toBe("EMAIL");
  });

  it("resetPassword confirms reset", async () => {
    const result = await client.resetPassword({
      email: "test@example.com",
      code: "123456",
      newPassword: "NewSecret123!",
    });

    expect(mockConfirmResetPassword).toHaveBeenCalledWith({
      username: "test@example.com",
      confirmationCode: "123456",
      newPassword: "NewSecret123!",
    });
    expect(result.done).toBe(true);
  });

  it("changePassword updates password", async () => {
    const result = await client.changePassword({
      currentPassword: "Old123!",
      newPassword: "New123!",
    });

    expect(mockUpdatePassword).toHaveBeenCalledWith({
      oldPassword: "Old123!",
      newPassword: "New123!",
    });
    expect(result.done).toBe(true);
  });

  it("signOut supports global flag", async () => {
    await client.signOut({ global: true });
    expect(mockSignOut).toHaveBeenCalledWith({ global: true });
  });

  it("refreshSession delegates to session fetch", async () => {
    mockFetchAuthSession.mockImplementationOnce((options) => {
      if (options?.forceRefresh) {
        return Promise.resolve({
          tokens: {
            accessToken: {
              toString: () => "access-token",
              payload: { exp: 123 },
            },
            idToken: {
              toString: () => "id-token",
              payload: { exp: 123 },
            },
          },
        } as never);
      }
      return Promise.resolve({ tokens: undefined } as never);
    });

    mockGetCurrentUser.mockResolvedValueOnce({
      userId: "user-3",
      username: "refresh@example.com",
      signInDetails: { loginId: "Refresh User" },
    } as never);

    const session = await client.refreshSession();

    expect(session?.isAuthenticated).toBe(true);
    expect(session?.user?.email).toBe("refresh@example.com");
  });
});
