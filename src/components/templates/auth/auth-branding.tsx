import { Building2, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

export function AuthBranding() {
  const t = useTranslations("main");

  const features = [
    {
      icon: Building2,
      title: t("features.management.title"),
      description: t("features.management.description"),
    },
    {
      icon: Lock,
      title: t("features.security.title"),
      description: t("features.security.description"),
    },
  ];

  return (
    <aside className="bg-primary/5 hidden items-center justify-center border-l lg:flex">
      <div className="max-w-md space-y-6 px-6 text-center">
        <header className="space-y-3">
          <h2 className="text-4xl font-bold text-balance">{t("brand")}</h2>

          <p className="text-muted-foreground text-lg text-balance">{t("brandDescription")}</p>
        </header>

        <div className="space-y-4 pt-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-background/60 flex items-start gap-4 rounded-lg border p-4 text-left"
            >
              <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Icon className="text-primary h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="text-muted-foreground text-sm">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
