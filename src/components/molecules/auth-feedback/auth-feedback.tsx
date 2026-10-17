import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { Typography } from "@/components/atoms";
import { cn } from "@/lib/utils";

import type { AuthFeedbackProps } from "./auth-feedback.types";

const toneClasses: Record<AuthFeedbackProps["tone"], string> = {
  success: "border-border bg-muted text-foreground",
  error: "border-destructive/40 bg-destructive/10 text-destructive",
  info: "border-primary/30 bg-primary/10 text-primary",
};

const toneIcon: Record<AuthFeedbackProps["tone"], typeof Info> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function AuthFeedback({ tone, message, className, ...props }: AuthFeedbackProps) {
  const Icon = toneIcon[tone];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <Typography variant="caption" className="text-current">
        {message}
      </Typography>
    </div>
  );
}
