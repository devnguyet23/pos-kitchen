import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators';
import { CurrentUserData } from '../decorators/current-user.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
                    constructor(private reflector: Reflector) { }

                    canActivate(context: ExecutionContext): boolean {
                                        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
                                                            context.getHandler(),
                                                            context.getClass(),
                                        ]);

                                        // If no permissions required, allow access
                                        if (!requiredPermissions || requiredPermissions.length === 0) {
                                                            return true;
                                        }

                                        const request = context.switchToHttp().getRequest();
                                        const user = request.user as CurrentUserData;

                                        if (!user) {
                                                            throw new ForbiddenException('Bạn chưa đăng nhập');
                                        }

                                        // Super admin has all permissions
                                        const isSuperAdmin = user.roles.some(r => r.code === 'super_admin');
                                        if (isSuperAdmin) {
                                                            return true;
                                        }

                                        // Check if user has any of the required permissions
                                        const hasPermission = requiredPermissions.some(permission =>
                                                            user.permissions.includes(permission)
                                        );

                                        if (!hasPermission) {
                                                            throw new ForbiddenException(
                                                                                `Bạn không có quyền thực hiện hành động này. Yêu cầu: ${requiredPermissions.join(' hoặc ')}`
                                                            );
                                        }

                                        return true;
                    }
}
