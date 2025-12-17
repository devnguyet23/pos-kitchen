import { PrismaService } from '../prisma/prisma.service';
export declare class PermissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(params: {
        module?: string;
    }): Promise<{
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            name: string;
            code: string;
            isSystem: boolean;
            module: string;
        }[];
        grouped: Record<string, {
            description: string | null;
            id: number;
            createdAt: Date;
            name: string;
            code: string;
            isSystem: boolean;
            module: string;
        }[]>;
        total: number;
    }>;
    findByModule(module: string): Promise<{
        description: string | null;
        id: number;
        createdAt: Date;
        name: string;
        code: string;
        isSystem: boolean;
        module: string;
    }[]>;
    getModules(): Promise<string[]>;
}
