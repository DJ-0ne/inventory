// src/pages/warehouses/Warehouses.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Warehouse,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Package,
  Users,
  Building2,
  RefreshCw,
  Download,
  Phone,
  Mail,
  MoreVertical
} from "lucide-react";
import dataService from "../../services/dataService";

const Warehouses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);

  // Load warehouses from localStorage
  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    filterWarehouses();
  }, [warehouses, searchTerm, filterStatus]);

  const loadWarehouses = () => {
    setLoading(true);
    // Load from localStorage
    const storedWarehouses = JSON.parse(localStorage.getItem('warehouses') || '[]');
    
    if (storedWarehouses.length > 0) {
      setWarehouses(storedWarehouses);
      setFilteredWarehouses(storedWarehouses);
    } else {
      // Default warehouses
      const defaultWarehouses = [
        { 
          id: 1, 
          name: "Main Warehouse", 
          location: "123 Main St, City Center", 
          manager: "John Smith",
          capacity: "5000",
          items: 1245,
          status: "Active",
          phone: "+1 234-567-8900",
          email: "main@inventory.com",
          description: "Primary storage facility"
        },
        { 
          id: 2, 
          name: "North Distribution Center", 
          location: "456 North Ave, Industrial Park", 
          manager: "Sarah Johnson",
          capacity: "8000",
          items: 892,
          status: "Active",
          phone: "+1 234-567-8901",
          email: "north@inventory.com",
          description: "Distribution hub for northern region"
        },
        { 
          id: 3, 
          name: "South Storage Facility", 
          location: "789 South Blvd, Business District", 
          manager: "Michael Brown",
          capacity: "3500",
          items: 456,
          status: "Maintenance",
          phone: "+1 234-567-8902",
          email: "south@inventory.com",
          description: "Undergoing maintenance"
        },
        { 
          id: 4, 
          name: "East Warehouse", 
          location: "101 East Road, Logistics Zone", 
          manager: "Emily Davis",
          capacity: "6200",
          items: 678,
          status: "Active",
          phone: "+1 234-567-8903",
          email: "east@inventory.com",
          description: "Specializes in large items"
        }
      ];
      setWarehouses(defaultWarehouses);
      setFilteredWarehouses(defaultWarehouses);
      localStorage.setItem('warehouses', JSON.stringify(defaultWarehouses));
    }
    setLoading(false);
  };

  const filterWarehouses = () => {
    let filtered = [...warehouses];
    
    if (searchTerm) {
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(w => w.status === filterStatus);
    }
    
    setFilteredWarehouses(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-800 text-white',
      'Maintenance': 'bg-orange-600 text-white',
      'Inactive': 'bg-red-800 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this warehouse? This action cannot be undone.')) {
      const updatedWarehouses = warehouses.filter(w => w.id !== id);
      setWarehouses(updatedWarehouses);
      setFilteredWarehouses(updatedWarehouses);
      localStorage.setItem('warehouses', JSON.stringify(updatedWarehouses));
      alert('Warehouse deleted successfully!');
    }
  };

  const handleEdit = (id) => {
    navigate(`/warehouses/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/warehouses/${id}`);
  };

  const handleRefresh = () => {
    loadWarehouses();
  };

  const handleExport = () => {
    const headers = ['Name', 'Location', 'Manager', 'Capacity (sq ft)', 'Items', 'Status', 'Phone', 'Email'];
    const rows = filteredWarehouses.map(w => 
      [w.name, w.location, w.manager, w.capacity, w.items, w.status, w.phone, w.email]
    );
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warehouses_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStats = () => {
    const total = warehouses.length;
    const active = warehouses.filter(w => w.status === 'Active').length;
    const totalItems = warehouses.reduce((sum, w) => sum + (w.items || 0), 0);
    const totalCapacity = warehouses.reduce((sum, w) => sum + (parseInt(w.capacity) || 0), 0);
    return { total, active, totalItems, totalCapacity };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading warehouses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Warehouses</h1>
          <p className="text-gray-600 font-medium text-sm">Manage all your warehouse locations and facilities</p>
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
          <Link to="/warehouses/add">
            <button className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
              <Plus size={18} />
              <span className="text-sm">Add Warehouse</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Warehouses</p>
          <p className="text-2xl font-bold text-blue-950">{stats.total}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-green-800">{stats.active}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Items</p>
          <p className="text-2xl font-bold text-orange-600">{stats.totalItems.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Capacity</p>
          <p className="text-2xl font-bold text-blue-950">{stats.totalCapacity.toLocaleString()} sq ft</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search warehouses by name, location, or manager..." 
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
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button 
            className="flex items-center gap-1 bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950"
            onClick={filterWarehouses}
          >
            <Filter size={16} />
            Apply
          </button>
          <div className="text-sm text-gray-600 font-medium">
            Showing {filteredWarehouses.length} of {warehouses.length} warehouses
          </div>
        </div>
      </div>

      {/* Warehouse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredWarehouses.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white border-2 border-blue-950/10 shadow-sm">
            <Warehouse size={48} className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No warehouses found</p>
            <p className="text-sm text-gray-500">Click "Add Warehouse" to create one</p>
          </div>
        ) : (
          filteredWarehouses.map((warehouse) => (
            <div key={warehouse.id} className="bg-white border-2 border-blue-950/10 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-950 p-3 border-2 border-white/20">
                      <Warehouse size={24} color="white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-950 text-lg">{warehouse.name}</h3>
                      <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                        <MapPin size={14} />
                        {warehouse.location}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold ${getStatusColor(warehouse.status)}`}>
                    {warehouse.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-gray-50 p-3">
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Manager</p>
                    <p className="font-bold text-blue-950 text-sm flex items-center gap-1">
                      <Users size={14} />
                      {warehouse.manager || 'Unassigned'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3">
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Items</p>
                    <p className="font-bold text-blue-950 text-sm flex items-center gap-1">
                      <Package size={14} />
                      {warehouse.items || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3">
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Capacity</p>
                    <p className="font-bold text-blue-950 text-sm flex items-center gap-1">
                      <Building2 size={14} />
                      {warehouse.capacity ? `${parseInt(warehouse.capacity).toLocaleString()} sq ft` : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3">
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Contact</p>
                    <p className="font-bold text-blue-950 text-sm flex items-center gap-1">
                      <Phone size={14} />
                      {warehouse.phone || 'N/A'}
                    </p>
                  </div>
                </div>

                {warehouse.description && (
                  <p className="text-xs text-gray-600 mt-3 font-medium">{warehouse.description}</p>
                )}

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t-2 border-gray-100">
                  <button 
                    onClick={() => handleView(warehouse.id)}
                    className="text-blue-950 border-2 border-blue-950/20 px-3 py-1 text-sm font-bold hover:bg-blue-950 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button 
                    onClick={() => handleEdit(warehouse.id)}
                    className="text-orange-600 border-2 border-orange-600/20 px-3 py-1 text-sm font-bold hover:bg-orange-600 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(warehouse.id)}
                    className="text-red-800 border-2 border-red-800/20 px-3 py-1 text-sm font-bold hover:bg-red-800 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                  <Link to="/warehouses/transfers">
                    <button className="bg-blue-950 text-white px-3 py-1 text-sm font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 flex items-center gap-1">
                      <Package size={14} />
                      Transfer
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Warehouses;