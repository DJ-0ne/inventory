// src/pages/invoices/AllInvoices.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  Filter,
  Eye,
  Printer,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Plus,
  DollarSign,
  Users,
  Calendar,
  AlertCircle,
  X,
  MoreVertical
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import dataService from "../../services/dataService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AllInvoices = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);

  // Load invoices from dataService
  useEffect(() => {
    loadInvoices();
    const unsubscribe = dataService.subscribe('orders', loadInvoices);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, filterStatus, filterPayment]);

  const loadInvoices = () => {
    setLoading(true);
    const orders = dataService.getOrders();
    
    // Convert orders to invoices
    const invoiceData = orders.map(order => ({
      id: order.id,
      customer: order.customer,
      items: order.items || order.cartItems?.length || 0,
      total: order.total || 0,
      status: order.invoiceStatus || (order.status === 'Completed' ? 'Paid' : 'Unpaid'),
      date: order.date || new Date().toISOString().split('T')[0],
      dueDate: order.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMethod: order.payment || 'Cash'
    }));

    // If no invoices from orders, use mock data
    if (invoiceData.length === 0) {
      const mockInvoices = [
        { id: "INV-2026-001", customer: "John Doe", items: 3, total: 245.00, status: "Paid", date: "2026-08-05", dueDate: "2026-08-19", paymentMethod: "Cash" },
        { id: "INV-2026-002", customer: "Jane Smith", items: 2, total: 132.50, status: "Unpaid", date: "2026-08-05", dueDate: "2026-08-19", paymentMethod: "Card" },
        { id: "INV-2026-003", customer: "Robert Johnson", items: 5, total: 378.00, status: "Paid", date: "2026-08-04", dueDate: "2026-08-18", paymentMethod: "Mobile" },
        { id: "INV-2026-004", customer: "Mary Williams", items: 1, total: 56.00, status: "Overdue", date: "2026-07-25", dueDate: "2026-08-08", paymentMethod: "Cash" },
        { id: "INV-2026-005", customer: "Michael Brown", items: 2, total: 92.50, status: "Pending", date: "2026-08-03", dueDate: "2026-08-17", paymentMethod: "Card" },
        { id: "INV-2026-006", customer: "Sarah Davis", items: 4, total: 189.00, status: "Paid", date: "2026-08-03", dueDate: "2026-08-17", paymentMethod: "Mobile" },
        { id: "INV-2026-007", customer: "David Wilson", items: 3, total: 215.00, status: "Unpaid", date: "2026-08-02", dueDate: "2026-08-16", paymentMethod: "Bank" }
      ];
      setInvoices(mockInvoices);
      setFilteredInvoices(mockInvoices);
    } else {
      setInvoices(invoiceData);
      setFilteredInvoices(invoiceData);
    }
    setLoading(false);
  };

  const filterInvoices = () => {
    let filtered = [...invoices];
    
    if (searchTerm) {
      filtered = filtered.filter(inv =>
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(inv => inv.status === filterStatus);
    }
    
    if (filterPayment !== 'all') {
      filtered = filtered.filter(inv => inv.paymentMethod === filterPayment);
    }
    
    setFilteredInvoices(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Paid': 'bg-green-800 text-white',
      'Unpaid': 'bg-orange-600 text-white',
      'Pending': 'bg-blue-950 text-white',
      'Overdue': 'bg-red-800 text-white'
    };
    return colors[status] || 'bg-gray-700 text-white';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Paid': return <CheckCircle size={14} />;
      case 'Unpaid': return <Clock size={14} />;
      case 'Pending': return <RefreshCw size={14} />;
      case 'Overdue': return <AlertCircle size={14} />;
      default: return null;
    }
  };

  const showCustomModal = (message, type, data = null) => {
    setModalMessage(message);
    setModalType(type);
    setSelectedInvoice(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("");
    setSelectedInvoice(null);
  };

  const handleView = (invoice) => {
    showCustomModal(
      `📄 Invoice Details\n\nInvoice: ${invoice.id}\nCustomer: ${invoice.customer}\nItems: ${invoice.items}\nTotal: $${invoice.total.toFixed(2)}\nStatus: ${invoice.status}\nDate: ${invoice.date}\nDue: ${invoice.dueDate}\nPayment: ${invoice.paymentMethod}`,
      "info",
      invoice
    );
  };

  const handlePrint = (invoice) => {
    showCustomModal(`🖨️ Printing invoice ${invoice.id}...`, "success", invoice);
  };

  const handleDownload = (invoice) => {
    showCustomModal(`📥 Downloading invoice ${invoice.id} as PDF`, "success", invoice);
  };

  const handleMarkPaid = (invoice) => {
    // Update invoice status
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id ? { ...inv, status: 'Paid' } : inv
    );
    setInvoices(updatedInvoices);
    setFilteredInvoices(updatedInvoices);
    
    // Also update the corresponding order
    const orders = dataService.getOrders();
    const order = orders.find(o => o.id === invoice.id);
    if (order) {
      // In a real app, you'd call an API
      // For now, we'll just show the modal
    }
    
    showCustomModal(`✅ Invoice ${invoice.id} marked as PAID`, "success", invoice);
  };

  const handleRefresh = () => {
    loadInvoices();
    showCustomModal("🔄 Invoices refreshed!", "success");
  };

  const handleExport = () => {
    const headers = ['Invoice #', 'Customer', 'Items', 'Total', 'Payment Method', 'Status', 'Date', 'Due Date'];
    const rows = filteredInvoices.map(inv => 
      [inv.id, inv.customer, inv.items, `$${inv.total.toFixed(2)}`, inv.paymentMethod, inv.status, inv.date, inv.dueDate]
    );
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showCustomModal("✅ All invoices exported successfully!", "success");
  };

  const getStats = () => {
    const total = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidAmount = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.total, 0);
    const overdueCount = invoices.filter(inv => inv.status === 'Overdue').length;
    return { total, totalAmount, paidAmount, overdueCount };
  };

  const stats = getStats();

  // Chart Data
  const invoiceStatusData = {
    labels: ['Paid', 'Unpaid', 'Pending', 'Overdue'],
    datasets: [
      {
        data: [
          invoices.filter(inv => inv.status === 'Paid').length,
          invoices.filter(inv => inv.status === 'Unpaid').length,
          invoices.filter(inv => inv.status === 'Pending').length,
          invoices.filter(inv => inv.status === 'Overdue').length
        ],
        backgroundColor: ['#166534', '#f97316', '#1e3a5f', '#991b1b'],
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };

  const invoiceRevenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Invoiced Amount',
        data: [18500, 22000, 19500, 28000, 32000, 29000, 35000],
        backgroundColor: '#1e3a5f',
        borderRadius: 0
      },
      {
        label: 'Paid Amount',
        data: [15000, 18000, 16500, 24000, 28000, 25000, 31000],
        backgroundColor: '#166534',
        borderRadius: 0
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { weight: 'bold', size: 10 }
        }
      }
    },
    cutout: '60%'
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { weight: 'bold', size: 10 }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const paymentMethods = ['all', ...new Set(invoices.map(inv => inv.paymentMethod))];
  const statuses = ['all', 'Paid', 'Unpaid', 'Pending', 'Overdue'];

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading invoices...</p>
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
              {selectedInvoice && (
                <div className="mt-3 bg-gray-50 p-3 border-l-4 border-blue-950">
                  <p className="text-sm font-bold text-blue-950">Invoice: {selectedInvoice.id}</p>
                  <p className="text-sm text-gray-600">Customer: {selectedInvoice.customer}</p>
                  <p className="text-sm text-gray-600">Total: ${selectedInvoice.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Status: {selectedInvoice.status}</p>
                  <p className="text-sm text-gray-600">Due: {selectedInvoice.dueDate}</p>
                  <button
                    onClick={() => {
                      closeModal();
                      handleMarkPaid(selectedInvoice);
                    }}
                    className="mt-2 bg-green-800 text-white px-3 py-1 text-xs font-bold hover:bg-green-700"
                  >
                    Mark as Paid
                  </button>
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
          <h1 className="text-2xl font-bold text-blue-950">All Invoices</h1>
          <p className="text-gray-600 font-medium text-sm">Manage and track all customer invoices</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            <span className="text-sm">Refresh</span>
          </button>
          <Link to="/invoices/create">
            <button className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950">
              <Plus size={18} />
              <span className="text-sm">Create Invoice</span>
            </button>
          </Link>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Invoices</p>
              <p className="text-2xl font-bold text-blue-950">{stats.total}</p>
            </div>
            <div className="bg-blue-950 p-2 border-2 border-white/20">
              <FileText size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Total Amount</p>
              <p className="text-2xl font-bold text-green-800">${stats.totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-green-800 p-2 border-2 border-white/20">
              <DollarSign size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Paid</p>
              <p className="text-2xl font-bold text-orange-600">${stats.paidAmount.toFixed(2)}</p>
            </div>
            <div className="bg-orange-600 p-2 border-2 border-white/20">
              <CheckCircle size={20} color="white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border-l-4 border-red-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Overdue</p>
              <p className="text-2xl font-bold text-red-800">{stats.overdueCount}</p>
            </div>
            <div className="bg-red-800 p-2 border-2 border-white/20">
              <AlertCircle size={20} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Invoice Status Distribution</h2>
          <div className="h-52">
            <Doughnut data={invoiceStatusData} options={doughnutOptions} />
          </div>
        </div>
        <div className="bg-white p-5 border-2 border-blue-950/10 shadow-sm">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Invoice vs Paid Amount</h2>
          <div className="h-52">
            <Bar data={invoiceRevenueData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border-2 border-blue-950/10 px-3 py-1 flex-1 min-w-[200px]">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by invoice number or customer..." 
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
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status}
              </option>
            ))}
          </select>
          <select 
            className="border-2 border-blue-950/10 px-3 py-1 text-sm font-medium text-blue-950 outline-none bg-white"
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
          >
            {paymentMethods.map(method => (
              <option key={method} value={method}>
                {method === 'all' ? 'All Payment' : method}
              </option>
            ))}
          </select>
          <button 
            className="flex items-center gap-1 bg-blue-950 text-white px-4 py-1 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950"
            onClick={filterInvoices}
          >
            <Filter size={16} />
            Apply
          </button>
          <div className="text-sm text-gray-600 font-medium">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Invoice #</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Customer</th>
              <th className="text-center py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Items</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Total</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Payment</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Due Date</th>
              <th className="text-left py-3 px-4 font-bold text-blue-950 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500 font-medium">
                  No invoices found. Create an invoice to get started.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-950">{invoice.id}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{invoice.customer}</td>
                  <td className="py-3 px-4 text-center text-gray-600 font-medium">{invoice.items}</td>
                  <td className="py-3 px-4 font-bold text-blue-950">${invoice.total.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-600 font-medium">{invoice.paymentMethod}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-bold flex items-center gap-1 ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-medium">{invoice.dueDate}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(invoice)}
                        className="text-blue-950 hover:text-blue-700 transition-colors"
                        title="View Invoice"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handlePrint(invoice)}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                        title="Print Invoice"
                      >
                        <Printer size={16} />
                      </button>
                      <button
                        onClick={() => handleDownload(invoice)}
                        className="text-blue-950 hover:text-blue-700 transition-colors"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </button>
                      {invoice.status !== 'Paid' && (
                        <button
                          onClick={() => handleMarkPaid(invoice)}
                          className="text-green-800 hover:text-green-900 transition-colors text-xs font-bold"
                        >
                          Mark Paid
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

export default AllInvoices;