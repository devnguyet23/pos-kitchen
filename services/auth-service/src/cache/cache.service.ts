import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * CacheService - Redis caching layer for high-scale performance
 * Implements cache-aside pattern with TTL management
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
                    private readonly logger = new Logger(CacheService.name);
                    private readonly redis: Redis;
                    private readonly isConnected: boolean = false;

                    // Default TTL values (in seconds)
                    static readonly TTL = {
                                        SHORT: 60,           // 1 minute - for frequently changing data
                                        MEDIUM: 300,         // 5 minutes - for product catalog
                                        LONG: 900,           // 15 minutes - for categories, settings
                                        VERY_LONG: 3600,     // 1 hour - for static data
                    };

                    // Cache key prefixes for organized namespace
                    static readonly PREFIX = {
                                        PRODUCTS: 'products',
                                        CATEGORIES: 'categories',
                                        MODIFIERS: 'modifiers',
                                        USER: 'user',
                                        PERMISSIONS: 'permissions',
                                        SESSION: 'session',
                    };

                    constructor() {
                                        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

                                        this.redis = new Redis(redisUrl, {
                                                            retryStrategy: (times) => {
                                                                                if (times > 3) {
                                                                                                    this.logger.warn('Redis connection failed, running without cache');
                                                                                                    return null; // stop retrying
                                                                                }
                                                                                return Math.min(times * 100, 3000);
                                                            },
                                                            maxRetriesPerRequest: 3,
                                                            enableReadyCheck: true,
                                                            lazyConnect: true,
                                        });

                                        this.redis.on('connect', () => {
                                                            this.logger.log('Redis connected');
                                        });

                                        this.redis.on('error', (err) => {
                                                            this.logger.warn(`Redis error: ${err.message}`);
                                        });

                                        // Try to connect
                                        this.redis.connect().catch(() => {
                                                            this.logger.warn('Redis not available, cache disabled');
                                        });
                    }

                    async onModuleDestroy() {
                                        await this.redis.quit();
                    }

                    /**
                     * Check if Redis is available
                     */
                    private isReady(): boolean {
                                        return this.redis.status === 'ready';
                    }

                    /**
                     * Build cache key with prefix
                     */
                    buildKey(prefix: string, ...parts: (string | number)[]): string {
                                        return `${prefix}:${parts.join(':')}`;
                    }

                    /**
                     * Get value from cache
                     */
                    async get<T>(key: string): Promise<T | null> {
                                        if (!this.isReady()) return null;

                                        try {
                                                            const value = await this.redis.get(key);
                                                            if (!value) return null;
                                                            return JSON.parse(value) as T;
                                        } catch (error) {
                                                            this.logger.warn(`Cache get error for ${key}: ${error}`);
                                                            return null;
                                        }
                    }

                    /**
                     * Set value in cache with TTL
                     */
                    async set(key: string, value: unknown, ttlSeconds: number = CacheService.TTL.MEDIUM): Promise<void> {
                                        if (!this.isReady()) return;

                                        try {
                                                            await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
                                        } catch (error) {
                                                            this.logger.warn(`Cache set error for ${key}: ${error}`);
                                        }
                    }

                    /**
                     * Delete key from cache
                     */
                    async del(key: string): Promise<void> {
                                        if (!this.isReady()) return;

                                        try {
                                                            await this.redis.del(key);
                                        } catch (error) {
                                                            this.logger.warn(`Cache del error for ${key}: ${error}`);
                                        }
                    }

                    /**
                     * Delete all keys matching pattern
                     * Use with caution in production
                     */
                    async delByPattern(pattern: string): Promise<void> {
                                        if (!this.isReady()) return;

                                        try {
                                                            const keys = await this.redis.keys(pattern);
                                                            if (keys.length > 0) {
                                                                                await this.redis.del(...keys);
                                                                                this.logger.debug(`Deleted ${keys.length} keys matching ${pattern}`);
                                                            }
                                        } catch (error) {
                                                            this.logger.warn(`Cache delByPattern error for ${pattern}: ${error}`);
                                        }
                    }

                    /**
                     * Get or set with cache-aside pattern
                     */
                    async getOrSet<T>(
                                        key: string,
                                        fetchFn: () => Promise<T>,
                                        ttlSeconds: number = CacheService.TTL.MEDIUM,
                    ): Promise<T> {
                                        // Try cache first
                                        const cached = await this.get<T>(key);
                                        if (cached !== null) {
                                                            this.logger.debug(`Cache HIT: ${key}`);
                                                            return cached;
                                        }

                                        // Cache miss - fetch from source
                                        this.logger.debug(`Cache MISS: ${key}`);
                                        const value = await fetchFn();

                                        // Store in cache
                                        await this.set(key, value, ttlSeconds);

                                        return value;
                    }

                    /**
                     * Invalidate cache for a specific chain's data
                     */
                    async invalidateChain(chainId: number): Promise<void> {
                                        await this.delByPattern(`*:chain:${chainId}:*`);
                    }

                    /**
                     * Invalidate product cache
                     */
                    async invalidateProducts(chainId?: number): Promise<void> {
                                        if (chainId) {
                                                            await this.delByPattern(`${CacheService.PREFIX.PRODUCTS}:chain:${chainId}:*`);
                                        } else {
                                                            await this.delByPattern(`${CacheService.PREFIX.PRODUCTS}:*`);
                                        }
                    }

                    /**
                     * Invalidate category cache
                     */
                    async invalidateCategories(chainId?: number): Promise<void> {
                                        if (chainId) {
                                                            await this.delByPattern(`${CacheService.PREFIX.CATEGORIES}:chain:${chainId}:*`);
                                        } else {
                                                            await this.delByPattern(`${CacheService.PREFIX.CATEGORIES}:*`);
                                        }
                    }

                    /**
                     * Invalidate user permissions cache
                     */
                    async invalidateUserPermissions(userId: number): Promise<void> {
                                        await this.delByPattern(`${CacheService.PREFIX.PERMISSIONS}:user:${userId}`);
                    }

                    /**
                     * Health check
                     */
                    async healthCheck(): Promise<{ status: string; ping?: number }> {
                                        if (!this.isReady()) {
                                                            return { status: 'disconnected' };
                                        }

                                        try {
                                                            const start = Date.now();
                                                            await this.redis.ping();
                                                            return { status: 'connected', ping: Date.now() - start };
                                        } catch {
                                                            return { status: 'error' };
                                        }
                    }
}
