<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Guía de Patrones y Estándares del Proyecto (AGENTS.md)

Este documento es la guía oficial del proyecto `appam-admin`. Contiene los patrones de diseño, convenciones de código y reglas arquitectónicas observadas en el repositorio. Todo código nuevo generado DEBE cumplir estrictamente con las reglas aquí documentadas.

---

# Arquitectura

El proyecto sigue una **Arquitectura en Capas Guiada por Funcionalidades (Feature-Based & Layered Architecture)** junto con una automatización declarativa mediante un **CRUD SDK**.

### Capas del Sistema (`docs/architecture.md`)

1. **Presentation (`src/components`, `src/app`)**: Interfaces de usuario (UI), layouts, páginas de App Router y plantillas generadas por el SDK. No realiza llamadas HTTP directas.
2. **Application (`src/features`, `src/hooks`, `src/providers`)**: Módulos de negocio, hooks de TanStack Query y proveedores contextuales.
3. **Domain (`src/types`, `src/config/permissions.ts`)**: Modelos del dominio, tipos de comandos/filtros y permisos de negocio. Desacoplados del backend.
4. **Infrastructure (`src/lib/http`, `src/lib/auth`)**: Implementación de Axios, interceptores de autenticación/error y AWS Amplify.
5. **Shared (`src/shared/factories`, `src/shared/types`, `src/shared/utils`)**: CRUD SDK (`createCrudModule`, `createCrudApi`, `createCrudHooks`), tipos globales y utilidades transversales.

### Módulos SDK vs. Módulos Custom

- **Módulos CRUD Estándar**: Se crean de forma declarativa con el SDK usando el CLI `node scripts/create-module.js <module-name>`.
- **Dónde aparece**: `src/features/cities/cities.module.ts`, `src/features/zones/zones.module.ts`, `src/features/places/places.module.ts`, `src/features/tenants/tenants.module.ts`.
- **Ejemplo Encontrado**:
  ```typescript
  // src/features/cities/cities.module.ts
  export const citiesModule = createCrudModule<City, CityDto, CityFormValues, CitiesQueryParams>({
    entity: "cities",
    basePath: "/cities",
    translationNamespace: "cities",
    permissions: { read: "city:read", create: "city:create", update: "city:update", delete: "city:delete" },
    api: { endpoint: "/v1/cities", mapDtoToEntity: mapCityDtoToCity },
    table: { columns: [...] },
    form: { schema: cityFormSchema, defaultValues: {...}, fields: [...] },
    detail: { sections: [...] },
    filters: [...],
    actions: [...],
  });
  ```
- **Cómo debe escribirse el código nuevo**: Para cualquier módulo CRUD estándar, ejecutar `node scripts/create-module.js <module-name>` y configurar el archivo `<module>.module.ts`. No crear carpetas ni estructuras imperativas custom a menos que sea un módulo no-CRUD complejo (como `users`).

---

# Componentes

### 1. Declaración de Componentes

- **Patrón**: Todos los componentes React se escriben como declaraciones de funciones nominadas (`export function ComponentName(...)`). Queda prohibido el uso de arrow functions para definir componentes visuales.
- **Dónde aparece**: `src/components/atoms/typography/typography.tsx`, `src/components/molecules/permission-gate/permission-gate.tsx`, `src/components/organisms/not-authorized/not-authorized.tsx`.
- **Ejemplo Encontrado**:
  ```tsx
  // src/components/atoms/typography/typography.tsx
  export function Typography({ variant = "body", as, className, ...props }: TypographyProps) {
    const Component = (as ?? defaultElementByVariant[variant]) as ElementType;
    return <Component className={cn(variantClasses[variant], className)} {...props} />;
  }
  ```
- **Cómo debe escribirse el código nuevo**: Usar siempre `export function NombreDelComponente(props: NombreProps)`.

### 2. Exportaciones y Archivos Barrel

- **Patrón**: Exportaciones nominadas directas (`export function`) y re-exportación centralizada mediante `index.ts` en carpetas por nivel (atoms, molecules, organisms).
- **Dónde aparece**: `src/components/atoms/index.ts`, `src/components/molecules/index.ts`.
- **Ejemplo Encontrado**:
  ```typescript
  // src/components/atoms/index.ts
  export * from "./typography";
  export * from "./button";
  ```

### 3. Server Components vs. Client Components ("use client")

- **Patrón**: Por defecto, todas las páginas en `src/app/` son Server Components. Si un componente utiliza hooks (`useState`, `useEffect`, `useTranslations`, `useQuery`), debe incluir la directiva `"use client";` en la primera línea.
- **Límite del SDK**: Los módulos SDK exponen sus componentes de cliente desde un archivo `<module>.client.ts`.
- **Dónde aparece**: `src/features/cities/cities.client.ts`.
- **Ejemplo Encontrado**:
  ```typescript
  // src/features/cities/cities.client.ts
  "use client";

  import { citiesModule } from "./cities.module";

  export const CitiesListPage = citiesModule.ListPage;
  export const CitiesFormPage = citiesModule.FormPage;
  export const CitiesDetailPage = citiesModule.DetailPage;
  ```

### 4. Definición de Props

- **Patrón**: Las props se definen mediante una `interface` nombrada `<ComponentName>Props`. Queda prohibido el prefijo `I`.
- **Dónde aparece**: `src/components/molecules/permission-gate/permission-gate.tsx`.
- **Ejemplo Encontrado**:
  ```typescript
  interface PermissionGateProps {
    permission?: Permission | Permission[];
    mode?: "any" | "all";
    adminOnly?: boolean;
    fallback?: ReactNode;
    children: ReactNode;
  }
  ```

---

# Hooks

- **Patrón**: Todos los hooks personalizados deben usar camelCase con el prefijo `use` (ej: `usePermission`, `useUsers`, `useCrudList`).
- **Gestión de Estado Servidor**: Se utiliza **TanStack React Query** (`useQuery`, `useMutation`). La invalidez de caché se gestiona automáticamente en los hooks creados por `createCrudHooks`.
- **Dónde aparece**: `src/shared/factories/create-crud-hooks.ts`, `src/features/users/components/users-page-content.tsx`.
- **Ejemplo Encontrado**:
  ```typescript
  // src/features/users/components/users-page-content.tsx
  const usersQuery = useQuery({
    queryKey: ["users", activeQuery],
    queryFn: () => usersApi.list(activeQuery),
    retry: 1,
  });
  ```
- **Cómo debe escribirse el código nuevo**: Para consultas servidor fuera del SDK, envolver las funciones API en `useQuery` de TanStack Query pasando `queryKey` estructurados como arrays.

---

# Tailwind

### 1. Variables de Tema Semánticas

- **Patrón**: Usar exclusivamente los tokens de color semánticos del tema de Tailwind v4 (`bg-primary`, `text-primary-foreground`, `bg-card`, `bg-muted`, `text-muted-foreground`, `border-border`, `bg-destructive`, `bg-success`, `bg-warning`).
- **PROHIBIDO**: Usar clases con colores absolutos/hardcodeados como `bg-blue-500`, `text-red-600` o `bg-gray-100`.
- **Dónde aparece**: `src/app/globals.css`, `src/components/ui/button.tsx`.
- **Ejemplo Encontrado**:
  ```tsx
  // Correcto:
  <div className="bg-card text-foreground border-border rounded-lg border p-4">
  // Incorrecto:
  <div className="bg-white text-gray-900 border-gray-200 rounded-lg border p-4">
  ```

### 2. Concatenación con `cn(...)`

- **Patrón**: Todas las combinaciones dinamicas de clases deben usar la utilidad `cn(...)` importada de `@/lib/utils`.
- **Dónde aparece**: `src/lib/utils.ts`, `src/components/atoms/typography/typography.tsx`.
- **Ejemplo Encontrado**:
  ```tsx
  import { cn } from "@/lib/utils";

  export function Typography({ variant = "body", className, ...props }: TypographyProps) {
    return <p className={cn(variantClasses[variant], className)} {...props} />;
  }
  ```

---

# Styling

- **Atomic Design**:
  - `src/components/ui/`: Primitivos base de shadcn/ui construidos sobre `@base-ui/react`. No modificar directamente con lógica de negocio.
  - `src/components/atoms/`: Componentes básicos reutilizables (`Typography`, `Button`, `Badge`, `Input`, `Select`, `Spinner`, `Skeleton`).
  - `src/components/molecules/`: Combinaciones interactivas (`PageHeader`, `FormField`, `StatusBadge`, `PermissionGate`, `EmptyState`, `ErrorState`, `FiltersPanel`).
  - `src/components/organisms/`: Estructuras complejas (`DataTable`, `FiltersPanel`, `NotAuthorized`, `DeleteDialog`).
  - `src/components/templates/`: Vistas de páginas del CRUD SDK.

---

# Formularios

- **Librerías**: **React Hook Form** + **Zod**.
- **Ubicación**: Los esquemas Zod se definen en `src/features/<module>/schemas/<entity>-form.schema.ts`.
- **Inferencia de Tipos**: El tipo `FormValues` NUNCA se escribe a mano, se infiere desde el esquema Zod usando `z.infer<typeof schema>`.
- **Manejo de Errores e i18n**: En el SDK de CRUD, **NO se usa `zodResolver`**. El SDK ejecuta `safeParse` e intercepta las reglas de validaciones para traducirlas dinámicamente mediante `next-intl` bajo el namespace `validation`.
- **Dónde aparece**: `src/features/cities/schemas/city-form.schema.ts`, `src/features/cities/types/city.ts`.
- **Ejemplo Encontrado**:
  ```typescript
  // src/features/cities/schemas/city-form.schema.ts
  import { z } from "zod";

  export const cityFormSchema = z.object({
    name: z.string().trim().min(2).max(120),
    postalCode: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
  });

  // src/features/cities/types/city.ts
  export type CityFormValues = z.infer<typeof cityFormSchema>;
  ```

---

# Internacionalización

- **Librería**: **`next-intl`**.
- **Regla Estricta**: **CERO cadenas de texto hardcodeadas** en la interfaz de usuario. Todo texto debe ser obtenido mediante `useTranslations` (Client Components) o `getTranslations` (Server Components).
- **Namespaces Transversales**: `common`, `validation`, `errors`, `notifications`, `auth`, `navigation`, `dashboard`.
- **Namespaces por Módulo**: Cada feature posee su propio archivo JSON de traducciones en `src/i18n/messages/es/<module>.json` y `src/i18n/messages/en/<module>.json`, registrado en `src/i18n/messages/es/index.ts`.
- **Dónde aparece**: `src/features/users/components/users-page-content.tsx`, `src/i18n/messages/es/cities.json`.
- **Ejemplo Encontrado**:
  ```tsx
  const t = useTranslations("cities");
  return <Typography variant="h1">{t("title")}</Typography>;
  ```

---

# Routing

- **Next.js App Router**: Estructura organizada por Route Groups con soporte de idiomas `[locale]`.
- **Estructura Estándar de Rutas**:
  - `src/app/[locale]/(app)/(dashboard)/<module>/page.tsx` (Listado)
  - `src/app/[locale]/(app)/(dashboard)/<module>/new/page.tsx` (Creación)
  - `src/app/[locale]/(app)/(dashboard)/<module>/[id]/page.tsx` (Detalle)
  - `src/app/[locale]/(app)/(dashboard)/<module>/[id]/edit/page.tsx` (Edición)
- **Params y SearchParams Asíncronos (Next.js 15+/16+)**: En las páginas del App Router, `params` y `searchParams` son Promises y DEBEN ser esperados con `await`.
- **Protección por Permisos**: Todas las páginas envuelven la llamada al SDK con `<PermissionGate>`.
- **Dónde aparece**: `src/app/[locale]/(app)/(dashboard)/cities/page.tsx`.
- **Ejemplo Encontrado**:
  ```tsx
  // src/app/[locale]/(app)/(dashboard)/cities/page.tsx
  import { CitiesListPage, citiesModule } from "@/features/cities";
  import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
  import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

  interface CitiesPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
  }

  export default async function CitiesPage({ searchParams }: CitiesPageProps) {
    const params = await searchParams;

    return (
      <PermissionGate permission={citiesModule.permissions.read} fallback={<NotAuthorized />}>
        <CitiesListPage searchParams={params} />
      </PermissionGate>
    );
  }
  ```

---

# Tipado

- **Modo Estricto**: `strict: true` en `tsconfig.json`.
- **Prohibición de `any`**: El tipo `any` está **STRICTAMENTE PROHIBIDO**. Se debe usar `unknown` o genéricos tipados si el tipo es dinámico.
- **Interfaces**: Sin prefijo `I` (ej: `City`, `User`, `PermissionGateProps`).
- **Union Types sobre Enums**: Se prefieren los Union Types de literales sobre las enumeraciones TypeScript.
- **Separación DTO vs. Domain Model**:
  - **DTO** (`CityDto`): Representa exactamente la respuesta JSON del servidor backend.
  - **Domain Model** (`City`): Representa la entidad usada internamente por la interfaz frontend.
  - **Mapper** (`mapCityDtoToCity`): Transforma DTOs a Domain Models. La UI NUNCA consume DTOs directamente.
- **Dónde aparece**: `src/features/cities/types/city.ts`, `src/features/cities/mappers/city.mapper.ts`.
- **Ejemplo Encontrado**:
  ```typescript
  // src/features/cities/mappers/city.mapper.ts
  import type { City, CityDto } from "../types/city";

  export function mapCityDtoToCity(dto: CityDto): City {
    return {
      id: dto.id,
      name: dto.name,
      postalCode: dto.postalCode,
      status: dto.status,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }
  ```

---

# API

- **Axios Centralizado**: Toda comunicación HTTP utiliza Axios mediante `axiosClient` (`src/lib/http/axios-client.ts`). Está **PROHIBIDO** usar `fetch()` directamente en los componentes.
- **Desenvoltorio de Respuestas (`unwrapResponse`)**: El cliente HTTP desenvuelve las respuestas backend formateadas como `ApiResponse<T>` devueltas por la API REST.
- **Traducción de Errores del Servidor**: Los errores HTTP capturan el `error.code` retornado por la API backend y lo muestran traducido al usuario mediante el namespace `errors.codes` de `next-intl`.

---

# Convenciones

### Nombres de Archivos y Directorios

- **Archivos**: `kebab-case` (`city-form.schema.ts`, `city.mapper.ts`, `status-badge.tsx`).
- **Componentes React**: `PascalCase` (`StatusBadge`, `PermissionGate`).
- **Hooks**: `camelCase` empezando con `use` (`usePermission`).
- **Funciones y Variables**: `camelCase`.
- **Tipos e Interfaces**: `PascalCase`.

### Orden de Imports (Automatizado por Prettier)

Configurado en `.prettierrc` mediante `@ianvs/prettier-plugin-sort-imports`. No reordenar manualmente:

1. `react`
2. `next` y dependencias de terceros
3. `@/config`
4. `@/providers`
5. `@/features`
6. `@/components`
7. `@/hooks`
8. `@/services`
9. `@/lib`
10. `@/utils`
11. `@/` (demás alias)
12. Imports relativos (`[./]`)

---

# Buenas Prácticas del Proyecto

1. **Configuración Declarativa sobre Imperativa**: Todo módulo CRUD debe configurarse declarativamente a través de `createCrudModule`.
2. **Autorización Basada en Permisos**: Usar `can("permiso:accion")` o el componente `<PermissionGate permission="...">`. No evaluar roles directamente.
3. **Gestión Centralizada de Iconos**: Importar y registrar iconos desde `src/config/icons.config.ts`.
4. **Scaffold Automatizado**: Generar la estructura base de cualquier módulo nuevo ejecutando `node scripts/create-module.js <module-name>`.

---

# Patrones a Reutilizar

- **CRUD SDK Factories**: `createCrudModule`, `createCrudApi`, `createCrudHooks` (`src/shared/factories/`).
- **Componentes Atómicos y Moleculares**: `Typography`, `Button`, `Badge`, `StatusBadge`, `PermissionGate`, `EmptyState`, `ErrorState`, `FiltersPanel`, `DataTable`, `NotAuthorized`.
- **Gestor de Notificaciones Toast**: Utilidad `notify` (`src/shared/utils/notify.ts`) basada en `sonner`.
- **Registro Centralizado de Iconos**: Objeto `Icons` en `src/config/icons.config.ts`.

---

# Patrones Prohibidos

- ❌ **NO usar `any`**: Usar `unknown` o tipos genéricos.
- ❌ **NO usar Arrow Functions para componentes React**: Usar `export function ComponentName(...)`.
- ❌ **NO escribir textos literales en JSX**: Usar siempre `next-intl`.
- ❌ **NO usar colores directos de Tailwind**: (ej. `bg-blue-500`, `text-red-600`), usar las variables semánticas del tema (`bg-primary`, `text-foreground`).
- ❌ **NO usar `fetch()` directamente en componentes**: Pasar a través de Axios y TanStack Query.
- ❌ **NO consumir DTOs en la UI**: Mapear siempre a Domain Models mediante Mappers.
- ❌ **NO usar el prefijo `I` en interfaces**: Usar `User`, no `IUser`.
- ❌ **NO usar `zodResolver` en módulos SDK**: El SDK maneja `safeParse` e internacionalización internamente.
- ❌ **NO modificar primitivos de `src/components/ui/` para agregar lógica de negocio**: Mantenerlos como wrappers puros de `shadcn/ui` y `@base-ui/react`.

---

# Reutilizar Antes de Crear

Antes de crear un nuevo componente o utilidad, verificar obligatoriamente si ya existe en esta lista:

1. **`Typography`** (`src/components/atoms/typography`): Para renderizar títulos (`h1`, `h2`, `h3`), subtítulos (`subtitle`), texto de cuerpo (`body`) o leyendas (`caption`).
2. **`StatusBadge`** (`src/components/molecules/status-badge`): Para mostrar badges de estado (`ACTIVE`/`INACTIVE`) con indicador circular.
3. **`PermissionGate`** (`src/components/molecules/permission-gate`): Para proteger vistas o botones según permisos del usuario.
4. **`EmptyState`** (`src/components/molecules/empty-state`): Para estados vacíos en tablas o contenedores.
5. **`ErrorState`** (`src/components/molecules/error-state`): Para mostrar fallos de carga o errores de comunicación con el backend.
6. **`NotAuthorized`** (`src/components/organisms/not-authorized`): Como pantalla fallback cuando se deniega el acceso a un módulo.
7. **`FiltersPanel`** (`src/components/organisms/filters-panel`): Para envolver formularios de búsqueda y filtrado.
8. **`DataTable`** (`src/components/organisms/data-table`): Para mostrar tablas paginadas, ordenables y interactivas.
9. **`Icons`** (`src/config/icons.config.ts`): Registro central de iconos Lucide.
10. **`createCrudModule`** (`src/shared/factories/create-crud-module.ts`): Para crear cualquier módulo CRUD completo con 1 sola declaración.

---

# Patrón No Concluyente

- **Uso de Axios Wrappers directos fuera del SDK**: En `src/features/users/api/users.api.ts`, existen métodos API creados manualmente sin usar `createCrudApi`. Esto se clasifica como _patrón no concluyente / excepción legada_ para componentes complejos no migrados al SDK. Todo módulo nuevo debe utilizar `createCrudApi` / `createCrudModule`.

---

# Checklist Antes de Generar Código

Antes de dar por completado o generar cualquier nuevo código en este proyecto, verificar:

- [ ] ¿Es un nuevo módulo CRUD? -> Generarlo con `node scripts/create-module.js <module-name>`.
- [ ] ¿Todos los nombres de archivo usan `kebab-case`?
- [ ] ¿Los componentes React se declaran con `export function ComponentName(...)`?
- [ ] ¿Las props están tipadas con una `interface ComponentNameProps` (sin prefijo `I`)?
- [ ] ¿El archivo tiene `"use client";` únicamente si usa hooks, estado o eventos de cliente?
- [ ] Si es una página (`page.tsx`), ¿se trataron `params` y `searchParams` como Promises esperadas con `await`?
- [ ] ¿La página está envuelta en un `<PermissionGate>` declarativo?
- [ ] ¿Se reutilizaron los componentes atómicos y moleculares (`Typography`, `StatusBadge`, `PermissionGate`, `Icons`)?
- [ ] ¿Se evitó por completo el uso del tipo `any`?
- [ ] ¿Se utilizaron clases semánticas del tema Tailwind (`bg-primary`, `text-muted-foreground`, `border-border`) sin usar colores hardcodeados?
- [ ] ¿Todos los textos visibles están internacionalizados mediante `next-intl`?
- [ ] ¿Los imports siguen el orden automático configurado en Prettier?
