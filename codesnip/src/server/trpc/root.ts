import { createCallerFactory, createTRPCRouter } from "~/server/trpc/trpc";
import { snippetsRouter } from "~/server/trpc/routers/snippets";
import { tagsRouter } from "~/server/trpc/routers/tags";

export const appRouter = createTRPCRouter({
  snippets: snippetsRouter,
  tags: tagsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
