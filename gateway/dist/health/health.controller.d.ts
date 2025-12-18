interface ServiceHealth {
    name: string;
    status: 'up' | 'down';
    responseTime?: number;
    error?: string;
}
export declare class HealthController {
    private readonly services;
    getHealth(): Promise<{
        status: string;
        service: string;
        version: string;
        uptime: number;
        timestamp: string;
        services: ServiceHealth[];
    }>;
    getLiveness(): {
        status: string;
        timestamp: string;
    };
    getReadiness(): Promise<{
        status: string;
        timestamp: string;
    }>;
    private checkService;
}
export {};
