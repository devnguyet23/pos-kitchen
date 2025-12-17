import { PermissionsService } from './permissions.service';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    findAll(module?: string): Promise<{
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
    getModules(): Promise<string[]>;
}
