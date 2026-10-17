# ADR-008 - Separación entre DTO, Mapper y Modelo de Dominio

**Estado:** Aceptado

**Fecha:** 2026-07-09

---

# Contexto

El backend define el contrato de la API mediante DTOs (Data Transfer Objects). Estos contratos pueden cambiar por razones de compatibilidad, evolución del API o decisiones del equipo backend.

Se requiere evitar que dichos cambios impacten directamente la interfaz de usuario.

---

# Decisión

La aplicación utilizará tres representaciones distintas de los datos:

- DTO (Contrato del backend)
- Mapper
- Modelo de Dominio

Flujo:

```text
REST API
    │
    ▼
DTO
    │
    ▼
Mapper
    │
    ▼
Domain Model
    │
    ▼
React
```

Los componentes React únicamente consumirán modelos del dominio.

Los DTO nunca serán utilizados fuera de la capa Infrastructure o de las Features.

---

# Ejemplo

DTO:

```ts
interface UserDto {
  first_name: string;
  last_name: string;
}
```

Modelo:

```ts
interface User {
  firstName: string;
  lastName: string;
}
```

Mapper:

```ts
function mapUser(dto: UserDto): User;
```

---

# Consecuencias

## Positivas

- Bajo acoplamiento con el backend.
- Mayor facilidad para evolucionar el dominio.
- Adaptación sencilla ante cambios del API.

## Negativas

- Requiere escribir mappers.
- Incrementa ligeramente el número de archivos.

---

# Alternativas consideradas

Consumir directamente los DTO desde React.

Se descartó porque mezcla el contrato del backend con el modelo interno de la aplicación.

---

# Referencias

- Data Transfer Object Pattern
- Domain Model Pattern
