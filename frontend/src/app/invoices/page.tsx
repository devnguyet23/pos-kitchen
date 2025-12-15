"use client";

import { useEffect, useState } from "react";
import { Search, FileText, Calendar, DollarSign, Package } from "lucide-react";

type OrderItem = {
                    id: number;
                    quantity: number;
                    product: {
                                        id: number;
                                        name: string;
                                        price: number;
                    };
};

type Order = {
                    id: number;
                    total: number;
                    status: string;
                    items: OrderItem[];
                    table?: {
                                        id: number;
                                        name: string;
                    };
                    createdAt: string;
};

type Invoice = {
                    id: number;
                    orderId: number;
                    subtotal: number;
                    serviceCharge: number;
                    tax: number;
                    total: number;
                    paymentMethod: string;
                    createdAt: string;
                    order: Order;
};

export default function InvoicesPage() {
                    const [invoices, setInvoices] = useState<Invoice[]>([]);
                    const [loading, setLoading] = useState(false);
                    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

                    // Date filter states
                    const [filterType, setFilterType] = useState<"all" | "day" | "month" | "year">("all");
                    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
                    const [selectedMonth, setSelectedMonth] = useState(
                                        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
                    );
                    const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

                    const fetchInvoices = async () => {
                                        setLoading(true);
                                        let url = "http://localhost:3001/invoices";

                                        if (filterType === "day") {
                                                            const from = `${selectedDate}T00:00:00.000Z`;
                                                            const to = `${selectedDate}T23:59:59.999Z`;
                                                            url += `?from=${from}&to=${to}`;
                                        } else if (filterType === "month") {
                                                            const [year, month] = selectedMonth.split("-");
                                                            const from = `${year}-${month}-01T00:00:00.000Z`;
                                                            const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
                                                            const to = `${year}-${month}-${lastDay}T23:59:59.999Z`;
                                                            url += `?from=${from}&to=${to}`;
                                        } else if (filterType === "year") {
                                                            const from = `${selectedYear}-01-01T00:00:00.000Z`;
                                                            const to = `${selectedYear}-12-31T23:59:59.999Z`;
                                                            url += `?from=${from}&to=${to}`;
                                        }

                                        try {
                                                            const res = await fetch(url);
                                                            const data = await res.json();
                                                            setInvoices(data);
                                        } catch (e) {
                                                            console.error("Failed to fetch invoices:", e);
                                        } finally {
                                                            setLoading(false);
                                        }
                    };

                    useEffect(() => {
                                        fetchInvoices();
                    }, [filterType, selectedDate, selectedMonth, selectedYear]);

                    const formatDate = (dateStr: string) => {
                                        return new Date(dateStr).toLocaleString("vi-VN", {
                                                            year: "numeric",
                                                            month: "2-digit",
                                                            day: "2-digit",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                        });
                    };

                    const formatCurrency = (amount: number) => {
                                        return amount.toLocaleString("vi-VN") + " đ";
                    };

                    // Stats
                    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
                    const totalInvoices = invoices.length;

                    return (
                                        <div className="min-h-screen bg-gray-100">
                                                            {/* Header */}
                                                            <header className="bg-white shadow">
                                                                                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                                                                                                    <div>
                                                                                                                        <h1 className="text-2xl font-bold text-gray-800">Danh sách hoá đơn</h1>
                                                                                                                        <p className="text-gray-500 text-sm">Xem và tìm kiếm hoá đơn</p>
                                                                                                    </div>
                                                                                                    <a href="/retail" className="px-4 py-2 text-gray-600 hover:text-blue-600">
                                                                                                                        ← Lên đơn
                                                                                                    </a>
                                                                                </div>
                                                            </header>

                                                            {/* Filter Section */}
                                                            <div className="max-w-7xl mx-auto px-4 py-4">
                                                                                <div className="bg-white rounded-lg shadow p-4">
                                                                                                    <div className="flex flex-wrap items-center gap-4">
                                                                                                                        <div className="flex items-center gap-2">
                                                                                                                                            <Calendar size={20} className="text-gray-500" />
                                                                                                                                            <span className="font-medium">Lọc theo:</span>
                                                                                                                        </div>

                                                                                                                        <div className="flex gap-2">
                                                                                                                                            {[
                                                                                                                                                                { value: "all", label: "Tất cả" },
                                                                                                                                                                { value: "day", label: "Ngày" },
                                                                                                                                                                { value: "month", label: "Tháng" },
                                                                                                                                                                { value: "year", label: "Năm" },
                                                                                                                                            ].map((option) => (
                                                                                                                                                                <button
                                                                                                                                                                                    key={option.value}
                                                                                                                                                                                    onClick={() => setFilterType(option.value as any)}
                                                                                                                                                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition
                    ${filterType === option.value
                                                                                                                                                                                                                            ? "bg-blue-600 text-white"
                                                                                                                                                                                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                                                                                                                                                                        }`}
                                                                                                                                                                >
                                                                                                                                                                                    {option.label}
                                                                                                                                                                </button>
                                                                                                                                            ))}
                                                                                                                        </div>

                                                                                                                        {filterType === "day" && (
                                                                                                                                            <input
                                                                                                                                                                type="date"
                                                                                                                                                                value={selectedDate}
                                                                                                                                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                                                                                                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                                                                            />
                                                                                                                        )}

                                                                                                                        {filterType === "month" && (
                                                                                                                                            <input
                                                                                                                                                                type="month"
                                                                                                                                                                value={selectedMonth}
                                                                                                                                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                                                                                                                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                                                                            />
                                                                                                                        )}

                                                                                                                        {filterType === "year" && (
                                                                                                                                            <select
                                                                                                                                                                value={selectedYear}
                                                                                                                                                                onChange={(e) => setSelectedYear(e.target.value)}
                                                                                                                                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                                                                            >
                                                                                                                                                                {[2023, 2024, 2025, 2026].map((year) => (
                                                                                                                                                                                    <option key={year} value={year}>
                                                                                                                                                                                                        {year}
                                                                                                                                                                                    </option>
                                                                                                                                                                ))}
                                                                                                                                            </select>
                                                                                                                        )}
                                                                                                    </div>
                                                                                </div>
                                                            </div>

                                                            {/* Stats */}
                                                            <div className="max-w-7xl mx-auto px-4 pb-4">
                                                                                <div className="grid grid-cols-2 gap-4">
                                                                                                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                                                                                                                        <div className="text-gray-500 text-sm">Tổng doanh thu</div>
                                                                                                                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
                                                                                                    </div>
                                                                                                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                                                                                                                        <div className="text-gray-500 text-sm">Số hoá đơn</div>
                                                                                                                        <div className="text-2xl font-bold text-blue-600">{totalInvoices}</div>
                                                                                                    </div>
                                                                                </div>
                                                            </div>

                                                            {/* Invoice List */}
                                                            <main className="max-w-7xl mx-auto px-4 pb-6">
                                                                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                                                                                    <table className="min-w-full divide-y divide-gray-200">
                                                                                                                        <thead className="bg-gray-50">
                                                                                                                                            <tr>
                                                                                                                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                                                                                                                                    Mã HĐ
                                                                                                                                                                </th>
                                                                                                                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                                                                                                                                    Thời gian
                                                                                                                                                                </th>
                                                                                                                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                                                                                                                                    Bàn/Order
                                                                                                                                                                </th>
                                                                                                                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                                                                                                                                                    Tổng tiền
                                                                                                                                                                </th>
                                                                                                                                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                                                                                                                                                                    Thanh toán
                                                                                                                                                                </th>
                                                                                                                                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                                                                                                                                                                    Chi tiết
                                                                                                                                                                </th>
                                                                                                                                            </tr>
                                                                                                                        </thead>
                                                                                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                                                                                            {loading ? (
                                                                                                                                                                <tr>
                                                                                                                                                                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                                                                                                                                                                        Đang tải...
                                                                                                                                                                                    </td>
                                                                                                                                                                </tr>
                                                                                                                                            ) : invoices.length === 0 ? (
                                                                                                                                                                <tr>
                                                                                                                                                                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                                                                                                                                                                        Không có hoá đơn nào trong khoảng thời gian này
                                                                                                                                                                                    </td>
                                                                                                                                                                </tr>
                                                                                                                                            ) : (
                                                                                                                                                                invoices.map((invoice) => (
                                                                                                                                                                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                                                                                                                                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                                                                                                                                                                            <div className="flex items-center gap-2">
                                                                                                                                                                                                                                                <FileText size={16} className="text-blue-500" />
                                                                                                                                                                                                                                                <span className="font-medium">#{invoice.id}</span>
                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                        </td>
                                                                                                                                                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                                                                                                                                                                                            {formatDate(invoice.createdAt)}
                                                                                                                                                                                                        </td>
                                                                                                                                                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                                                                                                                                                                            {invoice.order.table ? (
                                                                                                                                                                                                                                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                                                                                                                                                                                                                                                                    {invoice.order.table.name}
                                                                                                                                                                                                                                                </span>
                                                                                                                                                                                                                            ) : (
                                                                                                                                                                                                                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                                                                                                                                                                                                                                                                    Retail #{invoice.orderId}
                                                                                                                                                                                                                                                </span>
                                                                                                                                                                                                                            )}
                                                                                                                                                                                                        </td>
                                                                                                                                                                                                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-green-600">
                                                                                                                                                                                                                            {formatCurrency(invoice.total)}
                                                                                                                                                                                                        </td>
                                                                                                                                                                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                                                                                                                                                                            <span
                                                                                                                                                                                                                                                className={`px-2 py-1 rounded text-xs font-medium ${invoice.paymentMethod === "CASH"
                                                                                                                                                                                                                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                                                                                                                                                                                                                    : invoice.paymentMethod === "CARD"
                                                                                                                                                                                                                                                                                        ? "bg-blue-100 text-blue-800"
                                                                                                                                                                                                                                                                                        : "bg-green-100 text-green-800"
                                                                                                                                                                                                                                                                    }`}
                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                                {invoice.paymentMethod}
                                                                                                                                                                                                                            </span>
                                                                                                                                                                                                        </td>
                                                                                                                                                                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                                                                                                                                                                            <button
                                                                                                                                                                                                                                                onClick={() => setSelectedInvoice(invoice)}
                                                                                                                                                                                                                                                className="text-blue-600 hover:text-blue-800"
                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                                <Search size={18} />
                                                                                                                                                                                                                            </button>
                                                                                                                                                                                                        </td>
                                                                                                                                                                                    </tr>
                                                                                                                                                                ))
                                                                                                                                            )}
                                                                                                                        </tbody>
                                                                                                    </table>
                                                                                </div>
                                                            </main>

                                                            {/* Invoice Detail Modal */}
                                                            {selectedInvoice && (
                                                                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                                                                                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                                                                                                                        <div className="flex justify-between items-center mb-4">
                                                                                                                                            <h2 className="text-xl font-bold">Hoá đơn #{selectedInvoice.id}</h2>
                                                                                                                                            <button
                                                                                                                                                                onClick={() => setSelectedInvoice(null)}
                                                                                                                                                                className="text-gray-500 hover:text-gray-700 text-2xl"
                                                                                                                                            >
                                                                                                                                                                ×
                                                                                                                                            </button>
                                                                                                                        </div>

                                                                                                                        <div className="border-t border-b py-4 mb-4">
                                                                                                                                            <div className="flex justify-between text-sm mb-2">
                                                                                                                                                                <span className="text-gray-500">Thời gian:</span>
                                                                                                                                                                <span>{formatDate(selectedInvoice.createdAt)}</span>
                                                                                                                                            </div>
                                                                                                                                            <div className="flex justify-between text-sm mb-2">
                                                                                                                                                                <span className="text-gray-500">Phương thức:</span>
                                                                                                                                                                <span>{selectedInvoice.paymentMethod}</span>
                                                                                                                                            </div>
                                                                                                                                            {selectedInvoice.order.table && (
                                                                                                                                                                <div className="flex justify-between text-sm">
                                                                                                                                                                                    <span className="text-gray-500">Bàn:</span>
                                                                                                                                                                                    <span>{selectedInvoice.order.table.name}</span>
                                                                                                                                                                </div>
                                                                                                                                            )}
                                                                                                                        </div>

                                                                                                                        <h3 className="font-medium mb-2">Chi tiết đơn hàng:</h3>
                                                                                                                        <div className="space-y-2 mb-4">
                                                                                                                                            {selectedInvoice.order.items.map((item) => (
                                                                                                                                                                <div key={item.id} className="flex justify-between text-sm">
                                                                                                                                                                                    <div className="flex items-center gap-2">
                                                                                                                                                                                                        <Package size={14} className="text-gray-400" />
                                                                                                                                                                                                        <span>
                                                                                                                                                                                                                            {item.product.name} x{item.quantity}
                                                                                                                                                                                                        </span>
                                                                                                                                                                                    </div>
                                                                                                                                                                                    <span>{formatCurrency(item.product.price * item.quantity)}</span>
                                                                                                                                                                </div>
                                                                                                                                            ))}
                                                                                                                        </div>

                                                                                                                        <div className="border-t pt-4 space-y-2">
                                                                                                                                            <div className="flex justify-between text-sm">
                                                                                                                                                                <span>Tạm tính:</span>
                                                                                                                                                                <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                                                                                                                                            </div>
                                                                                                                                            <div className="flex justify-between text-sm">
                                                                                                                                                                <span>Phí dịch vụ (5%):</span>
                                                                                                                                                                <span>{formatCurrency(selectedInvoice.serviceCharge)}</span>
                                                                                                                                            </div>
                                                                                                                                            <div className="flex justify-between text-sm">
                                                                                                                                                                <span>Thuế (10%):</span>
                                                                                                                                                                <span>{formatCurrency(selectedInvoice.tax)}</span>
                                                                                                                                            </div>
                                                                                                                                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                                                                                                                                                                <span>Tổng cộng:</span>
                                                                                                                                                                <span className="text-green-600">{formatCurrency(selectedInvoice.total)}</span>
                                                                                                                                            </div>
                                                                                                                        </div>

                                                                                                                        <button
                                                                                                                                            onClick={() => setSelectedInvoice(null)}
                                                                                                                                            className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                                                                                        >
                                                                                                                                            Đóng
                                                                                                                        </button>
                                                                                                    </div>
                                                                                </div>
                                                            )}
                                        </div>
                    );
}
