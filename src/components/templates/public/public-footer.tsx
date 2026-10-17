"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function PublicFooter() {
  const tNav = useTranslations("navigation");
  const year = new Date().getFullYear();

  return (
    <footer className="border-border/60 bg-card border-t py-8 text-xs text-muted-foreground">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row md:px-6">
        <div>
          <p>© {year} APPAM - Predicación Pública en Áreas Metropolitanas.</p>
        </div>

        <nav className="flex items-center gap-6" aria-label={tNav("breadcrumb")}>
          <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
            {tNav("footer.privacyPolicy")}
          </Link>
          <Link href="/terms-of-service" className="hover:text-foreground transition-colors">
            {tNav("footer.termsOfService")}
          </Link>
          <Link href="/support" className="hover:text-foreground transition-colors">
            {tNav("footer.support")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
