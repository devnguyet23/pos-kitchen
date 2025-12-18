import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: number;
            username: string;
            email: string;
            fullName: string;
            avatarUrl: string;
            chainId: number;
            storeId: number;
            roles: {
                code: string;
                level: number;
                chainId: number;
                storeId: number;
            }[];
            permissions: string[];
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: number;
        username: string;
        email: string;
        fullName: string;
    }>;
    changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(userId: number): Promise<{
        id: number;
        username: string;
        email: string;
        fullName: string;
        phone: string;
        avatarUrl: string;
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
        roles: {
            code: string;
            name: string;
            level: number;
            chainId: number;
            storeId: number;
        }[];
        permissions: string[];
    }>;
    private createAuditLog;
}
