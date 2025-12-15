"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

type Toast = {
                    id: string;
                    message: string;
                    type: ToastType;
};

type ToastContextType = {
                    showToast: (message: string, type?: ToastType) => void;
                    success: (message: string) => void;
                    error: (message: string) => void;
                    warning: (message: string) => void;
                    info: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
                    const context = useContext(ToastContext);
                    if (!context) {
                                        throw new Error("useToast must be used within a ToastProvider");
                    }
                    return context;
}

const toastStyles: Record<ToastType, { bg: string; icon: ReactNode }> = {
                    success: {
                                        bg: "bg-green-500",
                                        icon: <CheckCircle size={20} />,
                    },
                    error: {
                                        bg: "bg-red-500",
                                        icon: <XCircle size={20} />,
                    },
                    warning: {
                                        bg: "bg-yellow-500",
                                        icon: <AlertTriangle size={20} />,
                    },
                    info: {
                                        bg: "bg-blue-500",
                                        icon: <Info size={20} />,
                    },
};

export function ToastProvider({ children }: { children: ReactNode }) {
                    const [toasts, setToasts] = useState<Toast[]>([]);

                    const removeToast = useCallback((id: string) => {
                                        setToasts((prev) => prev.filter((t) => t.id !== id));
                    }, []);

                    const showToast = useCallback(
                                        (message: string, type: ToastType = "info") => {
                                                            const id = Date.now().toString();
                                                            setToasts((prev) => [...prev, { id, message, type }]);

                                                            // Auto remove after 3 seconds
                                                            setTimeout(() => {
                                                                                removeToast(id);
                                                            }, 3000);
                                        },
                                        [removeToast]
                    );

                    const success = useCallback((message: string) => showToast(message, "success"), [showToast]);
                    const error = useCallback((message: string) => showToast(message, "error"), [showToast]);
                    const warning = useCallback((message: string) => showToast(message, "warning"), [showToast]);
                    const info = useCallback((message: string) => showToast(message, "info"), [showToast]);

                    return (
                                        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
                                                            {children}

                                                            {/* Toast Container */}
                                                            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
                                                                                {toasts.map((toast) => (
                                                                                                    <div
                                                                                                                        key={toast.id}
                                                                                                                        className={`${toastStyles[toast.type].bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] max-w-[400px] animate-slide-in`}
                                                                                                    >
                                                                                                                        {toastStyles[toast.type].icon}
                                                                                                                        <span className="flex-1">{toast.message}</span>
                                                                                                                        <button
                                                                                                                                            onClick={() => removeToast(toast.id)}
                                                                                                                                            className="hover:bg-white/20 rounded p-1"
                                                                                                                        >
                                                                                                                                            <X size={16} />
                                                                                                                        </button>
                                                                                                    </div>
                                                                                ))}
                                                            </div>

                                                            <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
                                        </ToastContext.Provider>
                    );
}
