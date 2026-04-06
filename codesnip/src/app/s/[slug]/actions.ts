"use server";

import { api } from "~/trpc/server";

export async function incrementPublicSnippetView(slug: string) {
  try {
    await api.snippets.incrementPublicView({ slug });
  } catch (error) {
    // Ignore throttled increments to keep page render resilient.
    console.error("Failed to increment snippet view", error);
  }
}
