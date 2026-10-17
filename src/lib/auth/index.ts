import { AmplifyAuthClient } from "@/lib/auth/amplify-client";

export const authClient = new AmplifyAuthClient();

export * from "./auth-client";
export * from "./session-cookie";
