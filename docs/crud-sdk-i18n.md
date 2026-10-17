# Guía de Convenciones de Internacionalización (i18n) para Módulos CRUD SDK

Esta guía establece las convenciones de traducción utilizadas por los módulos CRUD del SDK en **APPAM Admin**. Todos los módulos deben definir un archivo JSON en `src/i18n/messages/{locale}/{namespace}.json` siguiendo esta estructura estandarizada.

---

## 📂 Estructura del Archivo de Mensajes (`{namespace}.json`)

Cada módulo (por ejemplo `zones.json`, `places.json`, `cities.json`) debe incluir la siguiente jerarquía de claves:

```json
{
  "title": "Zonas",
  "subtitle": "Gestione las zonas de predicación registradas en el sistema.",
  "new": {
    "title": "Crear Zona",
    "subtitle": "Diligencie los campos requeridos para crear una nueva zona."
  },
  "edit": {
    "title": "Editar Zona",
    "subtitle": "Actualice la información de la zona seleccionada."
  },
  "detail": {
    "title": "Detalle de la Zona",
    "subtitle": "Información detallada de la zona registrada.",
    "generalInfo": "Información General",
    "name": "Nombre",
    "city": "Ciudad",
    "status": "Estado"
  },
  "table": {
    "columns": {
      "name": "Nombre",
      "city": "Ciudad",
      "status": "Estado",
      "createdAt": "Fecha de Creación",
      "updatedAt": "Última Actualización"
    }
  },
  "form": {
    "nameLabel": "Nombre de la zona",
    "namePlaceholder": "Ej: Zona Norte",
    "cityIdLabel": "Ciudad",
    "cityIdPlaceholder": "Seleccione una ciudad...",
    "statusLabel": "Estado",
    "statusActive": "Activo",
    "statusInactive": "Inactivo"
  },
  "filters": {
    "searchPlaceholder": "Buscar por nombre...",
    "statusLabel": "Estado",
    "statusAll": "Todos los estados",
    "statusActive": "Activo",
    "statusInactive": "Inactivo",
    "cityIdLabel": "Ciudad",
    "cityIdAll": "Todas las ciudades"
  },
  "actions": {
    "create": "Nueva Zona",
    "edit": "Editar",
    "delete": "Eliminar",
    "view": "Ver detalle",
    "createTitle": "Crear Zona",
    "createDescription": "Diligencie los campos requeridos para crear una nueva zona.",
    "editTitle": "Editar Zona",
    "editDescription": "Actualice la información de la zona seleccionada.",
    "deleteTitle": "¿Eliminar Zona?",
    "deleteDescription": "Esta acción no se puede deshacer. La zona será eliminada permanentemente del sistema."
  },
  "states": {
    "loading": "Cargando datos...",
    "emptyTitle": "No hay zonas registradas",
    "emptyDescription": "Cree su primera zona haciendo clic en el botón superior.",
    "errorTitle": "Error al cargar las zonas",
    "errorDescription": "Ocurrió un problema al comunicarse con el servidor. Intente nuevamente."
  }
}
```

---

## 🔑 Convenciones de Claves

### 1. Cabeceras y Páginas

| Clave                              | Usado en                         |
| ---------------------------------- | -------------------------------- |
| `title`                            | `PageHeader` del listado         |
| `subtitle`                         | `PageHeader` del listado         |
| `new.title` / `new.subtitle`       | Página de creación (`/new`)      |
| `edit.title` / `edit.subtitle`     | Página de edición (`/[id]/edit`) |
| `detail.title` / `detail.subtitle` | Página de detalle (`/[id]`)      |

### 2. Formulario (`form`)

| Patrón de clave            | Descripción                                             |
| -------------------------- | ------------------------------------------------------- |
| `{fieldName}Label`         | Label del campo (ej: `nameLabel`, `cityIdLabel`)        |
| `{fieldName}Placeholder`   | Placeholder del campo (ej: `namePlaceholder`)           |
| `{fieldName}{OptionValue}` | Opción de select (ej: `statusActive`, `statusInactive`) |

### 3. Filtros (`filters`)

| Patrón de clave             | Descripción                                   |
| --------------------------- | --------------------------------------------- |
| `searchPlaceholder`         | Placeholder del input de búsqueda             |
| `{filterName}Label`         | Label del filtro                              |
| `{filterName}All`           | Opción "todos" (ej: `statusAll`, `cityIdAll`) |
| `{filterName}{OptionValue}` | Opción específica (ej: `statusActive`)        |

### 4. Tabla y Columnas (`table.columns`)

Cada `id` de columna definida en `config.table.columns` hace match con `table.columns.{columnId}`.

### 5. Acciones y Diálogos (`actions`)

| Clave                               | Descripción                               |
| ----------------------------------- | ----------------------------------------- |
| `create`                            | Texto del botón "Nueva Entidad"           |
| `edit` / `delete` / `view`          | Textos de acciones en la tabla            |
| `createTitle` / `createDescription` | Cabecera de la página de creación         |
| `editTitle` / `editDescription`     | Cabecera de la página de edición          |
| `deleteTitle` / `deleteDescription` | Contenido del `ConfirmDialog` al eliminar |

### 6. Estados de Carga y Error (`states`)

| Clave                                           | Descripción                 |
| ----------------------------------------------- | --------------------------- |
| `states.loading`                                | Mensaje durante `isPending` |
| `states.emptyTitle` / `states.emptyDescription` | Sin registros en la tabla   |
| `states.errorTitle` / `states.errorDescription` | Fallo de red o error 500    |

---

## 🛡️ Namespaces Transversales

Además del namespace del módulo, el SDK utiliza dos namespaces globales:

### `validation` — Mensajes de validación de formularios

El SDK intercepta los errores de Zod con `safeParse` y los convierte a mensajes del namespace `validation`:

```json
{
  "required": "Este campo es obligatorio",
  "email": "Ingresa un correo electrónico válido",
  "minLength": "Debe contener al menos {min} caracteres",
  "maxLength": "No debe exceder {max} caracteres",
  "invalidFormat": "El formato es inválido",
  "invalidOption": "Selecciona una opción válida"
}
```

**Mapeo Zod → `validation`:**

| Código Zod               | Clave de traducción                        |
| ------------------------ | ------------------------------------------ |
| `too_small` (min = 1)    | `validation.required`                      |
| `too_small` (min > 1)    | `validation.minLength` (con param `{min}`) |
| `too_big`                | `validation.maxLength` (con param `{max}`) |
| `invalid_string` / email | `validation.email`                         |
| `invalid_enum_value`     | `validation.invalidOption`                 |

> **Importante:** No usar `zodResolver` de `@hookform/resolvers/zod` en módulos del SDK. El SDK maneja la validación internamente para garantizar la traducción de mensajes.

### `errors` — Errores del servidor

Cuando el servidor retorna un error con body:

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Ya existe una zona con el nombre..."
  }
}
```

El SDK extrae `error.code` y busca la traducción en `errors.codes.{code}`:

```json
{
  "generic": "Ocurrió un error inesperado. Inténtalo de nuevo más tarde.",
  "codes": {
    "CONFLICT": "Ya existe un registro con estos datos en el sistema.",
    "VALIDATION_ERROR": "Los datos ingresados son inválidos. Revisa el formulario.",
    "NOT_FOUND": "El recurso solicitado no fue encontrado.",
    "UNAUTHORIZED": "No tienes sesión activa o tus permisos expiraron.",
    "FORBIDDEN": "No tienes permiso para realizar esta acción.",
    "INTERNAL_ERROR": "Ocurrió un error interno en el servidor."
  }
}
```

Si no existe traducción para el código, se muestra el `error.message` del servidor. Como último recurso, se muestra `errors.generic`.

---

## 🛠️ Integración con `createCrudModule`

En la configuración del módulo (`zones.module.ts`), se especifica únicamente el `translationNamespace`:

```ts
export const zonesModule = createCrudModule<Zone, ZoneDto, ZoneFormValues, ZonesQueryParams>({
  entity: "zones",
  basePath: "/zones",
  translationNamespace: "zones",
  ...
});
```

El SDK mapea automáticamente este `translationNamespace` hacia los componentes de plantillas (`EntityListPage`, `EntityFormPage`, `EntityDetailPage`).

---

## 📋 Checklist i18n para un nuevo módulo

- [ ] Crear `src/i18n/messages/es/{namespace}.json` con todas las claves requeridas
- [ ] Crear `src/i18n/messages/en/{namespace}.json` con la traducción en inglés
- [ ] Registrar el namespace en `src/i18n/messages/es/index.ts`
- [ ] Registrar el namespace en `src/i18n/messages/en/index.ts`
- [ ] Verificar que `validation.json` contiene todas las claves necesarias (ya existe, no duplicar)
- [ ] Verificar que `errors.json` contiene todas los códigos esperados del servidor
