export const PUBLIC_ROUTES = [
  "login",
  "forgot-password",
  "reset-password",
  "change-password",
  "auth",
  "about",
  "contact",
  "privacy-policy",
  "terms-of-service",
  "support",
  "register",
  "activate",
] as const;

export const BYPASS_PREFIXES = ["/api/", "/_next/", "/_vercel/", "/trpc/"] as const;
