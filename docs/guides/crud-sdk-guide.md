# Guía Completa: CRUD SDK de APPAM

## APPAM - Sistema Web de Administración

Versión: **2.0**

Última actualización: **2026-07-27**

---

# Objetivo

El **CRUD SDK** de APPAM es un sistema declarativo que permite crear módulos funcionales completos (listado, creación, edición, detalle) con el mínimo código posible, garantizando consistencia y eliminando boilerplate repetitivo.

Con el SDK, construir un nuevo módulo se reduce a:

1. Definir los tipos (DTO, Domain Model, FormValues, QueryParams).
2. Crear el mapper (DTO → Domain Model).
3. Definir el Zod schema.
4. Configurar el módulo con `createCrudModule`.
5. Crear las páginas del App Router (2–4 archivos mínimos).

---

# Componentes del SDK

El SDK vive en `src/shared/factories/` y se compone de tres factories:

| Factory            | Archivo                 | Responsabilidad                                                 |
| ------------------ | ----------------------- | --------------------------------------------------------------- |
| `createCrudApi`    | `create-crud-api.ts`    | Genera los métodos HTTP (list, getById, create, update, remove) |
| `createCrudHooks`  | `create-crud-hooks.ts`  | Genera los hooks de TanStack Query                              |
| `createCrudModule` | `create-crud-module.ts` | Orquesta el módulo completo                                     |

Los templates genéricos viven en `src/components/templates/crud/`:

| Template           | Descripción                                                |
| ------------------ | ---------------------------------------------------------- |
| `EntityListPage`   | Página de listado con tabla, filtros, paginación, acciones |
| `EntityFormPage`   | Página de creación/edición con formulario declarativo      |
| `EntityDetailPage` | Página de detalle con secciones configurables              |

---

# Opción A: Usar el Script Generador (Recomendado)

El proyecto incluye un script CLI que genera automáticamente todos los archivos necesarios para un nuevo módulo SDK.

## Uso

```bash
# Desde la raíz del proyecto
node scripts/create-module.js <module-name> [PluralTitle]
```

### Ejemplos

```bash
# Genera el módulo "territories" con título "Territories"
node scripts/create-module.js territories Territories

# El título se puede omitir; se deriva automáticamente del nombre
node scripts/create-module.js territories
```

## Qué genera el script

El script crea **12 archivos** con la estructura completa del módulo:

```text
src/features/territories/
├── types/territory.ts                  ← DTO, Domain, FormValues, QueryParams
├── schemas/territory-form.schema.ts    ← Zod schema
├── mappers/territory.mapper.ts         ← DTO → Domain mapper
├── territories.module.ts               ← createCrudModule (configuración)
├── territories.client.ts               ← Re-exportaciones "use client"
└── index.ts                            ← Barrel file

src/app/[locale]/(app)/(dashboard)/territories/
├── page.tsx                            ← Listado
├── new/page.tsx                        ← Creación
└── [id]/
    ├── page.tsx                        ← Detalle
    └── edit/page.tsx                   ← Edición

src/i18n/messages/es/territories.json  ← i18n en español (template)
src/i18n/messages/en/territories.json  ← i18n en inglés (template)
```

## Pasos después de ejecutar el script

El script genera una base funcional lista para personalizar. Una vez ejecutado:

1. **Personalizar el módulo** en `src/features/{module}/{module}.module.ts`:
   - Ajustar columnas de la tabla (`table.columns`)
   - Ajustar campos del formulario (`form.fields`)
   - Ajustar filtros (`filters`)
   - Agregar secciones de detalle (`detail.sections`)
   - Agregar campos al DTO y Domain Model si son necesarios

2. **Registrar permisos** en `src/config/permissions.ts`.

3. **Registrar el namespace i18n** en los archivos índice:

   ```ts
   // src/i18n/messages/es/index.ts
   import territories from "./territories.json";

   export default { ...existing, territories };
   ```

4. **Traducir y completar** los archivos i18n generados con los textos reales del módulo.

5. **Extender el Zod schema** si el módulo requiere campos adicionales.

> ℹ️ El script es idempotente: si un archivo ya existe, lo omite con un aviso `⚠️ Skipped`. Es seguro ejecutarlo múltiples veces.

---

# Opción B: Creación Manual (Paso a Paso)

A continuación se describe el flujo completo para migrar o crear un módulo usando el SDK.

## Paso 1: Crear los Tipos

Ubicación: `src/features/{feature}/types/{entity}.ts`

```ts
import { z } from "zod";

import type { BaseEntity, BaseQueryParams, ListResponse } from "@/shared/types/crud-module.types";

import { entityFormSchema } from "../schemas/entity-form.schema";

// Status
export type EntityStatus = "ACTIVE" | "INACTIVE";

// FormValues (derivado del schema Zod)
export type EntityFormValues = z.infer<typeof entityFormSchema>;

// DTO (contrato del backend)
export interface EntityDto {
  id: string;
  name: string;
  status: EntityStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Domain Model
export interface Entity extends BaseEntity {
  id: string;
  name: string;
  status: EntityStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Query Params (filtros de listado)
export interface EntityQueryParams extends BaseQueryParams {
  search?: string;
  status?: EntityStatus;
}

// Tipo de listado
export type EntityListResponse = ListResponse<Entity>;
```

> **Regla:** `EntityFormValues` siempre se infiere del Zod schema, no se define manualmente.

---

## Paso 2: Crear el Zod Schema

Ubicación: `src/features/{feature}/schemas/{entity}-form.schema.ts`

```ts
import { z } from "zod";

export const entityFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
```

> **Validación:** El SDK usa `safeParse` (no `zodResolver`) para interceptar errores de Zod y convertirlos a mensajes del namespace `validation` de next-intl. No uses `zodResolver` en ningún módulo SDK.

---

## Paso 3: Crear el Mapper

Ubicación: `src/features/{feature}/mappers/{entity}.mapper.ts`

```ts
import type { Entity, EntityDto } from "../types/entity";

export function mapEntityDtoToEntity(dto: EntityDto): Entity {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
```

> **Regla:** El mapper es la única función que convierte DTO → Domain Model. Nunca acceder al DTO fuera del mapper.

---

## Paso 4: Crear el Module File

Ubicación: `src/features/{feature}/{feature}.module.ts`

```ts
import * as React from "react";

import { Icons } from "@/config/icons.config";
import { Typography } from "@/components/atoms/typography";
import { StatusBadge } from "@/components/molecules/status-badge";
import { createCrudModule } from "@/shared/factories/create-crud-module";

import { mapEntityDtoToEntity } from "./mappers/entity.mapper";
import { entityFormSchema } from "./schemas/entity-form.schema";
import type { Entity, EntityDto, EntityFormValues, EntityQueryParams } from "./types/entity";

export const entityModule = createCrudModule<
  Entity,
  EntityDto,
  EntityFormValues,
  EntityQueryParams
>({
  entity: "entities",
  basePath: "/entities",
  translationNamespace: "entities",

  permissions: {
    read: "entity:read",
    create: "entity:create",
    update: "entity:update",
    delete: "entity:delete",
  },

  api: {
    endpoint: "/v1/entities",
    mapDtoToEntity: mapEntityDtoToEntity,
  },

  table: {
    columns: [
      {
        id: "name",
        cell: (row) =>
          React.createElement(Typography, { variant: "body", className: "font-medium" }, row.name),
      },
      {
        id: "status",
        cell: (row) =>
          React.createElement(
            StatusBadge,
            { tone: row.status === "ACTIVE" ? "success" : "secondary" },
            row.status === "ACTIVE" ? "Activo" : "Inactivo"
          ),
      },
    ],
    sortableColumns: ["name", "status"],
  },

  form: {
    schema: entityFormSchema,
    defaultValues: {
      name: "",
      status: "ACTIVE",
    },
    fields: [
      { type: "text", name: "name", required: true, gridSpan: 1 },
      {
        type: "select",
        name: "status",
        gridSpan: 2,
        options: [
          { value: "ACTIVE", translationKey: "form.statusActive" },
          { value: "INACTIVE", translationKey: "form.statusInactive" },
        ],
      },
    ],
  },

  detail: {
    mode: "tabs", // Opciones: "stack" (por defecto) | "tabs"
    defaultTab: "general", // (opcional) ID de la pestaña inicial
    sections: [
      {
        id: "general",
        title: "detail.generalInfo",
        icon: Icons.city,
        fields: [
          { key: "name", label: "detail.name" },
          {
            key: "status",
            label: "detail.status",
            render: (v) =>
              React.createElement(
                StatusBadge,
                { tone: v === "ACTIVE" ? "success" : "secondary" },
                v === "ACTIVE" ? "Activo" : "Inactivo"
              ),
          },
        ],
      },
    ],
  },

  filters: [
    { name: "search", type: "search" },
    {
      name: "status",
      type: "select",
      options: [
        { value: "ACTIVE", translationKey: "filters.statusActive" },
        { value: "INACTIVE", translationKey: "filters.statusInactive" },
      ],
    },
  ],

  actions: [
    { id: "view", type: "view", permission: "entity:read", icon: Icons.view },
    { id: "edit", type: "edit", permission: "entity:update", icon: Icons.edit },
    {
      id: "delete",
      type: "delete",
      permission: "entity:delete",
      icon: Icons.drop,
      confirm: {
        translationKey: "actions.deleteTitle",
        descriptionKey: "actions.deleteDescription",
      },
    },
  ],
});
```

---

## Paso 5: Crear el Client File

Ubicación: `src/features/{feature}/{feature}.client.ts`

```ts
"use client";

import { entityModule } from "./{feature}.module";

export const EntityListPage = entityModule.ListPage;
export const EntityFormPage = entityModule.FormPage;
export const EntityDetailPage = entityModule.DetailPage;
```

> **Regla:** Este archivo es obligatorio. Las páginas del módulo son Client Components, pero el archivo `*.module.ts` no lleva `"use client"` para poder ser importado desde Server Components (como las páginas del App Router).

---

## Paso 6: Crear el Barrel File

Ubicación: `src/features/{feature}/index.ts`

```ts
export * from "./types/entity";
export * from "./schemas/entity-form.schema";
export * from "./mappers/entity.mapper";
export * from "./{feature}.module";
export * from "./{feature}.client";
```

---

## Paso 7: Crear las Páginas del App Router

### Listado

`src/app/[locale]/(app)/(dashboard)/{entities}/page.tsx`

```tsx
import { EntityListPage, entityModule } from "@/features/{feature}";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EntitiesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <PermissionGate permission={entityModule.permissions.read} fallback={<NotAuthorized />}>
      <EntityListPage searchParams={params} />
    </PermissionGate>
  );
}
```

### Creación

`src/app/[locale]/(app)/(dashboard)/{entities}/new/page.tsx`

```tsx
import { EntityFormPage, entityModule } from "@/features/{feature}";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

export default function NewEntityPage() {
  return (
    <PermissionGate permission={entityModule.permissions.create!} fallback={<NotAuthorized />}>
      <EntityFormPage mode="create" />
    </PermissionGate>
  );
}
```

### Edición

`src/app/[locale]/(app)/(dashboard)/{entities}/[id]/edit/page.tsx`

```tsx
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEntityPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <PermissionGate permission={entityModule.permissions.update!} fallback={<NotAuthorized />}>
      <EntityFormPage mode="edit" id={id} />
    </PermissionGate>
  );
}
```

### Detalle

`src/app/[locale]/(app)/(dashboard)/{entities}/[id]/page.tsx`

```tsx
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EntityDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <PermissionGate permission={entityModule.permissions.read} fallback={<NotAuthorized />}>
      <EntityDetailPage id={id} />
    </PermissionGate>
  );
}
```

---

## Paso 8: Crear los Archivos de Traducción

Crear en `src/i18n/messages/es/{entities}.json` y `src/i18n/messages/en/{entities}.json`.

Ver `docs/crud-sdk-i18n.md` para la estructura completa requerida.

---

## Paso 9: Registrar el Namespace en i18n

Agregar el namespace al archivo de índice de mensajes:

`src/i18n/messages/es/index.ts`

```ts
import entities from "./entities.json";

// ...
export default {
  // ...
  entities,
};
```

---

# Configuraciones Avanzadas

## Campos de Relación (Combobox)

Para un campo que carga opciones desde otro endpoint:

```ts
{
  type: "relation",
  name: "cityId",
  required: true,
  gridSpan: 1,
  relation: {
    endpoint: "/v1/cities",
    queryParams: { status: "ACTIVE", pageSize: 200 },
    mapToOption: (city: City) => ({
      value: city.id,
      label: city.name,
    }),
    searchParam: "search",
    dependsOn: {          // (opcional) el campo depende de otro campo
      field: "countryId",
      paramName: "countryId",
    },
  },
}
```

## Filtro de Relación

```ts
{
  name: "cityId",
  type: "relation",
  relation: {
    endpoint: "/v1/cities",
    queryParams: { status: "ACTIVE", pageSize: 200 },
    mapToOption: (city: City) => ({
      value: city.id,
      label: city.name,
    }),
  },
},
```

## Sección Personalizada en Detalle (Composición)

Para mostrar una lista relacionada dentro de la vista de detalle:

```ts
detail: {
  sections: [
    {
      title: "detail.generalInfo",
      fields: [...],
    },
    {
      title: "detail.zonesSection",
      gridCols: 1,
      renderCustom: (city) =>
        React.createElement(zonesModule.ListPage, {
          searchParams: { cityId: city.id },
          hideHeader: true,
          hideFilters: true,
          omitColumns: ["city"],
        }),
    },
  ],
},
```

## Sobreescritura de API

Si el endpoint requiere lógica personalizada:

```ts
api: {
  endpoint: "/v1/entities",
  mapDtoToEntity: mapEntityDtoToEntity,
  list: async (params) => {
    // lógica personalizada
    const data = await myCustomApiCall(params);
    return data;
  },
},
```

## Formulario Personalizado

Si el formulario es demasiado complejo para los campos declarativos:

```ts
form: {
  schema: entityFormSchema,
  defaultValues: { name: "", status: "ACTIVE" },
  renderForm: (props) => React.createElement(MyCustomForm, props),
},
```

---

# Tipos Principales del SDK

## `CrudModuleConfig<TEntity, TDto, TFormValues, TQueryParams, TColumnId>`

| Propiedad              | Tipo                        | Descripción                               |
| ---------------------- | --------------------------- | ----------------------------------------- |
| `entity`               | `string`                    | Nombre de la entidad (plural, snake_case) |
| `basePath`             | `string`                    | Ruta base del módulo (ej. `/zones`)       |
| `translationNamespace` | `string`                    | Namespace i18n del módulo                 |
| `permissions`          | `ModulePermissions`         | Permisos CRUD                             |
| `api`                  | `CrudApiConfig`             | Configuración de la API                   |
| `table`                | `TableConfig`               | Configuración de la tabla                 |
| `form`                 | `FormConfig` (opcional)     | Configuración del formulario              |
| `detail`               | `DetailConfig` (opcional)   | Configuración de la vista de detalle      |
| `filters`              | `FilterConfig[]` (opcional) | Filtros del listado                       |
| `actions`              | `ModuleAction[]` (opcional) | Acciones de la tabla                      |

## Tipos de campos (`FormFieldConfig`)

| Tipo       | Descripción                                   |
| ---------- | --------------------------------------------- |
| `text`     | Input de texto, email, número o password      |
| `select`   | Selector de opciones estáticas                |
| `relation` | Combobox que carga opciones desde un endpoint |
| `switch`   | Toggle booleano                               |
| `date`     | Selector de fecha                             |
| `custom`   | Renderizado personalizado                     |

## Tipos de filtros (`FilterConfig`)

| Tipo       | Descripción                                 |
| ---------- | ------------------------------------------- |
| `search`   | Input de búsqueda libre                     |
| `select`   | Select de opciones estáticas                |
| `relation` | Select que carga opciones desde un endpoint |
| `custom`   | Renderizado personalizado                   |

---

# Checklist para Crear un Nuevo Módulo SDK

## Con el script (recomendado)

- [ ] Ejecutar `node scripts/create-module.js <module-name> [PluralTitle]`
- [ ] Personalizar `{feature}.module.ts` (columnas, campos, filtros, secciones)
- [ ] Registrar permisos en `src/config/permissions.ts`
- [ ] Registrar el namespace en `src/i18n/messages/es/index.ts` y `en/index.ts`
- [ ] Traducir y completar los archivos i18n generados
- [ ] Extender el Zod schema y tipos si el módulo requiere campos adicionales

## Manual (Opción B)

- [ ] Crear `types/{entity}.ts` (DTO, Domain, FormValues, QueryParams)
- [ ] Crear `schemas/{entity}-form.schema.ts` (Zod schema)
- [ ] Crear `mappers/{entity}.mapper.ts` (DTO → Domain)
- [ ] Crear `{feature}.module.ts` (createCrudModule)
- [ ] Crear `{feature}.client.ts` (re-exportaciones "use client")
- [ ] Crear `index.ts` (barrel file)
- [ ] Crear las 4 páginas en App Router (list, new, edit, detail)
- [ ] Crear archivos de traducción (es + en)
- [ ] Registrar el namespace en los índices de mensajes

---

# Errores Comunes

❌ Agregar `"use client"` al archivo `*.module.ts` (rompe la importación desde Server Components).

❌ Usar `zodResolver` en formularios del SDK (el SDK usa `safeParse` internamente — pasar el schema en `form.schema`).

❌ Escribir textos directamente en columnas o campos (siempre usar `translationKey`).

❌ Usar `any` en tipos del módulo.

❌ Consumir DTOs directamente en la UI (siempre pasar por el mapper).

❌ Omitir el `PermissionGate` en las páginas del App Router.

❌ Olvidar registrar el namespace i18n en los archivos índice (los textos del módulo aparecerán vacíos).
