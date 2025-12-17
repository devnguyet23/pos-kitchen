'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '@/lib/api';
import { Chain } from '@/lib/types';

interface ChainModalProps {
                    isOpen: boolean;
                    onClose: () => void;
                    chain?: Chain | null;
                    onSuccess: () => void;
}

export default function ChainModal({ isOpen, onClose, chain, onSuccess }: ChainModalProps) {
                    const [loading, setLoading] = useState(false);
                    const [error, setError] = useState('');
                    const [formData, setFormData] = useState({
                                        name: '',
                                        code: '',
                                        description: '',
                                        email: '',
                                        phone: '',
                                        website: '',
                                        address: '',
                                        taxCode: '',
                                        status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
                    });

                    useEffect(() => {
                                        if (chain) {
                                                            setFormData({
                                                                                name: chain.name || '',
                                                                                code: chain.code || '',
                                                                                description: chain.description || '',
                                                                                email: chain.email || '',
                                                                                phone: chain.phone || '',
                                                                                website: chain.website || '',
                                                                                address: chain.address || '',
                                                                                taxCode: chain.taxCode || '',
                                                                                status: chain.status || 'ACTIVE',
                                                            });
                                        } else {
                                                            setFormData({
                                                                                name: '',
                                                                                code: '',
                                                                                description: '',
                                                                                email: '',
                                                                                phone: '',
                                                                                website: '',
                                                                                address: '',
                                                                                taxCode: '',
                                                                                status: 'ACTIVE',
                                                            });
                                        }
                                        setError('');
                    }, [chain, isOpen]);

                    const handleSubmit = async (e: React.FormEvent) => {
                                        e.preventDefault();
                                        setLoading(true);
                                        setError('');

                                        try {
                                                            if (chain) {
                                                                                await api.patch(`/chains/${chain.id}`, formData);
                                                            } else {
                                                                                await api.post('/chains', formData);
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
                                                                                                                        {chain ? 'Sửa chuỗi' : 'Thêm chuỗi mới'}
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
                                                                                                                                                                Tên chuỗi *
                                                                                                                                            </label>
                                                                                                                                            <input
                                                                                                                                                                type="text"
                                                                                                                                                                required
                                                                                                                                                                value={formData.name}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                                                                                                placeholder="VD: The Coffee House"
                                                                                                                                            />
                                                                                                                        </div>

                                                                                                                        <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                Mã chuỗi *
                                                                                                                                            </label>
                                                                                                                                            <input
                                                                                                                                                                type="text"
                                                                                                                                                                required
                                                                                                                                                                value={formData.code}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                                                                                                                                                placeholder="VD: TCH"
                                                                                                                                                                disabled={!!chain}
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
                                                                                                                                                                <option value="SUSPENDED">Tạm dừng</option>
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

                                                                                                                        <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                Website
                                                                                                                                            </label>
                                                                                                                                            <input
                                                                                                                                                                type="text"
                                                                                                                                                                value={formData.website}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                                                                            />
                                                                                                                        </div>

                                                                                                                        <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                Mã số thuế
                                                                                                                                            </label>
                                                                                                                                            <input
                                                                                                                                                                type="text"
                                                                                                                                                                value={formData.taxCode}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
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

                                                                                                                        <div className="col-span-2">
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                Mô tả
                                                                                                                                            </label>
                                                                                                                                            <textarea
                                                                                                                                                                value={formData.description}
                                                                                                                                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                                                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                                                                                                rows={3}
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
                                                                                                                                            disabled={loading}
                                                                                                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                                                                                                        >
                                                                                                                                            {loading ? 'Đang lưu...' : (chain ? 'Cập nhật' : 'Thêm mới')}
                                                                                                                        </button>
                                                                                                    </div>
                                                                                </form>
                                                            </div>
                                        </div>
                    );
}
