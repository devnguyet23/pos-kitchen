"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Save, Package, Search, ChevronLeft, ChevronRight, AlertTriangle, Check } from "lucide-react";

type Category = {
                    id: number;
                    name: string;
                    description?: string | null;
                    parentId?: number | null;
                    parent?: Category | null;
                    children?: Category[];
                    createdAt?: string;
                    _count?: {
                                        products: number;
                    };
};

type CategoryFormData = {
                    name: string;
                    description?: string;
                    parentId?: number | null;
};

type SortField = "id" | "name" | "createdAt" | "productCount";
type SortOrder = "asc" | "desc";

export default function CategoriesPage() {
                    const [categories, setCategories] = useState<Category[]>([]);
                    const [isModalOpen, setIsModalOpen] = useState(false);
                    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
                    const [formData, setFormData] = useState<CategoryFormData>({
                                        name: "",
                                        description: "",
                                        parentId: null,
                    });
                    const [parentError, setParentError] = useState<string>("");
                    const [loading, setLoading] = useState(false);

                    // Search
                    const [searchQuery, setSearchQuery] = useState("");

                    // Sort
                    const [sortField, setSortField] = useState<SortField>("id");
                    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

                    // Pagination
                    const [currentPage, setCurrentPage] = useState(1);
                    const [pageSize, setPageSize] = useState<number | "all">(20);

                    // Delete modal
                    const [showDeleteModal, setShowDeleteModal] = useState(false);
                    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
                    const [deleteSuccess, setDeleteSuccess] = useState(false);

                    // Multi-select
                    const [selectedIds, setSelectedIds] = useState<number[]>([]);
                    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
                    const [bulkDeleteSuccess, setBulkDeleteSuccess] = useState(false);
                    const [bulkDeleteProgress, setBulkDeleteProgress] = useState({ current: 0, total: 0, failed: 0 });
                    const [categoriesWithProducts, setCategoriesWithProducts] = useState<Category[]>([]);
                    const [deletableCategories, setDeletableCategories] = useState<Category[]>([]);

                    // Normalize Vietnamese text (remove accents)
                    const normalizeVietnamese = (str: string) => {
                                        return str
                                                            .normalize("NFD")
                                                            .replace(/[\u0300-\u036f]/g, "")
                                                            .replace(/đ/g, "d")
                                                            .replace(/Đ/g, "D")
                                                            .toLowerCase();
                    };

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

                    // Get category depth
                    const getCategoryDepth = (category: Category): number => {
                                        if (!category.parentId) return 1;
                                        const parent = categories.find(c => c.id === category.parentId);
                                        if (!parent) return 1;
                                        return getCategoryDepth(parent) + 1;
                    };

                    // Get category hierarchy path
                    const getCategoryPath = (category: Category): string => {
                                        const parts: string[] = [];
                                        let current: Category | undefined = category;
                                        while (current) {
                                                            parts.unshift(current.name);
                                                            current = categories.find(c => c.id === current?.parentId);
                                        }
                                        return parts.join(" > ");
                    };

                    // Filter and sort categories
                    const filteredCategories = categories.filter(category => {
                                        if (!searchQuery) return true;
                                        const normalizedQuery = normalizeVietnamese(searchQuery);
                                        const normalizedName = normalizeVietnamese(category.name);
                                        const normalizedPath = normalizeVietnamese(getCategoryPath(category));
                                        return normalizedName.includes(normalizedQuery) || normalizedPath.includes(normalizedQuery);
                    });

                    const sortedCategories = [...filteredCategories].sort((a, b) => {
                                        let comparison = 0;
                                        switch (sortField) {
                                                            case "id":
                                                                                comparison = a.id - b.id;
                                                                                break;
                                                            case "name":
                                                                                comparison = a.name.localeCompare(b.name, "vi");
                                                                                break;
                                                            case "createdAt":
                                                                                comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                                                                                break;
                                                            case "productCount":
                                                                                comparison = (a._count?.products || 0) - (b._count?.products || 0);
                                                                                break;
                                        }
                                        return sortOrder === "asc" ? comparison : -comparison;
                    });

                    // Pagination
                    const totalCategories = sortedCategories.length;
                    const totalPages = pageSize === "all" ? 1 : Math.ceil(totalCategories / pageSize);
                    const paginatedCategories = pageSize === "all"
                                        ? sortedCategories
                                        : sortedCategories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

                    // Modal functions
                    const openAddModal = () => {
                                        setEditingCategory(null);
                                        setFormData({ name: "", description: "", parentId: null });
                                        setParentError("");
                                        setIsModalOpen(true);
                    };

                    const openEditModal = (category: Category) => {
                                        setEditingCategory(category);
                                        setFormData({ name: category.name, description: category.description || "", parentId: category.parentId || null });
                                        setParentError("");
                                        setIsModalOpen(true);
                    };

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

                    // Handle delete with modal
                    const openDeleteModal = (category: Category) => {
                                        setCategoryToDelete(category);
                                        setDeleteSuccess(false);
                                        setShowDeleteModal(true);
                    };

                    const confirmDelete = async () => {
                                        if (!categoryToDelete) return;

                                        try {
                                                            const res = await fetch(`http://localhost:3001/categories/${categoryToDelete.id}`, {
                                                                                method: "DELETE",
                                                            });
                                                            if (!res.ok) {
                                                                                const error = await res.json();
                                                                                alert(error.message || "Không thể xóa danh mục");
                                                                                setShowDeleteModal(false);
                                                                                return;
                                                            }
                                                            await fetchCategories();
                                                            setDeleteSuccess(true);
                                                            setTimeout(() => {
                                                                                setShowDeleteModal(false);
                                                                                setCategoryToDelete(null);
                                                                                setDeleteSuccess(false);
                                                            }, 1500);
                                        } catch (e) {
                                                            console.error("Failed to delete category:", e);
                                                            alert("Failed to delete category");
                                                            setShowDeleteModal(false);
                                        }
                    };

                    // Handle sort
                    const handleSort = (field: SortField) => {
                                        if (sortField === field) {
                                                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                        } else {
                                                            setSortField(field);
                                                            setSortOrder("asc");
                                        }
                                        setCurrentPage(1);
                    };

                    // Format date
                    const formatDate = (dateStr: string) => {
                                        return new Date(dateStr).toLocaleDateString("vi-VN", {
                                                            year: "numeric",
                                                            month: "2-digit",
                                                            day: "2-digit",
                                        });
                    };

                    // Toggle single selection
                    const toggleSelect = (id: number) => {
                                        setSelectedIds(prev =>
                                                            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                                        );
                    };

                    // Toggle all selection (current page)
                    const toggleSelectAll = () => {
                                        const currentPageIds = paginatedCategories.map(c => c.id);
                                        const allSelected = currentPageIds.every(id => selectedIds.includes(id));
                                        if (allSelected) {
                                                            setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
                                        } else {
                                                            const combined = [...selectedIds, ...currentPageIds];
                                                            setSelectedIds(combined.filter((id, index) => combined.indexOf(id) === index));
                                        }
                    };

                    // Check if all on current page are selected
                    const isAllSelected = paginatedCategories.length > 0 &&
                                        paginatedCategories.every(c => selectedIds.includes(c.id));
                    const isSomeSelected = paginatedCategories.some(c => selectedIds.includes(c.id));

                    // Open bulk delete modal
                    const openBulkDeleteModal = () => {
                                        if (selectedIds.length === 0) return;

                                        // Separate categories with and without products
                                        const selectedCats = categories.filter(c => selectedIds.includes(c.id));
                                        const withProducts = selectedCats.filter(c => (c._count?.products || 0) > 0);
                                        const withoutProducts = selectedCats.filter(c => (c._count?.products || 0) === 0);

                                        setCategoriesWithProducts(withProducts);
                                        setDeletableCategories(withoutProducts);
                                        setBulkDeleteProgress({ current: 0, total: withoutProducts.length, failed: 0 });
                                        setBulkDeleteSuccess(false);
                                        setShowBulkDeleteModal(true);
                    };

                    // Confirm bulk delete
                    const confirmBulkDelete = async () => {
                                        if (deletableCategories.length === 0) {
                                                            setBulkDeleteSuccess(true);
                                                            setTimeout(() => {
                                                                                setShowBulkDeleteModal(false);
                                                                                setBulkDeleteSuccess(false);
                                                                                setSelectedIds([]);
                                                            }, 1500);
                                                            return;
                                        }

                                        let failed = 0;
                                        for (let i = 0; i < deletableCategories.length; i++) {
                                                            const cat = deletableCategories[i];
                                                            try {
                                                                                const res = await fetch(`http://localhost:3001/categories/${cat.id}`, {
                                                                                                    method: "DELETE",
                                                                                });
                                                                                if (!res.ok) {
                                                                                                    failed++;
                                                                                }
                                                            } catch {
                                                                                failed++;
                                                            }
                                                            setBulkDeleteProgress({ current: i + 1, total: deletableCategories.length, failed });
                                        }

                                        await fetchCategories();
                                        setSelectedIds([]);
                                        setBulkDeleteSuccess(true);

                                        setTimeout(() => {
                                                            setShowBulkDeleteModal(false);
                                                            setBulkDeleteSuccess(false);
                                        }, 2000);
                    };

                    // Handle parent change with validation
                    const handleParentChange = (parentIdStr: string) => {
                                        const newParentId = parentIdStr ? parseInt(parentIdStr) : null;

                                        if (newParentId === null) {
                                                            setParentError("");
                                                            setFormData({ ...formData, parentId: null });
                                                            return;
                                        }

                                        // Calculate what the new depth would be
                                        const parentDepth = getCategoryDepth(categories.find(c => c.id === newParentId)!);
                                        const newDepth = parentDepth + 1;

                                        // Check if this category has children (when editing)
                                        if (editingCategory) {
                                                            const getMaxChildDepth = (catId: number, currentDepth: number): number => {
                                                                                const children = categories.filter(c => c.parentId === catId);
                                                                                if (children.length === 0) return currentDepth;
                                                                                return Math.max(...children.map(child => getMaxChildDepth(child.id, currentDepth + 1)));
                                                            };

                                                            const maxChildDepth = getMaxChildDepth(editingCategory.id, newDepth);

                                                            if (maxChildDepth > 3) {
                                                                                setParentError(`Không thể chọn danh mục này vì sẽ vượt quá 3 cấp (${maxChildDepth} cấp)`);
                                                                                return;
                                                            }
                                        }

                                        if (newDepth > 3) {
                                                            setParentError(`Không thể chọn danh mục cha cấp ${parentDepth} vì sẽ tạo danh mục cấp ${newDepth} (tối đa 3 cấp)`);
                                                            return;
                                        }

                                        setParentError("");
                                        setFormData({ ...formData, parentId: newParentId });
                    };

                    // Get available parent categories for dropdown
                    const getAvailableParents = () => {
                                        return categories.filter(cat => {
                                                            // Cannot be self
                                                            if (editingCategory && cat.id === editingCategory.id) return false;
                                                            // Must be level 1 or 2 (so new category can be level 2 or 3)
                                                            const depth = getCategoryDepth(cat);
                                                            return depth <= 2;
                                        });
                    };

                    return (
                                        <div className="min-h-screen bg-gray-100">
                                                            {/* Header */}
                                                            <header className="bg-white shadow">
                                                                                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                                                                                                    <div>
                                                                                                                        <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
                                                                                                                        <p className="text-gray-500 text-sm">Thêm, sửa, xóa danh mục sản phẩm (tối đa 3 cấp)</p>
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

                                                            {/* Filter Bar */}
                                                            <div className="max-w-7xl mx-auto px-4 py-4">
                                                                                <div className="bg-white rounded-lg shadow p-4">
                                                                                                    <div className="flex flex-wrap gap-4 items-center">
                                                                                                                        <div className="flex-1 min-w-64">
                                                                                                                                            <div className="relative">
                                                                                                                                                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                                                                                                                                <input
                                                                                                                                                                                    type="text"
                                                                                                                                                                                    placeholder="Tìm kiếm danh mục..."
                                                                                                                                                                                    value={searchQuery}
                                                                                                                                                                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                                                                                                                                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                                                                                                />
                                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div className="flex items-center gap-2">
                                                                                                                                            <span className="text-sm text-gray-500">Sắp xếp:</span>
                                                                                                                                            <select
                                                                                                                                                                value={`${sortField}-${sortOrder}`}
                                                                                                                                                                onChange={(e) => {
                                                                                                                                                                                    const [field, order] = e.target.value.split("-") as [SortField, SortOrder];
                                                                                                                                                                                    setSortField(field);
                                                                                                                                                                                    setSortOrder(order);
                                                                                                                                                                                    setCurrentPage(1);
                                                                                                                                                                }}
                                                                                                                                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                                                                            >
                                                                                                                                                                <option value="id-asc">ID (Tăng dần)</option>
                                                                                                                                                                <option value="id-desc">ID (Giảm dần)</option>
                                                                                                                                                                <option value="name-asc">Tên (A-Z)</option>
                                                                                                                                                                <option value="name-desc">Tên (Z-A)</option>
                                                                                                                                                                <option value="createdAt-asc">Ngày tạo (Cũ nhất)</option>
                                                                                                                                                                <option value="createdAt-desc">Ngày tạo (Mới nhất)</option>
                                                                                                                                                                <option value="productCount-asc">Sản phẩm (Ít nhất)</option>
                                                                                                                                                                <option value="productCount-desc">Sản phẩm (Nhiều nhất)</option>
                                                                                                                                            </select>
                                                                                                                        </div>
                                                                                                    </div>
                                                                                </div>
                                                            </div>

                                                            {/* Selection bar */}
                                                            {selectedIds.length > 0 && (
                                                                                <div className="max-w-7xl mx-auto px-4 pb-2">
                                                                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                                                                                                                        <span className="text-blue-700 font-medium">
                                                                                                                                            Đã chọn {selectedIds.length} danh mục
                                                                                                                        </span>
                                                                                                                        <div className="flex gap-2">
                                                                                                                                            <button
                                                                                                                                                                onClick={() => setSelectedIds([])}
                                                                                                                                                                className="px-3 py-1 text-gray-600 hover:text-gray-800"
                                                                                                                                            >
                                                                                                                                                                Bỏ chọn
                                                                                                                                            </button>
                                                                                                                                            <button
                                                                                                                                                                onClick={openBulkDeleteModal}
                                                                                                                                                                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                                                                                                                            >
                                                                                                                                                                <Trash2 size={16} />
                                                                                                                                                                Xóa đã chọn
                                                                                                                                            </button>
                                                                                                                        </div>
                                                                                                    </div>
                                                                                </div>
                                                            )}

                                                            {/* Categories Table */}
                                                            <main className="max-w-7xl mx-auto px-4 pb-6">
                                                                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                                                                                    <table className="min-w-full divide-y divide-gray-200">
                                                                                                                        <thead className="bg-gray-50">
                                                                                                                                            <tr>
                                                                                                                                                                <th className="px-4 py-3 text-center">
                                                                                                                                                                                    <input
                                                                                                                                                                                                        type="checkbox"
                                                                                                                                                                                                        checked={isAllSelected}
                                                                                                                                                                                                        ref={(el) => {
                                                                                                                                                                                                                            if (el) el.indeterminate = isSomeSelected && !isAllSelected;
                                                                                                                                                                                                        }}
                                                                                                                                                                                                        onChange={toggleSelectAll}
                                                                                                                                                                                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                                                                                                                                    />
                                                                                                                                                                </th>
                                                                                                                                                                <th
                                                                                                                                                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                                                                                                                                                                    onClick={() => handleSort("id")}
                                                                                                                                                                >
                                                                                                                                                                                    ID {sortField === "id" && (sortOrder === "asc" ? "↑" : "↓")}
                                                                                                                                                                </th>
                                                                                                                                                                <th
                                                                                                                                                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                                                                                                                                                                    onClick={() => handleSort("name")}
                                                                                                                                                                >
                                                                                                                                                                                    Tên danh mục {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                                                                                                                                                                </th>
                                                                                                                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                                                                                                                                    Danh mục cha
                                                                                                                                                                </th>
                                                                                                                                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                                                                                                                                                                    Cấp
                                                                                                                                                                </th>
                                                                                                                                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                                                                                                                                                                    Sản phẩm
                                                                                                                                                                </th>
                                                                                                                                                                <th
                                                                                                                                                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                                                                                                                                                                    onClick={() => handleSort("createdAt")}
                                                                                                                                                                >
                                                                                                                                                                                    Ngày tạo {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                                                                                                                                                                </th>
                                                                                                                                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                                                                                                                                                                    Thao tác
                                                                                                                                                                </th>
                                                                                                                                            </tr>
                                                                                                                        </thead>
                                                                                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                                                                                            {paginatedCategories.length === 0 ? (
                                                                                                                                                                <tr>
                                                                                                                                                                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                                                                                                                                                                                        {searchQuery ? "Không tìm thấy danh mục nào" : "Chưa có danh mục nào"}
                                                                                                                                                                                    </td>
                                                                                                                                                                </tr>
                                                                                                                                            ) : (
                                                                                                                                                                paginatedCategories.map((category) => {
                                                                                                                                                                                    const depth = getCategoryDepth(category);
                                                                                                                                                                                    return (
                                                                                                                                                                                                        <tr key={category.id} className={`hover:bg-gray-50 ${selectedIds.includes(category.id) ? 'bg-blue-50' : ''}`}>
                                                                                                                                                                                                                            <td className="px-4 py-4 text-center">
                                                                                                                                                                                                                                                <input
                                                                                                                                                                                                                                                                    type="checkbox"
                                                                                                                                                                                                                                                                    checked={selectedIds.includes(category.id)}
                                                                                                                                                                                                                                                                    onChange={() => toggleSelect(category.id)}
                                                                                                                                                                                                                                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                                                                                                                                                                                                />
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                                                                                                                                                                                                #{category.id}
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                            <td className="px-6 py-4">
                                                                                                                                                                                                                                                <div className="flex items-center gap-2">
                                                                                                                                                                                                                                                                    <div
                                                                                                                                                                                                                                                                                        className={`w-8 h-8 rounded flex items-center justify-center ${depth === 1 ? "bg-blue-100" : depth === 2 ? "bg-green-100" : "bg-orange-100"
                                                                                                                                                                                                                                                                                                            }`}
                                                                                                                                                                                                                                                                    >
                                                                                                                                                                                                                                                                                        <Package
                                                                                                                                                                                                                                                                                                            size={16}
                                                                                                                                                                                                                                                                                                            className={
                                                                                                                                                                                                                                                                                                                                depth === 1 ? "text-blue-600" : depth === 2 ? "text-green-600" : "text-orange-600"
                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                        />
                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                    <div>
                                                                                                                                                                                                                                                                                        <div className="font-medium text-gray-900">{category.name}</div>
                                                                                                                                                                                                                                                                                        {category.parentId && (
                                                                                                                                                                                                                                                                                                            <div className="text-xs text-gray-500">{getCategoryPath(category)}</div>
                                                                                                                                                                                                                                                                                        )}
                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                                                                                                                                                                                {category.parent ? (
                                                                                                                                                                                                                                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                                                                                                                                                                                                                                                                        {category.parent.name}
                                                                                                                                                                                                                                                                    </span>
                                                                                                                                                                                                                                                ) : (
                                                                                                                                                                                                                                                                    <span className="text-gray-400 text-sm">—</span>
                                                                                                                                                                                                                                                )}
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                                                                                                                                                                                                <span
                                                                                                                                                                                                                                                                    className={`px-2 py-1 rounded text-xs font-medium ${depth === 1
                                                                                                                                                                                                                                                                                        ? "bg-blue-100 text-blue-800"
                                                                                                                                                                                                                                                                                        : depth === 2
                                                                                                                                                                                                                                                                                                            ? "bg-green-100 text-green-800"
                                                                                                                                                                                                                                                                                                            : "bg-orange-100 text-orange-800"
                                                                                                                                                                                                                                                                                        }`}
                                                                                                                                                                                                                                                >
                                                                                                                                                                                                                                                                    Cấp {depth}
                                                                                                                                                                                                                                                </span>
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                                                                                                                                                                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                                                                                                                                                                                                                                                    {category._count?.products || 0}
                                                                                                                                                                                                                                                </span>
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                                                                                                                                                                                                {category.createdAt ? formatDate(category.createdAt) : "—"}
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                                                                                                                                                                                                <div className="flex justify-center gap-1">
                                                                                                                                                                                                                                                                    <button
                                                                                                                                                                                                                                                                                        onClick={() => openEditModal(category)}
                                                                                                                                                                                                                                                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                                                                                                                                                                                                                                    >
                                                                                                                                                                                                                                                                                        <Pencil size={16} />
                                                                                                                                                                                                                                                                    </button>
                                                                                                                                                                                                                                                                    <button
                                                                                                                                                                                                                                                                                        onClick={() => openDeleteModal(category)}
                                                                                                                                                                                                                                                                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                                                                                                                                                                                                                                    >
                                                                                                                                                                                                                                                                                        <Trash2 size={16} />
                                                                                                                                                                                                                                                                    </button>
                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                            </td>
                                                                                                                                                                                                        </tr>
                                                                                                                                                                                    );
                                                                                                                                                                })
                                                                                                                                            )}
                                                                                                                        </tbody>
                                                                                                    </table>

                                                                                                    {/* Pagination */}
                                                                                                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                                                                                                        <div className="flex items-center gap-2">
                                                                                                                                            <span className="text-sm text-gray-500">Hiển thị:</span>
                                                                                                                                            <select
                                                                                                                                                                value={pageSize === "all" ? "all" : pageSize}
                                                                                                                                                                onChange={(e) => {
                                                                                                                                                                                    const val = e.target.value;
                                                                                                                                                                                    setPageSize(val === "all" ? "all" : parseInt(val));
                                                                                                                                                                                    setCurrentPage(1);
                                                                                                                                                                }}
                                                                                                                                                                className="px-2 py-1 border border-gray-300 rounded"
                                                                                                                                            >
                                                                                                                                                                <option value="10">10</option>
                                                                                                                                                                <option value="20">20</option>
                                                                                                                                                                <option value="30">30</option>
                                                                                                                                                                <option value="50">50</option>
                                                                                                                                                                <option value="all">Tất cả</option>
                                                                                                                                            </select>
                                                                                                                                            <span className="text-sm text-gray-500">/ {totalCategories} danh mục</span>
                                                                                                                        </div>
                                                                                                                        {pageSize !== "all" && totalPages > 1 && (
                                                                                                                                            <div className="flex items-center gap-2">
                                                                                                                                                                <button
                                                                                                                                                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                                                                                                                                                    disabled={currentPage === 1}
                                                                                                                                                                                    className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                                                                                                                                                                >
                                                                                                                                                                                    <ChevronLeft size={20} />
                                                                                                                                                                </button>
                                                                                                                                                                <span className="text-sm">
                                                                                                                                                                                    Trang {currentPage}/{totalPages}
                                                                                                                                                                </span>
                                                                                                                                                                <button
                                                                                                                                                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                                                                                                                                                    disabled={currentPage === totalPages}
                                                                                                                                                                                    className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                                                                                                                                                                >
                                                                                                                                                                                    <ChevronRight size={20} />
                                                                                                                                                                </button>
                                                                                                                                            </div>
                                                                                                                        )}
                                                                                                    </div>
                                                                                </div>
                                                            </main>

                                                            {/* Add/Edit Modal */}
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

                                                                                                                                            <div>
                                                                                                                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                                    Mô tả (tùy chọn)
                                                                                                                                                                </label>
                                                                                                                                                                <textarea
                                                                                                                                                                                    value={formData.description || ""}
                                                                                                                                                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                                                                                                                                                    placeholder="Mô tả ngắn về danh mục này..."
                                                                                                                                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                                                                                                                                                    rows={3}
                                                                                                                                                                />
                                                                                                                                            </div>

                                                                                                                                            <div>
                                                                                                                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                                    Danh mục cha (tùy chọn)
                                                                                                                                                                </label>
                                                                                                                                                                <select
                                                                                                                                                                                    value={formData.parentId || ""}
                                                                                                                                                                                    onChange={(e) => handleParentChange(e.target.value)}
                                                                                                                                                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${parentError ? 'border-red-500' : 'border-gray-300'}`}
                                                                                                                                                                >
                                                                                                                                                                                    <option value="">— Không có (Cấp 1) —</option>
                                                                                                                                                                                    {getAvailableParents().map((cat: Category) => (
                                                                                                                                                                                                        <option key={cat.id} value={cat.id}>
                                                                                                                                                                                                                            {getCategoryPath(cat)} (Cấp {getCategoryDepth(cat)})
                                                                                                                                                                                                        </option>
                                                                                                                                                                                    ))}
                                                                                                                                                                </select>
                                                                                                                                                                {parentError && (
                                                                                                                                                                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                                                                                                                                                                                        <AlertTriangle size={14} />
                                                                                                                                                                                                        {parentError}
                                                                                                                                                                                    </p>
                                                                                                                                                                )}
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
                                                                                                                                                                                    disabled={loading || !!parentError}
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

                                                            {/* Delete Modal */}
                                                            {showDeleteModal && categoryToDelete && (
                                                                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                                                                                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                                                                                                                        {deleteSuccess ? (
                                                                                                                                            <div className="px-6 py-8 text-center">
                                                                                                                                                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                                                                                                                                    <Check size={32} className="text-green-600" />
                                                                                                                                                                </div>
                                                                                                                                                                <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa thành công!</h3>
                                                                                                                                                                <p className="text-gray-500">Danh mục đã được xóa khỏi hệ thống.</p>
                                                                                                                                            </div>
                                                                                                                        ) : (
                                                                                                                                            <>
                                                                                                                                                                <div className="px-6 pt-6">
                                                                                                                                                                                    <div className="flex items-center gap-3 mb-4">
                                                                                                                                                                                                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                                                                                                                                                                            <AlertTriangle size={24} className="text-red-600" />
                                                                                                                                                                                                        </div>
                                                                                                                                                                                                        <div>
                                                                                                                                                                                                                            <h3 className="text-lg font-bold text-gray-900">Xóa danh mục</h3>
                                                                                                                                                                                                                            <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
                                                                                                                                                                                                        </div>
                                                                                                                                                                                    </div>
                                                                                                                                                                </div>

                                                                                                                                                                <div className="px-6 py-4">
                                                                                                                                                                                    <div className="p-4 bg-gray-50 rounded-xl">
                                                                                                                                                                                                        <div className="flex items-center gap-3">
                                                                                                                                                                                                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                                                                                                                                                                                                <Package size={20} className="text-blue-600" />
                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                            <div>
                                                                                                                                                                                                                                                <h4 className="font-medium text-gray-900">{categoryToDelete.name}</h4>
                                                                                                                                                                                                                                                <p className="text-sm text-gray-500">{categoryToDelete._count?.products || 0} sản phẩm</p>
                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                        </div>
                                                                                                                                                                                    </div>
                                                                                                                                                                </div>

                                                                                                                                                                <div className="px-6 pb-6 flex gap-3">
                                                                                                                                                                                    <button
                                                                                                                                                                                                        onClick={() => {
                                                                                                                                                                                                                            setShowDeleteModal(false);
                                                                                                                                                                                                                            setCategoryToDelete(null);
                                                                                                                                                                                                        }}
                                                                                                                                                                                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                                                                                                                                                                                    >
                                                                                                                                                                                                        Hủy
                                                                                                                                                                                    </button>
                                                                                                                                                                                    <button
                                                                                                                                                                                                        onClick={confirmDelete}
                                                                                                                                                                                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                                                                                                                                                                                    >
                                                                                                                                                                                                        <Trash2 size={18} />
                                                                                                                                                                                                        Xóa danh mục
                                                                                                                                                                                    </button>
                                                                                                                                                                </div>
                                                                                                                                            </>
                                                                                                                        )}
                                                                                                    </div>
                                                                                </div>
                                                            )}

                                                            {/* Bulk Delete Modal */}
                                                            {showBulkDeleteModal && (
                                                                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                                                                                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                                                                                                                        {bulkDeleteSuccess ? (
                                                                                                                                            <div className="px-6 py-8 text-center">
                                                                                                                                                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                                                                                                                                    <Check size={32} className="text-green-600" />
                                                                                                                                                                </div>
                                                                                                                                                                <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa thành công!</h3>
                                                                                                                                                                <p className="text-gray-500">
                                                                                                                                                                                    Đã xóa {bulkDeleteProgress.total - bulkDeleteProgress.failed} danh mục
                                                                                                                                                                                    {bulkDeleteProgress.failed > 0 && `, ${bulkDeleteProgress.failed} thất bại`}
                                                                                                                                                                </p>
                                                                                                                                            </div>
                                                                                                                        ) : bulkDeleteProgress.current > 0 ? (
                                                                                                                                            <div className="px-6 py-8">
                                                                                                                                                                <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Đang xóa...</h3>
                                                                                                                                                                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                                                                                                                                                                    <div
                                                                                                                                                                                                        className="bg-red-600 h-3 rounded-full transition-all"
                                                                                                                                                                                                        style={{ width: `${(bulkDeleteProgress.current / bulkDeleteProgress.total) * 100}%` }}
                                                                                                                                                                                    />
                                                                                                                                                                </div>
                                                                                                                                                                <p className="text-sm text-gray-500 text-center">
                                                                                                                                                                                    {bulkDeleteProgress.current} / {bulkDeleteProgress.total}
                                                                                                                                                                </p>
                                                                                                                                            </div>
                                                                                                                        ) : (
                                                                                                                                            <>
                                                                                                                                                                <div className="px-6 pt-6">
                                                                                                                                                                                    <div className="flex items-center gap-3 mb-4">
                                                                                                                                                                                                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                                                                                                                                                                            <AlertTriangle size={24} className="text-red-600" />
                                                                                                                                                                                                        </div>
                                                                                                                                                                                                        <div>
                                                                                                                                                                                                                            <h3 className="text-lg font-bold text-gray-900">Xóa nhiều danh mục</h3>
                                                                                                                                                                                                                            <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
                                                                                                                                                                                                        </div>
                                                                                                                                                                                    </div>
                                                                                                                                                                </div>

                                                                                                                                                                <div className="px-6 py-4 space-y-3">
                                                                                                                                                                                    {/* Deletable categories */}
                                                                                                                                                                                    <div className="p-4 bg-green-50 rounded-xl">
                                                                                                                                                                                                        <p className="text-sm font-medium text-green-800 mb-1">Có thể xóa:</p>
                                                                                                                                                                                                        <p className="text-2xl font-bold text-green-600">{deletableCategories.length} danh mục</p>
                                                                                                                                                                                    </div>

                                                                                                                                                                                    {/* Categories with products warning */}
                                                                                                                                                                                    {categoriesWithProducts.length > 0 && (
                                                                                                                                                                                                        <div className="p-4 bg-yellow-50 rounded-xl">
                                                                                                                                                                                                                            <p className="text-sm font-medium text-yellow-800 mb-2">Không thể xóa (có sản phẩm):</p>
                                                                                                                                                                                                                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                                                                                                                                                                                                                                {categoriesWithProducts.map(cat => (
                                                                                                                                                                                                                                                                    <div key={cat.id} className="flex justify-between text-sm">
                                                                                                                                                                                                                                                                                        <span className="text-gray-700">{cat.name}</span>
                                                                                                                                                                                                                                                                                        <span className="text-yellow-700">{cat._count?.products || 0} SP</span>
                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                ))}
                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                        </div>
                                                                                                                                                                                    )}
                                                                                                                                                                </div>

                                                                                                                                                                <div className="px-6 pb-6 flex gap-3">
                                                                                                                                                                                    <button
                                                                                                                                                                                                        onClick={() => setShowBulkDeleteModal(false)}
                                                                                                                                                                                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                                                                                                                                                                                    >
                                                                                                                                                                                                        Hủy
                                                                                                                                                                                    </button>
                                                                                                                                                                                    <button
                                                                                                                                                                                                        onClick={confirmBulkDelete}
                                                                                                                                                                                                        disabled={deletableCategories.length === 0}
                                                                                                                                                                                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:bg-gray-400"
                                                                                                                                                                                    >
                                                                                                                                                                                                        <Trash2 size={18} />
                                                                                                                                                                                                        {deletableCategories.length > 0 ? `Xóa ${deletableCategories.length} danh mục` : "Không có gì để xóa"}
                                                                                                                                                                                    </button>
                                                                                                                                                                </div>
                                                                                                                                            </>
                                                                                                                        )}
                                                                                                    </div>
                                                                                </div>
                                                            )}
                                        </div>
                    );
}
