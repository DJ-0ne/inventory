// src/pages/inventory/LowStock.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  AlertTriangle, 
  Package,
  ShoppingCart,
  Clock,
  Eye,
  RefreshCw,
  Download
} from "lucide-react";
import dataService from "../../services/dataService";

const LowStock = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Load low stock items from dataService
  useEffect(() => {
    loadLowStockItems();
    const unsubscribe = dataService.subscribe('products', loadLowStockItems);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterItems();
  }, [lowStockItems, searchTerm, filterCategory]);

  const loadLowStockItems = () => {
    const allProducts = dataService.getProducts();
    // Get products that are low stock or out of stock
    const lowStock = allProducts.filter(p => 
      p.status === 'Low Stock' || 
      p.status === 'Critical' || 
      p.status === 'Out of Stock' ||
      p.stock <= (p.threshold || 10)
    );
    setLowStockItems(lowStock);
    setFilteredItems(lowStock);
    setLoading(false);
  };

  const filterItems = () => {
    let filtered = [...lowStockItems];
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    
    setFilteredItems(filtered);
  };

  const getPriorityColor = (stock, reorder) => {
    const ratio = stock / reorder;
    if (stock === 0) return "bg-red-800 text-white";
    if (ratio < 0.3) return "bg-orange-600 text-white";
    return "bg-yellow-600 text-white";
  };

  const getPriorityLabel = (stock, reorder) => {
    const ratio = stock / reorder;
    if (stock === 0) return "Out of Stock";
    if (ratio < 0.3) return "Critical";
    if (ratio < 0.5) return "Low";
    return "Warning";
  };

  const handleReorder = (productId) => {
    const product = dataService.getProduct(productId);
    if (product) {
      const reorderQty = product.reorder || 20;
      // Create a purchase order
      dataService.addPurchaseOrder({
        supplier: product.supplier || 'Unknown',
        items: [{ 
          productId: product.id, 
          name: product.name, 
          quantity: reorderQty, 
          price: product.price 
        }],
        total: reorderQty * product.price
      });
      
      // Update product status to show reorder is in progress
      dataService.updateProduct(productId, { 
        status: 'Reorder Pending',
        lastOrdered: new Date().toISOString().split('T')[0]
      });
      
      alert(`Reorder placed for ${product.name} (${reorderQty} units)`);
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/inventory/product/${productId}`);
  };

  const handleRefresh = () => {
    loadLowStockItems();
  };

  const handleExport = () => {
    const headers = ['Product', 'SKU', 'Category', 'Current Stock', 'Reorder Level', 'Priority', 'Supplier', 'Last Ordered'];
    const rows = filteredItems.map(item => 
      [item.name, item.sku, item.category, item.stock, item.threshold || 10, getPriorityLabel(item.stock, item.threshold || 10), item.supplier || 'N/A', item.lastOrdered || 'Never']
    );
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `low_stock_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Get unique categories for filter
  const categories = ['all', ...new Set(lowStockItems.map(item => item.category))];

  const totalLowStock = lowStockItems.length;
  const urgentCount = lowStockItems.filter(item => item.stock === 0 || item.status === 'Out of Stock').length;
  const criticalCount = lowStockItems.filter(item => item.stock > 0 && item.stock <= (item.threshold || 10) * 0.3).length;
  const totalSuppliers = [...new Set(lowStockItems.map(item => item.supplier))].length;

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading low stock items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Low Stock Items</h1>
          <p className="text-gray-600 font-medium text-sm">Products that need immediate attention and reordering</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            <span className="text-sm">Refresh</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            <span className="text-sm">Export</span>
          </button>
          <Link to="/inventory/products">
            <button className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Products</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Low Stock Items</p>
          <p className="text-2xl font-bold text-orange-600">{totalLowStock}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-red-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Out of Stock</p>
          <p className="text-2xl font-bold text-red-800">{urgentCount}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Critical</p>
          <p className="text-2xl font-bold text-orange-600">{criticalCount}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Suppliers</p>
          <p className="text-2xl font-bold text-blue-950">{totalSuppliers}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <input 
              type="text" 
              placeholder="Search by name, SKU, or supplier..." 
              className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none bg-white"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.filter(c => c !== 'all').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button 
            className="bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950"
            onClick={filterItems}
          >
            Apply Filters
          </button>
          <div className="text-sm text-gray-600 font-medium">
            Showing {filteredItems.length} of {lowStockItems.length} items
          </div>
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Category</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Current Stock</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Reorder Level</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Priority</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Supplier</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                  No low stock items found. All products are well stocked!
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-950">{item.name}</td>
                  <td className="py-3 px-4 text-gray-600 font-medium text-xs">{item.sku}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{item.category}</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${item.stock === 0 ? 'text-red-800' : 'text-orange-600'}`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-medium">{item.threshold || 10}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-bold ${getPriorityColor(item.stock, item.threshold || 10)}`}>
                      {getPriorityLabel(item.stock, item.threshold || 10)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{item.supplier || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleReorder(item.id)}
                        className="bg-orange-600 text-white px-3 py-1 text-xs font-bold hover:bg-orange-700 transition-colors border-2 border-orange-600"
                      >
                        Reorder
                      </button>
                      <button 
                        onClick={() => handleViewProduct(item.id)}
                        className="text-blue-950 hover:text-blue-700 transition-colors"
                        title="View Product"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Table Footer */}
        <div className="flex items-center justify-between p-4 border-t-2 border-blue-950/10">
          <p className="text-sm text-gray-600 font-medium">
            Showing {filteredItems.length} of {lowStockItems.length} low stock items
          </p>
          {filteredItems.length > 0 && (
            <div className="text-sm text-gray-600 font-medium">
              <span className="text-red-800 font-bold">{urgentCount}</span> items need immediate attention
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LowStock;