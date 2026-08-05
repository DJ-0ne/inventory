// src/pages/warehouses/StockTransfers.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Search,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  RefreshCw,
  Download,
  Filter
} from "lucide-react";
import dataService from "../../services/dataService";

const StockTransfers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [newTransfer, setNewTransfer] = useState({
    product: "",
    productId: "",
    from: "",
    to: "",
    quantity: ""
  });
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Load data
  useEffect(() => {
    loadData();
    const unsubscribe = dataService.subscribe('products', loadData);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterTransfers();
  }, [transfers, searchTerm, filterStatus]);

  const loadData = () => {
    const allProducts = dataService.getProducts();
    setProducts(allProducts);
    
    // Load warehouses from localStorage
    const storedWarehouses = JSON.parse(localStorage.getItem('warehouses') || '[]');
    const defaultWarehouses = [
      { id: 1, name: "Main Warehouse", location: "New York" },
      { id: 2, name: "North Distribution Center", location: "Boston" },
      { id: 3, name: "South Storage Facility", location: "Atlanta" },
      { id: 4, name: "East Warehouse", location: "Philadelphia" }
    ];
    setWarehouses(storedWarehouses.length > 0 ? storedWarehouses : defaultWarehouses);

    // Load transfers from localStorage
    const storedTransfers = JSON.parse(localStorage.getItem('stockTransfers') || '[]');
    if (storedTransfers.length > 0) {
      setTransfers(storedTransfers);
      setFilteredTransfers(storedTransfers);
    } else {
      // Default transfers
      const defaultTransfers = [
        {
          id: 1,
          product: "Hammer",
          sku: "TOOL-001",
          from: "Main Warehouse",
          to: "North Distribution Center",
          quantity: 50,
          date: "2026-08-05",
          status: "Completed",
          transferredBy: "John Smith"
        },
        {
          id: 2,
          product: "Paint Roller",
          sku: "PAINT-003",
          from: "Main Warehouse",
          to: "South Storage Facility",
          quantity: 30,
          date: "2026-08-04",
          status: "Pending",
          transferredBy: "Sarah Johnson"
        },
        {
          id: 3,
          product: "Screwdriver Set",
          sku: "TOOL-005",
          from: "North Distribution Center",
          to: "East Warehouse",
          quantity: 25,
          date: "2026-08-03",
          status: "In Progress",
          transferredBy: "Michael Brown"
        },
        {
          id: 4,
          product: "Drill Bits",
          sku: "TOOL-018",
          from: "South Storage Facility",
          to: "Main Warehouse",
          quantity: 40,
          date: "2026-08-02",
          status: "Completed",
          transferredBy: "Emily Davis"
        }
      ];
      setTransfers(defaultTransfers);
      setFilteredTransfers(defaultTransfers);
      localStorage.setItem('stockTransfers', JSON.stringify(defaultTransfers));
    }
    setLoading(false);
  };

  const filterTransfers = () => {
    let filtered = [...transfers];
    
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.to.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }
    
    setFilteredTransfers(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-800 text-white',
      'Pending': 'bg-orange-600 text-white',
      'In Progress': 'bg-blue-950 text-white',
      'Cancelled': 'bg-red-800 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed': return <CheckCircle size={16} />;
      case 'Pending': return <Clock size={16} />;
      case 'In Progress': return <Truck size={16} />;
      case 'Cancelled': return <XCircle size={16} />;
      default: return null;
    }
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!newTransfer.product || !newTransfer.from || !newTransfer.to || !newTransfer.quantity) {
      alert("Please fill in all required fields");
      return;
    }

    if (newTransfer.from === newTransfer.to) {
      alert("Source and destination warehouses cannot be the same");
      return;
    }

    // Find the product
    const product = products.find(p => 
      p.name.toLowerCase().includes(newTransfer.product.toLowerCase())
    );

    // Create transfer
    const transfer = {
      id: Date.now(),
      product: newTransfer.product,
      sku: product?.sku || 'N/A',
      from: newTransfer.from,
      to: newTransfer.to,
      quantity: parseInt(newTransfer.quantity),
      date: new Date().toISOString().split('T')[0],
      status: "Pending",
      transferredBy: "Current User"
    };

    // Update transfers
    const updatedTransfers = [transfer, ...transfers];
    setTransfers(updatedTransfers);
    setFilteredTransfers(updatedTransfers);
    localStorage.setItem('stockTransfers', JSON.stringify(updatedTransfers));

    // Update product stock
    if (product) {
      // Remove from source warehouse (we'll track warehouse inventory separately)
      // For now, just update the main stock
      dataService.updateProduct(product.id, {
        stock: Math.max(0, product.stock - parseInt(newTransfer.quantity))
      });
    }

    setShowTransferForm(false);
    setNewTransfer({ product: "", productId: "", from: "", to: "", quantity: "" });
    alert(`✅ Transfer created successfully!\n${newTransfer.quantity} units of ${newTransfer.product}\nFrom: ${newTransfer.from}\nTo: ${newTransfer.to}`);
  };

  const handleUpdateStatus = (transferId, newStatus) => {
    const updatedTransfers = transfers.map(t => 
      t.id === transferId ? { ...t, status: newStatus } : t
    );
    setTransfers(updatedTransfers);
    setFilteredTransfers(updatedTransfers);
    localStorage.setItem('stockTransfers', JSON.stringify(updatedTransfers));
    alert(`Transfer status updated to: ${newStatus}`);
  };

  const handleViewTransfer = (transferId) => {
    navigate(`/warehouses/transfer/${transferId}`);
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleExport = () => {
    const headers = ['Product', 'SKU', 'From', 'To', 'Quantity', 'Date', 'Status', 'Transferred By'];
    const rows = filteredTransfers.map(t => 
      [t.product, t.sku, t.from, t.to, t.quantity, t.date, t.status, t.transferredBy]
    );
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_transfers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStats = () => {
    const total = transfers.length;
    const completed = transfers.filter(t => t.status === 'Completed').length;
    const pending = transfers.filter(t => t.status === 'Pending').length;
    const inProgress = transfers.filter(t => t.status === 'In Progress').length;
    return { total, completed, pending, inProgress };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading transfers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Stock Transfers</h1>
          <p className="text-gray-600 font-medium text-sm">Move stock between warehouse locations</p>
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
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            <span className="text-sm">Export</span>
          </button>
          <button
            onClick={() => setShowTransferForm(!showTransferForm)}
            className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
          >
            <Plus size={18} />
            <span className="text-sm">New Transfer</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Transfers</p>
          <p className="text-2xl font-bold text-blue-950">{stats.total}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-bold text-blue-950">{stats.inProgress}</p>
        </div>
      </div>

      {/* Transfer Form */}
      {showTransferForm && (
        <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Create Stock Transfer</h2>
          <form onSubmit={handleTransferSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                  Product <span className="text-red-800">*</span>
                </label>
                <div className="relative">
                  <Package size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={newTransfer.product}
                    onChange={(e) => setNewTransfer({...newTransfer, product: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border-2 border-blue-950/10 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    list="productList"
                    required
                  />
                  <datalist id="productList">
                    {products.map(p => (
                      <option key={p.id} value={p.name}>{p.sku} - Stock: {p.stock}</option>
                    ))}
                  </datalist>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                  From <span className="text-red-800">*</span>
                </label>
                <select
                  value={newTransfer.from}
                  onChange={(e) => setNewTransfer({...newTransfer, from: e.target.value})}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                  required
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                  To <span className="text-red-800">*</span>
                </label>
                <select
                  value={newTransfer.to}
                  onChange={(e) => setNewTransfer({...newTransfer, to: e.target.value})}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                  required
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                  Quantity <span className="text-red-800">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  min="1"
                  value={newTransfer.quantity}
                  onChange={(e) => setNewTransfer({...newTransfer, quantity: e.target.value})}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                type="submit"
                className="bg-blue-950 text-white px-6 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
              >
                Create Transfer
              </button>
              <button
                type="button"
                onClick={() => setShowTransferForm(false)}
                className="bg-white border-2 border-blue-950/20 text-blue-950 px-6 py-2 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search transfers..."
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
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button
            className="bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950"
            onClick={filterTransfers}
          >
            <Filter size={16} className="inline mr-1" />
            Apply
          </button>
          <div className="text-sm text-gray-600 font-medium">
            Showing {filteredTransfers.length} of {transfers.length} transfers
          </div>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">From</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">To</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Qty</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Date</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransfers.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                  No transfers found. Create a new transfer to get started.
                </td>
              </tr>
            ) : (
              filteredTransfers.map((transfer) => (
                <tr key={transfer.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-950">{transfer.product}</td>
                  <td className="py-3 px-4 text-gray-600 font-medium text-xs">{transfer.sku}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{transfer.from}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{transfer.to}</td>
                  <td className="py-3 px-4 font-bold text-blue-950">{transfer.quantity}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{transfer.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-bold flex items-center gap-1 ${getStatusColor(transfer.status)}`}>
                      {getStatusIcon(transfer.status)}
                      {transfer.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewTransfer(transfer.id)}
                        className="text-blue-950 hover:text-blue-700 transition-colors"
                        title="View Transfer"
                      >
                        <Eye size={16} />
                      </button>
                      {transfer.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(transfer.id, 'In Progress')}
                            className="text-blue-950 hover:text-blue-700 transition-colors text-xs font-bold"
                          >
                            Start
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(transfer.id, 'Completed')}
                            className="text-green-800 hover:text-green-700 transition-colors text-xs font-bold"
                          >
                            Complete
                          </button>
                        </>
                      )}
                      {transfer.status === 'In Progress' && (
                        <button 
                          onClick={() => handleUpdateStatus(transfer.id, 'Completed')}
                          className="text-green-800 hover:text-green-700 transition-colors text-xs font-bold"
                        >
                          Complete
                        </button>
                      )}
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

export default StockTransfers;