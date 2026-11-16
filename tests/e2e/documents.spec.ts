import { expect, test } from "@playwright/test";

import { loginAs, mockMe } from "./utils";

test("uploading a document shows it as processing, then processed", async ({ page, context, baseURL }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill(mockMe("admin")));
  await page.route("**/api/backend/categories", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ id: 1, name: "HR Policy", description: null, created_at: new Date().toISOString() }]),
    })
  );

  let status: "processing" | "processed" = "processing";
  let getCallCount = 0;

  const documentPayload = () => ({
    id: 1,
    title: "Leave Policy",
    filename: "leave-policy.pdf",
    category_id: 1,
    uploaded_by: 1,
    total_pages: status === "processed" ? 4 : null,
    status,
    error_message: null,
    created_at: new Date().toISOString(),
  });

  await page.route("**/api/backend/documents/upload", (route) =>
    route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify(documentPayload()) })
  );

  await page.route("**/api/backend/documents*", (route) => {
    if (route.request().method() !== "GET") return route.continue();
    getCallCount += 1;
    // Flip to "processed" after a couple of polls, simulating the background pipeline finishing.
    if (getCallCount >= 3) status = "processed";
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([documentPayload()]) });
  });

  await loginAs(context, "admin", baseURL!);
  await page.goto("/admin/documents/upload");

  await page.setInputFiles('input[type="file"]', {
    name: "leave-policy.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 fake content"),
  });
  await page.getByLabel("Title").fill("Leave Policy");
  await page.getByRole("combobox", { name: "Category" }).click();
  await page.getByRole("option", { name: "HR Policy" }).click();
  await page.getByRole("button", { name: "Upload" }).click();

  await expect(page).toHaveURL(/\/admin\/documents$/);
  await expect(page.getByText("Processing", { exact: true })).toBeVisible();
  await expect(page.getByText("Processed", { exact: true })).toBeVisible({ timeout: 10_000 });
});
