"use client";

import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

import { ThemeProvider } from "./theme-provider";

interface GlobalProviderProps {
  children: ReactNode;
}

export function GlobalProvider({ children }: GlobalProviderProps) {
  return (
    <ThemeProvider>
      {children}
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
