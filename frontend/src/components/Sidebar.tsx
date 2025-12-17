"use client";

import { useState } from "react";
import {
                    Menu,
                    X,
                    ShoppingCart,
                    Package,
                    FolderOpen,
                    Sliders,
                    FileText,
                    BarChart3,
                    PieChart,
                    TrendingUp,
                    ChevronDown,
                    ChevronRight,
                    Home,
                    Settings,
                    LogOut,
                    User,
                    Building2,
                    Users,
                    Shield,
                    Store
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// Main menu items (without reports submenu)
const menuItems = [
                    { href: "/", label: "Dashboard", icon: Home },
                    { href: "/retail", label: "Retail POS", icon: ShoppingCart },
                    { href: "/products", label: "Sản phẩm", icon: Package },
                    { href: "/categories", label: "Danh mục", icon: FolderOpen },
                    { href: "/modifiers", label: "Modifiers", icon: Sliders },
                    { href: "/invoices", label: "Hoá đơn", icon: FileText },
];

// Reports submenu items
const reportSubItems = [
                    { href: "/reports", label: "Tổng quan", icon: TrendingUp },
                    { href: "/reports-products", label: "Theo sản phẩm", icon: BarChart3 },
                    { href: "/reports-categories", label: "Theo danh mục", icon: PieChart },
];

// Admin menu items
const adminMenuItems = [
                    { href: "/admin/chains", label: "Quản lý chuỗi", icon: Building2, permission: "view_chains" },
                    { href: "/admin/stores", label: "Quản lý cửa hàng", icon: Store, permission: "view_stores" },
                    { href: "/admin/users", label: "Quản lý người dùng", icon: Users, permission: "view_users" },
                    { href: "/admin/roles", label: "Phân quyền", icon: Shield, roles: ["super_admin", "chain_owner"] },
];

export default function Sidebar() {
                    const [isOpen, setIsOpen] = useState(false);
                    const [reportsExpanded, setReportsExpanded] = useState(false);
                    const [adminExpanded, setAdminExpanded] = useState(false);
                    const pathname = usePathname();
                    const { user, logout, hasPermission, hasAnyRole, isAuthenticated } = useAuth();

                    // Check if current path is a reports page
                    const isReportsPage = pathname.startsWith('/reports');
                    const isAdminPage = pathname.startsWith('/admin');

                    // Filter admin items based on permissions
                    const visibleAdminItems = adminMenuItems.filter(item => {
                                        if (item.roles) return hasAnyRole(...item.roles);
                                        if (item.permission) return hasPermission(item.permission);
                                        return true;
                    });

                    return (
                                        <>
                                                            {/* Toggle Button - Always visible */}
                                                            <button
                                                                                onClick={() => setIsOpen(!isOpen)}
                                                                                className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition"
                                                            >
                                                                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                                                            </button>

                                                            {/* Overlay */}
                                                            {isOpen && (
                                                                                <div
                                                                                                    className="fixed inset-0 bg-black/30 z-30"
                                                                                                    onClick={() => setIsOpen(false)}
                                                                                />
                                                            )}

                                                            {/* Sidebar */}
                                                            <aside
                                                                                className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                                                                                                    }`}
                                                            >
                                                                                {/* Header */}
                                                                                <div className="p-4 border-b">
                                                                                                    <h1 className="text-xl font-bold text-gray-800 ml-10">POS System</h1>
                                                                                                    <p className="text-sm text-gray-500 ml-10">Quản lý bán hàng</p>
                                                                                </div>

                                                                                {/* Menu Items */}
                                                                                <nav className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
                                                                                                    <ul className="space-y-2">
                                                                                                                        {menuItems.map((item) => {
                                                                                                                                            const Icon = item.icon;
                                                                                                                                            const isActive = pathname === item.href;

                                                                                                                                            return (
                                                                                                                                                                <li key={item.href}>
                                                                                                                                                                                    <Link
                                                                                                                                                                                                        href={item.href}
                                                                                                                                                                                                        onClick={() => setIsOpen(false)}
                                                                                                                                                                                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                                                                                                                                                                                                                            ? "bg-blue-600 text-white"
                                                                                                                                                                                                                            : "text-gray-700 hover:bg-gray-100"
                                                                                                                                                                                                                            }`}
                                                                                                                                                                                    >
                                                                                                                                                                                                        <Icon size={20} />
                                                                                                                                                                                                        <span className="font-medium">{item.label}</span>
                                                                                                                                                                                    </Link>
                                                                                                                                                                </li>
                                                                                                                                            );
                                                                                                                        })}

                                                                                                                        {/* Reports Menu with Submenu */}
                                                                                                                        <li>
                                                                                                                                            <button
                                                                                                                                                                onClick={() => setReportsExpanded(!reportsExpanded)}
                                                                                                                                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${isReportsPage
                                                                                                                                                                                    ? "bg-blue-600 text-white"
                                                                                                                                                                                    : "text-gray-700 hover:bg-gray-100"
                                                                                                                                                                                    }`}
                                                                                                                                            >
                                                                                                                                                                <div className="flex items-center gap-3">
                                                                                                                                                                                    <BarChart3 size={20} />
                                                                                                                                                                                    <span className="font-medium">Báo cáo</span>
                                                                                                                                                                </div>
                                                                                                                                                                {reportsExpanded ? (
                                                                                                                                                                                    <ChevronDown size={18} />
                                                                                                                                                                ) : (
                                                                                                                                                                                    <ChevronRight size={18} />
                                                                                                                                                                )}
                                                                                                                                            </button>

                                                                                                                                            {/* Submenu */}
                                                                                                                                            <ul
                                                                                                                                                                className={`mt-1 ml-4 space-y-1 overflow-hidden transition-all duration-300 ${reportsExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                                                                                                                                                                                    }`}
                                                                                                                                            >
                                                                                                                                                                {reportSubItems.map((subItem) => {
                                                                                                                                                                                    const SubIcon = subItem.icon;
                                                                                                                                                                                    const isSubActive = pathname === subItem.href;

                                                                                                                                                                                    return (
                                                                                                                                                                                                        <li key={subItem.href}>
                                                                                                                                                                                                                            <Link
                                                                                                                                                                                                                                                href={subItem.href}
                                                                                                                                                                                                                                                onClick={() => setIsOpen(false)}
                                                                                                                                                                                                                                                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${isSubActive
                                                                                                                                                                                                                                                                    ? "bg-blue-100 text-blue-700 font-medium"
                                                                                                                                                                                                                                                                    : "text-gray-600 hover:bg-gray-100"
                                                                                                                                                                                                                                                                    }`}
                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                                <SubIcon size={16} />
                                                                                                                                                                                                                                                <span>{subItem.label}</span>
                                                                                                                                                                                                                            </Link>
                                                                                                                                                                                                        </li>
                                                                                                                                                                                    );
                                                                                                                                                                })}
                                                                                                                                            </ul>
                                                                                                                        </li>

                                                                                                                        {/* Admin Menu */}
                                                                                                                        {visibleAdminItems.length > 0 && (
                                                                                                                                            <li>
                                                                                                                                                                <button
                                                                                                                                                                                    onClick={() => setAdminExpanded(!adminExpanded)}
                                                                                                                                                                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${isAdminPage
                                                                                                                                                                                                        ? "bg-purple-600 text-white"
                                                                                                                                                                                                        : "text-gray-700 hover:bg-gray-100"
                                                                                                                                                                                                        }`}
                                                                                                                                                                >
                                                                                                                                                                                    <div className="flex items-center gap-3">
                                                                                                                                                                                                        <Settings size={20} />
                                                                                                                                                                                                        <span className="font-medium">Quản trị</span>
                                                                                                                                                                                    </div>
                                                                                                                                                                                    {adminExpanded ? (
                                                                                                                                                                                                        <ChevronDown size={18} />
                                                                                                                                                                                    ) : (
                                                                                                                                                                                                        <ChevronRight size={18} />
                                                                                                                                                                                    )}
                                                                                                                                                                </button>

                                                                                                                                                                <ul
                                                                                                                                                                                    className={`mt-1 ml-4 space-y-1 overflow-hidden transition-all duration-300 ${adminExpanded ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                                                                                                                                                                                                        }`}
                                                                                                                                                                >
                                                                                                                                                                                    {visibleAdminItems.map((item) => {
                                                                                                                                                                                                        const ItemIcon = item.icon;
                                                                                                                                                                                                        const isActive = pathname === item.href;

                                                                                                                                                                                                        return (
                                                                                                                                                                                                                            <li key={item.href}>
                                                                                                                                                                                                                                                <Link
                                                                                                                                                                                                                                                                    href={item.href}
                                                                                                                                                                                                                                                                    onClick={() => setIsOpen(false)}
                                                                                                                                                                                                                                                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${isActive
                                                                                                                                                                                                                                                                                        ? "bg-purple-100 text-purple-700 font-medium"
                                                                                                                                                                                                                                                                                        : "text-gray-600 hover:bg-gray-100"
                                                                                                                                                                                                                                                                                        }`}
                                                                                                                                                                                                                                                >
                                                                                                                                                                                                                                                                    <ItemIcon size={16} />
                                                                                                                                                                                                                                                                    <span>{item.label}</span>
                                                                                                                                                                                                                                                </Link>
                                                                                                                                                                                                                            </li>
                                                                                                                                                                                                        );
                                                                                                                                                                                    })}
                                                                                                                                                                </ul>
                                                                                                                                            </li>
                                                                                                                        )}
                                                                                                    </ul>
                                                                                </nav>

                                                                                {/* Footer with User Info */}
                                                                                <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
                                                                                                    {isAuthenticated && user ? (
                                                                                                                        <div className="space-y-3">
                                                                                                                                            <Link
                                                                                                                                                                href="/profile"
                                                                                                                                                                onClick={() => setIsOpen(false)}
                                                                                                                                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition"
                                                                                                                                            >
                                                                                                                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium">
                                                                                                                                                                                    {user.fullName?.charAt(0) || user.username.charAt(0).toUpperCase()}
                                                                                                                                                                </div>
                                                                                                                                                                <div className="flex-1 min-w-0">
                                                                                                                                                                                    <p className="text-sm font-medium text-gray-800 truncate">{user.fullName}</p>
                                                                                                                                                                                    <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                                                                                                                                                                </div>
                                                                                                                                            </Link>
                                                                                                                                            <button
                                                                                                                                                                onClick={logout}
                                                                                                                                                                className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                                                                                            >
                                                                                                                                                                <LogOut size={18} />
                                                                                                                                                                <span className="font-medium">Đăng xuất</span>
                                                                                                                                            </button>
                                                                                                                        </div>
                                                                                                    ) : (
                                                                                                                        <Link
                                                                                                                                            href="/login"
                                                                                                                                            className="flex items-center gap-3 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                                                                        >
                                                                                                                                            <User size={20} />
                                                                                                                                            <span className="font-medium">Đăng nhập</span>
                                                                                                                        </Link>
                                                                                                    )}
                                                                                </div>
                                                            </aside>
                                        </>
                    );
}
