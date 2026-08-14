// src/pages/system/Backup.jsx
import React, { useState, useEffect } from 'react';
import { 
  Database, 
  HardDrive, 
  Clock, 
  Download, 
  Trash2,
  RefreshCw,
  Upload,
  Shield,
  CheckCircle,
  AlertCircle,
  X,
  Eye
} from 'lucide-react';
import { systemAPI } from '../../services/api';
import dataService from '../../services/dataService';
import { TABLE_HEADER_STYLES, TABLE_ROW_STYLES } from '../../constants';

const Backup = () => {
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState([]);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedBackup, setSelectedBackup] = useState(null);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = () => {
    setLoading(true);
    
    // Load from localStorage
    const storedBackups = localStorage.getItem('backups');
    if (storedBackups) {
      try {
        const parsed = JSON.parse(storedBackups);
        setBackups(parsed);
      } catch (e) {
        console.error('Error loading backups:', e);
        setDefaultBackups();
      }
    } else {
      setDefaultBackups();
    }
    
    setLoading(false);
  };

  const setDefaultBackups = () => {
    const defaultBackups = [
      { id: 1, filename: 'backup_2026-08-05_01-00-00.sql', size: '245.3 MB', createdAt: '2026-08-05 01:00:00', type: 'Full', status: 'Completed' },
      { id: 2, filename: 'backup_2026-08-04_01-00-00.sql', size: '238.7 MB', createdAt: '2026-08-04 01:00:00', type: 'Full', status: 'Completed' },
      { id: 3, filename: 'backup_2026-08-03_01-00-00.sql', size: '241.2 MB', createdAt: '2026-08-03 01:00:00', type: 'Full', status: 'Completed' },
      { id: 4, filename: 'backup_2026-08-02_13-30-00.sql', size: '125.8 MB', createdAt: '2026-08-02 13:30:00', type: 'Incremental', status: 'Completed' },
      { id: 5, filename: 'backup_2026-08-02_01-00-00.sql', size: '240.1 MB', createdAt: '2026-08-02 01:00:00', type: 'Full', status: 'Completed' },
      { id: 6, filename: 'backup_2026-08-01_13-30-00.sql', size: '118.4 MB', createdAt: '2026-08-01 13:30:00', type: 'Incremental', status: 'Failed' }
    ];
    setBackups(defaultBackups);
    localStorage.setItem('backups', JSON.stringify(defaultBackups));
  };

  const showCustomModal = (message, type, data = null) => {
    setModalMessage(message);
    setModalType(type);
    setSelectedBackup(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("");
    setSelectedBackup(null);
  };

  const handleCreateBackup = () => {
    setCreating(true);
    
    // Simulate backup creation
    setTimeout(() => {
      const newBackup = {
        id: Date.now(),
        filename: `backup_${new Date().toISOString().slice(0, 10)}_${new Date().toTimeString().slice(0, 8).replace(/:/g, '-')}.sql`,
        size: `${(Math.random() * 300 + 100).toFixed(1)} MB`,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        type: Math.random() > 0.7 ? 'Incremental' : 'Full',
        status: 'Completed'
      };
      
      const updatedBackups = [newBackup, ...backups];
      setBackups(updatedBackups);
      localStorage.setItem('backups', JSON.stringify(updatedBackups));
      
      setCreating(false);
      showCustomModal(` Backup created successfully!\n\nFile: ${newBackup.filename}\nSize: ${newBackup.size}\nType: ${newBackup.type}`, "success", newBackup);
    }, 2000);
  };

  const handleDeleteBackup = (backup) => {
    if (!window.confirm(`Are you sure you want to delete "${backup.filename}"?`)) return;
    
    const updatedBackups = backups.filter(b => b.id !== backup.id);
    setBackups(updatedBackups);
    localStorage.setItem('backups', JSON.stringify(updatedBackups));
    showCustomModal(`🗑️ Backup "${backup.filename}" deleted successfully!`, "success", backup);
  };

  const handleDownloadBackup = (backup) => {
    // Create a fake download
    const blob = new Blob(['This is a simulated backup file content.'], { type: 'application/sql' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backup.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showCustomModal(`📥 Downloading "${backup.filename}"...`, "info", backup);
  };

  const handleRefresh = () => {
    loadBackups();
    showCustomModal(" Backups refreshed!", "success");
  };

  const handleViewDetails = (backup) => {
    showCustomModal(
      `📋 Backup Details\n\nFile: ${backup.filename}\nType: ${backup.type}\nSize: ${backup.size}\nCreated: ${backup.createdAt}\nStatus: ${backup.status}`,
      "info",
      backup
    );
  };

  const getStatusBadge = (status) => {
    const baseStyles = 'px-3 py-1 text-xs font-bold uppercase tracking-wider';
    const color = status === 'Completed' ? 'bg-green-800 text-white' : 'bg-red-800 text-white';
    return <span className={`${baseStyles} ${color}`}>{status}</span>;
  };

  const formatFileSize = (size) => {
    if (!size) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const num = parseFloat(size);
    const unitIndex = Math.floor(Math.log10(num) / 3);
    return `${(num / Math.pow(1024, unitIndex)).toFixed(1)} ${units[unitIndex]}`;
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

  const stats = [
    { label: 'Total Backups', value: backups.length, icon: Database, color: 'bg-blue-950' },
    { label: 'Completed', value: backups.filter(b => b.status === 'Completed').length, icon: CheckCircle, color: 'bg-green-800' },
    { label: 'Failed', value: backups.filter(b => b.status === 'Failed').length, icon: AlertCircle, color: 'bg-red-800' },
    { label: 'Total Size', value: formatFileSize(backups.reduce((sum, b) => sum + parseFloat(b.size), 0)), icon: HardDrive, color: 'bg-orange-600' }
  ];

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading backups...</p>
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
              {selectedBackup && (
                <div className="mt-3 bg-gray-50 p-3 border-l-4 border-blue-950">
                  <p className="text-sm font-bold text-blue-950">{selectedBackup.filename}</p>
                  <p className="text-sm text-gray-600">Type: {selectedBackup.type}</p>
                  <p className="text-sm text-gray-600">Size: {selectedBackup.size}</p>
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
          <h1 className="text-2xl font-bold text-blue-950">Backup Management</h1>
          <p className="text-gray-600 font-medium text-sm">Create and manage database backups</p>
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
            onClick={handleCreateBackup}
            disabled={creating}
            className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 disabled:opacity-50"
          >
            {creating ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}
            <span className="text-sm">{creating ? 'Creating...' : 'Create Backup'}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Backup Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className={TABLE_HEADER_STYLES}>Backup Name</th>
              <th className={TABLE_HEADER_STYLES}>Type</th>
              <th className={TABLE_HEADER_STYLES}>Size</th>
              <th className={TABLE_HEADER_STYLES}>Created At</th>
              <th className={TABLE_HEADER_STYLES}>Status</th>
              <th className={TABLE_HEADER_STYLES} style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {backups.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500 font-medium">
                  No backups found. Create your first backup!
                </td>
              </tr>
            ) : (
              backups.map((backup) => (
                <tr key={backup.id} className={TABLE_ROW_STYLES}>
                  <td className="py-3 font-bold text-blue-950 text-xs">{backup.filename}</td>
                  <td className="py-3">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      backup.type === 'Full' ? 'bg-blue-950 text-white' : 'bg-orange-600 text-white'
                    }`}>
                      {backup.type}
                    </span>
                  </td>
                  <td className="py-3 text-gray-700 font-medium">{backup.size}</td>
                  <td className="py-3 text-gray-500 text-xs font-mono">{backup.createdAt}</td>
                  <td className="py-3">{getStatusBadge(backup.status)}</td>
                  <td className="py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewDetails(backup)}
                        className="p-1 text-blue-950 hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDownloadBackup(backup)}
                        className="p-1 text-blue-950 hover:bg-blue-50 transition-colors"
                        title="Download Backup"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(backup)}
                        className="p-1 text-red-800 hover:bg-red-50 transition-colors"
                        title="Delete Backup"
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

      {/* Info Box */}
      <div className="mt-6 bg-white border-2 border-blue-950/10 shadow-sm p-4">
        <div className="flex items-start gap-3">
          <Shield className="text-blue-950 flex-shrink-0 mt-1" size={20} />
          <div>
            <p className="text-sm font-bold text-blue-950">Backup Information</p>
            <p className="text-xs text-gray-600 font-medium">
              Full backups are created daily at 1:00 AM. Incremental backups are created every 12 hours.
              Backups are stored securely and can be restored from the Restore page.
            </p>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Total backups: {backups.length} | Last backup: {backups.length > 0 ? backups[0].createdAt : 'Never'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backup;