# State Management Guide

## APPAM - Sistema Web de Administración

Versión: **1.0**

Última actualización: **2026-07-09**

---

# Objetivo

Este documento define la estrategia de manejo de estado dentro de APPAM.

El objetivo es establecer:

- Qué tipo de estado existe.
- Dónde debe vivir.
- Qué herramientas utilizar.
- Qué patrones evitar.
- Cómo mantener la aplicación escalable.

---

# Filosofía

No todo estado debe ser global.

Cada estado debe vivir en el lugar más cercano posible a donde es utilizado.

Regla:

```text
Local antes que global.
Feature antes que aplicación.
Servidor antes que cache manual.
```

---

# Tipos de Estado

APPAM reconoce cuatro categorías principales:

```text
Estado
├── Server State
├── Application State
├── UI State
└── Form State
```

---

# 1. Server State

Representa información que pertenece al backend.

Ejemplos:

- Usuarios.
- Permisos.
- Inscripciones.
- Ciudades.
- Reuniones.
- Configuraciones.

Características:

- Tiene ciclo de vida remoto.
- Puede cambiar externamente.
- Requiere sincronización.
- Tiene loading/error.

---

## Herramienta

APPAM utiliza:

```text
TanStack Query
```

para administrar Server State.

---

Ejemplo:

```tsx id="4z9y1m"
const { data, isLoading, error } = useUsers();
```

---

# TanStack Query Responsibilities

Debe manejar:

- Fetching.
- Cache.
- Refetch.
- Loading.
- Error.
- Invalidación.
- Mutaciones.

---

# No usar Context para Server State

Incorrecto:

```tsx id="ojx6e4"
<UserContext>usuarios</UserContext>
```

---

Motivo:

- Cache manual.
- Sin sincronización.
- Mayor complejidad.

---

# 2. Application State

Representa información global de la aplicación.

Ejemplos:

- Usuario autenticado.
- Permisos.
- Tema.
- Idioma.
- Configuración UI.

---

## Herramienta

Utilizar:

- React Context.
- Providers.

---

Ejemplo:

```text id="bbyjrv"
src/providers/
├── AuthProvider
├── PermissionProvider
├── ThemeProvider
└── I18nProvider
```

---

# Auth State

Representa:

- Usuario actual.
- Sesión.
- Estado de autenticación.

Ejemplo:

```ts id="y6r4qn"
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}
```

---

# Permission State

Representa:

- Árbol de navegación.
- Permisos.
- isAdmin.

Ejemplo:

```ts id="6gtjxn"
interface PermissionState {
  tree: PermissionNode[];
  can(permission: string): boolean;
}
```

---

# Theme State

Debe manejar:

- Light.
- Dark.
- System.

La persistencia debe realizarse mediante la solución de tema seleccionada.

---

# Locale State

El idioma pertenece al sistema de rutas.

Ejemplo:

```text id="l6pq0f"
/es/dashboard

/en/dashboard
```

No duplicar el locale en múltiples stores.

---

# 3. UI State

Representa estado temporal de interfaz.

Ejemplos:

- Sidebar abierto.
- Tab seleccionado.
- Modal visible.
- Filtros temporales.
- Dropdown activo.

---

Debe vivir localmente.

Ejemplo:

```tsx id="qv1h57"
const [open, setOpen] = useState(false);
```

---

# Cuándo usar Context para UI State

Solamente cuando múltiples componentes necesitan compartirlo.

Ejemplos:

- Sidebar global.
- Layout preferences.

---

# 4. Form State

Representa información temporal de formularios.

Ejemplos:

- Inputs.
- Errores.
- Valores modificados.
- Estado dirty.

---

## Herramienta

APPAM utiliza:

```text
React Hook Form
```

---

No guardar formularios en:

- Context.
- TanStack Query.
- Estado global.

---

# Arquitectura de Estado

Ejemplo completo:

```text id="7v7m8k"
Users Page
    ├── React Query
    |       Usuarios
    ├── React Hook Form
    |       Formulario
    ├── Permission Context
    |       Permisos
    └── Local State
            Modal abierto
```

---

# Redux

APPAM no utiliza Redux inicialmente.

Motivos:

- No existe necesidad actual.
- Aumenta complejidad.
- Duplica responsabilidades de TanStack Query y Context.

---

Redux solamente debería considerarse si aparece:

- Estado altamente compartido.
- Flujos complejos entre Features.
- Necesidad avanzada de middleware.

---

# Zustand

Puede evaluarse para casos específicos de UI global.

Ejemplos:

- Constructor visual.
- Workspace complejo.
- Estado temporal entre múltiples componentes.

No debe utilizarse para reemplazar TanStack Query.

---

# TanStack Query Configuration

La configuración debe centralizarse.

Ubicación:

```text id="14hdxm"
src/lib/query/
```

Ejemplo:

```text id="c2shlw"
query-client.ts
```

---

# Query Keys

Las keys deben estar organizadas por Feature.

Ejemplo:

```ts id="15i4xq"
userKeys.all;

userKeys.list();

userKeys.detail(id);
```

---

# Invalidación de Cache

Después de una mutación:

Ejemplo:

```text id="nq4t6j"
Crear usuario
↓
Invalidar users.list
↓
Actualizar tabla
```

---

# Prefetching

Puede utilizarse cuando:

- La navegación es predecible.
- Mejora experiencia.

Ejemplo:

Al pasar sobre un usuario:

```text id="tv4j80"
Prefetch User Detail
```

---

# Optimistic Updates

Usar solamente cuando:

- La operación sea segura.
- El rollback sea claro.

Ejemplo adecuado:

- Cambiar favorito.

Ejemplo no adecuado:

- Crear inscripción compleja.

---

# Persistencia

No todo estado debe persistirse.

---

# Puede persistirse

Ejemplos:

- Tema.
- Preferencia visual.
- Idioma si no depende de URL.

---

# No persistir

Ejemplos:

- Permisos.
- Datos sensibles.
- Respuestas API.
- Formularios.

---

# Estado de Autenticación

La autenticación pertenece a Cognito.

No almacenar manualmente:

```text
localStorage.token
```

---

El flujo:

```text id="7g7m92"
Cognito
↓
Amplify
↓
AuthProvider
↓
Application
```

---

# Estado de Permisos

Los permisos deben cargarse después de autenticación.

Flujo:

```text id="0e3l7n"
Login correcto
↓
Obtener usuario
↓
Solicitar permisos backend
↓
PermissionProvider
↓
Render aplicación
```

---

# Loading Global

APPAM debe diferenciar:

## Inicialización de aplicación

Ejemplo:

```text id="p8q8r9"
Cargando sesión...
```

---

## Loading de Feature

Ejemplo:

```text id="5j5l6c"
Cargando usuarios...
```

---

No bloquear toda la aplicación por operaciones pequeñas.

---

# Server Components y Estado

Los Server Components no utilizan:

- useState.
- useEffect.
- Context client.

Deben recibir datos mediante:

- Props.
- Fetch server.

---

# Client Boundaries

Reducir al mínimo:

```tsx id="7x5h2f"
"use client";
```

Solo agregarlo donde sea necesario.

---

# Ejemplo de Flujo Completo

Caso:

Abrir Usuarios.

```text id="g7j8dx"
Route
↓
UsersPage (Server)
↓
UsersFeature
↓
useUsers()
↓
TanStack Query
↓
UserService
↓
API
↓
Cache
↓
UI
```

---

# Anti Patrones

## Guardar todo en Context

```text id="f1s0xr"
AppContext
 ├── users
 ├── permissions
 ├── forms
 ├── filters
 └── settings
```

---

## Duplicar Server State

Ejemplo:

```text
React Query
+
Redux
+
Context
```

con la misma información.

---

## Estado global para modal local

Incorrecto:

```text id="3pld5w"
GlobalModalStore
```

para un modal usado por una página.

---

## Cache manual

Incorrecto:

```tsx id="3gjl3n"
useEffect(){

 fetch()

 setUsers()

}
```

cuando la información viene del backend.

---

# Checklist Nueva Feature

Antes de agregar estado:

- ¿Es información del backend?
- ¿Es compartida?
- ¿Es temporal?
- ¿Necesita persistencia?
- ¿Puede vivir localmente?
- ¿Debe estar en Query?
- ¿Debe estar en Context?

---

# Objetivo Final

APPAM debe mantener un modelo de estado simple:

- TanStack Query para datos remotos.
- Context para estado global real.
- React State para UI local.
- React Hook Form para formularios.

La aplicación debe evitar almacenar información innecesaria y permitir que cada Feature evolucione de manera independiente.
