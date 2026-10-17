# Component Development Guide

## APPAM - Sistema Web de Administración

Versión: **1.0**

Última actualización: **2026-07-09**

---

# Objetivo

Este documento define las reglas para crear, organizar y mantener componentes React dentro de APPAM.

Los componentes representan la capa visual del sistema y deben construirse siguiendo:

- Atomic Design.
- Composición.
- Principios de accesibilidad.
- Diseño responsive.
- Reutilización controlada.

---

# Filosofía

Un buen componente debe ser:

- Fácil de entender.
- Fácil de reutilizar.
- Fácil de modificar.
- Independiente de lógica externa.
- Predecible.

Un componente no debe intentar resolver demasiados problemas al mismo tiempo.

---

# Principios Fundamentales

## Single Responsibility

Cada componente debe tener una responsabilidad principal.

Correcto:

```tsx
<UserAvatar />
```

Responsabilidad:

Mostrar avatar del usuario.

---

Incorrecto:

```tsx
<UserManager />
```

Responsabilidades:

- Obtener usuarios.
- Filtrar.
- Crear usuarios.
- Editar.
- Eliminar.
- Mostrar tabla.

---

# Atomic Design

APPAM utiliza Atomic Design como modelo organizativo.

La jerarquía es:

```text
Atoms
↓
Molecules
↓
Organisms
↓
Templates
↓
Pages
```

---

# Atoms

Son los elementos más pequeños de interfaz.

Características:

- No conocen negocio.
- Son altamente reutilizables.
- Tienen poca lógica.

Ejemplos:

```text
Button

Input

Badge

Avatar

Icon

Spinner

Label
```

Ubicación:

```text
src/components/atoms
```

---

Ejemplo:

```tsx
<Button variant="primary">Guardar</Button>
```

---

# Molecules

Combinan varios átomos para crear componentes funcionales pequeños.

Ejemplos:

```text
SearchInput

FormField

UserBadge

Pagination

DatePicker
```

Ubicación:

```text
src/components/molecules
```

---

Ejemplo:

```tsx
<SearchInput placeholder="Buscar usuarios" />
```

---

# Organisms

Representan bloques funcionales completos.

Ejemplos:

```text
Sidebar

Header

UserTable

FiltersPanel

NavigationMenu
```

Ubicación:

```text
src/components/organisms
```

---

Los Organisms pueden conocer:

- Hooks.
- Estado visual.
- Composición de moléculas.

No deben contener lógica de negocio compleja.

---

# Templates

Definen estructuras completas de página.

Ejemplos:

```text
DashboardLayout

AdminLayout

FormLayout

DetailLayout
```

Ubicación:

```text
src/components/templates
```

---

Ejemplo:

```tsx
<DetailLayout>
  <UserInformation />
</DetailLayout>
```

---

# Pages

Las páginas pertenecen al App Router.

Ejemplo:

```text
src/app/[locale]/users/page.tsx
```

Una página debe:

- Componer componentes.
- Definir metadata.
- Controlar routing.

No debe contener componentes enormes.

---

# Composición

APPAM utiliza composición como patrón principal.

Preferido:

```tsx
<Card>
  <Card.Header>Usuario</Card.Header>

  <Card.Body>Información</Card.Body>

  <Card.Footer>Acciones</Card.Footer>
</Card>
```

---

Evitar:

```tsx
<Card title="" showFooter footerButtons headerIcon collapsible loading />
```

cuando la cantidad de propiedades comienza a crecer.

---

# Component API Design

Los componentes deben tener APIs simples.

Preferido:

```tsx
<DataTable>
  <DataTable.Toolbar />
  <DataTable.Content />
  <DataTable.Pagination />
</DataTable>
```

---

Evitar:

```tsx
<DataTable showSearch showFilters showPagination allowExport allowDelete />
```

---

# Componentes Compartidos vs Feature

Una de las decisiones más importantes.

---

## Componentes Compartidos

Ubicación:

```text
src/components
```

Son componentes utilizados por múltiples Features.

Ejemplos:

```text
Button

Modal

DataTable

PageHeader

ConfirmDialog
```

---

## Componentes de Feature

Ubicación:

```text
src/features/users/components
```

Son específicos del dominio.

Ejemplos:

```text
UserPermissionBadge

InvitationStatus

EnrollmentTimeline
```

---

# Regla de Promoción

Un componente debe permanecer dentro de una Feature hasta que exista una necesidad real de reutilización.

No crear componentes globales anticipadamente.

---

Incorrecto:

```text
src/components/UserTable
```

si solo existe para Users.

Correcto:

```text
src/features/users/components/UserTable
```

---

# shadcn/ui

APPAM utilizará shadcn/ui como base de componentes.

Los componentes generados viven en:

```text
src/components/ui
```

Ejemplos:

```text
button.tsx

dialog.tsx

input.tsx

dropdown-menu.tsx
```

---

Reglas:

- No modificar componentes directamente sin razón.
- Extender mediante composición.
- Mantener los componentes UI independientes del negocio.

---

# Variantes

Las variantes visuales deben utilizar:

- class-variance-authority.
- Tailwind variants.

Ejemplo:

```tsx
<Button variant="destructive">Eliminar</Button>
```

---

Evitar:

```tsx
<Button color="red">
```

---

# Estilos

Los componentes deben utilizar tokens del sistema.

Correcto:

```tsx
className = "bg-primary text-primary-foreground";
```

Incorrecto:

```tsx
className = "bg-blue-500";
```

---

# Responsive Design

Todo componente debe considerar:

- Desktop.
- Tablet.
- Mobile.

No crear componentes exclusivamente para desktop.

---

Ejemplo:

```tsx
<UserTable />
```

puede transformarse:

Desktop:

```text
Tabla
```

Mobile:

```text
Cards
```

---

# Componentes con Datos

Los componentes visuales deben evitar llamadas directas al backend.

Incorrecto:

```tsx
function UsersTable() {
  const users = await axios.get();
}
```

---

Correcto:

```text
Page
↓
Hook
↓
Component
```

---

# Componentes Controlados

Cuando sea necesario permitir comportamiento externo:

Correcto:

```tsx
<Tabs value={tab} onChange={setTab} />
```

---

Evitar:

```tsx
<Tabs initialTab="users" />
```

si el estado necesita ser controlado.

---

# Estados Visuales

Todo componente que depende de datos debe contemplar:

## Loading

```tsx
<UserTableSkeleton />
```

---

## Empty

```tsx
<EmptyState />
```

---

## Error

```tsx
<ErrorState />
```

---

# Accesibilidad

Todos los componentes deben considerar:

- Elementos semánticos HTML.
- Labels correctos.
- Estados ARIA.
- Navegación teclado.
- Contraste.

---

# Iconos

APPAM utilizará Lucide Icons.

Correcto:

```tsx
import { Users } from "lucide-react";
```

---

Evitar:

- SVGs inline repetidos.
- Iconos sin significado.

---

# Naming

Los nombres deben describir intención.

Correcto:

```text
UserInvitationForm
```

Incorrecto:

```text
Form2
```

---

# Estructura Recomendada

Ejemplo:

```text
components/
├── ui/
├── atoms/
│   └── badge/
├── molecules/
│   └── search-input/
├── organisms/
│   └── sidebar/
└── templates/
    └── dashboard-layout/
```

---

# Checklist para Crear un Componente

Antes de crear:

- ¿Existe uno similar?
- ¿Pertenece a una Feature?
- ¿Debe ser reutilizable?
- ¿Cuál es su responsabilidad?
- ¿Puede componerse?
- ¿Funciona en móvil?
- ¿Tiene estados definidos?
- ¿Tiene textos internacionalizados?

---

# Anti Patrones

Evitar:

## Componentes gigantes

Más de una responsabilidad.

---

## Componentes con demasiadas props

Indicador de falta de composición.

---

## Componentes con lógica de negocio

Mover lógica a hooks/services.

---

## Componentes globales prematuros

No abstraer antes de necesitarlo.

---

# Composición recomendada para pantallas de listado (List Management)

Para pantallas tipo listado (como Users), se recomienda la siguiente composición:

```text
Template (DashboardLayout)
  └── Organism (Page Content)
       ├── Molecule (StatusBadge) + Atoms (Typography)
       ├── Organism (FiltersPanel)
       │    └── Form controls (Input/Select/Button)
       ├── Desktop: Organism/Molecule de tabla
       └── Mobile: cards compactas reutilizables
```

Reglas obligatorias:

- Debe existir **un solo CTA primario** visible por pantalla.
- El resto de acciones deben ser secundarias o ghost.
- Los estados de datos deben cubrir siempre:
  - Loading
  - Empty
  - Error
  - Success
- La estructura debe ser mobile first:
  - Desktop: tabla
  - Mobile: cards/lista legible

Para filtros y ordenamiento se recomienda un enfoque URL-driven (query params) para compartir estado y mejorar navegación (atrás/adelante).

---

# Componentes implementados (v1)

Este bloque documenta los componentes del Design System ya implementados y su uso recomendado.

## Atoms

- `Button`
- `Input`
- `Label`
- `Typography`
- `Spinner`
- `Skeleton`
- `Icon`

## Molecules

- `FormField`  
  Encapsula label + control + ayuda + error con relaciones accesibles (`aria-invalid`, `aria-describedby`).
- `FormActions`  
  Estandariza acciones primarias/secundarias de formularios con estado loading/disabled.
- `LoadingState`
- `EmptyState`
- `ErrorState`
- `StatusBadge`
- `UserCard`
- `AuthFeedback`

## Organisms

- `DataTable` (reusable)  
  Soporta:
  - `sorting`
  - `pagination`
  - estados `loading/empty/error/success`
  - `sticky header`
  - variante responsive con `mobileCard`

---

# Patrón de adopción gradual (incremental)

La adopción del Design System se realiza por etapas para no romper funcionalidades existentes.

Pilotos actuales:

- Auth (formulario de login)
- Users (filtros + listado/tablas)

Regla recomendada:

1. Primero reutilizar atoms/molecules existentes.
2. Luego extraer repeticiones en nuevos molecules/organisms.
3. Finalmente consolidar en templates/layouts.

Evitar migraciones “big bang” que mezclen cambios visuales, de estructura y de comportamiento en un solo PR.

---

# Accesibilidad (A11y) obligatoria en componentes

Todos los componentes nuevos o refactorizados deben cumplir:

- Navegación por teclado completa.
- `focus-visible` claro y consistente.
- Asociación explícita de label/control/error/help.
- Estados ARIA correctos en controles y feedback.
- Contraste visual suficiente en estados normales y de error.
- Estados interactivos definidos: `hover`, `focus`, `active`, `disabled`.

---

# Objetivo Final

Los componentes de APPAM deben formar un sistema visual consistente.

La reutilización no se logra creando componentes genéricos para todo.

Se logra creando componentes bien diseñados, con responsabilidades claras y composición flexible.

Un componente bien construido debe poder evolucionar sin obligar a modificar toda la aplicación.
