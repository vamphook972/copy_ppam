import { expect, test } from "@playwright/test";

const buildSessionCookie = () => {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
  return {
    name: "appam_session",
    value: JSON.stringify({
      isAuthenticated: true,
      user: {
        id: "e2e-user-id",
        email: "e2e@appam.local",
        firstName: "E2E",
        lastName: "User",
      },
      expiresAt,
    }),
    domain: "localhost",
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "Lax" as const,
  };
};

test.describe("Baseline smoke", () => {
  test("should render login page in spanish", async ({ page }) => {
    await page.goto("/es/login");
    await expect(page.getByRole("button", { name: /iniciar sesión/i })).toBeVisible();
  });

  test("should redirect authenticated users away from login and forgot-password", async ({
    page,
    context,
  }) => {
    await context.addCookies([buildSessionCookie()]);

    await page.goto("/es/login");
    await expect(page).toHaveURL(/\/es\/home$/);

    await page.goto("/es/forgot-password");
    await expect(page).toHaveURL(/\/es\/home$/);
  });

  test("should redirect reset-password to forgot-password when email query is missing", async ({
    page,
  }) => {
    await page.goto("/es/reset-password");
    await expect(page).toHaveURL(/\/es\/forgot-password$/);
  });

  test("should navigate dashboard core routes", async ({ page, context }) => {
    await context.addCookies([buildSessionCookie()]);

    await page.goto("/es/home");
    await expect(page).toHaveURL(/\/es\/home$/);
    await expect(page.getByRole("heading", { name: /panel principal/i })).toBeVisible();

    await page.goto("/es/users");
    await expect(page).toHaveURL(/\/es\/users$/);
    // await expect(page.getByRole("heading", { name: /users/i })).toBeVisible();

    await page.goto("/es/settings");
    await expect(page).toHaveURL(/\/es\/settings$/);
    // await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
  });
});
