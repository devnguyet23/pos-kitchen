// Type definitions for Auth
export interface User {
                    id: number;
                    username: string;
                    email: string;
                    fullName: string;
                    phone?: string;
                    avatarUrl?: string;
                    chainId?: number;
                    storeId?: number;
                    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
                    roles: UserRole[];
                    permissions: string[];
}

export interface UserRole {
                    id: number;
                    code: string;
                    name: string;
                    level: number;
                    chainId?: number;
                    storeId?: number;
}

export interface Chain {
                    id: number;
                    name: string;
                    code: string;
                    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
                    description?: string;
                    logoUrl?: string;
                    email?: string;
                    phone?: string;
                    address?: string;
                    website?: string;
                    taxCode?: string;
                    _count?: {
                                        stores?: number;
                                        users?: number;
                    };
}

export interface Store {
                    id: number;
                    chainId: number;
                    name: string;
                    code: string;
                    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
                    address?: string;
                    phone?: string;
                    email?: string;
                    chain?: Chain;
                    _count?: {
                                        users?: number;
                    };
}

export interface Role {
                    id: number;
                    name: string;
                    code: string;
                    level: number;
                    description?: string;
                    color?: string;
                    isSystem: boolean;
                    permissions?: RolePermission[];
                    _count?: {
                                        userRoles?: number;
                                        permissions?: number;
                    };
}

export interface Permission {
                    id: number;
                    name: string;
                    code: string;
                    module: string;
                    description?: string;
}

export interface RolePermission {
                    id: number;
                    roleId: number;
                    permissionId: number;
                    permission?: Permission;
}

export interface Shift {
                    id: number;
                    storeId: number;
                    userId: number;
                    shiftCode: string;
                    openedAt: string;
                    closedAt?: string;
                    openingCash: number;
                    closingCash?: number;
                    expectedCash?: number;
                    cashDifference?: number;
                    totalSales: number;
                    totalRefunds: number;
                    status: 'OPEN' | 'CLOSED';
                    note?: string;
                    user?: Pick<User, 'id' | 'fullName' | 'username'>;
                    store?: Pick<Store, 'id' | 'name' | 'code'>;
}

export interface ApiResponse<T> {
                    data: T;
                    total?: number;
                    page?: number;
                    pageSize?: number;
                    totalPages?: number;
}

export interface LoginRequest {
                    username: string;
                    password: string;
}

export interface LoginResponse {
                    accessToken: string;
                    refreshToken: string;
                    user: User;
}
