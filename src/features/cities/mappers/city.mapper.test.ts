import { describe, expect, it } from "vitest";

import { mapCityDtoToCity } from "./city.mapper";

describe("mapCityDtoToCity", () => {
  it("maps api payload fields into the domain model", () => {
    const result = mapCityDtoToCity({
      id: "city-1",
      name: "Bogotá",
      status: "ACTIVE",
      postalCode: "110111",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    });

    expect(result).toEqual({
      id: "city-1",
      name: "Bogotá",
      status: "ACTIVE",
      postalCode: "110111",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    });
  });
});
