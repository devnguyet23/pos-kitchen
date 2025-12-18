import { PrismaService } from '../prisma/prisma.service';
export declare class PermissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(params: {
        module?: string;
    }): Promise<{
        data: {
            id: number;
            createdAt: Date;
            name: string;
            code: string;
            description: string | null;
            isSystem: boolean;
            module: string;
        }[];
        grouped: Record<string, {
            id: number;
            createdAt: Date;
            name: string;
            code: string;
            description: string | null;
            isSystem: boolean;
            module: string;
        }[]>;
        total: number;
    }>;
    findByModule(module: string): Promise<{
        id: number;
        createdAt: Date;
        name: string;
        code: string;
        description: string | null;
        isSystem: boolean;
        module: string;
    }[]>;
    getModules(): Promise<string[]>;
}
