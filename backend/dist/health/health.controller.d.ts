import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
export declare class HealthController {
    private prisma;
    private cacheService;
    constructor(prisma: PrismaService, cacheService: CacheService);
    getHealth(): Promise<{
        status: string;
        service: string;
        version: string;
        uptime: number;
        timestamp: string;
        dependencies: {
            database: string;
            redis: string;
        };
    }>;
    getLiveness(): {
        status: string;
        timestamp: string;
    };
    getReadiness(): Promise<{
        status: string;
        timestamp: string;
    }>;
}
