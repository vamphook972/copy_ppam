# ADR-005 - Cliente HTTP basado en Axios

**Estado:** Aceptado

**Fecha:** 2026-07-09

---

# Contexto

La aplicación consume una API REST que requiere autenticación mediante tokens JWT y un manejo uniforme de errores, cabeceras, interceptores y renovación de sesiones.

Se requiere desacoplar la interfaz de usuario de los detalles de comunicación HTTP.

---

# Decisión

Toda la comunicación con el backend utilizará una única instancia de Axios.

La configuración del cliente HTTP estará centralizada dentro de la capa Infrastructure.

La instancia incluirá:

- URL base.
- Timeouts.
- Interceptores.
- Cabeceras comunes.
- Inclusión automática del Access Token.
- Manejo centralizado de errores.
- Correlation ID.
- Cancelación de solicitudes cuando corresponda.

Los componentes React nunca realizarán llamadas HTTP directamente.

Toda comunicación deberá realizarse mediante servicios o hooks especializados.

---

# Flujo General

```text
React Component

↓

Hook

↓

Service

↓

Axios Client

↓

REST API
```

---

# Consecuencias

## Positivas

- Configuración centralizada.
- Reutilización.
- Fácil incorporación de interceptores.
- Manejo uniforme de errores.
- Facilidad para pruebas unitarias.

## Negativas

- Mayor cantidad inicial de código.
- Requiere definir servicios por módulo.

---

# Alternativas consideradas

## fetch()

Descartado por carecer de interceptores y configuración centralizada.

## Múltiples instancias de Axios

Descartado para evitar configuraciones duplicadas.

---

# Referencias

- Axios
- REST API Best Practices
