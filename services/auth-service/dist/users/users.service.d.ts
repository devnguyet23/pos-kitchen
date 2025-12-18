import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, AssignRoleDto, ResetPasswordDto } from './dto/user.dto';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto, currentUser: CurrentUserData): Promise<{
        status: import(".prisma/client").$Enums.UserStatus;
        username: string;
        email: string;
        fullName: string;
        phone: string;
        id: number;
        chainId: number;
        storeId: number;
        avatarUrl: string;
        lastLoginAt: Date;
        createdAt: Date;
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
            username: string;
            email: string;
            fullName: string;
            phone: string;
            id: number;
            chainId: number;
            storeId: number;
            avatarUrl: string;
            lastLoginAt: Date;
            createdAt: Date;
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
                createdAt: Date;
                userId: number;
                roleId: number;
                assignedBy: number | null;
                assignedAt: Date;
                expiresAt: Date | null;
                isActive: boolean;
            })[];
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
        username: string;
        email: string;
        fullName: string;
        phone: string;
        id: number;
        chainId: number;
        storeId: number;
        avatarUrl: string;
        lastLoginAt: Date;
        createdAt: Date;
        userRoles: ({
            role: {
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
            };
        } & {
            id: number;
            chainId: number | null;
            storeId: number | null;
            createdAt: Date;
            userId: number;
            roleId: number;
            assignedBy: number | null;
            assignedAt: Date;
            expiresAt: Date | null;
            isActive: boolean;
        })[];
    }>;
    update(id: number, updateUserDto: UpdateUserDto, currentUser: CurrentUserData): Promise<{
        status: import(".prisma/client").$Enums.UserStatus;
        username: string;
        email: string;
        fullName: string;
        phone: string;
        id: number;
        chainId: number;
        storeId: number;
        avatarUrl: string;
        lastLoginAt: Date;
        createdAt: Date;
    }>;
    remove(id: number, currentUser: CurrentUserData): Promise<{
        status: import(".prisma/client").$Enums.UserStatus;
        username: string;
        password: string;
        email: string;
        fullName: string;
        phone: string | null;
        id: number;
        chainId: number | null;
        storeId: number | null;
        avatarUrl: string | null;
        dateOfBirth: Date | null;
        gender: string | null;
        address: string | null;
        citizenId: string | null;
        twoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        passwordChangedAt: Date | null;
        failedLoginAttempts: number;
        lockedUntil: Date | null;
        createdAt: Date;
        updatedAt: Date;
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
        createdAt: Date;
        userId: number;
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
        createdAt: Date;
        userId: number;
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
        username: string;
        email: string;
        fullName: string;
        phone: string;
        id: number;
        chainId: number;
        storeId: number;
        avatarUrl: string;
        lastLoginAt: Date;
        createdAt: Date;
    }>;
    unlockUser(userId: number, currentUser: CurrentUserData): Promise<{
        status: import(".prisma/client").$Enums.UserStatus;
        username: string;
        email: string;
        fullName: string;
        phone: string;
        id: number;
        chainId: number;
        storeId: number;
        avatarUrl: string;
        lastLoginAt: Date;
        createdAt: Date;
    }>;
    private getUserSelect;
    private isSuperAdmin;
    private hasChainAccess;
    private hasUserAccess;
    private canModifyUser;
}
