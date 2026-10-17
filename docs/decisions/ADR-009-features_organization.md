# ADR-009 - Organización por Features

**Estado:** Aceptado

**Fecha:** 2026-07-09

---

# Contexto

APPAM incorporará múltiples módulos funcionales durante su evolución.

Una organización basada únicamente en carpetas técnicas (`components`, `services`, `hooks`, etc.) dificulta el mantenimiento cuando el proyecto crece.

---

# Decisión

La lógica de negocio se organizará por funcionalidades (Features).

Cada Feature es responsable de sus casos de uso y define los patrones de interacción adecuados para cada flujo funcional.

- API
- DTOs
- Mappers
- Hooks
- Componentes propios
- Esquemas de validación
- Servicios
- Tipos

Estructura:

```text
features/
  └── users/
      ├── README.md          # Visión general del módulo
      ├── CHANGELOG.md       # Historial de cambios del módulo
      ├── TODO.md            # Mejoras pendientes
      ├── api/
      ├── components/
      ├── pages/
      ├── flows/
      ├── dto/
      ├── hooks/
      ├── mappers/
      ├── schemas/
      ├── services/
      ├── types/
      └── index.ts
```

Las dependencias entre Features deberán mantenerse al mínimo.

Las utilidades compartidas pertenecerán a `shared` o `domain`.

---

# Consecuencias

## Positivas

- Alta cohesión.
- Escalabilidad.
- Mantenimiento sencillo.
- Independencia entre módulos.

## Negativas

- Puede existir cierta duplicación controlada entre Features.
- Requiere disciplina para evitar dependencias circulares.

---

# Alternativas consideradas

Organización exclusivamente por tipo de archivo.

Se descartó por dificultar el crecimiento del proyecto.

---

# Referencias

- Feature-Based Architecture
- Vertical Slice Architecture
