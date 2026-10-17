"use client";

import {
  AlertCircle,
  Clock,
  FileText,
  GraduationCap,
  LogOut,
  RefreshCw,
  UserX,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { useAuth, usePermission } from "@/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatusMeta {
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  icon: typeof AlertCircle;
}

const statusMeta: Record<string, StatusMeta> = {
  PENDING_FORM: { badgeVariant: "secondary", icon: FileText },
  PENDING_CAPACITATION: { badgeVariant: "secondary", icon: GraduationCap },
  IN_TRAINING: { badgeVariant: "outline", icon: Clock },
  REJECTED: { badgeVariant: "destructive", icon: XCircle },
  INACTIVE: { badgeVariant: "destructive", icon: UserX },
};

const defaultMeta: StatusMeta = {
  badgeVariant: "secondary",
  icon: AlertCircle,
};

const knownStatuses = [
  "PENDING_FORM",
  "PENDING_CAPACITATION",
  "IN_TRAINING",
  "REJECTED",
  "INACTIVE",
];

export default function AccountPendingPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth.accountPending");
  const { signOut } = useAuth();
  const { user, isAdmin, refreshPermissions, isLoading } = usePermission();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // If user becomes active or is admin, redirect to main application
  useEffect(() => {
    if (!isLoading && (isAdmin || user?.status?.code === "ACTIVE")) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [isAdmin, user?.status?.code, isLoading, router, locale]);

  const statusCode = user?.status?.code ?? "PENDING_ACTIVATION";
  const meta = statusMeta[statusCode] ?? defaultMeta;
  const Icon = meta.icon;

  const isKnown = knownStatuses.includes(statusCode);
  const title = isKnown ? t(`statuses.${statusCode}.title`) : t("defaultTitle");
  const description = isKnown ? t(`statuses.${statusCode}.description`) : t("defaultDescription");
  const badgeText = isKnown ? t(`statuses.${statusCode}.badge`) : t("defaultBadge");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshPermissions();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace(`/${locale}/login`);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="bg-muted/40 flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Icon className="h-8 w-8" />
          </div>
          <div className="mb-2 flex justify-center">
            <Badge variant={meta.badgeVariant}>{badgeText}</Badge>
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-muted-foreground mt-2 text-base">
            {description}
          </CardDescription>
        </CardHeader>

        {user && (
          <CardContent className="bg-muted/50 mx-6 mb-6 rounded-lg p-4 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">{t("participant")}:</span>
              <span className="font-medium">{user.fullName}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">{t("email")}:</span>
              <span className="font-medium">{user.email}</span>
            </div>
            {user.tenant?.name && (
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">{t("tenant")}:</span>
                <span className="font-medium">{user.tenant.name}</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">{t("currentStatus")}:</span>
              <span className="font-medium">{user.status?.name || badgeText}</span>
            </div>
          </CardContent>
        )}

        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleSignOut}
            disabled={isSigningOut || isRefreshing}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("signOutButton")}
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={handleRefresh}
            disabled={isRefreshing || isSigningOut}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {t("verifyButton")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
