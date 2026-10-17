"use client";

import { ChevronDown, KeyRound, LogOut, Settings, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { useAuth, usePermission, useSession } from "@/providers";
import { ChangePasswordDialog } from "@/features/auth/components/change-password-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const t = useTranslations("auth.userMenu");
  const locale = useLocale();
  const router = useRouter();
  const { signOut } = useAuth();
  const { session } = useSession();
  const { user: permissionUser, isAdmin } = usePermission();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const user = permissionUser ?? session?.user;
  const roleCode = user?.roles?.[0] || (isAdmin ? "ADMIN" : undefined);
  const roleLabel = roleCode
    ? t.has(`roles.${roleCode}`)
      ? t(`roles.${roleCode}`)
      : roleCode
    : null;
  const displayName =
    user?.preferredName || user?.firstName || user?.fullName?.split(" ")[0] || "Usuario";
  const fullName =
    user?.fullName ||
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    user?.email ||
    "Usuario";
  const email = user?.email || "";
  const avatar = user?.avatar;
  const initials = (displayName?.[0] || email?.[0] || "U").toUpperCase();

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut();
      router.replace(`/${locale}/login`);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="border-border bg-card hover:bg-muted h-10 gap-2.5 rounded-full px-2 pl-1 text-xs shadow-2xs transition-colors"
            aria-label={t("label")}
            disabled={isSigningOut}
          >
            <Avatar className="border-border/60 size-8 border">
              {avatar && <AvatarImage src={avatar} alt={displayName} />}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-foreground hidden max-w-28 truncate text-left font-semibold sm:inline">
              {displayName}
            </span>
            <ChevronDown className="text-muted-foreground mr-1 hidden size-3.5 shrink-0 sm:block" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="shadow-dropdown w-56 p-1.5">
          {/* User Info Header */}
          <div className="bg-muted/40 mb-1 flex items-center gap-3 rounded-lg p-2.5">
            <Avatar className="border-border size-9 border">
              {avatar && <AvatarImage src={avatar} alt={fullName} />}
              <AvatarFallback className="bg-primary text-xs font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="text-foreground truncate text-xs font-bold">{fullName}</span>
              <span className="text-muted-foreground truncate text-[11px]">{email}</span>
              {roleLabel && (
                <Badge
                  variant="default"
                  className="mt-1 w-fit px-1.5 py-0 text-[10px] font-semibold tracking-wide"
                >
                  {roleLabel}
                </Badge>
              )}
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => router.push(`/${locale}/profile`)}
            className="cursor-pointer text-xs font-medium"
          >
            <UserCircle2 className="text-muted-foreground mr-2 size-4" />
            <span>{t("profile")}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setIsChangePasswordOpen(true)}
            className="cursor-pointer text-xs font-medium"
          >
            <KeyRound className="text-muted-foreground mr-2 size-4" />
            <span>{t("changePassword")}</span>
          </DropdownMenuItem>

          <DropdownMenuItem disabled className="cursor-pointer text-xs font-medium">
            <Settings className="text-muted-foreground mr-2 size-4" />
            <span>{t("settings")}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-xs font-semibold"
          >
            <LogOut className="mr-2 size-4" />
            <span>{isSigningOut ? t("signingOut") : t("signOut")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordDialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen} />
    </>
  );
}
