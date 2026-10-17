# ADR-012 - CRUD SDK Declarativo

**Estado:** Aceptado

**Fecha:** 2026-07-27

---

# Contexto

A medida que APPAM incorpora nuevos módulos funcionales (ciudades, zonas, lugares, tenants, etc.), se evidenció que cada módulo CRUD requería escribir la misma estructura repetitiva:

- API methods (list, getById, create, update, remove)
- TanStack Query hooks (useList, useDetail, useCreate, useUpdate, useDelete)
- Componentes de página (ListPage, FormPage, DetailPage)
- Lógica de formularios (React Hook Form + Zod)
- Manejo de estados (loading, empty, error)
- Invalidación de caché
- Navegación post-submit
- Manejo de errores del servidor

Este boilerplate representaba una carga significativa de desarrollo y un riesgo de inconsistencia entre módulos.

---

# Decisión

Se implementa un **CRUD SDK Declarativo** compuesto por tres factories ubicadas en `src/shared/factories/`:

## `createCrudApi`

Genera automáticamente los métodos HTTP para un endpoint REST dado:

```ts
const api = createCrudApi({
  endpoint: "/v1/zones",
  mapDtoToEntity: mapZoneDtoToZone,
  defaultParams: { include: "city" },
});
```

Soporta sobreescritura de cualquier método individual para lógica personalizada.

## `createCrudHooks`

Genera hooks de TanStack Query a partir de la API generada:

```ts
const hooks = createCrudHooks({ entity: "zones", api });
// → useList, useDetail, useCreate, useUpdate, useDelete
```

Los hooks manejan automáticamente la invalidación de caché al crear, actualizar o eliminar.

## `createCrudModule`

Orquesta el módulo completo y expone `ListPage`, `FormPage` y `DetailPage`:

```ts
export const zonesModule = createCrudModule<Zone, ZoneDto, ZoneFormValues, ZonesQueryParams>({
  entity: "zones",
  basePath: "/zones",
  translationNamespace: "zones",
  permissions: { ... },
  api: { endpoint: "/v1/zones", mapDtoToEntity: ... },
  table: { columns: [...] },
  form: { schema, defaultValues, fields: [...] },
  detail: { sections: [...] },
  filters: [...],
  actions: [...],
});
```

## Templates Genéricos

Los templates de presentación viven en `src/components/templates/crud/`:

- `EntityListPage` — Tabla con filtros, paginación, ordenamiento y acciones.
- `EntityFormPage` — Formulario con validación Zod (`safeParse`) y manejo de errores del servidor.
- `EntityDetailPage` — Vista de detalle con secciones configurables y soporte de composición.

## Patrón de archivos por módulo

```text
{feature}.module.ts   ← Configuración declarativa (sin "use client")
{feature}.client.ts   ← Re-exportaciones con "use client"
```

Esta separación permite que el archivo `*.module.ts` sea importado desde Server Components (páginas del App Router) sin romper la frontera cliente/servidor.

---

# Validación de Formularios

Se optó por usar **`safeParse`** en lugar de `zodResolver` de `@hookform/resolvers`:

```ts
const parsed = config.form.schema.safeParse(values);
if (!parsed.success) {
  parsed.error.issues.forEach((issue) => {
    form.setError(fieldPath, { message: validationT("required") });
  });
  return;
}
```

Los mensajes de error de Zod se interceptan y se traducen mediante el namespace `validation` de `next-intl`, garantizando que siempre sean legibles en el idioma del usuario.

---

# Manejo de Errores del Servidor

El SDK captura el `error.code` del interceptor HTTP y lo traduce mediante `errors.codes.{code}`:

```ts
const codeKey = `codes.${apiErr.code}`;
if (errorsT.has(codeKey)) {
  displayMessage = errorsT(codeKey);
}
notify.error(displayMessage);
```

---

# Composición Entre Módulos

Los módulos pueden componerse entre sí mediante `detail.sections[].renderCustom`:

```ts
renderCustom: (city) =>
  React.createElement(zonesModule.ListPage, {
    searchParams: { cityId: city.id },
    hideHeader: true,
    omitColumns: ["city"],
  }),
```

---

# Consecuencias

## Positivas

- Reducción drástica de código boilerplate por módulo.
- Consistencia garantizada entre todos los módulos CRUD.
- Los módulos nuevos se crean en minutos siguiendo la guía.
- Un solo punto de mejora impacta todos los módulos.
- Tipado genérico estricto en todo el SDK.
- Internacionalización y manejo de errores centralizados.

## Negativas

- Curva de aprendizaje para entender la configuración declarativa.
- Módulos con flujos muy específicos deben sobreescribir partes del SDK o usar módulos complejos.
- Los templates genéricos deben mantenerse cuidadosamente para no romper todos los módulos.

---

# Alternativas consideradas

## Generación de código (scaffolding)

Herramientas como Plop.js o scripts de generación. Descartado porque genera código duplicado difícil de mantener y no garantiza consistencia futura.

## Módulos independientes por Feature

Cada Feature implementa su propia lógica completa. Descartado por el alto costo de mantenimiento y la inconsistencia observada entre módulos.

---

# Referencias

- `src/shared/factories/create-crud-api.ts`
- `src/shared/factories/create-crud-hooks.ts`
- `src/shared/factories/create-crud-module.ts`
- `src/shared/types/crud-module.types.ts`
- `src/components/templates/crud/`
- `docs/guides/crud-sdk-guide.md`
