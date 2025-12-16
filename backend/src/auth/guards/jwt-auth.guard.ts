import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
                    constructor(
                                        private jwtService: JwtService,
                                        private reflector: Reflector,
                                        private prisma: PrismaService,
                    ) { }

                    async canActivate(context: ExecutionContext): Promise<boolean> {
                                        // Check if route is public
                                        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
                                                            context.getHandler(),
                                                            context.getClass(),
                                        ]);

                                        if (isPublic) {
                                                            return true;
                                        }

                                        const request = context.switchToHttp().getRequest();
                                        const token = this.extractTokenFromHeader(request);

                                        if (!token) {
                                                            throw new UnauthorizedException('Token không tồn tại');
                                        }

                                        try {
                                                            const payload = await this.jwtService.verifyAsync(token);

                                                            // Get user with roles and permissions
                                                            const user = await this.prisma.user.findUnique({
                                                                                where: { id: payload.sub },
                                                                                include: {
                                                                                                    userRoles: {
                                                                                                                        where: { isActive: true },
                                                                                                                        include: {
                                                                                                                                            role: {
                                                                                                                                                                include: {
                                                                                                                                                                                    permissions: {
                                                                                                                                                                                                        include: {
                                                                                                                                                                                                                            permission: true,
                                                                                                                                                                                                        },
                                                                                                                                                                                    },
                                                                                                                                                                },
                                                                                                                                            },
                                                                                                                        },
                                                                                                    },
                                                                                },
                                                            });

                                                            if (!user || user.status !== 'ACTIVE') {
                                                                                throw new UnauthorizedException('Tài khoản không hợp lệ hoặc đã bị khóa');
                                                            }

                                                            // Build user data with permissions
                                                            const roles = user.userRoles.map(ur => ({
                                                                                code: ur.role.code,
                                                                                level: ur.role.level,
                                                                                chainId: ur.chainId,
                                                                                storeId: ur.storeId,
                                                            }));

                                                            // Collect all unique permissions
                                                            const permissionSet = new Set<string>();
                                                            user.userRoles.forEach(ur => {
                                                                                ur.role.permissions.forEach(rp => {
                                                                                                    permissionSet.add(rp.permission.code);
                                                                                });
                                                            });

                                                            request.user = {
                                                                                id: user.id,
                                                                                username: user.username,
                                                                                email: user.email,
                                                                                fullName: user.fullName,
                                                                                chainId: user.chainId,
                                                                                storeId: user.storeId,
                                                                                roles,
                                                                                permissions: Array.from(permissionSet),
                                                            };

                                                            return true;
                                        } catch (error) {
                                                            throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
                                        }
                    }

                    private extractTokenFromHeader(request: any): string | undefined {
                                        const [type, token] = request.headers.authorization?.split(' ') ?? [];
                                        return type === 'Bearer' ? token : undefined;
                    }
}
