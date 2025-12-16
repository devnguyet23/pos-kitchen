"use client";

import { useEffect, useState } from "react";
import { X, Search, Plus, Minus, Trash2, Save, Image as ImageIcon, Printer, Check } from "lucide-react";
import { useToast } from "@/components/Toast";

// Types
type Category = {
  id: number;
  name: string;
};

type ModifierOption = {
  id: number;
  name: string;
  options: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
  image?: string;
  status?: number; // 0: hidden, 1: visible
  categoryId: number;
  category: Category;
  modifiers: { modifier: ModifierOption }[];
};

type OrderItem = {
  productId: number;
  quantity: number;
  notes?: string;
  name: string;
  price: number;
  image?: string;
  selectedOptions?: Record<string, string>;
};

type DraftOrder = {
  id: string;
  name: string;
  items: OrderItem[];
  createdAt: string;
};

const API_URL = "http://localhost:3001";

export default function RetailPage() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentOptions, setCurrentOptions] = useState<Record<string, string>>({});

  // New states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<DraftOrder[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products from API with search and category filters
  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }
      if (selectedCategory !== null) {
        params.append('categoryId', selectedCategory.toString());
      }
      const res = await fetch(`${API_URL}/products?${params.toString()}`);
      const result = await res.json();
      setProducts(result.data || result);
    } catch (e) {
      console.error(e);
    }
  };

  // Refetch products when search or category changes
  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, selectedCategory]);

  // Fetch categories
  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((e) => console.error(e));

    // Load drafts from localStorage
    const savedDrafts = localStorage.getItem("pos_drafts");
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    }
  }, []);

  // Get image URL - returns default thumbnail if no image
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "/thumbnail_default.png";
    if (imagePath.startsWith("http") || imagePath.startsWith("data:")) {
      return imagePath;
    }
    return `${API_URL}${imagePath}`;
  };

  // Normalize Vietnamese text (remove accents)
  const normalizeVietnamese = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  };

  // Filter only visible products (status = 1) - search/category filtering is now done by API
  const filteredProducts = products.filter((p: Product) => {
    // Only show visible products (status = 1)
    return p.status === undefined || p.status === 1;
  });

  const handleProductClick = (product: Product) => {
    if (product.modifiers && product.modifiers.length > 0) {
      setSelectedProduct(product);
      const defaults: Record<string, string> = {};
      product.modifiers.forEach((m) => {
        const opts = JSON.parse(m.modifier.options);
        if (opts.length > 0) defaults[m.modifier.name] = opts[0];
      });
      setCurrentOptions(defaults);
    } else {
      addToCart(product, {});
    }
  };

  const addToCart = (product: Product, options: Record<string, string>) => {
    const optionNotes = Object.entries(options)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    setCart((prev) => {
      const existIdx = prev.findIndex(
        (p) => p.productId === product.id && p.notes === optionNotes
      );
      if (existIdx > -1) {
        const newCart = [...prev];
        newCart[existIdx].quantity += 1;
        return newCart;
      }
      return [
        ...prev,
        {
          productId: product.id,
          quantity: 1,
          name: product.name,
          price: product.price,
          image: product.image,
          notes: optionNotes,
          selectedOptions: options,
        },
      ];
    });
    setSelectedProduct(null);
  };

  // Update quantity
  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const newCart = [...prev];
      newCart[index].quantity += delta;
      if (newCart[index].quantity <= 0) {
        newCart.splice(index, 1);
      }
      return newCart;
    });
  };

  // Remove item
  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Save draft
  const saveDraft = () => {
    if (cart.length === 0) return;
    const draftName = prompt("Nhập tên hóa đơn tạm:");
    if (!draftName) return;

    const newDraft: DraftOrder = {
      id: Date.now().toString(),
      name: draftName,
      items: cart,
      createdAt: new Date().toISOString(),
    };

    const updatedDrafts = [...drafts, newDraft];
    setDrafts(updatedDrafts);
    localStorage.setItem("pos_drafts", JSON.stringify(updatedDrafts));
    setCart([]);
    toast.success("Đã lưu tạm!");
  };

  // Load draft
  const loadDraft = (draft: DraftOrder) => {
    setCart(draft.items);
    // Remove from drafts
    const updatedDrafts = drafts.filter((d) => d.id !== draft.id);
    setDrafts(updatedDrafts);
    localStorage.setItem("pos_drafts", JSON.stringify(updatedDrafts));
    setShowDrafts(false);
  };

  // Delete draft
  const deleteDraft = (draftId: string) => {
    const updatedDrafts = drafts.filter((d) => d.id !== draftId);
    setDrafts(updatedDrafts);
    localStorage.setItem("pos_drafts", JSON.stringify(updatedDrafts));
  };

  const checkout = async (printInvoice: boolean = false) => {
    if (cart.length === 0) return;
    setShowPaymentOptions(false);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: null,
          items: cart.map(({ productId, quantity, notes }) => ({
            productId,
            quantity,
            notes,
          })),
        }),
      });

      if (!res.ok) throw new Error("Order failed");
      const order = await res.json();

      const invoiceRes = await fetch(`${API_URL}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId: null, orderId: order.id }),
      });

      if (printInvoice && invoiceRes.ok) {
        const invoice = await invoiceRes.json();
        // Open print window
        printInvoiceReceipt(invoice, order);
      }

      toast.success("Thanh toán thành công!");
      setCart([]);
    } catch (error) {
      console.error(error);
      toast.error("Thanh toán thất bại");
    }
  };

  // Print invoice receipt
  const printInvoiceReceipt = (invoice: any, order: any) => {
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hóa đơn #${invoice.id}</title>
        <style>
          body { font-family: monospace; font-size: 12px; padding: 10px; width: 280px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 10px 0; }
          .item { margin: 8px 0; }
          .item-name { font-weight: bold; margin-bottom: 2px; }
          .item-details { display: flex; justify-content: space-between; font-size: 11px; color: #555; }
          .item-total { display: flex; justify-content: flex-end; font-weight: bold; }
          .total { font-size: 14px; font-weight: bold; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size: 16px;">HÓA ĐƠN BÁN HÀNG</div>
        <div class="center">Số: #${invoice.id}</div>
        <div class="center">${new Date().toLocaleString('vi-VN')}</div>
        <div class="line"></div>
        <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: bold; margin-bottom: 5px;">
          <span style="flex: 2;">Sản phẩm</span>
          <span style="flex: 1; text-align: right;">Đ.Giá</span>
          <span style="flex: 0.5; text-align: center;">SL</span>
          <span style="flex: 1; text-align: right;">T.Tiền</span>
        </div>
        <div class="line" style="margin: 5px 0;"></div>
        ${cart.map(item => `
          <div class="item">
            <div class="item-name">${item.name}</div>
            <div class="item-details">
              <span style="flex: 1; text-align: right;">${item.price.toLocaleString('vi-VN')}đ</span>
              <span style="flex: 0.5; text-align: center;">x${item.quantity}</span>
              <span style="flex: 1; text-align: right; font-weight: bold;">${(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
            </div>
            ${item.notes ? `<div style="font-size: 10px; color: gray; font-style: italic;">→ ${item.notes}</div>` : ''}
          </div>
        `).join('')}
        <div class="line"></div>
        <div class="total">
          <span>TỔNG CỘNG:</span>
          <span>${cartTotal.toLocaleString('vi-VN')}đ</span>
        </div>
        <div class="line"></div>
        <div class="center">Cảm ơn quý khách!</div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  const cartTotal = cart.reduce((a, b) => a + b.price * b.quantity, 0);
  const cartItemCount = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className="flex h-screen relative bg-gray-100">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white shadow z-10 flex items-center px-4 justify-between">
        <div className="flex items-center gap-4 ml-12">
          <h1 className="text-xl font-bold text-blue-800">Lên đơn</h1>
        </div>
        <a href="/pos" className="text-gray-500 hover:text-blue-600">
          Chuyển sang F&B Mode
        </a>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
              <button onClick={() => setSelectedProduct(null)}>
                <X />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              {selectedProduct.modifiers.map((pm, idx) => {
                const opts: string[] = JSON.parse(pm.modifier.options);
                return (
                  <div key={idx}>
                    <label className="block font-medium mb-1">{pm.modifier.name}</label>
                    <div className="flex flex-wrap gap-2">
                      {opts.map((opt) => (
                        <button
                          key={opt}
                          onClick={() =>
                            setCurrentOptions((prev) => ({
                              ...prev,
                              [pm.modifier.name]: opt,
                            }))
                          }
                          className={`px-3 py-1 rounded border text-sm ${currentOptions[pm.modifier.name] === opt
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 hover:bg-gray-100"
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
              Thêm vào đơn
            </button>
          </div>
        </div>
      )}

      {/* Drafts Modal */}
      {showDrafts && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Hóa đơn tạm</h3>
              <button onClick={() => setShowDrafts(false)}>
                <X />
              </button>
            </div>
            {drafts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Chưa có hóa đơn tạm</p>
            ) : (
              <div className="space-y-2">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => loadDraft(draft)}
                    >
                      <div className="font-medium">{draft.name}</div>
                      <div className="text-sm text-gray-500">
                        {draft.items.reduce((a, b) => a + b.quantity, 0)} sản phẩm
                      </div>
                    </div>
                    <button
                      onClick={() => deleteDraft(draft.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex w-full pt-16 h-full">
        {/* Left: Products */}
        <div className="w-2/3 flex flex-col">
          {/* Search & Filter - Sticky */}
          <div className="p-4 pb-0 bg-gray-100 sticky top-16 z-10">
            <div className="flex gap-3 pb-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Select */}
              <select
                value={selectedCategory ?? ""}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                className="px-4 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 pt-0">
            <div className="grid grid-cols-5 gap-3">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleProductClick(p)}
                  className="bg-white rounded-lg shadow hover:shadow-md cursor-pointer border hover:border-blue-400 transition-all overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                      src={getImageUrl(p.image)}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/thumbnail_default.png";
                      }}
                    />
                  </div>
                  <div className="p-3 text-center">
                    <div className="font-medium text-sm line-clamp-1">{p.name}</div>
                    <div className="text-blue-600 font-bold text-sm">
                      {p.price.toLocaleString("vi-VN")} đ
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart */}
        <div className="w-1/3 bg-white border-l flex flex-col shadow-xl">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Hóa đơn</h3>
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-sm font-medium">
                {cartItemCount}
              </span>
            </div>
            <div className="flex gap-2">
              {drafts.length > 0 && (
                <button
                  onClick={() => setShowDrafts(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Tạm ({drafts.length})
                </button>
              )}
              <button
                onClick={saveDraft}
                disabled={cart.length === 0}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-50"
                title="Lưu tạm"
              >
                <Save size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Chưa có sản phẩm</p>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="flex gap-3 mb-3 pb-3 border-b">
                  {/* Item thumbnail */}
                  <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/thumbnail_default.png";
                      }}
                    />
                  </div>

                  {/* Item info - name and unit price */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{item.name}</div>
                    {item.notes && (
                      <div className="text-xs text-gray-500 truncate">{item.notes}</div>
                    )}
                    <div className="text-gray-500 text-xs">
                      {item.price.toLocaleString("vi-VN")} đ
                    </div>
                  </div>

                  {/* Quantity controls with total */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(idx, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(idx, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeItem(idx)}
                        className="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-50 rounded ml-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {/* Total - right edge aligns with + button */}
                    <div className="text-blue-600 font-bold text-sm mr-9">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between text-xl font-bold mb-4">
              <span>Tổng cộng:</span>
              <span className="text-blue-600">{cartTotal.toLocaleString("vi-VN")} đ</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowPaymentOptions(true)}
                disabled={cart.length === 0}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                THANH TOÁN
              </button>

              {/* Payment Options Popup */}
              {showPaymentOptions && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowPaymentOptions(false)}
                  />
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border z-50 overflow-hidden">
                    <button
                      onClick={() => checkout(false)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b"
                    >
                      <Check size={20} className="text-green-600" />
                      <div>
                        <div className="font-medium">Hoàn thành</div>
                        <div className="text-xs text-gray-500">Thanh toán không in hóa đơn</div>
                      </div>
                    </button>
                    <button
                      onClick={() => checkout(true)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Printer size={20} className="text-blue-600" />
                      <div>
                        <div className="font-medium">Hoàn thành - In hóa đơn</div>
                        <div className="text-xs text-gray-500">Thanh toán và in hóa đơn</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
