import { and, eq, isNull } from "drizzle-orm";

import { snippetTags, snippets, tags } from "~/server/db/schema";
import { protectedProcedure, createTRPCRouter } from "~/server/trpc/trpc";

export const tagsRouter = createTRPCRouter({
  getByUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .selectDistinct({
        id: tags.id,
        name: tags.name,
      })
      .from(tags)
      .innerJoin(snippetTags, eq(snippetTags.tagId, tags.id))
      .innerJoin(snippets, eq(snippets.id, snippetTags.snippetId))
      .where(and(eq(snippets.userId, ctx.session.user.id), isNull(snippets.deletedAt)));
  }),
});
