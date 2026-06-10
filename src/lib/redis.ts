import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    // Conexión perezosa: no abre el socket hasta el primer comando.
    // Evita el ruido de ECONNREFUSED en build/arranque si Redis no está listo.
    // enableOfflineQueue (default true): encola el primer comando hasta que la
    // conexión perezosa se establezca, en vez de fallar de inmediato.
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  })

// Redis es opcional (caché, no crítico): no debe tumbar el proceso.
redis.on('error', (err) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[redis] no disponible:', err.message)
  }
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
