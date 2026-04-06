import { describe, expect, it } from "vitest";

import {
  snippetIdSchema,
  snippetInputSchema,
  snippetPaginationInputSchema,
  snippetSearchInputSchema,
  snippetUpdateInputSchema,
} from "~/lib/validators/snippet";

describe("snippetInputSchema", () => {
  it("accepts valid snippet input", () => {
    const parsed = snippetInputSchema.safeParse({
      title: "Hello",
      code: "console.log('hello')",
      language: "typescript",
      tags: ["nextjs", "trpc"],
      isPublic: true,
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects empty code", () => {
    const parsed = snippetInputSchema.safeParse({
      title: "No code",
      code: "",
      language: "typescript",
      tags: [],
      isPublic: false,
    });

    expect(parsed.success).toBe(false);
  });
});

describe("snippetIdSchema", () => {
  it("accepts valid UUID", () => {
    const parsed = snippetIdSchema.safeParse({
      id: "6f6dc5f3-2f1a-4e84-a0f0-d9f157f3942b",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects invalid UUID", () => {
    const parsed = snippetIdSchema.safeParse({ id: "abc" });
    expect(parsed.success).toBe(false);
  });
});

describe("snippetUpdateInputSchema", () => {
  it("requires both id and snippet payload", () => {
    const parsed = snippetUpdateInputSchema.safeParse({
      id: "6f6dc5f3-2f1a-4e84-a0f0-d9f157f3942b",
      title: "Updated",
      code: "SELECT 1;",
      language: "sql",
      tags: ["sql"],
      isPublic: false,
    });

    expect(parsed.success).toBe(true);
  });
});

describe("snippetPaginationInputSchema", () => {
  it("applies default limit", () => {
    const parsed = snippetPaginationInputSchema.parse({});
    expect(parsed.limit).toBe(20);
  });

  it("rejects out-of-range limits", () => {
    const parsed = snippetPaginationInputSchema.safeParse({ limit: 100 });
    expect(parsed.success).toBe(false);
  });
});

describe("snippetSearchInputSchema", () => {
  it("accepts a valid search query", () => {
    const parsed = snippetSearchInputSchema.safeParse({
      query: "drizzle transaction",
      language: "typescript",
      limit: 10,
    });

    expect(parsed.success).toBe(true);
  });

  it("accepts empty query for language-only filtering", () => {
    const parsed = snippetSearchInputSchema.safeParse({ query: "", language: "python", limit: 10 });
    expect(parsed.success).toBe(true);
  });

  it("applies default language filter", () => {
    const parsed = snippetSearchInputSchema.parse({ query: "" });
    expect(parsed.language).toBe("all");
  });
});
