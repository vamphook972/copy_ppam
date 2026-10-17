# ADR-003 - Sistema de Diseño

**Estado:** Aceptado

**Fecha:** 2026-07-09

---

# Contexto

La interfaz del sistema crecerá continuamente incorporando nuevos módulos administrativos.

Se requiere un sistema de diseño consistente que reduzca la duplicación de componentes y mantenga una experiencia uniforme para el usuario.

---

# Decisión

Se utilizará un Design System construido sobre:

- Tailwind CSS v4.
- shadcn/ui.
- Radix UI.
- Lucide Icons.

Los componentes propios seguirán Atomic Design.

La estructura será:

```text
components/
    ui/
    atoms/
    molecules/
    organisms/
    templates/
```

Los componentes generados por shadcn/ui permanecerán separados dentro de `components/ui`.

Atomic Design se utilizará únicamente para componentes propios.

Los componentes complejos utilizarán composición en lugar de múltiples propiedades.

Ejemplo:

```tsx
<PageHeader>
  <PageHeader.Title />
  <PageHeader.Actions />
</PageHeader>
```

Todos los colores utilizados por la aplicación deberán ser colores semánticos definidos por el sistema de diseño.

No se utilizarán colores específicos de Tailwind dentro de los componentes de negocio.

---

# Consecuencias

## Positivas

- Alta reutilización de componentes.
- Uniformidad visual.
- Escalabilidad.
- Facilidad para incorporar nuevos módulos.

## Negativas

- Mayor inversión inicial.
- Mayor cantidad de componentes pequeños.
- Requiere disciplina para evitar duplicación.

---

# Alternativas consideradas

## Utilizar únicamente shadcn/ui

Descartada porque no define una arquitectura para los componentes propios.

## Atomic Design para todo el proyecto

Descartada porque la organización del dominio debe realizarse mediante Features.

## Crear un sistema de diseño completamente personalizado

Descartada por incrementar considerablemente el tiempo de desarrollo.

---

# Referencias

- Atomic Design (Brad Frost)
- shadcn/ui
- Radix UI
- Tailwind CSS
