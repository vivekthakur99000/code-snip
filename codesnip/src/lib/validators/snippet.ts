import { z } from "zod";

export const snippetInputSchema = z.object({
  title: z.string().min(1).max(200),
  code: z.string().min(1),
  language: z.string().min(1).max(50),
  tags: z.array(z.string().min(1).max(50)).max(20),
  isPublic: z.boolean(),
});

export const snippetIdSchema = z.object({
  id: z.string().uuid(),
});

export const snippetUpdateInputSchema = snippetIdSchema.merge(snippetInputSchema);

export const snippetPaginationInputSchema = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const snippetSearchInputSchema = z.object({
  query: z.string().max(200).default(""),
  language: z.string().max(50).default("all"),
  limit: z.number().int().min(1).max(50).default(20),
});

export type SnippetInput = z.infer<typeof snippetInputSchema>;
export type SnippetUpdateInput = z.infer<typeof snippetUpdateInputSchema>;
