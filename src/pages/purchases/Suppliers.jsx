// src/pages/purchases/Suppliers.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Truck,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Package,
  Star,
  Clock,
  RefreshCw,
  Download,
  Filter,
  X
} from "lucide-react";
import dataService from "../../services/dataService";

const Suppliers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
    leadTime: "",
    status: "Active"
  });

  // Load suppliers
  useEffect(() => {
    loadSuppliers();
    const unsubscribe = dataService.subscribe('suppliers', loadSuppliers);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm, filterStatus]);

  const loadSuppliers = () => {
    setLoading(true);
    const allSuppliers = dataService.getSuppliers();
    setSuppliers(allSuppliers);
    setFilteredSuppliers(allSuppliers);
    setLoading(false);
  };

  const filterSuppliers = () => {
    let filtered = [...suppliers];
    
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm)
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }
    
    setFilteredSuppliers(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-800 text-white',
      'Inactive': 'bg-red-800 text-white',
      'Pending': 'bg-orange-600 text-white'
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

  const handleView = (id) => {
    navigate(`/purchases/supplier/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/purchases/supplier/edit/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      // In a real app, you'd call an API
      const updatedSuppliers = suppliers.filter(s => s.id !== id);
      setSuppliers(updatedSuppliers);
      setFilteredSuppliers(updatedSuppliers);
      // Update in dataService
      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
      alert('Supplier deleted successfully!');
    }
  };

  const handleAddSupplier = () => {
    setShowAddForm(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.contact || !newSupplier.phone) {
      alert("Please fill in all required fields");
      return;
    }

    const supplier = {
      id: Date.now(),
      ...newSupplier,
      products: 0,
      rating: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    dataService.addSupplier(supplier);
    setShowAddForm(false);
    setNewSupplier({
      name: "",
      contact: "",
      phone: "",
      email: "",
      address: "",
      leadTime: "",
      status: "Active"
    });
    alert(`✅ Supplier "${supplier.name}" added successfully!`);
  };

  const handleRefresh = () => {
    loadSuppliers();
  };

  const handleExport = () => {
    const headers = ['Name', 'Contact', 'Phone', 'Email', 'Address', 'Products', 'Rating', 'Lead Time', 'Status'];
    const rows = filteredSuppliers.map(s => 
      [s.name, s.contact, s.phone, s.email, s.address || 'N/A', s.products || 0, s.rating || 0, s.leadTime || 'N/A', s.status]
    );
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suppliers_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStats = () => {
    const total = suppliers.length;
    const active = suppliers.filter(s => s.status === 'Active').length;
    const totalProducts = suppliers.reduce((sum, s) => sum + (s.products || 0), 0);
    const avgRating = suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / (suppliers.length || 1);
    return { total, active, totalProducts, avgRating };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Suppliers</h1>
          <p className="text-gray-600 font-medium text-sm">Manage all your suppliers and vendors</p>
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
            onClick={handleAddSupplier}
            className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
          >
            <Plus size={18} />
            <span className="text-sm">Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Suppliers</p>
          <p className="text-2xl font-bold text-blue-950">{stats.total}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-green-800">{stats.active}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Products Supplied</p>
          <p className="text-2xl font-bold text-orange-600">{stats.totalProducts}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Avg Rating</p>
          <p className="text-2xl font-bold text-blue-950">{stats.avgRating.toFixed(1)}</p>
        </div>
      </div>

      {/* Add Supplier Form */}
      {showAddForm && (
        <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blue-950">Add New Supplier</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-red-800 hover:text-red-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleAddSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                  Supplier Name <span className="text-red-800">*</span>
                </label>
                <input
                  type="text"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Enter supplier name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                  Contact Person <span className="text-red-800">*</span>
                </label>
                <input
                  type="text"
                  value={newSupplier.contact}
                  onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Enter contact name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                  Phone <span className="text-red-800">*</span>
                </label>
                <input
                  type="tel"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Enter email address"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Address</label>
                <input
                  type="text"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Enter address"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Lead Time</label>
                <select
                  value={newSupplier.leadTime}
                  onChange={(e) => setNewSupplier({...newSupplier, leadTime: e.target.value})}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                >
                  <option value="">Select lead time</option>
                  <option value="1-3 days">1-3 days</option>
                  <option value="3-5 days">3-5 days</option>
                  <option value="5-7 days">5-7 days</option>
                  <option value="7-10 days">7-10 days</option>
                  <option value="10+ days">10+ days</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={newSupplier.status}
                  onChange={(e) => setNewSupplier({...newSupplier, status: e.target.value})}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t-2 border-blue-950/10">
              <button
                type="submit"
                className="bg-blue-950 text-white px-6 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
              >
                Add Supplier
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-white border-2 border-blue-950/20 text-blue-950 px-6 py-2 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search suppliers by name, contact, or email..." 
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
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
          <button 
            className="flex items-center gap-1 bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950"
            onClick={filterSuppliers}
          >
            <Filter size={16} />
            Apply
          </button>
          <div className="text-sm text-gray-600 font-medium">
            Showing {filteredSuppliers.length} of {suppliers.length} suppliers
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Supplier</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Contact</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Phone</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Email</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Products</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Rating</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                  No suppliers found. Click "Add Supplier" to create one.
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-bold text-blue-950">{supplier.name}</p>
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <Clock size={12} />
                        Lead: {supplier.leadTime || 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{supplier.contact}</td>
                  <td className="py-3 px-4 text-gray-600 font-medium text-sm flex items-center gap-1">
                    <Phone size={14} />
                    {supplier.phone}
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-medium text-sm flex items-center gap-1">
                    <Mail size={14} />
                    {supplier.email}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-blue-950">{supplier.products || 0}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {getRatingStars(supplier.rating)}
                      <span className="text-xs font-bold text-gray-600 ml-1">{supplier.rating || 0}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-bold ${getStatusColor(supplier.status)}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleView(supplier.id)}
                        className="text-blue-950 hover:text-blue-700 transition-colors"
                        title="View Supplier"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEdit(supplier.id)}
                        className="text-orange-600 hover:text-orange-800 transition-colors"
                        title="Edit Supplier"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(supplier.id)}
                        className="text-red-800 hover:text-red-900 transition-colors"
                        title="Delete Supplier"
                      >
                        <Trash2 size={16} />
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

export default Suppliers;