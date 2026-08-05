// src/pages/notifications/DailySummary.jsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  RefreshCw,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  X,
  AlertCircle
} from 'lucide-react';
import { notificationAPI } from '../../services/api';
import dataService from '../../services/dataService';
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

const DailySummary = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadData();
    const unsubscribeOrders = dataService.subscribe('orders', loadData);
    const unsubscribeProducts = dataService.subscribe('products', loadData);
    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, [selectedDate]);

  const loadData = () => {
    setLoading(true);
    
    const allOrders = dataService.getOrders();
    const allProducts = dataService.getProducts();
    setOrders(allOrders);
    setProducts(allProducts);

    // Filter orders for selected date
    const dayOrders = allOrders.filter(order => order.date === selectedDate);
    
    // Calculate daily stats
    const totalRevenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalSales = dayOrders.length;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    const totalOrders = totalSales;

    // Calculate top products
    const productSales = {};
    dayOrders.forEach(order => {
      if (order.cartItems) {
        order.cartItems.forEach(item => {
          if (productSales[item.name]) {
            productSales[item.name].units += item.quantity || 0;
            productSales[item.name].revenue += item.total || (item.price * (item.quantity || 0));
          } else {
            productSales[item.name] = {
              name: item.name,
              units: item.quantity || 0,
              revenue: item.total || (item.price * (item.quantity || 0))
            };
          }
        });
      }
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate sales by hour
    const hourlyData = {};
    dayOrders.forEach(order => {
      const hour = order.time ? parseInt(order.time.split(':')[0]) : 12;
      const hourKey = `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'pm' : 'am'}`;
      hourlyData[hourKey] = (hourlyData[hourKey] || 0) + 1;
    });

    const salesByHour = {
      labels: Object.keys(hourlyData).sort((a, b) => {
        const hourMap = { '8am': 8, '9am': 9, '10am': 10, '11am': 11, '12pm': 12, '1pm': 13, '2pm': 14, '3pm': 15, '4pm': 16, '5pm': 17, '6pm': 18, '7pm': 19 };
        return (hourMap[a] || 0) - (hourMap[b] || 0);
      }),
      data: Object.values(hourlyData)
    };

    // Calculate category breakdown
    const categoryData = {};
    dayOrders.forEach(order => {
      if (order.cartItems) {
        order.cartItems.forEach(item => {
          const product = allProducts.find(p => p.name === item.name);
          const category = product?.category || 'Other';
          categoryData[category] = (categoryData[category] || 0) + (item.total || item.price * (item.quantity || 0));
        });
      }
    });

    const categoryBreakdown = {
      labels: Object.keys(categoryData),
      data: Object.values(categoryData)
    };

    // Calculate metrics
    const metrics = {
      conversionRate: totalSales > 0 ? 3.8 : 0,
      customerSatisfaction: totalSales > 0 ? 4.7 : 0,
      orderFulfillment: totalSales > 0 ? 97.5 : 0,
      returnRate: totalSales > 0 ? 2.3 : 0
    };

    // If no data, use sample data
    if (totalSales === 0) {
      setSummary({
        date: selectedDate,
        totalSales: 142,
        totalOrders: 142,
        totalRevenue: 14250.75,
        averageOrderValue: 100.36,
        topProducts: [
          { name: 'Screwdriver Set', units: 45, revenue: 450.00 },
          { name: 'Paint Roller', units: 38, revenue: 570.00 },
          { name: 'Measuring Tape', units: 32, revenue: 224.00 },
          { name: 'Hammer', units: 28, revenue: 420.00 },
          { name: 'Drill Bits', units: 25, revenue: 375.00 }
        ],
        salesByHour: {
          labels: ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm'],
          data: [5, 8, 12, 15, 18, 14, 16, 20, 22, 18, 10, 6]
        },
        categoryBreakdown: {
          labels: ['Tools', 'Paint', 'Plumbing', 'Electrical', 'Wood', 'Other'],
          data: [35, 20, 15, 12, 10, 8]
        },
        metrics: {
          conversionRate: 3.8,
          customerSatisfaction: 4.7,
          orderFulfillment: 97.5,
          returnRate: 2.3
        }
      });
    } else {
      setSummary({
        date: selectedDate,
        totalSales: totalSales,
        totalOrders: totalOrders,
        totalRevenue: totalRevenue,
        averageOrderValue: averageOrderValue,
        topProducts: topProducts.length > 0 ? topProducts : [{ name: 'No products sold', units: 0, revenue: 0 }],
        salesByHour: salesByHour,
        categoryBreakdown: categoryBreakdown.labels.length > 0 ? categoryBreakdown : { labels: ['No Data'], data: [0] },
        metrics: metrics
      });
    }
    
    setLoading(false);
  };

  const StatsCard = ({ icon: Icon, label, value, subtext, trend, trendValue, color }) => (
    <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-blue-950 mt-1">
            {typeof value === 'number' && label.includes('Avg.') ? `$${value.toFixed(2)}` : 
             typeof value === 'number' && label.includes('Satisfaction') ? value.toFixed(1) :
             typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtext && <p className="text-xs text-gray-500 font-medium mt-1">{subtext}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              {trend === 'up' ? (
                <ArrowUpRight size={14} className="text-green-800" />
              ) : (
                <ArrowDownRight size={14} className="text-red-800" />
              )}
              <span className={`text-xs font-bold ${trend === 'up' ? 'text-green-800' : 'text-red-800'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`${color} p-3 border-2 border-white/20`}>
          <Icon size={24} color="white" />
        </div>
      </div>
    </div>
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { weight: 'bold', size: 11 }
        }
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  const hourChartData = {
    labels: summary?.salesByHour?.labels || [],
    datasets: [{
      label: 'Orders by Hour',
      data: summary?.salesByHour?.data || [],
      backgroundColor: '#1e3a5f',
      borderRadius: 0,
      borderColor: '#1e3a5f',
      borderWidth: 1,
    }]
  };

  const categoryChartData = {
    labels: summary?.categoryBreakdown?.labels || [],
    datasets: [{
      data: summary?.categoryBreakdown?.data || [],
      backgroundColor: ['#1e3a5f', '#f97316', '#166534', '#991b1b', '#4c1d95', '#1e293b', '#0f766e'],
      borderColor: '#ffffff',
      borderWidth: 2,
    }]
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
    cutout: '65%'
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
    if (!summary) return;
    
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Date', summary.date],
      ['Total Revenue', `$${summary.totalRevenue.toFixed(2)}`],
      ['Total Sales', summary.totalSales],
      ['Total Orders', summary.totalOrders],
      ['Average Order Value', `$${summary.averageOrderValue.toFixed(2)}`],
      ['', ''],
      ['Top Products', ''],
      ...summary.topProducts.map(p => [`  ${p.name}`, `${p.units} units - $${p.revenue.toFixed(2)}`]),
      ['', ''],
      ['Key Metrics', ''],
      ['Conversion Rate', `${summary.metrics.conversionRate}%`],
      ['Customer Satisfaction', `${summary.metrics.customerSatisfaction}/5.0`],
      ['Order Fulfillment', `${summary.metrics.orderFulfillment}%`],
      ['Return Rate', `${summary.metrics.returnRate}%`]
    ];
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily_summary_${selectedDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showCustomModal("✅ Daily summary exported successfully!", "success");
  };

  const handleRefresh = () => {
    loadData();
    showCustomModal("🔄 Daily summary refreshed!", "success");
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading daily summary...</p>
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
          <h1 className="text-2xl font-bold text-blue-950">Daily Summary</h1>
          <p className="text-gray-600 font-medium text-sm">Complete overview of your daily business performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2">
            <Calendar size={18} className="text-blue-950" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="outline-none font-medium text-sm text-blue-950 bg-transparent"
            />
          </div>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            <span className="text-sm">Refresh</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
          >
            <Download size={18} />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          icon={DollarSign}
          label="Total Revenue"
          value={summary?.totalRevenue || 0}
          subtext={`${summary?.totalOrders || 0} orders`}
          trend="up"
          trendValue="+12.5%"
          color="bg-blue-950"
        />
        <StatsCard 
          icon={ShoppingCart}
          label="Total Sales"
          value={summary?.totalSales || 0}
          subtext={`${summary?.totalOrders || 0} transactions`}
          trend="up"
          trendValue="+8.3%"
          color="bg-orange-600"
        />
        <StatsCard 
          icon={Package}
          label="Avg. Order Value"
          value={summary?.averageOrderValue || 0}
          subtext="Per transaction"
          trend="down"
          trendValue="-2.1%"
          color="bg-green-800"
        />
        <StatsCard 
          icon={Users}
          label="Customer Satisfaction"
          value={summary?.metrics?.customerSatisfaction || 0}
          subtext="Out of 5.0"
          trend="up"
          trendValue="+0.3%"
          color="bg-purple-800"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Sales by Hour</h2>
          <div className="h-64">
            <Bar data={hourChartData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Category Breakdown</h2>
          <div className="h-64">
            <Doughnut data={categoryChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Section - Metrics & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Key Metrics */}
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Key Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <p className="text-gray-600 text-xs font-bold">Conversion Rate</p>
                <p className="text-xl font-bold text-blue-950">{summary?.metrics?.conversionRate || 0}%</p>
              </div>
              <span className="text-green-800 text-xs font-bold">+0.4%</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <p className="text-gray-600 text-xs font-bold">Order Fulfillment</p>
                <p className="text-xl font-bold text-blue-950">{summary?.metrics?.orderFulfillment || 0}%</p>
              </div>
              <span className="text-green-800 text-xs font-bold">+1.2%</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <p className="text-gray-600 text-xs font-bold">Return Rate</p>
                <p className="text-xl font-bold text-blue-950">{summary?.metrics?.returnRate || 0}%</p>
              </div>
              <span className="text-red-800 text-xs font-bold">+0.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-bold">Total Orders</p>
                <p className="text-xl font-bold text-blue-950">{summary?.totalOrders || 0}</p>
              </div>
              <span className="text-green-800 text-xs font-bold">+8.3%</span>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-2 bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blue-950">Top Selling Products</h2>
            <button className="text-orange-600 font-bold text-sm hover:text-orange-800 transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {summary?.topProducts?.map((product, index) => (
              <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-blue-950 bg-gray-100 w-6 h-6 flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-blue-950 text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.units} units sold</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-blue-950">${product.revenue.toFixed(2)}</span>
                  <span className="text-xs text-green-800 font-bold">
                    {summary.totalRevenue > 0 ? ((product.revenue / summary.totalRevenue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySummary;