import type { SignInWithRedirectInput } from "aws-amplify/auth";

import { FederatedProvider } from "@/config/auth.config";

export type AmplifyRedirectProvider = NonNullable<SignInWithRedirectInput["provider"]>;

const FEDERATED_PROVIDER_MAP: Record<FederatedProvider, AmplifyRedirectProvider> = {
  Google: "Google",
  Apple: "Apple",
  Microsoft: { custom: "LoginWithMicrosoft" },
};

export const resolveFederatedProvider = (provider: FederatedProvider): AmplifyRedirectProvider => {
  const resolved = FEDERATED_PROVIDER_MAP[provider];
  if (!resolved) {
    throw new Error(`Unsupported federated provider: ${provider}`);
  }
  return resolved;
};
