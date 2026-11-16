import { expect, test } from "@playwright/test";

import { loginAs, mockMe } from "./utils";

test("employee is redirected away from /admin to /unauthorized", async ({ page, context, baseURL }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill(mockMe("employee")));

  await loginAs(context, "employee", baseURL!);
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/unauthorized/);
  await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
});

test("customer is redirected away from /admin to /unauthorized", async ({ page, context, baseURL }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill(mockMe("customer")));

  await loginAs(context, "customer", baseURL!);
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/unauthorized/);
  await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
});

test("admin can access /admin", async ({ page, context, baseURL }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill(mockMe("admin")));
  await page.route("**/api/backend/categories", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
  );
  await page.route("**/api/backend/documents*", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
  );

  await loginAs(context, "admin", baseURL!);
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Admin dashboard" })).toBeVisible();
});
