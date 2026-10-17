# Arquitectura del Proyecto

## Objetivo

La arquitectura de APPAM está diseñada para facilitar el crecimiento del proyecto a largo plazo, promoviendo una clara separación de responsabilidades, reutilización de componentes y un bajo acoplamiento entre las diferentes capas de la aplicación.

Los principios adoptados buscan que la incorporación de nuevos módulos o desarrolladores tenga el menor impacto posible sobre el resto del sistema.

---

# Principios Arquitectónicos

El proyecto sigue los siguientes principios:

- Arquitectura por capas (Layered Architecture).
- Organización por funcionalidades (Feature-Based Architecture).
- Atomic Design para los componentes de interfaz.
- Separación entre modelos de dominio y contratos del backend.
- Composición sobre herencia.
- Configuración declarativa centralizada.
- Internacionalización desde el inicio.
- Seguridad basada en permisos.
- Componentes altamente reutilizables.
- Tipado estricto mediante TypeScript. **Prohibido el uso de `any`.**

---

# Arquitectura General

```text
Presentation
│
├── App Router
├── Layouts
├── Templates (EntityListPage / EntityFormPage / EntityDetailPage)
├── Organisms
├── Molecules
├── Atoms
│
Application
│
├── Features
├── Hooks
├── Providers
│
Domain
│
├── Models
├── Permissions
├── Types
│
Infrastructure
│
├── HTTP (Axios + interceptores)
├── AWS Amplify
├── Storage
│
Shared
│
├── Factories (CRUD SDK)
├── Utils
├── Errors
├── Constants
├── Types
└── Enums
```

Cada capa únicamente puede depender de las capas inferiores.

---

# Presentation Layer

Contiene toda la interfaz de usuario.

Incluye:

- App Router (pages y layouts)
- Templates genéricos del CRUD SDK (`EntityListPage`, `EntityFormPage`, `EntityDetailPage`)
- Componentes Atomic Design (Atoms, Molecules, Organisms)
- Componentes de shadcn/ui (`components/ui`)

Esta capa nunca realiza llamadas HTTP directamente.

Toda la información proviene de hooks o providers.

---

# Application Layer

Coordina los casos de uso de la aplicación.

Incluye:

- Features (módulos funcionales)
- Hooks
- Providers

Cada Feature que utiliza el SDK se configura de forma declarativa en un archivo `*.module.ts` y sus páginas se exportan en un `*.client.ts`.

Esta capa conoce la infraestructura, pero la interfaz no conoce esta capa directamente.

---

# CRUD SDK (Shared/Factories)

El SDK es la capa de automatización que elimina el boilerplate en la creación de módulos CRUD.

Se ubica en `src/shared/factories/` y expone tres factories:

## `createCrudApi`

Genera automáticamente los métodos HTTP para un endpoint dado:

```ts
const api = createCrudApi({
  endpoint: "/v1/zones",
  mapDtoToEntity: mapZoneDtoToZone,
  defaultParams: { include: "city" },
});
// → api.list(), api.getById(), api.create(), api.update(), api.remove()
```

Cada método puede ser sobreescrito individualmente si la Feature requiere lógica personalizada.

## `createCrudHooks`

Genera hooks de TanStack Query a partir de un `CrudApiMethods`:

```ts
const hooks = createCrudHooks({ entity: "zones", api });
// → hooks.useList(), hooks.useDetail(), hooks.useCreate(), hooks.useUpdate(), hooks.useDelete()
```

Los hooks manejan automáticamente la invalidación de caché al mutar.

## `createCrudModule`

Orquesta el módulo completo y devuelve `ListPage`, `FormPage` y `DetailPage`:

```ts
export const zonesModule = createCrudModule<Zone, ZoneDto, ZoneFormValues, ZonesQueryParams>({
  entity: "zones",
  basePath: "/zones",
  translationNamespace: "zones",
  permissions: { read: "zone:read", ... },
  api: { endpoint: "/v1/zones", mapDtoToEntity: mapZoneDtoToZone },
  table: { columns: [...] },
  form: { schema: zoneFormSchema, defaultValues: {...}, fields: [...] },
  detail: { sections: [...] },
  filters: [...],
  actions: [...],
});
```

---

# Domain Layer

Representa el modelo del negocio.

Aquí viven:

- Modelos de dominio (por ejemplo `Zone`, `City`, `Place`)
- Tipos específicos de cada Feature (`ZoneFormValues`, `ZonesQueryParams`)
- Permisos

Los modelos del dominio nunca dependen del backend.

---

# Infrastructure Layer

Implementa las dependencias externas.

Incluye:

- Axios con interceptores de error (`src/lib/http/`)
- AWS Amplify
- Storage

Si en el futuro cambia alguna tecnología, únicamente esta capa debería verse afectada.

---

# Shared Layer

Contiene elementos reutilizables por toda la aplicación.

| Carpeta      | Contenido                                                   |
| ------------ | ----------------------------------------------------------- |
| `factories/` | CRUD SDK (createCrudApi, createCrudHooks, createCrudModule) |
| `types/`     | Tipos transversales (BaseEntity, CrudModuleConfig, etc.)    |
| `utils/`     | Utilidades (notify, queryTransform, etc.)                   |
| `constants/` | Constantes globales                                         |
| `enums/`     | Enumeraciones                                               |

No contiene lógica de negocio ni componentes React.

---

# Organización por Features

Cada módulo funcional se organiza de manera independiente.

## Estructura para módulos SDK (recomendada)

```text
features/zones/
├── api/                    ← (opcional) sobreescritura de métodos HTTP
├── components/             ← Componentes exclusivos del módulo
├── hooks/                  ← (opcional) hooks adicionales
├── mappers/
│   └── zone.mapper.ts      ← ZoneDto → Zone
├── schemas/
│   └── zone-form.schema.ts ← Zod schema
├── types/
│   └── zone.ts             ← ZoneDto, Zone, ZoneFormValues, ZonesQueryParams
├── zones.module.ts         ← Configuración declarativa (createCrudModule)
├── zones.client.ts         ← Re-exportaciones "use client"
└── index.ts                ← Barrel file
```

## Estructura para módulos complejos (sin SDK)

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

Cada Feature es responsable únicamente de su propio dominio.

---

# Atomic Design

Los componentes visuales siguen Atomic Design.

```text
components/
├── ui/         ← shadcn/ui (no modificar directamente)
├── atoms/      ← Typography, Switch, Badge, etc.
├── molecules/  ← PageHeader, FormField, DataTable, PermissionGate, etc.
├── organisms/  ← Sidebar, NavBar, NotAuthorized, etc.
└── templates/
    └── crud/   ← EntityListPage, EntityFormPage, EntityDetailPage
```

Los componentes generados por shadcn/ui permanecen dentro de `components/ui`.

Los componentes propios del proyecto utilizan Atomic Design.

---

# DTOs y Modelos

La aplicación nunca utiliza directamente los contratos del backend.

El flujo siempre será:

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

Esto permite modificar el backend sin afectar la interfaz.

---

# Validación de Formularios

Los formularios utilizan **React Hook Form** + **Zod**.

El SDK implementa validación con `safeParse` (no `zodResolver`) para que los errores de Zod sean interceptados y convertidos a mensajes legibles mediante el namespace `validation` de next-intl:

```json
{
  "required": "Este campo es obligatorio",
  "minLength": "Debe contener al menos {min} caracteres",
  "maxLength": "No debe exceder {max} caracteres",
  "email": "Ingresa un correo electrónico válido",
  "invalidOption": "Selecciona una opción válida"
}
```

---

# Manejo de Errores del Servidor

Cuando el servidor retorna un error, el interceptor HTTP extrae `error.code` y el SDK muestra un mensaje amigable desde el namespace `errors.codes`:

```json
{
  "codes": {
    "CONFLICT": "Ya existe un registro con estos datos en el sistema.",
    "NOT_FOUND": "El recurso solicitado no fue encontrado.",
    "UNAUTHORIZED": "No tienes sesión activa o tus permisos expiraron.",
    "FORBIDDEN": "No tienes permiso para realizar esta acción.",
    "INTERNAL_ERROR": "Ocurrió un error interno en el servidor."
  }
}
```

---

# Composición Entre Módulos

Los módulos SDK pueden componerse entre sí mediante la propiedad `detail.sections[].renderCustom`.

Ejemplo: la página de detalle de una Ciudad muestra las Zonas asociadas:

```ts
detail: {
  sections: [
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

---

# Navegación

La navegación es dinámica.

El backend devuelve el árbol de navegación correspondiente al usuario autenticado.

La interfaz únicamente interpreta ese árbol.

No existen menús definidos manualmente.

---

# Internacionalización

Toda la aplicación es multiidioma (ES / EN).

No deben existir textos visibles escritos directamente en los componentes.

Toda cadena debe obtenerse mediante `next-intl`.

Los namespaces transversales son: `common`, `validation`, `errors`, `notifications`.

Cada Feature tiene su propio namespace (por ejemplo `zones`, `cities`, `places`).

---

# Seguridad

La autorización está basada en permisos.

Los componentes no deben conocer roles.

Únicamente preguntan si una determinada acción está permitida:

```typescript
can("zone:create");
```

El componente `PermissionGate` protege la renderización de secciones o páginas completas:

```tsx
<PermissionGate permission="zone:create" fallback={<NotAuthorized />}>
  ...
</PermissionGate>
```

---

# Filosofía

Las decisiones técnicas del proyecto priorizan:

- Escalabilidad.
- Legibilidad.
- Bajo acoplamiento.
- Alta cohesión.
- Reutilización.
- Facilidad de mantenimiento.
- Configuración declarativa sobre imperativa.
