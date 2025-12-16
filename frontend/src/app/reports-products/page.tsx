"use client";
import { useState, useEffect } from "react";
import { BarChart3, Calendar } from "lucide-react";

// Types
interface ProductRevenue {
                    productId: number;
                    productName: string;
                    revenue: number;
}

interface ReportData {
                    date: string;
                    products: ProductRevenue[];
}

interface LegendItem {
                    productId: number;
                    productName: string;
}

// Color palette for products
const COLORS = [
                    '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
                    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
                    '#06B6D4', '#D946EF', '#F43F5E', '#22C55E', '#0EA5E9'
];

export default function ReportsProductsPage() {
                    const [data, setData] = useState<ReportData[]>([]);
                    const [legend, setLegend] = useState<LegendItem[]>([]);
                    const [interval, setInterval] = useState<"day" | "month" | "year">("day");
                    const [loading, setLoading] = useState(false);

                    // Filter states for Day mode (default to today only)
                    const [fromDate, setFromDate] = useState(() => new Date().toISOString().split('T')[0]);
                    const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

                    // Filter state for Month mode
                    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

                    // Filter states for Year mode
                    const [fromYear, setFromYear] = useState(() => new Date().getFullYear() - 4);
                    const [toYear, setToYear] = useState(() => new Date().getFullYear());

                    const yearOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

                    useEffect(() => {
                                        fetchData();
                    }, [interval, fromDate, toDate, selectedYear, fromYear, toYear]);

                    const fetchData = async () => {
                                        setLoading(true);
                                        try {
                                                            let start: Date, end: Date;
                                                            if (interval === 'day') {
                                                                                start = new Date(fromDate);
                                                                                end = new Date(toDate);
                                                                                end.setHours(23, 59, 59, 999);
                                                            } else if (interval === 'month') {
                                                                                start = new Date(selectedYear, 0, 1);
                                                                                end = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
                                                            } else {
                                                                                start = new Date(fromYear, 0, 1);
                                                                                end = new Date(toYear, 11, 31, 23, 59, 59, 999);
                                                            }

                                                            const res = await fetch(`http://localhost:3001/reports/revenue-by-product?from=${start.toISOString()}&to=${end.toISOString()}&interval=${interval}`);
                                                            const json = await res.json();
                                                            setData(json.data || []);
                                                            setLegend(json.legend || []);
                                        } catch (e) {
                                                            console.error("Error fetching report data:", e);
                                                            setData([]);
                                                            setLegend([]);
                                        }
                                        setLoading(false);
                    };

                    // Calculate totals
                    const totalRevenue = data.reduce((sum, d) =>
                                        sum + d.products.reduce((pSum, p) => pSum + p.revenue, 0), 0
                    );

                    const formatCurrency = (value: number) => {
                                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}Tr`;
                                        if (value >= 1000) return `${(value / 1000).toFixed(0)}N`;
                                        return value.toLocaleString("vi-VN");
                    };

                    const getProductColor = (productId: number) => {
                                        const index = legend.findIndex(l => l.productId === productId);
                                        return COLORS[index % COLORS.length];
                    };

                    return (
                                        <div className="p-6">
                                                            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                                                                <BarChart3 className="text-emerald-500" />
                                                                                Báo cáo theo sản phẩm
                                                            </h1>

                                                            {/* Summary Cards */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                                                <div className="bg-white p-6 rounded-lg shadow">
                                                                                                    <p className="text-gray-500 text-sm">Tổng doanh thu</p>
                                                                                                    <p className="text-3xl font-bold text-emerald-600">{totalRevenue.toLocaleString("vi-VN")} đ</p>
                                                                                </div>
                                                                                <div className="bg-white p-6 rounded-lg shadow">
                                                                                                    <p className="text-gray-500 text-sm">Số sản phẩm có doanh thu</p>
                                                                                                    <p className="text-3xl font-bold text-blue-600">{legend.length}</p>
                                                                                </div>
                                                            </div>

                                                            {/* Filters */}
                                                            <div className="bg-white rounded-lg shadow p-4 mb-6">
                                                                                <div className="flex flex-wrap items-center gap-4">
                                                                                                    {/* Interval Selector */}
                                                                                                    <div className="flex rounded-lg overflow-hidden border border-gray-200">
                                                                                                                        {(["day", "month", "year"] as const).map((intv) => (
                                                                                                                                            <button
                                                                                                                                                                key={intv}
                                                                                                                                                                onClick={() => setInterval(intv)}
                                                                                                                                                                className={`px-4 py-2 text-sm font-medium transition ${interval === intv
                                                                                                                                                                                                        ? "bg-emerald-500 text-white"
                                                                                                                                                                                                        : "bg-white text-gray-600 hover:bg-gray-100"
                                                                                                                                                                                    }`}
                                                                                                                                            >
                                                                                                                                                                {intv === "day" ? "Ngày" : intv === "month" ? "Tháng" : "Năm"}
                                                                                                                                            </button>
                                                                                                                        ))}
                                                                                                    </div>

                                                                                                    <Calendar size={20} className="text-gray-400" />

                                                                                                    {/* Day mode: Date range picker */}
                                                                                                    {interval === 'day' && (() => {
                                                                                                                        const maxDays = 31;
                                                                                                                        const fromDateObj = new Date(fromDate);
                                                                                                                        const toDateObj = new Date(toDate);
                                                                                                                        const maxToDate = new Date(fromDateObj);
                                                                                                                        maxToDate.setDate(maxToDate.getDate() + maxDays - 1);
                                                                                                                        const minFromDate = new Date(toDateObj);
                                                                                                                        minFromDate.setDate(minFromDate.getDate() - maxDays + 1);

                                                                                                                        return (
                                                                                                                                            <>
                                                                                                                                                                <div className="flex items-center gap-2">
                                                                                                                                                                                    <label className="text-sm text-gray-600">Từ ngày:</label>
                                                                                                                                                                                    <input
                                                                                                                                                                                                        type="date"
                                                                                                                                                                                                        value={fromDate}
                                                                                                                                                                                                        min={minFromDate.toISOString().split('T')[0]}
                                                                                                                                                                                                        max={toDate}
                                                                                                                                                                                                        onChange={(e) => {
                                                                                                                                                                                                                            const newFrom = e.target.value;
                                                                                                                                                                                                                            if (newFrom <= toDate) {
                                                                                                                                                                                                                                                const diff = Math.ceil((toDateObj.getTime() - new Date(newFrom).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                                                                                                                                                                                                                                if (diff <= maxDays) setFromDate(newFrom);
                                                                                                                                                                                                                            }
                                                                                                                                                                                                        }}
                                                                                                                                                                                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                                                                                                                                                    />
                                                                                                                                                                </div>
                                                                                                                                                                <div className="flex items-center gap-2">
                                                                                                                                                                                    <label className="text-sm text-gray-600">Đến ngày:</label>
                                                                                                                                                                                    <input
                                                                                                                                                                                                        type="date"
                                                                                                                                                                                                        value={toDate}
                                                                                                                                                                                                        min={fromDate}
                                                                                                                                                                                                        max={maxToDate.toISOString().split('T')[0]}
                                                                                                                                                                                                        onChange={(e) => {
                                                                                                                                                                                                                            const newTo = e.target.value;
                                                                                                                                                                                                                            if (newTo >= fromDate) {
                                                                                                                                                                                                                                                const diff = Math.ceil((new Date(newTo).getTime() - fromDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                                                                                                                                                                                                                                if (diff <= maxDays) setToDate(newTo);
                                                                                                                                                                                                                            }
                                                                                                                                                                                                        }}
                                                                                                                                                                                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                                                                                                                                                    />
                                                                                                                                                                </div>
                                                                                                                                                                <span className="text-xs text-gray-400">(Tối đa 31 ngày)</span>
                                                                                                                                            </>
                                                                                                                        );
                                                                                                    })()}

                                                                                                    {/* Month mode: Year selector */}
                                                                                                    {interval === 'month' && (
                                                                                                                        <div className="flex items-center gap-2">
                                                                                                                                            <label className="text-sm text-gray-600">Năm:</label>
                                                                                                                                            <select
                                                                                                                                                                value={selectedYear}
                                                                                                                                                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                                                                                                                                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                                                                                                            >
                                                                                                                                                                {yearOptions.map((year) => (
                                                                                                                                                                                    <option key={year} value={year}>{year}</option>
                                                                                                                                                                ))}
                                                                                                                                            </select>
                                                                                                                        </div>
                                                                                                    )}

                                                                                                    {/* Year mode: Year range picker */}
                                                                                                    {interval === 'year' && (
                                                                                                                        <>
                                                                                                                                            <div className="flex items-center gap-2">
                                                                                                                                                                <label className="text-sm text-gray-600">Từ năm:</label>
                                                                                                                                                                <select
                                                                                                                                                                                    value={fromYear}
                                                                                                                                                                                    onChange={(e) => {
                                                                                                                                                                                                        const newFrom = Number(e.target.value);
                                                                                                                                                                                                        if (newFrom <= toYear) setFromYear(newFrom);
                                                                                                                                                                                    }}
                                                                                                                                                                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                                                                                                                                >
                                                                                                                                                                                    {yearOptions.filter(y => y <= toYear).map((year) => (
                                                                                                                                                                                                        <option key={year} value={year}>{year}</option>
                                                                                                                                                                                    ))}
                                                                                                                                                                </select>
                                                                                                                                            </div>
                                                                                                                                            <div className="flex items-center gap-2">
                                                                                                                                                                <label className="text-sm text-gray-600">Đến năm:</label>
                                                                                                                                                                <select
                                                                                                                                                                                    value={toYear}
                                                                                                                                                                                    onChange={(e) => {
                                                                                                                                                                                                        const newTo = Number(e.target.value);
                                                                                                                                                                                                        if (newTo >= fromYear) setToYear(newTo);
                                                                                                                                                                                    }}
                                                                                                                                                                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                                                                                                                                                >
                                                                                                                                                                                    {yearOptions.filter(y => y >= fromYear).map((year) => (
                                                                                                                                                                                                        <option key={year} value={year}>{year}</option>
                                                                                                                                                                                    ))}
                                                                                                                                                                </select>
                                                                                                                                            </div>
                                                                                                                        </>
                                                                                                    )}
                                                                                </div>
                                                            </div>

                                                            {/* Legend */}
                                                            {legend.length > 0 && (
                                                                                <div className="bg-white rounded-lg shadow p-4 mb-6">
                                                                                                    <h3 className="text-sm font-medium text-gray-600 mb-3">Chú thích sản phẩm</h3>
                                                                                                    <div className="flex flex-wrap gap-4">
                                                                                                                        {legend.map((item) => (
                                                                                                                                            <div key={item.productId} className="flex items-center gap-2">
                                                                                                                                                                <div
                                                                                                                                                                                    className="w-4 h-4 rounded"
                                                                                                                                                                                    style={{ backgroundColor: getProductColor(item.productId) }}
                                                                                                                                                                />
                                                                                                                                                                <span className="text-sm text-gray-700">{item.productName}</span>
                                                                                                                                            </div>
                                                                                                                        ))}
                                                                                                    </div>
                                                                                </div>
                                                            )}

                                                            {/* Stacked Bar Chart */}
                                                            <div className="bg-white rounded-lg shadow p-6 mb-8">
                                                                                <div className="flex justify-between items-center mb-6">
                                                                                                    <h2 className="text-xl font-bold text-gray-800">
                                                                                                                        Biểu đồ doanh thu theo {interval === 'day' ? 'ngày' : interval === 'month' ? 'tháng' : 'năm'}
                                                                                                    </h2>
                                                                                                    <div className="text-sm text-gray-500">
                                                                                                                        {data.length > 0 && `${data.length} ${interval === 'day' ? 'ngày' : interval === 'month' ? 'tháng' : 'năm'}`}
                                                                                                    </div>
                                                                                </div>

                                                                                {loading ? (
                                                                                                    <div className="h-72 flex items-center justify-center text-gray-500">Loading...</div>
                                                                                ) : data.length === 0 ? (
                                                                                                    <div className="h-72 flex items-center justify-center text-gray-500">Chưa có dữ liệu</div>
                                                                                ) : (() => {
                                                                                                    // Filter data based on interval
                                                                                                    let chartData = data;
                                                                                                    if (interval === 'month') {
                                                                                                                        chartData = data.filter(d => d.date.startsWith(String(selectedYear)));
                                                                                                    } else if (interval === 'year') {
                                                                                                                        chartData = data.filter(d => {
                                                                                                                                            const year = parseInt(d.date);
                                                                                                                                            return year >= fromYear && year <= toYear;
                                                                                                                        });
                                                                                                    } else {
                                                                                                                        chartData = data.slice(0, 31);
                                                                                                    }

                                                                                                    // Calculate max total revenue for scaling
                                                                                                    const maxTotal = Math.max(...chartData.map(d =>
                                                                                                                        d.products.reduce((sum, p) => sum + p.revenue, 0)
                                                                                                    )) || 1;

                                                                                                    const chartHeight = 256;
                                                                                                    const itemCount = chartData.length;
                                                                                                    const colWidth = itemCount <= 7 ? 50 : itemCount <= 12 ? 40 : itemCount <= 20 ? 30 : 24;
                                                                                                    const gap = itemCount <= 7 ? 20 : itemCount <= 12 ? 14 : itemCount <= 20 ? 8 : 6;

                                                                                                    return (
                                                                                                                        <div className="relative flex justify-center">
                                                                                                                                            <div className="relative">
                                                                                                                                                                {/* Y-axis grid lines */}
                                                                                                                                                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: chartHeight + 40 }}>
                                                                                                                                                                                    {[...Array(5)].map((_, i) => (
                                                                                                                                                                                                        <div key={i} className="border-b border-gray-100 w-full" />
                                                                                                                                                                                    ))}
                                                                                                                                                                </div>

                                                                                                                                                                {/* Chart container */}
                                                                                                                                                                <div
                                                                                                                                                                                    className="relative flex items-end justify-center pb-10"
                                                                                                                                                                                    style={{ height: chartHeight + 40, gap: `${gap}px` }}
                                                                                                                                                                >
                                                                                                                                                                                    {chartData.map((row, idx) => {
                                                                                                                                                                                                        const totalRevenue = row.products.reduce((sum, p) => sum + p.revenue, 0);
                                                                                                                                                                                                        const totalHeight = (totalRevenue / maxTotal) * chartHeight;

                                                                                                                                                                                                        return (
                                                                                                                                                                                                                            <div
                                                                                                                                                                                                                                                key={idx}
                                                                                                                                                                                                                                                className="flex flex-col items-center group relative"
                                                                                                                                                                                                                                                style={{ width: colWidth, height: chartHeight }}
                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                                {/* Total value above bar */}
                                                                                                                                                                                                                                                <div
                                                                                                                                                                                                                                                                    className="absolute left-1/2 transform -translate-x-1/2 text-gray-700 font-semibold whitespace-nowrap"
                                                                                                                                                                                                                                                                    style={{ bottom: totalHeight + 4, fontSize: itemCount <= 14 ? '10px' : '9px' }}
                                                                                                                                                                                                                                                >
                                                                                                                                                                                                                                                                    {totalRevenue > 0 ? formatCurrency(totalRevenue) : ''}
                                                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                                                {/* Tooltip */}
                                                                                                                                                                                                                                                <div className="absolute bottom-full mb-3 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-10 max-h-60 overflow-y-auto">
                                                                                                                                                                                                                                                                    <div className="font-semibold mb-2">{row.date}</div>
                                                                                                                                                                                                                                                                    {row.products.filter(p => p.revenue > 0).map(p => (
                                                                                                                                                                                                                                                                                        <div key={p.productId} className="flex items-center gap-2 mb-1">
                                                                                                                                                                                                                                                                                                            <div className="w-2 h-2 rounded" style={{ backgroundColor: getProductColor(p.productId) }} />
                                                                                                                                                                                                                                                                                                            <span>{p.productName}: {p.revenue.toLocaleString("vi-VN")} đ</span>
                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                    ))}
                                                                                                                                                                                                                                                                    <div className="border-t border-gray-600 mt-2 pt-2 font-semibold">
                                                                                                                                                                                                                                                                                        Tổng: {totalRevenue.toLocaleString("vi-VN")} đ
                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                                                {/* Stacked Bar */}
                                                                                                                                                                                                                                                <div
                                                                                                                                                                                                                                                                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col-reverse cursor-pointer"
                                                                                                                                                                                                                                                                    style={{ width: colWidth * 0.7, height: totalHeight }}
                                                                                                                                                                                                                                                >
                                                                                                                                                                                                                                                                    {row.products.filter(p => p.revenue > 0).map((p, pIdx) => {
                                                                                                                                                                                                                                                                                        const segmentHeight = (p.revenue / totalRevenue) * totalHeight;
                                                                                                                                                                                                                                                                                        return (
                                                                                                                                                                                                                                                                                                            <div
                                                                                                                                                                                                                                                                                                                                key={p.productId}
                                                                                                                                                                                                                                                                                                                                className="w-full transition-opacity hover:opacity-80"
                                                                                                                                                                                                                                                                                                                                style={{
                                                                                                                                                                                                                                                                                                                                                    height: segmentHeight,
                                                                                                                                                                                                                                                                                                                                                    backgroundColor: getProductColor(p.productId),
                                                                                                                                                                                                                                                                                                                                                    borderRadius: pIdx === row.products.filter(pr => pr.revenue > 0).length - 1 ? '4px 4px 0 0' : '0',
                                                                                                                                                                                                                                                                                                                                }}
                                                                                                                                                                                                                                                                                                            />
                                                                                                                                                                                                                                                                                        );
                                                                                                                                                                                                                                                                    })}
                                                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                                                {/* X-axis label */}
                                                                                                                                                                                                                                                <div
                                                                                                                                                                                                                                                                    className="absolute text-gray-600 font-medium text-center whitespace-nowrap"
                                                                                                                                                                                                                                                                    style={{ bottom: -28, fontSize: itemCount <= 12 ? '11px' : '10px', width: colWidth + gap }}
                                                                                                                                                                                                                                                >
                                                                                                                                                                                                                                                                    {interval === 'day'
                                                                                                                                                                                                                                                                                        ? `${row.date.slice(-2)}/${row.date.slice(5, 7)}`
                                                                                                                                                                                                                                                                                        : interval === 'month'
                                                                                                                                                                                                                                                                                                            ? `T${parseInt(row.date.slice(5, 7))}`
                                                                                                                                                                                                                                                                                                            : row.date}
                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                        );
                                                                                                                                                                                    })}
                                                                                                                                                                </div>
                                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                    );
                                                                                })()}
                                                            </div>

                                                            {/* Data Table */}
                                                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                                                                <table className="min-w-full divide-y divide-gray-200">
                                                                                                    <thead className="bg-gray-50">
                                                                                                                        <tr>
                                                                                                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                                                                                                                                            {legend.map(item => (
                                                                                                                                                                <th key={item.productId} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                                                                                                                                                    <div className="flex items-center justify-end gap-1">
                                                                                                                                                                                                        <div className="w-2 h-2 rounded" style={{ backgroundColor: getProductColor(item.productId) }} />
                                                                                                                                                                                                        <span className="truncate max-w-[80px]">{item.productName}</span>
                                                                                                                                                                                    </div>
                                                                                                                                                                </th>
                                                                                                                                            ))}
                                                                                                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tổng</th>
                                                                                                                        </tr>
                                                                                                    </thead>
                                                                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                                                                                        {loading ? (
                                                                                                                                            <tr><td colSpan={legend.length + 2} className="p-8 text-center">Loading...</td></tr>
                                                                                                                        ) : data.length === 0 ? (
                                                                                                                                            <tr><td colSpan={legend.length + 2} className="p-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>
                                                                                                                        ) : (
                                                                                                                                            data.slice(0, 31).map((row) => {
                                                                                                                                                                const total = row.products.reduce((sum, p) => sum + p.revenue, 0);
                                                                                                                                                                return (
                                                                                                                                                                                    <tr key={row.date}>
                                                                                                                                                                                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{row.date}</td>
                                                                                                                                                                                                        {legend.map(item => {
                                                                                                                                                                                                                            const product = row.products.find(p => p.productId === item.productId);
                                                                                                                                                                                                                            return (
                                                                                                                                                                                                                                                <td key={item.productId} className="px-4 py-4 whitespace-nowrap text-right text-sm">
                                                                                                                                                                                                                                                                    {product && product.revenue > 0
                                                                                                                                                                                                                                                                                        ? <span className="text-gray-700">{product.revenue.toLocaleString("vi-VN")}</span>
                                                                                                                                                                                                                                                                                        : <span className="text-gray-300">-</span>
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                </td>
                                                                                                                                                                                                                            );
                                                                                                                                                                                                        })}
                                                                                                                                                                                                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-green-600">
                                                                                                                                                                                                                            {total > 0 ? `${total.toLocaleString("vi-VN")} đ` : '-'}
                                                                                                                                                                                                        </td>
                                                                                                                                                                                    </tr>
                                                                                                                                                                );
                                                                                                                                            })
                                                                                                                        )}
                                                                                                    </tbody>
                                                                                </table>
                                                            </div>
                                        </div>
                    );
}
