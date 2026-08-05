// src/pages/notifications/ExpiryAlerts.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Package,
  X,
  AlertCircle,
  Eye
} from 'lucide-react';
import { notificationAPI } from '../../services/api';
import dataService from '../../services/dataService';
import { STATUS_COLORS, TABLE_HEADER_STYLES, TABLE_ROW_STYLES } from '../../constants';

const ExpiryAlerts = () => {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'expiryDate', direction: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadData();
    const unsubscribeProducts = dataService.subscribe('products', loadData);
    return () => unsubscribeProducts();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, searchTerm, filterStatus]);

  const loadData = () => {
    setLoading(true);
    
    const allProducts = dataService.getProducts();
    setProducts(allProducts);

    // Generate expiry alerts from products
    const today = new Date();
    const alertsData = allProducts
      .filter(product => product.expiryDate || product.batch)
      .map(product => {
        const expiryDate = product.expiryDate ? new Date(product.expiryDate) : null;
        const daysRemaining = expiryDate ? Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)) : 365;
        
        let status = 'Info';
        if (daysRemaining <= 30) status = 'Critical';
        else if (daysRemaining <= 60) status = 'Warning';
        
        return {
          id: product.id,
          product: product.name,
          sku: product.sku,
          batch: product.batch || `B-${Date.now().toString().slice(-6)}`,
          quantity: product.stock || 0,
          expiryDate: product.expiryDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          daysRemaining: Math.max(0, daysRemaining),
          status: status,
          location: product.location || 'Main Warehouse',
          supplier: product.supplier || 'Unknown'
        };
      })
      .filter(alert => alert.daysRemaining <= 90);

    // If no expiry data, use mock data
    if (alertsData.length === 0) {
      const mockData = [
        { 
          id: 1, 
          product: 'Paint - White Gloss', 
          sku: 'PAINT-001', 
          batch: 'B-2024-001',
          quantity: 25,
          expiryDate: '2026-09-15',
          daysRemaining: 41,
          status: 'Warning',
          location: 'Warehouse A - Shelf 3',
          supplier: 'ColorMaster Inc'
        },
        {
          id: 2,
          product: 'Wood Glue',
          sku: 'WOOD-004',
          batch: 'B-2024-012',
          quantity: 15,
          expiryDate: '2026-09-30',
          daysRemaining: 56,
          status: 'Warning',
          location: 'Warehouse A - Shelf 7',
          supplier: 'WoodCraft Supplies'
        },
        {
          id: 3,
          product: 'Safety Gloves',
          sku: 'SAFE-002',
          batch: 'B-2024-008',
          quantity: 30,
          expiryDate: '2026-08-20',
          daysRemaining: 15,
          status: 'Critical',
          location: 'Warehouse B - Shelf 2',
          supplier: 'SafetyFirst Corp'
        },
        {
          id: 4,
          product: 'Electrical Tape',
          sku: 'ELEC-007',
          batch: 'B-2024-015',
          quantity: 20,
          expiryDate: '2026-12-01',
          daysRemaining: 118,
          status: 'Info',
          location: 'Warehouse B - Shelf 5',
          supplier: 'ElectroParts Inc'
        },
        {
          id: 5,
          product: 'Drill Bits Set',
          sku: 'TOOL-018',
          batch: 'B-2024-003',
          quantity: 8,
          expiryDate: '2027-01-15',
          daysRemaining: 163,
          status: 'Info',
          location: 'Warehouse A - Shelf 9',
          supplier: 'ToolCo Ltd'
        },
        {
          id: 6,
          product: 'Paint - Blue Matte',
          sku: 'PAINT-005',
          batch: 'B-2024-020',
          quantity: 12,
          expiryDate: '2026-10-10',
          daysRemaining: 66,
          status: 'Warning',
          location: 'Warehouse A - Shelf 4',
          supplier: 'ColorMaster Inc'
        }
      ];
      setAlerts(mockData);
      setFilteredAlerts(mockData);
    } else {
      setAlerts(alertsData);
      setFilteredAlerts(alertsData);
    }
    
    setLoading(false);
  };

  const filterAlerts = () => {
    let filtered = alerts;
    
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(alert => alert.status === filterStatus);
    }
    
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (sortConfig.key === 'expiryDate' || sortConfig.key === 'daysRemaining') {
          return sortConfig.direction === 'asc' ? a[sortConfig.key] - b[sortConfig.key] : b[sortConfig.key] - a[sortConfig.key];
        }
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredAlerts(filtered);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status) => {
    const baseStyles = 'px-3 py-1 text-xs font-bold uppercase tracking-wider';
    const colorMap = {
      'Critical': 'bg-red-800 text-white',
      'Warning': 'bg-orange-600 text-white',
      'Info': 'bg-blue-950 text-white',
    };
    return <span className={`${baseStyles} ${colorMap[status] || 'bg-gray-700 text-white'}`}>{status}</span>;
  };

  const getDaysRemainingColor = (days) => {
    if (days <= 30) return 'text-red-800 font-bold';
    if (days <= 60) return 'text-orange-600 font-bold';
    return 'text-green-800 font-bold';
  };

  const StatsCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-blue-950 mt-1">{value}</p>
        </div>
        <div className={`${color} p-3 border-2 border-white/20`}>
          <Icon size={24} color="white" />
        </div>
      </div>
    </div>
  );

  const showCustomModal = (message, type, data = null) => {
    setModalMessage(message);
    setModalType(type);
    setSelectedAlert(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("");
    setSelectedAlert(null);
  };

  const handleViewDetails = (alert) => {
    showCustomModal(
      `📦 Product Details\n\nProduct: ${alert.product}\nSKU: ${alert.sku}\nBatch: ${alert.batch}\nQuantity: ${alert.quantity}\nExpiry Date: ${alert.expiryDate}\nDays Remaining: ${alert.daysRemaining}\nStatus: ${alert.status}\nLocation: ${alert.location}\nSupplier: ${alert.supplier}`,
      "info",
      alert
    );
  };

  const handleTakeAction = (alert) => {
    if (alert.daysRemaining <= 30) {
      showCustomModal(
        `⚠️ Urgent Action Required\n\nProduct: ${alert.product}\nExpires in ${alert.daysRemaining} days\n\nRecommended Actions:\n1. Move to priority shelf\n2. Notify sales team\n3. Consider discount sale\n4. Check with supplier ${alert.supplier}`,
        "error",
        alert
      );
    } else if (alert.daysRemaining <= 60) {
      showCustomModal(
        `ℹ️ Action Recommended\n\nProduct: ${alert.product}\nExpires in ${alert.daysRemaining} days\n\nRecommended Actions:\n1. Monitor stock movement\n2. Plan promotional activities\n3. Prepare for potential sale`,
        "info",
        alert
      );
    } else {
      showCustomModal(
        `✅ Product is safe\n\nProduct: ${alert.product}\nExpires in ${alert.daysRemaining} days\n\nNo immediate action required.\nContinue regular monitoring.`,
        "success",
        alert
      );
    }
  };

  const handleRefresh = () => {
    loadData();
    showCustomModal("🔄 Expiry alerts refreshed!", "success");
  };

  const handleExport = () => {
    const headers = ['Product', 'SKU', 'Batch', 'Quantity', 'Expiry Date', 'Days Remaining', 'Status', 'Location', 'Supplier'];
    const rows = filteredAlerts.map(alert => [
      alert.product,
      alert.sku,
      alert.batch,
      alert.quantity,
      alert.expiryDate,
      alert.daysRemaining,
      alert.status,
      alert.location,
      alert.supplier
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expiry_alerts_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showCustomModal("✅ Expiry alerts exported successfully!", "success");
  };

  const stats = [
    { label: 'Total Alerts', value: alerts.length, icon: Calendar, color: 'bg-blue-950' },
    { label: 'Critical (30 days)', value: alerts.filter(a => a.daysRemaining <= 30).length, icon: AlertTriangle, color: 'bg-red-800' },
    { label: 'Warning (60 days)', value: alerts.filter(a => a.daysRemaining > 30 && a.daysRemaining <= 60).length, icon: Clock, color: 'bg-orange-600' },
    { label: 'Info (60+ days)', value: alerts.filter(a => a.daysRemaining > 60).length, icon: CheckCircle, color: 'bg-green-800' },
  ];

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading expiry alerts...</p>
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
                {modalType === "info" && <AlertCircle size={28} className="text-blue-950" />}
                <h3 className="text-lg font-bold text-blue-950">
                  {modalType === "success" ? "Success" : modalType === "error" ? "Error" : "Information"}
                </h3>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 font-medium whitespace-pre-line">{modalMessage}</p>
              {selectedAlert && (
                <div className="mt-3 bg-gray-50 p-3 border-l-4 border-blue-950">
                  <p className="text-sm font-bold text-blue-950">{selectedAlert.product}</p>
                  <p className="text-sm text-gray-600">SKU: {selectedAlert.sku}</p>
                  <p className="text-sm text-gray-600">Expires: {selectedAlert.expiryDate}</p>
                  <p className="text-sm text-gray-600">Status: {selectedAlert.status}</p>
                </div>
              )}
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
          <h1 className="text-2xl font-bold text-blue-950">Expiry Alerts</h1>
          <p className="text-gray-600 font-medium text-sm">Monitor product expiry dates and take preventive action</p>
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
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products, SKU, batch, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-blue-950/10 focus:border-blue-950 outline-none font-medium"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border-2 border-blue-950/10 px-3 py-2 font-medium focus:border-blue-950 outline-none"
            >
              <option value="all">All Status</option>
              <option value="Critical">Critical</option>
              <option value="Warning">Warning</option>
              <option value="Info">Info</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Showing {filteredAlerts.length} of {alerts.length} alerts
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('product')} className="flex items-center gap-1 hover:text-orange-600">
                  Product
                  {sortConfig.key === 'product' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('sku')} className="flex items-center gap-1 hover:text-orange-600">
                  SKU
                  {sortConfig.key === 'sku' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('batch')} className="flex items-center gap-1 hover:text-orange-600">
                  Batch
                  {sortConfig.key === 'batch' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>Quantity</th>
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('expiryDate')} className="flex items-center gap-1 hover:text-orange-600">
                  Expiry Date
                  {sortConfig.key === 'expiryDate' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('daysRemaining')} className="flex items-center gap-1 hover:text-orange-600">
                  Days Left
                  {sortConfig.key === 'daysRemaining' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>Status</th>
              <th className={TABLE_HEADER_STYLES}>Location</th>
              <th className={TABLE_HEADER_STYLES}>Supplier</th>
              <th className={TABLE_HEADER_STYLES} style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-8 text-center text-gray-500 font-medium">
                  No expiry alerts found. All products are within safe expiry dates.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => (
                <tr key={alert.id} className={TABLE_ROW_STYLES}>
                  <td className="py-3 font-bold text-blue-950">{alert.product}</td>
                  <td className="py-3 text-gray-600 font-medium text-xs">{alert.sku}</td>
                  <td className="py-3 font-bold text-gray-700">{alert.batch}</td>
                  <td className="py-3 text-gray-700 text-center">{alert.quantity}</td>
                  <td className="py-3 font-bold text-blue-950">{alert.expiryDate}</td>
                  <td className={`py-3 ${getDaysRemainingColor(alert.daysRemaining)}`}>
                    {alert.daysRemaining} days
                  </td>
                  <td className="py-3">{getStatusBadge(alert.status)}</td>
                  <td className="py-3 text-gray-600 text-xs">{alert.location}</td>
                  <td className="py-3 text-gray-700 font-medium">{alert.supplier}</td>
                  <td className="py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleViewDetails(alert)}
                        className="p-1 text-blue-950 hover:bg-blue-50 transition-colors" 
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleTakeAction(alert)}
                        className={`px-3 py-1 text-xs font-bold text-white transition-colors ${
                          alert.status === 'Critical' ? 'bg-red-800 hover:bg-red-700' :
                          alert.status === 'Warning' ? 'bg-orange-600 hover:bg-orange-700' :
                          'bg-blue-950 hover:bg-blue-900'
                        }`}
                      >
                        {alert.status === 'Critical' ? 'Urgent Action' : 
                         alert.status === 'Warning' ? 'Review' : 'Info'}
                      </button>
                    </div>
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

export default ExpiryAlerts;