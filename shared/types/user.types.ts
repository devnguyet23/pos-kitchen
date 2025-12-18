/**
 * Shared User Types for POS Microservices
 */

export interface RoleData {
                    id: number;
                    code: string;
                    name: string;
                    level: number;  // 1: System, 2: Chain, 3: Store
}

export interface CurrentUserData {
                    id: number;
                    username: string;
                    email?: string;
                    fullName?: string;
                    chainId?: number;
                    storeId?: number;
                    roles: RoleData[];
                    permissions: string[];
}

export interface UserProfile {
                    id: number;
                    username: string;
                    email: string;
                    fullName: string;
                    phone?: string;
                    chainId?: number;
                    storeId?: number;
                    status: UserStatus;
                    roles: RoleData[];
                    createdAt: Date;
                    updatedAt: Date;
}

export enum UserStatus {
                    ACTIVE = 'ACTIVE',
                    INACTIVE = 'INACTIVE',
                    SUSPENDED = 'SUSPENDED',
}

export interface TokenPayload {
                    sub: number;       // User ID
                    username: string;
                    chainId?: number;
                    storeId?: number;
                    iat?: number;      // Issued at
                    exp?: number;      // Expiration
}

export interface AuthTokens {
                    accessToken: string;
                    refreshToken: string;
                    expiresIn: number;
}
