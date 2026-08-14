// src/pages/notifications/SystemEvents.jsx
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Server,
  Database,
  Shield,
  User,
  Settings,
  X,
  Eye
} from 'lucide-react';
import { notificationAPI } from '../../services/api';
import dataService from '../../services/dataService';
import { EVENT_TYPES, EVENT_TYPE_COLORS, TABLE_HEADER_STYLES, TABLE_ROW_STYLES } from '../../constants';

const SystemEvents = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
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
    filterEvents();
  }, [events, searchTerm, filterType, filterSeverity]);

  const loadData = () => {
    setLoading(true);
    
    const allOrders = dataService.getOrders();
    const allProducts = dataService.getProducts();
    const allUsers = dataService.getUsers();
    setOrders(allOrders);
    setProducts(allProducts);
    setUsers(allUsers);

    // Generate system events from data
    const eventsData = [];

    // Order events
    allOrders.forEach(order => {
      eventsData.push({
        id: `event-${Date.now()}-${eventsData.length}`,
        eventType: order.status === 'Completed' ? 'Create' : 'Update',
        user: order.customer || 'system',
        timestamp: order.date ? `${order.date} ${order.time || '12:00:00'}` : new Date().toISOString().replace('T', ' ').slice(0, 19),
        severity: order.status === 'Refunded' ? 'Warning' : 'Info',
        description: `Order ${order.id} ${order.status === 'Completed' ? 'created' : 'updated'} - ${order.items || order.cartItems?.length || 0} items`,
        module: 'Sales',
        ipAddress: '192.168.1.1'
      });
    });

    // Product events
    allProducts.forEach(product => {
      if (product.stock <= product.threshold) {
        eventsData.push({
          id: `event-${Date.now()}-${eventsData.length}`,
          eventType: 'Update',
          user: 'system',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          severity: product.stock === 0 ? 'Critical' : 'Warning',
          description: `Product ${product.name} (${product.sku}) is ${product.stock === 0 ? 'out of stock' : 'low on stock'} - ${product.stock} units remaining`,
          module: 'Inventory',
          ipAddress: 'localhost'
        });
      }
    });

    // User events
    allUsers.forEach(user => {
      eventsData.push({
        id: `event-${Date.now()}-${eventsData.length}`,
        eventType: 'Login',
        user: user.email || user.name || 'unknown',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        severity: 'Info',
        description: `User ${user.name} logged in successfully`,
        module: 'Authentication',
        ipAddress: '192.168.1.1'
      });
    });

    // If no events, use mock data
    if (eventsData.length === 0) {
      const mockData = [
        { 
          id: 1, 
          eventType: 'Login', 
          user: 'john.doe@email.com', 
          timestamp: '2026-08-05 09:15:23',
          severity: 'Info',
          description: 'User logged in successfully from IP 192.168.1.1',
          module: 'Authentication',
          ipAddress: '192.168.1.1'
        },
        {
          id: 2,
          eventType: 'Backup',
          user: 'system',
          timestamp: '2026-08-05 01:00:00',
          severity: 'Info',
          description: 'Scheduled system backup completed successfully',
          module: 'System',
          ipAddress: 'localhost'
        },
        {
          id: 3,
          eventType: 'Update',
          user: 'admin@email.com',
          timestamp: '2026-08-04 14:30:45',
          severity: 'Warning',
          description: 'Product inventory updated for 150 items',
          module: 'Inventory',
          ipAddress: '192.168.1.15'
        },
        {
          id: 4,
          eventType: 'Config Change',
          user: 'admin@email.com',
          timestamp: '2026-08-04 11:20:10',
          severity: 'Warning',
          description: 'Store configuration settings modified',
          module: 'System',
          ipAddress: '192.168.1.15'
        },
        {
          id: 5,
          eventType: 'Delete',
          user: 'manager@email.com',
          timestamp: '2026-08-04 09:45:30',
          severity: 'Warning',
          description: 'User account "testuser" was deleted',
          module: 'Users',
          ipAddress: '192.168.1.22'
        },
        {
          id: 6,
          eventType: 'Create',
          user: 'manager@email.com',
          timestamp: '2026-08-04 08:30:15',
          severity: 'Info',
          description: 'New product "Wireless Mouse" added to inventory',
          module: 'Inventory',
          ipAddress: '192.168.1.22'
        },
        {
          id: 7,
          eventType: 'Import',
          user: 'data.team@email.com',
          timestamp: '2026-08-04 07:15:00',
          severity: 'Info',
          description: 'Bulk import of 500 customer records completed',
          module: 'Customers',
          ipAddress: '192.168.1.30'
        },
        {
          id: 8,
          eventType: 'Login',
          user: 'hacker@email.com',
          timestamp: '2026-08-03 23:45:12',
          severity: 'Critical',
          description: 'Multiple failed login attempts detected',
          module: 'Security',
          ipAddress: '203.0.113.45'
        },
        {
          id: 9,
          eventType: 'Export',
          user: 'report@email.com',
          timestamp: '2026-08-03 16:20:00',
          severity: 'Info',
          description: 'Sales report exported for Q2 2026',
          module: 'Reports',
          ipAddress: '192.168.1.10'
        },
        {
          id: 10,
          eventType: 'Update',
          user: 'dev.team@email.com',
          timestamp: '2026-08-03 14:00:00',
          severity: 'Info',
          description: 'API settings updated - new endpoints configured',
          module: 'API',
          ipAddress: '192.168.1.5'
        }
      ];
      setEvents(mockData);
      setFilteredEvents(mockData);
    } else {
      setEvents(eventsData);
      setFilteredEvents(eventsData);
    }
    
    setLoading(false);
  };

  const filterEvents = () => {
    let filtered = events;
    
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.module.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.eventType === filterType);
    }
    
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(event => event.severity === filterSeverity);
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
    
    setFilteredEvents(filtered);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSeverityBadge = (severity) => {
    const baseStyles = 'px-3 py-1 text-xs font-bold uppercase tracking-wider';
    const colorMap = {
      'Critical': 'bg-red-800 text-white',
      'Warning': 'bg-orange-600 text-white',
      'Info': 'bg-blue-950 text-white',
    };
    return <span className={`${baseStyles} ${colorMap[severity] || 'bg-gray-700 text-white'}`}>{severity}</span>;
  };

  const getTypeBadge = (type) => {
    const baseStyles = 'px-3 py-1 text-xs font-bold uppercase tracking-wider';
    const color = EVENT_TYPE_COLORS[type] || 'bg-gray-700 text-white';
    return <span className={`${baseStyles} ${color}`}>{type}</span>;
  };

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'Critical': return <XCircle size={16} className="text-red-800" />;
      case 'Warning': return <AlertCircle size={16} className="text-orange-600" />;
      case 'Info': return <CheckCircle size={16} className="text-green-800" />;
      default: return <Activity size={16} className="text-gray-600" />;
    }
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
    setSelectedEvent(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("");
    setSelectedEvent(null);
  };

  const handleViewDetails = (event) => {
    showCustomModal(
      `📋 Event Details\n\nType: ${event.eventType}\nSeverity: ${event.severity}\nUser: ${event.user}\nModule: ${event.module}\nDescription: ${event.description}\nIP Address: ${event.ipAddress}\nTimestamp: ${event.timestamp}`,
      "info",
      event
    );
  };

  const handleRefresh = () => {
    loadData();
    showCustomModal(" System events refreshed!", "success");
  };

  const handleExport = () => {
    const headers = ['Event Type', 'Severity', 'User', 'Module', 'Description', 'IP Address', 'Timestamp'];
    const rows = filteredEvents.map(event => [
      event.eventType,
      event.severity,
      event.user,
      event.module,
      event.description,
      event.ipAddress,
      event.timestamp
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_events_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showCustomModal(" System events exported successfully!", "success");
  };

  const stats = [
    { label: 'Total Events', value: events.length, icon: Activity, color: 'bg-blue-950' },
    { label: 'Critical', value: events.filter(e => e.severity === 'Critical').length, icon: XCircle, color: 'bg-red-800' },
    { label: 'Warning', value: events.filter(e => e.severity === 'Warning').length, icon: AlertCircle, color: 'bg-orange-600' },
    { label: 'Info', value: events.filter(e => e.severity === 'Info').length, icon: CheckCircle, color: 'bg-green-800' },
  ];

  const eventTypes = [...new Set(events.map(e => e.eventType))].sort();

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading system events...</p>
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
              {selectedEvent && (
                <div className="mt-3 bg-gray-50 p-3 border-l-4 border-blue-950">
                  <p className="text-sm font-bold text-blue-950">{selectedEvent.eventType}</p>
                  <p className="text-sm text-gray-600">User: {selectedEvent.user}</p>
                  <p className="text-sm text-gray-600">Severity: {selectedEvent.severity}</p>
                  <p className="text-sm text-gray-600">Module: {selectedEvent.module}</p>
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
          <h1 className="text-2xl font-bold text-blue-950">System Events</h1>
          <p className="text-gray-600 font-medium text-sm">Real-time monitoring of system activities and events</p>
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
                placeholder="Search events, users, or modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-blue-950/10 focus:border-blue-950 outline-none font-medium"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border-2 border-blue-950/10 px-3 py-2 font-medium focus:border-blue-950 outline-none min-w-[130px]"
            >
              <option value="all">All Types</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Shield size={18} className="text-gray-600" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="border-2 border-blue-950/10 px-3 py-2 font-medium focus:border-blue-950 outline-none min-w-[120px]"
            >
              <option value="all">All Severity</option>
              <option value="Critical">Critical</option>
              <option value="Warning">Warning</option>
              <option value="Info">Info</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Showing {filteredEvents.length} of {events.length} events
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('eventType')} className="flex items-center gap-1 hover:text-orange-600">
                  Event
                  {sortConfig.key === 'eventType' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>Severity</th>
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
                <button onClick={() => handleSort('description')} className="flex items-center gap-1 hover:text-orange-600">
                  Description
                  {sortConfig.key === 'description' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>IP Address</th>
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('timestamp')} className="flex items-center gap-1 hover:text-orange-600">
                  Time
                  {sortConfig.key === 'timestamp' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500 font-medium">
                  No system events found
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => (
                <tr key={event.id} className={TABLE_ROW_STYLES}>
                  <td className="py-3">{getTypeBadge(event.eventType)}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {getSeverityIcon(event.severity)}
                      {getSeverityBadge(event.severity)}
                    </div>
                  </td>
                  <td className="py-3 font-bold text-blue-950 text-xs">{event.user}</td>
                  <td className="py-3 text-gray-600 font-medium text-xs">{event.module}</td>
                  <td className="py-3 text-gray-700 text-sm max-w-xs truncate">{event.description}</td>
                  <td className="py-3 text-gray-500 text-xs font-mono">{event.ipAddress}</td>
                  <td className="py-3 text-gray-500 text-xs font-mono">{event.timestamp}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemEvents;