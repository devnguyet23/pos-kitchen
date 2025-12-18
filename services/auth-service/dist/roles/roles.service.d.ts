import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(params: {
        skip?: number;
        take?: number;
        level?: number;
    }): Promise<{
        data: ({
            _count: {
                permissions: number;
                userRoles: number;
            };
        } & {
            level: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            description: string | null;
            isSystem: boolean;
            color: string | null;
            icon: string | null;
        })[];
        total: number;
    }>;
    findOne(id: number): Promise<{
        permissions: ({
            permission: {
                id: number;
                createdAt: Date;
                name: string;
                code: string;
                description: string | null;
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
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
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
    }, currentUser: CurrentUserData): Promise<{
        level: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        isSystem: boolean;
        color: string | null;
        icon: string | null;
    }>;
    update(id: number, data: {
        name?: string;
        description?: string;
        color?: string;
    }, currentUser: CurrentUserData): Promise<{
        level: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        isSystem: boolean;
        color: string | null;
        icon: string | null;
    }>;
    remove(id: number, currentUser: CurrentUserData): Promise<{
        level: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        isSystem: boolean;
        color: string | null;
        icon: string | null;
    }>;
    assignPermissions(roleId: number, permissionIds: number[], currentUser: CurrentUserData): Promise<{
        permissions: ({
            permission: {
                id: number;
                createdAt: Date;
                name: string;
                code: string;
                description: string | null;
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
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        isSystem: boolean;
        color: string | null;
        icon: string | null;
    }>;
    addPermission(roleId: number, permissionId: number, currentUser: CurrentUserData): Promise<{
        permissions: ({
            permission: {
                id: number;
                createdAt: Date;
                name: string;
                code: string;
                description: string | null;
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
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        isSystem: boolean;
        color: string | null;
        icon: string | null;
    }>;
    removePermission(roleId: number, permissionId: number, currentUser: CurrentUserData): Promise<{
        permissions: ({
            permission: {
                id: number;
                createdAt: Date;
                name: string;
                code: string;
                description: string | null;
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
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        isSystem: boolean;
        color: string | null;
        icon: string | null;
    }>;
    private isSuperAdmin;
}
