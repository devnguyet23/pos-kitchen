'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '@/lib/api';
import { Store, Chain } from '@/lib/types';

interface StoreModalProps {
                    isOpen: boolean;
                    onClose: () => void;
                    store?: Store | null;
                    onSuccess: () => void;
                    chains: Chain[];
}

export default function StoreModal({ isOpen, onClose, store, onSuccess, chains }: StoreModalProps) {
                    const [loading, setLoading] = useState(false);
                    const [error, setError] = useState('');
                    const [formData, setFormData] = useState({
                                        name: '',
                                        code: '',
                                        chainId: 0,
                                        address: '',
                                        phone: '',
                                        email: '',
                                        status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE',
                    });

                    useEffect(() => {
                                        if (store) {
                                                            setFormData({
                                                                                name: store.name || '',
                                                                                code: store.code || '',
                                                                                chainId: store.chainId || 0,
                                                                                address: store.address || '',
                                                                                phone: store.phone || '',
                                                                                email: store.email || '',
                                                                                status: store.status || 'ACTIVE',
                                                            });
                                        } else {
                                                            setFormData({
                                                                                name: '',
                                                                                code: '',
                                                                                chainId: chains.length > 0 ? chains[0].id : 0,
                                                                                address: '',
                                                                                phone: '',
                                                                                email: '',
                                                                                status: 'ACTIVE',
                                                            });
                                        }
                                        setError('');
                    }, [store, isOpen, chains]);

                    const handleSubmit = async (e: React.FormEvent) => {
                                        e.preventDefault();
                                        setLoading(true);
                                        setError('');

                                        try {
                                                            if (store) {
                                                                                await api.patch(`/stores-management/${store.id}`, formData);
                                                            } else {
                                                                                await api.post('/stores-management', formData);
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
                                                            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
                                                                                {/* Header */}
                                                                                <div className="flex items-center justify-between p-6 border-b">
                                                                                                    <h2 className="text-xl font-semibold text-gray-800">
                                                                                                                        {store ? 'Sửa cửa hàng' : 'Thêm cửa hàng mới'}
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
                                                                                                                                                                Chuỗi *
                                                                                                                                            </label>
                                                                                                                                            <select
                                                                                                                                                                required
                                                                                                                                                                value={formData.chainId}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, chainId: parseInt(e.target.value) })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                                                                                                disabled={!!store}
                                                                                                                                            >
                                                                                                                                                                <option value={0}>-- Chọn chuỗi --</option>
                                                                                                                                                                {chains.map(chain => (
                                                                                                                                                                                    <option key={chain.id} value={chain.id}>{chain.name}</option>
                                                                                                                                                                ))}
                                                                                                                                            </select>
                                                                                                                        </div>

                                                                                                                        <div className="col-span-2">
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                Tên cửa hàng *
                                                                                                                                            </label>
                                                                                                                                            <input
                                                                                                                                                                type="text"
                                                                                                                                                                required
                                                                                                                                                                value={formData.name}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                                                                                                placeholder="VD: Chi nhánh Quận 1"
                                                                                                                                            />
                                                                                                                        </div>

                                                                                                                        <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                Mã cửa hàng *
                                                                                                                                            </label>
                                                                                                                                            <input
                                                                                                                                                                type="text"
                                                                                                                                                                required
                                                                                                                                                                value={formData.code}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                                                                                                                                                placeholder="VD: CH-Q1"
                                                                                                                                                                disabled={!!store}
                                                                                                                                            />
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
                                                                                                                                                                <option value="MAINTENANCE">Bảo trì</option>
                                                                                                                                            </select>
                                                                                                                        </div>

                                                                                                                        <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                Email
                                                                                                                                            </label>
                                                                                                                                            <input
                                                                                                                                                                type="email"
                                                                                                                                                                value={formData.email}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                                                                                                                        <div className="col-span-2">
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                Địa chỉ
                                                                                                                                            </label>
                                                                                                                                            <input
                                                                                                                                                                type="text"
                                                                                                                                                                value={formData.address}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                                                                            />
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
                                                                                                                                            disabled={loading || formData.chainId === 0}
                                                                                                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                                                                                                        >
                                                                                                                                            {loading ? 'Đang lưu...' : (store ? 'Cập nhật' : 'Thêm mới')}
                                                                                                                        </button>
                                                                                                    </div>
                                                                                </form>
                                                            </div>
                                        </div>
                    );
}
