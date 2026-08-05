// src/pages/inventory/StockAdjustment.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Minus,
  Save,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  Download
} from "lucide-react";
import dataService from "../../services/dataService";

const StockAdjustment = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [adjustments, setAdjustments] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustType, setAdjustType] = useState("add");
  const [adjustQuantity, setAdjustQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const reasons = [
    "Stock Count Correction",
    "Damaged Goods",
    "Returns",
    "Supplier Credit",
    "Theft/Loss",
    "Expired Products",
    "Transfer In",
    "Transfer Out",
    "Other"
  ];

  // Load products from dataService
  useEffect(() => {
    loadProducts();
    const unsubscribe = dataService.subscribe('products', loadProducts);
    return () => unsubscribe();
  }, []);

  const loadProducts = () => {
    const allProducts = dataService.getProducts();
    setProducts(allProducts);
    setLoading(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setAdjustQuantity(1);
    setReason("");
  };

  const handleAddAdjustment = () => {
    if (!selectedProduct || !reason || adjustQuantity <= 0) return;

    // Check if removing more than available
    if (adjustType === "remove" && adjustQuantity > selectedProduct.stock) {
      alert(`Cannot remove ${adjustQuantity} units. Only ${selectedProduct.stock} units available.`);
      return;
    }

    // Update stock in dataService
    const newStock = adjustType === "add" 
      ? selectedProduct.stock + adjustQuantity 
      : selectedProduct.stock - adjustQuantity;

    dataService.updateProduct(selectedProduct.id, {
      stock: newStock,
      status: newStock <= (selectedProduct.threshold || 10) 
        ? (newStock === 0 ? 'Out of Stock' : 'Low Stock')
        : 'In Stock'
    });

    // Add to adjustment history
    const newAdjustment = {
      id: Date.now(),
      product: selectedProduct.name,
      sku: selectedProduct.sku,
      type: adjustType,
      quantity: adjustQuantity,
      reason: reason,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      status: "Completed",
      previousStock: selectedProduct.stock,
      newStock: newStock
    };

    setAdjustments([newAdjustment, ...adjustments]);
    
    // Reset form
    setSelectedProduct(null);
    setAdjustQuantity(1);
    setReason("");
    setSearchTerm("");

    // Show success message
    alert(`✅ Stock adjustment completed!\n${selectedProduct.name}\n${adjustType === 'add' ? 'Added' : 'Removed'}: ${adjustQuantity} units\nPrevious stock: ${selectedProduct.stock}\nNew stock: ${newStock}`);
  };

  const handleViewProduct = (productId) => {
    navigate(`/inventory/product/${productId}`);
  };

  const handleRefresh = () => {
    loadProducts();
  };

  const handleExport = () => {
    const headers = ['Product', 'SKU', 'Type', 'Quantity', 'Previous Stock', 'New Stock', 'Reason', 'Date', 'Status'];
    const rows = adjustments.map(adj => 
      [adj.product, adj.sku, adj.type === 'add' ? 'Added' : 'Removed', adj.quantity, adj.previousStock || 'N/A', adj.newStock || 'N/A', adj.reason, adj.date, adj.status]
    );
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_adjustments_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getTypeColor = (type) => {
    return type === "add" ? "text-green-800" : "text-red-800";
  };

  const getTypeBg = (type) => {
    return type === "add" ? "bg-green-100" : "bg-red-100";
  };

  const getTypeLabel = (type) => {
    return type === "add" ? "Added" : "Removed";
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Completed': 'bg-green-800 text-white',
      'Pending': 'bg-orange-600 text-white',
      'Failed': 'bg-red-800 text-white'
    };
    return <span className={`px-2 py-1 text-xs font-bold ${styles[status] || 'bg-gray-700 text-white'}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Stock Adjustment</h1>
          <p className="text-gray-600 font-medium text-sm">Adjust inventory levels for corrections, damages, or returns</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            <span className="text-sm">Refresh</span>
          </button>
          {adjustments.length > 0 && (
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
            >
              <Download size={18} />
              <span className="text-sm">Export</span>
            </button>
          )}
          <Link to="/inventory/products">
            <button className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Products</span>
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Select Product</h2>
            <div className="flex items-center border-2 border-blue-950/10 px-3 py-1">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search product by name or SKU..."
                className="px-2 py-2 text-sm outline-none font-medium text-blue-950 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {searchTerm && (
              <div className="border-2 border-blue-950/10 mt-2 max-h-48 overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedProduct?.id === product.id ? 'bg-blue-950/5 border-l-4 border-blue-950' : ''
                      }`}
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-blue-950">{product.name}</p>
                          <p className="text-xs text-gray-600 font-medium">SKU: {product.sku} | {product.category}</p>
                        </div>
                        <span className={`font-bold ${product.stock === 0 ? 'text-red-800' : product.stock <= (product.threshold || 10) ? 'text-orange-600' : 'text-blue-950'}`}>
                          Stock: {product.stock}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-600 font-medium">No products found</div>
                )}
              </div>
            )}
          </div>

          {/* Adjustment Form */}
          {selectedProduct && (
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Adjustment Details</h2>
              <div className="bg-gray-50 p-3 mb-4 border-l-4 border-blue-950">
                <p className="font-bold text-blue-950">{selectedProduct.name}</p>
                <p className="text-sm text-gray-600 font-medium">SKU: {selectedProduct.sku} | Current Stock: {selectedProduct.stock}</p>
                <p className="text-xs text-gray-500">Status: {selectedProduct.status}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Adjustment Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`flex-1 py-2 font-bold text-sm border-2 transition-colors ${
                        adjustType === "add" 
                          ? "bg-green-800 text-white border-green-800" 
                          : "bg-white text-blue-950 border-blue-950/20 hover:bg-gray-50"
                      }`}
                      onClick={() => setAdjustType("add")}
                    >
                      <Plus size={16} className="inline mr-1" />
                      Add
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 font-bold text-sm border-2 transition-colors ${
                        adjustType === "remove" 
                          ? "bg-red-800 text-white border-red-800" 
                          : "bg-white text-blue-950 border-blue-950/20 hover:bg-gray-50"
                      }`}
                      onClick={() => setAdjustType("remove")}
                    >
                      <Minus size={16} className="inline mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  />
                  {adjustType === "remove" && adjustQuantity > selectedProduct.stock && (
                    <p className="text-red-800 text-xs font-bold mt-1">⚠️ Exceeds available stock: {selectedProduct.stock}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Reason</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                  >
                    <option value="">Select Reason</option>
                    {reasons.map((r, index) => (
                      <option key={index} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {adjustType === "remove" && (
                <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-600">
                  <p className="text-sm text-yellow-800 font-medium flex items-center gap-2">
                    <AlertCircle size={16} />
                    You are about to remove {adjustQuantity} units from {selectedProduct.name}
                  </p>
                </div>
              )}

              <button
                onClick={handleAddAdjustment}
                disabled={!reason || adjustQuantity <= 0 || (adjustType === "remove" && adjustQuantity > selectedProduct.stock)}
                className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {adjustType === "add" ? `Add ${adjustQuantity} units` : `Remove ${adjustQuantity} units`}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar - Recent Adjustments */}
        <div>
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Recent Adjustments</h2>
            {adjustments.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {adjustments.map((adj) => (
                  <div key={adj.id} className={`border-l-4 ${adj.type === 'add' ? 'border-green-800' : 'border-red-800'} p-3 bg-gray-50`}>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-blue-950 text-sm">{adj.product}</p>
                      <span className={`font-bold text-sm ${getTypeColor(adj.type)}`}>
                        {adj.type === "add" ? '+' : '-'}{adj.quantity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div>
                        <p className="text-xs text-gray-600 font-medium">{adj.reason}</p>
                        <p className="text-xs text-gray-500">{adj.date} {adj.time}</p>
                        {adj.previousStock !== undefined && (
                          <p className="text-xs text-gray-500">
                            Stock: {adj.previousStock} → {adj.newStock}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(adj.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 font-medium">No adjustments yet</p>
                <p className="text-sm text-gray-500">Select a product to start</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mt-4">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Quick Stats</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Total Adjustments</span>
                <span className="font-bold text-blue-950">{adjustments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Additions</span>
                <span className="font-bold text-green-800">
                  {adjustments.filter(a => a.type === 'add').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Removals</span>
                <span className="font-bold text-red-800">
                  {adjustments.filter(a => a.type === 'remove').length}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600 font-medium">Net Change</span>
                <span className={`font-bold ${adjustments.reduce((sum, a) => sum + (a.type === 'add' ? a.quantity : -a.quantity), 0) >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                  {adjustments.reduce((sum, a) => sum + (a.type === 'add' ? a.quantity : -a.quantity), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustment;