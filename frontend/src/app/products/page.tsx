"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Plus, Pencil, Trash2, X, Save, Upload, Image as ImageIcon, Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/Toast";

type Category = {
                    id: number;
                    name: string;
};

type Modifier = {
                    id: number;
                    name: string;
                    options: string;
};

type ProductModifier = {
                    modifierId: number;
                    modifier: Modifier;
};

type Product = {
                    id: number;
                    name: string;
                    price: number;
                    image?: string;
                    status: number; // 0: hidden, 1: visible
                    categoryId: number;
                    category: Category;
                    modifiers?: ProductModifier[];
};

type ProductFormData = {
                    name: string;
                    price: number;
                    image: string;
                    status: number;
                    categoryId: number;
                    modifierIds: number[];
};

const API_URL = "http://localhost:3001";

export default function ProductsPage() {
                    const toast = useToast();
                    const [products, setProducts] = useState<Product[]>([]);
                    const [categories, setCategories] = useState<Category[]>([]);
                    const [modifiers, setModifiers] = useState<Modifier[]>([]);
                    const [isModalOpen, setIsModalOpen] = useState(false);
                    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
                    const [formData, setFormData] = useState<ProductFormData>({
                                        name: "",
                                        price: 0,
                                        image: "",
                                        status: 1,
                                        categoryId: 1,
                                        modifierIds: [],
                    });
                    const [loading, setLoading] = useState(false);
                    const [uploading, setUploading] = useState(false);
                    const fileInputRef = useRef<HTMLInputElement>(null);

                    // Filter and sort states
                    const [searchQuery, setSearchQuery] = useState("");
                    const [filterCategory, setFilterCategory] = useState<number | null>(null);
                    const [sortBy, setSortBy] = useState<"id" | "name" | "price">("id");
                    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

                    // Pagination states
                    const [currentPage, setCurrentPage] = useState(1);
                    const [pageSize, setPageSize] = useState<number | "all">(20);
                    const [totalProducts, setTotalProducts] = useState(0);
                    const [totalPages, setTotalPages] = useState(1);

                    // Delete modal states
                    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
                    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
                    const [deleting, setDeleting] = useState(false);

                    // Debounce search
                    const [debouncedSearch, setDebouncedSearch] = useState("");

                    // Debounce effect for search
                    useEffect(() => {
                                        const timer = setTimeout(() => {
                                                            setDebouncedSearch(searchQuery);
                                                            setCurrentPage(1);
                                        }, 300);
                                        return () => clearTimeout(timer);
                    }, [searchQuery]);

                    // Reset page when filters change
                    useEffect(() => {
                                        setCurrentPage(1);
                    }, [filterCategory, sortBy, sortOrder, pageSize]);

                    // Fetch products with pagination
                    const fetchProducts = async () => {
                                        try {
                                                            const params = new URLSearchParams();
                                                            params.append('page', currentPage.toString());
                                                            if (pageSize !== "all") {
                                                                                params.append('limit', pageSize.toString());
                                                            }
                                                            if (debouncedSearch) {
                                                                                params.append('search', debouncedSearch);
                                                            }
                                                            if (filterCategory !== null) {
                                                                                params.append('categoryId', filterCategory.toString());
                                                            }
                                                            params.append('sortBy', sortBy);
                                                            params.append('sortOrder', sortOrder);

                                                            const res = await fetch(`${API_URL}/products?${params.toString()}`);
                                                            const result = await res.json();
                                                            setProducts(result.data);
                                                            setTotalProducts(result.pagination.total);
                                                            setTotalPages(result.pagination.totalPages);
                                        } catch (e) {
                                                            console.error("Failed to fetch products:", e);
                                        }
                    };

                    // Fetch categories
                    const fetchCategories = async () => {
                                        try {
                                                            const res = await fetch(`${API_URL}/categories`);
                                                            const data = await res.json();
                                                            setCategories(data);
                                        } catch (e) {
                                                            console.error("Failed to fetch categories:", e);
                                        }
                    };

                    // Fetch modifiers
                    const fetchModifiers = async () => {
                                        try {
                                                            const res = await fetch(`${API_URL}/modifiers`);
                                                            const data = await res.json();
                                                            setModifiers(data);
                                        } catch (e) {
                                                            console.error("Failed to fetch modifiers:", e);
                                        }
                    };

                    // Refetch when params change
                    useEffect(() => {
                                        fetchProducts();
                    }, [currentPage, pageSize, debouncedSearch, filterCategory, sortBy, sortOrder]);

                    // Initial fetch for categories and modifiers
                    useEffect(() => {
                                        fetchCategories();
                                        fetchModifiers();
                    }, []);

                    // Open modal for adding
                    const openAddModal = () => {
                                        setEditingProduct(null);
                                        setFormData({
                                                            name: "",
                                                            price: 0,
                                                            image: "",
                                                            status: 1,
                                                            categoryId: categories[0]?.id || 1,
                                                            modifierIds: [],
                                        });
                                        setIsModalOpen(true);
                    };

                    // Open modal for editing
                    const openEditModal = (product: Product) => {
                                        setEditingProduct(product);
                                        setFormData({
                                                            name: product.name,
                                                            price: product.price,
                                                            image: product.image || "",
                                                            status: product.status ?? 1,
                                                            categoryId: product.categoryId,
                                                            modifierIds: product.modifiers?.map((m) => m.modifierId) || [],
                                        });
                                        setIsModalOpen(true);
                    };

                    // Close modal
                    const closeModal = () => {
                                        setIsModalOpen(false);
                                        setEditingProduct(null);
                    };

                    // Toggle modifier selection
                    const toggleModifier = (modifierId: number) => {
                                        setFormData((prev) => ({
                                                            ...prev,
                                                            modifierIds: prev.modifierIds.includes(modifierId)
                                                                                ? prev.modifierIds.filter((id) => id !== modifierId)
                                                                                : [...prev.modifierIds, modifierId],
                                        }));
                    };

                    // Handle image upload - upload to server
                    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        if (file.size > 5 * 1024 * 1024) {
                                                            toast.error("Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.");
                                                            return;
                                        }

                                        setUploading(true);
                                        try {
                                                            const formDataUpload = new FormData();
                                                            formDataUpload.append("file", file);

                                                            const res = await fetch(`${API_URL}/upload/image`, {
                                                                                method: "POST",
                                                                                body: formDataUpload,
                                                            });

                                                            if (!res.ok) {
                                                                                throw new Error("Upload failed");
                                                            }

                                                            const data = await res.json();
                                                            setFormData((prev) => ({
                                                                                ...prev,
                                                                                image: data.url,
                                                            }));
                                        } catch (e) {
                                                            console.error("Failed to upload image:", e);
                                                            toast.error("Không thể tải ảnh lên. Vui lòng thử lại.");
                                        } finally {
                                                            setUploading(false);
                                        }
                    };

                    // Get full image URL
                    const getImageUrl = (imagePath: string) => {
                                        if (!imagePath) return "";
                                        if (imagePath.startsWith("http") || imagePath.startsWith("data:")) {
                                                            return imagePath;
                                        }
                                        return `${API_URL}${imagePath}`;
                    };

                    // Handle form submit
                    const handleSubmit = async (e: React.FormEvent) => {
                                        e.preventDefault();
                                        setLoading(true);

                                        try {
                                                            if (editingProduct) {
                                                                                await fetch(`${API_URL}/products/${editingProduct.id}`, {
                                                                                                    method: "PUT",
                                                                                                    headers: { "Content-Type": "application/json" },
                                                                                                    body: JSON.stringify(formData),
                                                                                });
                                                            } else {
                                                                                await fetch(`${API_URL}/products`, {
                                                                                                    method: "POST",
                                                                                                    headers: { "Content-Type": "application/json" },
                                                                                                    body: JSON.stringify(formData),
                                                                                });
                                                            }

                                                            await fetchProducts();
                                                            closeModal();
                                        } catch (e) {
                                                            console.error("Failed to save product:", e);
                                                            toast.error("Có lỗi xảy ra khi lưu sản phẩm.");
                                        } finally {
                                                            setLoading(false);
                                        }
                    };

                    // Open delete confirmation modal
                    const openDeleteModal = (product: Product) => {
                                        setProductToDelete(product);
                                        setDeleteModalOpen(true);
                    };

                    // Close delete modal
                    const closeDeleteModal = () => {
                                        setDeleteModalOpen(false);
                                        setProductToDelete(null);
                    };

                    // Handle delete
                    const handleDelete = async () => {
                                        if (!productToDelete) return;

                                        setDeleting(true);
                                        try {
                                                            const res = await fetch(`${API_URL}/products/${productToDelete.id}`, {
                                                                                method: "DELETE",
                                                            });
                                                            if (!res.ok) {
                                                                                const error = await res.json();
                                                                                toast.error(error.message || "Không thể xóa sản phẩm");
                                                                                closeDeleteModal();
                                                                                return;
                                                            }
                                                            await fetchProducts();
                                                            toast.success("Đã xóa sản phẩm thành công!");
                                                            closeDeleteModal();
                                        } catch (e) {
                                                            console.error("Failed to delete product:", e);
                                                            toast.error("Có lỗi xảy ra khi xóa sản phẩm.");
                                        } finally {
                                                            setDeleting(false);
                                        }
                    };

                    // Normalize Vietnamese text for search
                    const normalizeVietnamese = (str: string) => {
                                        return str
                                                            .normalize("NFD")
                                                            .replace(/[\u0300-\u036f]/g, "")
                                                            .replace(/đ/g, "d")
                                                            .replace(/Đ/g, "D")
                                                            .toLowerCase();
                    };

                    // Toggle sort
                    const toggleSort = (field: "id" | "name" | "price") => {
                                        if (sortBy === field) {
                                                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                        } else {
                                                            setSortBy(field);
                                                            setSortOrder("asc");
                                        }
                    };

                    return (
                                        <div className="min-h-screen bg-gray-100">
                                                            <header className="bg-white shadow">
                                                                                <div className="max-w-7xl mx-auto px-4 py-4">
                                                                                                    <div className="flex justify-between items-center mb-4">
                                                                                                                        <div className="ml-12">
                                                                                                                                            <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
                                                                                                                                            <p className="text-gray-500 text-sm">Thêm, sửa, xóa sản phẩm</p>
                                                                                                                        </div>
                                                                                                                        <button
                                                                                                                                            onClick={openAddModal}
                                                                                                                                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                                                                                                        >
                                                                                                                                            <Plus size={20} />
                                                                                                                                            Thêm sản phẩm
                                                                                                                        </button>
                                                                                                    </div>

                                                                                                    {/* Search, Filter, Sort Bar */}
                                                                                                    <div className="flex flex-wrap gap-3 items-center ml-12">
                                                                                                                        {/* Search */}
                                                                                                                        <div className="relative flex-1 min-w-[200px] max-w-md">
                                                                                                                                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                                                                                                                            <input
                                                                                                                                                                type="text"
                                                                                                                                                                value={searchQuery}
                                                                                                                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                                                                                                                placeholder="Tìm kiếm sản phẩm hoặc danh mục..."
                                                                                                                                                                className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                                                                            />
                                                                                                                        </div>

                                                                                                                        {/* Category Filter */}
                                                                                                                        <select
                                                                                                                                            value={filterCategory ?? ""}
                                                                                                                                            onChange={(e) => setFilterCategory(e.target.value ? Number(e.target.value) : null)}
                                                                                                                                            className="px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                                                        >
                                                                                                                                            <option value="">Tất cả danh mục</option>
                                                                                                                                            {categories.map((cat) => (
                                                                                                                                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                                                                                                            ))}
                                                                                                                        </select>

                                                                                                                        {/* Sort */}
                                                                                                                        <select
                                                                                                                                            value={`${sortBy}-${sortOrder}`}
                                                                                                                                            onChange={(e) => {
                                                                                                                                                                const [field, order] = e.target.value.split("-");
                                                                                                                                                                setSortBy(field as "id" | "name" | "price");
                                                                                                                                                                setSortOrder(order as "asc" | "desc");
                                                                                                                                            }}
                                                                                                                                            className="px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                                                        >
                                                                                                                                            <option value="id-asc">ID (tăng dần)</option>
                                                                                                                                            <option value="id-desc">ID (giảm dần)</option>
                                                                                                                                            <option value="name-asc">Tên (A-Z)</option>
                                                                                                                                            <option value="name-desc">Tên (Z-A)</option>
                                                                                                                                            <option value="price-asc">Giá (thấp-cao)</option>
                                                                                                                                            <option value="price-desc">Giá (cao-thấp)</option>
                                                                                                                        </select>

                                                                                                                        <span className="text-sm text-gray-500">
                                                                                                                                            {totalProducts} sản phẩm
                                                                                                                        </span>
                                                                                                    </div>
                                                                                </div>
                                                            </header>

                                                            {/* Products Table */}
                                                            <main className="max-w-7xl mx-auto px-4 py-6">
                                                                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                                                                                    <table className="w-full">
                                                                                                                        <thead className="bg-gray-50 border-b">
                                                                                                                                            <tr>
                                                                                                                                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                                                                                                                                                                                    Ảnh
                                                                                                                                                                </th>
                                                                                                                                                                <th
                                                                                                                                                                                    onClick={() => toggleSort("id")}
                                                                                                                                                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-20"
                                                                                                                                                                >
                                                                                                                                                                                    <div className="flex items-center gap-1">
                                                                                                                                                                                                        ID
                                                                                                                                                                                                        {sortBy === "id" && <ArrowUpDown size={14} />}
                                                                                                                                                                                    </div>
                                                                                                                                                                </th>
                                                                                                                                                                <th
                                                                                                                                                                                    onClick={() => toggleSort("name")}
                                                                                                                                                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                                                                                                                                >
                                                                                                                                                                                    <div className="flex items-center gap-1">
                                                                                                                                                                                                        Tên sản phẩm
                                                                                                                                                                                                        {sortBy === "name" && <ArrowUpDown size={14} />}
                                                                                                                                                                                    </div>
                                                                                                                                                                </th>
                                                                                                                                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                                                                                                                    Danh mục
                                                                                                                                                                </th>
                                                                                                                                                                <th
                                                                                                                                                                                    onClick={() => toggleSort("price")}
                                                                                                                                                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                                                                                                                                >
                                                                                                                                                                                    <div className="flex items-center gap-1">
                                                                                                                                                                                                        Giá
                                                                                                                                                                                                        {sortBy === "price" && <ArrowUpDown size={14} />}
                                                                                                                                                                                    </div>
                                                                                                                                                                </th>
                                                                                                                                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                                                                                                                    Trạng thái
                                                                                                                                                                </th>
                                                                                                                                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                                                                                                                    Modifiers
                                                                                                                                                                </th>
                                                                                                                                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                                                                                                                                                                    Thao tác
                                                                                                                                                                </th>
                                                                                                                                            </tr>
                                                                                                                        </thead>
                                                                                                                        <tbody className="divide-y divide-gray-200">
                                                                                                                                            {products.map((product) => (
                                                                                                                                                                <tr key={product.id} className="hover:bg-gray-50">
                                                                                                                                                                                    <td className="px-4 py-3">
                                                                                                                                                                                                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                                                                                                                                                                                                                            {product.image ? (
                                                                                                                                                                                                                                                <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                                                                                                                                                                                                                            ) : (
                                                                                                                                                                                                                                                <ImageIcon size={20} className="text-gray-300" />
                                                                                                                                                                                                                            )}
                                                                                                                                                                                                        </div>
                                                                                                                                                                                    </td>
                                                                                                                                                                                    <td className="px-4 py-3 text-sm text-gray-500">#{product.id}</td>
                                                                                                                                                                                    <td className="px-4 py-3">
                                                                                                                                                                                                        <div className="font-medium text-gray-900">{product.name}</div>
                                                                                                                                                                                    </td>
                                                                                                                                                                                    <td className="px-4 py-3">
                                                                                                                                                                                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                                                                                                                                                                                                            {product.category?.name || "N/A"}
                                                                                                                                                                                                        </span>
                                                                                                                                                                                    </td>
                                                                                                                                                                                    <td className="px-4 py-3">
                                                                                                                                                                                                        <span className="font-bold text-green-600">
                                                                                                                                                                                                                            {product.price.toLocaleString("vi-VN")} đ
                                                                                                                                                                                                        </span>
                                                                                                                                                                                    </td>
                                                                                                                                                                                    <td className="px-4 py-3">
                                                                                                                                                                                                        <span className={`px-2 py-1 text-xs rounded ${product.status === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                                                                                                                                                                            {product.status === 1 ? 'Hiện' : 'Ẩn'}
                                                                                                                                                                                                        </span>
                                                                                                                                                                                    </td>
                                                                                                                                                                                    <td className="px-4 py-3">
                                                                                                                                                                                                        <div className="flex flex-wrap gap-1">
                                                                                                                                                                                                                            {product.modifiers && product.modifiers.length > 0 ? (
                                                                                                                                                                                                                                                product.modifiers.map((pm) => (
                                                                                                                                                                                                                                                                    <span key={pm.modifierId} className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                                                                                                                                                                                                                                                                                        {pm.modifier.name}
                                                                                                                                                                                                                                                                    </span>
                                                                                                                                                                                                                                                ))
                                                                                                                                                                                                                            ) : (
                                                                                                                                                                                                                                                <span className="text-gray-400 text-xs">-</span>
                                                                                                                                                                                                                            )}
                                                                                                                                                                                                        </div>
                                                                                                                                                                                    </td>
                                                                                                                                                                                    <td className="px-4 py-3 text-right">
                                                                                                                                                                                                        <div className="flex justify-end gap-1">
                                                                                                                                                                                                                            <button
                                                                                                                                                                                                                                                onClick={() => openEditModal(product)}
                                                                                                                                                                                                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                                <Pencil size={16} />
                                                                                                                                                                                                                            </button>
                                                                                                                                                                                                                            <button
                                                                                                                                                                                                                                                onClick={() => openDeleteModal(product)}
                                                                                                                                                                                                                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                                <Trash2 size={16} />
                                                                                                                                                                                                                            </button>
                                                                                                                                                                                                        </div>
                                                                                                                                                                                    </td>
                                                                                                                                                                </tr>
                                                                                                                                            ))}
                                                                                                                                            {products.length === 0 && (
                                                                                                                                                                <tr>
                                                                                                                                                                                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                                                                                                                                                                                        {products.length === 0
                                                                                                                                                                                                                            ? "Chưa có sản phẩm nào. Nhấn \"Thêm sản phẩm\" để bắt đầu."
                                                                                                                                                                                                                            : "Không tìm thấy sản phẩm phù hợp."
                                                                                                                                                                                                        }
                                                                                                                                                                                    </td>
                                                                                                                                                                </tr>
                                                                                                                                            )}
                                                                                                                        </tbody>
                                                                                                    </table>

                                                                                                    {/* Pagination */}
                                                                                                    {totalProducts > 0 && (
                                                                                                                        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                                                                                                                                            <div className="flex items-center gap-2">
                                                                                                                                                                <span className="text-sm text-gray-500">Hiển thị:</span>
                                                                                                                                                                <select
                                                                                                                                                                                    value={pageSize}
                                                                                                                                                                                    onChange={(e) => setPageSize(e.target.value === "all" ? "all" : Number(e.target.value))}
                                                                                                                                                                                    className="px-2 py-1 border rounded text-sm"
                                                                                                                                                                >
                                                                                                                                                                                    <option value={10}>10</option>
                                                                                                                                                                                    <option value={20}>20</option>
                                                                                                                                                                                    <option value={30}>30</option>
                                                                                                                                                                                    <option value={50}>50</option>
                                                                                                                                                                                    <option value="all">Tất cả</option>
                                                                                                                                                                </select>
                                                                                                                                                                <span className="text-sm text-gray-500">
                                                                                                                                                                                    / {totalProducts} sản phẩm
                                                                                                                                                                </span>
                                                                                                                                            </div>

                                                                                                                                            {pageSize !== "all" && totalPages > 1 && (
                                                                                                                                                                <div className="flex items-center gap-2">
                                                                                                                                                                                    <button
                                                                                                                                                                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                                                                                                                                                                        disabled={currentPage === 1}
                                                                                                                                                                                                        className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                                                                                                                    >
                                                                                                                                                                                                        <ChevronLeft size={18} />
                                                                                                                                                                                    </button>
                                                                                                                                                                                    <span className="text-sm">
                                                                                                                                                                                                        Trang {currentPage} / {totalPages}
                                                                                                                                                                                    </span>
                                                                                                                                                                                    <button
                                                                                                                                                                                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                                                                                                                                                                        disabled={currentPage === totalPages}
                                                                                                                                                                                                        className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                                                                                                                    >
                                                                                                                                                                                                        <ChevronRight size={18} />
                                                                                                                                                                                    </button>
                                                                                                                                                                </div>
                                                                                                                                            )}
                                                                                                                        </div>
                                                                                                    )}
                                                                                </div>
                                                            </main>

                                                            {/* Modal */}
                                                            {isModalOpen && (
                                                                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                                                                                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                                                                                                                        <div className="flex justify-between items-center mb-4">
                                                                                                                                            <h2 className="text-xl font-bold">
                                                                                                                                                                {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
                                                                                                                                            </h2>
                                                                                                                                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                                                                                                                                                <X size={24} />
                                                                                                                                            </button>
                                                                                                                        </div>

                                                                                                                        <form onSubmit={handleSubmit} className="space-y-4">
                                                                                                                                            {/* Image Upload */}
                                                                                                                                            <div>
                                                                                                                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                                                                                                                    Ảnh sản phẩm
                                                                                                                                                                </label>
                                                                                                                                                                <div
                                                                                                                                                                                    onClick={() => !uploading && fileInputRef.current?.click()}
                                                                                                                                                                                    className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition ${uploading ? 'opacity-50' : ''}`}
                                                                                                                                                                >
                                                                                                                                                                                    {formData.image ? (
                                                                                                                                                                                                        <img
                                                                                                                                                                                                                            src={getImageUrl(formData.image)}
                                                                                                                                                                                                                            alt="Preview"
                                                                                                                                                                                                                            className="w-32 h-32 object-cover mx-auto rounded"
                                                                                                                                                                                                        />
                                                                                                                                                                                    ) : (
                                                                                                                                                                                                        <div className="py-4">
                                                                                                                                                                                                                            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                                                                                                                                                                                                            <p className="text-sm text-gray-500">
                                                                                                                                                                                                                                                {uploading ? "Đang tải lên..." : "Click để tải ảnh lên"}
                                                                                                                                                                                                                            </p>
                                                                                                                                                                                                                            <p className="text-xs text-gray-400">Tối đa 5MB</p>
                                                                                                                                                                                                        </div>
                                                                                                                                                                                    )}
                                                                                                                                                                </div>
                                                                                                                                                                <input
                                                                                                                                                                                    ref={fileInputRef}
                                                                                                                                                                                    type="file"
                                                                                                                                                                                    accept="image/*"
                                                                                                                                                                                    onChange={handleImageUpload}
                                                                                                                                                                                    className="hidden"
                                                                                                                                                                />
                                                                                                                                                                {formData.image && (
                                                                                                                                                                                    <button
                                                                                                                                                                                                        type="button"
                                                                                                                                                                                                        onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                                                                                                                                                                                                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                                                                                                                                                                                    >
                                                                                                                                                                                                        Xóa ảnh
                                                                                                                                                                                    </button>
                                                                                                                                                                )}
                                                                                                                                            </div>

                                                                                                                                            <div>
                                                                                                                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                                    Tên sản phẩm
                                                                                                                                                                </label>
                                                                                                                                                                <input
                                                                                                                                                                                    type="text"
                                                                                                                                                                                    value={formData.name}
                                                                                                                                                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                                                                                                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                                                                                                                    required
                                                                                                                                                                />
                                                                                                                                            </div>

                                                                                                                                            <div>
                                                                                                                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                                    Giá (VNĐ)
                                                                                                                                                                </label>
                                                                                                                                                                <input
                                                                                                                                                                                    type="number"
                                                                                                                                                                                    value={formData.price}
                                                                                                                                                                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                                                                                                                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                                                                                                                    required
                                                                                                                                                                                    min={0}
                                                                                                                                                                />
                                                                                                                                            </div>

                                                                                                                                            <div>
                                                                                                                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                                    Danh mục
                                                                                                                                                                </label>
                                                                                                                                                                <select
                                                                                                                                                                                    value={formData.categoryId}
                                                                                                                                                                                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                                                                                                                                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                                                                                                >
                                                                                                                                                                                    {categories.map((cat) => (
                                                                                                                                                                                                        <option key={cat.id} value={cat.id}>
                                                                                                                                                                                                                            {cat.name}
                                                                                                                                                                                                        </option>
                                                                                                                                                                                    ))}
                                                                                                                                                                </select>
                                                                                                                                            </div>

                                                                                                                                            {/* Status Toggle */}
                                                                                                                                            <div className="flex items-center justify-between">
                                                                                                                                                                <label className="block text-sm font-medium text-gray-700">
                                                                                                                                                                                    Trạng thái hiển thị
                                                                                                                                                                </label>
                                                                                                                                                                <button
                                                                                                                                                                                    type="button"
                                                                                                                                                                                    onClick={() => setFormData({ ...formData, status: formData.status === 1 ? 0 : 1 })}
                                                                                                                                                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.status === 1 ? 'bg-green-500' : 'bg-gray-300'}`}
                                                                                                                                                                >
                                                                                                                                                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.status === 1 ? 'translate-x-6' : 'translate-x-1'}`} />
                                                                                                                                                                </button>
                                                                                                                                                                <span className={`text-sm font-medium ${formData.status === 1 ? 'text-green-600' : 'text-gray-500'}`}>
                                                                                                                                                                                    {formData.status === 1 ? 'Hiện' : 'Ẩn'}
                                                                                                                                                                </span>
                                                                                                                                            </div>

                                                                                                                                            {/* Modifiers Selection */}
                                                                                                                                            <div>
                                                                                                                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                                                                                                                    Modifiers
                                                                                                                                                                </label>
                                                                                                                                                                <div className="space-y-2 border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                                                                                                                                                                                    {modifiers.length === 0 ? (
                                                                                                                                                                                                        <p className="text-gray-400 text-sm">Chưa có modifier nào</p>
                                                                                                                                                                                    ) : (
                                                                                                                                                                                                        modifiers.map((modifier) => (
                                                                                                                                                                                                                            <label key={modifier.id} className="flex items-center gap-2 cursor-pointer">
                                                                                                                                                                                                                                                <input
                                                                                                                                                                                                                                                                    type="checkbox"
                                                                                                                                                                                                                                                                    checked={formData.modifierIds.includes(modifier.id)}
                                                                                                                                                                                                                                                                    onChange={() => toggleModifier(modifier.id)}
                                                                                                                                                                                                                                                                    className="w-4 h-4 text-blue-600 rounded"
                                                                                                                                                                                                                                                />
                                                                                                                                                                                                                                                <span className="text-sm">{modifier.name}</span>
                                                                                                                                                                                                                            </label>
                                                                                                                                                                                                        ))
                                                                                                                                                                                    )}
                                                                                                                                                                </div>
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
                                                                                                                                                                                    disabled={loading || uploading}
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

                                                            {/* Delete Confirmation Modal */}
                                                            {deleteModalOpen && productToDelete && (
                                                                                <div className="fixed inset-0 z-50 flex items-center justify-center">
                                                                                                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDeleteModal}></div>
                                                                                                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
                                                                                                                        {/* Header with warning icon */}
                                                                                                                        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-center">
                                                                                                                                            <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-4">
                                                                                                                                                                <Trash2 size={32} className="text-white" />
                                                                                                                                            </div>
                                                                                                                                            <h3 className="text-xl font-bold text-white">Xác nhận xóa sản phẩm</h3>
                                                                                                                        </div>

                                                                                                                        {/* Product info */}
                                                                                                                        <div className="px-6 py-6">
                                                                                                                                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
                                                                                                                                                                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                                                                                                                                                    {productToDelete.image ? (
                                                                                                                                                                                                        <img src={getImageUrl(productToDelete.image)} alt={productToDelete.name} className="w-full h-full object-cover" />
                                                                                                                                                                                    ) : (
                                                                                                                                                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                                                                                                                                                                            <ImageIcon size={24} className="text-gray-400" />
                                                                                                                                                                                                        </div>
                                                                                                                                                                                    )}
                                                                                                                                                                </div>
                                                                                                                                                                <div className="flex-1 min-w-0">
                                                                                                                                                                                    <p className="font-semibold text-gray-900 truncate">{productToDelete.name}</p>
                                                                                                                                                                                    <p className="text-sm text-gray-500">{productToDelete.category?.name}</p>
                                                                                                                                                                                    <p className="text-sm font-medium text-green-600">{productToDelete.price.toLocaleString('vi-VN')} đ</p>
                                                                                                                                                                </div>
                                                                                                                                            </div>

                                                                                                                                            <p className="text-center text-gray-600 mb-6">
                                                                                                                                                                Bạn có chắc chắn muốn xóa sản phẩm này?<br />
                                                                                                                                                                <span className="text-red-500 font-medium">Hành động này không thể hoàn tác.</span>
                                                                                                                                            </p>

                                                                                                                                            {/* Action buttons */}
                                                                                                                                            <div className="flex gap-3">
                                                                                                                                                                <button
                                                                                                                                                                                    onClick={closeDeleteModal}
                                                                                                                                                                                    disabled={deleting}
                                                                                                                                                                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                                                                                                                                                                >
                                                                                                                                                                                    Hủy bỏ
                                                                                                                                                                </button>
                                                                                                                                                                <button
                                                                                                                                                                                    onClick={handleDelete}
                                                                                                                                                                                    disabled={deleting}
                                                                                                                                                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:bg-red-400"
                                                                                                                                                                >
                                                                                                                                                                                    <Trash2 size={18} />
                                                                                                                                                                                    {deleting ? "Đang xóa..." : "Xóa sản phẩm"}
                                                                                                                                                                </button>
                                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                    </div>
                                                                                </div>
                                                            )}
                                        </div>
                    );
}
