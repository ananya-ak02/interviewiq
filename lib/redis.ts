import { Redis } from "@upstash/redis";

const normalizeEnv = (value?: string) => value?.trim().replace(/^"(.+)"$/, "$1").replace(/^'(.+)'$/, "$1");

const redisUrl = normalizeEnv(process.env.UPSTASH_REDIS_REST_URL);
const redisToken = normalizeEnv(process.env.UPSTASH_REDIS_REST_TOKEN);
if (!redisUrl || !redisToken) {
  throw new Error("UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set.");
}

export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});

export async function cacheSessionState<T>(sessionId: string, data: T) {
  try {
    await redis.set(`session:${sessionId}`, JSON.stringify(data), { ex: 7200 });
  } catch (error) {
    console.error("Redis cacheSessionState failed:", error);
  }
}

export async function getSessionState<T>(sessionId: string): Promise<T | null> {
  try {
    const data = await redis.get<string>(`session:${sessionId}`);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error("Redis getSessionState failed:", error);
    return null;
  }
}
