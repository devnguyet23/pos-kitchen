'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Role } from '@/lib/types';
import { Shield, ChevronDown, ChevronRight, Check } from 'lucide-react';

interface PermissionGroup {
                    module: string;
                    permissions: { id: number; name: string; code: string }[];
}

export default function RolesPage() {
                    const [roles, setRoles] = useState<Role[]>([]);
                    const [permissions, setPermissions] = useState<PermissionGroup[]>([]);
                    const [loading, setLoading] = useState(true);
                    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
                    const [expandedModules, setExpandedModules] = useState<string[]>([]);

                    const fetchData = async () => {
                                        setLoading(true);
                                        try {
                                                            const [rolesRes, permsRes] = await Promise.all([
                                                                                api.get<{ data: Role[] }>('/roles'),
                                                                                api.get<{ grouped: Record<string, any[]> }>('/permissions'),
                                                            ]);
                                                            setRoles(rolesRes.data);

                                                            // Convert grouped permissions to array
                                                            const groups = Object.entries(permsRes.grouped).map(([module, perms]) => ({
                                                                                module,
                                                                                permissions: perms,
                                                            }));
                                                            setPermissions(groups);

                                                            if (rolesRes.data.length > 0) {
                                                                                setSelectedRole(rolesRes.data[0]);
                                                            }
                                        } catch (error) {
                                                            console.error('Failed to fetch data:', error);
                                        } finally {
                                                            setLoading(false);
                                        }
                    };

                    useEffect(() => {
                                        fetchData();
                    }, []);

                    const loadRolePermissions = async (roleId: number) => {
                                        try {
                                                            const role = await api.get<Role>(`/roles/${roleId}`);
                                                            setSelectedRole(role);
                                        } catch (error) {
                                                            console.error('Failed to load role:', error);
                                        }
                    };

                    const toggleModule = (module: string) => {
                                        setExpandedModules(prev =>
                                                            prev.includes(module)
                                                                                ? prev.filter(m => m !== module)
                                                                                : [...prev, module]
                                        );
                    };

                    const roleHasPermission = (permCode: string) => {
                                        if (!selectedRole?.permissions) return false;
                                        return selectedRole.permissions.some(rp => rp.permission?.code === permCode);
                    };

                    const getModuleLabel = (module: string) => {
                                        const labels: Record<string, string> = {
                                                            chain: 'Quản lý chuỗi',
                                                            store: 'Quản lý cửa hàng',
                                                            user: 'Quản lý người dùng',
                                                            sales: 'Bán hàng',
                                                            inventory: 'Kho hàng',
                                                            product: 'Sản phẩm',
                                                            shift: 'Ca làm việc',
                                                            report: 'Báo cáo',
                                                            system: 'Hệ thống',
                                        };
                                        return labels[module] || module;
                    };

                    return (
                                        <ProtectedRoute roles={['super_admin', 'chain_owner']}>
                                                            <div className="ml-64 p-8">
                                                                                <div className="max-w-7xl mx-auto">
                                                                                                    {/* Header */}
                                                                                                    <div className="mb-8">
                                                                                                                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                                                                                                                            <Shield className="text-indigo-600" />
                                                                                                                                            Quản lý Vai trò & Quyền
                                                                                                                        </h1>
                                                                                                                        <p className="text-gray-500 mt-1">Xem và quản lý quyền của từng vai trò</p>
                                                                                                    </div>

                                                                                                    {loading ? (
                                                                                                                        <div className="flex items-center justify-center py-12">
                                                                                                                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                                                                                                                        </div>
                                                                                                    ) : (
                                                                                                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                                                                                                            {/* Roles List */}
                                                                                                                                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                                                                                                                                                <h2 className="font-semibold text-gray-800 mb-4">Vai trò</h2>
                                                                                                                                                                <div className="space-y-2">
                                                                                                                                                                                    {roles.map(role => (
                                                                                                                                                                                                        <button
                                                                                                                                                                                                                            key={role.id}
                                                                                                                                                                                                                            onClick={() => loadRolePermissions(role.id)}
                                                                                                                                                                                                                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedRole?.id === role.id
                                                                                                                                                                                                                                                                    ? 'bg-indigo-50 border border-indigo-200'
                                                                                                                                                                                                                                                                    : 'hover:bg-gray-50'
                                                                                                                                                                                                                                                }`}
                                                                                                                                                                                                        >
                                                                                                                                                                                                                            <div
                                                                                                                                                                                                                                                className="w-3 h-3 rounded-full"
                                                                                                                                                                                                                                                style={{ backgroundColor: role.color || '#6366f1' }}
                                                                                                                                                                                                                            />
                                                                                                                                                                                                                            <div className="text-left">
                                                                                                                                                                                                                                                <p className={`font-medium ${selectedRole?.id === role.id ? 'text-indigo-700' : 'text-gray-800'}`}>
                                                                                                                                                                                                                                                                    {role.name}
                                                                                                                                                                                                                                                </p>
                                                                                                                                                                                                                                                <p className="text-xs text-gray-500">
                                                                                                                                                                                                                                                                    Level {role.level} • {role._count?.userRoles || 0} người dùng
                                                                                                                                                                                                                                                </p>
                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                        </button>
                                                                                                                                                                                    ))}
                                                                                                                                                                </div>
                                                                                                                                            </div>

                                                                                                                                            {/* Permissions Grid */}
                                                                                                                                            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                                                                                                                                                <h2 className="font-semibold text-gray-800 mb-4">
                                                                                                                                                                                    Quyền của {selectedRole?.name || '...'}
                                                                                                                                                                                    {selectedRole?.isSystem && (
                                                                                                                                                                                                        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                                                                                                                                                                                            Hệ thống
                                                                                                                                                                                                        </span>
                                                                                                                                                                                    )}
                                                                                                                                                                </h2>

                                                                                                                                                                <div className="space-y-2">
                                                                                                                                                                                    {permissions.map(group => (
                                                                                                                                                                                                        <div key={group.module} className="border border-gray-200 rounded-lg overflow-hidden">
                                                                                                                                                                                                                            <button
                                                                                                                                                                                                                                                onClick={() => toggleModule(group.module)}
                                                                                                                                                                                                                                                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                                <span className="font-medium text-gray-700">
                                                                                                                                                                                                                                                                    {getModuleLabel(group.module)}
                                                                                                                                                                                                                                                </span>
                                                                                                                                                                                                                                                <div className="flex items-center gap-2">
                                                                                                                                                                                                                                                                    <span className="text-xs text-gray-500">
                                                                                                                                                                                                                                                                                        {group.permissions.filter(p => roleHasPermission(p.code)).length}/{group.permissions.length}
                                                                                                                                                                                                                                                                    </span>
                                                                                                                                                                                                                                                                    {expandedModules.includes(group.module)
                                                                                                                                                                                                                                                                                        ? <ChevronDown size={18} className="text-gray-400" />
                                                                                                                                                                                                                                                                                        : <ChevronRight size={18} className="text-gray-400" />
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                            </button>

                                                                                                                                                                                                                            {expandedModules.includes(group.module) && (
                                                                                                                                                                                                                                                <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                                                                                                                                                                                                                    {group.permissions.map(perm => (
                                                                                                                                                                                                                                                                                        <div
                                                                                                                                                                                                                                                                                                            key={perm.id}
                                                                                                                                                                                                                                                                                                            className={`flex items-center gap-2 p-2 rounded ${roleHasPermission(perm.code)
                                                                                                                                                                                                                                                                                                                                                    ? 'bg-green-50 text-green-700'
                                                                                                                                                                                                                                                                                                                                                    : 'text-gray-400'
                                                                                                                                                                                                                                                                                                                                }`}
                                                                                                                                                                                                                                                                                        >
                                                                                                                                                                                                                                                                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${roleHasPermission(perm.code)
                                                                                                                                                                                                                                                                                                                                                    ? 'bg-green-500 border-green-500'
                                                                                                                                                                                                                                                                                                                                                    : 'border-gray-300'
                                                                                                                                                                                                                                                                                                                                }`}>
                                                                                                                                                                                                                                                                                                                                {roleHasPermission(perm.code) && <Check size={12} className="text-white" />}
                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                            <span className="text-sm">{perm.name}</span>
                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                    ))}
                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                            )}
                                                                                                                                                                                                        </div>
                                                                                                                                                                                    ))}
                                                                                                                                                                </div>
                                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                    )}
                                                                                </div>
                                                            </div>
                                        </ProtectedRoute>
                    );
}
