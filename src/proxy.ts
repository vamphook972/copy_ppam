import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { BYPASS_PREFIXES, PUBLIC_ROUTES } from "./config/routes";
import { routing } from "./i18n/routing";
import { parseSessionCookie, SESSION_COOKIE_NAME } from "./lib/auth";

const intlMiddleware = createIntlMiddleware(routing);

// Construir el patrón de locales dinámicamente desde la configuración de i18n
const localePattern = routing.locales.join("|");

// Construir los patrones de rutas públicas dinámicamente
const publicRoutePattern = PUBLIC_ROUTES.join("|");

// Regex compilado una sola vez al arrancar el servidor
const publicPathRegex = new RegExp(`^/(?:${localePattern})/(?:${publicRoutePattern})(?:/|$)`);
const localeRootRegex = new RegExp(`^/(?:${localePattern})$`);
const localeExtractRegex = new RegExp(`^/(${localePattern})`);

// Regex para detectar si la ruta (con o sin locale) es pública
const publicRoutePatternRegex = new RegExp(`^(?:${publicRoutePattern})(?:/|$)`);

function isPublicRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  if (localeRootRegex.test(pathname)) return true;
  if (publicPathRegex.test(pathname)) return true;

  // Remover el locale al principio del path para revisar si es pública (ej. "/es/about" -> "about", "/about" -> "about")
  const pathWithoutLocale = pathname
    .replace(new RegExp(`^/(?:${localePattern})(?:/|$)`), "")
    .replace(/^\//, "");
  if (publicRoutePatternRegex.test(pathWithoutLocale)) return true;

  return BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si no es una ruta pública, verificar autenticación
  if (!isPublicRoute(pathname)) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = parseSessionCookie(sessionCookie);

    if (!session?.isAuthenticated) {
      const locale = pathname.match(localeExtractRegex)?.[1] ?? routing.defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", `/(es|en)/:path*`, "/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
