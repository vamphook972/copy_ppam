# Form Development Guide

## APPAM - Sistema Web de Administración

Versión: **1.0**

Última actualización: **2026-07-09**

---

# Objetivo

Este documento define los estándares para crear formularios dentro de APPAM.

El objetivo es establecer una forma consistente de construir:

- Formularios simples.
- Formularios complejos.
- Flujos multi-paso.
- Validaciones.
- Manejo de errores.
- Integración con APIs.
- Experiencias responsive.

---

# Filosofía

Un formulario es un proceso de captura y validación de información.

No es únicamente un conjunto de inputs.

Un formulario debe considerar:

- Intención del usuario.
- Complejidad del proceso.
- Validaciones.
- Estados.
- Errores.
- Permisos.
- Dispositivo utilizado.

---

# Arquitectura de Formularios

Los formularios siguen esta estructura:

```text
Page
 ↓
Feature Form Container
 ↓
Form Components
 ↓
React Hook Form
 ↓
Zod Schema
 ↓
Mutation Hook
 ↓
Service
 ↓
API
```

---

# Librerías Estándar

APPAM utilizará:

## React Hook Form

Responsable de:

- Estado del formulario.
- Registro de campos.
- Validación integrada.
- Performance.

---

## Zod

Responsable de:

- Definir contratos.
- Validación.
- Inferencia de tipos TypeScript.

---

## shadcn/ui Form Components

Base visual:

- FormField.
- Input.
- Select.
- Checkbox.
- Textarea.
- DatePicker.

---

# Ubicación de Formularios

Los formularios pertenecen a una Feature.

Ejemplo:

```text
features/users/
  ├── components/
  │   └── UserForm.tsx
  ├── schemas/
  │   └── user.schema.ts
  ├── hooks/
  │   └── useCreateUser.ts
```

---

# No Crear Formularios Globales

Evitar:

```text
components/forms/UserForm.tsx
```

si solamente pertenece a Users.

---

# Tipos de Formularios

APPAM reconoce tres categorías.

---

# 1. Formulario Simple

Características:

- Pocos campos.
- Sin pasos.
- Validaciones básicas.

Ejemplos:

- Actualizar nombre.
- Cambiar estado.
- Configuración pequeña.

Puede utilizar:

- Página.
- Drawer.
- Modal.

---

Ejemplo:

```text
Editar nombre

[ Nombre ]

[ Guardar ]
```

---

# 2. Formulario Complejo

Características:

- Muchos campos.
- Dependencias.
- Información relacionada.
- Validaciones múltiples.

Ejemplos:

- Crear usuario.
- Registrar inscripción.
- Configurar entidad.

Debe utilizar:

- Página dedicada.
- Layout completo.

---

Ejemplo:

```text
/users/new
```

---

# 3. Wizard

Utilizar cuando el usuario completa un proceso.

Ejemplos:

- Invitación.
- Registro largo.
- Configuración inicial.

Estructura:

```text
Paso 1
 |
Paso 2
 |
Paso 3
 |
Confirmación
```

---

# Form Schema

Cada formulario debe tener un schema Zod.

Ejemplo:

```ts
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(3),
});
```

---

# Inferencia de Tipos

Nunca duplicar interfaces manualmente.

Correcto:

```ts
type UserFormValues = z.infer<typeof userSchema>;
```

---

# Separación DTO vs Form Model

El modelo del formulario no necesariamente es igual al backend.

Ejemplo:

Formulario:

```ts
{
    firstName:"",
    lastName:""
}
```

Backend:

```ts
{
    first_name:"",
    last_name:""
}
```

La transformación pertenece al mapper.

---

# Componentes de Formulario

Los campos deben reutilizar componentes consistentes del Design System.

## Patrón recomendado en APPAM

Para formularios interactivos en cliente, priorizar:

- `FormField` para label + control + help + error.
- `FormActions` para acciones primarias/secundarias.
- `AuthFeedback` o patrón equivalente de feedback inline cuando aplique.
- `notify` para feedback global no bloqueante (éxito/error), evitando duplicidad con mensajes inline.

Esto asegura consistencia visual, accesibilidad y menor duplicación.

Ejemplo:

```tsx
<FormField
  id="email"
  label={t("emailField")}
  type="email"
  autoComplete="email"
  required
  disabled={isLoading}
  error={errors.email?.message}
/>

<FormActions
  submitLabel={isSubmitting ? t("loading") : t("save")}
  isSubmitting={isSubmitting}
  isSubmitDisabled={isLoading}
/>
```

---

# Organización Visual

Un formulario complejo debe agrupar información.

Ejemplo:

```text
Usuario
 ├── Información personal
 ├── Contacto
 ├── Roles
 └── Permisos
```

---

# Form Layout

Los formularios deben utilizar layouts consistentes.

Ejemplo:

```tsx
<FormLayout>
  <PersonalInformation />

  <SecurityInformation />
</FormLayout>
```

---

# Formularios Responsive

Todo formulario debe funcionar en:

- Mobile.
- Tablet.
- Desktop.

---

Desktop:

```text
Nombre       Apellido

Email        Teléfono
```

---

Mobile:

```text
Nombre

Apellido

Email

Teléfono
```

---

# Botones de Acción

Todos los formularios deben definir:

- Acción primaria.
- Cancelar.
- Estado loading.

Ejemplo:

```text
[Cancelar]     [Guardar]
```

---

# Submit

Nunca manejar submit directamente en componentes pequeños.

Correcto:

```tsx
<form onSubmit={handleSubmit(onSubmit)}>
```

dentro del componente formulario.

---

# Estados del Formulario

Todo formulario debe manejar:

## Idle

Estado inicial.

---

## Loading

Mientras guarda:

```text
Guardando...
```

Debe:

- Deshabilitar botones.
- Evitar doble envío.

---

## Success

Después de guardar:

Opciones:

- Redireccionar.
- Actualizar datos.
- Mostrar confirmación.

---

## Error

Mostrar:

- Error general.
- Error por campo.

---

# Errores del Backend

Ejemplo:

Backend responde:

```json
{
  "errors": {
    "email": "Correo ya registrado"
  }
}
```

Debe mapearse:

```text
Email

Correo ya registrado
```

---

# Validaciones

Existen dos niveles.

---

## Frontend

Validaciones rápidas:

- Requeridos.
- Formato.
- Longitud.

---

## Backend

Reglas reales:

- Existencia.
- Permisos.
- Estados.
- Relaciones.

---

# Campos Dependientes

Ejemplo:

Ciudad depende de País.

Flujo:

```text
Selecciona país
↓
Carga ciudades
↓
Selecciona ciudad
```

La lógica debe vivir en hooks.

No dentro del input.

---

# Formularios con Archivos

Los archivos deben manejarse separadamente.

Flujo:

```text
Seleccionar archivo
↓
Validar tamaño/tipo
↓
Upload
↓
Obtener referencia
↓
Guardar formulario
```

---

# Formularios Multi Paso

Cada paso debe tener:

- Schema propio si aplica.
- Estado persistente.
- Validación independiente.

Ejemplo:

```text
InvitationWizard
  ├── StepAccount
  ├── StepRoles
  └── StepConfirmation
```

---

# Permisos en Formularios

Antes de mostrar acciones:

```tsx
<PermissionGuard permission="user:create">
  <SubmitButton />
</PermissionGuard>
```

---

# Formularios Editables

Al editar:

Debe diferenciar:

- Datos iniciales.
- Cambios realizados.

Ejemplo:

```text
Cancelar

↓

Restaurar valores originales
```

---

# Dirty State

Los formularios complejos deben detectar cambios.

Permite:

- Confirmar salida.
- Evitar pérdida de información.

---

# Loading Inicial

Cuando se carga información:

No mostrar formulario vacío.

Utilizar:

- Skeleton.
- Estado loading.

---

# Accesibilidad

Todo formulario debe tener:

- Labels.
- Mensajes asociados.
- Navegación teclado.
- Estados ARIA.

---

# Internacionalización

Nunca escribir textos directamente.

Incorrecto:

```tsx
"Guardar usuario";
```

Correcto:

```tsx
t("actions.save");
```

---

# Testing

Los formularios deben probar:

- Render inicial.
- Validaciones.
- Submit correcto.
- Errores backend.
- Permisos.

---

# Anti Patrones

## Formulario gigante

Un componente de miles de líneas.

---

## Validaciones duplicadas

Ejemplo:

Schema Zod:

```text
email requerido
```

y además:

```tsx
if(!email)
```

---

## Enviar DTO directamente

La UI no debe conocer nombres del backend.

---

## Mezclar API con UI

Incorrecto:

```tsx
onSubmit(){

 axios.post()

}
```

---

## Modal para procesos largos

Un flujo complejo debe tener página propia.

---

# Checklist Nuevo Formulario

Antes de crear:

- ¿Es simple o complejo?
- ¿Necesita página?
- ¿Necesita wizard?
- ¿Tiene schema?
- ¿Tiene permisos?
- ¿Tiene estados?
- ¿Tiene errores backend?
- ¿Funciona en móvil?
- ¿Está traducido?

---

# Objetivo Final

Los formularios de APPAM deben ser:

- Consistentes.
- Tipados.
- Accesibles.
- Responsive.
- Fáciles de mantener.
- Independientes del backend.

Un formulario bien construido debe guiar al usuario y proteger la calidad de la información ingresada.
