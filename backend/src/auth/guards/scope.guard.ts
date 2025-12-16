import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CurrentUserData } from '../decorators/current-user.decorator';

/**
 * ScopeGuard ensures users can only access resources within their scope
 * - Super Admin: All data
 * - Chain Owner/Admin: Only their chain's data
 * - Store Manager/Cashier: Only their store's data
 */
@Injectable()
export class ScopeGuard implements CanActivate {
                    canActivate(context: ExecutionContext): boolean {
                                        const request = context.switchToHttp().getRequest();
                                        const user = request.user as CurrentUserData;

                                        if (!user) {
                                                            return true; // Let auth guard handle unauthenticated
                                        }

                                        // Super admin can access everything
                                        const isSuperAdmin = user.roles.some(r => r.code === 'super_admin');
                                        if (isSuperAdmin) {
                                                            return true;
                                        }

                                        // Get requested scope from query/params
                                        const requestedChainId = this.getRequestedChainId(request);
                                        const requestedStoreId = this.getRequestedStoreId(request);

                                        // If no specific scope requested, allow (will be filtered in service)
                                        if (!requestedChainId && !requestedStoreId) {
                                                            return true;
                                        }

                                        // Check chain scope
                                        if (requestedChainId) {
                                                            const hasChainAccess = user.roles.some(r =>
                                                                                r.level === 1 || // System level
                                                                                (r.level === 2 && r.chainId === requestedChainId) || // Chain level
                                                                                (r.level === 3 && r.chainId === requestedChainId) // Store level in same chain
                                                            ) || user.chainId === requestedChainId;

                                                            if (!hasChainAccess) {
                                                                                throw new ForbiddenException('Bạn không có quyền truy cập chuỗi này');
                                                            }
                                        }

                                        // Check store scope
                                        if (requestedStoreId) {
                                                            const hasStoreAccess = user.roles.some(r =>
                                                                                r.level === 1 || // System level
                                                                                r.level === 2 || // Chain level can access all stores in chain
                                                                                (r.level === 3 && r.storeId === requestedStoreId) // Store level
                                                            ) || user.storeId === requestedStoreId;

                                                            if (!hasStoreAccess) {
                                                                                throw new ForbiddenException('Bạn không có quyền truy cập cửa hàng này');
                                                            }
                                        }

                                        return true;
                    }

                    private getRequestedChainId(request: any): number | null {
                                        const chainId = request.query?.chainId || request.params?.chainId || request.body?.chainId;
                                        return chainId ? parseInt(chainId, 10) : null;
                    }

                    private getRequestedStoreId(request: any): number | null {
                                        const storeId = request.query?.storeId || request.params?.storeId || request.body?.storeId;
                                        return storeId ? parseInt(storeId, 10) : null;
                    }
}
