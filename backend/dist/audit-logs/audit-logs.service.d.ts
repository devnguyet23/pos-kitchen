import { PrismaService } from '../prisma/prisma.service';
export declare class AuditLogsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        userId: number;
        action: string;
        model: string;
        modelId?: number;
        oldValues?: any;
        newValues?: any;
        ipAddress?: string;
        userAgent?: string;
        requestUrl?: string;
        requestMethod?: string;
        responseStatus?: number;
        executionTime?: number;
    }): Promise<{
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
    }>;
    findAll(params: {
        skip?: number;
        take?: number;
        userId?: number;
        action?: string;
        model?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
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
