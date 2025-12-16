import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
                    constructor(
                                        private prisma: PrismaService,
                                        private jwtService: JwtService,
                    ) { }

                    async login(loginDto: LoginDto) {
                                        const { username, password } = loginDto;

                                        // Find user by username or email
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
                                                            throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
                                        }

                                        // Check if account is locked
                                        if (user.lockedUntil && user.lockedUntil > new Date()) {
                                                            throw new UnauthorizedException('Tài khoản đã bị khóa. Vui lòng thử lại sau');
                                        }

                                        // Check password
                                        const isPasswordValid = await bcrypt.compare(password, user.password);
                                        if (!isPasswordValid) {
                                                            // Increment failed login attempts
                                                            await this.prisma.user.update({
                                                                                where: { id: user.id },
                                                                                data: {
                                                                                                    failedLoginAttempts: { increment: 1 },
                                                                                                    // Lock account after 5 failed attempts for 30 minutes
                                                                                                    lockedUntil: user.failedLoginAttempts >= 4
                                                                                                                        ? new Date(Date.now() + 30 * 60 * 1000)
                                                                                                                        : null,
                                                                                },
                                                            });
                                                            throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
                                        }

                                        // Check if user is active
                                        if (user.status !== 'ACTIVE') {
                                                            throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
                                        }

                                        // Reset failed login attempts and update last login
                                        await this.prisma.user.update({
                                                            where: { id: user.id },
                                                            data: {
                                                                                failedLoginAttempts: 0,
                                                                                lockedUntil: null,
                                                                                lastLoginAt: new Date(),
                                                            },
                                        });

                                        // Log audit
                                        await this.createAuditLog(user.id, 'LOGIN', 'User', user.id, null);

                                        // Build token payload
                                        const roles = user.userRoles.map(ur => ({
                                                            code: ur.role.code,
                                                            level: ur.role.level,
                                                            chainId: ur.chainId,
                                                            storeId: ur.storeId,
                                        }));

                                        const permissions = new Set<string>();
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

                    async register(registerDto: RegisterDto) {
                                        const { username, email, password, fullName, phone } = registerDto;

                                        // Check if username exists
                                        const existingUser = await this.prisma.user.findFirst({
                                                            where: {
                                                                                OR: [{ username }, { email }],
                                                            },
                                        });

                                        if (existingUser) {
                                                            if (existingUser.username === username) {
                                                                                throw new ConflictException('Username đã tồn tại');
                                                            }
                                                            throw new ConflictException('Email đã tồn tại');
                                        }

                                        // Hash password
                                        const hashedPassword = await bcrypt.hash(password, 10);

                                        // Create user
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

                                        // Log audit
                                        await this.createAuditLog(user.id, 'CREATE', 'User', user.id, null);

                                        return {
                                                            id: user.id,
                                                            username: user.username,
                                                            email: user.email,
                                                            fullName: user.fullName,
                                        };
                    }

                    async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
                                        const { currentPassword, newPassword } = changePasswordDto;

                                        const user = await this.prisma.user.findUnique({
                                                            where: { id: userId },
                                        });

                                        if (!user) {
                                                            throw new BadRequestException('Người dùng không tồn tại');
                                        }

                                        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
                                        if (!isPasswordValid) {
                                                            throw new BadRequestException('Mật khẩu hiện tại không đúng');
                                        }

                                        const hashedPassword = await bcrypt.hash(newPassword, 10);

                                        await this.prisma.user.update({
                                                            where: { id: userId },
                                                            data: {
                                                                                password: hashedPassword,
                                                                                passwordChangedAt: new Date(),
                                                            },
                                        });

                                        // Log audit
                                        await this.createAuditLog(userId, 'UPDATE', 'User', userId, null);

                                        return { message: 'Đổi mật khẩu thành công' };
                    }

                    async refreshToken(refreshToken: string) {
                                        try {
                                                            const payload = await this.jwtService.verifyAsync(refreshToken);

                                                            const user = await this.prisma.user.findUnique({
                                                                                where: { id: payload.sub },
                                                            });

                                                            if (!user || user.status !== 'ACTIVE') {
                                                                                throw new UnauthorizedException('Tài khoản không hợp lệ');
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
                                        } catch {
                                                            throw new UnauthorizedException('Refresh token không hợp lệ');
                                        }
                    }

                    async getProfile(userId: number) {
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
                                                            throw new BadRequestException('Người dùng không tồn tại');
                                        }

                                        const roles = user.userRoles.map(ur => ({
                                                            code: ur.role.code,
                                                            name: ur.role.name,
                                                            level: ur.role.level,
                                                            chainId: ur.chainId,
                                                            storeId: ur.storeId,
                                        }));

                                        const permissions = new Set<string>();
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

                    private async createAuditLog(
                                        userId: number,
                                        action: string,
                                        model: string,
                                        modelId: number,
                                        request?: any,
                    ) {
                                        try {
                                                            await this.prisma.auditLog.create({
                                                                                data: {
                                                                                                    userId,
                                                                                                    action,
                                                                                                    model,
                                                                                                    modelId,
                                                                                                    ipAddress: request?.ip,
                                                                                                    userAgent: request?.headers?.['user-agent'],
                                                                                },
                                                            });
                                        } catch (error) {
                                                            console.error('Failed to create audit log:', error);
                                        }
                    }
}
