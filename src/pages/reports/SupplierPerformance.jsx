// src/pages/reports/SupplierPerformance.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Truck,
  Calendar,
  Download,
  Printer,
  ArrowLeft,
  X,
  AlertCircle,
  CheckCircle,
  Star,
  Clock,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
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

const SupplierPerformance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [stats, setStats] = useState({});

  // Load data
  useEffect(() => {
    loadData();
    const unsubscribeSuppliers = dataService.subscribe('suppliers', loadData);
    const unsubscribePurchaseOrders = dataService.subscribe('purchaseOrders', loadData);
    return () => {
      unsubscribeSuppliers();
      unsubscribePurchaseOrders();
    };
  }, [period]);

  const loadData = () => {
    setLoading(true);
    
    const allSuppliers = dataService.getSuppliers();
    const allPurchaseOrders = dataService.getPurchaseOrders();
    setSuppliers(allSuppliers);
    setPurchaseOrders(allPurchaseOrders);

    // Calculate supplier performance
    const supplierData = allSuppliers.map(supplier => {
      // Get orders for this supplier
      const orders = allPurchaseOrders.filter(order => order.supplier === supplier.name);
      const totalOrders = orders.length;
      const receivedOrders = orders.filter(order => order.status === 'Received').length;
      const onTimeDelivery = receivedOrders;
      
      // Calculate average lead time
      let totalLeadTime = 0;
      let leadTimeCount = 0;
      orders.forEach(order => {
        if (order.date && order.expectedDate) {
          const orderDate = new Date(order.date);
          const expectedDate = new Date(order.expectedDate);
          const leadTime = Math.ceil((expectedDate - orderDate) / (1000 * 60 * 60 * 24));
          if (leadTime > 0) {
            totalLeadTime += leadTime;
            leadTimeCount++;
          }
        }
      });
      const avgLeadTime = leadTimeCount > 0 ? (totalLeadTime / leadTimeCount) : 0;
      
      // Calculate total spend
      const totalSpend = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      // Calculate quality rate (based on received items vs ordered)
      let totalOrdered = 0;
      let totalReceived = 0;
      orders.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            totalOrdered += item.quantity || 0;
            totalReceived += item.received || item.quantity || 0;
          });
        }
      });
      const qualityRate = totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;
      
      // Determine status
      const deliveryRate = totalOrders > 0 ? (onTimeDelivery / totalOrders) * 100 : 0;
      let status = 'Average';
      if (deliveryRate >= 90 && qualityRate >= 95) status = 'Excellent';
      else if (deliveryRate >= 75 && qualityRate >= 85) status = 'Good';
      else if (deliveryRate < 60 || qualityRate < 70) status = 'Poor';
      
      // Rating (based on delivery and quality)
      const rating = ((deliveryRate / 20) + (qualityRate / 20)) / 2;
      
      return {
        id: supplier.id,
        name: supplier.name,
        totalOrders: totalOrders,
        onTimeDelivery: onTimeDelivery,
        avgLeadTime: avgLeadTime > 0 ? `${avgLeadTime.toFixed(1)} days` : 'N/A',
        totalSpend: totalSpend,
        rating: Math.min(Math.round(rating * 10) / 10, 5),
        qualityRate: Math.round(qualityRate),
        status: status
      };
    });

    // Sort by rating descending
    const sortedData = supplierData.sort((a, b) => b.rating - a.rating);
    setSuppliers(sortedData);

    // Calculate stats
    const totalSuppliers = sortedData.length;
    const avgRating = sortedData.reduce((sum, s) => sum + s.rating, 0) / (totalSuppliers || 1);
    const totalOrders = sortedData.reduce((sum, s) => sum + s.totalOrders, 0);
    const totalSpend = sortedData.reduce((sum, s) => sum + s.totalSpend, 0);

    // If no data, use sample data
    if (totalSuppliers === 0) {
      const sampleData = [
        {
          id: 1,
          name: "ABC Supplies",
          totalOrders: 45,
          onTimeDelivery: 42,
          avgLeadTime: "3.2 days",
          totalSpend: 32500,
          rating: 4.8,
          qualityRate: 98,
          status: "Excellent"
        },
        {
          id: 2,
          name: "XYZ Distributors",
          totalOrders: 38,
          onTimeDelivery: 32,
          avgLeadTime: "5.1 days",
          totalSpend: 28900,
          rating: 4.2,
          qualityRate: 92,
          status: "Good"
        },
        {
          id: 3,
          name: "Global Tools",
          totalOrders: 52,
          onTimeDelivery: 48,
          avgLeadTime: "3.8 days",
          totalSpend: 45600,
          rating: 4.6,
          qualityRate: 96,
          status: "Excellent"
        },
        {
          id: 4,
          name: "Local Hardware",
          totalOrders: 25,
          onTimeDelivery: 18,
          avgLeadTime: "6.5 days",
          totalSpend: 12500,
          rating: 3.9,
          qualityRate: 85,
          status: "Average"
        },
        {
          id: 5,
          name: "Mega Store",
          totalOrders: 30,
          onTimeDelivery: 25,
          avgLeadTime: "4.5 days",
          totalSpend: 18900,
          rating: 4.0,
          qualityRate: 88,
          status: "Good"
        }
      ];
      setSuppliers(sampleData);
      setStats({
        totalSuppliers: sampleData.length,
        avgRating: 4.3,
        totalOrders: 190,
        totalSpend: 138400
      });
    } else {
      setStats({
        totalSuppliers: totalSuppliers,
        avgRating: Math.round(avgRating * 10) / 10,
        totalOrders: totalOrders,
        totalSpend: totalSpend
      });
    }

    setLoading(false);
  };

  const deliveryChartData = {
    labels: suppliers.map(s => s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name),
    datasets: [
      {
        label: 'On-Time Delivery %',
        data: suppliers.map(s => s.totalOrders > 0 ? (s.onTimeDelivery / s.totalOrders) * 100 : 0),
        backgroundColor: suppliers.map(s => {
          const rate = s.totalOrders > 0 ? (s.onTimeDelivery / s.totalOrders) * 100 : 0;
          if (rate >= 90) return '#166534';
          if (rate >= 75) return '#1e3a5f';
          if (rate >= 60) return '#f97316';
          return '#991b1b';
        }),
        borderRadius: 0,
        borderColor: '#ffffff',
        borderWidth: 2
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
        max: 100,
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
    const headers = ['Supplier', 'Total Orders', 'On-Time Delivery', 'Lead Time', 'Total Spend', 'Rating', 'Quality %', 'Status'];
    const rows = suppliers.map(s => [
      s.name,
      s.totalOrders,
      `${s.onTimeDelivery} (${s.totalOrders > 0 ? ((s.onTimeDelivery / s.totalOrders) * 100).toFixed(0) : 0}%)`,
      s.avgLeadTime,
      `$${s.totalSpend.toLocaleString()}`,
      s.rating,
      `${s.qualityRate}%`,
      s.status
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supplier_performance_${period}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showCustomModal(" Supplier performance report exported successfully!", "success");
  };

  const handlePrint = () => {
    window.print();
    showCustomModal("🖨️ Supplier performance report sent to printer!", "success");
  };

  const handleRefresh = () => {
    loadData();
    showCustomModal(" Supplier data refreshed!", "success");
  };

  const getStatusColor = (status) => {
    const colors = {
      'Excellent': 'bg-green-800 text-white',
      'Good': 'bg-blue-950 text-white',
      'Average': 'bg-orange-600 text-white',
      'Poor': 'bg-red-800 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={14} className="text-orange-600 fill-orange-600" />);
      } else {
        stars.push(<Star key={i} size={14} className="text-gray-300" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading supplier data...</p>
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
          <h1 className="text-2xl font-bold text-blue-950">Supplier Performance</h1>
          <p className="text-gray-600 font-medium text-sm">Evaluate supplier reliability, quality, and performance metrics</p>
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

      {/* Period Selector */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Calendar size={18} className="text-blue-950" />
            <span className="font-bold text-blue-950 text-sm">Period:</span>
          </div>
          <div className="flex gap-1">
            {['month', 'quarter', 'year'].map((p) => (
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
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Suppliers</p>
              <p className="text-2xl font-bold text-blue-950">{stats.totalSuppliers || 0}</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <Truck size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Avg Rating</p>
              <p className="text-2xl font-bold text-green-800">{stats.avgRating || 0}</p>
            </div>
            <div className="bg-green-800 p-2 border-2 border-white/20">
              <Star size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Orders</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalOrders || 0}</p>
            </div>
            <div className="bg-orange-600 p-2 border-2 border-white/20">
              <Package size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Spend</p>
              <p className="text-2xl font-bold text-blue-950">${(stats.totalSpend || 0).toLocaleString()}</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <DollarSign size={20} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-blue-950 mb-4">On-Time Delivery Performance</h2>
        <div className="h-64">
          <Bar data={deliveryChartData} options={barOptions} />
        </div>
      </div>

      {/* Supplier Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Supplier</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Orders</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">On-Time</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Lead Time</th>
              <th className="text-right py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Total Spend</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Rating</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Quality %</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                  No supplier performance data available. Add suppliers and purchase orders to see performance.
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-950">{supplier.name}</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-950">{supplier.totalOrders}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-green-800">{supplier.onTimeDelivery}</span>
                    <span className="text-gray-500 text-xs"> ({supplier.totalOrders > 0 ? ((supplier.onTimeDelivery / supplier.totalOrders) * 100).toFixed(0) : 0}%)</span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-blue-950">{supplier.avgLeadTime}</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-950">${supplier.totalSpend.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {getRatingStars(supplier.rating)}
                      <span className="text-xs font-bold text-gray-600 ml-1">{supplier.rating}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-bold ${supplier.qualityRate >= 90 ? 'text-green-800' : supplier.qualityRate >= 80 ? 'text-orange-600' : 'text-red-800'}`}>
                      {supplier.qualityRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-bold ${getStatusColor(supplier.status)}`}>
                      {supplier.status}
                    </span>
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

export default SupplierPerformance;