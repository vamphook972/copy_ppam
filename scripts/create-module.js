#!/usr/bin/env node

/**
 * APPAM CRUD SDK Module Generator CLI
 *
 * Usage:
 *   node scripts/create-module.js <module-name> [PluralTitle]
 *
 * Examples:
 *   node scripts/create-module.js territories
 *   node scripts/create-module.js territories Territories
 *
 * What it generates:
 *   src/features/<module>/
 *     types/<entity>.ts
 *     schemas/<entity>-form.schema.ts
 *     mappers/<entity>.mapper.ts
 *     <module>.module.ts
 *     <module>.client.ts
 *     index.ts
 *
 *   src/app/[locale]/(app)/(dashboard)/<module>/
 *     page.tsx          (list)
 *     new/page.tsx      (create)
 *     [id]/page.tsx     (detail)
 *     [id]/edit/page.tsx (edit)
 *
 *   src/i18n/messages/es/<module>.json  (i18n template)
 *   src/i18n/messages/en/<module>.json  (i18n template)
 *
 * After running this script:
 *   1. Customize src/features/<module>/<module>.module.ts (columns, fields, filters, detail)
 *   2. Add/update permissions in src/config/permissions.ts
 *   3. Register the i18n namespace in src/i18n/messages/es/index.ts and en/index.ts
 *   4. Translate the i18n files with real labels
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
/* eslint-enable @typescript-eslint/no-require-imports */

const moduleName = process.argv[2];

if (!moduleName) {
  console.error("❌ Please provide a module name.");
  console.error("   Example: node scripts/create-module.js territories");
  process.exit(1);
}

const rootDir = path.resolve(__dirname, "..");
const featureDir = path.join(rootDir, "src", "features", moduleName);
const pagesDir = path.join(rootDir, "src", "app", "[locale]", "(app)", "(dashboard)", moduleName);

// Derive naming variants
const singularName = moduleName.endsWith("s") ? moduleName.slice(0, -1) : moduleName;
const pascalSingular = singularName.charAt(0).toUpperCase() + singularName.slice(1);
const pascalPlural = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
// Human-readable title: use provided arg or derive from pluralName
const titleArg = process.argv[3];
const title = titleArg || pascalPlural;
const singularTitle = titleArg ? titleArg.replace(/s$/i, "") : pascalSingular;

console.log(`\n🚀 Generating SDK module: ${moduleName} (${title})\n`);

// ---------------------------------------------------------------------------
// Helper: write file, skip if already exists
// ---------------------------------------------------------------------------
function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (fs.existsSync(filePath)) {
    console.log(`⚠️  Skipped (exists): ${path.relative(rootDir, filePath)}`);
  } else {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Created:           ${path.relative(rootDir, filePath)}`);
  }
}

// ---------------------------------------------------------------------------
// 1. Feature Types
// ---------------------------------------------------------------------------
createFile(
  path.join(featureDir, "types", `${singularName}.ts`),
  `import { z } from "zod";
import { ${singularName}FormSchema } from "../schemas/${singularName}-form.schema";
import type { BaseEntity, BaseQueryParams, ListResponse } from "@/shared/types/crud-module.types";

export type ${pascalSingular}Status = "ACTIVE" | "INACTIVE";

// FormValues is derived from the Zod schema — never defined manually
export type ${pascalSingular}FormValues = z.infer<typeof ${singularName}FormSchema>;

export interface ${pascalSingular}Dto {
  id: string;
  name: string;
  status: ${pascalSingular}Status;
  createdAt?: string;
  updatedAt?: string;
}

export interface ${pascalSingular} extends BaseEntity {
  id: string;
  name: string;
  status: ${pascalSingular}Status;
  createdAt?: string;
  updatedAt?: string;
}

export interface ${pascalPlural}QueryParams extends BaseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ${pascalSingular}Status;
}

export type ${pascalPlural}ListResponse = ListResponse<${pascalSingular}>;
`
);

// ---------------------------------------------------------------------------
// 2. Zod Schema
// NOTE: The SDK uses safeParse internally — do NOT use zodResolver.
// ---------------------------------------------------------------------------
createFile(
  path.join(featureDir, "schemas", `${singularName}-form.schema.ts`),
  `import { z } from "zod";

export const ${singularName}FormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
`
);

// ---------------------------------------------------------------------------
// 3. Mapper (DTO → Domain Model)
// ---------------------------------------------------------------------------
createFile(
  path.join(featureDir, "mappers", `${singularName}.mapper.ts`),
  `import type { ${pascalSingular}, ${pascalSingular}Dto } from "../types/${singularName}";

export function map${pascalSingular}DtoTo${pascalSingular}(dto: ${pascalSingular}Dto): ${pascalSingular} {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
`
);

// ---------------------------------------------------------------------------
// 4. Module Config (createCrudModule)
//    Do NOT add "use client" here — this file is imported from Server Components.
// ---------------------------------------------------------------------------
createFile(
  path.join(featureDir, `${moduleName}.module.ts`),
  `import * as React from "react";
import { createCrudModule } from "@/shared/factories/create-crud-module";
import { StatusBadge } from "@/components/molecules/status-badge";
import { Typography } from "@/components/atoms/typography";
import { Icons } from "@/config/icons.config";
import { map${pascalSingular}DtoTo${pascalSingular} } from "./mappers/${singularName}.mapper";
import { ${singularName}FormSchema } from "./schemas/${singularName}-form.schema";
import type { ${pascalSingular}, ${pascalSingular}Dto, ${pascalSingular}FormValues, ${pascalPlural}QueryParams } from "./types/${singularName}";

export const ${moduleName}Module = createCrudModule<${pascalSingular}, ${pascalSingular}Dto, ${pascalSingular}FormValues, ${pascalPlural}QueryParams>({
  entity: "${moduleName}",
  basePath: "/${moduleName}",
  translationNamespace: "${moduleName}",

  permissions: {
    read: "${singularName}:read",
    create: "${singularName}:create",
    update: "${singularName}:update",
    delete: "${singularName}:delete",
  },

  api: {
    endpoint: "/v1/${moduleName}",
    mapDtoToEntity: map${pascalSingular}DtoTo${pascalSingular},
  },

  table: {
    columns: [
      {
        id: "name",
        cell: (row) => React.createElement(Typography, { variant: "body", className: "font-medium" }, row.name),
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
    schema: ${singularName}FormSchema,
    defaultValues: {
      name: "",
      status: "ACTIVE",
    },
    fields: [
      {
        type: "text",
        name: "name",
        required: true,
        gridSpan: 2,
      },
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
    mode: "stack",
    header: {
      metadataFields: [{ key: "name" }],
    },
    sections: [
      {
        id: "general",
        title: "detail.generalInfo",
        icon: Icons.info,
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
    { id: "view", type: "view", permission: "${singularName}:read", icon: Icons.view },
    { id: "edit", type: "edit", permission: "${singularName}:update", icon: Icons.edit },
    {
      id: "delete",
      type: "delete",
      permission: "${singularName}:delete",
      icon: Icons.drop,
      confirm: {
        translationKey: "actions.deleteTitle",
        descriptionKey: "actions.deleteDescription",
      },
    },
  ],
});
`
);

// ---------------------------------------------------------------------------
// 5. Client Exports ("use client" boundary)
// ---------------------------------------------------------------------------
createFile(
  path.join(featureDir, `${moduleName}.client.ts`),
  `"use client";

import { ${moduleName}Module } from "./${moduleName}.module";

export const ${pascalPlural}ListPage = ${moduleName}Module.ListPage;
export const ${pascalPlural}FormPage = ${moduleName}Module.FormPage;
export const ${pascalPlural}DetailPage = ${moduleName}Module.DetailPage;
`
);

// ---------------------------------------------------------------------------
// 6. Barrel File
// ---------------------------------------------------------------------------
createFile(
  path.join(featureDir, "index.ts"),
  `export * from "./types/${singularName}";
export * from "./schemas/${singularName}-form.schema";
export * from "./mappers/${singularName}.mapper";
export * from "./${moduleName}.module";
export * from "./${moduleName}.client";
`
);

// ---------------------------------------------------------------------------
// 7. App Router Pages
// ---------------------------------------------------------------------------

// List
createFile(
  path.join(pagesDir, "page.tsx"),
  `import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { ${pascalPlural}ListPage, ${moduleName}Module } from "@/features/${moduleName}";

interface ${pascalPlural}PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ${pascalPlural}Page({ searchParams }: ${pascalPlural}PageProps) {
  const params = await searchParams;

  return (
    <PermissionGate permission={${moduleName}Module.permissions.read} fallback={<NotAuthorized />}>
      <${pascalPlural}ListPage searchParams={params} />
    </PermissionGate>
  );
}
`
);

// Create
createFile(
  path.join(pagesDir, "new", "page.tsx"),
  `import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { ${pascalPlural}FormPage, ${moduleName}Module } from "@/features/${moduleName}";

export default function New${pascalSingular}Page() {
  return (
    <PermissionGate permission={${moduleName}Module.permissions.create!} fallback={<NotAuthorized />}>
      <${pascalPlural}FormPage mode="create" />
    </PermissionGate>
  );
}
`
);

// Detail
createFile(
  path.join(pagesDir, "[id]", "page.tsx"),
  `import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { ${pascalPlural}DetailPage, ${moduleName}Module } from "@/features/${moduleName}";

interface ${pascalSingular}DetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ${pascalSingular}DetailPage({ params }: ${pascalSingular}DetailPageProps) {
  const { id } = await params;

  return (
    <PermissionGate permission={${moduleName}Module.permissions.read} fallback={<NotAuthorized />}>
      <${pascalPlural}DetailPage id={id} />
    </PermissionGate>
  );
}
`
);

// Edit
createFile(
  path.join(pagesDir, "[id]", "edit", "page.tsx"),
  `import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { ${pascalPlural}FormPage, ${moduleName}Module } from "@/features/${moduleName}";

interface ${pascalSingular}EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ${pascalSingular}EditPage({ params }: ${pascalSingular}EditPageProps) {
  const { id } = await params;

  return (
    <PermissionGate permission={${moduleName}Module.permissions.update!} fallback={<NotAuthorized />}>
      <${pascalPlural}FormPage mode="edit" id={id} />
    </PermissionGate>
  );
}
`
);

// ---------------------------------------------------------------------------
// 8. i18n Message Templates (ES + EN)
// ---------------------------------------------------------------------------
const i18nEs = {
  title: title,
  subtitle: `Gestione los registros de ${title.toLowerCase()} en el sistema.`,
  primaryAction: `Crear ${singularTitle}`,
  new: {
    title: `Crear ${singularTitle}`,
    subtitle: `Diligencie los campos requeridos para crear una nueva ${title.toLowerCase()}.`,
  },
  edit: {
    title: `Editar ${singularTitle}`,
    subtitle: `Actualice la información de la ${title.toLowerCase()} seleccionada.`,
  },
  detail: {
    title: `Detalle de ${singularTitle}`,
    subtitle: `Información detallada de la ${title.toLowerCase()}.`,
    generalInfo: "Información General",
    name: "Nombre",
    status: "Estado",
  },
  table: {
    caption: `Listado de ${title.toLowerCase()}`,
    columns: {
      name: "Nombre",
      status: "Estado",
      createdAt: "Fecha de Creación",
      updatedAt: "Última Actualización",
    },
    actions: "Acciones",
  },
  form: {
    nameLabel: "Nombre",
    namePlaceholder: `Ej: ${singularTitle} 1`,
    statusLabel: "Estado",
    statusActive: "Activo",
    statusInactive: "Inactivo",
    submitCreate: `Crear ${singularTitle}`,
    submitEdit: "Guardar cambios",
  },
  filters: {
    title: "Filtros",
    description: `Refine la lista para encontrar ${title.toLowerCase()} rápidamente.`,
    searchLabel: `Buscar ${singularTitle}`,
    searchPlaceholder: "Buscar por nombre...",
    statusLabel: "Estado",
    statusAll: "Todos",
    statusActive: "Activo",
    statusInactive: "Inactivo",
    apply: "Aplicar filtros",
    clear: "Limpiar filtros",
  },
  actions: {
    create: `Nuevo ${singularTitle}`,
    edit: "Editar",
    delete: "Eliminar",
    view: "Ver detalle",
    createTitle: `Crear ${singularTitle}`,
    createDescription: `Diligencie los campos requeridos para crear un nuevo ${singularTitle.toLowerCase()}.`,
    editTitle: `Editar ${singularTitle}`,
    editDescription: `Actualice la información del ${singularTitle.toLowerCase()} seleccionado.`,
    deleteTitle: `¿Eliminar ${singularTitle}?`,
    deleteDescription: `Esta acción no se puede deshacer. El registro será eliminado permanentemente del sistema.`,
  },
  states: {
    loading: "Cargando datos...",
    emptyTitle: `No hay ${title.toLowerCase()} registrados`,
    emptyDescription: "Cree su primer registro haciendo clic en el botón superior.",
    errorTitle: `Error al cargar las ${title.toLowerCase()}`,
    errorDescription: "Ocurrió un problema al comunicarse con el servidor. Intente nuevamente.",
  },
};

const i18nEn = {
  title: title,
  subtitle: `Manage ${title.toLowerCase()} in the system.`,
  primaryAction: `Create ${singularTitle}`,
  new: {
    title: `Create ${singularTitle}`,
    subtitle: `Fill in the required fields to create a new ${title.toLowerCase()}.`,
  },
  edit: {
    title: `Edit ${singularTitle}`,
    subtitle: `Update the information of the selected ${title.toLowerCase()}.`,
  },
  detail: {
    title: `${singularTitle} Detail`,
    subtitle: `Detailed information about the selected ${title.toLowerCase()}.`,
    generalInfo: "General Information",
    name: "Name",
    status: "Status",
  },
  table: {
    caption: `List of ${title.toLowerCase()}`,
    columns: {
      name: "Name",
      status: "Status",
      createdAt: "Created At",
      updatedAt: "Last Updated",
    },
    actions: "Actions",
  },
  form: {
    nameLabel: "Name",
    namePlaceholder: `e.g. ${singularTitle} 1`,
    statusLabel: "Status",
    statusActive: "Active",
    statusInactive: "Inactive",
    submitCreate: `Create ${singularTitle}`,
    submitEdit: "Save changes",
  },
  filters: {
    title: "Filters",
    description: `Refine the list to find ${title.toLowerCase()} quickly.`,
    searchLabel: `Search ${singularTitle}`,
    searchPlaceholder: "Search by name...",
    statusLabel: "Status",
    statusAll: "All",
    statusActive: "Active",
    statusInactive: "Inactive",
    apply: "Apply filters",
    clear: "Clear filters",
  },
  actions: {
    create: `New ${singularTitle}`,
    edit: "Edit",
    delete: "Delete",
    view: "View detail",
    createTitle: `Create ${singularTitle}`,
    createDescription: `Fill in the required fields to create a new ${singularTitle.toLowerCase()}.`,
    editTitle: `Edit ${singularTitle}`,
    editDescription: `Update the selected ${singularTitle.toLowerCase()}'s information.`,
    deleteTitle: `Delete ${singularTitle}?`,
    deleteDescription:
      "This action cannot be undone. The record will be permanently deleted from the system.",
  },
  states: {
    loading: "Loading data...",
    emptyTitle: `No ${title.toLowerCase()} found`,
    emptyDescription: "Create your first record by clicking the button above.",
    errorTitle: `Error loading ${title.toLowerCase()}`,
    errorDescription: "A problem occurred while communicating with the server. Please try again.",
  },
};

createFile(
  path.join(rootDir, "src", "i18n", "messages", "es", `${moduleName}.json`),
  JSON.stringify(i18nEs, null, 2) + "\n"
);

createFile(
  path.join(rootDir, "src", "i18n", "messages", "en", `${moduleName}.json`),
  JSON.stringify(i18nEn, null, 2) + "\n"
);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`
🎉 Module '${moduleName}' scaffolded successfully!

📋 Next steps:
   1. Customize  src/features/${moduleName}/${moduleName}.module.ts
      → Add/remove columns, form fields, filters, detail sections
   2. Add permissions in src/config/permissions.ts if needed
   3. Register the i18n namespace in:
      → src/i18n/messages/es/index.ts
      → src/i18n/messages/en/index.ts
   4. Translate the generated i18n files with real labels
   5. Extend the Zod schema in src/features/${moduleName}/schemas/${singularName}-form.schema.ts

📖 See docs/guides/crud-sdk-guide.md for the full reference.
`);
