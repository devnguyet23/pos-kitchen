"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let CacheService = CacheService_1 = class CacheService {
    constructor() {
        this.logger = new common_1.Logger(CacheService_1.name);
        this.isConnected = false;
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        this.redis = new ioredis_1.default(redisUrl, {
            retryStrategy: (times) => {
                if (times > 3) {
                    this.logger.warn('Redis connection failed, running without cache');
                    return null;
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
        this.redis.connect().catch(() => {
            this.logger.warn('Redis not available, cache disabled');
        });
    }
    async onModuleDestroy() {
        await this.redis.quit();
    }
    isReady() {
        return this.redis.status === 'ready';
    }
    buildKey(prefix, ...parts) {
        return `${prefix}:${parts.join(':')}`;
    }
    async get(key) {
        if (!this.isReady())
            return null;
        try {
            const value = await this.redis.get(key);
            if (!value)
                return null;
            return JSON.parse(value);
        }
        catch (error) {
            this.logger.warn(`Cache get error for ${key}: ${error}`);
            return null;
        }
    }
    async set(key, value, ttlSeconds = CacheService_1.TTL.MEDIUM) {
        if (!this.isReady())
            return;
        try {
            await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
        }
        catch (error) {
            this.logger.warn(`Cache set error for ${key}: ${error}`);
        }
    }
    async del(key) {
        if (!this.isReady())
            return;
        try {
            await this.redis.del(key);
        }
        catch (error) {
            this.logger.warn(`Cache del error for ${key}: ${error}`);
        }
    }
    async delByPattern(pattern) {
        if (!this.isReady())
            return;
        try {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
                this.logger.debug(`Deleted ${keys.length} keys matching ${pattern}`);
            }
        }
        catch (error) {
            this.logger.warn(`Cache delByPattern error for ${pattern}: ${error}`);
        }
    }
    async getOrSet(key, fetchFn, ttlSeconds = CacheService_1.TTL.MEDIUM) {
        const cached = await this.get(key);
        if (cached !== null) {
            this.logger.debug(`Cache HIT: ${key}`);
            return cached;
        }
        this.logger.debug(`Cache MISS: ${key}`);
        const value = await fetchFn();
        await this.set(key, value, ttlSeconds);
        return value;
    }
    async invalidateChain(chainId) {
        await this.delByPattern(`*:chain:${chainId}:*`);
    }
    async invalidateProducts(chainId) {
        if (chainId) {
            await this.delByPattern(`${CacheService_1.PREFIX.PRODUCTS}:chain:${chainId}:*`);
        }
        else {
            await this.delByPattern(`${CacheService_1.PREFIX.PRODUCTS}:*`);
        }
    }
    async invalidateCategories(chainId) {
        if (chainId) {
            await this.delByPattern(`${CacheService_1.PREFIX.CATEGORIES}:chain:${chainId}:*`);
        }
        else {
            await this.delByPattern(`${CacheService_1.PREFIX.CATEGORIES}:*`);
        }
    }
    async invalidateUserPermissions(userId) {
        await this.delByPattern(`${CacheService_1.PREFIX.PERMISSIONS}:user:${userId}`);
    }
    async healthCheck() {
        if (!this.isReady()) {
            return { status: 'disconnected' };
        }
        try {
            const start = Date.now();
            await this.redis.ping();
            return { status: 'connected', ping: Date.now() - start };
        }
        catch (_a) {
            return { status: 'error' };
        }
    }
};
exports.CacheService = CacheService;
CacheService.TTL = {
    SHORT: 60,
    MEDIUM: 300,
    LONG: 900,
    VERY_LONG: 3600,
};
CacheService.PREFIX = {
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    MODIFIERS: 'modifiers',
    USER: 'user',
    PERMISSIONS: 'permissions',
    SESSION: 'session',
};
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CacheService);
//# sourceMappingURL=cache.service.js.map