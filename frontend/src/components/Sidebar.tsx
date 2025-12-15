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
                    Home,
                    Settings
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
                    { href: "/", label: "Dashboard", icon: Home },
                    { href: "/retail", label: "Retail POS", icon: ShoppingCart },
                    { href: "/products", label: "Sản phẩm", icon: Package },
                    { href: "/categories", label: "Danh mục", icon: FolderOpen },
                    { href: "/modifiers", label: "Modifiers", icon: Sliders },
                    { href: "/invoices", label: "Hoá đơn", icon: FileText },
                    { href: "/reports", label: "Báo cáo", icon: BarChart3 },
];

export default function Sidebar() {
                    const [isOpen, setIsOpen] = useState(false);
                    const pathname = usePathname();

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
                                                                                <nav className="p-4">
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
                                                                                                    </ul>
                                                                                </nav>

                                                                                {/* Footer */}
                                                                                <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                                                                                                    <Link
                                                                                                                        href="/settings"
                                                                                                                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                                                                                    >
                                                                                                                        <Settings size={20} />
                                                                                                                        <span className="font-medium">Cài đặt</span>
                                                                                                    </Link>
                                                                                </div>
                                                            </aside>
                                        </>
                    );
}
