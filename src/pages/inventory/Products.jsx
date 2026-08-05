// src/pages/inventory/Products.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  Package,
  AlertTriangle,
  PackageX,
  RefreshCw
} from "lucide-react";
import dataService from "../../services/dataService";
import { useAuth } from "../../context/AuthContext";

const Products = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const canEdit = hasPermission('inventory', 'edit');
  const canDelete = hasPermission('inventory', 'delete');

  // Load products from dataService
  useEffect(() => {
    loadProducts();
    // Subscribe to product changes
    const unsubscribe = dataService.subscribe('products', loadProducts);
    return () => unsubscribe();
  }, []);

  // Filter products when search/filters change
  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filterCategory, filterStatus]);

  const loadProducts = () => {
    const allProducts = dataService.getProducts();
    setProducts(allProducts);
    setFilteredProducts(allProducts);
    setLoading(false);
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  // Get unique categories for filter
  const categories = ['all', ...new Set(products.map(p => p.category))];
  const statuses = ['all', 'In Stock', 'Low Stock', 'Critical', 'Out of Stock'];

  const getStatusColor = (status) => {
    const colors = {
      'In Stock': 'bg-green-800 text-white',
      'Low Stock': 'bg-orange-600 text-white',
      'Critical': 'bg-red-800 text-white',
      'Out of Stock': 'bg-red-800 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  // Handle product actions
  const handleView = (id) => {
    navigate(`/inventory/product/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/inventory/edit-product/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dataService.deleteProduct(id);
      alert('Product deleted successfully!');
    }
  };

  const handleReorder = (productId) => {
    const product = dataService.getProduct(productId);
    if (product) {
      // Create a purchase order
      dataService.addPurchaseOrder({
        supplier: product.supplier || 'Unknown',
        items: [{ 
          productId: product.id, 
          name: product.name, 
          quantity: product.reorder || 20, 
          price: product.price 
        }],
        total: (product.reorder || 20) * product.price
      });
      alert(`Reorder placed for ${product.name} (${product.reorder || 20} units)`);
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ['Product', 'SKU', 'Category', 'Price', 'Cost', 'Stock', 'Reorder Level', 'Status', 'Supplier'];
    const rows = filteredProducts.map(p => 
      [p.name, p.sku, p.category, `$${p.price}`, `$${p.cost || p.price * 0.5}`, p.stock, p.reorder || 10, p.status, p.supplier || 'N/A']
    );
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Get stats
  const getStats = () => {
    const total = products.length;
    const inStock = products.filter(p => p.status === 'In Stock').length;
    const lowStock = products.filter(p => p.status === 'Low Stock' || p.status === 'Critical').length;
    const outOfStock = products.filter(p => p.status === 'Out of Stock' || p.stock === 0).length;
    return { total, inStock, lowStock, outOfStock };
  };

  const stats = getStats();

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          <h1 className="text-2xl font-bold text-blue-950">All Products</h1>
          <p className="text-gray-600 font-medium text-sm">Complete inventory list with stock status and details</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadProducts}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            <span className="text-sm">Refresh</span>
          </button>
          <Link to="/inventory/add-product">
            <button className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
              <Plus size={18} />
              <span className="text-sm">Add Product</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Products</p>
          <p className="text-2xl font-bold text-blue-950">{stats.total}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">In Stock</p>
          <p className="text-2xl font-bold text-green-800">{stats.inStock}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Low Stock</p>
          <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-red-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Out of Stock</p>
          <p className="text-2xl font-bold text-red-800">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, SKU, or category..." 
              className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
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
            <select 
              className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status}
                </option>
              ))}
            </select>
            <button 
              className="flex items-center gap-1 bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950"
              onClick={filterProducts}
            >
              <Filter size={16} />
              Apply
            </button>
            <button 
              className="flex items-center gap-1 bg-white border-2 border-blue-950/20 px-3 py-1 text-blue-950 font-bold text-sm hover:bg-gray-50 transition-colors"
              onClick={handleExport}
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Product Name</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Category</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Price</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Stock</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Reorder</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Supplier</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-8 text-center text-gray-500 font-medium">
                  No products found. Click "Add Product" to create one.
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-950">{product.name}</td>
                  <td className="py-3 px-4 text-gray-600 font-medium text-xs">{product.sku}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{product.category}</td>
                  <td className="py-3 px-4 font-bold text-blue-950">${product.price.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${product.stock <= (product.threshold || 10) ? 'text-red-800' : 'text-blue-950'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-medium">{product.threshold || 10}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-bold ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium text-xs">{product.supplier || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleView(product.id)}
                        className="text-blue-950 hover:text-blue-700 transition-colors"
                        title="View Product"
                      >
                        <Eye size={16} />
                      </button>
                      {canEdit && (
                        <button 
                          onClick={() => handleEdit(product.id)}
                          className="text-orange-600 hover:text-orange-800 transition-colors"
                          title="Edit Product"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="text-red-800 hover:text-red-900 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      {product.stock <= (product.threshold || 10) && (
                        <button 
                          onClick={() => handleReorder(product.id)}
                          className="bg-orange-600 text-white px-2 py-1 text-xs font-bold hover:bg-orange-700 transition-colors"
                          title="Reorder"
                        >
                          Reorder
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Table Footer with Pagination */}
        <div className="flex items-center justify-between p-4 border-t-2 border-blue-950/10">
          <p className="text-sm text-gray-600 font-medium">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border-2 border-blue-950/20 text-blue-950 font-bold text-sm hover:bg-blue-950 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 font-bold text-sm border-2 transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-950 text-white border-blue-950'
                      : 'border-blue-950/20 text-blue-950 hover:bg-blue-950 hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border-2 border-blue-950/20 text-blue-950 font-bold text-sm hover:bg-blue-950 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;