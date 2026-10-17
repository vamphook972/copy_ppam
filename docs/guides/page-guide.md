# Page Development Guide

## APPAM - Sistema Web de Administración

Versión: **1.0**

Última actualización: **2026-07-09**

---

# Objetivo

Este documento define las reglas para crear páginas dentro de APPAM utilizando Next.js App Router.

Una página es responsable de:

- Representar una ruta.
- Componer componentes.
- Definir metadata.
- Controlar la estructura visual.
- Coordinar el acceso a una Feature.

Una página no debe contener lógica compleja de negocio.

---

# Filosofía

Una página no es una Feature.

Una página es la entrada visual hacia una Feature.

La responsabilidad principal es:

```text
Route
↓
Page
↓
Feature Components
↓
Business Logic
```

---

# Estructura del App Router

APPAM utiliza:

```text
src/app/[locale]/
```

para soportar internacionalización.

Estructura base:

```text
src/app/

├── [locale]/
│
├── layout.tsx
├── page.tsx
│
├── dashboard/
│   └── page.tsx
│
├── users/
│   ├── page.tsx
│   ├── new/
│   │   └── page.tsx
│   │
│   └── [id]/
│       ├── page.tsx
│       └── edit/
│           └── page.tsx
```

---

# Responsabilidades de layout.tsx

Los layouts contienen elementos persistentes.

Ejemplos:

- Providers.
- Theme.
- Internacionalización.
- Sidebar.
- Header.
- Navegación.

Ejemplo:

```tsx
<RootLayout>
  <ThemeProvider>
    <AuthProvider>{children}</AuthProvider>
  </ThemeProvider>
</RootLayout>
```

---

# Responsabilidades de page.tsx

Una página debe:

- Obtener parámetros de ruta.
- Componer componentes.
- Pasar propiedades iniciales.
- Definir metadata cuando aplique.

Ejemplo:

```tsx
export default function UsersPage() {
  return <UsersFeature />;
}
```

---

# Server Components vs Client Components

APPAM utilizará Server Components por defecto.

Una página debe ser Server Component salvo que necesite:

- Estado local.
- Eventos del navegador.
- Hooks React.
- APIs del cliente.

---

# Server Component

Ejemplo:

```tsx
export default async function Page() {
  const data = await getData();

  return <Component data={data} />;
}
```

---

# Client Component

Debe declararse explícitamente:

```tsx
"use client";
```

Utilizar solamente cuando sea necesario.

Ejemplos:

- Formularios.
- Tablas interactivas.
- Modales.
- Dropdowns.
- Drag & Drop.

---

# Regla General

La página normalmente será Server Component.

Los componentes interactivos serán Client Components.

Ejemplo:

```text
Page (Server)
    |
    ├── Header
    |
    ├── UsersTable (Client)
    |
    └── UserFilters (Client)
```

---

# Integración con Features

Una página debe consumir una Feature mediante su API pública.

Correcto:

```tsx
import { UsersPage } from "@/features/users";
```

---

Incorrecto:

```tsx
import { UserTable } from "@/features/users/components/user-table";
```

---

# Feature Container Pattern

Cada Feature puede exponer un componente de entrada.

Ejemplo:

```text
features/users/
  ├── UsersPage.tsx
  ├── components/
  ├── hooks/
  ├── services/
  └── index.ts
```

La página:

```tsx
import { UsersPage } from "@/features/users";

export default function Page() {
  return <UsersPage />;
}
```

---

# Rutas CRUD

La estructura recomendada:

```text
/users
  Listado

/users/new
  Crear

/users/[id]
  Detalle

/users/[id]/edit
  Editar
```

---

# Cuándo Crear una Ruta Nueva

Crear una ruta cuando:

- Representa una acción importante.
- Necesita navegación.
- Tiene contenido propio.
- Puede ser compartida.
- Tiene estado independiente.

---

# Evitar Rutas Artificiales

Evitar:

```text
/users?action=create
```

para flujos complejos.

Preferir:

```text
/users/new
```

---

# Metadata

Cada página debe definir metadata cuando sea necesario.

Ejemplo:

```tsx
export const metadata = {
  title: "Usuarios",
};
```

Para páginas dinámicas:

```tsx
export async function generateMetadata() {}
```

---

# Loading States

Las páginas deben considerar estados de carga.

Next.js permite:

```text
loading.tsx
```

Ejemplo:

```text
users/
  ├── page.tsx
  └── loading.tsx
```

Debe utilizar componentes Skeleton.

---

# Error Handling

Cada segmento puede definir:

```text
error.tsx
```

Ejemplo:

```text
users/
  ├── page.tsx
  ├── loading.tsx
  └── error.tsx
```

Los errores deben mostrarse mediante componentes visuales consistentes.

---

# Not Found

Para recursos inexistentes:

```tsx
notFound();
```

Ejemplo:

Usuario eliminado:

```text
/users/123
```

Resultado:

```text
Usuario no encontrado
```

---

# Protección de Rutas

La autorización debe realizarse en dos niveles.

---

## Backend

Siempre es la fuente de verdad.

---

## Frontend

Controla experiencia:

- Ocultar opciones.
- Redireccionar.
- Mostrar mensajes.

---

Ejemplo:

```tsx
<PermissionGuard permission="user:update">
  <EditButton />
</PermissionGuard>
```

---

# Layouts por Sección

Cuando una sección necesita estructura propia:

Ejemplo:

```text
dashboard/
  ├── layout.tsx
  ├── page.tsx
```

Puede contener:

- Tabs.
- Navegación secundaria.
- Contextos específicos.

---

# Breadcrumbs

Las páginas deben permitir navegación contextual.

Ejemplo:

```text
Inicio
 /
Usuarios
 /
Juan Pérez
```

Los breadcrumbs deben construirse a partir de la ruta o configuración de la Feature.

---

# Formularios

Una página de formulario debe:

- Tener una ruta propia si es compleja.
- Usar React Hook Form.
- Validar con Zod.
- Mostrar estados.
- Respetar permisos.

Ejemplo:

```text
/users/new

UserCreatePage
↓
UserForm
↓
useCreateUser()
```

---

# Tablas

Una página de listado normalmente tendrá:

```text
UsersPage
↓
UserToolbar
↓
UserFilters
↓
UserTable
↓
Pagination
```

La página no debe conocer detalles internos de la tabla.

---

# Responsive

Toda página debe diseñarse para:

- Mobile.
- Tablet.
- Desktop.

Nunca asumir:

```text
Pantalla grande primero
```

---

# Organización Recomendada

Ejemplo completo:

```text
src/app/[locale]/users/
  ├── page.tsx
  ├── new/
  │   └── page.tsx
  ├── [id]/
  │   ├── page.tsx
  │   └── edit/
  │       └── page.tsx
  ├── loading.tsx
  └── error.tsx
```

---

# Checklist de Nueva Página

Antes de crear:

- ¿Necesita una ruta propia?
- ¿Es Server o Client Component?
- ¿Pertenece a una Feature?
- ¿Tiene permisos?
- ¿Tiene estados loading/error?
- ¿Tiene metadata?
- ¿Funciona en móvil?
- ¿Está internacionalizada?

---

# Anti Patrones

## Página gigante

Una página con:

- API calls.
- Formularios.
- Tablas.
- Validaciones.
- Lógica de negocio.

---

## Usar Client Component por defecto

Ejemplo:

```tsx
"use client";

export default function Page() {}
```

sin necesidad real.

---

## Acceso directo a infraestructura

Incorrecto:

```tsx
page.tsx;

axios.get();
```

---

## Duplicar Layouts

Crear estructuras similares sin reutilizar templates.

---

# Objetivo Final

Las páginas de APPAM deben ser simples puntos de composición.

La complejidad debe vivir donde corresponde:

- UI → Components.
- Estado remoto → Hooks.
- Negocio → Services.
- Transporte → API.
- Contratos → DTO.
- Conversión → Mappers.

Una página bien diseñada debe poder entenderse rápidamente y servir únicamente como punto de entrada hacia una Feature.
