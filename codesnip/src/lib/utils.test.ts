import { describe, expect, it } from "vitest";

import { cn, createSnippetSlug } from "~/lib/utils";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("base", false, undefined, "active", null, "focus")).toBe(
      "base active focus",
    );
  });

  it("returns empty string when all values are falsy", () => {
    expect(cn(undefined, null, false)).toBe("");
  });
});

describe("createSnippetSlug", () => {
  it("generates a 10-character slug", () => {
    const slug = createSnippetSlug();
    expect(slug).toHaveLength(10);
  });

  it("generates non-identical slugs", () => {
    const first = createSnippetSlug();
    const second = createSnippetSlug();
    expect(first).not.toBe(second);
  });
});
