import { env } from "./env";

export const federatedProviders = ["Google", "Apple", "Microsoft"] as const;

export type FederatedProvider = (typeof federatedProviders)[number];

const defaultRedirectSignIn = [
  "http://localhost:3000/auth/callback",
  "https://dev.appam.co/auth/callback",
];

const defaultRedirectSignOut = ["http://localhost:3000/logout", "https://dev.appam.co/logout"];

export const authConfig = Object.freeze({
  region: env.NEXT_PUBLIC_AWS_REGION,
  userPoolId: env.NEXT_PUBLIC_USER_POOL_ID,
  clientId: env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
  cognitoDomain: env.NEXT_PUBLIC_COGNITO_DOMAIN,
  redirectSignIn: env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN
    ? Array.from(new Set([env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN, ...defaultRedirectSignIn]))
    : defaultRedirectSignIn,
  redirectSignOut: env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT
    ? Array.from(new Set([env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT, ...defaultRedirectSignOut]))
    : defaultRedirectSignOut,
  isDevelopment: process.env.NODE_ENV === "development",
  federatedProviders,
});
