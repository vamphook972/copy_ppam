"use client";

import { useTranslations } from "next-intl";

import { buttonVariants } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { BrandLogo } from "@/components/atoms";

export function PublicHeader() {
  const tNav = useTranslations("navigation");
  const tAuth = useTranslations("auth");
  const pathname = usePathname();

  if (pathname === "/register" || pathname?.startsWith("/register")) {
    return null;
  }

  return (
    <header className="border-border/60 bg-background/95 sticky top-0 z-40 w-full border-b backdrop-blur-xs">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo variant="full" theme="auto" width={130} height={36} priority />
        </Link>

        {/* Navigation links */}
        <nav className="hidden items-center gap-6 md:flex" aria-label={tNav("main")}>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            {tNav("home")}
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            {tNav("about")}
          </Link>
          <Link
            href="/contact"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            {tNav("contact")}
          </Link>
          <Link
            href="/support"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            {tNav("support")}
          </Link>
        </nav>

        {/* CTA Login Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            {tAuth("login.loginButton")}
          </Link>
        </div>
      </div>
    </header>
  );
}
