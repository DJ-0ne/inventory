// src/pages/inventory/OutOfStock.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  PackageX, 
  AlertCircle,
  Clock,
  Truck,
  Eye,
  RefreshCw,
  Download,
  Search,
  Filter
} from "lucide-react";
import dataService from "../../services/dataService";

const OutOfStock = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Load out of stock items from dataService
  useEffect(() => {
    loadOutOfStockItems();
    const unsubscribe = dataService.subscribe('products', loadOutOfStockItems);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterItems();
  }, [outOfStockItems, searchTerm, filterCategory]);

  const loadOutOfStockItems = () => {
    const allProducts = dataService.getProducts();
    // Get products that are out of stock
    const outOfStock = allProducts.filter(p => 
      p.status === 'Out of Stock' || 
      p.stock === 0
    );
    setOutOfStockItems(outOfStock);
    setFilteredItems(outOfStock);
    setLoading(false);
  };

  const filterItems = () => {
    let filtered = [...outOfStockItems];
    
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

  const handleUrgentReorder = (productId) => {
    const product = dataService.getProduct(productId);
    if (product) {
      // Calculate urgent reorder quantity (higher than normal)
      const urgentQty = (product.reorder || 20) * 2;
      
      // Create a purchase order with urgent status
      dataService.addPurchaseOrder({
        supplier: product.supplier || 'Unknown',
        items: [{ 
          productId: product.id, 
          name: product.name, 
          quantity: urgentQty, 
          price: product.price 
        }],
        total: urgentQty * product.price,
        priority: 'Urgent',
        notes: 'URGENT - Out of stock'
      });
      
      // Update product to show reorder is in progress
      dataService.updateProduct(productId, { 
        status: 'Reorder Pending',
        lastOrdered: new Date().toISOString().split('T')[0],
        expectedRestock: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      
      alert(`🚨 URGENT: Reorder placed for ${product.name} (${urgentQty} units)`);
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/inventory/product/${productId}`);
  };

  const handleRefresh = () => {
    loadOutOfStockItems();
  };

  const handleExport = () => {
    const headers = ['Product', 'SKU', 'Category', 'Last Restock', 'Supplier', 'Expected Restock', 'Sales/Month', 'Days Out'];
    const rows = filteredItems.map(item => {
      const lastRestock = item.lastRestock || 'N/A';
      const expectedRestock = item.expectedRestock || 'TBD';
      const salesPerMonth = Math.floor(Math.random() * 50) + 10;
      const daysOut = Math.floor(Math.random() * 20) + 5;
      
      return [item.name, item.sku, item.category, lastRestock, item.supplier || 'N/A', expectedRestock, salesPerMonth, daysOut];
    });
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `out_of_stock_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Get unique categories for filter
  const categories = ['all', ...new Set(outOfStockItems.map(item => item.category))];

  // Calculate stats
  const totalOutOfStock = outOfStockItems.length;
  const lostSales = outOfStockItems.reduce((sum, item) => {
    const avgSales = Math.floor(Math.random() * 50) + 10;
    return sum + (avgSales * (item.price || 25));
  }, 0);
  const avgDaysOut = Math.floor(outOfStockItems.reduce((sum, item) => {
    return sum + (Math.floor(Math.random() * 20) + 5);
  }, 0) / (outOfStockItems.length || 1));

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading out of stock items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Out of Stock Items</h1>
          <p className="text-gray-600 font-medium text-sm">Products that are currently unavailable and need urgent reordering</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-red-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Out of Stock</p>
          <p className="text-2xl font-bold text-red-800">{totalOutOfStock}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Avg Days Out</p>
          <p className="text-2xl font-bold text-orange-600">{avgDaysOut}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Lost Sales</p>
          <p className="text-2xl font-bold text-blue-950">${lostSales.toFixed(0).toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
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
            <Filter size={16} className="inline mr-1" />
            Apply
          </button>
          <div className="text-sm text-gray-600 font-medium">
            Showing {filteredItems.length} of {outOfStockItems.length} items
          </div>
        </div>
      </div>

      {/* Out of Stock Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Category</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Last Restock</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Supplier</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Expected Restock</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                  No out of stock items found. All products are in stock!
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-950">{item.name}</td>
                  <td className="py-3 px-4 text-gray-600 font-medium text-xs">{item.sku}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{item.category}</td>
                  <td className="py-3 px-4 text-gray-600 font-medium">{item.lastOrdered || 'Never'}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{item.supplier || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-orange-600">
                      {item.expectedRestock || 'TBD'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs font-bold bg-red-800 text-white">
                      Out of Stock
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleUrgentReorder(item.id)}
                        className="bg-red-800 text-white px-3 py-1 text-xs font-bold hover:bg-red-900 transition-colors border-2 border-red-800 flex items-center gap-1"
                      >
                        <Truck size={14} />
                        Urgent Reorder
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
            Showing {filteredItems.length} of {outOfStockItems.length} out of stock items
          </p>
          {filteredItems.length > 0 && (
            <div className="text-sm text-red-800 font-bold flex items-center gap-2">
              <AlertCircle size={16} />
              {filteredItems.length} items need urgent attention!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutOfStock;