import { createCrudModule } from "@/shared/factories/create-crud-module";

import { mapTurnDtoToTurn } from "./mappers/turn.mapper";
import type { Turn, TurnDto, TurnFormValues, TurnsQueryParams } from "./types/turn";

export const turnsModule = createCrudModule<Turn, TurnDto, TurnFormValues, TurnsQueryParams>({
  entity: "turns",
  basePath: "/turns",
  translationNamespace: "turns",

  permissions: {
    read: "turn:read",
    create: "turn:create",
    update: "turn:update",
    delete: "turn:delete",
  },

  api: {
    endpoint: "/v1/turns",
    mapDtoToEntity: mapTurnDtoToTurn,
  },

  table: {
    columns: [],
  },
});
