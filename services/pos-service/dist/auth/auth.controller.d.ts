import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ChangePasswordDto, RefreshTokenDto } from './dto/auth.dto';
import { CurrentUserData } from './decorators';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    changePassword(user: CurrentUserData, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getProfile(user: CurrentUserData): Promise<{
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
    me(user: CurrentUserData): Promise<CurrentUserData>;
}
