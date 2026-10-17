import { LoadingCard } from "@/components/molecules/loading-card";

import type { LoadingStateProps } from "./loading-state.types";

export function LoadingState({ title, description, className }: LoadingStateProps) {
  return <LoadingCard title={title} description={description} className={className} />;
}
