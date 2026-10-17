import { Button } from "@/components/atoms";
import { AlertCard } from "@/components/molecules/alert-card";

import type { ErrorStateProps } from "./error-state.types";

export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
  actions,
  className,
}: ErrorStateProps) {
  const retryAction =
    onRetry && retryLabel ? (
      <Button type="button" variant="secondary" onClick={onRetry}>
        {retryLabel}
      </Button>
    ) : null;

  return (
    <AlertCard
      title={title}
      description={description}
      tone="error"
      className={className}
      actions={
        actions || retryAction ? (
          <div className="flex flex-wrap items-center gap-2">
            {retryAction}
            {actions}
          </div>
        ) : undefined
      }
    />
  );
}
