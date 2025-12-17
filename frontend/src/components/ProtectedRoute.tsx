'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
                    children: ReactNode;
                    permissions?: string[];
                    roles?: string[];
                    requireAll?: boolean; // If true, require ALL permissions/roles. If false, require ANY.
}

export function ProtectedRoute({
                    children,
                    permissions = [],
                    roles = [],
                    requireAll = false,
}: ProtectedRouteProps) {
                    const { isAuthenticated, isLoading, hasPermission, hasRole, hasAnyPermission, hasAnyRole } = useAuth();
                    const router = useRouter();

                    useEffect(() => {
                                        if (!isLoading && !isAuthenticated) {
                                                            router.push('/login');
                                        }
                    }, [isLoading, isAuthenticated, router]);

                    if (isLoading) {
                                        return (
                                                            <div className="flex items-center justify-center min-h-screen">
                                                                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                                            </div>
                                        );
                    }

                    if (!isAuthenticated) {
                                        return null;
                    }

                    // Check permissions
                    if (permissions.length > 0) {
                                        const hasRequiredPermissions = requireAll
                                                            ? permissions.every(p => hasPermission(p))
                                                            : hasAnyPermission(...permissions);

                                        if (!hasRequiredPermissions) {
                                                            return (
                                                                                <div className="flex flex-col items-center justify-center min-h-screen">
                                                                                                    <h1 className="text-2xl font-bold text-red-600 mb-4">Không có quyền truy cập</h1>
                                                                                                    <p className="text-gray-600">Bạn không có quyền để xem trang này.</p>
                                                                                                    <button
                                                                                                                        onClick={() => router.back()}
                                                                                                                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                                                                    >
                                                                                                                        Quay lại
                                                                                                    </button>
                                                                                </div>
                                                            );
                                        }
                    }

                    // Check roles
                    if (roles.length > 0) {
                                        const hasRequiredRoles = requireAll
                                                            ? roles.every(r => hasRole(r))
                                                            : hasAnyRole(...roles);

                                        if (!hasRequiredRoles) {
                                                            return (
                                                                                <div className="flex flex-col items-center justify-center min-h-screen">
                                                                                                    <h1 className="text-2xl font-bold text-red-600 mb-4">Không có quyền truy cập</h1>
                                                                                                    <p className="text-gray-600">Bạn không có vai trò phù hợp để xem trang này.</p>
                                                                                                    <button
                                                                                                                        onClick={() => router.back()}
                                                                                                                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                                                                    >
                                                                                                                        Quay lại
                                                                                                    </button>
                                                                                </div>
                                                            );
                                        }
                    }

                    return <>{children}</>;
}

// HOC for checking specific permission
export function withPermission(WrappedComponent: React.ComponentType, permission: string) {
                    return function WithPermissionComponent(props: any) {
                                        return (
                                                            <ProtectedRoute permissions={[permission]}>
                                                                                <WrappedComponent {...props} />
                                                            </ProtectedRoute>
                                        );
                    };
}

// HOC for checking specific role
export function withRole(WrappedComponent: React.ComponentType, role: string) {
                    return function WithRoleComponent(props: any) {
                                        return (
                                                            <ProtectedRoute roles={[role]}>
                                                                                <WrappedComponent {...props} />
                                                            </ProtectedRoute>
                                        );
                    };
}
