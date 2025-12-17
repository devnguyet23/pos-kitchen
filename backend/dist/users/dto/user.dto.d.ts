export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED"
}
export declare class CreateUserDto {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    chainId?: number;
    storeId?: number;
    roleId?: number;
    avatarUrl?: string;
    address?: string;
    citizenId?: string;
    status?: UserStatus;
}
export declare class UpdateUserDto {
    username?: string;
    email?: string;
    fullName?: string;
    phone?: string;
    roleId?: number;
    chainId?: number;
    storeId?: number;
    avatarUrl?: string;
    address?: string;
    citizenId?: string;
    status?: UserStatus;
}
export declare class AssignRoleDto {
    roleId: number;
    chainId?: number;
    storeId?: number;
}
export declare class ResetPasswordDto {
    newPassword: string;
}
