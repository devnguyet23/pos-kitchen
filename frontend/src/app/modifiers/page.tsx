"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";

type Modifier = {
                    id: number;
                    name: string;
                    options: string;
};

type ModifierFormData = {
                    name: string;
                    options: string[];
};

export default function ModifiersPage() {
                    const [modifiers, setModifiers] = useState<Modifier[]>([]);
                    const [isModalOpen, setIsModalOpen] = useState(false);
                    const [editingModifier, setEditingModifier] = useState<Modifier | null>(null);
                    const [formData, setFormData] = useState<ModifierFormData>({
                                        name: "",
                                        options: [""],
                    });
                    const [loading, setLoading] = useState(false);

                    // Fetch modifiers
                    const fetchModifiers = async () => {
                                        try {
                                                            const token = localStorage.getItem('accessToken');
                                                            const headers: Record<string, string> = {};
                                                            if (token) {
                                                                                headers["Authorization"] = `Bearer ${token}`;
                                                            }
                                                            const res = await fetch("http://localhost:3001/modifiers", { headers });
                                                            if (!res.ok) {
                                                                                setModifiers([]);
                                                                                return;
                                                            }
                                                            const data = await res.json();
                                                            setModifiers(Array.isArray(data) ? data : []);
                                        } catch (e) {
                                                            console.error("Failed to fetch modifiers:", e);
                                                            setModifiers([]);
                                        }
                    };

                    useEffect(() => {
                                        fetchModifiers();
                    }, []);

                    // Parse options string to array
                    const parseOptions = (optionsStr: string): string[] => {
                                        try {
                                                            return JSON.parse(optionsStr);
                                        } catch {
                                                            return [];
                                        }
                    };

                    // Open modal for adding
                    const openAddModal = () => {
                                        setEditingModifier(null);
                                        setFormData({ name: "", options: [""] });
                                        setIsModalOpen(true);
                    };

                    // Open modal for editing
                    const openEditModal = (modifier: Modifier) => {
                                        setEditingModifier(modifier);
                                        setFormData({
                                                            name: modifier.name,
                                                            options: parseOptions(modifier.options),
                                        });
                                        setIsModalOpen(true);
                    };

                    // Close modal
                    const closeModal = () => {
                                        setIsModalOpen(false);
                                        setEditingModifier(null);
                    };

                    // Add new option field
                    const addOption = () => {
                                        setFormData((prev) => ({
                                                            ...prev,
                                                            options: [...prev.options, ""],
                                        }));
                    };

                    // Remove option field
                    const removeOption = (index: number) => {
                                        setFormData((prev) => ({
                                                            ...prev,
                                                            options: prev.options.filter((_, i) => i !== index),
                                        }));
                    };

                    // Update option value
                    const updateOption = (index: number, value: string) => {
                                        setFormData((prev) => ({
                                                            ...prev,
                                                            options: prev.options.map((opt, i) => (i === index ? value : opt)),
                                        }));
                    };

                    // Handle form submit
                    const handleSubmit = async (e: React.FormEvent) => {
                                        e.preventDefault();
                                        setLoading(true);

                                        // Filter out empty options and convert to JSON string
                                        const filteredOptions = formData.options.filter((opt) => opt.trim() !== "");
                                        const payload = {
                                                            name: formData.name,
                                                            options: JSON.stringify(filteredOptions),
                                        };

                                        const token = localStorage.getItem('accessToken');
                                        const headers: Record<string, string> = { "Content-Type": "application/json" };
                                        if (token) {
                                                            headers["Authorization"] = `Bearer ${token}`;
                                        }

                                        try {
                                                            if (editingModifier) {
                                                                                await fetch(`http://localhost:3001/modifiers/${editingModifier.id}`, {
                                                                                                    method: "PUT",
                                                                                                    headers,
                                                                                                    body: JSON.stringify(payload),
                                                                                });
                                                            } else {
                                                                                await fetch("http://localhost:3001/modifiers", {
                                                                                                    method: "POST",
                                                                                                    headers,
                                                                                                    body: JSON.stringify(payload),
                                                                                });
                                                            }

                                                            await fetchModifiers();
                                                            closeModal();
                                        } catch (e) {
                                                            console.error("Failed to save modifier:", e);
                                                            alert("Failed to save modifier");
                                        } finally {
                                                            setLoading(false);
                                        }
                    };

                    // Handle delete
                    const handleDelete = async (id: number) => {
                                        if (!confirm("Bạn có chắc muốn xóa modifier này?")) return;

                                        const token = localStorage.getItem('accessToken');
                                        const headers: Record<string, string> = {};
                                        if (token) {
                                                            headers["Authorization"] = `Bearer ${token}`;
                                        }

                                        try {
                                                            const res = await fetch(`http://localhost:3001/modifiers/${id}`, {
                                                                                method: "DELETE",
                                                                                headers,
                                                            });
                                                            if (!res.ok) {
                                                                                const error = await res.json();
                                                                                alert(error.message || "Không thể xóa modifier");
                                                                                return;
                                                            }
                                                            await fetchModifiers();
                                        } catch (e) {
                                                            console.error("Failed to delete modifier:", e);
                                                            alert("Failed to delete modifier");
                                        }
                    };

                    return (
                                        <div className="min-h-screen bg-gray-100">
                                                            {/* Header */}
                                                            <header className="bg-white shadow">
                                                                                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                                                                                                    <div>
                                                                                                                        <h1 className="text-2xl font-bold text-gray-800">Quản lý Modifiers</h1>
                                                                                                                        <p className="text-gray-500 text-sm">Sugar Level, Ice Level, Topping, etc.</p>
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
                                                                                                                                            Thêm Modifier
                                                                                                                        </button>
                                                                                                    </div>
                                                                                </div>
                                                            </header>

                                                            {/* Modifiers Grid */}
                                                            <main className="max-w-7xl mx-auto px-4 py-6">
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                                                    {modifiers.map((modifier) => (
                                                                                                                        <div key={modifier.id} className="bg-white rounded-lg shadow p-4">
                                                                                                                                            <div className="flex justify-between items-start mb-3">
                                                                                                                                                                <h3 className="font-bold text-lg text-gray-800">{modifier.name}</h3>
                                                                                                                                                                <div className="flex gap-2">
                                                                                                                                                                                    <button
                                                                                                                                                                                                        onClick={() => openEditModal(modifier)}
                                                                                                                                                                                                        className="text-blue-600 hover:text-blue-800"
                                                                                                                                                                                    >
                                                                                                                                                                                                        <Pencil size={18} />
                                                                                                                                                                                    </button>
                                                                                                                                                                                    <button
                                                                                                                                                                                                        onClick={() => handleDelete(modifier.id)}
                                                                                                                                                                                                        className="text-red-600 hover:text-red-800"
                                                                                                                                                                                    >
                                                                                                                                                                                                        <Trash2 size={18} />
                                                                                                                                                                                    </button>
                                                                                                                                                                </div>
                                                                                                                                            </div>
                                                                                                                                            <div className="flex flex-wrap gap-2">
                                                                                                                                                                {parseOptions(modifier.options).map((opt, idx) => (
                                                                                                                                                                                    <span
                                                                                                                                                                                                        key={idx}
                                                                                                                                                                                                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                                                                                                                                                                    >
                                                                                                                                                                                                        {opt}
                                                                                                                                                                                    </span>
                                                                                                                                                                ))}
                                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                    ))}
                                                                                                    {modifiers.length === 0 && (
                                                                                                                        <div className="col-span-full text-center py-12 text-gray-500">
                                                                                                                                            Chưa có modifier nào. Nhấn "Thêm Modifier" để bắt đầu.
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
                                                                                                                                                                {editingModifier ? "Sửa Modifier" : "Thêm Modifier mới"}
                                                                                                                                            </h2>
                                                                                                                                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                                                                                                                                                <X size={24} />
                                                                                                                                            </button>
                                                                                                                        </div>

                                                                                                                        <form onSubmit={handleSubmit} className="space-y-4">
                                                                                                                                            <div>
                                                                                                                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                                    Tên Modifier
                                                                                                                                                                </label>
                                                                                                                                                                <input
                                                                                                                                                                                    type="text"
                                                                                                                                                                                    value={formData.name}
                                                                                                                                                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                                                                                                                                                    placeholder="Ví dụ: Sugar Level, Ice Level"
                                                                                                                                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                                                                                                                    required
                                                                                                                                                                />
                                                                                                                                            </div>

                                                                                                                                            <div>
                                                                                                                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                                                                                                                    Các tùy chọn (Options)
                                                                                                                                                                </label>
                                                                                                                                                                <div className="space-y-2">
                                                                                                                                                                                    {formData.options.map((opt, index) => (
                                                                                                                                                                                                        <div key={index} className="flex gap-2">
                                                                                                                                                                                                                            <input
                                                                                                                                                                                                                                                type="text"
                                                                                                                                                                                                                                                value={opt}
                                                                                                                                                                                                                                                onChange={(e) => updateOption(index, e.target.value)}
                                                                                                                                                                                                                                                placeholder={`Option ${index + 1}`}
                                                                                                                                                                                                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                                                                                                                                                            />
                                                                                                                                                                                                                            {formData.options.length > 1 && (
                                                                                                                                                                                                                                                <button
                                                                                                                                                                                                                                                                    type="button"
                                                                                                                                                                                                                                                                    onClick={() => removeOption(index)}
                                                                                                                                                                                                                                                                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                                                                                                                                                                                                                >
                                                                                                                                                                                                                                                                    <X size={18} />
                                                                                                                                                                                                                                                </button>
                                                                                                                                                                                                                            )}
                                                                                                                                                                                                        </div>
                                                                                                                                                                                    ))}
                                                                                                                                                                </div>
                                                                                                                                                                <button
                                                                                                                                                                                    type="button"
                                                                                                                                                                                    onClick={addOption}
                                                                                                                                                                                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                                                                                                                                                >
                                                                                                                                                                                    <Plus size={16} />
                                                                                                                                                                                    Thêm option
                                                                                                                                                                </button>
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
