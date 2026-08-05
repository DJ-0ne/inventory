// src/pages/users/AuditTrail.jsx
import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  RefreshCw, 
  Download,
  ChevronDown,
  ChevronUp,
  User,
  Activity,
  Clock,
  Calendar,
  X,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { userAPI } from '../../services/api';
import dataService from '../../services/dataService';
import { EVENT_TYPE_COLORS, TABLE_HEADER_STYLES, TABLE_ROW_STYLES } from '../../constants';

const AuditTrail = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadData();
    const unsubscribeOrders = dataService.subscribe('orders', loadData);
    const unsubscribeProducts = dataService.subscribe('products', loadData);
    const unsubscribeUsers = dataService.subscribe('users', loadData);
    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
      unsubscribeUsers();
    };
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, filterAction, filterUser, dateRange]);

  const loadData = () => {
    setLoading(true);
    
    const allOrders = dataService.getOrders();
    const allProducts = dataService.getProducts();
    const allUsers = dataService.getUsers();
    setOrders(allOrders);
    setProducts(allProducts);
    setUsers(allUsers);

    // Generate audit logs from data
    const logsData = [];

    // Order logs
    allOrders.forEach(order => {
      logsData.push({
        id: `log-${Date.now()}-${logsData.length}`,
        action: order.status === 'Completed' ? 'Create' : 'Update',
        user: order.customer || 'system',
        timestamp: order.date ? `${order.date} ${order.time || '12:00:00'}` : new Date().toISOString().replace('T', ' ').slice(0, 19),
        details: `Order ${order.id} ${order.status === 'Completed' ? 'created' : 'updated'} - ${order.items || order.cartItems?.length || 0} items`,
        ip: '192.168.1.1',
        module: 'Sales'
      });
    });

    // Product logs
    allProducts.forEach(product => {
      logsData.push({
        id: `log-${Date.now()}-${logsData.length}`,
        action: 'Update',
        user: 'system',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        details: `Product ${product.name} (${product.sku}) - Stock: ${product.stock}, Status: ${product.status}`,
        ip: 'localhost',
        module: 'Inventory'
      });
    });

    // User logs
    allUsers.forEach(user => {
      logsData.push({
        id: `log-${Date.now()}-${logsData.length}`,
        action: 'Login',
        user: user.email || user.name || 'unknown',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        details: `User ${user.name} logged in successfully`,
        ip: '192.168.1.1',
        module: 'Authentication'
      });
    });

    // If no logs, use mock data
    if (logsData.length === 0) {
      const mockData = [
        { id: 1, action: 'Login', user: 'john.doe@email.com', timestamp: '2026-08-05 09:15:23', details: 'User logged in from IP 192.168.1.1', ip: '192.168.1.1', module: 'Authentication' },
        { id: 2, action: 'Update', user: 'jane.smith@email.com', timestamp: '2026-08-05 08:30:15', details: 'Product "Wireless Mouse" updated', ip: '192.168.1.15', module: 'Inventory' },
        { id: 3, action: 'Create', user: 'admin@email.com', timestamp: '2026-08-04 14:45:30', details: 'New user "testuser@email.com" created', ip: '192.168.1.10', module: 'Users' },
        { id: 4, action: 'Delete', user: 'admin@email.com', timestamp: '2026-08-04 14:20:10', details: 'User "olduser@email.com" deleted', ip: '192.168.1.10', module: 'Users' },
        { id: 5, action: 'Export', user: 'report@email.com', timestamp: '2026-08-04 13:00:00', details: 'Monthly sales report exported', ip: '192.168.1.20', module: 'Reports' },
        { id: 6, action: 'Import', user: 'data@email.com', timestamp: '2026-08-04 11:30:45', details: 'Bulk import of 500 products', ip: '192.168.1.30', module: 'Inventory' },
        { id: 7, action: 'Login', user: 'hacker@email.com', timestamp: '2026-08-03 23:45:12', details: 'Multiple failed login attempts detected', ip: '203.0.113.45', module: 'Security' },
        { id: 8, action: 'Update', user: 'manager@email.com', timestamp: '2026-08-03 16:20:00', details: 'User permissions updated for staff role', ip: '192.168.1.25', module: 'Users' }
      ];
      setLogs(mockData);
      setFilteredLogs(mockData);
    } else {
      setLogs(logsData);
      setFilteredLogs(logsData);
    }
    
    setLoading(false);
  };

  const filterLogs = () => {
    let filtered = logs;
    
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction);
    }
    
    if (filterUser !== 'all') {
      filtered = filtered.filter(log => log.user === filterUser);
    }
    
    if (dateRange.start) {
      filtered = filtered.filter(log => log.timestamp >= dateRange.start);
    }
    if (dateRange.end) {
      filtered = filtered.filter(log => log.timestamp <= dateRange.end);
    }
    
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (sortConfig.key === 'timestamp') {
          return sortConfig.direction === 'asc'
            ? new Date(a.timestamp) - new Date(b.timestamp)
            : new Date(b.timestamp) - new Date(a.timestamp);
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
    
    setFilteredLogs(filtered);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getActionBadge = (action) => {
    const baseStyles = 'px-3 py-1 text-xs font-bold uppercase tracking-wider';
    const color = EVENT_TYPE_COLORS[action] || 'bg-gray-700 text-white';
    return <span className={`${baseStyles} ${color}`}>{action}</span>;
  };

  const showCustomModal = (message, type, data = null) => {
    setModalMessage(message);
    setModalType(type);
    setSelectedLog(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("");
    setSelectedLog(null);
  };

  const handleViewDetails = (log) => {
    showCustomModal(
      `📋 Audit Log Details\n\nAction: ${log.action}\nUser: ${log.user}\nModule: ${log.module || 'N/A'}\nTimestamp: ${log.timestamp}\nDetails: ${log.details}\nIP Address: ${log.ip}`,
      "info",
      log
    );
  };

  const handleRefresh = () => {
    loadData();
    showCustomModal("🔄 Audit trail refreshed!", "success");
  };

  const handleExport = () => {
    const headers = ['Action', 'User', 'Module', 'Timestamp', 'Details', 'IP Address'];
    const rows = filteredLogs.map(log => [
      log.action,
      log.user,
      log.module || 'N/A',
      log.timestamp,
      log.details,
      log.ip
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showCustomModal("✅ Audit trail exported successfully!", "success");
  };

  const uniqueUsers = [...new Set(logs.map(log => log.user))];
  const uniqueActions = [...new Set(logs.map(log => log.action))];

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading audit trail...</p>
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
              {selectedLog && (
                <div className="mt-3 bg-gray-50 p-3 border-l-4 border-blue-950">
                  <p className="text-sm font-bold text-blue-950">{selectedLog.action}</p>
                  <p className="text-sm text-gray-600">User: {selectedLog.user}</p>
                  <p className="text-sm text-gray-600">Time: {selectedLog.timestamp}</p>
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
          <h1 className="text-2xl font-bold text-blue-950">Audit Trail</h1>
          <p className="text-gray-600 font-medium text-sm">Complete history of all system activities and user actions</p>
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

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Events</p>
          <p className="text-2xl font-bold text-blue-950">{logs.length}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Unique Users</p>
          <p className="text-2xl font-bold text-orange-600">{uniqueUsers.length}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Today's Events</p>
          <p className="text-2xl font-bold text-green-800">
            {logs.filter(log => log.timestamp.startsWith(new Date().toISOString().split('T')[0])).length}
          </p>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Unique Actions</p>
          <p className="text-2xl font-bold text-blue-950">{uniqueActions.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search actions, users, modules, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-blue-950/10 focus:border-blue-950 outline-none font-medium"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="border-2 border-blue-950/10 px-3 py-2 font-medium focus:border-blue-950 outline-none min-w-[120px]"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <User size={18} className="text-gray-600" />
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="border-2 border-blue-950/10 px-3 py-2 font-medium focus:border-blue-950 outline-none min-w-[150px]"
            >
              <option value="all">All Users</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-600" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border-2 border-blue-950/10 px-3 py-2 font-medium focus:border-blue-950 outline-none"
            />
            <span className="text-gray-600">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border-2 border-blue-950/10 px-3 py-2 font-medium focus:border-blue-950 outline-none"
            />
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Showing {filteredLogs.length} of {logs.length} entries
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('action')} className="flex items-center gap-1 hover:text-orange-600">
                  Action
                  {sortConfig.key === 'action' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('user')} className="flex items-center gap-1 hover:text-orange-600">
                  User
                  {sortConfig.key === 'user' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>Module</th>
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('timestamp')} className="flex items-center gap-1 hover:text-orange-600">
                  Timestamp
                  {sortConfig.key === 'timestamp' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>Details</th>
              <th className={TABLE_HEADER_STYLES}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500 font-medium">
                  No audit logs found
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className={TABLE_ROW_STYLES}>
                  <td className="py-3">{getActionBadge(log.action)}</td>
                  <td className="py-3 font-bold text-blue-950 text-xs">{log.user}</td>
                  <td className="py-3 text-gray-600 font-medium text-xs">{log.module || 'N/A'}</td>
                  <td className="py-3 text-gray-500 text-xs font-mono">{log.timestamp}</td>
                  <td className="py-3 text-gray-700 text-sm">{log.details}</td>
                  <td className="py-3 text-gray-500 text-xs font-mono">{log.ip}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditTrail;