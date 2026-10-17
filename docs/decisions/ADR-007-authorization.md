# ADR-007 - Autorización Basada en Permisos (Permission-Based Access Control)

**Estado:** Aceptado

**Fecha:** 2026-07-09

---

# Contexto

APPAM implementa un modelo de seguridad basado en permisos granulares.

El backend determina qué acciones puede realizar cada usuario y construye el árbol de navegación correspondiente.

La interfaz únicamente debe consumir esa información.

---

# Decisión

La autorización será basada en permisos y no en roles.

Los roles únicamente existirán dentro del backend.

La interfaz trabajará exclusivamente con:

- Permisos.
- Árbol de navegación.
- Indicador de administrador.

El proveedor de autenticación expondrá una API simplificada.

Ejemplo:

```typescript
const { user, menu, permissions, isAdmin, can, logout } = useAuth();
```

Los componentes nunca evaluarán directamente el árbol de permisos.

Únicamente utilizarán funciones como:

```typescript
can("user:create");

can("user:update");

can("meeting:delete");
```

El Sidebar será generado completamente a partir del árbol entregado por el backend.

La interfaz no definirá manualmente la navegación.

---

# Flujo General

```text
Usuario autenticado

↓

Backend

↓

Permisos

↓

Mapper

↓

Modelo interno

↓

AuthProvider

↓

useAuth()

↓

Componentes
```

---

# Consecuencias

## Positivas

- Bajo acoplamiento.
- Mayor seguridad.
- Navegación completamente dinámica.
- Fácil incorporación de nuevos permisos.

## Negativas

- Dependencia del árbol de permisos entregado por el backend.
- Mayor responsabilidad del backend en la construcción de la navegación.

---

# Alternativas consideradas

## Control basado en roles dentro del frontend

Descartado para evitar duplicar lógica de negocio.

## Menú definido manualmente

Descartado porque genera inconsistencias con los permisos reales del usuario.

---

# Referencias

- RBAC
- PBAC (Permission-Based Access Control)
- Principle of Least Privilege
