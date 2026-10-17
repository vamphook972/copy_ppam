# Estructura del Proyecto

La siguiente estructura organiza el proyecto por responsabilidad y dominio funcional.

```text
src/
│
├── app/
├── components/
├── config/
├── domain/
├── features/
├── hooks/
├── i18n/
├── lib/
├── providers/
├── shared/
└── styles/
```

---

# app

Contiene el App Router de Next.js.

```text
app/
└── [locale]/
    ├── (app)/
    │   └── (dashboard)/
    │       ├── cities/
    │       ├── zones/
    │       ├── places/
    │       ├── tenants/
    │       ├── users/
    │       └── home/
    ├── (auth)/
    └── (public)/
```

Aquí viven:

- Layouts
- Pages
- Route Groups
- Loading
- Error
- Not Found

No contiene lógica de negocio.

Las pages son **Server Components** ligeros que:

1. Reciben y normalizan `searchParams`.
2. Aplican `PermissionGate` para proteger el acceso.
3. Renderizan el componente de Feature correspondiente.

---

# components

Contiene todos los componentes reutilizables.

```text
components/
├── ui/              ← Componentes shadcn/ui (no modificar)
├── atoms/           ← Elementos mínimos reutilizables
│   ├── badge/
│   ├── switch/
│   └── typography/
├── molecules/       ← Combinaciones de átomos
│   ├── data-table/
│   ├── filter-field/
│   ├── form-field/
│   ├── form-section/
│   ├── page-header/
│   ├── permission-gate/
│   ├── relation-field/
│   └── status-badge/
├── organisms/       ← Secciones complejas
│   ├── not-authorized/
│   ├── sidebar/
│   └── ...
└── templates/
    └── crud/        ← Templates genéricos del SDK
        ├── entity-list-page.tsx
        ├── entity-form-page.tsx
        ├── entity-detail-page.tsx
        └── index.ts
```

---

# config

Configuración global del proyecto.

```text
config/
├── env.ts          ← Variables de entorno
├── icons.config.ts ← Mapa de iconos Lucide
├── permissions.ts  ← Definición de permisos
└── routes.ts       ← Rutas de la aplicación
```

---

# domain

Representa el dominio del negocio.

Incluye:

- Modelos de dominio globales
- Tipos y permisos compartidos

No depende de React.

---

# features

Cada carpeta representa un módulo funcional.

```text
features/
├── auth/             ← Autenticación
├── cities/           ← Módulo SDK de ciudades
├── notifications/    ← Módulo de notificaciones
├── places/           ← Módulo SDK de lugares
├── tenants/          ← Módulo SDK de tenants
├── users/            ← Módulo de usuarios (complejo)
└── zones/            ← Módulo SDK de zonas
```

## Estructura de un Feature SDK

```text
features/{feature}/
├── api/                     ← (opcional) sobreescritura HTTP
├── components/              ← Componentes exclusivos
├── hooks/                   ← (opcional) hooks adicionales
├── mappers/
│   └── {entity}.mapper.ts   ← DTO → Domain Model
├── schemas/
│   └── {entity}-form.schema.ts ← Zod schema
├── types/
│   └── {entity}.ts          ← DTO, DomainModel, FormValues, QueryParams
├── {feature}.module.ts      ← createCrudModule (configuración declarativa)
├── {feature}.client.ts      ← Re-exportaciones "use client"
└── index.ts                 ← Barrel file
```

---

# hooks

Hooks reutilizables por toda la aplicación que no pertenecen a ninguna Feature específica.

Ejemplos:

- `useDebounce`
- `useLocalStorage`
- `useBreakpoint`

---

# i18n

Configuración de internacionalización con `next-intl`.

```text
i18n/
├── navigation.ts    ← createSharedPathnamesNavigation
├── request.ts       ← getRequestConfig
├── routing.ts       ← defineRouting
└── messages/
    ├── es/
    │   ├── common.json
    │   ├── validation.json  ← Mensajes de Zod en español
    │   ├── errors.json      ← Errores del servidor (por error.code)
    │   ├── notifications.json
    │   ├── cities.json
    │   ├── zones.json
    │   ├── places.json
    │   └── ...
    └── en/
        └── ...              ← Espejo de la estructura es/
```

### Namespaces transversales

| Namespace       | Uso                                                      |
| --------------- | -------------------------------------------------------- |
| `common`        | Botones, acciones globales, navegación                   |
| `validation`    | Mensajes de error de formularios (Zod → i18n)            |
| `errors`        | Mensajes de error del servidor mapeados por `error.code` |
| `notifications` | Mensajes de toast (éxito, error)                         |

---

# lib

Cliente HTTP y utilidades de infraestructura.

```text
lib/
└── http/
    ├── api-client.ts         ← Instancia configurada de Axios
    └── interceptors/
        └── error.interceptor.ts ← Interceptor de respuestas de error
```

El interceptor extrae `error.code` y `error.message` del body del servidor y los hace disponibles como `ApiError`.

---

# providers

Providers globales.

```text
providers/
├── query-provider.tsx   ← TanStack Query
├── auth-provider.tsx    ← AWS Amplify
└── theme-provider.tsx   ← next-themes
```

---

# shared

Código reutilizable sin lógica de negocio ni componentes React.

```text
shared/
├── constants/
├── enums/
├── factories/
│   ├── create-crud-api.ts     ← Genera métodos HTTP CRUD
│   ├── create-crud-hooks.ts   ← Genera hooks TanStack Query
│   ├── create-crud-module.ts  ← Orquesta el módulo completo
│   └── index.ts
├── types/
│   ├── api.ts                 ← Pagination, ApiResponse
│   └── crud-module.types.ts   ← Todos los tipos del SDK
└── utils/
    ├── notify.ts              ← Wrapper de toast (notify.success, notify.error)
    └── query-transform.ts     ← Transformación de query params
```

---

# styles

Estilos globales.

Incluye:

- `globals.css` — estilos base y variables de diseño (tokens CSS)
- Fuentes tipográficas
- Temas claro/oscuro

---

# Regla General

Cada archivo debe tener una responsabilidad clara.

Si un archivo comienza a crecer demasiado o mezcla responsabilidades, debe dividirse en componentes o módulos más pequeños.

**Prohibiciones absolutas:**

- ❌ Usar `any` en código de producción.
- ❌ Hacer llamadas HTTP directamente desde un componente.
- ❌ Escribir textos visibles sin internacionalización.
- ❌ Consumir DTOs directamente en React.
- ❌ Validar roles directamente (siempre usar permisos).
