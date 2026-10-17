# Manual de Despliegue del Frontend (AWS Amplify + Cloudflare)

Este documento detalla el procedimiento para el aprovisionamiento de la infraestructura y el pipeline de despliegue continuo de la aplicación frontend `appam-admin`.

---

## 1. Arquitectura de Despliegue

La aplicación `appam-admin` se ejecuta en una arquitectura Serverless utilizando **AWS Amplify Hosting (WEB_COMPUTE)** para soportar Server-Side Rendering (SSR) e interactuar de forma segura con la API de sesión.

La resolución de nombres y la protección perimetral están delegadas a **Cloudflare**, el cual actúa como proxy inverso hacia la distribución interna de AWS Amplify.

---

## 2. Estructura de Terraform (Modularizada)

La infraestructura está completamente desacoplada y modularizada. Los recursos comunes y de DNS están empaquetados en módulos reutilizables bajo `infra/modules/`.

```
infra/
├── environments/
│   ├── dev/
│   │   ├── backend.tf
│   │   ├── dev.auto.tfvars.json
│   │   ├── main.tf
│   │   ├── providers.tf
│   │   └── variables.tf
│   └── prod/
│       ├── backend.tf
│       ├── main.tf
│       ├── providers.tf
│       ├── prod.auto.tfvars.json
│       └── variables.tf
└── modules/
    ├── amplify/
    │   ├── locals.tf
    │   ├── main.tf
    │   ├── outputs.tf
    │   ├── variables.tf
    │   └── versions.tf
    ├── cloudflare/
    │   ├── locals.tf
    │   ├── main.tf
    │   ├── outputs.tf
    │   ├── variables.tf
    │   └── versions.tf
    └── globals/
        └── backend-common.tfvars
```

---

## 3. Conexión a Repositorios Privados (Limitación de AWS Amplify)

> [!IMPORTANT]
> **Limitación de AWS CodeConnections:**
> A pesar de que AWS permite registrar conexiones de GitLab a nivel de cuenta mediante AWS CodeConnections (antes CodeStar Connections), la API pública de AWS Amplify (y por ende el recurso `aws_amplify_app` en Terraform) **no soporta la vinculación nativa de repositorios usando el ARN de CodeConnections**.
>
> Para autorizar el acceso al repositorio privado de GitLab en Terraform de forma automatizada, se utiliza un **GitLab Project Access Token** (o Personal Access Token) con permisos de lectura (`read_repository`), provisto en la variable `oauth_token`.

---

## 4. Guía de Ejecución de Terraform (Aprovisionamiento Manual)

El aprovisionamiento y cambios de infraestructura se realizan de forma manual y controlada desde el terminal de operaciones utilizando las credenciales administrativas de AWS y Cloudflare correspondientes.

### Procedimiento de Aprovisionamiento:

1. Autenticarse en AWS con el perfil correspondiente al ambiente a desplegar.
2. Navegar al entorno específico:
   ```bash
   cd infra/environments/[dev|prod]
   ```
3. Inicializar el backend de Terraform:
   ```bash
   terraform init
   ```
4. Generar el plan de ejecución inyectando las variables globales comunes:
   ```bash
   terraform plan -var-file="../../modules/globals/backend-common.tfvars"
   ```
5. Aplicar la infraestructura:
   ```bash
   terraform apply -auto-approve -var-file="../../modules/globals/backend-common.tfvars"
   ```

---

## 5. Pipeline de Despliegue Continuo (GitLab CI/CD)

Una vez aprovisionada la infraestructura, GitLab CI/CD se encarga de auditar la calidad del código y notificar a AWS Amplify para que realice la compilación y despliegue del software.

### Etapas del Pipeline

El archivo `.gitlab-ci.yml` define los siguientes pasos secuenciales:

1.  **`validate`**: Ejecuta las tareas de linternas y comprobación de tipos estáticos (`npm run lint` y `npm run type-check`).
2.  **`test`**: Corre la suite de pruebas unitarias (`npm run test`).
3.  **`deploy`**: Invoca el despliegue automático mediante la CLI de AWS:
    - **En DEV (`develop`):** El despliegue a la rama `develop` de Amplify se ejecuta de manera automática tras pasar los tests.
    - **En PROD (`master`):** El despliegue a la rama `master` de Amplify requiere una aprobación manual en la interfaz de GitLab CI/CD para mayor seguridad.

---

## 6. Configuración de Variables de Entorno

### Variables de Entorno del Cliente (Build-time)

Las variables de entorno requeridas por Next.js que inicien con `NEXT_PUBLIC_` deben configurarse directamente en la consola de AWS Amplify:

1. Ingresar a la **Consola de AWS > AWS Amplify**.
2. Seleccionar la aplicación correspondiente (`appam-admin-dev` o `appam-admin-prod`).
3. Ir a **App Settings > Environment Variables**.
4. Definir las variables requeridas (ej: `NEXT_PUBLIC_API_URL`). AWS Amplify las inyectará en el archivo `.env.production` durante la fase de compilación especificada en `amplify.yml`.

### Variables de GitLab CI/CD (Settings > CI/CD > Variables)

Es obligatorio configurar los siguientes secretos en el repositorio de GitLab para permitir la comunicación con AWS:

- `AWS_DEPLOY_ROLE_ARN`: El ARN del rol IAM OIDC que GitLab CI/CD asume temporalmente para interactuar con AWS.
- `AMPLIFY_APP_ID`: El ID de la aplicación creada por Terraform en AWS Amplify (necesario para direccionar el comando de despliegue).
