import type { ReactNode } from "react";

import { PageContainer } from "./page-container";

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="bg-muted/20 min-h-0 flex-1 overflow-y-auto">
      <PageContainer>{children}</PageContainer>
    </main>
  );
}
