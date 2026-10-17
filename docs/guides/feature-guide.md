# Feature Development Guide

## APPAM - Sistema Web de Administración

Versión: **2.0**

Última actualización: **2026-07-27**

---

# Objetivo

Una **Feature** representa un módulo funcional del sistema.

Ejemplos de Features actuales:

- Auth
- Dashboard
- Users
- Cities
- Zones
- Places
- Tenants
- Notifications

Cada Feature debe ser autocontenida y responsable únicamente de su propio dominio.

---

# Tipos de Features

APPAM tiene dos tipos de Features:

## 1. Módulo SDK (recomendado)

Para módulos con operaciones CRUD estándar: utilizar `createCrudModule` de `src/shared/factories/`.

Ver `docs/guides/crud-sdk-guide.md` para la guía completa.

Ejemplos: `cities`, `zones`, `places`, `tenants`.

## 2. Módulo Complejo

Para módulos con flujos específicos que no encajan en el patrón CRUD estándar.

Ejemplos: `auth`, `users` (invitaciones, cambio de contraseña, etc.).

---

# Principios

Toda Feature debe cumplir los siguientes principios:

- Alta cohesión.
- Bajo acoplamiento.
- Responsabilidad única.
- Independencia del resto de Features.
- Reutilización cuando sea posible.
- Componentes pequeños.

Una Feature nunca debe depender directamente de archivos internos de otra Feature (solo del `index.ts`).

---

# Estructura

## Módulo SDK

```text
features/zones/
├── api/                     ← (opcional) sobreescritura de métodos HTTP
├── components/              ← Componentes exclusivos del módulo
├── hooks/                   ← (opcional) hooks adicionales
├── mappers/
│   └── zone.mapper.ts       ← ZoneDto → Zone
├── schemas/
│   └── zone-form.schema.ts  ← Zod schema del formulario
├── types/
│   └── zone.ts              ← ZoneDto, Zone, ZoneFormValues, ZonesQueryParams
├── zones.module.ts          ← createCrudModule (configuración declarativa)
├── zones.client.ts          ← Re-exportaciones "use client"
└── index.ts                 ← Barrel file
```

## Módulo Complejo

```text
features/users/
├── api/
├── components/
├── hooks/
├── mappers/
├── schemas/
├── services/
├── types/
└── index.ts
```

No todas las carpetas son obligatorias desde el inicio. Se crearán conforme la Feature crezca.

---

# Responsabilidad de cada carpeta

## api/

Contiene sobreescrituras o extensiones de las llamadas HTTP.

En módulos SDK, solo se usa si la API requiere lógica personalizada que no puede ser manejada por el `createCrudApi` genérico.

Responsabilidades:

- Invocar servicios REST con lógica especial.
- No transformar datos (eso es el mapper).

---

## dto/ (o types/)

Define los contratos del backend.

```ts
export interface ZoneDto {
  id: string;
  name: string;
  cityId: string;
  city?: { id: string; name: string };
  status: ZoneStatus;
}
```

Nunca utilizar DTOs directamente en React.

En módulos SDK, los tipos (DTO, Domain, FormValues, QueryParams) se colocan en `types/{entity}.ts`.

---

## mappers/

Transforman DTOs en modelos de dominio.

```text
ZoneDto → ZoneMapper → Zone
```

Toda conversión debe estar centralizada aquí.

---

## types/

Contiene todos los tipos específicos de la Feature:

- `{Entity}Status` (tipo de estado)
- `{Entity}FormValues` (inferido del Zod schema)
- `{Entity}Dto` (contrato del backend)
- `{Entity}` (modelo de dominio)
- `{Entity}QueryParams` (filtros de la lista)
- `{Entity}ListResponse`

Evitar colocar aquí modelos de dominio que sean compartidos (esos van en `src/domain/`).

---

## schemas/

Esquemas de validación con Zod.

```ts
// zone-form.schema.ts
export const zoneFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  cityId: z.string().trim().min(1),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
```

> **Importante:** El SDK usa `safeParse` internamente, no `zodResolver`. Los mensajes de error se traducen automáticamente mediante el namespace `validation`.

---

## hooks/

Hooks especializados de la Feature.

En módulos SDK, los hooks CRUD son generados automáticamente por `createCrudHooks`. Solo agregar hooks adicionales si la Feature los requiere.

---

## components/

Componentes exclusivos de la Feature.

Si un componente puede reutilizarse en otras Features, debe moverse a `src/components`.

---

## {feature}.module.ts

Archivo principal del módulo SDK. Contiene la llamada a `createCrudModule` con toda la configuración declarativa.

**No debe** llevar la directiva `"use client"`.

---

## {feature}.client.ts

Re-exporta los componentes de página del módulo marcándolos como Client Components.

```ts
"use client";

import { zonesModule } from "./zones.module";

export const ZonesListPage = zonesModule.ListPage;
export const ZonesFormPage = zonesModule.FormPage;
export const ZonesDetailPage = zonesModule.DetailPage;
```

---

# Flujo de Datos

```text
React Component
      │
      ▼
Custom Hook (TanStack Query)
      │
      ▼
CrudApiMethods (generado por createCrudApi)
      │
      ▼
Axios Client (src/lib/http)
      │
      ▼
Backend REST API
      │
      ▼
DTO Response
      │
      ▼
Mapper (DTO → Domain Model)
      │
      ▼
TanStack Query Cache
      │
      ▼
Actualización de la UI
```

---

# Flujo de Modelos

```text
Backend REST API
       ↓
     DTO
       ↓
    Mapper
       ↓
 Domain Model
       ↓
       UI
```

Los componentes trabajan únicamente con modelos del dominio.

---

# Validación de Formularios

Los formularios utilizan:

- **React Hook Form** — estado, registro de campos, submit.
- **Zod** — definición de reglas de validación.
- **SDK `safeParse`** — intercepta errores Zod y los convierte a mensajes i18n.

**No usar `zodResolver`** en formularios del SDK. El esquema se pasa como `form.schema` en `createCrudModule` y el SDK lo valida con `safeParse`.

---

# Manejo de Errores del Servidor

Cuando el servidor retorna un error, el SDK:

1. Captura el error del interceptor HTTP (`ApiError` con `code` y `message`).
2. Busca traducción en `errors.codes.{code}`.
3. Si no existe, muestra `apiError.message`.
4. Si no hay mensaje, muestra `errors.generic`.
5. Muestra el mensaje como toast (notify.error).

---

# Internacionalización

Toda Feature tendrá su propio namespace.

```text
i18n/messages/
├── es/
│   └── zones.json
└── en/
    └── zones.json
```

Uso:

```ts
const t = useTranslations("zones");
```

**Namespaces transversales** (no duplicar en el namespace del módulo):

- `common` — botones globales, navegación.
- `validation` — errores de formulario.
- `errors` — errores del servidor.
- `notifications` — mensajes de toast.

---

# Permisos

Los permisos se validan mediante `PermissionGate` o la función `can()`:

```tsx
<PermissionGate permission="zone:create" fallback={<NotAuthorized />}>
  ...
</PermissionGate>
```

```ts
can("zone:create");
```

Nunca:

```ts
role === "admin"; // ❌
```

Los componentes no conocen roles.

---

# Estado

| Tipo                | Herramienta    |
| ------------------- | -------------- |
| Estado local        | `useState`     |
| Estado del servidor | TanStack Query |
| Estado global       | Context API    |

No duplicar información entre estados.

---

# Páginas SSR + Client Fetch Pattern

Para páginas protegidas que dependen de sesión/token:

- El **servidor** (SSR) se encarga de: internacionalización, normalización de `searchParams`, protección con `PermissionGate`.
- El **cliente** se encarga de: fetch de datos (TanStack Query), estados loading/empty/error, reintentos.

Evitar fetch protegido en SSR cuando el token depende de sesión del cliente.

---

# Componentes Compartidos

Regla:

- Si solo una Feature lo utiliza → permanece en `src/features/{feature}/components/`.
- Si dos o más Features lo reutilizan → promover a `src/components/`.

---

# Barrel Files

Cada Feature debe exponer un `index.ts`.

```ts
export * from "./types/zone";
export * from "./schemas/zone-form.schema";
export * from "./mappers/zone.mapper";
export * from "./zones.module";
export * from "./zones.client";
```

Evitar importar archivos internos directamente desde otras Features.

---

# Organización de Páginas (App Router)

```text
app/[locale]/(app)/(dashboard)/zones/
├── page.tsx           ← Listado
├── new/
│   └── page.tsx       ← Creación
└── [id]/
    ├── page.tsx       ← Detalle
    └── edit/
        └── page.tsx   ← Edición
```

---

# Checklist para Crear una Nueva Feature (Módulo SDK)

- [ ] Crear `types/{entity}.ts` (DTO, Domain, FormValues, QueryParams)
- [ ] Crear `schemas/{entity}-form.schema.ts` (Zod schema)
- [ ] Crear `mappers/{entity}.mapper.ts` (DTO → Domain)
- [ ] Crear `{feature}.module.ts` (createCrudModule)
- [ ] Crear `{feature}.client.ts` (re-exportaciones "use client")
- [ ] Crear `index.ts` (barrel file)
- [ ] Crear páginas en App Router (list, new, edit, detail)
- [ ] Crear archivos de traducción (es + en)
- [ ] Registrar namespace en índices de mensajes

---

# Errores Comunes

❌ Consumir DTOs directamente en React.

❌ Llamar Axios desde un componente.

❌ Compartir componentes específicos entre Features (sin promoverlos a `src/components/`).

❌ Validar roles directamente en la interfaz.

❌ Duplicar lógica entre hooks.

❌ Utilizar `any`.

❌ Escribir textos sin internacionalización.

❌ Saltarse los mappers.

❌ Usar `zodResolver` en formularios del SDK.

❌ Olvidar el `PermissionGate` en las páginas del App Router.

---

# Objetivo Final

Todas las Features de APPAM deben seguir exactamente esta guía.

La consistencia es un activo del proyecto: un desarrollador que conozca una Feature debe ser capaz de comprender cualquier otra sin necesidad de aprender una nueva estructura o convención.
