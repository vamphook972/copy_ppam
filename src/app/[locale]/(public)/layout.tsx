import type { ReactNode } from "react";

import { PublicLayout } from "@/components/templates/public/public-layout";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return <PublicLayout>{children}</PublicLayout>;
}
