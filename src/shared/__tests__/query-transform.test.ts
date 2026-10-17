import { describe, expect, it } from "vitest";

import { transformQueryParams } from "../utils/query-transform";

describe("transformQueryParams", () => {
  it("transforms flat filters to filter[...] and preserves flat legacy params", () => {
    const input = {
      cityId: "49834e14-4150-4121-adb0-f471f07bd452",
      status: "ACTIVE",
    };

    const output = transformQueryParams(input);

    expect(output).toEqual({
      cityId: "49834e14-4150-4121-adb0-f471f07bd452",
      "filter[cityId]": "49834e14-4150-4121-adb0-f471f07bd452",
      status: "ACTIVE",
      "filter[status]": "ACTIVE",
    });
  });

  it("transforms pagination to page[...] and preserves flat page parameters", () => {
    const input = {
      page: 1,
      pageSize: 200,
    };

    const output = transformQueryParams(input);

    expect(output).toEqual({
      page: 1,
      "page[number]": 1,
      pageSize: 200,
      "page[size]": 200,
    });
  });

  it("preserves already formatted filter[...], page[...], include, and sort", () => {
    const input = {
      "filter[cityId]": "123",
      "page[number]": 2,
      include: "city,zone",
      sort: "-createdAt",
    };

    const output = transformQueryParams(input);

    expect(output).toEqual(input);
  });
});
