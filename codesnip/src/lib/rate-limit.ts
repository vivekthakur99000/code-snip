import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "~/env";

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const hasUpstashConfig =
  !!env.UPSTASH_REDIS_REST_URL && !!env.UPSTASH_REDIS_REST_TOKEN;

let hasWarnedMissingUpstash = false;

function warnMissingUpstashInProduction() {
  if (env.NODE_ENV !== "production" || hasUpstashConfig || hasWarnedMissingUpstash) {
    return;
  }

  hasWarnedMissingUpstash = true;
  console.warn(
    "Rate limiting is running in fallback mode because UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is missing.",
  );
}

const redis =
  hasUpstashConfig
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL!,
        token: env.UPSTASH_REDIS_REST_TOKEN!,
      })
    : null;

const searchLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: true,
      prefix: "codesnip:search",
    })
  : null;

const publicViewLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1, "1 m"),
      analytics: true,
      prefix: "codesnip:public-view",
    })
  : null;

function allowByDefault(limit: number): RateLimitResult {
  return {
    success: true,
    limit,
    remaining: limit,
    reset: Date.now() + 60_000,
  };
}

export async function limitSearchByIp(ip: string): Promise<RateLimitResult> {
  if (!searchLimiter) {
    warnMissingUpstashInProduction();
    return allowByDefault(30);
  }

  return searchLimiter.limit(ip);
}

export async function limitPublicViewByIp(ip: string, slug: string): Promise<RateLimitResult> {
  if (!publicViewLimiter) {
    warnMissingUpstashInProduction();
    return allowByDefault(1);
  }

  return publicViewLimiter.limit(`${slug}:${ip}`);
}
