import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import redis from '@/lib/redis'

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'unknown',
    redis: 'unknown',
  }

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    health.database = 'connected'
  } catch (error) {
    health.database = 'error'
    health.status = 'degraded'
  }

  try {
    // Test Redis connection
    await redis.ping()
    health.redis = 'connected'
  } catch (error) {
    health.redis = 'error'
    health.status = 'degraded'
  }

  const statusCode = health.status === 'ok' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
