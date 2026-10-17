import type { ResolverOptions } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { zodSafeParseResolver } from "../utils/zod-resolver";

const schema = z.object({
  general: z.object({
    goal: z.number().int().min(10).max(100),
  }),
  label: z.string().default("fallback"),
});

type Values = z.infer<typeof schema>;

const options = {
  fields: {},
  shouldUseNativeValidation: false,
} as ResolverOptions<Values>;

describe("zodSafeParseResolver", () => {
  it("returns the parsed values, defaults included, when the schema passes", async () => {
    const result = await zodSafeParseResolver(schema)(
      { general: { goal: 40 } } as Values,
      undefined,
      options
    );

    expect(result).toEqual({ values: { general: { goal: 40 }, label: "fallback" }, errors: {} });
  });

  it("reports nested field errors instead of throwing", async () => {
    const result = await zodSafeParseResolver(schema)(
      { general: { goal: 5 }, label: "x" },
      undefined,
      options
    );

    expect(result.values).toEqual({});
    expect(result.errors).toMatchObject({ general: { goal: { type: "too_small" } } });
  });

  it("reports a value that is not a number", async () => {
    const result = await zodSafeParseResolver(schema)(
      { general: { goal: Number.NaN }, label: "x" },
      undefined,
      options
    );

    expect(result.errors).toMatchObject({ general: { goal: { type: "invalid_type" } } });
  });
});
