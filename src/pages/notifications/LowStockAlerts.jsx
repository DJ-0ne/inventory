// src/pages/notifications/LowStockAlerts.jsx
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import { notificationAPI } from '../../services/api';
import dataService from '../../services/dataService';
import { STATUS_COLORS, TABLE_HEADER_STYLES, TABLE_ROW_STYLES } from '../../constants';

const LowStockAlerts = () => {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'stock', direction: 'asc' });
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

    // Generate low stock alerts from products
    const alertsData = allProducts
      .filter(product => product.stock <= product.threshold)
      .map(product => {
        const ratio = product.stock / product.threshold;
        let status = 'Warning';
        if (ratio <= 0.3 || product.stock === 0) status = 'Critical';
        
        return {
          id: product.id,
          product: product.name,
          sku: product.sku,
          stock: product.stock,
          threshold: product.threshold || 10,
          reorderLevel: product.reorder || 20,
          supplier: product.supplier || 'Unknown',
          lastOrdered: product.lastOrdered || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: status
        };
      });

    // If no low stock items, use mock data
    if (alertsData.length === 0) {
      const mockData = [
        { id: 1, product: 'Screwdriver Set', sku: 'TOOL-001', stock: 5, threshold: 10, reorderLevel: 15, supplier: 'ToolCo Ltd', lastOrdered: '2026-07-20', status: 'Critical' },
        { id: 2, product: 'Paint Roller', sku: 'PAINT-003', stock: 8, threshold: 15, reorderLevel: 20, supplier: 'ColorMaster Inc', lastOrdered: '2026-07-18', status: 'Warning' },
        { id: 3, product: 'Measuring Tape', sku: 'TOOL-012', stock: 3, threshold: 20, reorderLevel: 25, supplier: 'ToolCo Ltd', lastOrdered: '2026-07-15', status: 'Critical' },
        { id: 4, product: 'Hammer', sku: 'TOOL-005', stock: 12, threshold: 25, reorderLevel: 30, supplier: 'BuildRight Supplies', lastOrdered: '2026-07-10', status: 'Warning' },
        { id: 5, product: 'Drill Bits Set', sku: 'TOOL-018', stock: 7, threshold: 15, reorderLevel: 20, supplier: 'ToolCo Ltd', lastOrdered: '2026-07-22', status: 'Critical' },
        { id: 6, product: 'Safety Gloves', sku: 'SAFE-002', stock: 2, threshold: 10, reorderLevel: 15, supplier: 'SafetyFirst Corp', lastOrdered: '2026-07-25', status: 'Critical' },
        { id: 7, product: 'Electrical Tape', sku: 'ELEC-007', stock: 14, threshold: 20, reorderLevel: 30, supplier: 'ElectroParts Inc', lastOrdered: '2026-07-28', status: 'Warning' },
        { id: 8, product: 'Wood Glue', sku: 'WOOD-004', stock: 6, threshold: 10, reorderLevel: 15, supplier: 'WoodCraft Supplies', lastOrdered: '2026-07-30', status: 'Critical' },
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
        alert.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(alert => alert.status === filterStatus);
    }
    
    if (sortConfig.key) {
      filtered.sort((a, b) => {
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
    };
    return <span className={`${baseStyles} ${colorMap[status] || 'bg-gray-700 text-white'}`}>{status}</span>;
  };

  const getStockStatusColor = (stock, threshold) => {
    const ratio = stock / threshold;
    if (ratio <= 0.3) return 'text-red-800 font-bold';
    if (ratio <= 0.6) return 'text-orange-600 font-bold';
    return 'text-yellow-600 font-bold';
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
      `📦 Product Details\n\nProduct: ${alert.product}\nSKU: ${alert.sku}\nCurrent Stock: ${alert.stock}\nThreshold: ${alert.threshold}\nReorder Level: ${alert.reorderLevel}\nStatus: ${alert.status}\nSupplier: ${alert.supplier}\nLast Ordered: ${alert.lastOrdered}`,
      "info",
      alert
    );
  };

  const handleReorder = (alert) => {
    // Create a purchase order for this product
    const product = products.find(p => p.id === alert.id);
    if (product) {
      const reorderQty = alert.reorderLevel || 20;
      dataService.addPurchaseOrder({
        supplier: alert.supplier,
        items: [{ 
          productId: product.id, 
          name: product.name, 
          quantity: reorderQty, 
          price: product.price 
        }],
        total: reorderQty * product.price
      });
      
      showCustomModal(
        ` Reorder placed successfully!\n\nProduct: ${alert.product}\nQuantity: ${reorderQty} units\nSupplier: ${alert.supplier}`,
        "success",
        alert
      );
    } else {
      showCustomModal(
        `⚠️ Could not place reorder.\n\nProduct: ${alert.product}\nPlease check product details.`,
        "error",
        alert
      );
    }
  };

  const handleRefresh = () => {
    loadData();
    showCustomModal(" Low stock alerts refreshed!", "success");
  };

  const handleExport = () => {
    const headers = ['Product', 'SKU', 'Stock', 'Threshold', 'Reorder Level', 'Status', 'Supplier', 'Last Ordered'];
    const rows = filteredAlerts.map(alert => [
      alert.product,
      alert.sku,
      alert.stock,
      alert.threshold,
      alert.reorderLevel,
      alert.status,
      alert.supplier,
      alert.lastOrdered
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `low_stock_alerts_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showCustomModal(" Low stock alerts exported successfully!", "success");
  };

  const stats = [
    { label: 'Total Alerts', value: alerts.length, icon: AlertTriangle, color: 'bg-blue-950' },
    { label: 'Critical', value: alerts.filter(a => a.status === 'Critical').length, icon: XCircle, color: 'bg-red-800' },
    { label: 'Warning', value: alerts.filter(a => a.status === 'Warning').length, icon: Clock, color: 'bg-orange-600' },
    { label: 'Items to Reorder', value: alerts.filter(a => a.stock <= a.threshold).length, icon: Package, color: 'bg-green-800' },
  ];

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading alerts...</p>
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
                  <p className="text-sm text-gray-600">Stock: {selectedAlert.stock} / {selectedAlert.threshold}</p>
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Low Stock Alerts</h1>
          <p className="text-gray-600 font-medium text-sm">Monitor and manage products with low inventory levels</p>
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
                placeholder="Search products, SKU, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-blue-950/10 focus:border-blue-950 outline-none font-medium"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border-2 border-blue-950/10 px-3 py-2 font-medium focus:border-blue-950 outline-none"
            >
              <option value="all">All Status</option>
              <option value="Critical">Critical</option>
              <option value="Warning">Warning</option>
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
                <button onClick={() => handleSort('stock')} className="flex items-center gap-1 hover:text-orange-600">
                  Stock
                  {sortConfig.key === 'stock' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('threshold')} className="flex items-center gap-1 hover:text-orange-600">
                  Threshold
                  {sortConfig.key === 'threshold' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>Status</th>
              <th className={TABLE_HEADER_STYLES}>Supplier</th>
              <th className={TABLE_HEADER_STYLES}>Last Ordered</th>
              <th className={TABLE_HEADER_STYLES} style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                  No low stock alerts found. All products are well stocked!
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => (
                <tr key={alert.id} className={TABLE_ROW_STYLES}>
                  <td className="py-3 font-bold text-blue-950">{alert.product}</td>
                  <td className="py-3 text-gray-600 font-medium text-xs">{alert.sku}</td>
                  <td className={`py-3 ${getStockStatusColor(alert.stock, alert.threshold)}`}>
                    {alert.stock} / {alert.threshold}
                  </td>
                  <td className="py-3 text-gray-600">{alert.reorderLevel}</td>
                  <td className="py-3">{getStatusBadge(alert.status)}</td>
                  <td className="py-3 text-gray-700 font-medium">{alert.supplier}</td>
                  <td className="py-3 text-gray-500 text-xs">{alert.lastOrdered}</td>
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
                        onClick={() => handleReorder(alert)}
                        className="p-1 bg-orange-600 text-white px-3 py-1 text-xs font-bold hover:bg-orange-700 transition-colors flex items-center gap-1"
                      >
                        <ShoppingCart size={14} />
                        Reorder
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

export default LowStockAlerts;