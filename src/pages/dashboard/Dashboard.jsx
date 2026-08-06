// src/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Printer,
  Calendar,
  RefreshCw,
  Plus,
  Bell
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
import { useNavigate } from 'react-router-dom';
import dataService from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ Check user role for navigation
  const userRole = user?.role;

  // ✅ Role-based navigation handlers
  const handleAddProduct = () => {
    if (userRole === 'Administrator') {
      navigate('/inventory/add-product');
    } else {
      alert('You do not have permission to add products.');
    }
  };

  const handleNewSale = () => {
    if (userRole === 'Administrator' || userRole === 'Sales Staff') {
      navigate('/sales/pos');
    } else {
      alert('You do not have permission to access POS.');
    }
  };

  const handleAddCustomer = () => {
    if (userRole === 'Administrator' || userRole === 'Sales Staff') {
      navigate('/customers/add');
    } else {
      alert('You do not have permission to add customers.');
    }
  };

  const handleCreateOrder = () => {
    if (userRole === 'Administrator' || userRole === 'Procurement') {
      navigate('/purchases/create');
    } else if (userRole === 'Warehouse Staff') {
      alert('Warehouse Staff can only receive stock, not create orders.');
    } else {
      alert('You do not have permission to create purchase orders.');
    }
  };

  const handleViewAllOrders = () => {
    if (userRole === 'Administrator' || userRole === 'Sales Staff') {
      navigate('/sales/all');
    } else if (userRole === 'Warehouse Staff' || userRole === 'Procurement') {
      navigate('/purchases/orders');
    } else {
      alert('You do not have permission to view orders.');
    }
  };

  const handleViewLowStock = () => {
    navigate('/inventory/low-stock');
  };

  // Load data
  const loadData = () => {
    const orders = dataService.getOrders();
    const statsData = dataService.getStats();
    const lowStock = dataService.getLowStockItems();

    setStats([
      { title: "Total Revenue", value: `$${statsData.totalRevenue.toLocaleString()}`, change: "+15.3%", trend: "up", icon: DollarSign, color: "bg-blue-950", borderColor: "border-blue-950" },
      { title: "Total Sales", value: statsData.totalSales.toString(), change: "+12.5%", trend: "up", icon: ShoppingCart, color: "bg-orange-600", borderColor: "border-orange-600" },
      { title: "Total Products", value: statsData.totalProducts.toString(), change: "+5.7%", trend: "up", icon: Package, color: "bg-green-800", borderColor: "border-green-800" },
      { title: "Low Stock Items", value: statsData.lowStockItems.toString(), change: "+8.2%", trend: "down", icon: AlertTriangle, color: "bg-red-800", borderColor: "border-red-800" }
    ]);

    const formattedOrders = orders.slice(0, 6).map(order => ({
      id: order.id,
      customer: order.customer || 'Walk-in Customer',
      items: order.items || order.cartItems?.length || 0,
      amount: order.total || 0,
      status: order.status || 'Pending',
      date: order.date || new Date().toISOString().split('T')[0]
    }));

    setRecentOrders(formattedOrders);
    setLowStockItems(lowStock);
  };

  useEffect(() => {
    loadData();

    const unsubscribeProducts = dataService.subscribe('products', loadData);
    const unsubscribeOrders = dataService.subscribe('orders', loadData);

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleExport = () => {
    const headers = ['Product', 'SKU', 'Category', 'Price', 'Stock', 'Status'];
    const rows = dataService.getProducts().map(p => 
      [p.name, p.sku, p.category, `$${p.price}`, p.stock, p.status]
    );
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleReorder = (productId) => {
    const product = dataService.getProduct(productId);
    if (product) {
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
      alert(`✅ Reorder placed for ${product.name} (${product.reorder || 20} units)`);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-800 text-white',
      'Processing': 'bg-blue-950 text-white',
      'Pending': 'bg-orange-600 text-white',
      'Refunded': 'bg-red-800 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

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

  const lineOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: { ...chartOptions.plugins.legend, position: 'top' }
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
    cutout: '65%'
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue 2025',
        data: [18500, 22000, 19500, 28000, 32000, 29000, 35000, 38000, 42000, 40000, 45000, 48000],
        borderColor: '#1e3a5f',
        backgroundColor: 'rgba(30, 58, 95, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1e3a5f',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'Revenue 2024',
        data: [12000, 14000, 13500, 18000, 20000, 19000, 22000, 25000, 28000, 26000, 30000, 32000],
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.05)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }
    ]
  };

  const salesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 78, 82, 95, 88, 92, 105],
        backgroundColor: '#1e3a5f',
        borderRadius: 0,
        borderColor: '#1e3a5f',
        borderWidth: 1,
      },
      {
        label: 'Target',
        data: [70, 70, 70, 70, 70, 70, 70],
        backgroundColor: '#f97316',
        borderRadius: 0,
        borderColor: '#f97316',
        borderWidth: 1,
      }
    ]
  };

  const categoryData = {
    labels: ['Tools', 'Paint', 'Plumbing', 'Electrical', 'Wood', 'Other'],
    datasets: [
      {
        data: [35, 20, 15, 12, 10, 8],
        backgroundColor: ['#1e3a5f', '#f97316', '#166534', '#991b1b', '#4c1d95', '#1e293b'],
        borderColor: '#ffffff',
        borderWidth: 2,
      }
    ]
  };

  const quickStats = dataService.getStats();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Dashboard</h1>
          <p className="text-gray-600 font-medium text-sm">Welcome back, {user?.name || 'User'}. Here's your business performance overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            <span className="text-sm">Refresh</span>
          </button>
          <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
            <Calendar size={18} />
            <span className="text-sm">Aug 1 - Aug 31</span>
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
        {stats.map((stat, index) => (
          <div key={index} className={`bg-white border-l-4 ${stat.borderColor} p-5 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">{stat.title}</p>
                <p className="text-2xl font-bold text-blue-950 mt-1">{stat.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight size={14} className="text-green-800" />
                  ) : (
                    <ArrowDownRight size={14} className="text-red-800" />
                  )}
                  <span className={`text-xs font-bold ${stat.trend === 'up' ? 'text-green-800' : 'text-red-800'}`}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500 text-xs font-medium">vs last month</span>
                </div>
              </div>
              <div className={`${stat.color} p-3 border-2 border-white/20`}>
                <stat.icon size={24} color="white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions - Role Based */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {userRole === 'Administrator' && (
          <button 
            onClick={handleAddProduct}
            className="bg-blue-950 text-white p-3 font-bold hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Product
          </button>
        )}
        
        {(userRole === 'Administrator' || userRole === 'Sales Staff') && (
          <button 
            onClick={handleNewSale}
            className="bg-orange-600 text-white p-3 font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} />
            New Sale
          </button>
        )}
        
        {(userRole === 'Administrator' || userRole === 'Sales Staff') && (
          <button 
            onClick={handleAddCustomer}
            className="bg-green-800 text-white p-3 font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Users size={20} />
            Add Customer
          </button>
        )}
        
        {(userRole === 'Administrator' || userRole === 'Procurement') && (
          <button 
            onClick={handleCreateOrder}
            className="bg-purple-800 text-white p-3 font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <Package size={20} />
            Create Order
          </button>
        )}

        {userRole === 'Warehouse Staff' && (
          <button 
            onClick={() => navigate('/purchases/receive')}
            className="bg-teal-800 text-white p-3 font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
          >
            <Package size={20} />
            Receive Stock
          </button>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-blue-950">Revenue Trend</h2>
              <p className="text-sm text-gray-600 font-medium">Monthly revenue comparison 2024 vs 2025</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs font-bold text-blue-950 border border-blue-950/20 px-3 py-1 hover:bg-blue-950 hover:text-white transition-colors">Year</button>
              <button className="text-xs font-bold text-blue-950 border border-blue-950/20 px-3 py-1 bg-blue-950 text-white">Month</button>
              <button className="text-xs font-bold text-blue-950 border border-blue-950/20 px-3 py-1 hover:bg-blue-950 hover:text-white transition-colors">Week</button>
            </div>
          </div>
          <div className="h-64">
            <Line data={revenueData} options={lineOptions} />
          </div>
        </div>

        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Product Categories</h2>
          <div className="h-64">
            <Doughnut data={categoryData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Sales Chart & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-3 bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-blue-950">Weekly Sales Performance</h2>
              <p className="text-sm text-gray-600 font-medium">Sales vs target for current week</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-950 border border-blue-950"></span>
                <span className="text-xs font-medium text-gray-600">Sales</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-orange-600 border border-orange-600"></span>
                <span className="text-xs font-medium text-gray-600">Target</span>
              </div>
            </div>
          </div>
          <div className="h-56">
            <Bar data={salesData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <p className="text-gray-600 text-xs font-bold">Today's Sales</p>
                <p className="text-xl font-bold text-blue-950">${quickStats.todaySales.toLocaleString()}</p>
              </div>
              <span className="text-green-800 text-xs font-bold">+8.2%</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <p className="text-gray-600 text-xs font-bold">Orders Today</p>
                <p className="text-xl font-bold text-blue-950">{quickStats.todayOrders}</p>
              </div>
              <span className="text-green-800 text-xs font-bold">+12.5%</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <p className="text-gray-600 text-xs font-bold">Avg. Order Value</p>
                <p className="text-xl font-bold text-blue-950">$123.06</p>
              </div>
              <span className="text-red-800 text-xs font-bold">-2.1%</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-bold">Total Products</p>
                <p className="text-xl font-bold text-blue-950">{dataService.getProducts().length}</p>
              </div>
              <span className="text-green-800 text-xs font-bold">+5.7%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-blue-950">Recent Orders</h2>
              <p className="text-sm text-gray-600 font-medium">Latest transactions</p>
            </div>
            <button 
              onClick={handleViewAllOrders}
              className="text-orange-600 font-bold text-sm hover:text-orange-800 transition-colors flex items-center gap-1"
            >
              <Eye size={16} />
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-blue-950/10">
                  <th className="text-left py-2 font-bold text-blue-950 text-xs uppercase tracking-wider">Order ID</th>
                  <th className="text-left py-2 font-bold text-blue-950 text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left py-2 font-bold text-blue-950 text-xs uppercase tracking-wider">Items</th>
                  <th className="text-left py-2 font-bold text-blue-950 text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-left py-2 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-2 font-bold text-blue-950 text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-500 font-medium">No recent orders</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2 font-bold text-blue-950 text-xs">{order.id}</td>
                      <td className="py-2 text-gray-700 font-medium">{order.customer}</td>
                      <td className="py-2 text-gray-600 text-center">{order.items}</td>
                      <td className="py-2 font-bold text-blue-950">${order.amount.toFixed(2)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 text-xs font-bold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 text-gray-500 text-xs">{order.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-blue-950">Low Stock Alert</h2>
              <p className="text-sm text-gray-600 font-medium">Items below reorder level</p>
            </div>
            <Bell size={20} className="text-orange-600" />
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-4 text-gray-500 font-medium text-sm">
                All products are well stocked!
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex-1">
                    <p className="font-bold text-blue-950 text-sm">{item.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-600 font-medium">SKU: {item.sku}</span>
                      <span className={`text-xs font-bold ${item.stock === 0 ? 'text-red-800' : 'text-orange-600'}`}>
                        Stock: {item.stock}
                      </span>
                      <span className="text-xs text-gray-500">Threshold: {item.threshold}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleReorder(item.id)}
                    className="bg-orange-600 text-white px-3 py-1 text-xs font-bold hover:bg-orange-700 transition-colors border-2 border-orange-600"
                  >
                    Reorder
                  </button>
                </div>
              ))
            )}
          </div>
          <button 
            onClick={handleViewLowStock}
            className="w-full mt-4 bg-blue-950 text-white py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 text-sm"
          >
            View All Low Stock Items
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;