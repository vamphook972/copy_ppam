import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("APPAM"),
  NEXT_PUBLIC_API_URL: z.url(),
  NEXT_PUBLIC_AWS_REGION: z.string(),
  NEXT_PUBLIC_USER_POOL_ID: z.string(),
  NEXT_PUBLIC_USER_POOL_CLIENT_ID: z.string(),
  NEXT_PUBLIC_COGNITO_DOMAIN: z.string().default("dev-appam-co.auth.us-east-1.amazoncognito.com"),
  NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN: z.string().optional(),
  NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT: z.string().optional(),
});

const result = schema.safeParse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
  NEXT_PUBLIC_USER_POOL_ID: process.env.NEXT_PUBLIC_USER_POOL_ID,
  NEXT_PUBLIC_USER_POOL_CLIENT_ID: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
  NEXT_PUBLIC_COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
  NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN,
  NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT,
});

if (!result.success) {
  const errors = result.error.issues
    .map((issue) => {
      const key = issue.path.join(".");
      return `• ${key}: ${issue.message}`;
    })
    .join("\n");

  throw new Error(`
❌ Error al validar las variables de entorno.

Se encontraron los siguientes problemas:

${errors}

Verifica tu archivo .env.local y vuelve a iniciar la aplicación.
`);
}

export const env = result.data;
