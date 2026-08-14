// src/pages/invoices/CreateInvoice.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Search,
  Printer,
  Download,
  User,
  Calendar,
  DollarSign,
  Package,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import dataService from "../../services/dataService";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState([
    { id: 1, product: "Hammer", sku: "TOOL-001", quantity: 2, price: 24.99, total: 49.98 },
    { id: 2, product: "Paint Roller", sku: "PAINT-003", quantity: 1, price: 12.50, total: 12.50 }
  ]);

  const [formData, setFormData] = useState({
    customer: "",
    email: "",
    phone: "",
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "",
    status: "Pending",
    discount: 0,
    taxRate: 7.5
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [customers, setCustomers] = useState([]);

  // Load customers
  useEffect(() => {
    const allCustomers = dataService.getCustomers();
    setCustomers(allCustomers.map(c => c.name));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  const addItem = () => {
    setInvoiceItems([...invoiceItems, { id: Date.now(), product: "", sku: "", quantity: 1, price: 0, total: 0 }]);
  };

  const removeItem = (id) => {
    if (invoiceItems.length === 1) {
      showCustomModal("Cannot remove the last item", "error");
      return;
    }
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setInvoiceItems(invoiceItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          const qty = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
          const price = field === 'price' ? parseFloat(value) || 0 : item.price;
          updated.total = qty * price;
        }
        return updated;
      }
      return item;
    }));
  };

  const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * (parseFloat(formData.discount) || 0)) / 100;
  const taxAmount = ((subtotal - discountAmount) * (parseFloat(formData.taxRate) || 0)) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const handleSubmit = () => {
    if (!formData.customer) {
      showCustomModal("Please select a customer", "error");
      return;
    }
    if (invoiceItems.some(item => !item.product || item.quantity <= 0 || item.price <= 0)) {
      showCustomModal("Please fill in all item details correctly", "error");
      return;
    }

    setLoading(true);

    // Create invoice data
    const invoice = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      customer: formData.customer,
      email: formData.email || 'N/A',
      phone: formData.phone || 'N/A',
      date: formData.date,
      dueDate: formData.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: formData.status,
      notes: formData.notes || '',
      items: invoiceItems,
      subtotal: subtotal,
      discount: parseFloat(formData.discount) || 0,
      discountAmount: discountAmount,
      taxRate: parseFloat(formData.taxRate) || 0,
      taxAmount: taxAmount,
      total: total,
      createdAt: new Date().toISOString()
    };

    // Save to dataService as an order
    const order = {
      id: invoice.id,
      customer: invoice.customer,
      items: invoiceItems.length,
      total: invoice.total,
      payment: 'Invoice',
      status: invoice.status === 'Paid' ? 'Completed' : 'Processing',
      invoiceStatus: invoice.status,
      date: invoice.date,
      dueDate: invoice.dueDate,
      cartItems: invoiceItems.map(item => ({ ...item })),
      invoiceData: invoice
    };

    dataService.addOrder(order);

    setLoading(false);
    showCustomModal(
      ` Invoice created successfully!\n\nInvoice: ${invoice.id}\nCustomer: ${invoice.customer}\nTotal: $${invoice.total.toFixed(2)}\nStatus: ${invoice.status}`,
      "success"
    );
  };

  const handlePreview = () => {
    if (!formData.customer) {
      showCustomModal("Please select a customer first", "error");
      return;
    }
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  const handlePrint = () => {
    window.print();
    showCustomModal("🖨️ Invoice sent to printer", "success");
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the form?")) {
      setInvoiceItems([
        { id: 1, product: "", sku: "", quantity: 1, price: 0, total: 0 }
      ]);
      setFormData({
        customer: "",
        email: "",
        phone: "",
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: "",
        status: "Pending",
        discount: 0,
        taxRate: 7.5
      });
      showCustomModal("Form has been reset", "info");
    }
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
            {modalType === "success" && (
              <button
                onClick={() => {
                  closeModal();
                  navigate('/invoices/all');
                }}
                className="w-full bg-green-800 text-white py-2 font-bold hover:bg-green-700 transition-colors mb-2"
              >
                View All Invoices
              </button>
            )}
            <button
              onClick={closeModal}
              className="w-full bg-blue-950 text-white py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
            >
              {modalType === "success" ? "Create Another" : "OK"}
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white max-w-2xl w-full p-6 border-2 border-blue-950/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-blue-950">Invoice Preview</h3>
              <button onClick={closePreview} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            {/* Invoice Content */}
            <div className="border-2 border-blue-950/10 p-6" id="invoice-content">
              <div className="text-center border-b-2 border-blue-950/10 pb-4 mb-4">
                <h1 className="text-2xl font-bold text-blue-950">INVOICE</h1>
                <p className="text-gray-600">Invoice #: INV-{Date.now().toString().slice(-6)}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-bold text-blue-950 uppercase">Bill To:</p>
                  <p className="font-bold text-blue-950">{formData.customer || "N/A"}</p>
                  <p className="text-sm text-gray-600">{formData.email || ""}</p>
                  <p className="text-sm text-gray-600">{formData.phone || ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-blue-950 uppercase">Invoice Details</p>
                  <p className="text-sm text-gray-600">Date: {formData.date}</p>
                  <p className="text-sm text-gray-600">Due: {formData.dueDate || "N/A"}</p>
                  <p className="text-sm text-gray-600">Status: {formData.status}</p>
                </div>
              </div>

              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="border-b-2 border-blue-950/10">
                    <th className="text-left py-2 font-bold text-blue-950 text-xs uppercase">Product</th>
                    <th className="text-left py-2 font-bold text-blue-950 text-xs uppercase">SKU</th>
                    <th className="text-center py-2 font-bold text-blue-950 text-xs uppercase">Qty</th>
                    <th className="text-right py-2 font-bold text-blue-950 text-xs uppercase">Price</th>
                    <th className="text-right py-2 font-bold text-blue-950 text-xs uppercase">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-2 font-bold text-blue-950">{item.product || "N/A"}</td>
                      <td className="py-2 text-gray-600">{item.sku || "N/A"}</td>
                      <td className="py-2 text-center text-gray-700">{item.quantity}</td>
                      <td className="py-2 text-right font-bold text-blue-950">${item.price.toFixed(2)}</td>
                      <td className="py-2 text-right font-bold text-blue-950">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-blue-950/10">
                    <td colSpan="4" className="py-2 text-right font-bold text-blue-950">Subtotal:</td>
                    <td className="py-2 text-right font-bold text-blue-950">${subtotal.toFixed(2)}</td>
                  </tr>
                  {parseFloat(formData.discount) > 0 && (
                    <tr>
                      <td colSpan="4" className="py-2 text-right font-bold text-orange-600">Discount ({formData.discount}%):</td>
                      <td className="py-2 text-right font-bold text-orange-600">-${discountAmount.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan="4" className="py-2 text-right font-bold text-blue-950">Tax ({formData.taxRate}%):</td>
                    <td className="py-2 text-right font-bold text-blue-950">${taxAmount.toFixed(2)}</td>
                  </tr>
                  <tr className="border-t-2 border-blue-950/10">
                    <td colSpan="4" className="py-2 text-right text-xl font-bold text-blue-950">Total:</td>
                    <td className="py-2 text-right text-xl font-bold text-blue-950">${total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>

              {formData.notes && (
                <div className="border-t-2 border-blue-950/10 pt-4 mt-4">
                  <p className="text-xs font-bold text-blue-950 uppercase">Notes:</p>
                  <p className="text-sm text-gray-600">{formData.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handlePrint}
                className="flex-1 bg-blue-950 text-white py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Print
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-800 text-white py-2 font-bold hover:bg-green-700 transition-colors border-2 border-green-800 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Create
              </button>
              <button
                onClick={closePreview}
                className="flex-1 bg-white border-2 border-blue-950/20 text-blue-950 py-2 font-bold hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Create Invoice</h1>
          <p className="text-gray-600 font-medium text-sm">Generate a new invoice for your customer</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link to="/invoices/all">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Invoices</span>
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Customer & Invoice Details */}
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Invoice Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Customer</label>
                <select
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((cust, index) => (
                    <option key={index} value={cust}>{cust}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="customer@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Invoice Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-blue-950">Invoice Items</h2>
              <button
                onClick={addItem}
                className="flex items-center gap-1 bg-blue-950 text-white px-3 py-1 text-sm font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-blue-950/10 bg-gray-50">
                    <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
                    <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
                    <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Qty</th>
                    <th className="text-right py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Price</th>
                    <th className="text-right py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Total</th>
                    <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.product}
                          onChange={(e) => updateItem(item.id, 'product', e.target.value)}
                          className="w-full border-2 border-blue-950/10 px-2 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                          placeholder="Product name"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.sku}
                          onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                          className="w-full border-2 border-blue-950/10 px-2 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                          placeholder="SKU"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                          className="w-16 border-2 border-blue-950/10 px-2 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 text-center mx-auto block"
                          placeholder="0"
                          min="1"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                          className="w-20 border-2 border-blue-950/10 px-2 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 text-right ml-auto block"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-blue-950">
                        ${item.total.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-800 hover:text-red-900 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-600">
                <span>Discount ({formData.discount}%)</span>
                <span className="text-orange-600">-${discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-600">
                <span>Tax ({formData.taxRate}%)</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-blue-950 pt-2 border-t-2 border-blue-950/10">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Discount & Tax</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Discount %</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Tax Rate %</label>
                <input
                  type="number"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Notes</h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
              placeholder="Additional notes..."
            ></textarea>
          </div>

          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Actions</h2>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-800 text-white py-3 font-bold hover:bg-green-900 transition-colors border-2 border-green-800 mb-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
            <button
              onClick={handlePreview}
              className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 mb-3 flex items-center justify-center gap-2"
            >
              <Printer size={18} />
              Preview Invoice
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-white border-2 border-blue-950/20 text-blue-950 py-2 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X size={18} />
              Reset Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;