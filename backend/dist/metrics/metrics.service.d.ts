import { OnModuleInit } from '@nestjs/common';
export declare class MetricsService implements OnModuleInit {
    private readonly registry;
    private readonly httpRequestDuration;
    private readonly httpRequestTotal;
    private readonly activeConnections;
    private readonly orderTotal;
    private readonly cacheHitRatio;
    constructor();
    onModuleInit(): void;
    getMetrics(): Promise<string>;
    getContentType(): string;
    recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void;
    recordOrder(status: string, storeId: string): void;
    updateCacheHitRatio(ratio: number): void;
    updateActiveConnections(count: number): void;
}
