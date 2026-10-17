/**
 * Utility to convert flat parameters into JSON:API compliant query parameters.
 * - Filters: `filter[key]=value` or `filter[key][operator]=value`
 * - Pagination: `page[number]` & `page[size]`
 * - Preserves standard JSON:API params (`include`, `sort`, `fields`, `search`) and already formatted `filter[...]` / `page[...]` keys.
 */
export function transformQueryParams(
  params: Record<string, unknown> = {}
): Record<string, unknown> {
  const transformed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    // Already JSON:API grouped format or top-level standard JSON:API keywords
    if (
      key.startsWith("filter[") ||
      key.startsWith("page[") ||
      key.startsWith("fields[") ||
      key === "include" ||
      key === "sort" ||
      key === "search" ||
      key === "fields"
    ) {
      transformed[key] = value;
      continue;
    }

    // Pagination flat keys -> JSON:API page[...]
    if (key === "page") {
      transformed["page[number]"] = value;
      // Also retain flat key for legacy parameters support until backend migration completes
      transformed["page"] = value;
      continue;
    }

    if (key === "pageSize") {
      transformed["page[size]"] = value;
      // Also retain flat key for legacy parameters support until backend migration completes
      transformed["pageSize"] = value;
      continue;
    }

    // Filter flat keys -> JSON:API filter[...]
    // e.g. cityId: "123" -> "filter[cityId]": "123"
    // Also retain flat key for legacy parameters support until backend migration completes
    transformed[`filter[${key}]`] = value;
    transformed[key] = value;
  }

  return transformed;
}
