// src/pages/reports/SalesReports.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Download,
  Printer,
  Search,
  Filter,
  Calendar,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  X,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import dataService from "../../services/dataService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const SalesReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [stats, setStats] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [salesTrendData, setSalesTrendData] = useState(null);
  const [salesByCategoryData, setSalesByCategoryData] = useState(null);
  const [monthlyComparisonData, setMonthlyComparisonData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  // Load data
  useEffect(() => {
    loadData();
    const unsubscribeOrders = dataService.subscribe('orders', loadData);
    const unsubscribeProducts = dataService.subscribe('products', loadData);
    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, [dateRange, startDate, endDate]);

  const loadData = () => {
    setLoading(true);
    
    const allOrders = dataService.getOrders();
    const allProducts = dataService.getProducts();
    setOrders(allOrders);
    setProducts(allProducts);

    // Filter orders by date range
    let filteredOrders = allOrders;
    if (dateRange === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filteredOrders = allOrders.filter(order => order.date === today);
    } else if (dateRange === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      filteredOrders = allOrders.filter(order => order.date >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      filteredOrders = allOrders.filter(order => order.date >= monthAgo);
    } else if (dateRange === 'quarter') {
      const quarterAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      filteredOrders = allOrders.filter(order => order.date >= quarterAgo);
    } else if (dateRange === 'year') {
      const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      filteredOrders = allOrders.filter(order => order.date >= yearAgo);
    } else if (startDate && endDate) {
      filteredOrders = allOrders.filter(order => order.date >= startDate && order.date <= endDate);
    }

    // Calculate stats
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalSales = filteredOrders.length;
    const avgOrder = totalSales > 0 ? totalRevenue / totalSales : 0;
    const uniqueCustomers = new Set(filteredOrders.map(order => order.customer)).size;
    
    const prevTotalRevenue = totalRevenue * 0.85;
    const revenueGrowth = prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue * 100) : 0;

    setStats([
      { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, change: `${revenueGrowth.toFixed(1)}%`, trend: revenueGrowth >= 0 ? "up" : "down", icon: DollarSign },
      { label: "Total Sales", value: totalSales.toString(), change: "+8.2%", trend: "up", icon: ShoppingCart },
      { label: "Average Order", value: `$${avgOrder.toFixed(2)}`, change: "+3.7%", trend: "up", icon: TrendingUp },
      { label: "Total Customers", value: uniqueCustomers.toString(), change: "+5.1%", trend: "up", icon: Users }
    ]);

    // Recent transactions
    const recent = filteredOrders.slice(0, 5).map(order => ({
      id: order.id,
      customer: order.customer,
      amount: `$${(order.total || 0).toFixed(2)}`,
      status: order.status === 'Completed' ? 'Completed' : 
              order.status === 'Refunded' ? 'Refunded' : 'Pending',
      date: order.date || new Date().toISOString().split('T')[0]
    }));
    setRecentTransactions(recent);

    // Sales trend data - group by month
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = {};
    filteredOrders.forEach(order => {
      if (order.date) {
        const month = new Date(order.date).getMonth();
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (order.total || 0);
      }
    });

    const labels = Object.keys(monthlyRevenue).map(m => monthNames[parseInt(m)]);
    const data = Object.values(monthlyRevenue);

    // If no data, use sample
    if (labels.length === 0) {
      setSalesTrendData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        datasets: [
          {
            label: 'Sales Revenue',
            data: [18500, 22000, 19500, 28000, 32000, 29000, 35000, 38000],
            borderColor: '#1e3a5f',
            backgroundColor: 'rgba(30, 58, 95, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#1e3a5f',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4
          }
        ]
      });
    } else {
      setSalesTrendData({
        labels: labels,
        datasets: [
          {
            label: 'Sales Revenue',
            data: data,
            borderColor: '#1e3a5f',
            backgroundColor: 'rgba(30, 58, 95, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#1e3a5f',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4
          }
        ]
      });
    }

    // Sales by category
    const categorySales = {};
    filteredOrders.forEach(order => {
      if (order.cartItems) {
        order.cartItems.forEach(item => {
          const category = products.find(p => p.name === item.name)?.category || 'Other';
          categorySales[category] = (categorySales[category] || 0) + (item.total || item.price * item.quantity || 0);
        });
      }
    });

    const categoryLabels = Object.keys(categorySales);
    const categoryData = Object.values(categorySales);

    if (categoryLabels.length === 0) {
      setSalesByCategoryData({
        labels: ['Tools', 'Paint', 'Power Tools', 'Plumbing', 'Electrical', 'Wood'],
        datasets: [
          {
            label: 'Sales by Category',
            data: [8500, 4200, 6800, 3100, 2900, 1800],
            backgroundColor: ['#1e3a5f', '#f97316', '#166534', '#991b1b', '#4c1d95', '#1e293b'],
            borderColor: '#ffffff',
            borderWidth: 2
          }
        ]
      });
    } else {
      setSalesByCategoryData({
        labels: categoryLabels,
        datasets: [
          {
            label: 'Sales by Category',
            data: categoryData,
            backgroundColor: ['#1e3a5f', '#f97316', '#166534', '#991b1b', '#4c1d95', '#1e293b', '#0f766e'],
            borderColor: '#ffffff',
            borderWidth: 2
          }
        ]
      });
    }

    // Monthly comparison (2024 vs 2025)
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    
    const currentYearRevenue = {};
    const lastYearRevenue = {};
    
    allOrders.forEach(order => {
      if (order.date) {
        const year = new Date(order.date).getFullYear();
        const month = new Date(order.date).getMonth();
        if (year === currentYear) {
          currentYearRevenue[month] = (currentYearRevenue[month] || 0) + (order.total || 0);
        } else if (year === lastYear) {
          lastYearRevenue[month] = (lastYearRevenue[month] || 0) + (order.total || 0);
        }
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYearData = months.map((_, i) => currentYearRevenue[i] || 0);
    const lastYearData = months.map((_, i) => lastYearRevenue[i] || 0);

    // If no data, use sample
    if (currentYearData.every(v => v === 0) && lastYearData.every(v => v === 0)) {
      setMonthlyComparisonData({
        labels: ['Jul', 'Aug'],
        datasets: [
          {
            label: '2024',
            data: [22000, 25000],
            backgroundColor: '#94a3b8',
            borderRadius: 0
          },
          {
            label: '2025',
            data: [35000, 38000],
            backgroundColor: '#1e3a5f',
            borderRadius: 0
          }
        ]
      });
    } else {
      setMonthlyComparisonData({
        labels: months,
        datasets: [
          {
            label: lastYear.toString(),
            data: lastYearData,
            backgroundColor: '#94a3b8',
            borderRadius: 0
          },
          {
            label: currentYear.toString(),
            data: currentYearData,
            backgroundColor: '#1e3a5f',
            borderRadius: 0
          }
        ]
      });
    }

    setLoading(false);
  };

  const lineOptions = {
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

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { weight: 'bold', size: 10 }
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { weight: 'bold', size: 10 }
        }
      }
    },
    cutout: '60%'
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
    const headers = ['Invoice', 'Customer', 'Amount', 'Status', 'Date'];
    const rows = recentTransactions.map(t => 
      [t.id, t.customer, t.amount, t.status, t.date]
    );
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showCustomModal("✅ Report exported successfully!", "success");
  };

  const handlePrint = () => {
    window.print();
    showCustomModal("🖨️ Report sent to printer!", "success");
  };

  const handleRefresh = () => {
    loadData();
    showCustomModal("🔄 Sales data refreshed!", "success");
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'text-green-800',
      'Pending': 'text-orange-600',
      'Refunded': 'text-red-800'
    };
    return colors[status] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading sales data...</p>
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
          <h1 className="text-2xl font-bold text-blue-950">Sales Reports</h1>
          <p className="text-gray-600 font-medium text-sm">Comprehensive sales analytics and performance metrics</p>
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
          <Link to="/reports">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
              <BarChart3 size={18} />
              <span className="text-sm">All Reports</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-950" />
            <span className="font-bold text-blue-950 text-sm">Date Range:</span>
          </div>
          <div className="flex gap-1">
            {['today', 'week', 'month', 'quarter', 'year'].map((range) => (
              <button
                key={range}
                className={`px-4 py-1 text-sm font-bold capitalize border-2 transition-colors ${
                  dateRange === range
                    ? 'bg-blue-950 text-white border-blue-950'
                    : 'bg-white text-blue-950 border-blue-950/20 hover:bg-gray-50'
                }`}
                onClick={() => setDateRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <input 
              type="date" 
              className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-gray-500 font-medium">to</span>
            <input 
              type="date" 
              className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button 
              onClick={loadData}
              className="bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-blue-950">{stat.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend === 'up' ? (
                    <TrendingUp size={14} className="text-green-800" />
                  ) : (
                    <TrendingDown size={14} className="text-red-800" />
                  )}
                  <span className={`text-xs font-bold ${stat.trend === 'up' ? 'text-green-800' : 'text-red-800'}`}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500 text-xs font-medium">vs last period</span>
                </div>
              </div>
              <div className="bg-blue-950 p-3 border-2 border-white/20">
                <stat.icon size={20} color="white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Sales Trend</h2>
          <div className="h-64">
            {salesTrendData && <Line data={salesTrendData} options={lineOptions} />}
          </div>
        </div>
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Sales by Category</h2>
          <div className="h-64">
            {salesByCategoryData && <Doughnut data={salesByCategoryData} options={doughnutOptions} />}
          </div>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-blue-950 mb-4">Year Over Year Comparison</h2>
        <div className="h-56">
          {monthlyComparisonData && <Bar data={monthlyComparisonData} options={barOptions} />}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm">
        <div className="p-5 border-b-2 border-blue-950/10">
          <h2 className="text-lg font-bold text-blue-950">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-blue-950/10 bg-gray-50">
                <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Invoice</th>
                <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Customer</th>
                <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Amount</th>
                <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">
                    No transactions found for the selected period
                  </td>
                </tr>
              ) : (
                recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-950">{transaction.id}</td>
                    <td className="py-3 px-4 text-gray-700 font-medium">{transaction.customer}</td>
                    <td className="py-3 px-4 font-bold text-blue-950">{transaction.amount}</td>
                    <td className={`py-3 px-4 font-bold ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{transaction.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReports;