import { expect, test } from "@playwright/test";

import { loginAs, mockMe } from "./utils";

function sseFulfill(events: { event: string; data: unknown }[]) {
  const body = events.map((e) => `event: ${e.event}\ndata: ${JSON.stringify(e.data)}\n\n`).join("");
  return { status: 200, contentType: "text/event-stream", body };
}

test.describe("chat", () => {
  test("asking a grounded question streams an answer with a citation", async ({ page, context, baseURL }) => {
    await page.route("**/api/auth/me", (route) => route.fulfill(mockMe("employee")));
    await page.route("**/api/backend/chat/history", (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      }
      return route.continue();
    });
    await page.route("**/api/backend/chat", (route) =>
      route.fulfill(
        sseFulfill([
          { event: "token", data: { text: "You have " } },
          { event: "token", data: { text: "12 casual leaves." } },
          {
            event: "citations",
            data: { citations: [{ document_id: 1, document_title: "Leave Policy", page_number: 3 }] },
          },
          { event: "done", data: {} },
        ])
      )
    );

    await loginAs(context, "employee", baseURL!);
    await page.goto("/chat");

    await page.getByPlaceholder("Ask a question about your company documents…").fill("How many casual leaves do I have?");
    await page.getByRole("button").last().click();

    await expect(page.getByText("You have 12 casual leaves.")).toBeVisible();
    await expect(page.getByText("Leave Policy · p.3")).toBeVisible();
  });

  test("unanswerable question shows the exact fallback message", async ({ page, context, baseURL }) => {
    await page.route("**/api/auth/me", (route) => route.fulfill(mockMe("employee")));
    await page.route("**/api/backend/chat/history", (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      }
      return route.continue();
    });
    await page.route("**/api/backend/chat", (route) =>
      route.fulfill(
        sseFulfill([
          { event: "token", data: { text: "I couldn't find this information in the uploaded documents." } },
          { event: "done", data: {} },
        ])
      )
    );

    await loginAs(context, "employee", baseURL!);
    await page.goto("/chat");

    await page.getByPlaceholder("Ask a question about your company documents…").fill("What's the capital of France?");
    await page.getByRole("button").last().click();

    await expect(
      page.getByText("I couldn't find this information in the uploaded documents.")
    ).toBeVisible();
  });

  test("weak match offers clickable suggestions instead of an answer", async ({ page, context, baseURL }) => {
    await page.route("**/api/auth/me", (route) => route.fulfill(mockMe("employee")));
    await page.route("**/api/backend/chat/history", (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      }
      return route.continue();
    });

    let lastQuestion: string | undefined;
    await page.route("**/api/backend/chat", async (route) => {
      lastQuestion = JSON.parse(route.request().postData() ?? "{}").question;
      if (lastQuestion === "is saturday working") {
        return route.fulfill(
          sseFulfill([
            {
              event: "token",
              data: { text: "I couldn't find an exact answer, but here are some related questions I can answer:" },
            },
            {
              event: "suggestions",
              data: { suggestions: ["What are the standard working days and hours?", "Can I work overtime?"] },
            },
            { event: "done", data: {} },
          ])
        );
      }
      return route.fulfill(
        sseFulfill([
          { event: "token", data: { text: "Monday to Friday, 9am-6pm." } },
          {
            event: "citations",
            data: { citations: [{ document_id: 5, document_title: "Timing Policy", page_number: 1 }] },
          },
          { event: "done", data: {} },
        ])
      );
    });

    await loginAs(context, "employee", baseURL!);
    await page.goto("/chat");

    await page.getByPlaceholder("Ask a question about your company documents…").fill("is saturday working");
    await page.getByRole("button").last().click();

    await expect(page.getByText("I couldn't find an exact answer")).toBeVisible();
    const suggestionButton = page.getByRole("button", { name: "What are the standard working days and hours?" });
    await expect(suggestionButton).toBeVisible();
    await expect(page.getByRole("button", { name: "Can I work overtime?" })).toBeVisible();

    await suggestionButton.click();

    await expect(page.getByText("Monday to Friday, 9am-6pm.")).toBeVisible();
    await expect(page.getByText("Timing Policy · p.1")).toBeVisible();
    expect(lastQuestion).toBe("What are the standard working days and hours?");
  });

  test("clear conversation empties the thread", async ({ page, context, baseURL }) => {
    await page.route("**/api/auth/me", (route) => route.fulfill(mockMe("employee")));
    await page.route("**/api/backend/chat/history", (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            { id: 1, question: "Can I work from home?", answer: "Yes, up to 2 days/week.", created_at: new Date().toISOString() },
          ]),
        });
      }
      if (route.request().method() === "DELETE") {
        return route.fulfill({ status: 204 });
      }
      return route.continue();
    });

    await loginAs(context, "employee", baseURL!);
    await page.goto("/chat");

    // Scoped to the rendered message bubble, not the identically-worded
    // suggested-question chip that appears once the thread is empty.
    const historyBubble = page.locator("p.whitespace-pre-wrap", { hasText: "Can I work from home?" });
    await expect(historyBubble).toBeVisible();

    await page.getByRole("button", { name: "Clear conversation" }).click();
    await page.getByRole("button", { name: "Clear", exact: true }).click();

    await expect(historyBubble).not.toBeVisible();
    await expect(page.getByText("Ask a question about your company documents.")).toBeVisible();
  });
});
