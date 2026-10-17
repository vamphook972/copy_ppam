import { defaultLocale, locales } from "@/i18n";

import { env } from "./env";

export const appConfig = Object.freeze({
  name: env.NEXT_PUBLIC_APP_NAME,
  supportedLocales: locales,
  defaultLocale: defaultLocale,
});
