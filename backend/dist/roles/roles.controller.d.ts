import { RolesService } from './roles.service';
import { CurrentUserData } from '../auth/decorators';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    findAll(level?: string): Promise<{
        data: ({
            _count: {
                permissions: number;
                userRoles: number;
            };
        } & {
            level: number;
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            isSystem: boolean;
            color: string | null;
            icon: string | null;
        })[];
        total: number;
    }>;
    findOne(id: number): Promise<{
        permissions: ({
            permission: {
                description: string | null;
                id: number;
                createdAt: Date;
                name: string;
                code: string;
                isSystem: boolean;
                module: string;
            };
        } & {
            id: number;
            createdAt: Date;
            roleId: number;
            permissionId: number;
        })[];
        _count: {
            userRoles: number;
        };
    } & {
        level: number;
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        isSystem: boolean;
        color: string | null;
        icon: string | null;
    }>;
    create(data: {
        name: string;
        code: string;
        level: number;
        description?: string;
        color?: string;
    }, user: CurrentUserData): Promise<{
        level: number;
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        isSystem: boolean;
        color: string | null;
        icon: string | null;
    }>;
    update(id: number, data: {
        name?: string;
        description?: string;
        color?: string;
    }, user: CurrentUserData): Promise<{
        level: number;
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        isSystem: boolean;
        color: string | null;
        icon: string | null;
    }>;
    remove(id: number, user: CurrentUserData): Promise<{
        level: number;
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        isSystem: boolean;
        color: string | null;
        icon: string | null;
    }>;
    assignPermissions(id: number, data: {
        permissionIds: number[];
    }, user: CurrentUserData): Promise<{
        permissions: ({
            permission: {
                description: string | null;
                id: number;
                createdAt: Date;
                name: string;
                code: string;
                isSystem: boolean;
                module: string;
            };
        } & {
            id: number;
            createdAt: Date;
            roleId: number;
            permissionId: number;
        })[];
        _count: {
            userRoles: number;
        };
    } & {
        level: number;
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        isSystem: boolean;
        color: string | null;
        icon: string | null;
    }>;
    addPermission(id: number, permissionId: number, user: CurrentUserData): Promise<{
        permissions: ({
            permission: {
                description: string | null;
                id: number;
                createdAt: Date;
                name: string;
                code: string;
                isSystem: boolean;
                module: string;
            };
        } & {
            id: number;
            createdAt: Date;
            roleId: number;
            permissionId: number;
        })[];
        _count: {
            userRoles: number;
        };
    } & {
        level: number;
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        isSystem: boolean;
        color: string | null;
        icon: string | null;
    }>;
    removePermission(id: number, permissionId: number, user: CurrentUserData): Promise<{
        permissions: ({
            permission: {
                description: string | null;
                id: number;
                createdAt: Date;
                name: string;
                code: string;
                isSystem: boolean;
                module: string;
            };
        } & {
            id: number;
            createdAt: Date;
            roleId: number;
            permissionId: number;
        })[];
        _count: {
            userRoles: number;
        };
    } & {
        level: number;
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        isSystem: boolean;
        color: string | null;
        icon: string | null;
    }>;
}
