import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { cacheKeys, deleteCached, getCachedOrFetch } from "~/lib/cache";
import { limitPublicViewByIp, limitSearchByIp } from "~/lib/rate-limit";
import { createSnippetSlug } from "~/lib/utils";
import {
  snippetIdSchema,
  snippetInputSchema,
  snippetPaginationInputSchema,
  snippetSearchInputSchema,
  snippetUpdateInputSchema,
} from "~/lib/validators/snippet";
import {
  snippetVotes,
  snippetTags,
  snippets,
  tags,
  users,
} from "~/server/db/schema";
import { type DbClient } from "~/server/db";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/trpc/trpc";

function normalizeTags(inputTags: string[]) {
  return [...new Set(inputTags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
}

type TagQueryExecutor = Pick<DbClient, "select">;
type TagMutationExecutor = Pick<DbClient, "insert" | "select" | "delete">;

async function resolveCreatorForSnippet(executor: TagQueryExecutor, userId: string) {
  const [creator] = await executor
    .select({
      id: users.id,
      name: users.name,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return creator ?? { id: userId, name: "Unknown" };
}

async function resolveVoteSummary(
  executor: TagQueryExecutor,
  snippetId: string,
  viewerUserId?: string,
) {
  try {
    const [counts] = await executor
      .select({
        likes: sql<number>`coalesce(sum(case when ${snippetVotes.voteType} = 'like' then 1 else 0 end), 0)::int`,
        dislikes: sql<number>`coalesce(sum(case when ${snippetVotes.voteType} = 'dislike' then 1 else 0 end), 0)::int`,
      })
      .from(snippetVotes)
      .where(eq(snippetVotes.snippetId, snippetId));

    let userVote: "like" | "dislike" | null = null;

    if (viewerUserId) {
      const [viewerVote] = await executor
        .select({ voteType: snippetVotes.voteType })
        .from(snippetVotes)
        .where(and(eq(snippetVotes.snippetId, snippetId), eq(snippetVotes.userId, viewerUserId)))
        .limit(1);

      if (viewerVote?.voteType === "like" || viewerVote?.voteType === "dislike") {
        userVote = viewerVote.voteType;
      }
    }

    return {
      likes: counts?.likes ?? 0,
      dislikes: counts?.dislikes ?? 0,
      userVote,
    };
  } catch (error) {
    console.warn("Vote summary unavailable", error);

    return {
      likes: 0,
      dislikes: 0,
      userVote: null,
    };
  }
}

async function resolveTagsForSnippet(executor: TagQueryExecutor, snippetId: string) {
  const rows = await executor
    .select({
      id: tags.id,
      name: tags.name,
    })
    .from(snippetTags)
    .innerJoin(tags, eq(tags.id, snippetTags.tagId))
    .where(eq(snippetTags.snippetId, snippetId))
    .orderBy(tags.name);

  return rows;
}

async function upsertAndConnectTags(
  tx: TagMutationExecutor,
  snippetId: string,
  inputTags: string[],
) {
  const normalizedTags = normalizeTags(inputTags);

  if (!normalizedTags.length) {
    await tx.delete(snippetTags).where(eq(snippetTags.snippetId, snippetId));
    return;
  }

  await tx
    .insert(tags)
    .values(normalizedTags.map((name) => ({ name })))
    .onConflictDoNothing({ target: tags.name });

  const tagRows = await tx
    .select({ id: tags.id, name: tags.name })
    .from(tags)
    .where(inArray(tags.name, normalizedTags));

  await tx.delete(snippetTags).where(eq(snippetTags.snippetId, snippetId));

  await tx.insert(snippetTags).values(tagRows.map((tag) => ({ snippetId, tagId: tag.id })));
}

export const snippetsRouter = createTRPCRouter({
  create: protectedProcedure.input(snippetInputSchema).mutation(async ({ ctx, input }) => {
    const slug = createSnippetSlug();

    const [createdSnippet] = await ctx.db
      .insert(snippets)
      .values({
        userId: ctx.session.user.id,
        title: input.title,
        slug,
        code: input.code,
        language: input.language,
        isPublic: input.isPublic,
      })
      .returning();

    if (!createdSnippet) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to create snippet" });
    }

    await upsertAndConnectTags(ctx.db, createdSnippet.id, input.tags);

    const snippetTagsResult = await resolveTagsForSnippet(ctx.db, createdSnippet.id);

    return {
      ...createdSnippet,
      tags: snippetTagsResult,
    };
  }),

  update: protectedProcedure
    .input(snippetUpdateInputSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.snippets.findFirst({
        where: and(eq(snippets.id, input.id), isNull(snippets.deletedAt)),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });
      }

      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [updatedSnippet] = await ctx.db
        .update(snippets)
        .set({
          title: input.title,
          code: input.code,
          language: input.language,
          isPublic: input.isPublic,
          updatedAt: new Date(),
        })
        .where(eq(snippets.id, input.id))
        .returning();

      if (!updatedSnippet) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });
      }

      await upsertAndConnectTags(ctx.db, updatedSnippet.id, input.tags);

      const snippetTagsResult = await resolveTagsForSnippet(ctx.db, updatedSnippet.id);

      return {
        ...updatedSnippet,
        tags: snippetTagsResult,
      };
    }),

  delete: protectedProcedure.input(snippetIdSchema).mutation(async ({ ctx, input }) => {
    const [deleted] = await ctx.db
      .update(snippets)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(snippets.id, input.id), eq(snippets.userId, ctx.session.user.id), isNull(snippets.deletedAt)))
      .returning({ id: snippets.id });

    if (!deleted) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });
    }

    return deleted;
  }),

  getById: protectedProcedure.input(snippetIdSchema).query(async ({ ctx, input }) => {
    const snippet = await ctx.db.query.snippets.findFirst({
      where: and(eq(snippets.id, input.id), isNull(snippets.deletedAt)),
    });

    if (!snippet) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });
    }

    if (snippet.userId !== ctx.session.user.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const snippetTagsResult = await resolveTagsForSnippet(ctx.db, snippet.id);
    const creator = await resolveCreatorForSnippet(ctx.db, snippet.userId);
    const votes = await resolveVoteSummary(ctx.db, snippet.id, ctx.session.user.id);

    return {
      ...snippet,
      tags: snippetTagsResult,
      creator,
      votes,
    };
  }),

  getByUser: protectedProcedure.input(snippetPaginationInputSchema).query(async ({ ctx, input }) => {
    const limit = input.limit;

    const rows = await ctx.db
      .select()
      .from(snippets)
      .where(
        and(
          eq(snippets.userId, ctx.session.user.id),
          isNull(snippets.deletedAt),
          input.cursor
            ? sql`${snippets.createdAt} < ${new Date(input.cursor)}`
            : undefined,
        ),
      )
      .orderBy(desc(snippets.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1]?.createdAt.toISOString() : undefined;

    return {
      items,
      nextCursor,
    };
  }),

  getPublicBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(50) }))
    .query(async ({ ctx, input }) => {
      const [snippet] = await ctx.db
        .select()
        .from(snippets)
        .where(and(eq(snippets.slug, input.slug), eq(snippets.isPublic, true), isNull(snippets.deletedAt)))
        .limit(1);

      if (!snippet) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });
      }

      const snippetTagsResult = await resolveTagsForSnippet(ctx.db, snippet.id);
      const creator = await resolveCreatorForSnippet(ctx.db, snippet.userId);
      const votes = await resolveVoteSummary(ctx.db, snippet.id, ctx.session?.user.id);

      return {
        ...snippet,
        tags: snippetTagsResult,
        creator,
        votes,
      };
    }),

  vote: protectedProcedure
    .input(
      z.object({
        snippetId: z.string().uuid(),
        vote: z.enum(["like", "dislike", "none"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [snippet] = await ctx.db
        .select({ id: snippets.id, userId: snippets.userId, isPublic: snippets.isPublic })
        .from(snippets)
        .where(and(eq(snippets.id, input.snippetId), isNull(snippets.deletedAt)))
        .limit(1);

      if (!snippet) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });
      }

      const canVote = snippet.isPublic || snippet.userId === ctx.session.user.id;

      if (!canVote) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (input.vote === "none") {
        try {
          await ctx.db
            .delete(snippetVotes)
            .where(
              and(
                eq(snippetVotes.snippetId, input.snippetId),
                eq(snippetVotes.userId, ctx.session.user.id),
              ),
            );
        } catch (error) {
          const message = error instanceof Error ? error.message.toLowerCase() : "";
          const isMissingVotesTable =
            message.includes("snippet_votes") &&
            (message.includes("does not exist") || message.includes("relation"));

          if (isMissingVotesTable) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: "Voting is unavailable until database schema is updated. Run npm run db:push.",
            });
          }

          throw error;
        }
      } else {
        try {
          await ctx.db
            .insert(snippetVotes)
            .values({
              snippetId: input.snippetId,
              userId: ctx.session.user.id,
              voteType: input.vote,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: [snippetVotes.snippetId, snippetVotes.userId],
              set: {
                voteType: input.vote,
                updatedAt: new Date(),
              },
            });
        } catch (error) {
          const message = error instanceof Error ? error.message.toLowerCase() : "";
          const isMissingVotesTable =
            message.includes("snippet_votes") &&
            (message.includes("does not exist") || message.includes("relation"));

          if (isMissingVotesTable) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: "Voting is unavailable until database schema is updated. Run npm run db:push.",
            });
          }

          throw error;
        }
      }

      const result = await resolveVoteSummary(ctx.db, input.snippetId, ctx.session.user.id);
      // Invalidate vote cache on change
      await deleteCached(cacheKeys.voteSummary(input.snippetId));
      return result;
    }),

  incrementPublicView: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(50) }))
    .mutation(async ({ ctx, input }) => {
      const ip = ctx.ip ?? "anonymous";
      const rateLimit = await limitPublicViewByIp(ip, input.slug);

      if (!rateLimit.success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "View counter is rate-limited for this IP",
        });
      }

      const [updated] = await ctx.db
        .update(snippets)
        .set({ views: sql`${snippets.views} + 1` })
        .where(and(eq(snippets.slug, input.slug), eq(snippets.isPublic, true), isNull(snippets.deletedAt)))
        .returning({ id: snippets.id, views: snippets.views });

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Snippet not found" });
      }

      return updated;
    }),

  search: publicProcedure.input(snippetSearchInputSchema).query(async ({ ctx, input }) => {
    const trimmedQuery = input.query.trim();
    const hasTextQuery = trimmedQuery.length > 0;
    const normalizedLanguage = input.language.trim().toLowerCase();

    const ip = ctx.ip ?? "anonymous";
    if (hasTextQuery) {
      const rateLimit = await limitSearchByIp(ip);

      if (!rateLimit.success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Search rate limit exceeded",
        });
      }
    }

    const queryExpr = hasTextQuery
      ? sql`plainto_tsquery('english', ${trimmedQuery})`
      : undefined;
    const rankExpr = hasTextQuery && queryExpr
      ? sql<number>`ts_rank(${snippets.searchVec}, ${queryExpr})`
      : sql<number>`0::float`;

    const rows = await ctx.db
      .select({
        id: snippets.id,
        title: snippets.title,
        slug: snippets.slug,
        language: snippets.language,
        code: snippets.code,
        views: snippets.views,
        creatorName: users.name,
        createdAt: snippets.createdAt,
        updatedAt: snippets.updatedAt,
        rank: rankExpr,
      })
      .from(snippets)
      .innerJoin(users, eq(users.id, snippets.userId))
      .where(
        and(
          eq(snippets.isPublic, true),
          isNull(snippets.deletedAt),
          normalizedLanguage !== "all" ? eq(sql`lower(${snippets.language})`, normalizedLanguage) : undefined,
          queryExpr ? sql`${snippets.searchVec} @@ ${queryExpr}` : undefined,
        ),
      )
      .orderBy(hasTextQuery ? desc(rankExpr) : desc(snippets.createdAt), desc(snippets.createdAt))
      .limit(input.limit);

    return rows;
  }),

  listPublic: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          id: snippets.id,
          title: snippets.title,
          slug: snippets.slug,
          language: snippets.language,
          code: snippets.code,
          views: snippets.views,
          createdAt: snippets.createdAt,
          creatorName: users.name,
        })
        .from(snippets)
        .innerJoin(users, eq(users.id, snippets.userId))
        .where(and(eq(snippets.isPublic, true), isNull(snippets.deletedAt)))
        .orderBy(desc(snippets.createdAt))
        .limit(input.limit);
    }),

  listLanguages: publicProcedure.query(async ({ ctx }) => {
    // Cache language stats for 10 minutes since they change infrequently
    const rows = await getCachedOrFetch(
      cacheKeys.languageStats(),
      async () => {
        return ctx.db
          .select({
            language: snippets.language,
            count: sql<number>`count(*)::int`,
          })
          .from(snippets)
          .where(and(eq(snippets.isPublic, true), isNull(snippets.deletedAt)))
          .groupBy(snippets.language)
          .orderBy(desc(sql<number>`count(*)::int`), snippets.language);
      },
      { ttl: 600 }, // 10 minutes
    );

    return rows;
  }),
});
