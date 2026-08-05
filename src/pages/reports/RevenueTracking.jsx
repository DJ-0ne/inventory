// src/pages/reports/RevenueTracking.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Printer,
  ArrowLeft,
  X,
  AlertCircle,
  CheckCircle,
  Wallet,
  PiggyBank,
  CreditCard,
  Landmark,
  Eye,
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

const RevenueTracking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [revenueData, setRevenueData] = useState({
    labels: [],
    revenue: [],
    expenses: [],
    profit: []
  });
  const [stats, setStats] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Load data
  useEffect(() => {
    loadData();
    const unsubscribeOrders = dataService.subscribe('orders', loadData);
    const unsubscribeCustomers = dataService.subscribe('customers', loadData);
    return () => {
      unsubscribeOrders();
      unsubscribeCustomers();
    };
  }, [period]);

  const loadData = () => {
    setLoading(true);
    
    const allOrders = dataService.getOrders();
    const allCustomers = dataService.getCustomers();
    setOrders(allOrders);
    setCustomers(allCustomers);

    // Calculate revenue data based on period
    let labels = [];
    let revenue = [];
    let expenses = [];
    let profit = [];

    if (period === 'month' || period === 'quarter') {
      // Monthly data
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      const startMonth = period === 'month' ? currentMonth - 5 : 0;
      const endMonth = period === 'month' ? currentMonth : 11;
      
      labels = monthNames.slice(startMonth, endMonth + 1);
      
      for (let m = startMonth; m <= endMonth; m++) {
        const monthOrders = allOrders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate.getMonth() === m;
        });
        const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const monthExpenses = monthRevenue * 0.35; // Estimated 35% expenses
        const monthProfit = monthRevenue - monthExpenses;
        
        revenue.push(monthRevenue);
        expenses.push(monthExpenses);
        profit.push(monthProfit);
      }
      
      // If no data, use sample
      if (revenue.every(v => v === 0)) {
        revenue = [18500, 22000, 19500, 28000, 32000, 29000, 35000, 38000];
        expenses = [12000, 14000, 13000, 18000, 20000, 19000, 22000, 25000];
        profit = [6500, 8000, 6500, 10000, 12000, 10000, 13000, 13000];
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
      }
      
    } else if (period === 'week') {
      // Weekly data
      const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      labels = weekDays;
      
      for (let d = 0; d < 7; d++) {
        const dayOrders = allOrders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate.getDay() === d + 1;
        });
        const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const dayExpenses = dayRevenue * 0.35;
        const dayProfit = dayRevenue - dayExpenses;
        
        revenue.push(dayRevenue);
        expenses.push(dayExpenses);
        profit.push(dayProfit);
      }
      
      if (revenue.every(v => v === 0)) {
        revenue = [2500, 3200, 2800, 4100, 3800, 4500, 5200];
        expenses = [1600, 2000, 1800, 2600, 2400, 2800, 3200];
        profit = [900, 1200, 1000, 1500, 1400, 1700, 2000];
      }
      
    } else {
      // Yearly data
      const years = ['2021', '2022', '2023', '2024', '2025'];
      labels = years;
      
      for (let y = 0; y < years.length; y++) {
        const yearOrders = allOrders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate.getFullYear() === 2021 + y;
        });
        const yearRevenue = yearOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const yearExpenses = yearRevenue * 0.35;
        const yearProfit = yearRevenue - yearExpenses;
        
        revenue.push(yearRevenue);
        expenses.push(yearExpenses);
        profit.push(yearProfit);
      }
      
      if (revenue.every(v => v === 0)) {
        revenue = [185000, 220000, 245500];
        expenses = [120000, 140000, 156000];
        profit = [65000, 80000, 89500];
        labels = ['2023', '2024', '2025'];
      }
    }

    setRevenueData({
      labels,
      revenue,
      expenses,
      profit
    });

    // Calculate stats
    const totalRevenue = revenue.reduce((sum, v) => sum + v, 0);
    const totalExpenses = expenses.reduce((sum, v) => sum + v, 0);
    const totalProfit = profit.reduce((sum, v) => sum + v, 0);
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const prevTotalRevenue = totalRevenue * 0.85;
    const revenueGrowth = ((totalRevenue - prevTotalRevenue) / prevTotalRevenue * 100);

    setStats([
      { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, change: `${revenueGrowth.toFixed(1)}%`, trend: "up", icon: DollarSign },
      { label: "Total Expenses", value: `$${totalExpenses.toFixed(2)}`, change: "+10.8%", trend: "up", icon: CreditCard },
      { label: "Net Profit", value: `$${totalProfit.toFixed(2)}`, change: `${(profitMargin * 0.6).toFixed(1)}%`, trend: "up", icon: Wallet },
      { label: "Profit Margin", value: `${profitMargin.toFixed(1)}%`, change: "+8.3%", trend: "up", icon: PiggyBank }
    ]);

    setLoading(false);
  };

  const revenueChartData = {
    labels: revenueData.labels || [],
    datasets: [
      {
        label: 'Revenue',
        data: revenueData.revenue || [],
        borderColor: '#1e3a5f',
        backgroundColor: 'rgba(30, 58, 95, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1e3a5f',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      },
      {
        label: 'Expenses',
        data: revenueData.expenses || [],
        borderColor: '#991b1b',
        backgroundColor: 'rgba(153, 27, 27, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#991b1b',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };

  const profitChartData = {
    labels: revenueData.labels || [],
    datasets: [
      {
        label: 'Profit',
        data: revenueData.profit || [],
        backgroundColor: '#166534',
        borderRadius: 0,
        borderColor: '#166534',
        borderWidth: 1
      }
    ]
  };

  const revenueSourceData = {
    labels: ['Cash Sales', 'Card Sales', 'Mobile Payments', 'Bank Transfers'],
    datasets: [
      {
        data: [35, 30, 25, 10],
        backgroundColor: ['#1e3a5f', '#f97316', '#166534', '#4c1d95'],
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { weight: 'bold', size: 11 }
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
    const headers = ['Period', 'Revenue', 'Expenses', 'Profit'];
    const rows = revenueData.labels.map((label, index) => [
      label,
      `$${revenueData.revenue[index]?.toFixed(2) || 0}`,
      `$${revenueData.expenses[index]?.toFixed(2) || 0}`,
      `$${revenueData.profit[index]?.toFixed(2) || 0}`
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue_report_${period}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showCustomModal("✅ Revenue report exported successfully!", "success");
  };

  const handlePrint = () => {
    window.print();
    showCustomModal("🖨️ Revenue report sent to printer!", "success");
  };

  const handleRefresh = () => {
    loadData();
    showCustomModal("🔄 Revenue data refreshed!", "success");
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading revenue data...</p>
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
          <h1 className="text-2xl font-bold text-blue-950">Revenue Tracking</h1>
          <p className="text-gray-600 font-medium text-sm">Track revenue, expenses, and profitability over time</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-blue-950">{stat.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend === 'up' ? <TrendingUp size={14} className="text-green-800" /> : <TrendingDown size={14} className="text-red-800" />}
                  <span className={`text-xs font-bold ${stat.trend === 'up' ? 'text-green-800' : 'text-red-800'}`}>{stat.change}</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Revenue vs Expenses</h2>
          <div className="h-64">
            <Line data={revenueChartData} options={lineOptions} />
          </div>
        </div>
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Monthly Profit</h2>
          <div className="h-64">
            <Bar data={profitChartData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Revenue Sources & Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Revenue Sources</h2>
          <div className="h-52">
            <Doughnut data={revenueSourceData} options={doughnutOptions} />
          </div>
        </div>
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Financial Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Total Revenue</span>
              <span className="font-bold text-blue-950">${revenueData.revenue.reduce((a, b) => a + b, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Cost of Goods Sold</span>
              <span className="font-bold text-red-800">-${(revenueData.revenue.reduce((a, b) => a + b, 0) * 0.4).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Operating Expenses</span>
              <span className="font-bold text-red-800">-${(revenueData.expenses.reduce((a, b) => a + b, 0) * 0.6).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-b-2 border-blue-950/10 pb-2 pt-2">
              <span className="font-bold text-blue-950">Net Profit</span>
              <span className="font-bold text-green-800 text-lg">${revenueData.profit.reduce((a, b) => a + b, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Profit Margin</span>
              <span className="font-bold text-blue-950">
                {revenueData.revenue.reduce((a, b) => a + b, 0) > 0 
                  ? ((revenueData.profit.reduce((a, b) => a + b, 0) / revenueData.revenue.reduce((a, b) => a + b, 0)) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueTracking;