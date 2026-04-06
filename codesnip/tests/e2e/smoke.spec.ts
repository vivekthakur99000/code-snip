import { expect, test } from "@playwright/test";

test("health endpoint returns ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toEqual({ status: "ok" });
});

test.describe("core snippet flow placeholders", () => {
  test.skip("login flow via GitHub OAuth", async () => {
    // Requires a dedicated OAuth test app and seeded test user.
  });

  test.skip("create snippet flow", async () => {
    // Requires authenticated storage state and deterministic fixture data.
  });

  test.skip("view public snippet page", async () => {
    // Requires seeded public snippet slug for stable assertions.
  });
});
