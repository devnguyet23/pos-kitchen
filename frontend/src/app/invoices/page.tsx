"use client";

import { useEffect, useState, useRef } from "react";
import { Search, FileText, Calendar, Package, ChevronLeft, ChevronRight, Printer } from "lucide-react";

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
                    const printRef = useRef<HTMLDivElement>(null);

                    // Date filter states
                    const [filterType, setFilterType] = useState<"all" | "day" | "month" | "year">("all");
                    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
                    const [selectedMonth, setSelectedMonth] = useState(
                                        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
                    );
                    const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

                    // Pagination states
                    const [currentPage, setCurrentPage] = useState(1);
                    const [pageSize, setPageSize] = useState<number | "all">(20);

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
                                                            setCurrentPage(1);
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

                    const getPaymentMethodLabel = (method: string) => {
                                        switch (method) {
                                                            case "CASH":
                                                                                return "Tiền mặt";
                                                            case "CARD":
                                                                                return "Thẻ";
                                                            case "TRANSFER":
                                                                                return "Chuyển khoản";
                                                            default:
                                                                                return method;
                                        }
                    };

                    // Calculate subtotal from order items (without service charge and tax)
                    const calculateSubtotal = (invoice: Invoice) => {
                                        return invoice.order.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
                    };

                    // Pagination logic
                    const totalInvoices = invoices.length;
                    const totalPages = pageSize === "all" ? 1 : Math.ceil(totalInvoices / pageSize);
                    const paginatedInvoices = pageSize === "all"
                                        ? invoices
                                        : invoices.slice((currentPage - 1) * (pageSize as number), currentPage * (pageSize as number));

                    // Stats - calculate from order items only (without service charge and tax)
                    const totalRevenue = invoices.reduce((sum, inv) => sum + calculateSubtotal(inv), 0);

                    // Print invoice function
                    const handlePrintInvoice = () => {
                                        if (!selectedInvoice) return;

                                        const printWindow = window.open('', '_blank');
                                        if (!printWindow) return;

                                        const itemsHTML = selectedInvoice.order.items.map(item => `
      <tr>
        <td style="padding: 4px 0; border-bottom: 1px solid #eee;">${item.product.name}</td>
        <td style="padding: 4px 0; border-bottom: 1px solid #eee; text-align: right;">${item.product.price.toLocaleString('vi-VN')}đ</td>
        <td style="padding: 4px 0; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
        <td style="padding: 4px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${(item.product.price * item.quantity).toLocaleString('vi-VN')}đ</td>
      </tr>
    `).join('');

                                        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hoá đơn #${selectedInvoice.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; max-width: 80mm; margin: 0 auto; font-size: 12px; }
            .header { text-align: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px dashed #000; }
            .header h1 { font-size: 16px; margin-bottom: 5px; }
            .info { margin-bottom: 15px; }
            .info div { display: flex; justify-content: space-between; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th { text-align: left; padding: 4px 0; border-bottom: 2px solid #000; font-size: 10px; text-transform: uppercase; }
            th:nth-child(2), th:nth-child(4) { text-align: right; }
            th:nth-child(3) { text-align: center; }
            .total { font-size: 16px; font-weight: bold; display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px dashed #000; }
            .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 2px dashed #000; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HÓA ĐƠN BÁN HÀNG</h1>
            <p>POS System</p>
          </div>
          <div class="info">
            <div><span>Mã HĐ:</span><span>#${selectedInvoice.id}</span></div>
            <div><span>Thời gian:</span><span>${formatDate(selectedInvoice.createdAt)}</span></div>
            <div><span>Thanh toán:</span><span>${getPaymentMethodLabel(selectedInvoice.paymentMethod)}</span></div>
            ${selectedInvoice.order.table ? `<div><span>Bàn:</span><span>${selectedInvoice.order.table.name}</span></div>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đ.Giá</th>
                <th>SL</th>
                <th>T.Tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          <div class="total">
            <span>TỔNG CỘNG:</span>
            <span>${calculateSubtotal(selectedInvoice).toLocaleString('vi-VN')}đ</span>
          </div>
          <div class="footer">
            <p>Cảm ơn quý khách!</p>
            <p>Hẹn gặp lại</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
                                        printWindow.document.close();
                    };

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
                                                                                                                                                                                    onClick={() => setFilterType(option.value as typeof filterType)}
                                                                                                                                                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterType === option.value
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
                                                                                                                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã HĐ</th>
                                                                                                                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                                                                                                                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bàn/Order</th>
                                                                                                                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                                                                                                                                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thanh toán</th>
                                                                                                                                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Chi tiết</th>
                                                                                                                                            </tr>
                                                                                                                        </thead>
                                                                                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                                                                                            {loading ? (
                                                                                                                                                                <tr>
                                                                                                                                                                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Đang tải...</td>
                                                                                                                                                                </tr>
                                                                                                                                            ) : paginatedInvoices.length === 0 ? (
                                                                                                                                                                <tr>
                                                                                                                                                                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                                                                                                                                                                        Không có hoá đơn nào trong khoảng thời gian này
                                                                                                                                                                                    </td>
                                                                                                                                                                </tr>
                                                                                                                                            ) : (
                                                                                                                                                                paginatedInvoices.map((invoice) => (
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
                                                                                                                                                                                                                            {formatCurrency(calculateSubtotal(invoice))}
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
                                                                                                                                                                                                                                                {getPaymentMethodLabel(invoice.paymentMethod)}
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

                                                                                                    {/* Pagination */}
                                                                                                    {totalInvoices > 0 && (
                                                                                                                        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                                                                                                                                            <div className="flex items-center gap-2">
                                                                                                                                                                <span className="text-sm text-gray-500">Hiển thị:</span>
                                                                                                                                                                <select
                                                                                                                                                                                    value={pageSize}
                                                                                                                                                                                    onChange={(e) => {
                                                                                                                                                                                                        setPageSize(e.target.value === "all" ? "all" : Number(e.target.value));
                                                                                                                                                                                                        setCurrentPage(1);
                                                                                                                                                                                    }}
                                                                                                                                                                                    className="px-2 py-1 border rounded text-sm"
                                                                                                                                                                >
                                                                                                                                                                                    <option value={10}>10</option>
                                                                                                                                                                                    <option value={20}>20</option>
                                                                                                                                                                                    <option value={30}>30</option>
                                                                                                                                                                                    <option value={50}>50</option>
                                                                                                                                                                                    <option value="all">Tất cả</option>
                                                                                                                                                                </select>
                                                                                                                                                                <span className="text-sm text-gray-500">/ {totalInvoices} hoá đơn</span>
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
                                                                                                                                                                                    <span className="text-sm">Trang {currentPage} / {totalPages}</span>
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

                                                                                                                        {/* Invoice Info */}
                                                                                                                        <div className="border-t border-b py-4 mb-4">
                                                                                                                                            <div className="flex justify-between text-sm mb-2">
                                                                                                                                                                <span className="text-gray-500">Mã hoá đơn:</span>
                                                                                                                                                                <span>#{selectedInvoice.id}</span>
                                                                                                                                            </div>
                                                                                                                                            <div className="flex justify-between text-sm mb-2">
                                                                                                                                                                <span className="text-gray-500">Thời gian:</span>
                                                                                                                                                                <span>{formatDate(selectedInvoice.createdAt)}</span>
                                                                                                                                            </div>
                                                                                                                                            <div className="flex justify-between text-sm mb-2">
                                                                                                                                                                <span className="text-gray-500">Phương thức:</span>
                                                                                                                                                                <span>{getPaymentMethodLabel(selectedInvoice.paymentMethod)}</span>
                                                                                                                                            </div>
                                                                                                                                            {selectedInvoice.order.table && (
                                                                                                                                                                <div className="flex justify-between text-sm">
                                                                                                                                                                                    <span className="text-gray-500">Bàn:</span>
                                                                                                                                                                                    <span>{selectedInvoice.order.table.name}</span>
                                                                                                                                                                </div>
                                                                                                                                            )}
                                                                                                                        </div>

                                                                                                                        {/* Order Items */}
                                                                                                                        <h3 className="font-medium mb-3">Chi tiết đơn hàng:</h3>
                                                                                                                        <div className="mb-4">
                                                                                                                                            {/* Table header */}
                                                                                                                                            <div className="flex text-xs text-gray-500 font-medium border-b pb-2 mb-2">
                                                                                                                                                                <span className="flex-1">Sản phẩm</span>
                                                                                                                                                                <span className="w-20 text-right">Đ.Giá</span>
                                                                                                                                                                <span className="w-12 text-center">SL</span>
                                                                                                                                                                <span className="w-24 text-right">T.Tiền</span>
                                                                                                                                            </div>
                                                                                                                                            {/* Items */}
                                                                                                                                            {selectedInvoice.order.items.map((item) => (
                                                                                                                                                                <div key={item.id} className="flex items-center text-sm py-2 border-b border-gray-100">
                                                                                                                                                                                    <div className="flex-1 flex items-center gap-2">
                                                                                                                                                                                                        <Package size={14} className="text-gray-400 flex-shrink-0" />
                                                                                                                                                                                                        <span className="truncate">{item.product.name}</span>
                                                                                                                                                                                    </div>
                                                                                                                                                                                    <span className="w-20 text-right text-gray-600">
                                                                                                                                                                                                        {item.product.price.toLocaleString("vi-VN")}đ
                                                                                                                                                                                    </span>
                                                                                                                                                                                    <span className="w-12 text-center text-gray-600">
                                                                                                                                                                                                        x{item.quantity}
                                                                                                                                                                                    </span>
                                                                                                                                                                                    <span className="w-24 text-right font-medium">
                                                                                                                                                                                                        {formatCurrency(item.product.price * item.quantity)}
                                                                                                                                                                                    </span>
                                                                                                                                                                </div>
                                                                                                                                            ))}
                                                                                                                        </div>

                                                                                                                        {/* Total */}
                                                                                                                        <div className="border-t pt-4">
                                                                                                                                            <div className="flex justify-between font-bold text-lg">
                                                                                                                                                                <span>Tổng cộng:</span>
                                                                                                                                                                <span className="text-green-600">{formatCurrency(calculateSubtotal(selectedInvoice))}</span>
                                                                                                                                            </div>
                                                                                                                        </div>

                                                                                                                        {/* Print Button */}
                                                                                                                        <button
                                                                                                                                            onClick={handlePrintInvoice}
                                                                                                                                            className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                                                                                                                        >
                                                                                                                                            <Printer size={18} />
                                                                                                                                            In hoá đơn
                                                                                                                        </button>
                                                                                                    </div>
                                                                                </div>
                                                            )}
                                        </div>
                    );
}
