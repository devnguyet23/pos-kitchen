'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { User, LogOut, Store, Building2, Settings, Users, Shield, Clock, FileText } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function UserMenu() {
                    const { user, logout, hasPermission, hasAnyRole } = useAuth();
                    const [isOpen, setIsOpen] = useState(false);
                    const menuRef = useRef<HTMLDivElement>(null);
                    const router = useRouter();

                    useEffect(() => {
                                        function handleClickOutside(event: MouseEvent) {
                                                            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                                                                                setIsOpen(false);
                                                            }
                                        }
                                        document.addEventListener('mousedown', handleClickOutside);
                                        return () => document.removeEventListener('mousedown', handleClickOutside);
                    }, []);

                    if (!user) return null;

                    const menuItems = [
                                        {
                                                            label: 'Thông tin cá nhân',
                                                            icon: User,
                                                            onClick: () => router.push('/profile'),
                                                            show: true,
                                        },
                                        {
                                                            label: 'Quản lý chuỗi',
                                                            icon: Building2,
                                                            onClick: () => router.push('/admin/chains'),
                                                            show: hasAnyRole('super_admin', 'chain_owner', 'chain_admin'),
                                        },
                                        {
                                                            label: 'Quản lý cửa hàng',
                                                            icon: Store,
                                                            onClick: () => router.push('/admin/stores'),
                                                            show: hasPermission('view_stores') || hasPermission('view_own_store'),
                                        },
                                        {
                                                            label: 'Quản lý người dùng',
                                                            icon: Users,
                                                            onClick: () => router.push('/admin/users'),
                                                            show: hasPermission('view_users') || hasPermission('view_store_users'),
                                        },
                                        {
                                                            label: 'Phân quyền',
                                                            icon: Shield,
                                                            onClick: () => router.push('/admin/roles'),
                                                            show: hasAnyRole('super_admin', 'chain_owner'),
                                        },
                                        {
                                                            label: 'Ca làm việc',
                                                            icon: Clock,
                                                            onClick: () => router.push('/shifts'),
                                                            show: hasPermission('view_shifts') || hasPermission('view_own_shifts'),
                                        },
                                        {
                                                            label: 'Audit logs',
                                                            icon: FileText,
                                                            onClick: () => router.push('/admin/audit-logs'),
                                                            show: hasPermission('view_audit_logs'),
                                        },
                                        {
                                                            label: 'Cài đặt',
                                                            icon: Settings,
                                                            onClick: () => router.push('/settings'),
                                                            show: hasAnyRole('super_admin', 'chain_owner', 'store_manager'),
                                        },
                    ];

                    const visibleItems = menuItems.filter(item => item.show);

                    const getRoleBadgeColor = () => {
                                        if (hasAnyRole('super_admin')) return 'bg-red-100 text-red-700';
                                        if (hasAnyRole('chain_owner', 'chain_admin')) return 'bg-purple-100 text-purple-700';
                                        if (hasAnyRole('store_manager', 'assistant_manager')) return 'bg-green-100 text-green-700';
                                        return 'bg-gray-100 text-gray-700';
                    };

                    const getMainRole = () => {
                                        if (!user.roles.length) return 'User';
                                        // Sort by level and get the highest (lowest level number)
                                        const sortedRoles = [...user.roles].sort((a, b) => a.level - b.level);
                                        return sortedRoles[0]?.name || 'User';
                    };

                    return (
                                        <div className="relative" ref={menuRef}>
                                                            <button
                                                                                onClick={() => setIsOpen(!isOpen)}
                                                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                                            >
                                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium">
                                                                                                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                                                                                </div>
                                                                                <div className="hidden md:block text-left">
                                                                                                    <p className="text-sm font-medium text-gray-800">{user.fullName}</p>
                                                                                                    <p className="text-xs text-gray-500">{user.username}</p>
                                                                                </div>
                                                            </button>

                                                            {isOpen && (
                                                                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                                                                                    {/* User Info Header */}
                                                                                                    <div className="px-4 py-3 border-b border-gray-100">
                                                                                                                        <p className="font-medium text-gray-800">{user.fullName}</p>
                                                                                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                                                                                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}>
                                                                                                                                            {getMainRole()}
                                                                                                                        </span>
                                                                                                    </div>

                                                                                                    {/* Menu Items */}
                                                                                                    <div className="py-2">
                                                                                                                        {visibleItems.map((item, index) => (
                                                                                                                                            <button
                                                                                                                                                                key={index}
                                                                                                                                                                onClick={() => {
                                                                                                                                                                                    item.onClick();
                                                                                                                                                                                    setIsOpen(false);
                                                                                                                                                                }}
                                                                                                                                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                                                                                                            >
                                                                                                                                                                <item.icon size={18} className="text-gray-400" />
                                                                                                                                                                {item.label}
                                                                                                                                            </button>
                                                                                                                        ))}
                                                                                                    </div>

                                                                                                    {/* Logout */}
                                                                                                    <div className="border-t border-gray-100 pt-2">
                                                                                                                        <button
                                                                                                                                            onClick={logout}
                                                                                                                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                                                                        >
                                                                                                                                            <LogOut size={18} />
                                                                                                                                            Đăng xuất
                                                                                                                        </button>
                                                                                                    </div>
                                                                                </div>
                                                            )}
                                        </div>
                    );
}
