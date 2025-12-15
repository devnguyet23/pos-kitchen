"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Reusing types from POS (simplified)
type Product = { id: number; name: string; price: number; };

function CustomerOrderContent() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get("tableId");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const placeQuickOrder = async (productId: number) => {
    if (!tableId) {
      alert("Scan QR code first (No Table ID found)");
      return;
    }

    await fetch("http://localhost:3001/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableId: parseInt(tableId),
        items: [{ productId, quantity: 1 }],
      }),
    });
    alert("Order Placed! Thank you.");
  };

  if (!tableId) {
    return <div className="p-8 text-center text-red-500">Please scan the QR code on your table.</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      <div className="bg-orange-500 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <h1 className="text-2xl font-bold">Welcome to Our Cafe</h1>
        <p className="opacity-90">Table #{tableId}</p>
      </div>

      <div className="px-4">
        <h2 className="font-bold text-lg mb-4 text-gray-800">Popular Menu</h2>
        <div className="space-y-4">
          {products.map((p) => (
            <div key={p.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl shadow-sm">
              <div>
                <div className="font-bold text-gray-900">{p.name}</div>
                <div className="text-orange-500 font-bold">${p.price}</div>
              </div>
              <button
                onClick={() => placeQuickOrder(p.id)}
                className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-orange-200 shadow-lg active:scale-95 transition-transform"
              >
                Add +
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CustomerOrder() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <CustomerOrderContent />
    </Suspense>
  );
}
