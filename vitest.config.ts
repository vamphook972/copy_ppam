import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    // next-intl ships ESM with extensionless deep imports; inlining lets the
    // alias below resolve them.
    server: { deps: { inline: ["next-intl"] } },
    // Client config is validated at import time, so component tests need placeholders.
    env: {
      NEXT_PUBLIC_API_URL: "http://localhost/api",
      NEXT_PUBLIC_AWS_REGION: "us-east-1",
      NEXT_PUBLIC_USER_POOL_ID: "us-east-1_test",
      NEXT_PUBLIC_USER_POOL_CLIENT_ID: "test-client",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Next 16 ships no "exports" map, so extensionless deep imports
      // used by next-intl do not resolve under Vitest.
      "next/navigation": "next/navigation.js",
    },
  },
});
