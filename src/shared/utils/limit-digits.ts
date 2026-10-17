/**
 * Keeps only the digits of `value`, up to `maxDigits` of them.
 * Numeric text inputs need it because the browser enforces `maxLength`
 * but still lets letters, signs and decimal points through.
 */
export const limitDigits = (value: string, maxDigits: number): string =>
  value.replace(/\D/g, "").slice(0, maxDigits);
