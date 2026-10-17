"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useUrlState<T extends Record<string, unknown>>(
  defaults: T
): {
  state: T;
  update: (updates: Partial<T>) => void;
  reset: () => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(() => {
    const current: Record<string, unknown> = { ...defaults };

    Object.keys(defaults).forEach((key) => {
      const paramVal = searchParams.get(key);
      if (paramVal !== null) {
        const defaultType = typeof defaults[key];
        if (defaultType === "number") {
          const parsed = Number(paramVal);
          current[key] = isNaN(parsed) ? defaults[key] : parsed;
        } else {
          current[key] = paramVal;
        }
      }
    });

    return current as T;
  }, [searchParams, defaults]);

  const update = useCallback(
    (updates: Partial<T>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === null) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const reset = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  return { state, update, reset };
}
