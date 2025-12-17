"use client";

import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

export default function ClientLayout({
                    children,
}: {
                    children: React.ReactNode;
}) {
                    const pathname = usePathname();
                    const isLoginPage = pathname === '/login';

                    return (
                                        <AuthProvider>
                                                            <ToastProvider>
                                                                                {isLoginPage ? (
                                                                                                    children
                                                                                ) : (
                                                                                                    <>
                                                                                                                        <Sidebar />
                                                                                                                        {children}
                                                                                                    </>
                                                                                )}
                                                            </ToastProvider>
                                        </AuthProvider>
                    );
}
