# Testing Guide

## APPAM - Sistema Web de Administración

Versión: **1.0**

Última actualización: **2026-07-09**

---

# Objetivo

Este documento define la estrategia de pruebas para APPAM.

Establece:

- Qué probar.
- Cómo probarlo.
- Qué herramientas utilizar.
- Cómo organizar pruebas.
- Qué comportamientos son críticos.

---

# Filosofía

Las pruebas deben proteger comportamiento, no implementación.

El objetivo no es probar que:

```tsx
un componente tiene un div
```

El objetivo es probar que:

```text
un usuario puede completar correctamente una acción
```

---

# Principios

## Probar comportamiento

Correcto:

```text
Usuario sin permiso no puede eliminar usuarios
```

Incorrecto:

```text
PermissionGuard llama internamente a useContext
```

---

## Probar lo importante

No todo código requiere pruebas.

Prioridad:

1. Reglas de negocio.
2. Flujos críticos.
3. Permisos.
4. Formularios.
5. Componentes reutilizables.
6. Funciones complejas.

---

# Stack de Testing

APPAM utilizará:

## Unit Testing

Para lógica aislada.

Herramienta:

```text
Vitest
```

---

## Component Testing

Para componentes React.

Herramientas:

```text
Vitest

+

React Testing Library
```

---

## API Mocking

Para simular backend:

```text
MSW
(Mock Service Worker)
```

---

## End to End

Para flujos completos:

```text
Playwright
```

---

# Organización de Tests

Los tests deben vivir cerca del código.

Ejemplo:

```text
features/users/
├── components/
│   ├── UserTable.tsx
│   └── UserTable.test.tsx
│
├── services/
│   ├── user.service.ts
│   └── user.service.test.ts
```

---

# Unit Tests

Se utilizan para funciones puras.

Ejemplos:

- Mappers.
- Validaciones.
- Utilidades.
- Transformaciones.

---

Ejemplo:

```text
mapUser()

formatDate()

permissionMatcher()
```

---

# No hacer Unit Tests de todo

Evitar:

```text
test()
```

para cada función trivial.

---

# Testing de Mappers

Los mappers son importantes porque separan backend de frontend.

Ejemplo:

Entrada:

```json
{
  "first_name": "Juan"
}
```

Salida esperada:

```ts
{
  firstName: "Juan";
}
```

---

# Component Testing

Los componentes deben probar:

- Render.
- Interacciones.
- Estados.
- Accesibilidad básica.

---

Ejemplo:

Componente:

```text
CreateUserButton
```

Debe probar:

```text
Usuario con permiso

↓

Botón visible
```

---

```text
Usuario sin permiso

↓

Botón oculto
```

---

# No probar detalles internos

Evitar:

```ts
expect(component.state.open);
```

Preferir:

```text
El modal aparece cuando el usuario presiona Crear
```

---

# Testing de Formularios

Los formularios son críticos.

Debe probarse:

## Render inicial

```text
Campos visibles
```

---

## Validaciones

Ejemplo:

```text
Email inválido
↓
Mensaje mostrado
```

---

## Submit exitoso

```text
Datos válidos
↓
API llamada
↓
Confirmación
```

---

## Error Backend

```text
Correo existente
↓
Mensaje mostrado
```

---

# Testing de Permisos

APPAM depende mucho del sistema de permisos.

Debe probar:

---

## Usuario autorizado

Ejemplo:

```text
user:create
↓
Botón Crear visible
```

---

## Usuario no autorizado

Ejemplo:

```text
user:delete
↓
Acción no disponible
```

---

## Administrador

Ejemplo:

```text
isAdmin=true
↓
Todas las acciones disponibles
```

---

# Testing de Hooks

Los hooks personalizados deben probarse cuando contienen lógica.

Ejemplos:

```text
useUsers()

usePermission()

useCreateUser()
```

---

No probar hooks simples que solamente delegan.

---

# Testing de TanStack Query

No probar internamente TanStack Query.

Probar comportamiento:

Ejemplo:

```text
API devuelve usuarios
↓
Tabla muestra usuarios
```

---

# MSW

Las pruebas de Features deben simular backend.

Ejemplo:

```text
GET /users
↓
Respuesta mock
```

---

Ventajas:

- Pruebas realistas.
- Sin depender de backend.
- Mantiene contratos.

---

# Testing de API Services

Los servicios deben probar:

- Construcción correcta de request.
- Transformación de respuesta.
- Manejo de errores.

---

Ejemplo:

```text
createUser()
↓
POST correcto
↓
Mapper aplicado
```

---

# Testing de Errores

Debe probarse:

## Authentication Error

```text
401
↓
Redirección login
```

---

## Authorization Error

```text
403
↓
Pantalla Forbidden
```

---

## Validation Error

```text
422
↓
Errores de campos
```

---

# Testing de Routing

Las rutas importantes deben probar:

- Acceso correcto.
- Redirecciones.
- Parámetros.

---

Ejemplo:

```text
/users/123/edit
```

---

# Testing E2E

Debe reservarse para flujos completos.

No para detalles visuales.

---

# Flujos críticos APPAM

Inicialmente:

## Autenticación

```text
Login
↓
Sesión válida
↓
Carga permisos
↓
Dashboard
```

---

## Invitación de Usuario

```text
Crear invitación
↓
Asignar rol
↓
Enviar
↓
Confirmación
```

---

## Gestión de Usuarios

```text
Buscar usuario
↓
Editar
↓
Guardar
↓
Actualizar lista
```

---

## Permisos

```text
Usuario sin permiso
↓
No puede acceder
```

---

# Playwright

Los tests E2E deben ejecutarse:

- Antes de releases.
- En CI/CD.
- En ambientes controlados.

---

# Selectores

Preferir:

```html
data-testid
```

cuando sea necesario.

---

Evitar:

```css
div: nth-child(3);
```

---

# Accesibilidad

Los tests deben incluir validaciones básicas:

- Roles ARIA.
- Labels.
- Navegación teclado.

---

# Testing Responsive

Los flujos importantes deben probar:

- Desktop.
- Mobile.

Ejemplo:

```text
Crear usuario

Desktop

Mobile
```

---

# Coverage

La cobertura es una métrica, no un objetivo absoluto.

No buscar:

```text
100%
```

automáticamente.

Priorizar:

- Código crítico.
- Reglas de negocio.
- Seguridad.
- Flujos principales.

---

# CI/CD

Las pruebas deben ejecutarse en pipeline.

Orden recomendado:

```text
Lint
↓
Type Check
↓
Unit Tests
↓
Component Tests
↓
E2E
```

---

# Pull Requests

Una Feature no debe ser aprobada si:

- Rompe tests existentes.
- No cubre comportamiento nuevo.
- Introduce errores conocidos.

---

# Testing de Nuevas Features

Checklist:

- ¿Tiene tests de servicios?
- ¿Tiene tests de validaciones?
- ¿Tiene tests de permisos?
- ¿Tiene tests de estados?
- ¿Tiene flujo crítico E2E?

---

# Anti Patrones

## Snapshot excesivo

Evitar snapshots gigantes.

---

## Mockear todo

No reemplazar toda la aplicación con mocks.

---

## Probar implementación

Ejemplo:

```text
Componente usa useState
```

No es relevante.

---

## Tests frágiles

Evitar depender de:

- Clases CSS.
- Estructura HTML exacta.
- Orden accidental.

---

# Objetivo Final

Las pruebas de APPAM deben garantizar confianza para evolucionar el sistema.

Una buena prueba responde:

> ¿Puede un usuario completar correctamente una tarea importante?

No responde:

> ¿El código está escrito exactamente como esperaba el desarrollador?

La calidad del sistema se mide por la confianza que proporciona al equipo para cambiarlo.
