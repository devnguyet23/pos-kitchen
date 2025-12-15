"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";

type Order = {
  id: number;
  tableId: number;
  items: {
    product: { 
        name: string; 
        category: { name: string } 
    };
    quantity: number;
    notes?: string;
  }[];
  createdAt: string;
};

export default function KDSPage() {
  const socket = useSocket();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"ALL" | "Drinks" | "Food">("ALL");

  useEffect(() => {
    fetch("http://localhost:3001/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((e) => console.error(e));

    if (!socket) return;

    socket.on("order_created", (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    return () => {
      socket.off("order_created");
    };
  }, [socket]);

  
  const filteredOrders = orders.map(order => {
      const relevantItems = order.items.filter(item => 
          filter === "ALL" || item.product.category.name === filter
      );
      return { ...order, items: relevantItems };
  }).filter(order => order.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold text-yellow-500">KDS</h1>
            <div className="flex bg-gray-800 rounded p-1">
                {["ALL", "Drinks", "Food"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={cn(
                            "px-4 py-2 rounded transition-colors",
                            filter === f ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                        )}
                    >
                        {f === "ALL" ? "All Stations" : f === "Drinks" ? "Bar (Drinks)" : "Kitchen (Food)"}
                    </button>
                ))}
            </div>
        </div>
        <div className="text-xl font-mono">{new Date().toLocaleTimeString()}</div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredOrders.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-10">
                No active orders for this station.
            </div>
        )}
        
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg flex flex-col">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
              <span className="font-bold text-xl text-blue-400">#{order.id}</span>
              <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-sm font-bold">
                Table {order.tableId}
              </span>
            </div>
            <div className="space-y-3 mb-4 flex-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="border-b border-gray-700/50 pb-2 last:border-0">
                  <div className="flex justify-between items-baseline">
                      <span className="font-bold text-lg text-white">{item.quantity} x {item.product.name}</span>
                  </div>
                  {item.notes && (
                      <div className="text-yellow-400 text-sm mt-1 italic">Note: {item.notes}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-gray-400 text-xs mb-3 text-right">
              {new Date(order.createdAt).toLocaleTimeString()}
            </div>
            <button 
                onClick={() => alert("Marked done (Backend integration pending)")}
                className="w-full bg-green-700 hover:bg-green-600 py-3 rounded font-bold transition-colors text-lg"
            >
              DONE
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
