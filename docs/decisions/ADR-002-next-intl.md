# ADR-002 - Internacionalización mediante next-intl

**Estado:** Aceptado

**Fecha:** 2026-07-09

---

# Contexto

APPAM debe soportar múltiples idiomas desde su primera versión.

El idioma forma parte de la URL para permitir:

- Enlaces compartibles.
- SEO.
- Cambio de idioma sin perder contexto.
- Escalabilidad para incorporar nuevos idiomas.

---

# Decisión

Se utilizará `next-intl` como solución oficial de internacionalización.

La estructura adoptada será:

```text
app/
    [locale]/
messages/
i18n/
    routing.ts
    request.ts
    navigation.ts
    locales.ts
```

El locale será parte de la ruta.

Ejemplo:

```text
/es/dashboard
/en/dashboard
```

Todos los textos visibles deberán obtenerse mediante `next-intl`.

No se permitirán cadenas literales dentro de los componentes.

---

# Consecuencias

## Positivas

- Integración nativa con App Router.
- Excelente soporte para Server Components.
- Carga eficiente de mensajes.
- Escalabilidad para nuevos idiomas.

## Negativas

- Mayor disciplina para evitar textos hardcodeados.
- Requiere mantener archivos de traducción sincronizados.

---

# Alternativas consideradas

## react-i18next

Descartada por integrarse menos naturalmente con App Router.

## next-i18next

Descartada por estar orientada principalmente al Pages Router.

---

# Referencias

- Next.js App Router
- next-intl
