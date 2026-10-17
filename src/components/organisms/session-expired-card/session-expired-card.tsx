import { Button } from "@base-ui/react/button";
import { useTranslations } from "next-intl";

import { Typography } from "@/components/atoms";

interface Props {
  action: () => Promise<void>;
}

export function SessionExpiredCard({ action }: Props) {
  const t = useTranslations("auth.expiredSession");

  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <form
        action={action}
        className="flex flex-col items-center space-y-4 rounded-lg border border-gray-100 bg-white p-8 shadow-sm"
      >
        <Typography variant="h2" className="text-xl font-semibold text-gray-800">
          {t("title")}
        </Typography>

        <p className="text-sm text-gray-600">{t("description")}</p>

        <Button type="submit">{t("backToLogin")}</Button>
      </form>
    </div>
  );
}
