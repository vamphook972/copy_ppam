import { Suspense } from "react";

import { ActivatePageContent } from "@/features/auth";
import { Spinner } from "@/components/atoms";

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 w-full items-center justify-center">
          <Spinner className="size-8" />
        </div>
      }
    >
      <ActivatePageContent />
    </Suspense>
  );
}
