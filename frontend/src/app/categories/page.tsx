"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Save, Package } from "lucide-react";

type Category = {
                    id: number;
                    name: string;
                    _count?: {
                                        products: number;
                    };
};

type CategoryFormData = {
                    name: string;
};

export default function CategoriesPage() {
                    const [categories, setCategories] = useState<Category[]>([]);
                    const [isModalOpen, setIsModalOpen] = useState(false);
                    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
                    const [formData, setFormData] = useState<CategoryFormData>({
                                        name: "",
                    });
                    const [loading, setLoading] = useState(false);

                    // Fetch categories
                    const fetchCategories = async () => {
                                        try {
                                                            const res = await fetch("http://localhost:3001/categories");
                                                            const data = await res.json();
                                                            setCategories(data);
                                        } catch (e) {
                                                            console.error("Failed to fetch categories:", e);
                                        }
                    };

                    useEffect(() => {
                                        fetchCategories();
                    }, []);

                    // Open modal for adding
                    const openAddModal = () => {
                                        setEditingCategory(null);
                                        setFormData({ name: "" });
                                        setIsModalOpen(true);
                    };

                    // Open modal for editing
                    const openEditModal = (category: Category) => {
                                        setEditingCategory(category);
                                        setFormData({ name: category.name });
                                        setIsModalOpen(true);
                    };

                    // Close modal
                    const closeModal = () => {
                                        setIsModalOpen(false);
                                        setEditingCategory(null);
                    };

                    // Handle form submit
                    const handleSubmit = async (e: React.FormEvent) => {
                                        e.preventDefault();
                                        setLoading(true);

                                        try {
                                                            if (editingCategory) {
                                                                                await fetch(`http://localhost:3001/categories/${editingCategory.id}`, {
                                                                                                    method: "PUT",
                                                                                                    headers: { "Content-Type": "application/json" },
                                                                                                    body: JSON.stringify(formData),
                                                                                });
                                                            } else {
                                                                                await fetch("http://localhost:3001/categories", {
                                                                                                    method: "POST",
                                                                                                    headers: { "Content-Type": "application/json" },
                                                                                                    body: JSON.stringify(formData),
                                                                                });
                                                            }

                                                            await fetchCategories();
                                                            closeModal();
                                        } catch (e) {
                                                            console.error("Failed to save category:", e);
                                                            alert("Failed to save category");
                                        } finally {
                                                            setLoading(false);
                                        }
                    };

                    // Handle delete
                    const handleDelete = async (id: number) => {
                                        if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;

                                        try {
                                                            const res = await fetch(`http://localhost:3001/categories/${id}`, {
                                                                                method: "DELETE",
                                                            });
                                                            if (!res.ok) {
                                                                                const error = await res.json();
                                                                                alert(error.message || "Không thể xóa danh mục");
                                                                                return;
                                                            }
                                                            await fetchCategories();
                                        } catch (e) {
                                                            console.error("Failed to delete category:", e);
                                                            alert("Failed to delete category");
                                        }
                    };

                    return (
                                        <div className="min-h-screen bg-gray-100">
                                                            {/* Header */}
                                                            <header className="bg-white shadow">
                                                                                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                                                                                                    <div>
                                                                                                                        <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
                                                                                                                        <p className="text-gray-500 text-sm">Thêm, sửa, xóa danh mục sản phẩm</p>
                                                                                                    </div>
                                                                                                    <div className="flex gap-2">
                                                                                                                        <a href="/products" className="px-4 py-2 text-gray-600 hover:text-blue-600">
                                                                                                                                            ← Quản lý sản phẩm
                                                                                                                        </a>
                                                                                                                        <button
                                                                                                                                            onClick={openAddModal}
                                                                                                                                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                                                                                                        >
                                                                                                                                            <Plus size={20} />
                                                                                                                                            Thêm danh mục
                                                                                                                        </button>
                                                                                                    </div>
                                                                                </div>
                                                            </header>

                                                            {/* Categories Grid */}
                                                            <main className="max-w-7xl mx-auto px-4 py-6">
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                                                                    {categories.map((category) => (
                                                                                                                        <div key={category.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
                                                                                                                                            <div className="flex justify-between items-start mb-3">
                                                                                                                                                                <div className="flex items-center gap-3">
                                                                                                                                                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                                                                                                                                                        <Package size={20} className="text-blue-600" />
                                                                                                                                                                                    </div>
                                                                                                                                                                                    <div>
                                                                                                                                                                                                        <h3 className="font-bold text-gray-800">{category.name}</h3>
                                                                                                                                                                                                        <p className="text-sm text-gray-500">
                                                                                                                                                                                                                            {category._count?.products || 0} sản phẩm
                                                                                                                                                                                                        </p>
                                                                                                                                                                                    </div>
                                                                                                                                                                </div>
                                                                                                                                                                <div className="flex gap-1">
                                                                                                                                                                                    <button
                                                                                                                                                                                                        onClick={() => openEditModal(category)}
                                                                                                                                                                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                                                                                                                                                    >
                                                                                                                                                                                                        <Pencil size={16} />
                                                                                                                                                                                    </button>
                                                                                                                                                                                    <button
                                                                                                                                                                                                        onClick={() => handleDelete(category.id)}
                                                                                                                                                                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                                                                                                                                                    >
                                                                                                                                                                                                        <Trash2 size={16} />
                                                                                                                                                                                    </button>
                                                                                                                                                                </div>
                                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                    ))}
                                                                                                    {categories.length === 0 && (
                                                                                                                        <div className="col-span-full text-center py-12 text-gray-500">
                                                                                                                                            Chưa có danh mục nào. Nhấn "Thêm danh mục" để bắt đầu.
                                                                                                                        </div>
                                                                                                    )}
                                                                                </div>
                                                            </main>

                                                            {/* Modal */}
                                                            {isModalOpen && (
                                                                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                                                                                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                                                                                                                        <div className="flex justify-between items-center mb-4">
                                                                                                                                            <h2 className="text-xl font-bold">
                                                                                                                                                                {editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
                                                                                                                                            </h2>
                                                                                                                                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                                                                                                                                                <X size={24} />
                                                                                                                                            </button>
                                                                                                                        </div>

                                                                                                                        <form onSubmit={handleSubmit} className="space-y-4">
                                                                                                                                            <div>
                                                                                                                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                                    Tên danh mục
                                                                                                                                                                </label>
                                                                                                                                                                <input
                                                                                                                                                                                    type="text"
                                                                                                                                                                                    value={formData.name}
                                                                                                                                                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                                                                                                                                                    placeholder="Ví dụ: Đồ uống, Đồ ăn, Tráng miệng"
                                                                                                                                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                                                                                                                    required
                                                                                                                                                                />
                                                                                                                                            </div>

                                                                                                                                            <div className="flex gap-3 pt-4">
                                                                                                                                                                <button
                                                                                                                                                                                    type="button"
                                                                                                                                                                                    onClick={closeModal}
                                                                                                                                                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                                                                                                                                                >
                                                                                                                                                                                    Hủy
                                                                                                                                                                </button>
                                                                                                                                                                <button
                                                                                                                                                                                    type="submit"
                                                                                                                                                                                    disabled={loading}
                                                                                                                                                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                                                                                                                                                                >
                                                                                                                                                                                    <Save size={18} />
                                                                                                                                                                                    {loading ? "Đang lưu..." : "Lưu"}
                                                                                                                                                                </button>
                                                                                                                                            </div>
                                                                                                                        </form>
                                                                                                    </div>
                                                                                </div>
                                                            )}
                                        </div>
                    );
}
