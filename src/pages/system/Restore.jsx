// src/pages/system/Restore.jsx
import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Upload,
  Shield,
  Database,
  FileText,
  X,
  Eye
} from 'lucide-react';
import { systemAPI } from '../../services/api';
import dataService from '../../services/dataService';
import { TABLE_HEADER_STYLES, TABLE_ROW_STYLES } from '../../constants';

const Restore = () => {
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [backups, setBackups] = useState([]);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");

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
      { id: 3, filename: 'backup_2026-08-03_01-00-00.sql', size: '241.2 MB', createdAt: '2026-08-03 01:00:00', type: 'Full', status: 'Completed' }
    ];
    setBackups(defaultBackups);
    localStorage.setItem('backups', JSON.stringify(defaultBackups));
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

  const handleRestore = async (backup) => {
    if (!window.confirm(`Are you sure you want to restore "${backup.filename}"? This will overwrite ALL current data.`)) return;
    
    setRestoring(true);
    setSelectedBackup(backup);
    setRestoreProgress(0);
    
    // Simulate restore progress
    const interval = setInterval(() => {
      setRestoreProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 300);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      clearInterval(interval);
      setRestoreProgress(100);
      
      setTimeout(() => {
        setRestoring(false);
        setSelectedBackup(null);
        setRestoreProgress(0);
        showCustomModal(
          `✅ Database restored successfully!\n\nBackup: ${backup.filename}\nType: ${backup.type}\nSize: ${backup.size}\nCreated: ${backup.createdAt}`,
          "success"
        );
      }, 1000);
      
    } catch (error) {
      console.error('Error restoring backup:', error);
      clearInterval(interval);
      setRestoring(false);
      setRestoreProgress(0);
      showCustomModal("❌ Failed to restore database. Please try again.", "error");
    }
  };

  const handleViewDetails = (backup) => {
    showCustomModal(
      `📋 Backup Details\n\nFile: ${backup.filename}\nType: ${backup.type}\nSize: ${backup.size}\nCreated: ${backup.createdAt}\nStatus: ${backup.status}`,
      "info"
    );
  };

  const handleRefresh = () => {
    loadBackups();
    showCustomModal("🔄 Backups refreshed!", "success");
  };

  const getStatusBadge = (status) => {
    const baseStyles = 'px-3 py-1 text-xs font-bold uppercase tracking-wider';
    const color = status === 'Completed' ? 'bg-green-800 text-white' : 'bg-red-800 text-white';
    return <span className={`${baseStyles} ${color}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading restore data...</p>
        </div>
      </div>
    );
  }

  const completedBackups = backups.filter(b => b.status === 'Completed');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full p-6 border-2 border-blue-950/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {modalType === "success" && <CheckCircle size={28} className="text-green-800" />}
                {modalType === "error" && <AlertTriangle size={28} className="text-red-800" />}
                {modalType === "info" && <AlertTriangle size={28} className="text-blue-950" />}
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
          <h1 className="text-2xl font-bold text-blue-950">Restore Database</h1>
          <p className="text-gray-600 font-medium text-sm">Restore your database from a backup</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={18} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Restore Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Available Backups</p>
          <p className="text-2xl font-bold text-blue-950">{completedBackups.length}</p>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Latest Backup</p>
          <p className="text-2xl font-bold text-green-800">
            {completedBackups.length > 0 ? new Date(completedBackups[0].createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Size</p>
          <p className="text-2xl font-bold text-orange-600">
            {completedBackups.reduce((sum, b) => sum + parseFloat(b.size), 0).toFixed(1)} MB
          </p>
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-red-50 border-2 border-red-800 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-800 flex-shrink-0 mt-1" size={24} />
          <div>
            <p className="font-bold text-red-800">⚠️ Warning!</p>
            <p className="text-sm text-red-700 font-medium">
              Restoring a backup will overwrite ALL current data. This action cannot be undone.
              Please ensure you have a recent backup before proceeding.
            </p>
          </div>
        </div>
      </div>

      {/* Restore Progress */}
      {restoring && selectedBackup && (
        <div className="bg-white border-2 border-blue-950/10 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Database className="text-blue-950" size={24} />
              <div>
                <p className="font-bold text-blue-950">Restoring Database</p>
                <p className="text-xs text-gray-600 font-medium">
                  Restoring {selectedBackup.filename} ({selectedBackup.size})
                </p>
              </div>
            </div>
            <span className="text-lg font-bold text-blue-950">{restoreProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 h-2">
            <div 
              className="bg-blue-950 h-2 transition-all duration-500"
              style={{ width: `${restoreProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {restoreProgress < 100 ? 'Please wait while the backup is being restored...' : 'Restore completed!'}
          </p>
        </div>
      )}

      {/* Backup Selection */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className={TABLE_HEADER_STYLES}>Backup Name</th>
              <th className={TABLE_HEADER_STYLES}>Type</th>
              <th className={TABLE_HEADER_STYLES}>Size</th>
              <th className={TABLE_HEADER_STYLES}>Created At</th>
              <th className={TABLE_HEADER_STYLES}>Status</th>
              <th className={TABLE_HEADER_STYLES} style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {completedBackups.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500 font-medium">
                  No completed backups available for restore. Create a backup first.
                </td>
              </tr>
            ) : (
              completedBackups.map((backup) => (
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
                        onClick={() => handleRestore(backup)}
                        disabled={restoring}
                        className="bg-orange-600 text-white px-4 py-1 text-xs font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <Upload size={14} />
                        Restore
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
            <p className="text-sm font-bold text-blue-950">Restore Information</p>
            <p className="text-xs text-gray-600 font-medium">
              Only completed backups can be restored. The restore process may take a few minutes depending on the backup size.
              We recommend performing a new backup before restoring to prevent data loss.
            </p>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Available backups: {completedBackups.length} | Latest: {completedBackups.length > 0 ? completedBackups[0].createdAt : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Restore;