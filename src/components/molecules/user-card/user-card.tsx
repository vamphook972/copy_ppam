import { Avatar, AvatarFallback, Button, Typography } from "@/components/atoms";
import { StatusBadge } from "@/components/molecules/status-badge";
import { cn } from "@/lib/utils";

import type { UserCardProps } from "./user-card.types";

function getInitials(name: string, fallback?: string) {
  if (fallback) {
    return fallback;
  }

  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 0) {
    return "US";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function UserCard({
  id,
  name,
  email,
  statusLabel,
  statusTone = "secondary",
  initials,
  description,
  actions = [],
}: UserCardProps) {
  return (
    <article
      aria-labelledby={`user-card-name-${id}`}
      className={cn("bg-card border-border grid gap-4 rounded-lg border p-4 shadow-xs")}
    >
      <div className="flex items-start gap-3">
        <Avatar className="size-10">
          <AvatarFallback>{getInitials(name, initials)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <Typography id={`user-card-name-${id}`} as="h2" variant="h2" className="truncate">
            {name}
          </Typography>
          <Typography variant="body" className="text-muted-foreground truncate">
            {email}
          </Typography>
          {description ? (
            <Typography variant="caption" className="text-muted-foreground">
              {description}
            </Typography>
          ) : null}
        </div>

        <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
      </div>

      {actions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={action.onClick}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </article>
  );
}
