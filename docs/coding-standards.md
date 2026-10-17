# Estándares de Desarrollo

Este documento define las convenciones utilizadas en todo el proyecto.

Su objetivo es mantener un código consistente y fácil de mantener.

---

# Principios

- Código legible.
- Responsabilidad única.
- Evitar duplicación.
- Preferir composición.
- Evitar complejidad innecesaria.

---

# TypeScript

Se utiliza TypeScript en modo estricto.

No se permite el uso de:

```typescript
any;
```

Cuando sea necesario utilizar tipos dinámicos, se prefiere:

```typescript
unknown;
```

---

# Archivos

Todos los archivos utilizan kebab-case.

Ejemplos:

```text
user-table.tsx

theme-switcher.tsx

auth-provider.tsx
```

---

# Componentes

Todos los componentes utilizan PascalCase.

```typescript
UserTable;

ThemeSwitcher;

DashboardLayout;
```

---

# Hooks

Todos los hooks comienzan con:

```text
use
```

Ejemplos:

```typescript
useUsers();

usePermissions();

useTheme();
```

---

# Interfaces

Las interfaces no utilizan el prefijo `I`.

Correcto:

```typescript
interface User
```

Incorrecto:

```typescript
interface IUser
```

---

# Enumeraciones

Siempre que sea posible utilizar union types en lugar de enum.

Ejemplo:

```typescript
type Theme = "light" | "dark" | "system";
```

---

# Imports

Los imports se ordenan automáticamente mediante Prettier.

No deben reorganizarse manualmente.

---

# Componentes React

Se utilizan Function Components.

No se utilizan Class Components.

---

# Props

Las props deben definirse mediante interfaces.

Ejemplo:

```typescript
interface UserTableProps {
  users: User[];
}
```

---

# Composición

Siempre que sea posible se prefiere composición.

Ejemplo:

```tsx
<PageHeader>
  <PageHeader.Title />
  <PageHeader.Actions />
</PageHeader>
```

en lugar de múltiples propiedades.

---

# Internacionalización

Todos los textos visibles deben obtenerse mediante `next-intl`.

No deben existir cadenas literales en los componentes.

---

# Colores

No deben utilizarse colores directamente.

Correcto:

```text
bg-primary
```

Incorrecto:

```text
bg-blue-500
```

---

# Modelos

La interfaz nunca consume DTOs.

Siempre debe trabajar con modelos del dominio.

---

# API

Toda llamada HTTP se realiza mediante Axios.

Nunca se utiliza `fetch()` directamente desde los componentes.

---

# Estado del Servidor

Toda la comunicación con el backend utiliza TanStack Query.

---

# Formularios

Los formularios utilizarán:

- React Hook Form
- Zod

---

# Errores

No deben mostrarse errores técnicos al usuario.

Los errores deben transformarse en mensajes de negocio.

---

# Comentarios

Se prefiere código autoexplicativo.

Los comentarios deben utilizarse únicamente para explicar decisiones de negocio o algoritmos complejos.

---

# Formato

El formato del código está automatizado mediante:

- ESLint
- Prettier
- prettier-plugin-tailwindcss

No deben realizarse cambios manuales únicamente para modificar el formato.

---

# Filosofía

Cada línea de código debe responder a una única responsabilidad y facilitar el mantenimiento futuro del proyecto.
