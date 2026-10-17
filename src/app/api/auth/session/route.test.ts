import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { server } from "@/test/msw/server";

import { DELETE, POST } from "./route";

vi.mock("@/config/auth.config", () => ({
  authConfig: {
    region: "us-east-1",
    userPoolId: "poolId",
    clientId: "clientId",
  },
}));

describe("Session API Route Handler", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 for incorrect payload schema (incorrecto)", async () => {
    const request = new Request("http://localhost/api/auth/session", {
      method: "POST",
      body: JSON.stringify({ wrongKey: "token" }),
      headers: {
        host: "localhost",
        origin: "http://localhost",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.ok).toBe(false);
    expect(data.message).toContain("schema");
  });

  it("returns 401 when Cognito validation fails (Cognito inválido)", async () => {
    server.use(
      http.post("https://cognito-idp.us-east-1.amazonaws.com/", () => {
        return new HttpResponse(null, { status: 400 });
      })
    );

    const request = new Request("http://localhost/api/auth/session", {
      method: "POST",
      body: JSON.stringify({ accessToken: "invalid-token", idToken: "some-id" }),
      headers: {
        host: "localhost",
        origin: "http://localhost",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.ok).toBe(false);
    expect(data.message).toBe("Invalid or expired token");
  });

  it("returns 200 and sets cookie on successful Cognito validation (correcto)", async () => {
    server.use(
      http.post("https://cognito-idp.us-east-1.amazonaws.com/", () => {
        return HttpResponse.json({ UserAttributes: [] });
      })
    );

    // Mock an access token which has a payload split by dot
    const mockAccessToken =
      "header." +
      Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString(
        "base64"
      ) +
      ".signature";

    const request = new Request("http://localhost/api/auth/session", {
      method: "POST",
      body: JSON.stringify({ accessToken: mockAccessToken, idToken: "id" }),
      headers: {
        host: "localhost",
        origin: "http://localhost",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);

    const cookieHeader = response.headers.get("Set-Cookie");
    expect(cookieHeader).toContain(SESSION_COOKIE_NAME);
  });

  it("returns 403 when CSRF validation fails", async () => {
    const request = new Request("http://localhost/api/auth/session", {
      method: "POST",
      body: JSON.stringify({ accessToken: "token", idToken: "id" }),
      headers: {
        host: "localhost",
        origin: "http://malicious.com",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.ok).toBe(false);
    expect(data.message).toBe("Forbidden");
  });

  it("DELETE clears the session cookie (elimina cookie)", async () => {
    const response = await DELETE();
    expect(response.status).toBe(200);
    const cookieHeader = response.headers.get("Set-Cookie");
    expect(cookieHeader?.toLowerCase()).toContain("max-age=0");
  });
});
