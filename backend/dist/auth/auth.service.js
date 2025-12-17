"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async login(loginDto) {
        const { username, password } = loginDto;
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email: username },
                ],
            },
            include: {
                userRoles: {
                    where: { isActive: true },
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: { permission: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new common_1.UnauthorizedException('Tài khoản đã bị khóa. Vui lòng thử lại sau');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    failedLoginAttempts: { increment: 1 },
                    lockedUntil: user.failedLoginAttempts >= 4
                        ? new Date(Date.now() + 30 * 60 * 1000)
                        : null,
                },
            });
            throw new common_1.UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
        }
        if (user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
            },
        });
        await this.createAuditLog(user.id, 'LOGIN', 'User', user.id, null);
        const roles = user.userRoles.map(ur => ({
            code: ur.role.code,
            level: ur.role.level,
            chainId: ur.chainId,
            storeId: ur.storeId,
        }));
        const permissions = new Set();
        user.userRoles.forEach(ur => {
            ur.role.permissions.forEach(rp => {
                permissions.add(rp.permission.code);
            });
        });
        const payload = {
            sub: user.id,
            username: user.username,
            email: user.email,
            chainId: user.chainId,
            storeId: user.storeId,
        };
        return {
            accessToken: await this.jwtService.signAsync(payload),
            refreshToken: await this.jwtService.signAsync(payload, { expiresIn: '7d' }),
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                chainId: user.chainId,
                storeId: user.storeId,
                roles,
                permissions: Array.from(permissions),
            },
        };
    }
    async register(registerDto) {
        const { username, email, password, fullName, phone } = registerDto;
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });
        if (existingUser) {
            if (existingUser.username === username) {
                throw new common_1.ConflictException('Username đã tồn tại');
            }
            throw new common_1.ConflictException('Email đã tồn tại');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                fullName,
                phone,
                status: 'ACTIVE',
            },
        });
        await this.createAuditLog(user.id, 'CREATE', 'User', user.id, null);
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
        };
    }
    async changePassword(userId, changePasswordDto) {
        const { currentPassword, newPassword } = changePasswordDto;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.BadRequestException('Người dùng không tồn tại');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('Mật khẩu hiện tại không đúng');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                passwordChangedAt: new Date(),
            },
        });
        await this.createAuditLog(userId, 'UPDATE', 'User', userId, null);
        return { message: 'Đổi mật khẩu thành công' };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || user.status !== 'ACTIVE') {
                throw new common_1.UnauthorizedException('Tài khoản không hợp lệ');
            }
            const newPayload = {
                sub: user.id,
                username: user.username,
                email: user.email,
                chainId: user.chainId,
                storeId: user.storeId,
            };
            return {
                accessToken: await this.jwtService.signAsync(newPayload),
                refreshToken: await this.jwtService.signAsync(newPayload, { expiresIn: '7d' }),
            };
        }
        catch (_a) {
            throw new common_1.UnauthorizedException('Refresh token không hợp lệ');
        }
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                chain: { select: { id: true, name: true, code: true } },
                store: { select: { id: true, name: true, code: true } },
                userRoles: {
                    where: { isActive: true },
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: { permission: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Người dùng không tồn tại');
        }
        const roles = user.userRoles.map(ur => ({
            code: ur.role.code,
            name: ur.role.name,
            level: ur.role.level,
            chainId: ur.chainId,
            storeId: ur.storeId,
        }));
        const permissions = new Set();
        user.userRoles.forEach(ur => {
            ur.role.permissions.forEach(rp => {
                permissions.add(rp.permission.code);
            });
        });
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            chain: user.chain,
            store: user.store,
            roles,
            permissions: Array.from(permissions),
        };
    }
    async createAuditLog(userId, action, model, modelId, request) {
        var _a;
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId,
                    action,
                    model,
                    modelId,
                    ipAddress: request === null || request === void 0 ? void 0 : request.ip,
                    userAgent: (_a = request === null || request === void 0 ? void 0 : request.headers) === null || _a === void 0 ? void 0 : _a['user-agent'],
                },
            });
        }
        catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map