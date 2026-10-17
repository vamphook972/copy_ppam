import { Suspense, type ReactNode } from "react";

import { Spinner } from "@/components/atoms";

import { AuthBranding } from "./auth-branding";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  function getLoader(): ReactNode {
    return (
      <div className="bg-muted/30 flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <Suspense fallback={getLoader()}>
      <div className="grid h-screen lg:grid-cols-[55%_45%]">
        {/* Columna izquierda - Formulario */}
        <section className="bg-background overflow-y-auto px-6 py-8 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-lg">{children}</div>
        </section>

        {/* Columna derecha - Imagen/Branding */}
        <AuthBranding />
      </div>
    </Suspense>
  );
}
