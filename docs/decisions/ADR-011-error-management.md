# ADR-011 - Estrategia Global de Manejo de Errores

**Estado:** Aceptado

**Fecha:** 2026-07-09

---

# Contexto

APPAM interactúa continuamente con servicios externos y operaciones de negocio que pueden generar errores de red, autenticación, autorización, validación o fallos inesperados.

Se requiere un manejo uniforme que facilite el diagnóstico y ofrezca una experiencia consistente para el usuario.

---

# Decisión

La aplicación implementará una jerarquía de errores propia.

Ejemplo:

```text
AppError
├── AuthenticationError
├── AuthorizationError
├── ValidationError
├── NetworkError
├── NotFoundError
└── UnexpectedError
```

Axios será responsable de transformar las respuestas HTTP en errores de dominio.

Los componentes React no mostrarán mensajes técnicos directamente.

Las pantallas únicamente recibirán errores de negocio preparados para su presentación.

Los errores inesperados serán registrados mediante el sistema de observabilidad definido para la aplicación.

---

# Flujo

```text
REST API
    │
    ▼
Axios
    │
    ▼
AppError
    │
    ▼
Hooks
    │
    ▼
Componentes
```

---

# Consecuencias

## Positivas

- Manejo uniforme de errores.
- Mejor experiencia de usuario.
- Código más predecible.
- Facilita el registro y monitoreo.

## Negativas

- Requiere mantener una jerarquía de errores.
- Necesidad de mapear las respuestas HTTP del backend.

---

# Alternativas consideradas

Lanzar excepciones genéricas (`Error`) desde cualquier capa.

Se descartó por dificultar el tratamiento uniforme y el diagnóstico de fallos.

---

# Referencias

- Error Handling Patterns
- Fail Fast Principle
- Domain Exceptions
