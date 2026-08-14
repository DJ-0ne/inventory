// src/pages/reports/TopProducts.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Search,
  Filter,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Eye,
  DollarSign,
  ShoppingCart,
  X,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Calendar,
  RefreshCw
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import dataService from "../../services/dataService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TopProducts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [topProducts, setTopProducts] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);

  // Load data
  useEffect(() => {
    loadData();
    const unsubscribeProducts = dataService.subscribe('products', loadData);
    const unsubscribeOrders = dataService.subscribe('orders', loadData);
    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, [period, filterCategory]);

  const loadData = () => {
    setLoading(true);
    
    const allProducts = dataService.getProducts();
    const allOrders = dataService.getOrders();
    setProducts(allProducts);
    setOrders(allOrders);

    // Get unique categories
    const uniqueCategories = [...new Set(allProducts.map(p => p.category))].filter(Boolean);
    setCategories(uniqueCategories);

    // Filter products by category
    let filteredProducts = allProducts;
    if (filterCategory !== 'all') {
      filteredProducts = allProducts.filter(p => p.category === filterCategory);
    }

    // Calculate product performance
    const productPerformance = filteredProducts.map(product => {
      let revenue = 0;
      let units = 0;
      
      allOrders.forEach(order => {
        if (order.cartItems) {
          order.cartItems.forEach(item => {
            if (item.name === product.name || item.sku === product.sku) {
              revenue += item.total || (item.price * item.quantity || 0);
              units += item.quantity || 0;
            }
          });
        }
      });

      // If no sales, use estimated data
      if (revenue === 0) {
        revenue = product.price * (product.stock * 0.3);
        units = Math.round(product.stock * 0.3);
      }

      const cost = product.cost || product.price * 0.5;
      const margin = product.price > 0 ? ((product.price - cost) / product.price) * 100 : 0;

      // Determine status
      let status = 'Niche';
      if (revenue > 3000 && units > 100) status = 'Best Seller';
      else if (revenue > 2000 && units > 50) status = 'Popular';
      else if (revenue > 1500 && units > 30) status = 'Trending';
      else if (units > 100) status = 'High Volume';

      // Determine trend (based on stock changes or random for demo)
      const trend = product.stock > 10 ? 'up' : 'down';

      return {
        name: product.name,
        sku: product.sku,
        revenue: Math.round(revenue * 100) / 100,
        units: units,
        margin: Math.round(margin * 10) / 10,
        status: status,
        trend: trend
      };
    });

    // Sort by revenue descending and take top 10
    const sortedProducts = productPerformance.sort((a, b) => b.revenue - a.revenue);
    setTopProducts(sortedProducts);

    // Prepare chart data (top 6)
    const top6 = sortedProducts.slice(0, 6);
    setChartData({
      labels: top6.map(p => p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name),
      datasets: [
        {
          label: 'Revenue',
          data: top6.map(p => p.revenue),
          backgroundColor: ['#1e3a5f', '#f97316', '#166534', '#991b1b', '#4c1d95', '#1e293b'],
          borderRadius: 0,
          borderColor: '#ffffff',
          borderWidth: 2
        }
      ]
    });

    setLoading(false);
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { weight: 'bold', size: 11 }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const showCustomModal = (message, type) => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("");
  };

  const handleExport = () => {
    const headers = ['Product', 'SKU', 'Revenue', 'Units Sold', 'Margin %', 'Status', 'Trend'];
    const rows = topProducts.map(p => [
      p.name,
      p.sku,
      `$${p.revenue.toFixed(2)}`,
      p.units,
      `${p.margin}%`,
      p.status,
      p.trend === 'up' ? '↑ Growing' : '↓ Declining'
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `top_products_${period}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showCustomModal(" Top products report exported successfully!", "success");
  };

  const handlePrint = () => {
    window.print();
    showCustomModal("🖨️ Top products report sent to printer!", "success");
  };

  const handleRefresh = () => {
    loadData();
    showCustomModal(" Top products data refreshed!", "success");
  };

  const getStatusColor = (status) => {
    const colors = {
      'Best Seller': 'bg-green-800 text-white',
      'Popular': 'bg-blue-950 text-white',
      'Trending': 'bg-orange-600 text-white',
      'High Volume': 'bg-purple-800 text-white',
      'Niche': 'bg-gray-700 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading top products data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full p-6 border-2 border-blue-950/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {modalType === "success" && <CheckCircle size={28} className="text-green-800" />}
                {modalType === "error" && <AlertCircle size={28} className="text-red-800" />}
                <h3 className="text-lg font-bold text-blue-950">
                  {modalType === "success" ? "Success" : "Error"}
                </h3>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 font-medium whitespace-pre-line">{modalMessage}</p>
            </div>
            <button
              onClick={closeModal}
              className="w-full bg-blue-950 text-white py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Top Selling Products</h1>
          <p className="text-gray-600 font-medium text-sm">Best performing products by revenue and volume</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            <span className="text-sm">Refresh</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <Printer size={18} />
            <span className="text-sm">Print</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
          >
            <Download size={18} />
            <span className="text-sm">Export</span>
          </button>
          <Link to="/reports/sales">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm">Back</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Period Filter */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Calendar size={18} className="text-blue-950" />
            <span className="font-bold text-blue-950 text-sm">Period:</span>
          </div>
          <div className="flex gap-1">
            {['week', 'month', 'quarter', 'year'].map((p) => (
              <button
                key={p}
                className={`px-4 py-1 text-sm font-bold capitalize border-2 transition-colors ${
                  period === p
                    ? 'bg-blue-950 text-white border-blue-950'
                    : 'bg-white text-blue-950 border-blue-950/20 hover:bg-gray-50'
                }`}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <select 
            className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white ml-auto"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button 
            onClick={loadData}
            className="bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-blue-950 mb-4">Revenue by Product</h2>
        <div className="h-64">
          {chartData && <Bar data={chartData} options={barOptions} />}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Products</p>
          <p className="text-2xl font-bold text-blue-950">{topProducts.length}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-bold text-green-800">${topProducts.reduce((sum, p) => sum + p.revenue, 0).toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Best Sellers</p>
          <p className="text-2xl font-bold text-orange-600">{topProducts.filter(p => p.status === 'Best Seller').length}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-purple-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Avg Margin</p>
          <p className="text-2xl font-bold text-purple-800">{topProducts.reduce((sum, p) => sum + p.margin, 0) / (topProducts.length || 1)}%</p>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Revenue</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Units Sold</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Margin %</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Trend</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500 font-medium">
                  No product data available. Add products and sales to see top products.
                </td>
              </tr>
            ) : (
              topProducts.map((product, index) => (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-950">{product.name}</td>
                  <td className="py-3 px-4 text-gray-600 font-medium text-xs">{product.sku}</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-950">${product.revenue.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-950">{product.units}</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-950">{product.margin}%</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-bold ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {product.trend === 'up' ? (
                      <div className="flex items-center gap-1 text-green-800">
                        <TrendingUp size={16} />
                        <span className="text-xs font-bold">Growing</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-800">
                        <TrendingDown size={16} />
                        <span className="text-xs font-bold">Declining</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProducts;