import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, AssignRoleDto, ResetPasswordDto } from './dto/user.dto';
import { CurrentUserData } from '../auth/decorators';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, user: CurrentUserData): Promise<{
        id: number;
        username: string;
        email: string;
        chainId: number;
        storeId: number;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        phone: string;
        fullName: string;
        avatarUrl: string;
        lastLoginAt: Date;
    }>;
    findAll(user: CurrentUserData, page?: string, pageSize?: string, search?: string, status?: string, chainId?: string, storeId?: string, roleCode?: string): Promise<{
        data: {
            id: number;
            username: string;
            email: string;
            chainId: number;
            storeId: number;
            status: import(".prisma/client").$Enums.UserStatus;
            createdAt: Date;
            phone: string;
            userRoles: ({
                role: {
                    id: number;
                    name: string;
                    code: string;
                    color: string;
                };
            } & {
                id: number;
                chainId: number | null;
                storeId: number | null;
                userId: number;
                createdAt: Date;
                roleId: number;
                assignedBy: number | null;
                assignedAt: Date;
                expiresAt: Date | null;
                isActive: boolean;
            })[];
            fullName: string;
            avatarUrl: string;
            lastLoginAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: number, user: CurrentUserData): Promise<{
        chain: {
            id: number;
            name: string;
            code: string;
        };
        store: {
            id: number;
            name: string;
            code: string;
        };
        id: number;
        username: string;
        email: string;
        chainId: number;
        storeId: number;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        phone: string;
        userRoles: ({
            role: {
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
            };
        } & {
            id: number;
            chainId: number | null;
            storeId: number | null;
            userId: number;
            createdAt: Date;
            roleId: number;
            assignedBy: number | null;
            assignedAt: Date;
            expiresAt: Date | null;
            isActive: boolean;
        })[];
        fullName: string;
        avatarUrl: string;
        lastLoginAt: Date;
    }>;
    update(id: number, updateUserDto: UpdateUserDto, user: CurrentUserData): Promise<{
        id: number;
        username: string;
        email: string;
        chainId: number;
        storeId: number;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        phone: string;
        fullName: string;
        avatarUrl: string;
        lastLoginAt: Date;
    }>;
    remove(id: number, user: CurrentUserData): Promise<{
        id: number;
        username: string;
        email: string;
        chainId: number | null;
        storeId: number | null;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        password: string;
        fullName: string;
        avatarUrl: string | null;
        dateOfBirth: Date | null;
        gender: string | null;
        citizenId: string | null;
        twoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        passwordChangedAt: Date | null;
        failedLoginAttempts: number;
        lockedUntil: Date | null;
    }>;
    assignRole(id: number, assignRoleDto: AssignRoleDto, user: CurrentUserData): Promise<{
        role: {
            id: number;
            name: string;
            code: string;
        };
    } & {
        id: number;
        chainId: number | null;
        storeId: number | null;
        userId: number;
        createdAt: Date;
        roleId: number;
        assignedBy: number | null;
        assignedAt: Date;
        expiresAt: Date | null;
        isActive: boolean;
    }>;
    removeRole(id: number, roleId: number, user: CurrentUserData): Promise<{
        id: number;
        chainId: number | null;
        storeId: number | null;
        userId: number;
        createdAt: Date;
        roleId: number;
        assignedBy: number | null;
        assignedAt: Date;
        expiresAt: Date | null;
        isActive: boolean;
    }>;
    resetPassword(id: number, resetPasswordDto: ResetPasswordDto, user: CurrentUserData): Promise<{
        message: string;
    }>;
    lockUser(id: number, user: CurrentUserData): Promise<{
        id: number;
        username: string;
        email: string;
        chainId: number;
        storeId: number;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        phone: string;
        fullName: string;
        avatarUrl: string;
        lastLoginAt: Date;
    }>;
    unlockUser(id: number, user: CurrentUserData): Promise<{
        id: number;
        username: string;
        email: string;
        chainId: number;
        storeId: number;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        phone: string;
        fullName: string;
        avatarUrl: string;
        lastLoginAt: Date;
    }>;
}
