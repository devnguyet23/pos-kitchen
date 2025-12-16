"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";

type ReportData = {
  date: string;
  revenue: number;
  orders: number;
};

export default function ReportsPage() {
  const [data, setData] = useState<ReportData[]>([]);
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

  // Generate year options (last 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchData();
  }, [interval, fromDate, toDate, selectedYear, fromYear, toYear]);

  const fetchData = async () => {
    setLoading(true);
    let start: Date;
    let end: Date;

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

    try {
      const res = await fetch(`http://localhost:3001/reports/revenue?from=${start.toISOString()}&to=${end.toISOString()}&interval=${interval}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
      setData([]);
    }
    setLoading(false);
  };

  const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalOrders = data.reduce((acc, curr) => acc + curr.orders, 0);
  const avgPerOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Báo Cáo Doanh Thu</h1>
        <div className="flex bg-white rounded-lg shadow p-1">
          {["day", "month", "year"].map((i) => (
            <button
              key={i}
              onClick={() => setInterval(i as "day" | "month" | "year")}
              className={`px-5 py-2.5 rounded-lg font-medium transition ${interval === i ? 'bg-emerald-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {i === 'day' ? 'Theo Ngày' : i === 'month' ? 'Theo Tháng' : 'Theo Năm'}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <Calendar size={20} className="text-gray-400" />

          {/* Day mode: Date range picker */}
          {interval === 'day' && (() => {
            // Calculate max range (31 days)
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
                        // Check if range exceeds 31 days
                        const diff = Math.ceil((toDateObj.getTime() - new Date(newFrom).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                        if (diff <= maxDays) {
                          setFromDate(newFrom);
                        }
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
                        // Check if range exceeds 31 days
                        const diff = Math.ceil((new Date(newTo).getTime() - fromDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                        if (diff <= maxDays) {
                          setToDate(newTo);
                        }
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none min-w-[120px]"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <span className="text-sm text-gray-500 ml-2">
                (Thống kê 12 tháng trong năm {selectedYear})
              </span>
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
                    if (newFrom <= toYear) {
                      setFromYear(newFrom);
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none min-w-[100px]"
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
                    if (newTo >= fromYear) {
                      setToYear(newTo);
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none min-w-[100px]"
                >
                  {yearOptions.filter(y => y >= fromYear).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Show current filter info */}
          <div className="ml-auto text-sm text-gray-500">
            {interval === 'day' && (
              <span>Đang xem: <strong>{fromDate}</strong> đến <strong>{toDate}</strong></span>
            )}
            {interval === 'month' && (
              <span>Đang xem: <strong>Tháng 1 - 12/{selectedYear}</strong></span>
            )}
            {interval === 'year' && (
              <span>Đang xem: <strong>{fromYear}</strong> đến <strong>{toYear}</strong></span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-emerald-500">
          <div className="text-gray-500 mb-1">Tổng Doanh Thu</div>
          <div className="text-3xl font-bold text-emerald-700">{totalRevenue.toLocaleString("vi-VN")} đ</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-gray-500 mb-1">Tổng Đơn Hàng</div>
          <div className="text-3xl font-bold text-blue-700">{totalOrders}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="text-gray-500 mb-1">Trung Bình / Đơn</div>
          <div className="text-3xl font-bold text-purple-700">{avgPerOrder.toLocaleString("vi-VN", { maximumFractionDigits: 0 })} đ</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Biểu đồ doanh thu theo {interval === 'day' ? 'ngày' : interval === 'month' ? 'tháng' : 'năm'}</h2>
          <div className="text-sm text-gray-500">
            {data.length > 0 && `${data.length} ${interval === 'day' ? 'ngày' : interval === 'month' ? 'tháng' : 'năm'}`}
          </div>
        </div>
        {loading ? (
          <div className="h-72 flex items-center justify-center text-gray-500">Loading...</div>
        ) : data.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-gray-500">Chưa có dữ liệu</div>
        ) : (() => {
          // Filter and limit data based on interval
          let chartData = data;
          if (interval === 'month') {
            // Only show months within the selected year
            chartData = data.filter((d: ReportData) => d.date.startsWith(String(selectedYear)));
          } else if (interval === 'year') {
            // Only show years within the selected range
            chartData = data.filter((d: ReportData) => {
              const year = parseInt(d.date);
              return year >= fromYear && year <= toYear;
            });
          } else {
            // Day mode: max 31 days
            chartData = data.slice(0, 31);
          }

          const maxRevenue = Math.max(...chartData.map((d: ReportData) => d.revenue)) || 1;
          const chartHeight = 256;
          // Calculate column width - wider for fewer items, narrower for more
          const itemCount = chartData.length;
          const colWidth = itemCount <= 7 ? 50 : itemCount <= 12 ? 40 : itemCount <= 20 ? 30 : 24;
          const gap = itemCount <= 7 ? 20 : itemCount <= 12 ? 14 : itemCount <= 20 ? 8 : 6;

          return (
            <div className="relative flex justify-center">
              <div className="relative">
                {/* Y-axis grid lines */}
                <div
                  className="absolute inset-0 flex flex-col justify-between pointer-events-none"
                  style={{ height: chartHeight + 40 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border-b border-gray-100 w-full" />
                  ))}
                </div>

                {/* Chart container - centered */}
                <div
                  className="relative flex items-end justify-center pb-10"
                  style={{
                    height: chartHeight + 40,
                    gap: `${gap}px`
                  }}
                >
                  {chartData.map((row: ReportData, idx: number) => {
                    const heightPercent = (row.revenue / maxRevenue);
                    const barHeight = Math.max(heightPercent * chartHeight, row.revenue > 0 ? 8 : 0);

                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center group relative"
                        style={{
                          width: colWidth,
                          height: chartHeight
                        }}
                      >
                        {/* Revenue value above bar - always visible */}
                        <div
                          className="absolute left-1/2 transform -translate-x-1/2 text-emerald-600 font-semibold whitespace-nowrap"
                          style={{
                            bottom: barHeight + 4,
                            fontSize: chartData.length <= 14 ? '10px' : '9px'
                          }}
                        >
                          {row.revenue > 0 ? (
                            row.revenue >= 1000000
                              ? `${(row.revenue / 1000000).toFixed(1)}Tr`
                              : row.revenue >= 1000
                                ? `${(row.revenue / 1000).toFixed(0)}N`
                                : row.revenue.toLocaleString("vi-VN")
                          ) : ''}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-3 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-10">
                          <div className="font-semibold mb-1">{row.date}</div>
                          <div className="text-emerald-400">{row.revenue.toLocaleString("vi-VN")} đ</div>
                          <div className="text-gray-300">{row.orders} đơn hàng</div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                        </div>

                        {/* Bar - narrower with padding */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2" style={{ width: colWidth * 0.7 }}>
                          <div
                            className="w-full bg-emerald-400 hover:bg-emerald-500 transition-all duration-200 cursor-pointer shadow-sm"
                            style={{
                              height: `${barHeight}px`,
                              borderRadius: '4px 4px 2px 2px',
                            }}
                          />
                        </div>

                        {/* X-axis label - clear and readable */}
                        <div
                          className="absolute text-gray-600 font-medium text-center whitespace-nowrap"
                          style={{
                            bottom: -28,
                            fontSize: itemCount <= 12 ? '11px' : '10px',
                            width: colWidth + gap
                          }}
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số đơn</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={3} className="p-8 text-center">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>
            ) : (
              data.map((row: ReportData) => (
                <tr key={row.date}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{row.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">{row.orders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-green-600">{row.revenue.toLocaleString("vi-VN")} đ</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
