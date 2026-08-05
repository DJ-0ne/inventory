// src/pages/users/RolesPermissions.jsx
import React, { useState, useEffect } from 'react';
import { Shield, Check, X, RefreshCw, Save, Edit, Trash2, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { userAPI } from '../../services/api';
import dataService from '../../services/dataService';
import { USER_ROLE_COLORS, TABLE_HEADER_STYLES, TABLE_ROW_STYLES } from '../../constants';

const RolesPermissions = () => {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    
    // Load roles from localStorage or use defaults
    const storedRoles = JSON.parse(localStorage.getItem('roles') || 'null');
    const storedPermissions = JSON.parse(localStorage.getItem('permissions') || 'null');
    
    if (storedRoles && storedPermissions) {
      setRoles(storedRoles);
      setPermissions(storedPermissions);
    } else {
      // Default data
      const defaultRoles = [
        { id: 1, name: 'Administrator', description: 'Full system access', permissions: ['All Permissions'], userCount: 3 },
        { id: 2, name: 'Manager', description: 'Manage inventory and reports', permissions: ['Read', 'Write', 'Export'], userCount: 7 },
        { id: 3, name: 'Supervisor', description: 'Supervise operations', permissions: ['Read', 'Write'], userCount: 12 },
        { id: 4, name: 'Staff', description: 'Basic operations', permissions: ['Read'], userCount: 25 },
        { id: 5, name: 'Viewer', description: 'View only access', permissions: ['View'], userCount: 5 }
      ];
      const defaultPermissions = ['View', 'Read', 'Write', 'Export', 'Import', 'Delete', 'Manage Users', 'Manage System'];
      
      setRoles(defaultRoles);
      setPermissions(defaultPermissions);
      localStorage.setItem('roles', JSON.stringify(defaultRoles));
      localStorage.setItem('permissions', JSON.stringify(defaultPermissions));
    }
    
    setLoading(false);
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

  const handlePermissionToggle = (roleId, permission) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        const perms = role.permissions.includes(permission)
          ? role.permissions.filter(p => p !== permission)
          : [...role.permissions, permission];
        return { ...role, permissions: perms };
      }
      return role;
    }));
  };

  const handleSaveRole = (roleId) => {
    const updatedRoles = roles.map(role => 
      role.id === roleId ? { ...role } : role
    );
    setRoles(updatedRoles);
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
    setEditingRole(null);
    showCustomModal(`✅ Role "${roles.find(r => r.id === roleId)?.name}" updated successfully!`, "success");
  };

  const handleAddRole = () => {
    if (!newRole.name.trim()) {
      showCustomModal("❌ Role name is required", "error");
      return;
    }
    
    const role = {
      id: Date.now(),
      name: newRole.name,
      description: newRole.description || 'No description',
      permissions: newRole.permissions.length > 0 ? newRole.permissions : ['View'],
      userCount: 0
    };
    
    const updatedRoles = [...roles, role];
    setRoles(updatedRoles);
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
    setShowAddForm(false);
    setNewRole({ name: '', description: '', permissions: [] });
    showCustomModal(`✅ Role "${role.name}" added successfully!`, "success");
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      const role = roles.find(r => r.id === roleId);
      const updatedRoles = roles.filter(r => r.id !== roleId);
      setRoles(updatedRoles);
      localStorage.setItem('roles', JSON.stringify(updatedRoles));
      showCustomModal(`🗑️ Role "${role?.name}" deleted successfully!`, "success");
    }
  };

  const handleRefresh = () => {
    loadData();
    showCustomModal("🔄 Roles & permissions refreshed!", "success");
  };

  const handleAddPermission = () => {
    const newPermission = prompt('Enter new permission name:');
    if (newPermission && newPermission.trim()) {
      const trimmed = newPermission.trim();
      if (!permissions.includes(trimmed)) {
        const updatedPermissions = [...permissions, trimmed];
        setPermissions(updatedPermissions);
        localStorage.setItem('permissions', JSON.stringify(updatedPermissions));
        showCustomModal(`✅ Permission "${trimmed}" added successfully!`, "success");
      } else {
        showCustomModal(`⚠️ Permission "${trimmed}" already exists`, "error");
      }
    }
  };

  const getRoleBadge = (roleName) => {
    const baseStyles = 'px-3 py-1 text-xs font-bold uppercase tracking-wider';
    const color = USER_ROLE_COLORS[roleName] || 'bg-gray-700 text-white';
    return <span className={`${baseStyles} ${color}`}>{roleName}</span>;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading roles & permissions...</p>
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
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Roles & Permissions</h1>
          <p className="text-gray-600 font-medium text-sm">Manage user roles and their access permissions</p>
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
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
          >
            <Plus size={18} />
            <span className="text-sm">Add Role</span>
          </button>
          <button 
            onClick={handleAddPermission}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 font-bold hover:bg-orange-700 transition-colors border-2 border-orange-600"
          >
            <Plus size={18} />
            <span className="text-sm">Add Permission</span>
          </button>
        </div>
      </div>

      {/* Add Role Form */}
      {showAddForm && (
        <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Add New Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Role Name <span className="text-red-800">*</span></label>
              <input
                type="text"
                value={newRole.name}
                onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                placeholder="Enter role name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Description</label>
              <input
                type="text"
                value={newRole.description}
                onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                placeholder="Enter description"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">Permissions</label>
            <div className="flex flex-wrap gap-2">
              {permissions.map((permission) => (
                <button
                  key={permission}
                  onClick={() => {
                    const perms = newRole.permissions.includes(permission)
                      ? newRole.permissions.filter(p => p !== permission)
                      : [...newRole.permissions, permission];
                    setNewRole({...newRole, permissions: perms});
                  }}
                  className={`px-3 py-1 text-xs font-bold border-2 transition-colors flex items-center gap-1 ${
                    newRole.permissions.includes(permission)
                      ? 'bg-blue-950 text-white border-blue-950'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {newRole.permissions.includes(permission) ? <Check size={12} /> : <X size={12} />}
                  {permission}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 pt-4 border-t-2 border-blue-950/10">
            <button
              onClick={handleAddRole}
              className="bg-blue-950 text-white px-6 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
            >
              Add Role
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-white border-2 border-blue-950/20 text-blue-950 px-6 py-2 font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Roles Grid */}
      <div className="grid grid-cols-1 gap-4">
        {roles.map((role) => (
          <div key={role.id} className="bg-white border-2 border-blue-950/10 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <Shield size={24} className="text-blue-950" />
                  <h3 className="text-lg font-bold text-blue-950">{role.name}</h3>
                  {getRoleBadge(role.name)}
                </div>
                <p className="text-gray-600 text-sm mt-1">{role.description}</p>
                <p className="text-gray-500 text-xs mt-1">{role.userCount || 0} users assigned</p>
              </div>
              <div className="flex items-center gap-2">
                {editingRole === role.id ? (
                  <>
                    <button
                      onClick={() => handleSaveRole(role.id)}
                      className="p-2 bg-green-800 text-white hover:bg-green-700 transition-colors"
                      title="Save Changes"
                    >
                      <Save size={18} />
                    </button>
                    <button
                      onClick={() => setEditingRole(null)}
                      className="p-2 bg-red-800 text-white hover:bg-red-700 transition-colors"
                      title="Cancel Edit"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingRole(role.id)}
                      className="p-2 text-blue-950 hover:bg-blue-50 transition-colors"
                      title="Edit Role"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="p-2 text-red-800 hover:bg-red-50 transition-colors"
                      title="Delete Role"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t-2 border-blue-950/10">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {permissions.map((permission) => (
                  <button
                    key={permission}
                    onClick={() => handlePermissionToggle(role.id, permission)}
                    disabled={editingRole !== role.id}
                    className={`px-3 py-1 text-xs font-bold border-2 transition-colors flex items-center gap-1 ${
                      role.permissions.includes(permission)
                        ? 'bg-blue-950 text-white border-blue-950'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    } ${editingRole !== role.id ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {role.permissions.includes(permission) ? (
                      <Check size={12} />
                    ) : (
                      <X size={12} />
                    )}
                    {permission}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white border-2 border-blue-950/10 shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Permission Legend</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-950"></div>
                <span className="text-xs font-medium">Has Permission</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white border-2 border-gray-300"></div>
                <span className="text-xs font-medium">No Permission</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            <p>Total Roles: {roles.length}</p>
            <p>Total Permissions: {permissions.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissions;