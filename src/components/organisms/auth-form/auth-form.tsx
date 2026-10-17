import { Typography } from "@/components/atoms";
import { LoadingCard } from "@/components/molecules";
import { cn } from "@/lib/utils";

import type { AuthFormProps } from "./auth-form.types";

export function AuthForm({
  title,
  description,
  fields,
  submitAction,
  secondaryAction,
  footer,
  isLoading = false,
  className,
}: AuthFormProps) {
  return (
    <section
      className={cn("bg-card text-card-foreground grid gap-6 rounded-lg border p-6", className)}
    >
      <header className="grid gap-1">
        <Typography variant="h1" className="text-xl">
          {title}
        </Typography>
        {description ? (
          <Typography variant="body" className="text-muted-foreground">
            {description}
          </Typography>
        ) : null}
      </header>

      {isLoading ? <LoadingCard /> : null}

      <div className="grid gap-4">{fields}</div>

      <div className="grid gap-2">
        {submitAction}
        {secondaryAction}
      </div>

      {footer ? <footer className="text-muted-foreground text-sm">{footer}</footer> : null}
    </section>
  );
}
