import { Suspense } from "react";

import { RegisterPageContent } from "@/features/register";
import { Spinner } from "@/components/atoms";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 w-full items-center justify-center">
          <Spinner className="size-8" />
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
