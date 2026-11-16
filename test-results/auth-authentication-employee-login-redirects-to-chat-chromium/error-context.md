# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> authentication >> employee login redirects to chat
- Location: tests/e2e/auth.spec.ts:40:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/chat$/
Received string:  "http://localhost:3100/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × unexpected value "http://localhost:3100/login"

```

```yaml
- heading "Knowledge Base" [level=1]
- paragraph: Sign in to continue
- text: Email
- textbox "Email":
  - /placeholder: you@company.com
  - text: employee@test.com
- text: Password
- textbox "Password":
  - /placeholder: ••••••••
  - text: secret123
- button "Sign in"
- paragraph:
  - text: Store administrator?
  - link "Sign in here":
    - /url: /admin/login
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | import { makeFakeJwt } from "./utils";
  4   | 
  5   | test.describe("authentication", () => {
  6   |   test("unauthenticated visit to /admin redirects to the admin login", async ({ page }) => {
  7   |     await page.goto("/admin");
  8   |     await expect(page).toHaveURL(/\/admin\/login/);
  9   |   });
  10  | 
  11  |   test("unauthenticated visit to /chat redirects to /login", async ({ page }) => {
  12  |     await page.goto("/chat");
  13  |     await expect(page).toHaveURL(/\/login/);
  14  |   });
  15  | 
  16  |   test("admin login redirects to the admin dashboard", async ({ page }) => {
  17  |     await page.route("**/api/auth/login", (route) =>
  18  |       route.fulfill({
  19  |         status: 200,
  20  |         contentType: "application/json",
  21  |         headers: { "set-cookie": `session=${makeFakeJwt("admin", "admin@test.com")}; Path=/; HttpOnly` },
  22  |         body: JSON.stringify({ role: "admin" }),
  23  |       })
  24  |     );
  25  |     await page.route("**/api/backend/categories", (route) =>
  26  |       route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
  27  |     );
  28  |     await page.route("**/api/backend/documents*", (route) =>
  29  |       route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
  30  |     );
  31  | 
  32  |     await page.goto("/login");
  33  |     await page.getByLabel("Email").fill("admin@test.com");
  34  |     await page.getByLabel("Password").fill("secret123");
  35  |     await page.getByRole("button", { name: "Sign in" }).click();
  36  | 
  37  |     await expect(page).toHaveURL(/\/admin$/);
  38  |   });
  39  | 
  40  |   test("employee login redirects to chat", async ({ page }) => {
  41  |     await page.route("**/api/auth/login", (route) =>
  42  |       route.fulfill({
  43  |         status: 200,
  44  |         contentType: "application/json",
  45  |         headers: { "set-cookie": `session=${makeFakeJwt("employee", "employee@test.com")}; Path=/; HttpOnly` },
  46  |         body: JSON.stringify({ role: "employee" }),
  47  |       })
  48  |     );
  49  |     await page.route("**/api/backend/chat/history", (route) =>
  50  |       route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
  51  |     );
  52  | 
  53  |     await page.goto("/login");
  54  |     await page.getByLabel("Email").fill("employee@test.com");
  55  |     await page.getByLabel("Password").fill("secret123");
  56  |     await page.getByRole("button", { name: "Sign in" }).click();
  57  | 
> 58  |     await expect(page).toHaveURL(/\/chat$/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  59  |   });
  60  | 
  61  |   test("customer login redirects to chat", async ({ page }) => {
  62  |     await page.route("**/api/auth/login", (route) =>
  63  |       route.fulfill({
  64  |         status: 200,
  65  |         contentType: "application/json",
  66  |         headers: { "set-cookie": `session=${makeFakeJwt("customer", "customer@test.com")}; Path=/; HttpOnly` },
  67  |         body: JSON.stringify({ role: "customer" }),
  68  |       })
  69  |     );
  70  |     await page.route("**/api/backend/chat/history", (route) =>
  71  |       route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
  72  |     );
  73  | 
  74  |     await page.goto("/login");
  75  |     await page.getByLabel("Email").fill("customer@test.com");
  76  |     await page.getByLabel("Password").fill("secret123");
  77  |     await page.getByRole("button", { name: "Sign in" }).click();
  78  | 
  79  |     await expect(page).toHaveURL(/\/chat$/);
  80  |   });
  81  | 
  82  |   test("admin can sign in through the dedicated admin login page", async ({ page }) => {
  83  |     await page.route("**/api/auth/login", (route) =>
  84  |       route.fulfill({
  85  |         status: 200,
  86  |         contentType: "application/json",
  87  |         headers: { "set-cookie": `session=${makeFakeJwt("admin", "admin@test.com")}; Path=/; HttpOnly` },
  88  |         body: JSON.stringify({ role: "admin" }),
  89  |       })
  90  |     );
  91  |     await page.route("**/api/backend/categories", (route) =>
  92  |       route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
  93  |     );
  94  |     await page.route("**/api/backend/documents*", (route) =>
  95  |       route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
  96  |     );
  97  | 
  98  |     await page.goto("/admin/login");
  99  |     await page.getByLabel("Email").fill("admin@test.com");
  100 |     await page.getByLabel("Password").fill("secret123");
  101 |     await page.getByRole("button", { name: "Sign in" }).click();
  102 | 
  103 |     await expect(page).toHaveURL(/\/admin$/);
  104 |   });
  105 | 
  106 |   test("a non-admin account is rejected on the admin login page", async ({ page }) => {
  107 |     await page.route("**/api/auth/login", (route) =>
  108 |       route.fulfill({
  109 |         status: 200,
  110 |         contentType: "application/json",
  111 |         headers: { "set-cookie": `session=${makeFakeJwt("customer", "customer@test.com")}; Path=/; HttpOnly` },
  112 |         body: JSON.stringify({ role: "customer" }),
  113 |       })
  114 |     );
  115 |     await page.route("**/api/auth/logout", (route) => route.fulfill({ status: 200, contentType: "application/json", body: "{}" }));
  116 | 
  117 |     await page.goto("/admin/login");
  118 |     await page.getByLabel("Email").fill("customer@test.com");
  119 |     await page.getByLabel("Password").fill("secret123");
  120 |     await page.getByRole("button", { name: "Sign in" }).click();
  121 | 
  122 |     await expect(page.getByText("This sign-in is for admin accounts only.")).toBeVisible();
  123 |     await expect(page).toHaveURL(/\/admin\/login/);
  124 |   });
  125 | 
  126 |   test("wrong credentials show an inline error", async ({ page }) => {
  127 |     await page.route("**/api/auth/login", (route) =>
  128 |       route.fulfill({
  129 |         status: 401,
  130 |         contentType: "application/json",
  131 |         body: JSON.stringify({ detail: "Incorrect email or password" }),
  132 |       })
  133 |     );
  134 | 
  135 |     await page.goto("/login");
  136 |     await page.getByLabel("Email").fill("admin@test.com");
  137 |     await page.getByLabel("Password").fill("wrong-password");
  138 |     await page.getByRole("button", { name: "Sign in" }).click();
  139 | 
  140 |     await expect(page.getByText("Incorrect email or password")).toBeVisible();
  141 |     await expect(page).toHaveURL(/\/login/);
  142 |   });
  143 | });
  144 | 
```