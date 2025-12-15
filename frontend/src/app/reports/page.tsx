"use client";

import { useEffect, useState } from "react";

type ReportData = {
  date: string;
  revenue: number;
  orders: number;
};

export default function ReportsPage() {
  const [data, setData] = useState<ReportData[]>([]);
  const [interval, setInterval] = useState<"day" | "month" | "year">("day");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [interval]);

  const fetchData = async () => {
    setLoading(true);
    // Default: Last 30 days logic (simplified)
    const end = new Date();
    const start = new Date();
    if (interval === 'day') start.setDate(end.getDate() - 30);
    if (interval === 'month') start.setMonth(end.getMonth() - 12);

    const res = await fetch(`http://localhost:3001/reports/revenue?from=${start.toISOString()}&to=${end.toISOString()}&interval=${interval}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalOrders = data.reduce((acc, curr) => acc + curr.orders, 0);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Báo Cáo Doanh Thu</h1>
        <div className="flex bg-white rounded shadow p-1">
          {["day", "month", "year"].map((i) => (
            <button
              key={i}
              onClick={() => setInterval(i as any)}
              className={`px-4 py-2 rounded capitalize ${interval === i ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {i === 'day' ? 'Ngày' : i === 'month' ? 'Tháng' : 'Năm'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-gray-500 mb-1">Tổng Doanh Thu (Giai đoạn này)</div>
          <div className="text-3xl font-bold text-green-700">{totalRevenue.toLocaleString("vi-VN")} đ</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-gray-500 mb-1">Tổng Đơn Hàng</div>
          <div className="text-3xl font-bold text-blue-700">{totalOrders}</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Biểu đồ doanh thu theo {interval === 'day' ? 'ngày' : interval === 'month' ? 'tháng' : 'năm'}</h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-500">Loading...</div>
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500">Chưa có dữ liệu</div>
        ) : (
          <div className="relative">
            {/* Chart container */}
            <div className="flex items-end justify-between gap-1 h-64 border-b border-l border-gray-300 px-2 pb-2">
              {data.slice(-14).map((row, idx) => {
                const maxRevenue = Math.max(...data.slice(-14).map(d => d.revenue)) || 1;
                const heightPercent = (row.revenue / maxRevenue) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {row.revenue.toLocaleString("vi-VN")} đ
                      <br />
                      {row.orders} đơn
                    </div>
                    {/* Bar */}
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t hover:from-blue-700 hover:to-blue-500 transition-all cursor-pointer"
                      style={{ height: `${heightPercent}%`, minHeight: row.revenue > 0 ? '4px' : '0' }}
                    />
                  </div>
                );
              })}
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between gap-1 px-2 mt-2">
              {data.slice(-14).map((row, idx) => (
                <div key={idx} className="flex-1 text-center text-xs text-gray-500 truncate">
                  {interval === 'day' ? row.date.slice(-5) : row.date}
                </div>
              ))}
            </div>
          </div>
        )}
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
              data.map((row) => (
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
