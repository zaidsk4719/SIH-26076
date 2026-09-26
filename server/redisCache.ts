import Redis from 'ioredis';

/**
 * Server-side Redis Cache Manager with In-Memory Fallback (SIH 26076)
 *
 * Implements key-value caching for:
 * - Location-based synoptic weather payload: weather:synoptic:{locationId}
 * - Traffic conditions: traffic:city:{cityId}
 * - AI Generated summaries: ai:insight:{locationId}:{personaId}
 *
 * CRITICAL SAFETY REQUIREMENT:
 * Redis failure must NEVER crash or block the application.
 * All operations fail gracefully to in-memory cache or direct computation.
 */

let redisClient: Redis | null = null;
let isRedisAvailable = false;
let initAttempted = false;

// Fallback in-memory map cache if Redis server is not configured or unavailable
const inMemoryCache = new Map<string, { value: string; expiresAt: number }>();

function getRedisClient(): Redis | null {
  if (initAttempted) return redisClient;
  initAttempted = true;

  const redisUrl = (process.env.REDIS_URL || process.env.REDIS_TLS_URL || '').trim();
  const redisHost = (process.env.REDIS_HOST || '').trim();

  if (!redisUrl && !redisHost) {
    return null;
  }

  try {
    if (redisUrl && (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://'))) {
      redisClient = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: () => null,
      });
    } else if (redisHost) {
      redisClient = new Redis({
        host: redisHost,
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: () => null,
      });
    } else {
      return null;
    }

    if (!redisClient) return null;

    redisClient.on('connect', () => {
      isRedisAvailable = true;
      console.log('✅ Redis Cache connected successfully.');
    });

    redisClient.on('error', (err) => {
      isRedisAvailable = false;
      console.warn('⚠️ Redis Cache error (using in-memory fallback):', err?.message || err);
    });

    redisClient.connect().catch((err) => {
      isRedisAvailable = false;
      console.warn('⚠️ Redis connection failed (using in-memory fallback):', err?.message || err);
    });

    return redisClient;
  } catch (err: any) {
    console.warn('⚠️ Redis initialization exception (using in-memory fallback):', err?.message || err);
    redisClient = null;
    return null;
  }
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  const safeKey = `mausam:${key}`;

  // 1. Try Redis first if available
  const client = getRedisClient();
  if (isRedisAvailable && client) {
    try {
      const raw = await client.get(safeKey);
      if (raw) {
        return JSON.parse(raw) as T;
      }
    } catch {
      // Fallback to in-memory cache on read error
    }
  }

  // 2. Fallback to in-memory map cache
  const cached = inMemoryCache.get(safeKey);
  if (cached) {
    if (Date.now() < cached.expiresAt) {
      try {
        return JSON.parse(cached.value) as T;
      } catch {
        // ignore
      }
    } else {
      inMemoryCache.delete(safeKey);
    }
  }

  return null;
}

export async function setCachedData(key: string, value: any, ttlSeconds: number = 600): Promise<void> {
  const safeKey = `mausam:${key}`;
  const serialized = JSON.stringify(value);

  // 1. Save in Redis if available
  const client = getRedisClient();
  if (isRedisAvailable && client) {
    try {
      await client.setex(safeKey, ttlSeconds, serialized);
    } catch {
      // Ignore write failure and store in memory
    }
  }

  // 2. Always maintain in-memory cache fallback
  inMemoryCache.set(safeKey, {
    value: serialized,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}
