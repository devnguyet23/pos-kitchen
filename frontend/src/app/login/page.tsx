'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
                    const [username, setUsername] = useState('');
                    const [password, setPassword] = useState('');
                    const [error, setError] = useState('');
                    const [isLoading, setIsLoading] = useState(false);
                    const { login, isAuthenticated } = useAuth();
                    const router = useRouter();

                    // Redirect if already logged in
                    if (isAuthenticated) {
                                        router.push('/');
                                        return null;
                    }

                    const handleSubmit = async (e: FormEvent) => {
                                        e.preventDefault();
                                        setError('');
                                        setIsLoading(true);

                                        try {
                                                            await login({ username, password });
                                                            router.push('/');
                                        } catch (err: any) {
                                                            setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
                                        } finally {
                                                            setIsLoading(false);
                                        }
                    };

                    return (
                                        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
                                                            <div className="max-w-md w-full">
                                                                                {/* Logo / Title */}
                                                                                <div className="text-center mb-8">
                                                                                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-2xl font-bold mb-4">
                                                                                                                        POS
                                                                                                    </div>
                                                                                                    <h1 className="text-2xl font-bold text-gray-800">Đăng nhập hệ thống</h1>
                                                                                                    <p className="text-gray-500 mt-2">Vui lòng đăng nhập để tiếp tục</p>
                                                                                </div>

                                                                                {/* Login Form */}
                                                                                <div className="bg-white rounded-2xl shadow-xl p-8">
                                                                                                    <form onSubmit={handleSubmit} className="space-y-6">
                                                                                                                        {error && (
                                                                                                                                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                                                                                                                                                {error}
                                                                                                                                            </div>
                                                                                                                        )}

                                                                                                                        <div>
                                                                                                                                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                                                                                                                                                Tên đăng nhập
                                                                                                                                            </label>
                                                                                                                                            <input
                                                                                                                                                                type="text"
                                                                                                                                                                id="username"
                                                                                                                                                                value={username}
                                                                                                                                                                onChange={(e) => setUsername(e.target.value)}
                                                                                                                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                                                                                                                                placeholder="Nhập tên đăng nhập"
                                                                                                                                                                required
                                                                                                                                                                disabled={isLoading}
                                                                                                                                            />
                                                                                                                        </div>

                                                                                                                        <div>
                                                                                                                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                                                                                                                                                Mật khẩu
                                                                                                                                            </label>
                                                                                                                                            <input
                                                                                                                                                                type="password"
                                                                                                                                                                id="password"
                                                                                                                                                                value={password}
                                                                                                                                                                onChange={(e) => setPassword(e.target.value)}
                                                                                                                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                                                                                                                                placeholder="Nhập mật khẩu"
                                                                                                                                                                required
                                                                                                                                                                disabled={isLoading}
                                                                                                                                            />
                                                                                                                        </div>

                                                                                                                        <button
                                                                                                                                            type="submit"
                                                                                                                                            disabled={isLoading}
                                                                                                                                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                                                        >
                                                                                                                                            {isLoading ? (
                                                                                                                                                                <span className="flex items-center justify-center">
                                                                                                                                                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                                                                                                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                                                                                                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                                                                                                                                    </svg>
                                                                                                                                                                                    Đang đăng nhập...
                                                                                                                                                                </span>
                                                                                                                                            ) : (
                                                                                                                                                                'Đăng nhập'
                                                                                                                                            )}
                                                                                                                        </button>
                                                                                                    </form>

                                                                                                    {/* Demo accounts hint */}
                                                                                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                                                                                                        <p className="text-sm text-gray-500 text-center mb-3">Tài khoản demo (mật khẩu: admin123)</p>
                                                                                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                                                                            <button
                                                                                                                                                                type="button"
                                                                                                                                                                onClick={() => { setUsername('superadmin'); setPassword('admin123'); }}
                                                                                                                                                                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                                                                                                            >
                                                                                                                                                                superadmin
                                                                                                                                            </button>
                                                                                                                                            <button
                                                                                                                                                                type="button"
                                                                                                                                                                onClick={() => { setUsername('owner'); setPassword('admin123'); }}
                                                                                                                                                                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                                                                                                            >
                                                                                                                                                                owner
                                                                                                                                            </button>
                                                                                                                                            <button
                                                                                                                                                                type="button"
                                                                                                                                                                onClick={() => { setUsername('manager'); setPassword('admin123'); }}
                                                                                                                                                                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                                                                                                            >
                                                                                                                                                                manager
                                                                                                                                            </button>
                                                                                                                                            <button
                                                                                                                                                                type="button"
                                                                                                                                                                onClick={() => { setUsername('cashier'); setPassword('admin123'); }}
                                                                                                                                                                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                                                                                                            >
                                                                                                                                                                cashier
                                                                                                                                            </button>
                                                                                                                        </div>
                                                                                                    </div>
                                                                                </div>

                                                                                <p className="text-center text-gray-500 text-sm mt-8">
                                                                                                    © 2024 POS System. All rights reserved.
                                                                                </p>
                                                            </div>
                                        </div>
                    );
}
