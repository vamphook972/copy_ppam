import { env } from "./env";

export const branding = Object.freeze({
  appName: env.NEXT_PUBLIC_APP_NAME,
  version: process.env.NEXT_PUBLIC_APP_VERSION,
  logo: "/branding/light/logo.svg",
  logoLight: "/branding/light/logo.svg",
  logoDark: "/branding/dark/logo.svg",
  logoIconLight: "/branding/light/logo-icon.svg",
  logoIconDark: "/branding/dark/logo-icon.svg",
});

export const appInfo = Object.freeze({
  title: "Sistema Web de Administración",
  description:
    "Sistema de administración para la Predicación Pública en Áreas Metropolitanas (PPAM).",
  copyright: `© ${new Date().getFullYear()} APPAM`,
});
