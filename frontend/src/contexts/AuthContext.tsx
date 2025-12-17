'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginRequest, LoginResponse } from '@/lib/types';
import { api } from '@/lib/api';

interface AuthContextType {
                    user: User | null;
                    isLoading: boolean;
                    isAuthenticated: boolean;
                    login: (credentials: LoginRequest) => Promise<void>;
                    logout: () => void;
                    hasPermission: (permission: string) => boolean;
                    hasRole: (roleCode: string) => boolean;
                    hasAnyPermission: (...permissions: string[]) => boolean;
                    hasAnyRole: (...roleCodes: string[]) => boolean;
                    isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
                    const [user, setUser] = useState<User | null>(null);
                    const [isLoading, setIsLoading] = useState(true);

                    useEffect(() => {
                                        // Check for existing auth on mount
                                        const checkAuth = async () => {
                                                            const token = localStorage.getItem('accessToken');
                                                            const savedUser = localStorage.getItem('user');

                                                            if (token && savedUser) {
                                                                                try {
                                                                                                    // Validate token by fetching profile
                                                                                                    const profile = await api.get<User>('/auth/profile');
                                                                                                    setUser(profile);
                                                                                                    localStorage.setItem('user', JSON.stringify(profile));
                                                                                } catch {
                                                                                                    // Token invalid, clear storage
                                                                                                    localStorage.removeItem('accessToken');
                                                                                                    localStorage.removeItem('refreshToken');
                                                                                                    localStorage.removeItem('user');
                                                                                                    setUser(null);
                                                                                }
                                                            }
                                                            setIsLoading(false);
                                        };

                                        checkAuth();
                    }, []);

                    const login = useCallback(async (credentials: LoginRequest) => {
                                        const response = await api.post<LoginResponse>('/auth/login', credentials);

                                        localStorage.setItem('accessToken', response.accessToken);
                                        localStorage.setItem('refreshToken', response.refreshToken);
                                        localStorage.setItem('user', JSON.stringify(response.user));

                                        setUser(response.user);
                    }, []);

                    const logout = useCallback(() => {
                                        localStorage.removeItem('accessToken');
                                        localStorage.removeItem('refreshToken');
                                        localStorage.removeItem('user');
                                        setUser(null);
                                        window.location.href = '/login';
                    }, []);

                    const hasPermission = useCallback((permission: string): boolean => {
                                        if (!user) return false;
                                        if (user.roles.some(r => r.code === 'super_admin')) return true;
                                        return user.permissions.includes(permission);
                    }, [user]);

                    const hasRole = useCallback((roleCode: string): boolean => {
                                        if (!user) return false;
                                        return user.roles.some(r => r.code === roleCode);
                    }, [user]);

                    const hasAnyPermission = useCallback((...permissions: string[]): boolean => {
                                        return permissions.some(p => hasPermission(p));
                    }, [hasPermission]);

                    const hasAnyRole = useCallback((...roleCodes: string[]): boolean => {
                                        return roleCodes.some(r => hasRole(r));
                    }, [hasRole]);

                    const isSuperAdmin = useCallback((): boolean => {
                                        return hasRole('super_admin');
                    }, [hasRole]);

                    return (
                                        <AuthContext.Provider
                                                            value={{
                                                                                user,
                                                                                isLoading,
                                                                                isAuthenticated: !!user,
                                                                                login,
                                                                                logout,
                                                                                hasPermission,
                                                                                hasRole,
                                                                                hasAnyPermission,
                                                                                hasAnyRole,
                                                                                isSuperAdmin,
                                                            }}
                                        >
                                                            {children}
                                        </AuthContext.Provider>
                    );
}

export function useAuth() {
                    const context = useContext(AuthContext);
                    if (context === undefined) {
                                        throw new Error('useAuth must be used within an AuthProvider');
                    }
                    return context;
}
