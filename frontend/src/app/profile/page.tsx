'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { User, Save, Lock, Mail, Phone, Building2, Store } from 'lucide-react';

export default function ProfilePage() {
                    const { user, hasAnyRole } = useAuth();
                    const [isChangingPassword, setIsChangingPassword] = useState(false);
                    const [currentPassword, setCurrentPassword] = useState('');
                    const [newPassword, setNewPassword] = useState('');
                    const [confirmPassword, setConfirmPassword] = useState('');
                    const [message, setMessage] = useState({ type: '', text: '' });
                    const [loading, setLoading] = useState(false);

                    const handleChangePassword = async (e: React.FormEvent) => {
                                        e.preventDefault();
                                        setMessage({ type: '', text: '' });

                                        if (newPassword !== confirmPassword) {
                                                            setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
                                                            return;
                                        }

                                        if (newPassword.length < 6) {
                                                            setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
                                                            return;
                                        }

                                        setLoading(true);
                                        try {
                                                            await api.post('/auth/change-password', {
                                                                                currentPassword,
                                                                                newPassword,
                                                            });
                                                            setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
                                                            setCurrentPassword('');
                                                            setNewPassword('');
                                                            setConfirmPassword('');
                                                            setIsChangingPassword(false);
                                        } catch (error: any) {
                                                            setMessage({ type: 'error', text: error.message || 'Đổi mật khẩu thất bại' });
                                        } finally {
                                                            setLoading(false);
                                        }
                    };

                    const getRoleBadgeColor = (roleCode: string) => {
                                        switch (roleCode) {
                                                            case 'super_admin': return 'bg-red-100 text-red-700';
                                                            case 'chain_owner': return 'bg-purple-100 text-purple-700';
                                                            case 'chain_admin': return 'bg-blue-100 text-blue-700';
                                                            case 'store_manager': return 'bg-green-100 text-green-700';
                                                            default: return 'bg-gray-100 text-gray-700';
                                        }
                    };

                    if (!user) return null;

                    return (
                                        <ProtectedRoute>
                                                            <div className="ml-64 p-8">
                                                                                <div className="max-w-3xl mx-auto">
                                                                                                    {/* Header */}
                                                                                                    <div className="mb-8">
                                                                                                                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                                                                                                                            <User className="text-blue-600" />
                                                                                                                                            Thông tin cá nhân
                                                                                                                        </h1>
                                                                                                                        <p className="text-gray-500 mt-1">Xem và cập nhật thông tin tài khoản</p>
                                                                                                    </div>

                                                                                                    {/* Message */}
                                                                                                    {message.text && (
                                                                                                                        <div className={`mb-6 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                                                                                                                                            }`}>
                                                                                                                                            {message.text}
                                                                                                                        </div>
                                                                                                    )}

                                                                                                    {/* Profile Card */}
                                                                                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                                                                                                        {/* Header with Avatar */}
                                                                                                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                                                                                                                                            <div className="flex items-center gap-4">
                                                                                                                                                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-3xl font-bold">
                                                                                                                                                                                    {user.fullName?.charAt(0) || user.username.charAt(0).toUpperCase()}
                                                                                                                                                                </div>
                                                                                                                                                                <div className="text-white">
                                                                                                                                                                                    <h2 className="text-xl font-bold">{user.fullName}</h2>
                                                                                                                                                                                    <p className="opacity-80">@{user.username}</p>
                                                                                                                                                                                    <div className="flex gap-2 mt-2">
                                                                                                                                                                                                        {user.roles.map(role => (
                                                                                                                                                                                                                            <span
                                                                                                                                                                                                                                                key={role.id}
                                                                                                                                                                                                                                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(role.code)}`}
                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                                {role.name}
                                                                                                                                                                                                                            </span>
                                                                                                                                                                                                        ))}
                                                                                                                                                                                    </div>
                                                                                                                                                                </div>
                                                                                                                                            </div>
                                                                                                                        </div>

                                                                                                                        {/* Info Grid */}
                                                                                                                        <div className="p-6">
                                                                                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                                                                                                <div>
                                                                                                                                                                                    <label className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                                                                                                                                                                                        <Mail size={16} />
                                                                                                                                                                                                        Email
                                                                                                                                                                                    </label>
                                                                                                                                                                                    <p className="text-gray-800 font-medium">{user.email}</p>
                                                                                                                                                                </div>

                                                                                                                                                                <div>
                                                                                                                                                                                    <label className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                                                                                                                                                                                        <Phone size={16} />
                                                                                                                                                                                                        Số điện thoại
                                                                                                                                                                                    </label>
                                                                                                                                                                                    <p className="text-gray-800 font-medium">{user.phone || 'Chưa cập nhật'}</p>
                                                                                                                                                                </div>

                                                                                                                                                                {user.chainId && (
                                                                                                                                                                                    <div>
                                                                                                                                                                                                        <label className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                                                                                                                                                                                                            <Building2 size={16} />
                                                                                                                                                                                                                            Chuỗi
                                                                                                                                                                                                        </label>
                                                                                                                                                                                                        <p className="text-gray-800 font-medium">Chain ID: {user.chainId}</p>
                                                                                                                                                                                    </div>
                                                                                                                                                                )}

                                                                                                                                                                {user.storeId && (
                                                                                                                                                                                    <div>
                                                                                                                                                                                                        <label className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                                                                                                                                                                                                            <Store size={16} />
                                                                                                                                                                                                                            Cửa hàng
                                                                                                                                                                                                        </label>
                                                                                                                                                                                                        <p className="text-gray-800 font-medium">Store ID: {user.storeId}</p>
                                                                                                                                                                                    </div>
                                                                                                                                                                )}
                                                                                                                                            </div>

                                                                                                                                            {/* Permissions Summary */}
                                                                                                                                            <div className="mt-6 pt-6 border-t border-gray-200">
                                                                                                                                                                <h3 className="font-medium text-gray-800 mb-3">Quyền hạn</h3>
                                                                                                                                                                <p className="text-sm text-gray-600">
                                                                                                                                                                                    Bạn có <span className="font-semibold text-blue-600">{user.permissions.length}</span> quyền trong hệ thống.
                                                                                                                                                                </p>
                                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                    </div>

                                                                                                    {/* Change Password */}
                                                                                                    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                                                                                                        <div className="flex items-center justify-between mb-4">
                                                                                                                                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                                                                                                                                                <Lock size={20} />
                                                                                                                                                                Đổi mật khẩu
                                                                                                                                            </h3>
                                                                                                                                            {!isChangingPassword && (
                                                                                                                                                                <button
                                                                                                                                                                                    onClick={() => setIsChangingPassword(true)}
                                                                                                                                                                                    className="text-sm text-blue-600 hover:text-blue-700"
                                                                                                                                                                >
                                                                                                                                                                                    Thay đổi
                                                                                                                                                                </button>
                                                                                                                                            )}
                                                                                                                        </div>

                                                                                                                        {isChangingPassword && (
                                                                                                                                            <form onSubmit={handleChangePassword} className="space-y-4">
                                                                                                                                                                <div>
                                                                                                                                                                                    <label className="block text-sm text-gray-600 mb-1">Mật khẩu hiện tại</label>
                                                                                                                                                                                    <input
                                                                                                                                                                                                        type="password"
                                                                                                                                                                                                        value={currentPassword}
                                                                                                                                                                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                                                                                                                                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                                                                                                                                                        required
                                                                                                                                                                                    />
                                                                                                                                                                </div>
                                                                                                                                                                <div>
                                                                                                                                                                                    <label className="block text-sm text-gray-600 mb-1">Mật khẩu mới</label>
                                                                                                                                                                                    <input
                                                                                                                                                                                                        type="password"
                                                                                                                                                                                                        value={newPassword}
                                                                                                                                                                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                                                                                                                                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                                                                                                                                                        required
                                                                                                                                                                                    />
                                                                                                                                                                </div>
                                                                                                                                                                <div>
                                                                                                                                                                                    <label className="block text-sm text-gray-600 mb-1">Xác nhận mật khẩu mới</label>
                                                                                                                                                                                    <input
                                                                                                                                                                                                        type="password"
                                                                                                                                                                                                        value={confirmPassword}
                                                                                                                                                                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                                                                                                                                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                                                                                                                                                        required
                                                                                                                                                                                    />
                                                                                                                                                                </div>
                                                                                                                                                                <div className="flex gap-3">
                                                                                                                                                                                    <button
                                                                                                                                                                                                        type="submit"
                                                                                                                                                                                                        disabled={loading}
                                                                                                                                                                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                                                                                                                                                    >
                                                                                                                                                                                                        <Save size={18} />
                                                                                                                                                                                                        {loading ? 'Đang lưu...' : 'Lưu mật khẩu'}
                                                                                                                                                                                    </button>
                                                                                                                                                                                    <button
                                                                                                                                                                                                        type="button"
                                                                                                                                                                                                        onClick={() => {
                                                                                                                                                                                                                            setIsChangingPassword(false);
                                                                                                                                                                                                                            setCurrentPassword('');
                                                                                                                                                                                                                            setNewPassword('');
                                                                                                                                                                                                                            setConfirmPassword('');
                                                                                                                                                                                                        }}
                                                                                                                                                                                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                                                                                                                                                                    >
                                                                                                                                                                                                        Hủy
                                                                                                                                                                                    </button>
                                                                                                                                                                </div>
                                                                                                                                            </form>
                                                                                                                        )}
                                                                                                    </div>
                                                                                </div>
                                                            </div>
                                        </ProtectedRoute>
                    );
}
