# ADR-004 - Autenticación mediante AWS Amplify y Amazon Cognito

**Estado:** Aceptado

**Fecha:** 2026-07-09

---

# Contexto

APPAM requiere un mecanismo de autenticación seguro, escalable y administrado, que permita la integración con proveedores de identidad externos sin implementar un sistema propio de gestión de credenciales.

Los usuarios de la plataforma son invitados por un administrador y no existe un proceso de registro público.

Además, el sistema debe soportar autenticación federada mediante distintos proveedores de identidad.

---

# Decisión

La autenticación será implementada utilizando **AWS Amplify** como SDK de integración y **Amazon Cognito** como proveedor de identidad.

Las siguientes características serán parte de la solución:

- Inicio de sesión mediante usuario y contraseña.
- Inicio de sesión federado.
- Gestión de sesiones.
- Renovación automática de tokens.
- Cierre de sesión.
- Recuperación de contraseña.
- Confirmación de invitaciones.
- Gestión de usuarios desde el backend.

Los proveedores federados soportados serán:

- Google
- Apple
- Microsoft

La aplicación delegará completamente la autenticación en Cognito.

No se almacenarán contraseñas ni credenciales en el backend de APPAM.

---

# Flujo General

```text
Usuario

↓

AWS Cognito

↓

ID Token
Access Token
Refresh Token

↓

Backend APPAM

↓

Árbol de permisos
Perfil del usuario
Configuración inicial
```

Una vez autenticado el usuario, el backend será responsable de proporcionar:

- Perfil del usuario.
- Árbol de navegación.
- Permisos.
- Configuración de la aplicación.

---

# Consecuencias

## Positivas

- Autenticación administrada por AWS.
- Alta disponibilidad.
- Integración sencilla con proveedores externos.
- Menor superficie de ataque.
- Menor complejidad de mantenimiento.

## Negativas

- Dependencia de AWS Cognito.
- Curva de aprendizaje de Amplify.
- Mayor complejidad inicial en la configuración.

---

# Alternativas consideradas

## Auth0

Descartado por incrementar el costo operativo y añadir un proveedor adicional.

## Firebase Authentication

Descartado para mantener la infraestructura alineada con AWS.

## Implementar autenticación propia

Descartado por motivos de seguridad y mantenimiento.

---

# Referencias

- AWS Amplify
- Amazon Cognito
- OAuth 2.0
- OpenID Connect
