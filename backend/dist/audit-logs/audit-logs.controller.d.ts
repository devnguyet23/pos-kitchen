import { AuditLogsService } from './audit-logs.service';
export declare class AuditLogsController {
    private readonly auditLogsService;
    constructor(auditLogsService: AuditLogsService);
    findAll(page?: string, pageSize?: string, userId?: string, action?: string, model?: string, startDate?: string, endDate?: string): Promise<{
        data: ({
            user: {
                id: number;
                username: string;
                fullName: string;
            };
        } & {
            id: number;
            userId: number | null;
            createdAt: Date;
            action: string;
            model: string;
            modelId: number | null;
            oldValues: import("@prisma/client/runtime/library").JsonValue | null;
            newValues: import("@prisma/client/runtime/library").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            requestUrl: string | null;
            requestMethod: string | null;
            responseStatus: number | null;
            executionTime: number | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getActions(): Promise<string[]>;
    getModels(): Promise<string[]>;
}
