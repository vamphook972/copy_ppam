import type esMessages from "@/i18n/messages/es";

type Messages = typeof esMessages;

declare global {
  // Use type safe message keys with next-intl
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends Messages {}
}
