# API Development Guide

## APPAM - Sistema Web de Administración

Versión: **1.0**

Última actualización: **2026-07-09**

---

# Objetivo

Este documento define las reglas para la comunicación entre APPAM y los servicios backend.

Establece:

- Configuración HTTP.
- Uso de Axios.
- Autenticación.
- Manejo de tokens.
- Servicios.
- DTOs.
- Mappers.
- Errores.
- Uploads.
- Buenas prácticas.

---

# Principio Fundamental

La capa HTTP es una infraestructura.

Los componentes React nunca deben conocer detalles del backend.

Incorrecto:

```tsx
const response = await axios.get("/users");
```

Correcto:

```text
Component
↓
Hook
↓
Service
↓
API
↓
Axios
```

---

# Arquitectura de Comunicación

La comunicación sigue estas capas:

```text
Feature
│
├── hooks/
├── services/
├── api/
├── dto/
└── mappers/
```

---

# Axios Client

APPAM tendrá un cliente Axios centralizado.

Ubicación:

```text
src/lib/http/
```

Ejemplo:

```text
src/lib/http/
  ├── axios-client.ts
  ├── interceptors.ts
  └── errors.ts
```

---

# Configuración Base

El cliente debe centralizar:

- Base URL.
- Timeout.
- Headers comunes.
- Interceptors.
- Manejo de errores.

Ejemplo conceptual:

```ts
axios.create({
  baseURL,
  timeout,
});
```

---

# Variables de Entorno

Nunca escribir URLs directamente.

Incorrecto:

```ts
baseURL: "https://api.appam.com";
```

---

Correcto:

```env
NEXT_PUBLIC_API_URL=https://api.appam.com
```

---

# Configuración Centralizada

La aplicación debe consumir configuración mediante un único punto:

```text
src/config/
```

Ejemplo:

```ts
config.api.baseUrl;
```

---

# Autenticación

APPAM utiliza:

- AWS Amplify.
- Amazon Cognito.

El flujo:

```text
Usuario
↓
Login Cognito
↓
Tokens
↓
Amplify Storage
↓
Axios Interceptor
↓
Authorization Header
↓
Backend
```

---

# Authorization Header

Todas las llamadas autenticadas deben incluir:

```http
Authorization: Bearer <token>
```

---

# Obtención del Token

La capa HTTP es responsable de obtener el token.

Los componentes no deben hacer:

```ts
getCurrentUser();
```

antes de cada request.

---

# Axios Request Interceptor

Responsabilidades:

- Obtener token actual.
- Agregar Authorization.
- Agregar headers comunes.

Ejemplo:

```ts
config.headers.Authorization = `Bearer ${token}`;
```

---

# Headers Comunes

APPAM debe enviar:

```http
Content-Type: application/json

X-Correlation-ID: uuid
```

---

# Correlation ID

El backend retorna:

```json
{
  "correlationId": "3433e934-7cdd-4394-bec0-1e710b0c408f"
}
```

Este identificador permite:

- Trazabilidad.
- Diagnóstico.
- Soporte.

Debe conservarse en los errores.

---

# API Layer

Cada Feature define sus endpoints.

Ejemplo:

```text
features/users/api/
```

Contenido:

```text
users.api.ts
```

---

Ejemplo:

```ts
export const usersApi = {
  list() {},

  create() {},

  update() {},
};
```

---

# Service Layer

Los servicios representan casos de uso.

Ejemplo:

```text
features/users/services/
```

---

API:

```ts
usersApi.create();
```

Servicio:

```ts
userService.inviteUser();
```

---

El servicio puede:

- Combinar llamadas.
- Aplicar reglas.
- Transformar información.

---

# DTOs

Los DTO representan exactamente el contrato backend.

Ejemplo:

Backend:

```json
{
  "first_name": "Juan",
  "last_name": "Perez"
}
```

DTO:

```ts
interface UserDto {
  first_name: string;
  last_name: string;
}
```

---

# Mappers

Nunca enviar DTOs directamente a componentes.

Flujo:

```text
Backend DTO
↓
Mapper
↓
Domain Model
```

---

Ejemplo:

```ts
mapUser(dto);
```

Transforma:

```ts
{
  first_name: "Juan";
}
```

en:

```ts
{
  firstName: "Juan";
}
```

---

# Respuestas del Backend

APPAM debe asumir una estructura estándar.

Ejemplo:

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {},
  "meta": {
    "correlationId": "uuid"
  }
}
```

---

# API Response Type

Modelo recomendado:

```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    correlationId: string;
  };
}
```

---

# Manejo de Errores

Los errores HTTP nunca llegan directamente a componentes.

Flujo:

```text
Axios Error
↓
Error Mapper
↓
AppError
↓
UI
```

---

# Tipos de Error

APPAM manejará:

```text
AppError
├── AuthenticationError
├── AuthorizationError
├── ValidationError
├── NetworkError
├── NotFoundError
└── UnexpectedError
```

---

# HTTP Status Mapping

Ejemplo:

| HTTP | Error               |
| ---- | ------------------- |
| 401  | AuthenticationError |
| 403  | AuthorizationError  |
| 404  | NotFoundError       |
| 422  | ValidationError     |
| 500  | UnexpectedError     |

---

# Mostrar Errores

La UI no debe mostrar:

```text
HTTP 422
```

Debe mostrar:

```text
Los datos ingresados no son válidos.
```

---

# TanStack Query Integration

Los hooks administran comunicación con API.

Ejemplo:

```ts
useUsers();
```

internamente:

```text
useQuery
↓
UserService
↓
UsersApi
↓
Axios
```

---

# Query Keys

Cada Feature debe definir sus keys.

Ejemplo:

```ts
userKeys.list();
```

Evitar:

```ts
["users"];
```

disperso por archivos.

---

# Mutations

Ejemplo:

```ts
useCreateUser();
```

Responsabilidades:

- Ejecutar servicio.
- Manejar loading.
- Manejar error.
- Invalidar cache.

---

# Optimistic Updates

Solo utilizar cuando:

- La operación sea predecible.
- La reversión sea sencilla.

No aplicar automáticamente.

---

# Upload de Archivos

Los archivos deben manejarse como flujo separado.

Ejemplo:

```text
Seleccionar archivo
↓
Validar
↓
Upload
↓
Obtener referencia
↓
Guardar entidad
```

---

# Multipart

Para archivos utilizar:

```text
multipart/form-data
```

No mezclar archivos grandes dentro de JSON.

---

# Cancelación de Requests

Las operaciones largas deben poder cancelarse.

Ejemplos:

- Búsquedas.
- Reportes.
- Cargas pesadas.

---

# Caching

TanStack Query controla cache.

No almacenar respuestas API en:

- Context.
- Redux.
- Variables globales.

---

# Seguridad

Nunca:

- Guardar tokens manualmente.
- Exponer secretos.
- Confiar en permisos frontend.
- Enviar información sensible innecesaria.

---

# Logs

Nunca hacer:

```ts
console.log(response);
```

en producción.

Los errores deben incluir:

- Endpoint.
- Acción.
- Correlation ID.

---

# Ejemplo Completo

```text
User clicks "Crear Usuario"
↓
CreateUserButton
↓
useCreateUser()
↓
UserService
↓
usersApi.create()
↓
Axios Client
↓
Backend
↓
UserDto
↓
mapUser()
↓
React Query Cache
↓
UI Update
```

---

# Checklist para Nueva API

Antes de agregar un endpoint:

- Crear DTO.
- Crear Mapper.
- Crear API method.
- Crear Service.
- Crear Hook.
- Definir Query Keys.
- Manejar errores.
- Agregar permisos.
- Agregar traducciones.
- Documentar.

---

# Anti Patrones

## Axios en componentes

```tsx
axios.get();
```

---

## DTO en UI

```tsx
user.first_name;
```

---

## Duplicar clientes HTTP

```ts
axios.create();
```

en múltiples Features.

---

## Manejo manual de tokens

```ts
localStorage.getItem("token");
```

---

# Objetivo Final

La comunicación de APPAM con backend debe ser:

- Segura.
- Predecible.
- Tipada.
- Fácil de probar.
- Independiente de la UI.

La capa HTTP debe proteger al resto de la aplicación de los detalles del backend.
