import { describe, expect, it } from "vitest";

import { resolveFederatedProvider } from "./amplify-provider-mapper";

describe("amplify-provider-mapper", () => {
  it("resolves Google provider correctly", () => {
    expect(resolveFederatedProvider("Google")).toBe("Google");
  });

  it("resolves Apple provider correctly", () => {
    expect(resolveFederatedProvider("Apple")).toBe("Apple");
  });

  it("resolves Microsoft provider to LoginWithMicrosoft custom provider", () => {
    expect(resolveFederatedProvider("Microsoft")).toEqual({
      custom: "LoginWithMicrosoft",
    });
  });

  it("throws for unsupported provider", () => {
    // @ts-expect-error Testing invalid runtime input
    expect(() => resolveFederatedProvider("GitHub")).toThrow(
      "Unsupported federated provider: GitHub"
    );
  });
});
