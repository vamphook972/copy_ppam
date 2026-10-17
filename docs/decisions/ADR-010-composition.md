# ADR-010 - Composición de Componentes y Atomic Design

**Estado:** Aceptado

**Fecha:** 2026-07-09

---

# Contexto

La interfaz de APPAM crecerá continuamente incorporando nuevas pantallas y componentes reutilizables.

Se requiere un sistema flexible que reduzca el acoplamiento y facilite la extensión de componentes sin incrementar el número de propiedades.

---

# Decisión

Los componentes propios utilizarán Atomic Design.

Se organizarán en:

- Atoms
- Molecules
- Organisms
- Templates

Los componentes complejos utilizarán composición como mecanismo principal de extensión.

Ejemplo:

```tsx
<PageHeader>
  <PageHeader.Title />
  <PageHeader.Description />
  <PageHeader.Actions />
</PageHeader>
```

Se evitarán componentes con un número elevado de propiedades para controlar su comportamiento.

Los componentes de `shadcn/ui` permanecerán aislados dentro de `components/ui`.

Los componentes no deben asumir un patrón de interacción específico. Los patrones de navegación y edición se seleccionarán según la complejidad del caso de uso y los dispositivos soportados.

---

# Consecuencias

## Positivas

- Componentes más reutilizables.
- APIs más simples.
- Mayor flexibilidad.
- Mejor separación de responsabilidades.

## Negativas

- Curva de aprendizaje para desarrolladores no familiarizados con composición.
- Mayor número de componentes pequeños.

---

# Alternativas consideradas

Componentes monolíticos basados en múltiples propiedades.

Se descartó por dificultar la reutilización y aumentar el acoplamiento.

---

# Referencias

- Atomic Design
- React Composition Pattern
