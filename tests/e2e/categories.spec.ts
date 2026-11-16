import { expect, test } from "@playwright/test";

import { loginAs, mockMe } from "./utils";

interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

test("admin can create, edit, and delete a category", async ({ page, context, baseURL }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill(mockMe("admin")));

  let categories: Category[] = [];
  let nextId = 1;

  await page.route("**/api/backend/categories/**", async (route) => {
    const request = route.request();
    const idMatch = request.url().match(/categories\/(\d+)/);
    if (!idMatch) return route.continue();
    const id = Number(idMatch[1]);

    if (request.method() === "PUT") {
      const body = request.postDataJSON();
      categories = categories.map((c) => (c.id === id ? { ...c, ...body } : c));
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(categories.find((c) => c.id === id)),
      });
    }
    if (request.method() === "DELETE") {
      categories = categories.filter((c) => c.id !== id);
      return route.fulfill({ status: 204 });
    }
    return route.continue();
  });

  await page.route("**/api/backend/categories", async (route) => {
    const request = route.request();
    if (request.method() === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(categories) });
    }
    if (request.method() === "POST") {
      const body = request.postDataJSON();
      const created: Category = {
        id: nextId++,
        name: body.name,
        description: body.description ?? null,
        created_at: new Date().toISOString(),
      };
      categories.push(created);
      return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify(created) });
    }
    return route.continue();
  });

  await loginAs(context, "admin", baseURL!);
  await page.goto("/admin/categories");

  await expect(page.getByText("No categories yet.")).toBeVisible();

  // Create
  await page.getByRole("button", { name: "New category" }).click();
  await page.getByLabel("Name").fill("Leave Policy");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("cell", { name: "Leave Policy", exact: true })).toBeVisible();

  // Edit
  await page.getByRole("button", { name: "Edit Leave Policy" }).click();
  await page.getByLabel("Name").fill("Leave Policy Updated");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("cell", { name: "Leave Policy Updated", exact: true })).toBeVisible();

  // Delete
  await page.getByRole("button", { name: "Delete Leave Policy Updated" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByText("No categories yet.")).toBeVisible();
});
