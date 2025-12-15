"use client";

import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";

export default function ClientLayout({
                    children,
}: {
                    children: React.ReactNode;
}) {
                    return (
                                        <ToastProvider>
                                                            <Sidebar />
                                                            {children}
                                        </ToastProvider>
                    );
}
