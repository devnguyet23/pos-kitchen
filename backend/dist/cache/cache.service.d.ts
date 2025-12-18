import { OnModuleDestroy } from '@nestjs/common';
export declare class CacheService implements OnModuleDestroy {
    private readonly logger;
    private readonly redis;
    private readonly isConnected;
    static readonly TTL: {
        SHORT: number;
        MEDIUM: number;
        LONG: number;
        VERY_LONG: number;
    };
    static readonly PREFIX: {
        PRODUCTS: string;
        CATEGORIES: string;
        MODIFIERS: string;
        USER: string;
        PERMISSIONS: string;
        SESSION: string;
    };
    constructor();
    onModuleDestroy(): Promise<void>;
    private isReady;
    buildKey(prefix: string, ...parts: (string | number)[]): string;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    delByPattern(pattern: string): Promise<void>;
    getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds?: number): Promise<T>;
    invalidateChain(chainId: number): Promise<void>;
    invalidateProducts(chainId?: number): Promise<void>;
    invalidateCategories(chainId?: number): Promise<void>;
    invalidateUserPermissions(userId: number): Promise<void>;
    healthCheck(): Promise<{
        status: string;
        ping?: number;
    }>;
}
