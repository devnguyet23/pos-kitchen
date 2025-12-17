'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '@/lib/api';
import { Chain, Store, Role } from '@/lib/types';

interface UserFormData {
                    username: string;
                    email: string;
                    password: string;
                    fullName: string;
                    phone: string;
                    chainId: number | null;
                    storeId: number | null;
                    roleId: number;
                    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

interface UserModalProps {
                    isOpen: boolean;
                    onClose: () => void;
                    user?: any | null;
                    onSuccess: () => void;
                    chains: Chain[];
                    stores: Store[];
                    roles: Role[];
}

export default function UserModal({ isOpen, onClose, user, onSuccess, chains, stores, roles }: UserModalProps) {
                    const [loading, setLoading] = useState(false);
                    const [error, setError] = useState('');
                    const [formData, setFormData] = useState<UserFormData>({
                                        username: '',
                                        email: '',
                                        password: '',
                                        fullName: '',
                                        phone: '',
                                        chainId: null,
                                        storeId: null,
                                        roleId: 0,
                                        status: 'ACTIVE',
                    });

                    const [filteredStores, setFilteredStores] = useState<Store[]>([]);

                    useEffect(() => {
                                        if (user) {
                                                            setFormData({
                                                                                username: user.username || '',
                                                                                email: user.email || '',
                                                                                password: '',
                                                                                fullName: user.fullName || '',
                                                                                phone: user.phone || '',
                                                                                chainId: user.chainId || null,
                                                                                storeId: user.storeId || null,
                                                                                roleId: user.userRoles?.[0]?.roleId || 0,
                                                                                status: user.status || 'ACTIVE',
                                                            });
                                        } else {
                                                            setFormData({
                                                                                username: '',
                                                                                email: '',
                                                                                password: '',
                                                                                fullName: '',
                                                                                phone: '',
                                                                                chainId: null,
                                                                                storeId: null,
                                                                                roleId: 0,
                                                                                status: 'ACTIVE',
                                                            });
                                        }
                                        setError('');
                    }, [user, isOpen]);

                    useEffect(() => {
                                        if (formData.chainId) {
                                                            setFilteredStores(stores.filter(s => s.chainId === formData.chainId));
                                        } else {
                                                            setFilteredStores([]);
                                        }
                    }, [formData.chainId, stores]);

                    const handleSubmit = async (e: React.FormEvent) => {
                                        e.preventDefault();
                                        setLoading(true);
                                        setError('');

                                        try {
                                                            const payload = {
                                                                                ...formData,
                                                                                chainId: formData.chainId || undefined,
                                                                                storeId: formData.storeId || undefined,
                                                            };

                                                            if (!user && !formData.password) {
                                                                                setError('Mật khẩu là bắt buộc');
                                                                                setLoading(false);
                                                                                return;
                                                            }

                                                            if (user) {
                                                                                const updatePayload = { ...payload };
                                                                                if (!updatePayload.password) {
                                                                                                    delete (updatePayload as any).password;
                                                                                }
                                                                                await api.patch(`/users/${user.id}`, updatePayload);
                                                            } else {
                                                                                await api.post('/users', payload);
                                                            }
                                                            onSuccess();
                                                            onClose();
                                        } catch (err: any) {
                                                            setError(err.message || 'Có lỗi xảy ra');
                                        } finally {
                                                            setLoading(false);
                                        }
                    };

                    if (!isOpen) return null;

                    return (
                                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                                            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                                                                                {/* Header */}
                                                                                <div className="flex items-center justify-between p-6 border-b">
                                                                                                    <h2 className="text-xl font-semibold text-gray-800">
                                                                                                                        {user ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}
                                                                                                    </h2>
                                                                                                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                                                                                                        <X size={20} />
                                                                                                    </button>
                                                                                </div>

                                                                                {/* Form */}
                                                                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                                                                                    {error && (
                                                                                                                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                                                                                                                            {error}
                                                                                                                        </div>
                                                                                                    )}

                                                                                                    <div className="grid grid-cols-2 gap-4">
                                                                                                                        <div className="col-span-2">
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                Họ tên *
                                                                                                                                            </label>
                                                                                                                                            <input
                                                                                                                                                                type="text"
                                                                                                                                                                required
                                                                                                                                                                value={formData.fullName}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                                                                            />
                                                                                                                        </div>

                                                                                                                        <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                Tên đăng nhập *
                                                                                                                                            </label>
                                                                                                                                            <input
                                                                                                                                                                type="text"
                                                                                                                                                                required
                                                                                                                                                                value={formData.username}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                                                                                                disabled={!!user}
                                                                                                                                            />
                                                                                                                        </div>

                                                                                                                        <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                Email *
                                                                                                                                            </label>
                                                                                                                                            <input
                                                                                                                                                                type="email"
                                                                                                                                                                required
                                                                                                                                                                value={formData.email}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                                                                            />
                                                                                                                        </div>

                                                                                                                        <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                Mật khẩu {!user && '*'}
                                                                                                                                            </label>
                                                                                                                                            <input
                                                                                                                                                                type="password"
                                                                                                                                                                required={!user}
                                                                                                                                                                value={formData.password}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                                                                                                placeholder={user ? '(để trống nếu không đổi)' : ''}
                                                                                                                                            />
                                                                                                                        </div>

                                                                                                                        <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                Điện thoại
                                                                                                                                            </label>
                                                                                                                                            <input
                                                                                                                                                                type="text"
                                                                                                                                                                value={formData.phone}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                                                                            />
                                                                                                                        </div>

                                                                                                                        <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                Vai trò *
                                                                                                                                            </label>
                                                                                                                                            <select
                                                                                                                                                                required
                                                                                                                                                                value={formData.roleId}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                                                                            >
                                                                                                                                                                <option value={0}>-- Chọn vai trò --</option>
                                                                                                                                                                {roles.map(role => (
                                                                                                                                                                                    <option key={role.id} value={role.id}>{role.name}</option>
                                                                                                                                                                ))}
                                                                                                                                            </select>
                                                                                                                        </div>

                                                                                                                        <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                Trạng thái
                                                                                                                                            </label>
                                                                                                                                            <select
                                                                                                                                                                value={formData.status}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                                                                            >
                                                                                                                                                                <option value="ACTIVE">Hoạt động</option>
                                                                                                                                                                <option value="INACTIVE">Không hoạt động</option>
                                                                                                                                                                <option value="SUSPENDED">Tạm khóa</option>
                                                                                                                                            </select>
                                                                                                                        </div>

                                                                                                                        <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                Chuỗi
                                                                                                                                            </label>
                                                                                                                                            <select
                                                                                                                                                                value={formData.chainId || ''}
                                                                                                                                                                onChange={(e) => setFormData({
                                                                                                                                                                                    ...formData,
                                                                                                                                                                                    chainId: e.target.value ? parseInt(e.target.value) : null,
                                                                                                                                                                                    storeId: null
                                                                                                                                                                })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                                                                            >
                                                                                                                                                                <option value="">-- Toàn hệ thống --</option>
                                                                                                                                                                {chains.map(chain => (
                                                                                                                                                                                    <option key={chain.id} value={chain.id}>{chain.name}</option>
                                                                                                                                                                ))}
                                                                                                                                            </select>
                                                                                                                        </div>

                                                                                                                        <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                Cửa hàng
                                                                                                                                            </label>
                                                                                                                                            <select
                                                                                                                                                                value={formData.storeId || ''}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, storeId: e.target.value ? parseInt(e.target.value) : null })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                                                                                                disabled={!formData.chainId}
                                                                                                                                            >
                                                                                                                                                                <option value="">-- Toàn chuỗi --</option>
                                                                                                                                                                {filteredStores.map(store => (
                                                                                                                                                                                    <option key={store.id} value={store.id}>{store.name}</option>
                                                                                                                                                                ))}
                                                                                                                                            </select>
                                                                                                                        </div>
                                                                                                    </div>

                                                                                                    {/* Actions */}
                                                                                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                                                                                                        <button
                                                                                                                                            type="button"
                                                                                                                                            onClick={onClose}
                                                                                                                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                                                                                                        >
                                                                                                                                            Hủy
                                                                                                                        </button>
                                                                                                                        <button
                                                                                                                                            type="submit"
                                                                                                                                            disabled={loading || formData.roleId === 0}
                                                                                                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                                                                                                        >
                                                                                                                                            {loading ? 'Đang lưu...' : (user ? 'Cập nhật' : 'Thêm mới')}
                                                                                                                        </button>
                                                                                                    </div>
                                                                                </form>
                                                            </div>
                                        </div>
                    );
}
