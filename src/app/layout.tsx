import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { GlobalProvider } from "@/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "APPAM - Predicación Pública en Áreas Metropolitanas",
    template: "%s | APPAM",
  },
  description: "Sistema de administración para la Predicación Pública en Áreas Metropolitanas",
  applicationName: "APPAM",
  generator: "appam.co",
  authors: [{ name: "APPAM Team", url: "https://appam.co" }],
  keywords: ["APPAM", "Predicación Pública", "Áreas Metropolitanas", "Administración"],
  icons: {
    icon: [
      {
        url: "/favicons/web-app-manifest-192x192.png",
        media: "(prefers-color-scheme: light)",
        sizes: "192x192",
        type: "image/png",
      },
      { url: "/favicons/icon0.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/favicons/manifest.json", type: "application/manifest+json" },
    ],
  },
  creator: "APPAM Team",
  publisher: "APPAM Team",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <GlobalProvider>{children}</GlobalProvider>
      </body>
    </html>
  );
}
