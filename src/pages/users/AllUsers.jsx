// src/pages/users/AllUsers.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  Download,
  Plus,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Shield,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { userAPI } from '../../services/api';
import dataService from '../../services/dataService';
import { USER_ROLE_COLORS, TABLE_HEADER_STYLES, TABLE_ROW_STYLES } from '../../constants';

const AllUsers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
    const unsubscribe = dataService.subscribe('users', loadUsers);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole, filterStatus]);

  const loadUsers = () => {
    setLoading(true);
    const allUsers = dataService.getUsers();
    if (allUsers.length > 0) {
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } else {
      // Mock data if no users exist
      const mockData = [
        { id: 1, name: 'John Doe', email: 'john.doe@email.com', phone: '+1 (555) 123-4567', role: 'Administrator', status: 'Active', lastLogin: '2026-08-05 09:15:23', department: 'IT' },
        { id: 2, name: 'Jane Smith', email: 'jane.smith@email.com', phone: '+1 (555) 234-5678', role: 'Manager', status: 'Active', lastLogin: '2026-08-05 08:30:15', department: 'Operations' },
        { id: 3, name: 'Robert Johnson', email: 'robert.j@email.com', phone: '+1 (555) 345-6789', role: 'Staff', status: 'Active', lastLogin: '2026-08-04 14:45:30', department: 'Sales' },
        { id: 4, name: 'Mary Williams', email: 'mary.w@email.com', phone: '+1 (555) 456-7890', role: 'Supervisor', status: 'Inactive', lastLogin: '2026-08-03 11:20:10', department: 'Warehouse' },
        { id: 5, name: 'Michael Brown', email: 'michael.b@email.com', phone: '+1 (555) 567-8901', role: 'Staff', status: 'Active', lastLogin: '2026-08-05 10:00:00', department: 'Sales' },
        { id: 6, name: 'Sarah Davis', email: 'sarah.d@email.com', phone: '+1 (555) 678-9012', role: 'Viewer', status: 'Active', lastLogin: '2026-08-04 09:45:30', department: 'HR' },
        { id: 7, name: 'David Wilson', email: 'david.w@email.com', phone: '+1 (555) 789-0123', role: 'Manager', status: 'Suspended', lastLogin: '2026-08-02 16:20:00', department: 'Purchasing' },
        { id: 8, name: 'Emily Taylor', email: 'emily.t@email.com', phone: '+1 (555) 890-1234', role: 'Staff', status: 'Active', lastLogin: '2026-08-05 07:45:00', department: 'Customer Service' }
      ];
      setUsers(mockData);
      setFilteredUsers(mockData);
      // Save to dataService
      mockData.forEach(user => dataService.addUser(user));
    }
    setLoading(false);
  };

  const filterUsers = () => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
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
    
    setFilteredUsers(filtered);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getRoleBadge = (role) => {
    const baseStyles = 'px-3 py-1 text-xs font-bold uppercase tracking-wider';
    const color = USER_ROLE_COLORS[role] || 'bg-gray-700 text-white';
    return <span className={`${baseStyles} ${color}`}>{role}</span>;
  };

  const getStatusBadge = (status) => {
    const baseStyles = 'px-3 py-1 text-xs font-bold uppercase tracking-wider';
    const colors = {
      'Active': 'bg-green-800 text-white',
      'Inactive': 'bg-gray-700 text-white',
      'Suspended': 'bg-red-800 text-white'
    };
    return <span className={`${baseStyles} ${colors[status] || 'bg-gray-700 text-white'}`}>{status}</span>;
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
    setSelectedUser(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("");
    setSelectedUser(null);
  };

  const handleEdit = (user) => {
    navigate(`/users/edit/${user.id}`);
  };

  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      // In a real app, you'd call an API
      const updatedUsers = users.filter(u => u.id !== user.id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      // Update in dataService
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      showCustomModal(`🗑️ User ${user.name} has been deleted!`, "success", user);
    }
  };

  const handleRefresh = () => {
    loadUsers();
    showCustomModal(" Users refreshed!", "success");
  };

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Department', 'Status', 'Last Login'];
    const rows = filteredUsers.map(user => [
      user.name,
      user.email,
      user.phone,
      user.role,
      user.department,
      user.status,
      user.lastLogin
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showCustomModal(" Users exported successfully!", "success");
  };

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'bg-blue-950' },
    { label: 'Active', value: users.filter(u => u.status === 'Active').length, icon: User, color: 'bg-green-800' },
    { label: 'Administrators', value: users.filter(u => u.role === 'Administrator').length, icon: Shield, color: 'bg-red-800' },
    { label: 'Managers', value: users.filter(u => u.role === 'Manager').length, icon: Shield, color: 'bg-orange-600' }
  ];

  const roles = [...new Set(users.map(u => u.role))];
  const statuses = [...new Set(users.map(u => u.status))];

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading users...</p>
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
              {selectedUser && (
                <div className="mt-3 bg-gray-50 p-3 border-l-4 border-blue-950">
                  <p className="text-sm font-bold text-blue-950">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600">Email: {selectedUser.email}</p>
                  <p className="text-sm text-gray-600">Role: {selectedUser.role}</p>
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
          <h1 className="text-2xl font-bold text-blue-950">All Users</h1>
          <p className="text-gray-600 font-medium text-sm">Manage system users and their access</p>
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
          <Link to="/users/add">
            <button className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
              <Plus size={18} />
              <span className="text-sm">Add User</span>
            </button>
          </Link>
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
                placeholder="Search users, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-blue-950/10 focus:border-blue-950 outline-none font-medium"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border-2 border-blue-950/10 px-3 py-2 font-medium focus:border-blue-950 outline-none min-w-[130px]"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border-2 border-blue-950/10 px-3 py-2 font-medium focus:border-blue-950 outline-none min-w-[120px]"
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-orange-600">
                  Name
                  {sortConfig.key === 'name' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>Email</th>
              <th className={TABLE_HEADER_STYLES}>Phone</th>
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('role')} className="flex items-center gap-1 hover:text-orange-600">
                  Role
                  {sortConfig.key === 'role' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>Department</th>
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('status')} className="flex items-center gap-1 hover:text-orange-600">
                  Status
                  {sortConfig.key === 'status' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>Last Login</th>
              <th className={TABLE_HEADER_STYLES} style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                  No users found. Click "Add User" to create one.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className={TABLE_ROW_STYLES}>
                  <td className="py-3 font-bold text-blue-950">{user.name}</td>
                  <td className="py-3 text-gray-700 font-medium text-xs">
                    <div className="flex items-center gap-1">
                      <Mail size={14} className="text-gray-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="py-3 text-gray-600 text-xs">
                    <div className="flex items-center gap-1">
                      <Phone size={14} className="text-gray-400" />
                      {user.phone}
                    </div>
                  </td>
                  <td className="py-3">{getRoleBadge(user.role)}</td>
                  <td className="py-3 text-gray-700 font-medium text-xs">{user.department}</td>
                  <td className="py-3">{getStatusBadge(user.status)}</td>
                  <td className="py-3 text-gray-500 text-xs font-mono">{user.lastLogin}</td>
                  <td className="py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-1 text-blue-950 hover:bg-blue-50 transition-colors" 
                        title="Edit User"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user)}
                        className="p-1 text-red-800 hover:bg-red-50 transition-colors" 
                        title="Delete User"
                      >
                        <Trash2 size={18} />
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

export default AllUsers;