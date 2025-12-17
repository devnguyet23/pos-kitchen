'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { User, ApiResponse, Chain, Store, Role } from '@/lib/types';
import { Users, Plus, Search, Edit2, Trash2, Lock, Unlock, Shield } from 'lucide-react';
import UserModal from '@/components/admin/UserModal';

export default function UsersPage() {
                    const [users, setUsers] = useState<User[]>([]);
                    const [chains, setChains] = useState<Chain[]>([]);
                    const [stores, setStores] = useState<Store[]>([]);
                    const [roles, setRoles] = useState<Role[]>([]);
                    const [loading, setLoading] = useState(true);
                    const [search, setSearch] = useState('');
                    const [page, setPage] = useState(1);
                    const [totalPages, setTotalPages] = useState(1);
                    const [showModal, setShowModal] = useState(false);
                    const [selectedUser, setSelectedUser] = useState<any | null>(null);

                    const fetchUsers = async () => {
                                        setLoading(true);
                                        try {
                                                            const params = new URLSearchParams({
                                                                                page: page.toString(),
                                                                                pageSize: '10',
                                                                                ...(search && { search }),
                                                            });
                                                            const response = await api.get<ApiResponse<User[]>>(`/users?${params}`);
                                                            setUsers(response.data);
                                                            setTotalPages(response.totalPages || 1);
                                        } catch (error) {
                                                            console.error('Failed to fetch users:', error);
                                        } finally {
                                                            setLoading(false);
                                        }
                    };

                    const fetchMetadata = async () => {
                                        try {
                                                            const [chainsRes, storesRes, rolesRes] = await Promise.all([
                                                                                api.get<ApiResponse<Chain[]>>('/chains?pageSize=100'),
                                                                                api.get<ApiResponse<Store[]>>('/stores-management?pageSize=100'),
                                                                                api.get<ApiResponse<Role[]>>('/roles?pageSize=100'),
                                                            ]);
                                                            setChains(chainsRes.data);
                                                            setStores(storesRes.data);
                                                            setRoles(rolesRes.data);
                                        } catch (error) {
                                                            console.error('Failed to fetch metadata:', error);
                                        }
                    };

                    useEffect(() => {
                                        fetchUsers();
                                        fetchMetadata();
                    }, [page, search]);

                    const handleDelete = async (id: number) => {
                                        if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
                                        try {
                                                            await api.delete(`/users/${id}`);
                                                            fetchUsers();
                                        } catch (error: any) {
                                                            alert(error.message);
                                        }
                    };

                    const handleToggleLock = async (id: number, isLocked: boolean) => {
                                        try {
                                                            await api.post(`/users/${id}/${isLocked ? 'unlock' : 'lock'}`);
                                                            fetchUsers();
                                        } catch (error: any) {
                                                            alert(error.message);
                                        }
                    };

                    const openAddModal = () => {
                                        setSelectedUser(null);
                                        setShowModal(true);
                    };

                    const openEditModal = (user: any) => {
                                        setSelectedUser(user);
                                        setShowModal(true);
                    };

                    const getRoleBadgeColor = (roleCode: string) => {
                                        switch (roleCode) {
                                                            case 'super_admin': return 'bg-red-100 text-red-700';
                                                            case 'chain_owner': return 'bg-purple-100 text-purple-700';
                                                            case 'chain_admin': return 'bg-blue-100 text-blue-700';
                                                            case 'store_manager': return 'bg-green-100 text-green-700';
                                                            case 'assistant_manager': return 'bg-teal-100 text-teal-700';
                                                            case 'cashier': return 'bg-yellow-100 text-yellow-700';
                                                            case 'warehouse_staff': return 'bg-indigo-100 text-indigo-700';
                                                            case 'accountant': return 'bg-pink-100 text-pink-700';
                                                            default: return 'bg-gray-100 text-gray-700';
                                        }
                    };

                    return (
                                        <ProtectedRoute permissions={['view_users', 'view_store_users']}>
                                                            <div className="ml-64 p-8">
                                                                                <div className="max-w-7xl mx-auto">
                                                                                                    {/* Header */}
                                                                                                    <div className="flex items-center justify-between mb-8">
                                                                                                                        <div>
                                                                                                                                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                                                                                                                                                <Users className="text-purple-600" />
                                                                                                                                                                Quản lý Người dùng
                                                                                                                                            </h1>
                                                                                                                                            <p className="text-gray-500 mt-1">Quản lý nhân viên và phân quyền</p>
                                                                                                                        </div>
                                                                                                                        <button
                                                                                                                                            onClick={openAddModal}
                                                                                                                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                                                                                                        >
                                                                                                                                            <Plus size={20} />
                                                                                                                                            Thêm người dùng
                                                                                                                        </button>
                                                                                                    </div>

                                                                                                    {/* Search */}
                                                                                                    <div className="mb-6">
                                                                                                                        <div className="relative">
                                                                                                                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                                                                                                                            <input
                                                                                                                                                                type="text"
                                                                                                                                                                placeholder="Tìm kiếm theo tên, username hoặc email..."
                                                                                                                                                                value={search}
                                                                                                                                                                onChange={(e) => setSearch(e.target.value)}
                                                                                                                                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                                                                                            />
                                                                                                                        </div>
                                                                                                    </div>

                                                                                                    {/* Table */}
                                                                                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                                                                                                        {loading ? (
                                                                                                                                            <div className="flex items-center justify-center py-12">
                                                                                                                                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                                                                                                                                            </div>
                                                                                                                        ) : users.length === 0 ? (
                                                                                                                                            <div className="text-center py-12 text-gray-500">
                                                                                                                                                                Không có dữ liệu
                                                                                                                                            </div>
                                                                                                                        ) : (
                                                                                                                                            <table className="w-full">
                                                                                                                                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                                                                                                                                                    <tr>
                                                                                                                                                                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                                                                                                                                                                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                                                                                                                                                                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                                                                                                                                                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Đăng nhập cuối</th>
                                                                                                                                                                                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                                                                                                                                                                    </tr>
                                                                                                                                                                </thead>
                                                                                                                                                                <tbody className="divide-y divide-gray-200">
                                                                                                                                                                                    {users.map((user: any) => (
                                                                                                                                                                                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                                                                                                                                                                                            <td className="px-6 py-4">
                                                                                                                                                                                                                                                <div className="flex items-center gap-3">
                                                                                                                                                                                                                                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                                                                                                                                                                                                                                                                                        {user.fullName?.charAt(0) || user.username.charAt(0).toUpperCase()}
                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                    <div>
                                                                                                                                                                                                                                                                                        <p className="font-medium text-gray-800">{user.fullName}</p>
                                                                                                                                                                                                                                                                                        <p className="text-sm text-gray-500">@{user.username}</p>
                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                            <td className="px-6 py-4">
                                                                                                                                                                                                                                                <div className="flex flex-wrap gap-1">
                                                                                                                                                                                                                                                                    {user.userRoles?.map((ur: any) => (
                                                                                                                                                                                                                                                                                        <span
                                                                                                                                                                                                                                                                                                            key={ur.role.id}
                                                                                                                                                                                                                                                                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(ur.role.code)}`}
                                                                                                                                                                                                                                                                                        >
                                                                                                                                                                                                                                                                                                            {ur.role.name}
                                                                                                                                                                                                                                                                                        </span>
                                                                                                                                                                                                                                                                    ))}
                                                                                                                                                                                                                                                                    {(!user.userRoles || user.userRoles.length === 0) && (
                                                                                                                                                                                                                                                                                        <span className="text-gray-400 text-sm">Chưa phân quyền</span>
                                                                                                                                                                                                                                                                    )}
                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                            <td className="px-6 py-4">
                                                                                                                                                                                                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'ACTIVE'
                                                                                                                                                                                                                                                                    ? 'bg-green-100 text-green-700'
                                                                                                                                                                                                                                                                    : user.status === 'SUSPENDED'
                                                                                                                                                                                                                                                                                        ? 'bg-red-100 text-red-700'
                                                                                                                                                                                                                                                                                        : 'bg-gray-100 text-gray-700'
                                                                                                                                                                                                                                                                    }`}>
                                                                                                                                                                                                                                                                    {user.status === 'ACTIVE' ? 'Hoạt động' : user.status === 'SUSPENDED' ? 'Bị khóa' : 'Không hoạt động'}
                                                                                                                                                                                                                                                </span>
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                                                                                                                                                                                                                {user.lastLoginAt
                                                                                                                                                                                                                                                                    ? new Date(user.lastLoginAt).toLocaleString('vi-VN')
                                                                                                                                                                                                                                                                    : 'Chưa đăng nhập'}
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                            <td className="px-6 py-4 text-right">
                                                                                                                                                                                                                                                <div className="flex items-center justify-end gap-2">
                                                                                                                                                                                                                                                                    <button
                                                                                                                                                                                                                                                                                        title="Phân quyền"
                                                                                                                                                                                                                                                                                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                                                                                                                                                                                                                                    >
                                                                                                                                                                                                                                                                                        <Shield size={18} />
                                                                                                                                                                                                                                                                    </button>
                                                                                                                                                                                                                                                                    <button
                                                                                                                                                                                                                                                                                        onClick={() => openEditModal(user)}
                                                                                                                                                                                                                                                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                                                                                                                                                                                                                    >
                                                                                                                                                                                                                                                                                        <Edit2 size={18} />
                                                                                                                                                                                                                                                                    </button>
                                                                                                                                                                                                                                                                    <button
                                                                                                                                                                                                                                                                                        onClick={() => handleToggleLock(user.id, user.status === 'SUSPENDED')}
                                                                                                                                                                                                                                                                                        title={user.status === 'SUSPENDED' ? 'Mở khóa' : 'Khóa'}
                                                                                                                                                                                                                                                                                        className={`p-2 rounded-lg transition-colors ${user.status === 'SUSPENDED'
                                                                                                                                                                                                                                                                                                            ? 'text-green-400 hover:text-green-600 hover:bg-green-50'
                                                                                                                                                                                                                                                                                                            : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                                                                                                                                                                                                                                                                                                            }`}
                                                                                                                                                                                                                                                                    >
                                                                                                                                                                                                                                                                                        {user.status === 'SUSPENDED' ? <Unlock size={18} /> : <Lock size={18} />}
                                                                                                                                                                                                                                                                    </button>
                                                                                                                                                                                                                                                                    <button
                                                                                                                                                                                                                                                                                        onClick={() => handleDelete(user.id)}
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

                                                            {/* User Modal */}
                                                            <UserModal
                                                                                isOpen={showModal}
                                                                                onClose={() => setShowModal(false)}
                                                                                user={selectedUser}
                                                                                onSuccess={fetchUsers}
                                                                                chains={chains}
                                                                                stores={stores}
                                                                                roles={roles}
                                                            />
                                        </ProtectedRoute>
                    );
}
