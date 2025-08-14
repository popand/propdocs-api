import { createClient, RedisClientType } from 'redis';
import { config } from './environment';

// Redis client configuration
let redisClient: RedisClientType | null = null;

export async function createRedisClient(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    url: config.redisUrl,
    socket: {
      connectTimeout: 10000,
    },
  });

  // Event handlers
  redisClient.on('error', (error: Error) => {
    console.error('❌ Redis connection error:', error);
  });

  redisClient.on('connect', () => {
    console.log('🔄 Redis connecting...');
  });

  redisClient.on('ready', () => {
    console.log('✅ Redis connected successfully');
  });

  redisClient.on('end', () => {
    console.log('🔌 Redis connection closed');
  });

  redisClient.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
  });

  return redisClient;
}

export async function connectRedis(): Promise<RedisClientType> {
  try {
    const client = await createRedisClient();
    await client.connect();
    return client;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.disconnect();
      console.log('✅ Redis disconnected successfully');
    } catch (error) {
      console.error('❌ Redis disconnection failed:', error);
      throw error;
    }
  }
}

export async function checkRedisHealth(): Promise<boolean> {
  try {
    if (!redisClient || !redisClient.isOpen) {
      return false;
    }
    const pong = await redisClient.ping();
    return pong === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

export function getRedisClient(): RedisClientType | null {
  return redisClient;
}

// Session management utilities
export class SessionManager {
  private client: RedisClientType;
  private keyPrefix = 'session:';

  constructor(client: RedisClientType) {
    this.client = client;
  }

  // Set session data with TTL
  async setSession(
    sessionId: string,
    data: Record<string, unknown>,
    ttlSeconds = 86400 // 24 hours default
  ): Promise<void> {
    const key = `${this.keyPrefix}${sessionId}`;
    await this.client.setEx(key, ttlSeconds, JSON.stringify(data));
  }

  // Get session data
  async getSession(sessionId: string): Promise<Record<string, unknown> | null> {
    const key = `${this.keyPrefix}${sessionId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Delete session
  async deleteSession(sessionId: string): Promise<void> {
    const key = `${this.keyPrefix}${sessionId}`;
    await this.client.del(key);
  }

  // Update session TTL
  async refreshSession(sessionId: string, ttlSeconds = 86400): Promise<void> {
    const key = `${this.keyPrefix}${sessionId}`;
    await this.client.expire(key, ttlSeconds);
  }

  // Get all active sessions for a user (for logout from all devices)
  async getUserSessions(userId: string): Promise<string[]> {
    const pattern = `${this.keyPrefix}*`;
    const keys = await this.client.keys(pattern);
    const userSessions: string[] = [];

    for (const key of keys) {
      const data = await this.client.get(key);
      if (data) {
        const sessionData = JSON.parse(data);
        if (sessionData.userId === userId) {
          userSessions.push(key.replace(this.keyPrefix, ''));
        }
      }
    }

    return userSessions;
  }

  // Delete all sessions for a user
  async deleteUserSessions(userId: string): Promise<void> {
    const userSessions = await this.getUserSessions(userId);
    if (userSessions.length > 0) {
      const keys = userSessions.map(sessionId => `${this.keyPrefix}${sessionId}`);
      await this.client.del(keys);
    }
  }
}

// Cache utilities
export class CacheManager {
  private client: RedisClientType;
  private keyPrefix = 'cache:';

  constructor(client: RedisClientType) {
    this.client = client;
  }

  // Set cache with TTL
  async set(
    key: string,
    value: unknown,
    ttlSeconds = 3600 // 1 hour default
  ): Promise<void> {
    const cacheKey = `${this.keyPrefix}${key}`;
    await this.client.setEx(cacheKey, ttlSeconds, JSON.stringify(value));
  }

  // Get cached value
  async get<T>(key: string): Promise<T | null> {
    const cacheKey = `${this.keyPrefix}${key}`;
    const data = await this.client.get(cacheKey);
    return data ? JSON.parse(data) : null;
  }

  // Delete cache entry
  async delete(key: string): Promise<void> {
    const cacheKey = `${this.keyPrefix}${key}`;
    await this.client.del(cacheKey);
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    const cacheKey = `${this.keyPrefix}${key}`;
    const result = await this.client.exists(cacheKey);
    return result === 1;
  }
}

// Graceful shutdown for Redis
export async function gracefulRedisShutdown(): Promise<void> {
  console.log('🔄 Closing Redis connection...');
  await disconnectRedis();
}

// Handle process signals for graceful shutdown
process.on('beforeExit', gracefulRedisShutdown);
process.on('SIGINT', gracefulRedisShutdown);
process.on('SIGTERM', gracefulRedisShutdown);