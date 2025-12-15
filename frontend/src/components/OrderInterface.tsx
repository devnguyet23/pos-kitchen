"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

// Types
type ModifierOption = {
  id: number;
  name: string;
  options: string; // JSON string
};

type Product = {
  id: number;
  name: string;
  price: number;
  modifiers: { modifier: ModifierOption }[];
};

type OrderItem = {
  productId: number;
  quantity: number;
  notes?: string;
  name: string;
  price: number;
  selectedOptions?: Record<string, string>; // { "Sugar": "50%", "Ice": "Less" }
};

export default function OrderInterface({ tableId }: { tableId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentOptions, setCurrentOptions] = useState<Record<string, string>>({});
  
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:3001/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((e) => console.error(e));
  }, []);

  const handleProductClick = (product: Product) => {
    if (product.modifiers && product.modifiers.length > 0) {
      // Open Modal
      setSelectedProduct(product);
      // Reset options - Default to first option
      const defaults: Record<string, string> = {};
      product.modifiers.forEach(m => {
        const opts = JSON.parse(m.modifier.options);
        if (opts.length > 0) defaults[m.modifier.name] = opts[0]; // Default to first
      });
      setCurrentOptions(defaults);
    } else {
      addToCart(product, {});
    }
  };

  const addToCart = (product: Product, options: Record<string, string>) => {
    // Generate notes from options
    const optionNotes = Object.entries(options).map(([k, v]) => `${k}: ${v}`).join(", ");
    
    setCart((prev) => {
      // Simple logic: if exact same product + options exists, increment
      // For simplicity here, we treat every item with modifiers as unique line item 
      // or just append. Let's just append for now to avoid complex comparison.
      return [...prev, { 
          productId: product.id, 
          quantity: 1, 
          name: product.name, 
          price: product.price,
          notes: optionNotes,
          selectedOptions: options
      }];
    });
    setSelectedProduct(null);
  };

  const placeOrder = async () => {
    try {
      const res = await fetch("http://localhost:3001/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: parseInt(tableId),
          items: cart.map(({ productId, quantity, notes }) => ({
            productId,
            quantity,
            notes,
          })),
        }),
      });
      if (res.ok) {
        alert("Order sent to Kitchen!");
        setCart([]);
        router.push("/pos"); 
      }
    } catch (error) {
      console.error(error);
      alert("Failed to place order");
    }
  };

  return (
    <div className="flex h-screen relative">
      {/* Product Modal */}
      {selectedProduct && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
               <button onClick={() => setSelectedProduct(null)}><X /></button>
            </div>
            
            <div className="space-y-4 mb-6">
               {selectedProduct.modifiers.map((pm, idx) => {
                 const opts: string[] = JSON.parse(pm.modifier.options);
                 return (
                   <div key={idx}>
                     <label className="block font-medium mb-1">{pm.modifier.name}</label>
                     <div className="flex flex-wrap gap-2">
                       {opts.map(opt => (
                         <button
                           key={opt}
                           onClick={() => setCurrentOptions(prev => ({...prev, [pm.modifier.name]: opt}))}
                           className={`px-3 py-1 rounded border text-sm ${
                             currentOptions[pm.modifier.name] === opt 
                               ? 'bg-blue-600 text-white border-blue-600' 
                               : 'bg-white text-gray-700 hover:bg-gray-100'
                           }`}
                         >
                           {opt}
                         </button>
                       ))}
                     </div>
                   </div>
                 );
               })}
            </div>

            <button 
              onClick={() => addToCart(selectedProduct, currentOptions)}
              className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Menu Area */}
      <div className="w-2/3 p-4 bg-gray-50 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Menu (Table {tableId})</h2>
        <div className="grid grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => handleProductClick(p)}
              className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer border hover:border-blue-400 transition-all"
            >
              <div className="font-bold text-lg">{p.name}</div>
              <div className="text-gray-500">${p.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Area */}
      <div className="w-1/3 bg-white border-l flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Current Order</h3>
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start mb-3 border-b pb-2">
              <div>
                <div className="font-medium">{item.name}</div>
                {item.notes && <div className="text-xs text-gray-500 italic">{item.notes}</div>}
              </div>
              <div className="flex flex-col items-end">
                  <div>${item.price * item.quantity}</div>
                  <div className="text-sm text-gray-400">x{item.quantity}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between text-xl font-bold mb-4">
            <span>Total:</span>
            <span>${cart.reduce((a, b) => a + b.price * b.quantity, 0)}</span>
          </div>
          <button
            onClick={placeOrder}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 mb-2"
          >
            Send to Kitchen
          </button>
          
          <button
            onClick={async () => {
                if(!confirm("Checkout and clear table?")) return;
                try {
                    const res = await fetch("http://localhost:3001/invoices", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ tableId: parseInt(tableId) })
                    });
                    if(res.ok) {
                        const inv = await res.json();
                        alert(`Checkout Successful!\nTotal: $${inv.total.toFixed(2)}`);
                        router.push("/pos");
                    } else {
                        const err = await res.json();
                        alert("Checkout Failed: " + err.message);
                    }
                } catch(e) { console.error(e); }
            }}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
          >
            Checkout & Pay
          </button>
        </div>
      </div>
    </div>
  );
}
