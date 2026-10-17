import { z } from "zod";
import { NextResponse } from "next/server";

import { authConfig } from "@/config/auth.config";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

const sessionSchema = z.object({
  accessToken: z.string().min(1),
  idToken: z.string().min(1),
});

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  // CSRF Protection: Verify that the request origin matches the host if present
  if (!origin && !referer) {
    console.warn("CSRF blocked: Missing both Origin and Referer headers");
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        console.warn(`CSRF blocked: Origin host '${originHost}' does not match Host '${host}'`);
        return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
      }
    } catch (err) {
      console.error("Failed to parse Origin header:", err);
      return NextResponse.json({ ok: false, message: "Invalid Origin header" }, { status: 400 });
    }
  } else if (referer && host) {
    try {
      const refererHost = new URL(referer).host;
      if (refererHost !== host) {
        console.warn(`CSRF blocked: Referer host '${refererHost}' does not match Host '${host}'`);
        return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
      }
    } catch (err) {
      console.error("Failed to parse Referer header:", err);
      return NextResponse.json({ ok: false, message: "Invalid Referer header" }, { status: 400 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (err) {
    console.error("Failed to parse JSON body:", err);
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  const result = sessionSchema.safeParse(body);
  if (!result.success) {
    console.warn("Invalid payload schema:", result.error.format());
    return NextResponse.json({ ok: false, message: "Invalid payload schema" }, { status: 400 });
  }

  const { accessToken } = result.data;

  try {
    // Validate the token directly with Cognito to ensure authenticity
    const cognitoResponse = await fetch(`https://cognito-idp.${authConfig.region}.amazonaws.com/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": "AWSCognitoIdentityProviderService.GetUser",
      },
      body: JSON.stringify({ AccessToken: accessToken }),
    });

    if (!cognitoResponse.ok) {
      const errorText = await cognitoResponse.text();
      console.warn(
        "Cognito validation failed for access token:",
        cognitoResponse.status,
        errorText
      );
      return NextResponse.json({ ok: false, message: "Invalid or expired token" }, { status: 401 });
    }

    // Securely extract expiration time from the validated accessToken instead of idToken
    let expiresAt: number | undefined;
    try {
      const payloadBase64 = accessToken.split(".")[1];
      const payloadStr = Buffer.from(payloadBase64, "base64").toString("utf-8");
      const tokenPayload = JSON.parse(payloadStr) as { exp?: number };
      expiresAt = tokenPayload.exp;
    } catch (err) {
      console.error("Failed to extract expiration from access token:", err);
    }

    const sessionPayload = {
      isAuthenticated: true,
      expiresAt,
    };

    const response = NextResponse.json({ ok: true });

    const maxAgeSeconds = expiresAt
      ? Math.max(0, expiresAt - Math.floor(Date.now() / 1000))
      : 60 * 60; // 1 hour fallback matching Cognito access token validity

    response.cookies.set(SESSION_COOKIE_NAME, JSON.stringify(sessionPayload), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: maxAgeSeconds,
    });

    return response;
  } catch (err) {
    console.error("Internal Server Error in session API:", err);
    return NextResponse.json({ ok: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
