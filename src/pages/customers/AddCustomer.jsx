// src/pages/customers/AddCustomer.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingCart,
  FileText,
  Upload,
  RefreshCw
} from "lucide-react";
import dataService from "../../services/dataService";

const AddCustomer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    status: "Active",
    notes: ""
  });

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

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      showCustomModal("Please fill in all required fields (Name, Email, Phone)", "error");
      return;
    }

    setLoading(true);

    // Create customer object
    const customer = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address || 'N/A',
      city: formData.city || 'N/A',
      state: formData.state || 'N/A',
      zipCode: formData.zipCode || 'N/A',
      country: formData.country || 'US',
      status: formData.status,
      notes: formData.notes || '',
      totalSpent: 0,
      orders: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    };

    // Save to dataService
    dataService.addCustomer(customer);

    setLoading(false);
    showCustomModal(
      `✅ Customer "${customer.name}" added successfully!\n\nEmail: ${customer.email}\nPhone: ${customer.phone}\nStatus: ${customer.status}`,
      "success"
    );
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the form?")) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
        status: "Active",
        notes: ""
      });
      showCustomModal("🔄 Form reset successfully", "info");
    }
  };

  const handleModalClose = () => {
    closeModal();
    if (modalType === "success") {
      navigate('/customers/all');
    }
  };

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
            </div>
            <button
              onClick={handleModalClose}
              className="w-full bg-blue-950 text-white py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
            >
              {modalType === "success" ? "View All Customers" : "OK"}
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Add Customer</h1>
          <p className="text-gray-600 font-medium text-sm">Create a new customer profile</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/customers/all">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Customers</span>
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                  Full Name <span className="text-red-800">*</span>
                </label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <User size={18} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                  Email <span className="text-red-800">*</span>
                </label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <Mail size={18} className="text-gray-400 mr-2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                  Phone <span className="text-red-800">*</span>
                </label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <Phone size={18} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none"
                    placeholder="Phone number"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mt-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Address Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Address</label>
                <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                  <MapPin size={18} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full text-sm font-medium text-blue-950 outline-none"
                    placeholder="Street address"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">State/Province</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="ZIP code"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                >
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="NG">Nigeria</option>
                  <option value="ZA">South Africa</option>
                  <option value="KE">Kenya</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mt-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Additional Notes</h2>
            <div>
              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                placeholder="Additional notes about the customer..."
              ></textarea>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Customer Stats</h2>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 border-l-4 border-blue-950">
                <p className="text-xs text-gray-500 font-medium">Total Orders</p>
                <p className="text-xl font-bold text-blue-950">0</p>
              </div>
              <div className="bg-gray-50 p-3 border-l-4 border-green-800">
                <p className="text-xs text-gray-500 font-medium">Total Purchases</p>
                <p className="text-xl font-bold text-green-800">$0.00</p>
              </div>
              <div className="bg-gray-50 p-3 border-l-4 border-orange-600">
                <p className="text-xs text-gray-500 font-medium">Customer Since</p>
                <p className="text-xl font-bold text-orange-600">{new Date().toISOString().split('T')[0]}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mt-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Actions</h2>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 mb-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {loading ? 'Adding...' : 'Add Customer'}
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-white border-2 border-blue-950/20 text-blue-950 py-2 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X size={18} />
              Reset Form
            </button>
          </div>

          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mt-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Quick Tips</h2>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-blue-950 font-bold">•</span>
                <p className="text-gray-700 font-medium">Required fields are marked with *</p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-950 font-bold">•</span>
                <p className="text-gray-700 font-medium">Customers can be activated later</p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-950 font-bold">•</span>
                <p className="text-gray-700 font-medium">Notes help track customer preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;