import { describe, expect, it } from "vitest";

import { limitDigits } from "../utils/limit-digits";

describe("limitDigits", () => {
  it("keeps values that already fit", () => {
    expect(limitDigits("40", 3)).toBe("40");
    expect(limitDigits("365", 3)).toBe("365");
  });

  it("cuts anything past the allowed digits", () => {
    expect(limitDigits("12345", 3)).toBe("123");
  });

  it("drops letters, signs and decimal points", () => {
    expect(limitDigits("-1e5", 3)).toBe("15");
    expect(limitDigits("4.5", 3)).toBe("45");
    expect(limitDigits("1a8b0", 3)).toBe("180");
  });

  it("returns an empty string when there are no digits", () => {
    expect(limitDigits("abc", 3)).toBe("");
    expect(limitDigits("", 3)).toBe("");
  });
});
