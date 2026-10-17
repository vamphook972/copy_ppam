# Engineering Handbook

## APPAM - Sistema Web de Administración

Versión: **2.0**

Última actualización: **2026-07-27**

---

# Propósito

Este documento define las prácticas de desarrollo utilizadas en APPAM.

Su objetivo es garantizar consistencia, calidad y mantenibilidad durante todo el ciclo de vida del proyecto.

Todo desarrollador que participe en el proyecto debe seguir las convenciones descritas en este documento.

---

# Filosofía del Proyecto

APPAM prioriza:

- Simplicidad.
- Legibilidad.
- Escalabilidad.
- Bajo acoplamiento.
- Alta cohesión.
- Componentes reutilizables.
- Tipado estricto.
- Código fácil de mantener.

Siempre se favorecerá escribir código claro antes que código "ingenioso".

---

# Stack Tecnológico

## Framework

- Next.js
- React
- TypeScript

## UI

- Tailwind CSS v4
- shadcn/ui
- Radix UI
- Lucide Icons

## Internacionalización

- next-intl

## Estado

- TanStack Query

## HTTP

- Axios

## Autenticación

- AWS Amplify
- Amazon Cognito

---

# Flujo de Trabajo

El desarrollo seguirá el siguiente flujo:

```text
Issue

↓

Feature Branch

↓

Desarrollo

↓

Pull Request

↓

Code Review

↓

Merge
```

Nunca se desarrollará directamente sobre la rama principal.

---

# Convención de Ramas

Formato:

```text
feature/<nombre>
```

Ejemplos:

```text
feature/authentication

feature/dashboard

feature/users
```

Correcciones:

```text
fix/login-error

fix/sidebar-scroll
```

Hotfix:

```text
hotfix/token-refresh
```

---

# Convención de Commits

Se recomienda seguir Conventional Commits.

Ejemplos:

```text
feat(auth): add federated login

feat(users): create invitation flow

fix(menu): resolve collapsed sidebar

refactor(http): simplify axios interceptors

docs(architecture): add ADR-008

test(users): add mapper tests

chore(deps): update dependencies
```

---

# Crear una Nueva Feature

Cada nueva funcionalidad deberá crearse dentro de `src/features`.

## Módulo con CRUD SDK (recomendado)

Para módulos con operaciones CRUD estándar, utilizar `createCrudModule`:

```text
feature-name/
├── api/              ← (opcional) sobreescritura HTTP
├── components/       ← Componentes exclusivos
├── hooks/            ← (opcional) hooks adicionales
├── mappers/          ← DTO → Domain Model
├── schemas/          ← Zod schema
├── types/            ← DTO, Domain, FormValues, QueryParams
├── {feature}.module.ts   ← createCrudModule
├── {feature}.client.ts   ← Re-exportaciones "use client"
└── index.ts
```

Ver `docs/guides/crud-sdk-guide.md` para el paso a paso completo.

## Módulo complejo (sin SDK)

Para módulos con flujos específicos:

```text
feature-name/
├── api/
├── components/
├── hooks/
├── mappers/
├── schemas/
├── services/
├── types/
└── index.ts
```

Una Feature no debe acceder directamente a archivos internos de otra Feature.

La comunicación entre Features debe realizarse mediante exportaciones públicas (`index.ts`) o a través de módulos compartidos.

---

# Crear un Nuevo Componente

Antes de crear un componente, responder las siguientes preguntas:

1. ¿Ya existe un componente similar?
2. ¿Pertenece a una Feature?
3. ¿Es reutilizable?
4. ¿Debe formar parte del Design System?

Ubicación recomendada:

| Tipo                     | Ubicación                       |
| ------------------------ | ------------------------------- |
| shadcn/ui                | `components/ui`                 |
| Átomo                    | `components/atoms`              |
| Molécula                 | `components/molecules`          |
| Organismo                | `components/organisms`          |
| Template                 | `components/templates`          |
| Exclusivo de una Feature | `features/<feature>/components` |

---

# Componentes

Preferir composición.

Correcto:

```tsx
<Card>
  <Card.Header />
  <Card.Body />
  <Card.Footer />
</Card>
```

Evitar componentes con un gran número de propiedades para controlar variantes complejas.

---

# Internacionalización

Todo texto visible debe utilizar `next-intl`.

Correcto:

```tsx
const t = useTranslations("users");

t("title");
```

Incorrecto:

```tsx
<h1>Usuarios</h1>
```

---

# Consumo del Backend

Los componentes React nunca realizarán llamadas HTTP.

Flujo obligatorio:

```text
Component
↓
Hook
↓
Service
↓
Axios
↓
REST API
```

---

# Modelos

Nunca utilizar DTOs directamente en React.

Flujo:

```text
REST API
↓
DTO
↓
Mapper
↓
Domain Model
↓
React
```

---

# Estado

## Estado del servidor

Siempre utilizar TanStack Query.

Ejemplos:

- Listados
- Detalles
- Búsquedas
- Mutaciones

## Estado global

Context API.

Ejemplos:

- Usuario autenticado
- Tema
- Idioma
- Configuración

## Estado local

`useState`

Ejemplos:

- Modal abierto
- Input
- Tabs

---

# Permisos

La interfaz no debe evaluar roles.

Siempre utilizar:

```ts
can("user:create");
```

Nunca:

```ts
if (role === "admin")
```

Los roles pertenecen al backend.

---

# Manejo de Errores

Nunca mostrar errores técnicos.

Incorrecto:

```text
HTTP 500
```

Correcto:

```text
No fue posible cargar la información.
```

Los errores deben transformarse mediante la jerarquía definida en el proyecto.

---

# Estilos

No utilizar colores específicos.

Correcto:

```text
bg-primary
```

Incorrecto:

```text
bg-blue-500
```

Siempre utilizar tokens del sistema de diseño.

---

# Organización de Imports

Orden recomendado:

1. Librerías externas.
2. Alias (`@/`).
3. Relativos.

Ejemplo:

```ts
import { useState } from "react";
import { useTranslations } from "next-intl";

import { useUsers } from "@/features/users";
import { Button } from "@/components/ui/button";

import "./styles.css";
```

El formato será aplicado automáticamente por Prettier.

---

# Uso de Barrel Files

Toda carpeta pública deberá exponer un `index.ts`.

Correcto:

```ts
import { UserTable } from "@/features/users";
```

Evitar:

```ts
import { UserTable } from "@/features/users/components/user-table";
```

---

# Variables de Entorno

Nunca acceder directamente a `process.env`.

Siempre utilizar el módulo de configuración centralizado.

Ejemplo:

```ts
config.api.baseUrl;
```

---

# Pull Request Checklist

Antes de crear un Pull Request verificar:

- El proyecto compila.
- No existen errores de ESLint.
- El código está formateado.
- Los textos están internacionalizados.
- No existen `console.log`.
- No existen `any`.
- Los componentes siguen Atomic Design.
- La nueva funcionalidad respeta la arquitectura definida.
- Se actualizó la documentación si fue necesario.

---

# Cuándo Crear un Nuevo Componente

Crear un componente cuando:

- Sea reutilizable.
- Supere aproximadamente 100-150 líneas de código.
- Tenga una responsabilidad claramente definida.
- Mejore la legibilidad de otro componente.

Evitar crear componentes excesivamente pequeños sin un beneficio claro.

---

# Cuándo Crear un Hook

Crear un hook cuando exista lógica reutilizable relacionada con React.

Ejemplos:

- Gestión de formularios.
- Consumo de APIs.
- Manipulación del estado.
- Acceso a Context.

---

# Cuándo Crear un Servicio

Los servicios encapsulan reglas de acceso a infraestructura o lógica de aplicación.

Ejemplos:

- AuthService
- UserService
- InvitationService

Los servicios no contienen componentes React.

---

# Calidad del Código

Antes de considerar una tarea terminada, verificar:

- El código es fácil de leer.
- El nombre de las variables es claro.
- No existe duplicación.
- Cada función tiene una única responsabilidad.
- La complejidad es la mínima posible.

---

# Principio Final

La mejor solución no es la más corta ni la más compleja.

Es aquella que otro desarrollador podrá entender y mantener con facilidad dentro de uno o dos años.

Cada cambio realizado en APPAM debe contribuir a mantener un código consistente, predecible y preparado para evolucionar.
