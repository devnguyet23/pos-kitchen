'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Store, ApiResponse, Chain } from '@/lib/types';
import { Store as StoreIcon, Plus, Search, Edit2, Trash2, Users, MapPin } from 'lucide-react';

export default function StoresPage() {
                    const [stores, setStores] = useState<Store[]>([]);
                    const [loading, setLoading] = useState(true);
                    const [search, setSearch] = useState('');
                    const [page, setPage] = useState(1);
                    const [totalPages, setTotalPages] = useState(1);

                    const fetchStores = async () => {
                                        setLoading(true);
                                        try {
                                                            const params = new URLSearchParams({
                                                                                page: page.toString(),
                                                                                pageSize: '10',
                                                                                ...(search && { search }),
                                                            });
                                                            const response = await api.get<ApiResponse<Store[]>>(`/stores-management?${params}`);
                                                            setStores(response.data);
                                                            setTotalPages(response.totalPages || 1);
                                        } catch (error) {
                                                            console.error('Failed to fetch stores:', error);
                                        } finally {
                                                            setLoading(false);
                                        }
                    };

                    useEffect(() => {
                                        fetchStores();
                    }, [page, search]);

                    const handleDelete = async (id: number) => {
                                        if (!confirm('Bạn có chắc muốn xóa cửa hàng này?')) return;
                                        try {
                                                            await api.delete(`/stores-management/${id}`);
                                                            fetchStores();
                                        } catch (error: any) {
                                                            alert(error.message);
                                        }
                    };

                    return (
                                        <ProtectedRoute permissions={['view_stores', 'view_own_store']}>
                                                            <div className="ml-64 p-8">
                                                                                <div className="max-w-7xl mx-auto">
                                                                                                    {/* Header */}
                                                                                                    <div className="flex items-center justify-between mb-8">
                                                                                                                        <div>
                                                                                                                                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                                                                                                                                                <StoreIcon className="text-green-600" />
                                                                                                                                                                Quản lý Cửa hàng
                                                                                                                                            </h1>
                                                                                                                                            <p className="text-gray-500 mt-1">Quản lý các cửa hàng trong chuỗi</p>
                                                                                                                        </div>
                                                                                                                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                                                                                                                            <Plus size={20} />
                                                                                                                                            Thêm cửa hàng
                                                                                                                        </button>
                                                                                                    </div>

                                                                                                    {/* Search */}
                                                                                                    <div className="mb-6">
                                                                                                                        <div className="relative">
                                                                                                                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                                                                                                                            <input
                                                                                                                                                                type="text"
                                                                                                                                                                placeholder="Tìm kiếm theo tên, mã hoặc địa chỉ..."
                                                                                                                                                                value={search}
                                                                                                                                                                onChange={(e) => setSearch(e.target.value)}
                                                                                                                                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                                                                                                            />
                                                                                                                        </div>
                                                                                                    </div>

                                                                                                    {/* Table */}
                                                                                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                                                                                                        {loading ? (
                                                                                                                                            <div className="flex items-center justify-center py-12">
                                                                                                                                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                                                                                                                                            </div>
                                                                                                                        ) : stores.length === 0 ? (
                                                                                                                                            <div className="text-center py-12 text-gray-500">
                                                                                                                                                                Không có dữ liệu
                                                                                                                                            </div>
                                                                                                                        ) : (
                                                                                                                                            <table className="w-full">
                                                                                                                                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                                                                                                                                                    <tr>
                                                                                                                                                                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Cửa hàng</th>
                                                                                                                                                                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Chuỗi</th>
                                                                                                                                                                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
                                                                                                                                                                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                                                                                                                                                                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                                                                                                                                                                                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                                                                                                                                                                    </tr>
                                                                                                                                                                </thead>
                                                                                                                                                                <tbody className="divide-y divide-gray-200">
                                                                                                                                                                                    {stores.map((store: any) => (
                                                                                                                                                                                                        <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                                                                                                                                                                                                                            <td className="px-6 py-4">
                                                                                                                                                                                                                                                <div className="flex items-center gap-3">
                                                                                                                                                                                                                                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white font-medium">
                                                                                                                                                                                                                                                                                        {store.name.charAt(0)}
                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                    <div>
                                                                                                                                                                                                                                                                                        <p className="font-medium text-gray-800">{store.name}</p>
                                                                                                                                                                                                                                                                                        <p className="text-sm text-gray-500 font-mono">{store.code}</p>
                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                            <td className="px-6 py-4">
                                                                                                                                                                                                                                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                                                                                                                                                                                                                                                                    {store.chain?.name || '-'}
                                                                                                                                                                                                                                                </span>
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                            <td className="px-6 py-4">
                                                                                                                                                                                                                                                {store.address ? (
                                                                                                                                                                                                                                                                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                                                                                                                                                                                                                                                                                        <MapPin size={14} />
                                                                                                                                                                                                                                                                                        {store.address}
                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                ) : (
                                                                                                                                                                                                                                                                    <span className="text-gray-400">-</span>
                                                                                                                                                                                                                                                )}
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                            <td className="px-6 py-4">
                                                                                                                                                                                                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${store.status === 'ACTIVE'
                                                                                                                                                                                                                                                                                        ? 'bg-green-100 text-green-700'
                                                                                                                                                                                                                                                                                        : store.status === 'MAINTENANCE'
                                                                                                                                                                                                                                                                                                            ? 'bg-yellow-100 text-yellow-700'
                                                                                                                                                                                                                                                                                                            : 'bg-gray-100 text-gray-700'
                                                                                                                                                                                                                                                                    }`}>
                                                                                                                                                                                                                                                                    {store.status === 'ACTIVE' ? 'Hoạt động' : store.status === 'MAINTENANCE' ? 'Bảo trì' : 'Không hoạt động'}
                                                                                                                                                                                                                                                </span>
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                            <td className="px-6 py-4 text-center">
                                                                                                                                                                                                                                                <div className="flex items-center justify-center gap-1 text-gray-600">
                                                                                                                                                                                                                                                                    <Users size={16} />
                                                                                                                                                                                                                                                                    {store._count?.users || 0}
                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                            <td className="px-6 py-4 text-right">
                                                                                                                                                                                                                                                <div className="flex items-center justify-end gap-2">
                                                                                                                                                                                                                                                                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                                                                                                                                                                                                                                                        <Edit2 size={18} />
                                                                                                                                                                                                                                                                    </button>
                                                                                                                                                                                                                                                                    <button
                                                                                                                                                                                                                                                                                        onClick={() => handleDelete(store.id)}
                                                                                                                                                                                                                                                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                                                                                                                                                                                                                    >
                                                                                                                                                                                                                                                                                        <Trash2 size={18} />
                                                                                                                                                                                                                                                                    </button>
                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                        </tr>
                                                                                                                                                                                    ))}
                                                                                                                                                                </tbody>
                                                                                                                                            </table>
                                                                                                                        )}

                                                                                                                        {/* Pagination */}
                                                                                                                        {totalPages > 1 && (
                                                                                                                                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                                                                                                                                                <p className="text-sm text-gray-500">Trang {page} / {totalPages}</p>
                                                                                                                                                                <div className="flex gap-2">
                                                                                                                                                                                    <button
                                                                                                                                                                                                        disabled={page === 1}
                                                                                                                                                                                                        onClick={() => setPage(p => p - 1)}
                                                                                                                                                                                                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                                                                                                                                                                                    >
                                                                                                                                                                                                        Trước
                                                                                                                                                                                    </button>
                                                                                                                                                                                    <button
                                                                                                                                                                                                        disabled={page === totalPages}
                                                                                                                                                                                                        onClick={() => setPage(p => p + 1)}
                                                                                                                                                                                                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                                                                                                                                                                                    >
                                                                                                                                                                                                        Sau
                                                                                                                                                                                    </button>
                                                                                                                                                                </div>
                                                                                                                                            </div>
                                                                                                                        )}
                                                                                                    </div>
                                                                                </div>
                                                            </div>
                                        </ProtectedRoute>
                    );
}
