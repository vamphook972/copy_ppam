# ADR-006 - Gestión del Estado del Servidor con TanStack Query

**Estado:** Aceptado

**Fecha:** 2026-07-09

---

# Contexto

APPAM consume información remota de forma continua.

Gran parte del estado de la aplicación proviene del backend y debe mantenerse sincronizado con la interfaz.

No se desea implementar manualmente lógica de caché, reintentos o sincronización.

---

# Decisión

Toda la información obtenida desde el backend será administrada mediante TanStack Query.

Las responsabilidades de TanStack Query incluyen:

- Caché.
- Revalidación.
- Reintentos automáticos.
- Invalidación de consultas.
- Mutaciones.
- Sincronización de datos.

El estado de servidor no será almacenado en Context API.

Context API únicamente almacenará estado global de la aplicación.

---

# Flujo General

```text
React Component

↓

Hook

↓

TanStack Query

↓

Axios

↓

REST API
```

---

# Consecuencias

## Positivas

- Excelente rendimiento.
- Caché automática.
- Menor cantidad de código.
- Actualización automática de datos.
- Mejor experiencia de usuario.

## Negativas

- Curva de aprendizaje.
- Necesidad de definir Query Keys consistentes.

---

# Alternativas consideradas

## Context API

Descartado porque no está diseñado para gestionar estado remoto.

## Redux Toolkit

Descartado por añadir complejidad innecesaria para el estado del servidor.

## SWR

Descartado por preferir las capacidades avanzadas de TanStack Query para mutaciones y control de caché.

---

# Referencias

- TanStack Query
- React Server State
