# Permission Management Guide

## APPAM - Sistema Web de Administración

Versión: **1.0**

Última actualización: **2026-07-09**

---

# Objetivo

Este documento define la estrategia de manejo de permisos dentro de APPAM.

El objetivo es establecer una forma consistente de:

- Obtener permisos del usuario.
- Administrar autorización en frontend.
- Construir navegación dinámica.
- Proteger rutas.
- Controlar acciones dentro de la interfaz.

---

# Principio Fundamental

La seguridad pertenece al backend.

El frontend únicamente administra experiencia de usuario.

Flujo correcto:

```text
Usuario
↓
Frontend solicita acción
↓
Backend valida permiso
↓
Backend responde
```

Nunca:

```text
Frontend decide si una acción es permitida
↓
Backend confía
```

---

# Modelo de Autorización

APPAM utiliza un modelo basado en permisos.

Ejemplo:

```text id="z2l3iq"
user:create

user:update

user:delete

city:create

enrollment:confirm-contact
```

Los permisos representan capacidades.

---

# Roles vs Permisos

Los roles son agrupaciones de permisos.

Ejemplo:

```text id="5kx6d4"
Administrador
    ├── user:create
    ├── user:update
    ├── user:delete


Coordinador
    ├── enrollment:read
    ├── enrollment:update
```

El frontend no debe tomar decisiones basadas en roles.

Incorrecto:

```ts
if(user.role === "ADMIN")
```

Correcto:

```ts
can("user:delete");
```

---

# Fuente de Permisos

El backend entrega:

```json
{
  "isAdmin": false,
  "tree": []
}
```

Este árbol representa:

- Menú disponible.
- Rutas visibles.
- Permisos asociados.

---

# Permission Tree

Ejemplo:

```json
{
  "label": "Usuarios",
  "icon": "users",
  "route": "/users",
  "permissions": ["user:create", "user:update"],
  "children": []
}
```

---

# Responsabilidades del Permission Tree

El árbol permite construir:

- Sidebar.
- Menús secundarios.
- Breadcrumbs.
- Navegación.
- Acciones disponibles.

---

# Estructura Interna

El frontend debe transformar la respuesta del backend a un modelo interno.

Ejemplo:

```text
Backend DTO
↓
Permission Mapper
↓
Permission Domain Model
↓
Application State
```

---

# Domain Model

Ejemplo:

```ts
interface PermissionNode {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  permissions: string[];
  children: PermissionNode[];
}
```

---

# Permission Provider

APPAM debe mantener los permisos en un contexto global.

Ubicación recomendada:

```text
src/providers/
    PermissionProvider.tsx
```

Responsabilidades:

- Guardar árbol de permisos.
- Exponer funciones de consulta.
- Proveer información al sistema.

---

# Permission API

El Provider debe exponer:

```ts
interface PermissionContext {
  permissions: string[];
  tree: PermissionNode[];
  isAdmin: boolean;
  can(permission: string): boolean;
}
```

---

# Hook usePermission

El acceso desde componentes debe realizarse mediante hook.

Ejemplo:

```ts
const { can } = usePermission();

can("user:create");
```

---

# Función can()

La función `can()` es la única forma recomendada de consultar permisos.

Ejemplo:

```ts
if (can("user:delete")) {
  showDeleteButton();
}
```

---

# Admin Override

El backend puede indicar:

```json
{
  "isAdmin": true
}
```

En ese caso:

```ts
can(anyPermission);
```

debe retornar:

```ts
true;
```

La lógica debe estar centralizada.

Los componentes no deben evaluar:

```ts
isAdmin === true;
```

---

# Protección de Componentes

Para acciones individuales:

Ejemplo:

```tsx
<PermissionGuard permission="user:create">
  <CreateUserButton />
</PermissionGuard>
```

---

# PermissionGuard

Responsabilidades:

- Consultar permiso.
- Renderizar children si está permitido.
- No ejecutar lógica adicional.

Ejemplo:

```tsx
function PermissionGuard({ permission, children }) {
  const { can } = usePermission();

  if (!can(permission)) {
    return null;
  }

  return children;
}
```

---

# Protección de Rutas

Las rutas deben protegerse mediante un Route Guard.

Ejemplo:

```text
/users/new
```

requiere:

```text
user:create
```

---

# Flujo

```text
Usuario entra a ruta
↓
Route Guard
↓
Consulta permiso
↓
Permitido
↓
Render página


No permitido
↓
Redirect / Forbidden
```

---

# Middleware vs Client Guard

APPAM puede utilizar middleware para validaciones generales:

- Locale.
- Sesión.
- Existencia de token.

Pero la autorización basada en permisos específicos debe resolverse con la información cargada del usuario.

---

# Sidebar Dinámico

El Sidebar debe construirse desde:

```json
tree
```

No desde una configuración fija.

Incorrecto:

```ts
const menu = [
  {
    label: "Usuarios",
  },
];
```

---

Correcto:

```ts
const menu = permissionTree;
```

---

# Icon Mapping

El backend envía:

```json
{
  "icon": "users"
}
```

El frontend mantiene el mapa visual.

Ejemplo:

```ts
const icons = {
  users: Users,
  dashboard: LayoutDashboard,
  earth: Earth,
};
```

---

# Por qué el backend no envía componentes

El backend conoce:

- permisos.
- estructura funcional.

El frontend conoce:

- librería visual.
- componentes.
- estilos.

Mantener ambas responsabilidades separadas.

---

# Permisos en Componentes

Ejemplo:

```tsx
<UserActions>
  <PermissionGuard permission="user:update">
    <EditButton />
  </PermissionGuard>

  <PermissionGuard permission="user:delete">
    <DeleteButton />
  </PermissionGuard>
</UserActions>
```

---

# Permisos en Features

Una Feature debe documentar sus permisos.

Ejemplo:

```text
features/users/README.md
```

Contenido:

```text
Permisos:

user:read
user:create
user:update
user:delete
user:assign-role
```

---

# Permisos en Formularios

Antes de mostrar acciones:

Ejemplo:

```tsx
const canEdit = can("user:update");
```

El formulario debe adaptarse.

---

# Estados sin Permiso

Cuando un usuario no tiene acceso:

Opciones:

- Ocultar acción.
- Mostrar estado informativo.
- Redireccionar.

Depende del contexto.

---

# Nunca hacer

## Ocultar únicamente

Incorrecto:

```tsx
{
  can("delete") && <button>Eliminar</button>;
}
```

como única protección.

El backend debe validar.

---

## Hardcodear roles

Incorrecto:

```tsx
role === "ADMIN";
```

---

## Duplicar permisos

Incorrecto:

```ts
"user:create";

"create-user";

"create_user";
```

Debe existir una única nomenclatura.

---

# Convención de Permisos

Formato recomendado:

```text
<resource>:<action>
```

Ejemplos:

```text
user:create

user:update

user:delete

city:create

enrollment:update
```

---

# Checklist de Nueva Feature

Antes de implementar:

- Definir permisos requeridos.
- Documentarlos.
- Crear integración backend.
- Mapear acciones UI.
- Proteger rutas.
- Proteger botones.
- Probar usuario sin permisos.
- Probar administrador.

---

# Objetivo Final

El sistema de permisos de APPAM debe permitir que:

- El backend controle seguridad.
- El frontend adapte la experiencia.
- La navegación sea dinámica.
- Los componentes sean reutilizables.
- Los módulos evolucionen sin depender de roles específicos.

Los permisos representan capacidades del sistema, no detalles de implementación.
