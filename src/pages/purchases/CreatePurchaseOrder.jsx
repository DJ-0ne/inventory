// src/pages/purchases/CreatePurchaseOrder.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Search,
  Printer,
  Download,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import dataService from "../../services/dataService";

const CreatePurchaseOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(null);

  const [formData, setFormData] = useState({
    supplier: "",
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: "",
    notes: "",
    status: "Pending",
    priority: "Normal"
  });

  const suppliers = ["ToolCo Ltd", "ColorMaster Inc", "BuildRight Supplies", "SafetyFirst Corp", "ElectroParts Inc", "WoodCraft Supplies"];

  // Load products
  useEffect(() => {
    const allProducts = dataService.getProducts();
    setProducts(allProducts);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      productId: "",
      product: "",
      sku: "",
      quantity: 1,
      price: 0,
      total: 0
    };
    setOrderItems([...orderItems, newItem]);
    setCurrentItemIndex(orderItems.length);
    setShowProductSearch(true);
  };

  const removeItem = (id) => {
    if (orderItems.length <= 1) {
      alert("You must have at least one item in the order");
      return;
    }
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setOrderItems(orderItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate total if quantity or price changes
        if (field === 'quantity' || field === 'price') {
          updated.total = (updated.quantity || 0) * (updated.price || 0);
        }
        return updated;
      }
      return item;
    }));
  };

  const selectProduct = (product, index) => {
    setOrderItems(orderItems.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          productId: product.id,
          product: product.name,
          sku: product.sku,
          price: product.price,
          quantity: 1,
          total: product.price
        };
      }
      return item;
    }));
    setShowProductSearch(false);
    setSearchTerm("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate
    if (!formData.supplier) {
      alert("Please select a supplier");
      setLoading(false);
      return;
    }

    if (orderItems.length === 0) {
      alert("Please add at least one item to the order");
      setLoading(false);
      return;
    }

    // Check if all items have products
    const emptyItems = orderItems.filter(item => !item.product);
    if (emptyItems.length > 0) {
      alert("Please select products for all items");
      setLoading(false);
      return;
    }

    // Calculate total
    const total = orderItems.reduce((sum, item) => sum + (item.total || 0), 0);

    // Create purchase order
    const purchaseOrder = {
      id: `PO-${Date.now().toString().slice(-6)}`,
      supplier: formData.supplier,
      date: formData.orderDate,
      expectedDate: formData.expectedDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: formData.status,
      priority: formData.priority,
      notes: formData.notes,
      items: orderItems,
      total: total,
      createdAt: new Date().toISOString()
    };

    // Save to dataService
    dataService.addPurchaseOrder(purchaseOrder);

    setLoading(false);
    alert(`✅ Purchase Order created successfully!\nOrder ID: ${purchaseOrder.id}\nTotal: $${total.toFixed(2)}`);
    navigate('/purchases/orders');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real app, this would generate a PDF
    alert("PDF download functionality would be implemented here");
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grandTotal = orderItems.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Create Purchase Order</h1>
          <p className="text-gray-600 font-medium text-sm">Generate a new purchase order for suppliers</p>
        </div>
        <Link to="/purchases/orders">
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Orders</span>
          </button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Order Details */}
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Order Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                    Supplier <span className="text-red-800">*</span>
                  </label>
                  <select
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((sup, index) => (
                      <option key={index} value={sup}>{sup}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Order Date</label>
                  <input
                    type="date"
                    name="orderDate"
                    value={formData.orderDate}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Expected Delivery</label>
                  <input
                    type="date"
                    name="expectedDate"
                    value={formData.expectedDate}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-blue-950">Order Items</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 bg-blue-950 text-white px-3 py-1 text-sm font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>

              {/* Product Search */}
              {showProductSearch && (
                <div className="mb-4 p-4 bg-gray-50 border-2 border-blue-950/10">
                  <h3 className="text-sm font-bold text-blue-950 mb-2">Search Products</h3>
                  <div className="flex items-center border-2 border-blue-950/10 px-3 py-1">
                    <Search size={18} className="text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or SKU..."
                      className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowProductSearch(false)}
                      className="text-gray-400 hover:text-red-800"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  {searchTerm && (
                    <div className="border-2 border-blue-950/10 mt-2 max-h-48 overflow-y-auto">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product, index) => (
                          <div
                            key={product.id}
                            className="p-2 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors flex items-center justify-between"
                            onClick={() => selectProduct(product, currentItemIndex)}
                          >
                            <div>
                              <p className="font-bold text-blue-950 text-sm">{product.name}</p>
                              <p className="text-xs text-gray-600">SKU: {product.sku} | Stock: {product.stock}</p>
                            </div>
                            <span className="font-bold text-blue-950 text-sm">${product.price.toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-600 font-medium">No products found</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-blue-950/10 bg-gray-50">
                      <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
                      <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
                      <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Qty</th>
                      <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Price</th>
                      <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Total</th>
                      <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-4 text-center text-gray-500 font-medium">
                          No items added. Click "Add Item" to start.
                        </td>
                      </tr>
                    ) : (
                      orderItems.map((item, index) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={item.product}
                                className="w-full border-2 border-blue-950/10 px-2 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                                placeholder="Product name"
                                readOnly
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentItemIndex(index);
                                  setShowProductSearch(true);
                                }}
                                className="text-blue-950 hover:text-blue-700 text-xs font-bold"
                              >
                                <Search size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.sku}
                              className="w-full border-2 border-blue-950/10 px-2 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-gray-50"
                              placeholder="SKU"
                              readOnly
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-20 border-2 border-blue-950/10 px-2 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 text-center"
                              placeholder="0"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.price}
                              onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                              className="w-24 border-2 border-blue-950/10 px-2 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="py-2 px-3 font-bold text-blue-950">
                            ${(item.total || 0).toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-red-800 hover:text-red-900 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-blue-950/10">
                      <td colSpan="4" className="py-3 px-3 text-right font-bold text-blue-950 text-lg">Grand Total:</td>
                      <td className="py-3 px-3 font-bold text-blue-950 text-lg">
                        ${grandTotal.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Notes</h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                placeholder="Additional notes or instructions..."
              ></textarea>
            </div>

            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Actions</h2>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 mb-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {loading ? 'Creating...' : 'Create Order'}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="w-full bg-white border-2 border-blue-950/20 text-blue-950 py-3 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Print Preview
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="w-full bg-white border-2 border-blue-950/20 text-blue-950 py-3 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mt-4">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Items:</span>
                  <span className="font-bold text-blue-950">{orderItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Total Quantity:</span>
                  <span className="font-bold text-blue-950">
                    {orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600 font-medium">Grand Total:</span>
                  <span className="font-bold text-blue-950 text-lg">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchaseOrder;