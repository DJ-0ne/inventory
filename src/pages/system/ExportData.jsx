// src/pages/system/ExportData.jsx
import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  FileJson,
  Database,
  RefreshCw,
  CheckCircle,
  Clock,
  Calendar,
  Filter,
  X,
  AlertCircle
} from 'lucide-react';
import { systemAPI } from '../../services/api';
import dataService from '../../services/dataService';

const ExportData = () => {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [exportHistory, setExportHistory] = useState([
    { id: 1, filename: 'sales_data_2026-08-01.csv', type: 'CSV', size: '2.4 MB', date: '2026-08-01 14:30:00', status: 'Completed' },
    { id: 2, filename: 'inventory_export_2026-07-31.xlsx', type: 'Excel', size: '5.8 MB', date: '2026-07-31 10:15:00', status: 'Completed' },
    { id: 3, filename: 'customers_2026-07-30.json', type: 'JSON', size: '1.2 MB', date: '2026-07-30 16:45:00', status: 'Completed' },
    { id: 4, filename: 'orders_2026-07-29.csv', type: 'CSV', size: '3.6 MB', date: '2026-07-29 11:20:00', status: 'Pending' }
  ]);

  const exportOptions = [
    { id: 'products', label: 'Products', icon: Database },
    { id: 'orders', label: 'Orders', icon: FileText },
    { id: 'customers', label: 'Customers', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: Database },
    { id: 'sales', label: 'Sales Reports', icon: FileSpreadsheet },
    { id: 'users', label: 'Users', icon: FileText }
  ];

  const formatOptions = ['CSV', 'Excel', 'JSON', 'PDF'];

  const [selectedExport, setSelectedExport] = useState('products');
  const [selectedFormat, setSelectedFormat] = useState('CSV');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [includeHeaders, setIncludeHeaders] = useState(true);

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

  const handleExport = () => {
    setExporting(true);

    // Simulate export process
    setTimeout(() => {
      // Get data based on selection
      let data = [];
      let filename = `${selectedExport}_${new Date().toISOString().split('T')[0]}.${selectedFormat.toLowerCase()}`;
      
      switch(selectedExport) {
        case 'products':
          data = dataService.getProducts();
          break;
        case 'orders':
          data = dataService.getOrders();
          break;
        case 'customers':
          data = dataService.getCustomers();
          break;
        case 'inventory':
          data = dataService.getProducts();
          break;
        case 'sales':
          data = dataService.getOrders();
          break;
        case 'users':
          data = dataService.getUsers();
          break;
        default:
          data = [];
      }

      // Filter by date range if provided
      if (dateRange.start && dateRange.end) {
        data = data.filter(item => {
          const itemDate = item.date || item.createdAt || item.lastOrdered;
          return itemDate && itemDate >= dateRange.start && itemDate <= dateRange.end;
        });
      }

      // Convert to CSV
      if (selectedFormat === 'CSV' || selectedFormat === 'Excel') {
        const headers = Object.keys(data[0] || {});
        let csv = '';
        if (includeHeaders) {
          csv = headers.join(',') + '\n';
        }
        data.forEach(row => {
          const values = headers.map(header => {
            const value = row[header] || '';
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
          });
          csv += values.join(',') + '\n';
        });

        // Create download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else if (selectedFormat === 'JSON') {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else if (selectedFormat === 'PDF') {
        // Simulate PDF download
        const blob = new Blob(['PDF content would be generated here'], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      // Add to history
      const newExport = {
        id: Date.now(),
        filename: filename,
        type: selectedFormat,
        size: `${(data.length * 0.05).toFixed(1)} MB`,
        date: new Date().toISOString().replace('T', ' ').slice(0, 19),
        status: 'Completed'
      };
      setExportHistory(prev => [newExport, ...prev]);

      setExporting(false);
      showCustomModal(` Export completed successfully!\n\nFile: ${filename}\nRecords: ${data.length}\nFormat: ${selectedFormat}`, "success");
    }, 2000);
  };

  const handleDownloadHistory = (item) => {
    // Simulate re-download
    const blob = new Blob(['This is a previously exported file.'], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    showCustomModal(`📥 Downloading "${item.filename}"...`, "info");
  };

  const handleRefresh = () => {
    setExportHistory(prev => [...prev]);
    showCustomModal(" Export history refreshed!", "success");
  };

  const getStatusBadge = (status) => {
    const baseStyles = 'px-3 py-1 text-xs font-bold uppercase tracking-wider';
    const colors = {
      'Completed': 'bg-green-800 text-white',
      'Pending': 'bg-orange-600 text-white',
      'Failed': 'bg-red-800 text-white'
    };
    return <span className={`${baseStyles} ${colors[status] || 'bg-gray-700 text-white'}`}>{status}</span>;
  };

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
          <h1 className="text-2xl font-bold text-blue-950">Export Data</h1>
          <p className="text-gray-600 font-medium text-sm">Export your data in various formats</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={18} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Options */}
        <div className="lg:col-span-2">
          <div className="bg-white border-2 border-blue-950/10 shadow-sm p-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Export Configuration</h2>
            
            {/* Data Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-blue-950 mb-2">Select Data to Export</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {exportOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedExport(option.id)}
                    className={`p-3 border-2 text-left transition-colors flex items-center gap-2 ${
                      selectedExport === option.id
                        ? 'bg-blue-950 text-white border-blue-950'
                        : 'bg-white text-blue-950 border-blue-950/10 hover:border-blue-950/30'
                    }`}
                  >
                    <option.icon size={18} />
                    <span className="text-sm font-bold">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-blue-950 mb-2">Export Format</label>
              <div className="flex gap-2">
                {formatOptions.map((format) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`px-4 py-2 border-2 font-bold transition-colors ${
                      selectedFormat === format
                        ? 'bg-blue-950 text-white border-blue-950'
                        : 'bg-white text-blue-950 border-blue-950/10 hover:border-blue-950/30'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-blue-950 mb-1">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border-2 border-blue-950/10 focus:border-blue-950 outline-none font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-950 mb-1">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border-2 border-blue-950/10 focus:border-blue-950 outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                  className="w-4 h-4 text-blue-950 border-2 border-blue-950/20 focus:ring-blue-950"
                />
                <span className="text-sm font-bold text-blue-950">Include column headers</span>
              </label>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {exporting ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <Download size={20} />
              )}
              {exporting ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
        </div>

        {/* Export History */}
        <div className="lg:col-span-1">
          <div className="bg-white border-2 border-blue-950/10 shadow-sm p-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Export History</h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {exportHistory.length === 0 ? (
                <p className="text-center text-gray-500 font-medium py-8">No exports yet</p>
              ) : (
                exportHistory.map((item) => (
                  <div key={item.id} className="border-b border-gray-100 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-blue-950 text-xs truncate">{item.filename}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-600 font-medium">{item.type}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600">{item.size}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                      </div>
                      <div className="ml-2">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                    {item.status === 'Completed' && (
                      <button 
                        onClick={() => handleDownloadHistory(item)}
                        className="text-xs text-blue-950 font-bold hover:underline mt-1 flex items-center gap-1"
                      >
                        <Download size={12} />
                        Download
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportData;