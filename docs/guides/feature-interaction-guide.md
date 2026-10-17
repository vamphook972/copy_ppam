# Feature Interaction Guide

## APPAM - Sistema Web de Administración

Versión: **1.0**

Última actualización: **2026-07-09**

---

# Objetivo

Este documento define los patrones de interacción utilizados en APPAM.

Una Feature no debe asumir automáticamente que todas las operaciones deben resolverse mediante un CRUD tradicional.

Cada módulo debe seleccionar el patrón de interacción más adecuado considerando:

- Complejidad del proceso.
- Cantidad de información.
- Tipo de usuario.
- Dispositivo utilizado.
- Necesidad de navegación.
- Duración del flujo.
- Reglas de negocio.

---

# Principio General

La interfaz debe adaptarse al caso de uso.

La pregunta correcta no es:

> ¿Cómo hacemos un CRUD?

La pregunta correcta es:

> ¿Cuál es la mejor experiencia para que el usuario complete este proceso?

---

# Principios de Diseño

Toda interacción debe cumplir:

## Mobile First

Las interfaces deben funcionar correctamente en:

- Teléfonos.
- Tablets.
- Escritorios.

La versión desktop puede aprovechar más espacio, pero no debe ser el punto de partida.

---

## Navegación Natural

Cuando un flujo representa una acción importante del usuario debe tener una URL propia.

Ejemplos:

```text
/users

/users/new

/users/123

/users/123/edit
```

Esto permite:

- Compartir enlaces.
- Utilizar botones atrás/adelante.
- Recuperar una sesión.
- Mejorar accesibilidad.

---

## Evitar Estados Ocultos

Los flujos importantes no deben depender exclusivamente de:

- Modales abiertos.
- Estados internos.
- Componentes flotantes.

Un usuario debe poder entender dónde está dentro de la aplicación.

---

# Patrones de Interacción

APPAM soporta los siguientes patrones.

---

# 1. List Management Pattern

Utilizado para administración de colecciones.

Ejemplos:

- Usuarios.
- Ciudades.
- Zonas.
- Congregaciones.

Estructura:

```text
Lista
↓
Filtros
↓
Acciones
↓
Detalle o Edición
```

Una pantalla típica incluye:

```text
------------------------------------------------

Título

Descripción

[Buscar] [Filtros] [Crear]

------------------------------------------------

Tabla / Cards

------------------------------------------------

Paginación

------------------------------------------------
```

---

## Desktop

Puede utilizar:

- Tablas.
- Columnas.
- Acciones inline.

---

## Tablet / Mobile

Debe adaptarse mediante:

- Cards.
- Listas.
- Acciones agrupadas.

No se debe asumir que una tabla con muchas columnas funcionará correctamente.

---

# 2. Dedicated Page Pattern

Patrón recomendado para la mayoría de módulos.

Cada acción importante tiene una ruta propia.

Ejemplo:

```text
/users

/users/new

/users/[id]

/users/[id]/edit
```

Ventajas:

- Mejor experiencia móvil.
- URL permanente.
- Navegación del navegador.
- Mayor espacio disponible.

---

Debe utilizarse cuando:

- El formulario tiene varios campos.
- Existe información relacionada.
- Hay validaciones complejas.
- El usuario puede abandonar y regresar.

---

# 3. Modal Pattern

Los modales son adecuados para acciones pequeñas.

Ejemplos:

- Confirmaciones.
- Cambios simples.
- Configuraciones pequeñas.

Adecuado:

```text
Eliminar usuario

Cambiar estado

Agregar etiqueta
```

No recomendado para:

- Formularios extensos.
- Procesos de varios pasos.
- Carga de archivos.
- Información contextual compleja.

---

# 4. Drawer Pattern

Los drawers pueden utilizarse cuando:

- Se necesita mantener contexto de una lista.
- La información es secundaria.
- La edición es rápida.

Ejemplo:

```text
Usuarios

[Lista]        [Detalle]
```

No debe utilizarse como sustituto universal de páginas.

---

# 5. Wizard Pattern

Utilizado para procesos secuenciales.

Ejemplos:

- Invitación de usuarios.
- Registro de información compleja.
- Procesos administrativos.

Estructura:

```text
Paso 1
↓
Paso 2
↓
Paso 3
↓
Confirmación
```

Cada paso debe:

- Tener una responsabilidad clara.
- Validar su información.
- Permitir regresar.

---

# 6. Workspace Pattern

Utilizado cuando el usuario trabaja continuamente sobre información relacionada.

Ejemplos:

- Planeación.
- Seguimiento.
- Operaciones diarias.

Ejemplo:

Desktop:

```text
------------------------------------------------
| Lista              | Información              |
|                    |                          |
| Elemento 1         | Detalle                  |
| Elemento 2         | Actividades              |
| Elemento 3         | Historial                |
------------------------------------------------
```

Mobile:

```text
Lista
↓
Detalle
```

---

# Selección del Patrón

Utilizar esta guía:

| Necesidad               | Patrón recomendado |
| ----------------------- | ------------------ |
| Lista simple            | List Management    |
| Formulario pequeño      | Modal              |
| Información importante  | Dedicated Page     |
| Flujo largo             | Wizard             |
| Trabajo continuo        | Workspace          |
| Vista rápida contextual | Drawer             |

---

# Arquitectura de una Feature

Una Feature puede contener múltiples experiencias.

Ejemplo:

```text
features/users/
  components/
  pages/
    UsersListPage
    UserDetailPage
    UserEditPage
  flows/
    InviteUserFlow
  hooks/
  services/
  api/
  schemas/
```

No todas las Features tendrán exactamente las mismas páginas.

---

# Formularios

Los formularios deben diseñarse considerando:

- Tamaño del dispositivo.
- Cantidad de campos.
- Validaciones.
- Dependencias entre campos.
- Guardado parcial.

---

## Formularios simples

Pueden utilizar:

- Modal.
- Drawer.
- Página.

---

## Formularios complejos

Deben utilizar:

- Página dedicada.
- Wizard.
- Workspace.

---

# Tablas

Las tablas deben diseñarse pensando en responsive.

Nunca asumir:

```text
Desktop = Mobile reducido
```

Una tabla puede convertirse en:

Desktop:

```text
| Nombre | Email | Estado |
```

Mobile:

```text
Nombre

Email

Estado
```

---

# Estados de la Interfaz

Toda Feature debe considerar:

## Loading

Debe existir una representación visual:

- Skeleton.
- Spinner.
- Placeholder.

---

## Empty State

Cuando no existe información:

Debe explicar:

- Qué ocurrió.
- Qué puede hacer el usuario.

Ejemplo:

"No existen usuarios registrados. Cree una invitación para comenzar."

---

## Error State

Debe mostrar:

- Mensaje comprensible.
- Acción posible.

Ejemplo:

"No fue posible cargar los usuarios. Intentar nuevamente."

---

# Permisos

Los patrones de interacción deben respetar permisos.

Ejemplo:

Un usuario puede:

- Ver lista.
- No crear.
- Editar.
- No eliminar.

La interfaz debe adaptarse:

```typescript
can("user:create");
```

---

# Internacionalización

Toda interacción debe estar preparada para múltiples idiomas.

Incluye:

- Títulos.
- Botones.
- Validaciones.
- Mensajes.
- Estados vacíos.
- Errores.

---

# Accesibilidad

Todos los patrones deben considerar:

- Navegación por teclado.
- Lectores de pantalla.
- Contraste.
- Tamaño adecuado de elementos táctiles.

---

# Anti Patrones

Evitar:

## Modal gigante

Un formulario completo dentro de un modal.

---

## Página sin URL

Una acción importante que solo existe mediante estado interno.

---

## Tabla como única representación

Una tabla que no funciona en móvil.

---

## Componentes inteligentes gigantes

Un componente que contiene:

- UI.
- Llamadas API.
- Validaciones.
- Permisos.
- Transformaciones.

---

# Checklist para una Nueva Feature

Antes de implementar:

- ¿Cuál es el caso de uso principal?
- ¿Es administración o flujo operativo?
- ¿Necesita URL propia?
- ¿Funciona en móvil?
- ¿El formulario es simple o complejo?
- ¿Necesita pasos?
- ¿Necesita contexto permanente?
- ¿Qué permisos intervienen?

---

# Nota de implementación: List Management URL-driven

Para listas administrativas (como Users), adoptar este comportamiento por defecto:

- Filtros en query params (`search`, `status`).
- Ordenamiento en query params (`sort`, `direction`).
- Paginación en query params (`page`, `pageSize`).

Beneficios:

- Estado compartible por URL.
- Navegación natural con atrás/adelante.
- Rehidratación consistente de la pantalla.

Además, para responsive:

- Desktop: tabla con acciones compactas.
- Mobile: tarjetas/lista legible con misma información esencial.
- No ocultar información crítica por breakpoint.

Este patrón mantiene consistencia UX con el enfoque Mobile First y evita estados ocultos en memoria local.

---

# Objetivo Final

Las Features de APPAM deben sentirse coherentes aunque tengan diferentes necesidades funcionales.

La consistencia del sistema no viene de obligar todos los módulos a usar la misma pantalla.

Viene de utilizar los mismos principios:

- Claridad.
- Adaptabilidad.
- Simplicidad.
- Accesibilidad.
- Respeto por el contexto del usuario.
