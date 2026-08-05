// src/pages/reports/ProfitMargin.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Printer,
  ArrowLeft,
  X,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Package,
  BarChart3,
  Percent,
  Eye,
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

const ProfitMargin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [productMargins, setProductMargins] = useState([]);
  const [categoryMarginsData, setCategoryMarginsData] = useState(null);
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // Load data
  useEffect(() => {
    loadData();
    const unsubscribeProducts = dataService.subscribe('products', loadData);
    const unsubscribeOrders = dataService.subscribe('orders', loadData);
    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, [period]);

  const loadData = () => {
    setLoading(true);
    
    const allProducts = dataService.getProducts();
    const allOrders = dataService.getOrders();
    setProducts(allProducts);
    setOrders(allOrders);

    // Calculate product margins
    const margins = allProducts.map(product => {
      // Calculate revenue from orders
      let revenue = 0;
      allOrders.forEach(order => {
        if (order.cartItems) {
          order.cartItems.forEach(item => {
            if (item.name === product.name || item.sku === product.sku) {
              revenue += item.total || (item.price * item.quantity);
            }
          });
        }
      });

      // If no revenue from orders, use estimated revenue based on stock
      if (revenue === 0) {
        revenue = product.price * (product.stock * 0.3); // Estimated 30% of stock sold
      }

      const cost = product.cost || product.price * 0.5;
      const margin = product.price > 0 ? ((product.price - cost) / product.price) * 100 : 0;

      return {
        name: product.name,
        sku: product.sku,
        price: product.price,
        cost: cost,
        margin: Math.round(margin * 10) / 10,
        revenue: Math.round(revenue * 100) / 100
      };
    });

    // Sort by margin descending and take top products
    const sortedMargins = margins.sort((a, b) => b.margin - a.margin);
    setProductMargins(sortedMargins);

    // Calculate category margins
    const categoryMap = {};
    allProducts.forEach(product => {
      const category = product.category || 'Other';
      if (!categoryMap[category]) {
        categoryMap[category] = { totalPrice: 0, totalCost: 0, count: 0 };
      }
      const cost = product.cost || product.price * 0.5;
      categoryMap[category].totalPrice += product.price;
      categoryMap[category].totalCost += cost;
      categoryMap[category].count += 1;
    });

    const categoryLabels = Object.keys(categoryMap);
    const categoryMargins = categoryLabels.map(cat => {
      const data = categoryMap[cat];
      return data.totalPrice > 0 ? ((data.totalPrice - data.totalCost) / data.totalPrice) * 100 : 0;
    });

    setCategoryMarginsData({
      labels: categoryLabels,
      datasets: [
        {
          label: 'Margin %',
          data: categoryMargins.map(m => Math.round(m * 10) / 10),
          backgroundColor: ['#1e3a5f', '#f97316', '#166534', '#991b1b', '#4c1d95', '#0f766e'],
          borderRadius: 0,
          borderColor: '#ffffff',
          borderWidth: 2
        }
      ]
    });

    // Calculate stats
    const avgMargin = margins.reduce((sum, p) => sum + p.margin, 0) / (margins.length || 1);
    const highestMargin = Math.max(...margins.map(p => p.margin));
    const highestProduct = margins.find(p => p.margin === highestMargin);
    const lowestMargin = Math.min(...margins.map(p => p.margin));
    const lowestProduct = margins.find(p => p.margin === lowestMargin);
    const totalProfit = margins.reduce((sum, p) => sum + (p.revenue * (p.margin / 100)), 0);

    setStats({
      avgMargin: Math.round(avgMargin * 10) / 10,
      highestMargin: Math.round(highestMargin * 10) / 10,
      highestProduct: highestProduct?.name || 'N/A',
      lowestMargin: Math.round(lowestMargin * 10) / 10,
      lowestProduct: lowestProduct?.name || 'N/A',
      totalProfit: Math.round(totalProfit * 100) / 100
    });

    setLoading(false);
  };

  const marginChartData = {
    labels: productMargins.slice(0, 8).map(p => p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name),
    datasets: [
      {
        label: 'Margin %',
        data: productMargins.slice(0, 8).map(p => p.margin),
        backgroundColor: productMargins.slice(0, 8).map(p => 
          p.margin >= 50 ? '#166534' : p.margin >= 40 ? '#f97316' : '#991b1b'
        ),
        borderRadius: 0,
        borderColor: '#ffffff',
        borderWidth: 1
      }
    ]
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
    const headers = ['Product', 'SKU', 'Price', 'Cost', 'Margin %', 'Revenue', 'Profit'];
    const rows = productMargins.map(p => [
      p.name,
      p.sku,
      `$${p.price.toFixed(2)}`,
      `$${p.cost.toFixed(2)}`,
      `${p.margin}%`,
      `$${p.revenue.toFixed(2)}`,
      `$${(p.revenue * (p.margin / 100)).toFixed(2)}`
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit_margin_report_${period}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showCustomModal("✅ Profit margin report exported successfully!", "success");
  };

  const handlePrint = () => {
    window.print();
    showCustomModal("🖨️ Profit margin report sent to printer!", "success");
  };

  const handleRefresh = () => {
    loadData();
    showCustomModal("🔄 Profit margin data refreshed!", "success");
  };

  const getMarginColor = (margin) => {
    if (margin >= 50) return 'text-green-800';
    if (margin >= 40) return 'text-orange-600';
    return 'text-red-800';
  };

  const getMarginBg = (margin) => {
    if (margin >= 50) return 'bg-green-800 text-white';
    if (margin >= 40) return 'bg-orange-600 text-white';
    return 'bg-red-800 text-white';
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading profit margin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full p-6 border-2 border-blue-950/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
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
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Profit Margin Analysis</h1>
          <p className="text-gray-600 font-medium text-sm">Analyze profit margins across products and categories</p>
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

      {/* Period Selector */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-950" />
            <span className="font-bold text-blue-950 text-sm">Period:</span>
          </div>
          <div className="flex gap-1">
            {['week', 'month', 'quarter', 'year'].map((p) => (
              <button
                key={p}
                className={`px-4 py-1 text-sm font-bold capitalize border-2 transition-colors ${
                  period === p ? 'bg-blue-950 text-white border-blue-950' : 'bg-white text-blue-950 border-blue-950/20 hover:bg-gray-50'
                }`}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <button 
            onClick={loadData}
            className="bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950 ml-auto"
          >
            Update
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Avg Margin</p>
              <p className="text-2xl font-bold text-blue-950">{stats.avgMargin || 0}%</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <Percent size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Highest Margin</p>
              <p className="text-2xl font-bold text-green-800">{stats.highestMargin || 0}%</p>
              <p className="text-xs text-gray-500">{stats.highestProduct}</p>
            </div>
            <div className="bg-green-800 p-2 border-2 border-white/20">
              <TrendingUp size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Lowest Margin</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lowestMargin || 0}%</p>
              <p className="text-xs text-gray-500">{stats.lowestProduct}</p>
            </div>
            <div className="bg-orange-600 p-2 border-2 border-white/20">
              <TrendingDown size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Profit</p>
              <p className="text-2xl font-bold text-blue-950">${(stats.totalProfit || 0).toFixed(2)}</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <DollarSign size={20} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Product Margins</h2>
          <div className="h-64">
            <Bar data={marginChartData} options={barOptions} />
          </div>
        </div>
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Category Margins</h2>
          <div className="h-64">
            {categoryMarginsData && <Bar data={categoryMarginsData} options={barOptions} />}
          </div>
        </div>
      </div>

      {/* Product Margins Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Price</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Cost</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Margin %</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Revenue</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Profit</th>
            </tr>
          </thead>
          <tbody>
            {productMargins.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500 font-medium">
                  No product margin data available. Add products to see margins.
                </td>
              </tr>
            ) : (
              productMargins.map((product, index) => {
                const profit = product.revenue * (product.margin / 100);
                return (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-950">{product.name}</td>
                    <td className="py-3 px-4 text-gray-600 font-medium text-xs">{product.sku}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-950">${product.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-gray-600 font-medium">${product.cost.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-1 text-xs font-bold ${getMarginBg(product.margin)}`}>
                        {product.margin}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-950">${product.revenue.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-green-800">${profit.toFixed(2)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfitMargin;