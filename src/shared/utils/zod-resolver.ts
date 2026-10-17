import { toNestErrors } from "@hookform/resolvers";
import type { FieldError, FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod";

/**
 * React Hook Form resolver for Zod 4 schemas, built on `safeParse`.
 * `@hookform/resolvers` 3.x only recognises Zod 3 errors and rethrows Zod 4
 * ones, which left invalid forms unsubmitted without showing any field error.
 */
export const zodSafeParseResolver =
  <TFieldValues extends FieldValues>(schema: z.ZodType<TFieldValues>): Resolver<TFieldValues> =>
  async (values, _context, options) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const fieldErrors: Record<string, FieldError> = {};

    for (const issue of result.error.issues) {
      const path = issue.path.map(String).join(".");
      fieldErrors[path] ??= { type: issue.code, message: issue.message };
    }

    return { values: {}, errors: toNestErrors(fieldErrors as FieldErrors, options) };
  };
