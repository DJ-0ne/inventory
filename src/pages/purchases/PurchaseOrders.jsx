// src/pages/purchases/PurchaseOrders.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Download,
  Printer,
  RefreshCw
} from "lucide-react";
import dataService from "../../services/dataService";

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  // Load purchase orders
  useEffect(() => {
    loadOrders();
    const unsubscribe = dataService.subscribe('purchaseOrders', loadOrders);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [purchaseOrders, searchTerm, filterStatus]);

  const loadOrders = () => {
    setLoading(true);
    const orders = dataService.getPurchaseOrders();
    setPurchaseOrders(orders);
    setFilteredOrders(orders);
    setLoading(false);
  };

  const filterOrders = () => {
    let filtered = [...purchaseOrders];
    
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }
    
    setFilteredOrders(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Received': 'bg-green-800 text-white',
      'Pending': 'bg-orange-600 text-white',
      'Shipped': 'bg-blue-950 text-white',
      'Cancelled': 'bg-red-800 text-white',
      'Approved': 'bg-green-600 text-white',
      'Processing': 'bg-blue-600 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Received': return <CheckCircle size={14} />;
      case 'Pending': return <Clock size={14} />;
      case 'Shipped': return <Truck size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
      case 'Approved': return <CheckCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const handleView = (id) => {
    navigate(`/purchases/order/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/purchases/edit/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      // In a real app, you'd call an API
      // For now, we'll just filter it out
      const updatedOrders = purchaseOrders.filter(order => order.id !== id);
      setPurchaseOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      // Update in dataService
      // Note: We'll need to add delete method to dataService
      alert('Purchase Order deleted successfully!');
    }
  };

  const handlePrint = (id) => {
    alert(`Printing Purchase Order: ${id}`);
  };

  const handleReceive = (id) => {
    navigate(`/purchases/receive/${id}`);
  };

  const handleRefresh = () => {
    loadOrders();
  };

  const handleExport = () => {
    const headers = ['PO Number', 'Supplier', 'Date', 'Items', 'Total', 'Status', 'Expected Date'];
    const rows = filteredOrders.map(order => 
      [order.id, order.supplier, order.date, order.items || order.items?.length || 0, `$${order.total.toFixed(2)}`, order.status, order.expectedDate || 'N/A']
    );
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase_orders_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStats = () => {
    const total = purchaseOrders.length;
    const received = purchaseOrders.filter(o => o.status === 'Received').length;
    const pending = purchaseOrders.filter(o => o.status === 'Pending').length;
    const totalValue = purchaseOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    return { total, received, pending, totalValue };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading purchase orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Purchase Orders</h1>
          <p className="text-gray-600 font-medium text-sm">Manage all supplier purchase orders</p>
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
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            <span className="text-sm">Export</span>
          </button>
          <Link to="/purchases/create">
            <button className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
              <Plus size={18} />
              <span className="text-sm">Create PO</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Orders</p>
          <p className="text-2xl font-bold text-blue-950">{stats.total}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Received</p>
          <p className="text-2xl font-bold text-green-800">{stats.received}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Value</p>
          <p className="text-2xl font-bold text-blue-950">${stats.totalValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search PO number or supplier..." 
              className="px-2 py-1 text-sm outline-none font-medium text-blue-950 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none bg-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Shipped">Shipped</option>
            <option value="Received">Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button 
            className="flex items-center gap-1 bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950"
            onClick={filterOrders}
          >
            <Filter size={16} />
            Apply
          </button>
          <div className="text-sm text-gray-600 font-medium">
            Showing {filteredOrders.length} of {purchaseOrders.length} orders
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">PO Number</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Supplier</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Date</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Items</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Total</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Expected</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                  No purchase orders found. Create your first purchase order!
                </td>
              </tr>
            ) : (
              filteredOrders.map((po) => (
                <tr key={po.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-950">{po.id}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{po.supplier}</td>
                  <td className="py-3 px-4 text-gray-600 font-medium">{po.date}</td>
                  <td className="py-3 px-4 text-gray-600 font-medium text-center">
                    {po.items?.length || po.items || 0}
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-950">${(po.total || 0).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-bold flex items-center gap-1 ${getStatusColor(po.status)}`}>
                      {getStatusIcon(po.status)}
                      {po.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-medium">{po.expectedDate || po.expected || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button 
                        onClick={() => handleView(po.id)}
                        className="text-blue-950 hover:text-blue-700 transition-colors"
                        title="View Order"
                      >
                        <Eye size={16} />
                      </button>
                      {po.status !== 'Received' && po.status !== 'Cancelled' && (
                        <button 
                          onClick={() => handleEdit(po.id)}
                          className="text-orange-600 hover:text-orange-800 transition-colors"
                          title="Edit Order"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {po.status === 'Pending' && (
                        <button 
                          onClick={() => handleReceive(po.id)}
                          className="text-green-800 hover:text-green-700 transition-colors"
                          title="Receive Stock"
                        >
                          <Truck size={16} />
                        </button>
                      )}
                      {po.status !== 'Received' && po.status !== 'Cancelled' && (
                        <button 
                          onClick={() => handleDelete(po.id)}
                          className="text-red-800 hover:text-red-900 transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => handlePrint(po.id)}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                        title="Print Order"
                      >
                        <Printer size={16} />
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

export default PurchaseOrders;