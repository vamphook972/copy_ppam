const STORAGE_KEY = "appam_pwd_reset_token";

interface TokenPayload {
  email: string;
  exp: number; // Expiración en timestamp (ms)
}

/**
 * Codifica una carga útil de recuperación de contraseña en un token obfuscado Base64 de un solo uso.
 */
export const encodeResetToken = (email: string, ttlMinutes = 15): string => {
  const payload: TokenPayload = {
    email: email.trim().toLowerCase(),
    exp: Date.now() + ttlMinutes * 60 * 1000,
  };
  const jsonStr = JSON.stringify(payload);
  // Usa btoa estándar con codificación URI para evitar caracteres inválidos
  return typeof btoa !== "undefined"
    ? btoa(encodeURIComponent(jsonStr))
    : Buffer.from(jsonStr).toString("base64");
};

/**
 * Decodifica y valida un token de recuperación.
 * Retorna el email si el token es válido y no ha expirado; de lo contrario retorna null.
 */
export const decodeResetToken = (token: string): string | null => {
  if (!token) return null;

  try {
    const jsonStr =
      typeof atob !== "undefined"
        ? decodeURIComponent(atob(token))
        : Buffer.from(token, "base64").toString("utf-8");

    const payload = JSON.parse(jsonStr) as TokenPayload;

    if (!payload?.email || typeof payload.exp !== "number") {
      return null;
    }

    if (payload.exp < Date.now()) {
      return null; // Token expirado
    }

    return payload.email;
  } catch {
    return null;
  }
};

/**
 * Guarda el token de forma efímera en sessionStorage (Opción 3).
 */
export const saveResetTokenToSession = (email: string): void => {
  if (typeof window === "undefined") return;
  try {
    const token = encodeResetToken(email);
    sessionStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Ignorar errores si sessionStorage no está disponible
  }
};

/**
 * Recupera el email desde sessionStorage o desde un token en URL y limpia inmediatamente la referencia.
 */
export const consumeResetToken = (urlToken?: string | null): string | null => {
  if (typeof window === "undefined") return null;

  // 1. Intentar validar primero desde la URL (Opción 2)
  if (urlToken) {
    const emailFromUrl = decodeResetToken(urlToken);
    if (emailFromUrl) {
      return emailFromUrl;
    }
  }

  // 2. Intentar validar desde sessionStorage (Opción 3)
  try {
    const sessionToken = sessionStorage.getItem(STORAGE_KEY);
    if (sessionToken) {
      sessionStorage.removeItem(STORAGE_KEY); // Consumir una sola vez
      return decodeResetToken(sessionToken);
    }
  } catch {
    // Ignorar
  }

  return null;
};
