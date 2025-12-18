import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, AssignRoleDto, ResetPasswordDto } from './dto/user.dto';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto, currentUser: CurrentUserData): Promise<{
        status: import(".prisma/client").$Enums.UserStatus;
        id: number;
        username: string;
        email: string;
        chainId: number;
        storeId: number;
        createdAt: Date;
        phone: string;
        fullName: string;
        avatarUrl: string;
        lastLoginAt: Date;
    }>;
    findAll(params: {
        skip?: number;
        take?: number;
        search?: string;
        status?: string;
        chainId?: number;
        storeId?: number;
        roleCode?: string;
    }, currentUser: CurrentUserData): Promise<{
        data: {
            status: import(".prisma/client").$Enums.UserStatus;
            id: number;
            username: string;
            email: string;
            chainId: number;
            storeId: number;
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
    findOne(id: number, currentUser: CurrentUserData): Promise<{
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
        status: import(".prisma/client").$Enums.UserStatus;
        id: number;
        username: string;
        email: string;
        chainId: number;
        storeId: number;
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
    update(id: number, updateUserDto: UpdateUserDto, currentUser: CurrentUserData): Promise<{
        status: import(".prisma/client").$Enums.UserStatus;
        id: number;
        username: string;
        email: string;
        chainId: number;
        storeId: number;
        createdAt: Date;
        phone: string;
        fullName: string;
        avatarUrl: string;
        lastLoginAt: Date;
    }>;
    remove(id: number, currentUser: CurrentUserData): Promise<{
        status: import(".prisma/client").$Enums.UserStatus;
        password: string;
        id: number;
        username: string;
        email: string;
        chainId: number | null;
        storeId: number | null;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
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
    assignRole(userId: number, assignRoleDto: AssignRoleDto, currentUser: CurrentUserData): Promise<{
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
    removeRole(userId: number, roleId: number, currentUser: CurrentUserData): Promise<{
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
    resetPassword(userId: number, resetPasswordDto: ResetPasswordDto, currentUser: CurrentUserData): Promise<{
        message: string;
    }>;
    lockUser(userId: number, currentUser: CurrentUserData): Promise<{
        status: import(".prisma/client").$Enums.UserStatus;
        id: number;
        username: string;
        email: string;
        chainId: number;
        storeId: number;
        createdAt: Date;
        phone: string;
        fullName: string;
        avatarUrl: string;
        lastLoginAt: Date;
    }>;
    unlockUser(userId: number, currentUser: CurrentUserData): Promise<{
        status: import(".prisma/client").$Enums.UserStatus;
        id: number;
        username: string;
        email: string;
        chainId: number;
        storeId: number;
        createdAt: Date;
        phone: string;
        fullName: string;
        avatarUrl: string;
        lastLoginAt: Date;
    }>;
    private getUserSelect;
    private isSuperAdmin;
    private hasChainAccess;
    private hasUserAccess;
    private canModifyUser;
}
