import { PermissionsService } from './permissions.service';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    findAll(module?: string): Promise<{
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
    getModules(): Promise<string[]>;
}
