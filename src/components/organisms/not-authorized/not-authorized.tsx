import { useTranslations } from "next-intl";

import { Icons } from "@/config/icons.config";
import { Button, Icon, Typography } from "@/components/atoms";
import { Link } from "@/i18n/navigation";

export function NotAuthorized() {
  const t = useTranslations("auth.notAuthorized");

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="bg-destructive/10 text-destructive flex h-20 w-20 items-center justify-center rounded-full">
        <Icon icon={Icons.shield} className="h-10 w-10" />
      </div>
      <div className="flex flex-col gap-2">
        <Typography variant="h2">{t("title")}</Typography>
        <Typography variant="body" className="text-muted-foreground max-w-sm">
          {t("description")}
        </Typography>
      </div>
      <Link href="/home">
        <Button size="lg" className="mt-4">
          <Icon icon={Icons["arrow-left"]} />
          {t("backLabel")}
        </Button>
      </Link>
    </div>
  );
}
