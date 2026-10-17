# ADR-001 - Arquitectura General del Proyecto

**Estado:** Aceptado

**Fecha:** 2026-07-09

---

# Contexto

APPAM es un sistema administrativo que crecerá de forma incremental incorporando múltiples módulos de negocio, autenticación federada, autorización basada en permisos, internacionalización y consumo de servicios REST.

Se requiere una arquitectura que facilite:

- Escalabilidad.
- Mantenibilidad.
- Bajo acoplamiento.
- Alta reutilización.
- Facilidad para incorporar nuevos módulos.

---

# Decisión

El proyecto adoptará una arquitectura híbrida basada en los siguientes patrones:

- Layered Architecture.
- Feature-Based Architecture.
- Atomic Design para la interfaz de usuario.
- DTO + Mapper + Domain Model.
- Configuración centralizada.

La estructura lógica será:

```text
Presentation

↓

Application

↓

Domain

↓

Infrastructure

↓

Shared
```

Los componentes visuales seguirán Atomic Design.

La lógica de negocio se organizará por Features.

Los modelos del dominio estarán desacoplados de los contratos del backend.

---

# Consecuencias

## Positivas

- Bajo acoplamiento entre capas.
- Mayor facilidad para realizar pruebas.
- Reutilización de componentes.
- Facilidad para incorporar nuevos módulos.
- Independencia frente a cambios en el backend.

## Negativas

- Mayor cantidad inicial de archivos.
- Requiere disciplina para mantener la separación de responsabilidades.
- Curva de aprendizaje ligeramente superior para nuevos desarrolladores.

---

# Alternativas consideradas

## Arquitectura por carpetas técnicas

Descartada por generar un alto acoplamiento cuando el proyecto crece.

## Atomic Design para todo el proyecto

Descartada porque Atomic Design está orientado a la interfaz y no a la organización del dominio.

## Arquitectura basada únicamente en Features

Descartada porque dificulta reutilizar infraestructura y componentes globales.

---

# Referencias

- Layered Architecture
- Feature-Based Architecture
- Atomic Design
- Domain Driven Design (principios aplicados parcialmente)
