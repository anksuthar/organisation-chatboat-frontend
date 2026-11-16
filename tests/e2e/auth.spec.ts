import { expect, test } from "@playwright/test";

import { makeFakeJwt } from "./utils";

test.describe("authentication", () => {
  test("unauthenticated visit to /admin redirects to the admin login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("unauthenticated visit to /chat redirects to /login", async ({ page }) => {
    await page.goto("/chat");
    await expect(page).toHaveURL(/\/login/);
  });

  test("admin login redirects to the admin dashboard", async ({ page }) => {
    await page.route("**/api/auth/login", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "set-cookie": `session=${makeFakeJwt("admin", "admin@test.com")}; Path=/; HttpOnly` },
        body: JSON.stringify({ role: "admin" }),
      })
    );
    await page.route("**/api/backend/categories", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
    );
    await page.route("**/api/backend/documents*", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
    );

    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByLabel("Password").fill("secret123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/admin$/);
  });

  test("employee login redirects to chat", async ({ page }) => {
    await page.route("**/api/auth/login", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "set-cookie": `session=${makeFakeJwt("employee", "employee@test.com")}; Path=/; HttpOnly` },
        body: JSON.stringify({ role: "employee" }),
      })
    );
    await page.route("**/api/backend/chat/history", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
    );

    await page.goto("/login");
    await page.getByLabel("Email").fill("employee@test.com");
    await page.getByLabel("Password").fill("secret123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/chat$/);
  });

  test("customer login redirects to chat", async ({ page }) => {
    await page.route("**/api/auth/login", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "set-cookie": `session=${makeFakeJwt("customer", "customer@test.com")}; Path=/; HttpOnly` },
        body: JSON.stringify({ role: "customer" }),
      })
    );
    await page.route("**/api/backend/chat/history", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
    );

    await page.goto("/login");
    await page.getByLabel("Email").fill("customer@test.com");
    await page.getByLabel("Password").fill("secret123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/chat$/);
  });

  test("admin can sign in through the dedicated admin login page", async ({ page }) => {
    await page.route("**/api/auth/login", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "set-cookie": `session=${makeFakeJwt("admin", "admin@test.com")}; Path=/; HttpOnly` },
        body: JSON.stringify({ role: "admin" }),
      })
    );
    await page.route("**/api/backend/categories", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
    );
    await page.route("**/api/backend/documents*", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
    );

    await page.goto("/admin/login");
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByLabel("Password").fill("secret123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/admin$/);
  });

  test("a non-admin account is rejected on the admin login page", async ({ page }) => {
    await page.route("**/api/auth/login", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "set-cookie": `session=${makeFakeJwt("customer", "customer@test.com")}; Path=/; HttpOnly` },
        body: JSON.stringify({ role: "customer" }),
      })
    );
    await page.route("**/api/auth/logout", (route) => route.fulfill({ status: 200, contentType: "application/json", body: "{}" }));

    await page.goto("/admin/login");
    await page.getByLabel("Email").fill("customer@test.com");
    await page.getByLabel("Password").fill("secret123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("This sign-in is for admin accounts only.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("wrong credentials show an inline error", async ({ page }) => {
    await page.route("**/api/auth/login", (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Incorrect email or password" }),
      })
    );

    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Incorrect email or password")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
