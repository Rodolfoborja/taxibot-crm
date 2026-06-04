import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
  })

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

// Funciones helper
export async function cacheGet<T>(key: string): Promise<T | null> {
  const data = await redis.get(key)
  return data ? JSON.parse(data) : null
}

export async function cacheSet(key: string, value: any, ttlSeconds = 3600): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(value))
}

export async function cacheDel(key: string): Promise<void> {
  await redis.del(key)
}

export default redis
