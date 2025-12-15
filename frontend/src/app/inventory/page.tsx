"use client";

import { useState } from "react";

type Ingredient = { id: number; name: string; stock: number; unit: string };

export default function InventoryPage() {
  // Use initial state directly for mock data to avoid useEffect lint error
  const [ingredients] = useState<Ingredient[]>([
    { id: 1, name: "Coffee Beans", stock: 5000, unit: "g" },
    { id: 2, name: "Milk", stock: 20, unit: "liters" },
    { id: 3, name: "Sugar", stock: 1000, unit: "g" },
  ]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ingredients.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-bold">{item.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    In Stock
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
