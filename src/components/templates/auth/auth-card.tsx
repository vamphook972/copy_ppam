import { ReactNode } from "react";

import { AuthFooter } from "./auth-footer";
import { AuthHeader } from "./auth-header";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="bg-card border-border w-full rounded-lg border p-8 shadow-sm">
      <AuthHeader title={title} description={description} />

      {children}
      <AuthFooter />
    </div>
  );
}
