"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, Save, Upload, Image as ImageIcon } from "lucide-react";

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
                    categoryId: number;
                    category: Category;
                    modifiers?: ProductModifier[];
};

type ProductFormData = {
                    name: string;
                    price: number;
                    image: string;
                    categoryId: number;
                    modifierIds: number[];
};

const API_URL = "http://localhost:3001";

export default function ProductsPage() {
                    const [products, setProducts] = useState<Product[]>([]);
                    const [categories, setCategories] = useState<Category[]>([]);
                    const [modifiers, setModifiers] = useState<Modifier[]>([]);
                    const [isModalOpen, setIsModalOpen] = useState(false);
                    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
                    const [formData, setFormData] = useState<ProductFormData>({
                                        name: "",
                                        price: 0,
                                        image: "",
                                        categoryId: 1,
                                        modifierIds: [],
                    });
                    const [loading, setLoading] = useState(false);
                    const [uploading, setUploading] = useState(false);
                    const fileInputRef = useRef<HTMLInputElement>(null);

                    // Fetch products
                    const fetchProducts = async () => {
                                        try {
                                                            const res = await fetch(`${API_URL}/products`);
                                                            const data = await res.json();
                                                            setProducts(data);
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

                    useEffect(() => {
                                        fetchProducts();
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
                                                            alert("Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.");
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
                                                            alert("Không thể tải ảnh lên. Vui lòng thử lại.");
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
                                                            alert("Failed to save product");
                                        } finally {
                                                            setLoading(false);
                                        }
                    };

                    // Handle delete
                    const handleDelete = async (id: number) => {
                                        if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

                                        try {
                                                            const res = await fetch(`${API_URL}/products/${id}`, {
                                                                                method: "DELETE",
                                                            });
                                                            if (!res.ok) {
                                                                                const error = await res.json();
                                                                                alert(error.message || "Không thể xóa sản phẩm");
                                                                                return;
                                                            }
                                                            await fetchProducts();
                                        } catch (e) {
                                                            console.error("Failed to delete product:", e);
                                                            alert("Failed to delete product");
                                        }
                    };

                    return (
                                        <div className="min-h-screen bg-gray-100">
                                                            {/* Header */}
                                                            <header className="bg-white shadow">
                                                                                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
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
                                                            </header>

                                                            {/* Products Grid */}
                                                            <main className="max-w-7xl mx-auto px-4 py-6">
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                                                                    {products.map((product) => (
                                                                                                                        <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition">
                                                                                                                                            {/* Product Image */}
                                                                                                                                            <div className="h-40 bg-gray-100 flex items-center justify-center">
                                                                                                                                                                {product.image ? (
                                                                                                                                                                                    <img
                                                                                                                                                                                                        src={getImageUrl(product.image)}
                                                                                                                                                                                                        alt={product.name}
                                                                                                                                                                                                        className="w-full h-full object-cover"
                                                                                                                                                                                    />
                                                                                                                                                                ) : (
                                                                                                                                                                                    <ImageIcon size={48} className="text-gray-300" />
                                                                                                                                                                )}
                                                                                                                                            </div>
                                                                                                                                            {/* Product Info */}
                                                                                                                                            <div className="p-4">
                                                                                                                                                                <div className="flex justify-between items-start mb-2">
                                                                                                                                                                                    <h3 className="font-bold text-gray-800 line-clamp-1">{product.name}</h3>
                                                                                                                                                                                    <span className="text-green-600 font-bold text-sm whitespace-nowrap ml-2">
                                                                                                                                                                                                        {product.price.toLocaleString("vi-VN")} đ
                                                                                                                                                                                    </span>
                                                                                                                                                                </div>
                                                                                                                                                                <div className="flex items-center justify-between">
                                                                                                                                                                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                                                                                                                                                                                        {product.category?.name || "N/A"}
                                                                                                                                                                                    </span>
                                                                                                                                                                                    <div className="flex gap-1">
                                                                                                                                                                                                        <button
                                                                                                                                                                                                                            onClick={() => openEditModal(product)}
                                                                                                                                                                                                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                                                                                                                                                                        >
                                                                                                                                                                                                                            <Pencil size={16} />
                                                                                                                                                                                                        </button>
                                                                                                                                                                                                        <button
                                                                                                                                                                                                                            onClick={() => handleDelete(product.id)}
                                                                                                                                                                                                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                                                                                                                                                                        >
                                                                                                                                                                                                                            <Trash2 size={16} />
                                                                                                                                                                                                        </button>
                                                                                                                                                                                    </div>
                                                                                                                                                                </div>
                                                                                                                                                                {product.modifiers && product.modifiers.length > 0 && (
                                                                                                                                                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                                                                                                                                                                        {product.modifiers.map((pm) => (
                                                                                                                                                                                                                            <span key={pm.modifierId} className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                                                                                                                                                                                                                                                {pm.modifier.name}
                                                                                                                                                                                                                            </span>
                                                                                                                                                                                                        ))}
                                                                                                                                                                                    </div>
                                                                                                                                                                )}
                                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                    ))}
                                                                                                    {products.length === 0 && (
                                                                                                                        <div className="col-span-full text-center py-12 text-gray-500">
                                                                                                                                            Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.
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
                                        </div>
                    );
}
