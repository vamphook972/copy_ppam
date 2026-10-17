import { Amplify } from "aws-amplify";

import { authConfig } from "@/config/auth.config";

let configured = false;

export const configureAmplify = () => {
  if (configured) return;

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: authConfig.userPoolId,
        userPoolClientId: authConfig.clientId,
        loginWith: {
          oauth: {
            domain: authConfig.cognitoDomain,
            scopes: ["email", "openid", "profile", "aws.cognito.signin.user.admin"],
            redirectSignIn: authConfig.redirectSignIn,
            redirectSignOut: authConfig.redirectSignOut,
            responseType: "code",
          },
        },
      },
    },
  });

  configured = true;
};
