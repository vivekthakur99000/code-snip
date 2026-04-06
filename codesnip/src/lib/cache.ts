import "server-only";

import { Redis } from "@upstash/redis";

import { env } from "~/env";

const hasUpstashConfig =
  !!env.UPSTASH_REDIS_REST_URL && !!env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasUpstashConfig
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export type CacheOptions = {
  ttl?: number; // seconds, default 300 (5 minutes)
};

export async function getCached<T>(
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options?: CacheOptions,
): Promise<T | null> {
  if (!redis) return null;

  try {
    const cached = await redis.get<T>(key);
    return cached ?? null;
  } catch (error) {
    console.warn(`Cache get failed for ${key}:`, error);
    return null;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  options?: CacheOptions,
): Promise<void> {
  if (!redis) return;

  try {
    const ttl = options?.ttl ?? 300;
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.warn(`Cache set failed for ${key}:`, error);
  }
}

export async function deleteCached(key: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    console.warn(`Cache delete failed for ${key}:`, error);
  }
}

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions,
): Promise<T> {
  const cached = await getCached<T>(key);
  if (cached) return cached;

  const fresh = await fetcher();
  await setCached(key, fresh, options);
  return fresh;
}

// Cache key builders
export const cacheKeys = {
  snippet: (id: string) => `snippet:${id}`,
  snippetBySlug: (slug: string) => `snippet:slug:${slug}`,
  languageStats: () => "language-stats",
  voteSummary: (snippetId: string) => `votes:${snippetId}`,
};
