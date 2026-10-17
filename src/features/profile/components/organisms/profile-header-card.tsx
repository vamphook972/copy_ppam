"use client";

import { Building, CheckCircle2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

import type { ProfileTenantDto, ProfileUserDto } from "@/features/auth/dto/profile.dto";
import { Avatar, AvatarFallback } from "@/components/atoms";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderCardProps {
  user: ProfileUserDto;
  tenant: ProfileTenantDto;
}

export function ProfileHeaderCard({ user, tenant }: ProfileHeaderCardProps) {
  const t = useTranslations("profile");

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const isActive = user.status?.code === "ACTIVE";

  return (
    <div className="border-border/80 from-card via-card to-primary/5 relative overflow-hidden rounded-xl border bg-gradient-to-r p-6 shadow-sm">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <Avatar className="border-primary/20 h-20 w-20 border-2 shadow-md">
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-foreground text-xl font-bold tracking-tight">
              {user.firstName} {user.lastName}
            </h2>
            {user.preferredName && (
              <span className="text-muted-foreground text-sm font-medium">
                ({user.preferredName})
              </span>
            )}
            <Badge variant={isActive ? "success" : "secondary"} className="gap-1 px-2.5 py-0.5">
              <CheckCircle2 className="h-3 w-3" />
              <span>{isActive ? t("activeStatus") : t("pendingStatus")}</span>
            </Badge>
          </div>

          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <div className="flex items-center gap-1.5">
              <Mail className="text-muted-foreground/70 h-3.5 w-3.5" />
              <span>{user.email}</span>
            </div>
            {tenant?.name && (
              <div className="flex items-center gap-1.5">
                <Building className="text-muted-foreground/70 h-3.5 w-3.5" />
                <span>{tenant.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
