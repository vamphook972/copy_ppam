# APPAM - Sistema Web de Administración

Sistema de administración para la **Predicación Pública en Áreas Metropolitanas (PPAM)**.

APPAM es una aplicación web desarrollada para administrar de forma centralizada la operación, planificación y seguimiento de las actividades relacionadas con la Predicación Pública en Áreas Metropolitanas, proporcionando una plataforma moderna, segura, escalable y preparada para múltiples organizaciones e idiomas.

---

# Objetivos

- Centralizar la administración de la plataforma PPAM.
- Gestionar usuarios mediante invitaciones.
- Administrar roles y permisos.
- Proveer autenticación segura mediante Amazon Cognito.
- Permitir inicio de sesión federado (Google, Apple y Microsoft).
- Soportar múltiples idiomas.
- Soportar tema claro y oscuro.
- Consumir servicios REST de forma desacoplada.
- Mantener una arquitectura escalable y mantenible.

---

# Stack Tecnológico

## Framework

- Next.js 16 (App Router)
- React 19
- TypeScript (Strict Mode)

## UI

- Tailwind CSS v4
- shadcn/ui
- Radix UI
- Lucide Icons
- next-themes

## Internacionalización

- next-intl

## Estado y consumo de datos

- TanStack Query v5
- Axios

## Autenticación

- AWS Amplify
- Amazon Cognito
- Login Federado

  - Google
  - Apple
  - Microsoft

## Validación

- Zod

## Formularios

- React Hook Form

---

# Arquitectura

El proyecto adopta una combinación de varios patrones de arquitectura para mantener una clara separación de responsabilidades.

- App Router (Next.js)
- Feature-Based Architecture
- Atomic Design (para componentes de interfaz)
- Layered Architecture
- DTO + Mapper + Domain Model
- **CRUD SDK Declarativo** (`shared/factories`)

La estructura lógica queda organizada de la siguiente manera:

```text
Presentation
│
├── app
├── components
│
Application
│
├── features
├── hooks
├── providers
│
Domain
│
├── models
├── permissions
├── types
│
Infrastructure
│
├── amplify
├── http
├── storage
│
Shared
│
├── constants
├── enums
├── errors
├── factories   ← CRUD SDK
├── types
└── utils
```

---

# CRUD SDK Declarativo

El proyecto implementa un SDK declarativo que elimina el boilerplate repetitivo al crear nuevos módulos CRUD.

El SDK se compone de tres factories ubicadas en `src/shared/factories/`:

| Factory            | Descripción                                                                |
| ------------------ | -------------------------------------------------------------------------- |
| `createCrudApi`    | Genera los métodos HTTP (list, getById, create, update, remove)            |
| `createCrudHooks`  | Genera los hooks de TanStack Query (useList, useDetail, useCreate, etc.)   |
| `createCrudModule` | Orquesta el módulo completo y expone `ListPage`, `FormPage` y `DetailPage` |

## Patrón de un módulo SDK

Un módulo SDK se compone de dos archivos principales:

**`{feature}.module.ts`** — Configuración declarativa del módulo:

```ts
export const zonesModule = createCrudModule<Zone, ZoneDto, ZoneFormValues, ZonesQueryParams>({
  entity: "zones",
  basePath: "/zones",
  translationNamespace: "zones",
  permissions: { read: "zone:read", create: "zone:create", ... },
  api: { endpoint: "/v1/zones", mapDtoToEntity: mapZoneDtoToZone },
  table: { columns: [...], sortableColumns: [...] },
  form: { schema: zoneFormSchema, defaultValues: {...}, fields: [...] },
  detail: { sections: [...] },
  filters: [...],
  actions: [...],
});
```

**`{feature}.client.ts`** — Re-exportaciones marcadas como `"use client"`:

```ts
"use client";

export const ZonesListPage = zonesModule.ListPage;
export const ZonesFormPage = zonesModule.FormPage;
export const ZonesDetailPage = zonesModule.DetailPage;
```

## Módulos implementados con el SDK

| Módulo   | Feature            | Estado          |
| -------- | ------------------ | --------------- |
| Ciudades | `features/cities`  | ✅ Implementado |
| Zonas    | `features/zones`   | ✅ Implementado |
| Lugares  | `features/places`  | ✅ Implementado |
| Tenants  | `features/tenants` | ✅ Implementado |

> Ver `docs/guides/crud-sdk-guide.md` para la guía completa de construcción de módulos.

---

# Principios de Diseño

Durante el desarrollo del proyecto se seguirán los siguientes principios:

- Separación estricta de responsabilidades.
- Componentes pequeños y reutilizables.
- Preferencia por composición sobre herencia.
- Modelos de dominio independientes del backend.
- Uso de DTOs y Mappers para desacoplar la API.
- Configuración centralizada y declarativa.
- Código fuertemente tipado (`strict: true`). **Prohibido el uso de `any`.**
- Internacionalización desde el inicio del proyecto.
- Diseño basado en Design Tokens.
- Acceso basado en permisos.

---

# Organización del Proyecto

```text
src/
│
├── app/                    ← App Router (Next.js): layouts, pages, routes
├── components/
│   ├── ui/                 ← Componentes de shadcn/ui
│   ├── atoms/              ← Elementos mínimos (Typography, Switch, etc.)
│   ├── molecules/          ← Combinaciones de átomos (PageHeader, FormField, etc.)
│   ├── organisms/          ← Secciones complejas (DataTable, Sidebar, etc.)
│   └── templates/
│       └── crud/           ← Templates genéricos del SDK (EntityListPage, EntityFormPage, EntityDetailPage)
│
├── config/                 ← Configuración global (permisos, iconos, rutas, env)
├── domain/                 ← Modelos de dominio y tipos globales
├── features/               ← Módulos funcionales (auth, cities, zones, places, tenants, users, notifications)
├── hooks/                  ← Hooks reutilizables globales
├── i18n/                   ← Configuración y mensajes de next-intl
├── lib/                    ← Cliente HTTP, interceptores
├── providers/              ← Providers globales (Query, Auth, Theme)
├── shared/
│   ├── constants/
│   ├── enums/
│   ├── factories/          ← CRUD SDK (createCrudApi, createCrudHooks, createCrudModule)
│   ├── types/              ← Tipos compartidos (crud-module.types.ts, api.ts)
│   └── utils/
└── styles/                 ← Estilos globales y tokens de diseño
```

---

# Estructura de un Feature (Módulo SDK)

```text
features/zones/
├── api/                    ← (opcional) sobreescritura de llamadas HTTP
├── components/             ← Componentes exclusivos del módulo
├── hooks/                  ← (opcional) hooks adicionales
├── mappers/
│   └── zone.mapper.ts      ← ZoneDto → Zone
├── schemas/
│   └── zone-form.schema.ts ← Zod schema del formulario
├── types/
│   └── zone.ts             ← ZoneDto, Zone, ZoneFormValues, ZonesQueryParams
├── zones.module.ts         ← Configuración declarativa del SDK
├── zones.client.ts         ← Re-exportaciones "use client"
└── index.ts                ← Barrel file
```

---

# Internacionalización

Cada módulo tiene su propio namespace dentro de `src/i18n/messages/{locale}/`.

Los namespaces transversales son:

| Namespace       | Descripción                                       |
| --------------- | ------------------------------------------------- |
| `common`        | Textos globales (botones, navegación)             |
| `validation`    | Mensajes de validación de formularios (Zod)       |
| `errors`        | Mensajes de error del servidor (por `error.code`) |
| `notifications` | Mensajes de notificación (toast)                  |

> Ver `docs/crud-sdk-i18n.md` para las convenciones de i18n en módulos CRUD.

---

# Características Principales

- Administración de usuarios con sistema de invitaciones.
- Administración de roles y permisos.
- Administración de ciudades, zonas y lugares.
- Administración de tenants.
- Permisos dinámicos con `PermissionGate`.
- Menú generado desde el backend.
- Navegación basada en permisos.
- Dashboard administrativo.
- SDK declarativo para módulos CRUD.
- Validación de formularios con Zod (mensajes en i18n).
- Manejo centralizado de errores del servidor (por `error.code`).
- Internacionalización completa (ES / EN).
- Tema claro y oscuro.
- Responsive Design.

---

# Calidad del Código

El proyecto utiliza herramientas para garantizar consistencia y calidad:

- ESLint
- Prettier
- prettier-plugin-tailwindcss
- Ordenamiento automático de imports
- TypeScript Strict Mode (`strict: true`)
- Vitest (tests unitarios)

---

# Convenciones

- Archivos en `kebab-case`.
- Componentes en `PascalCase`.
- Hooks con prefijo `use`.
- DTOs separados de los modelos de dominio.
- Exportaciones mediante archivos `index.ts`.
- **Prohibido el uso de `any`** en código de producción.
- Toda cadena visible al usuario debe obtenerse mediante `next-intl`.

---

# Documentación

La documentación técnica del proyecto se encuentra en la carpeta `docs/`.

| Documento                               | Descripción                                     |
| --------------------------------------- | ----------------------------------------------- |
| `docs/architecture.md`                  | Arquitectura general del proyecto               |
| `docs/project-structure.md`             | Estructura de carpetas                          |
| `docs/engineering-handbook.md`          | Prácticas y estándares de desarrollo            |
| `docs/coding-standards.md`              | Estándares de código                            |
| `docs/crud-sdk-i18n.md`                 | Convenciones de i18n para módulos CRUD          |
| `docs/guides/crud-sdk-guide.md`         | **Guía completa para crear módulos con el SDK** |
| `docs/guides/feature-guide.md`          | Guía de desarrollo de Features                  |
| `docs/guides/form-guide.md`             | Guía de formularios                             |
| `docs/guides/api-guide.md`              | Guía de integración con la API                  |
| `docs/guides/component-guide.md`        | Guía de componentes                             |
| `docs/guides/page-guide.md`             | Guía de páginas                                 |
| `docs/guides/permission-guide.md`       | Guía de permisos                                |
| `docs/guides/state-management-guide.md` | Guía de estado                                  |
| `docs/guides/testing-guide.md`          | Guía de pruebas                                 |
| `docs/decisions/`                       | Decisiones de arquitectura (ADRs)               |

---

# Estado del Proyecto

El proyecto ha completado la construcción de la infraestructura base y los primeros módulos funcionales.

| Componente                  | Estado          |
| --------------------------- | --------------- |
| Sistema de Diseño           | ✅ Implementado |
| Layout Administrativo       | ✅ Implementado |
| Integración con AWS Amplify | ✅ Implementado |
| Cliente HTTP                | ✅ Implementado |
| Sistema de Permisos         | ✅ Implementado |
| Dashboard                   | ✅ Implementado |
| CRUD SDK Declarativo        | ✅ Implementado |
| Módulo Ciudades             | ✅ Implementado |
| Módulo Zonas                | ✅ Implementado |
| Módulo Lugares              | ✅ Implementado |
| Módulo Tenants              | ✅ Implementado |
| Módulo Usuarios             | 🔄 En progreso  |
| Módulo Notificaciones       | 🔄 En progreso  |

---

# Licencia

Este proyecto es de uso privado y está destinado al desarrollo y operación del sistema APPAM.
