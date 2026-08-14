// src/pages/invoices/InvoiceSettings.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  DollarSign,
  Percent,
  Upload,
  Printer,
  Info,
  RefreshCw
} from "lucide-react";
import dataService from "../../services/dataService";

const InvoiceSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  
  const [settings, setSettings] = useState({
    companyName: "Inventory Pro",
    companyAddress: "123 Business St, City Center",
    companyPhone: "+1 234-567-8900",
    companyEmail: "info@inventorypro.com",
    companyWebsite: "www.inventorypro.com",
    taxRate: 7.5,
    currency: "$",
    currencySymbol: "$",
    invoicePrefix: "INV",
    invoiceNumber: "1001",
    paymentTerms: "Net 14 days",
    footerText: "Thank you for your business!",
    logoUrl: "/logo.jpeg",
    defaultPaymentMethod: "Cash",
    enableDiscount: true,
    enableTax: true,
    enableMultiCurrency: false,
    invoiceNotes: ""
  });

  const [activeTab, setActiveTab] = useState("general");
  const [paymentMethods, setPaymentMethods] = useState([
    { id: "cash", label: "Cash", enabled: true },
    { id: "card", label: "Credit/Debit Card", enabled: true },
    { id: "mobile", label: "Mobile Payment", enabled: true },
    { id: "bank", label: "Bank Transfer", enabled: false }
  ]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('invoiceSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        if (parsed.paymentMethods) {
          setPaymentMethods(parsed.paymentMethods);
        }
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }, []);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({ 
      ...settings, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handlePaymentMethodToggle = (id) => {
    setPaymentMethods(paymentMethods.map(method => 
      method.id === id ? { ...method, enabled: !method.enabled } : method
    ));
  };

  const handleSubmit = () => {
    setLoading(true);
    
    // Save settings with payment methods
    const settingsToSave = {
      ...settings,
      paymentMethods: paymentMethods,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('invoiceSettings', JSON.stringify(settingsToSave));
    
    // Also update the dataService with store config
    const storeConfig = {
      storeName: settings.companyName,
      storeEmail: settings.companyEmail,
      storePhone: settings.companyPhone,
      storeAddress: settings.companyAddress,
      storeWebsite: settings.companyWebsite,
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      taxRate: settings.taxRate,
      defaultPaymentMethod: settings.defaultPaymentMethod,
      invoicePrefix: settings.invoicePrefix,
      invoiceNumber: settings.invoiceNumber
    };
    
    // Save to localStorage as store config
    localStorage.setItem('storeConfig', JSON.stringify(storeConfig));
    
    setLoading(false);
    showCustomModal(" Invoice settings saved successfully!", "success");
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all settings to defaults?")) {
      const defaultSettings = {
        companyName: "Inventory Pro",
        companyAddress: "123 Business St, City Center",
        companyPhone: "+1 234-567-8900",
        companyEmail: "info@inventorypro.com",
        companyWebsite: "www.inventorypro.com",
        taxRate: 7.5,
        currency: "$",
        currencySymbol: "$",
        invoicePrefix: "INV",
        invoiceNumber: "1001",
        paymentTerms: "Net 14 days",
        footerText: "Thank you for your business!",
        logoUrl: "/logo.jpeg",
        defaultPaymentMethod: "Cash",
        enableDiscount: true,
        enableTax: true,
        enableMultiCurrency: false,
        invoiceNotes: ""
      };
      setSettings(defaultSettings);
      setPaymentMethods([
        { id: "cash", label: "Cash", enabled: true },
        { id: "card", label: "Credit/Debit Card", enabled: true },
        { id: "mobile", label: "Mobile Payment", enabled: true },
        { id: "bank", label: "Bank Transfer", enabled: false }
      ]);
      showCustomModal(" Settings reset to defaults!", "info");
    }
  };

  const handleLogoUpload = () => {
    // In a real app, this would open a file picker
    showCustomModal("📤 Logo upload functionality will be available in the next update.", "info");
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
          <h1 className="text-2xl font-bold text-blue-950">Invoice Settings</h1>
          <p className="text-gray-600 font-medium text-sm">Configure your invoice templates and preferences</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span className="text-sm">{loading ? 'Saving...' : 'Save Settings'}</span>
          </button>
          <Link to="/invoices/all">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Invoices</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-blue-950/10 mb-6 overflow-x-auto">
        <button
          className={`px-6 py-3 font-bold text-sm transition-colors whitespace-nowrap ${
            activeTab === 'general' 
              ? 'border-b-2 border-blue-950 text-blue-950' 
              : 'text-gray-500 hover:text-blue-950'
          }`}
          onClick={() => setActiveTab('general')}
        >
          <Building2 size={16} className="inline mr-2" />
          General
        </button>
        <button
          className={`px-6 py-3 font-bold text-sm transition-colors whitespace-nowrap ${
            activeTab === 'invoice' 
              ? 'border-b-2 border-blue-950 text-blue-950' 
              : 'text-gray-500 hover:text-blue-950'
          }`}
          onClick={() => setActiveTab('invoice')}
        >
          <FileText size={16} className="inline mr-2" />
          Invoice
        </button>
        <button
          className={`px-6 py-3 font-bold text-sm transition-colors whitespace-nowrap ${
            activeTab === 'payment' 
              ? 'border-b-2 border-blue-950 text-blue-950' 
              : 'text-gray-500 hover:text-blue-950'
          }`}
          onClick={() => setActiveTab('payment')}
        >
          <DollarSign size={16} className="inline mr-2" />
          Payment
        </button>
        <button
          className={`px-6 py-3 font-bold text-sm transition-colors whitespace-nowrap ${
            activeTab === 'footer' 
              ? 'border-b-2 border-blue-950 text-blue-950' 
              : 'text-gray-500 hover:text-blue-950'
          }`}
          onClick={() => setActiveTab('footer')}
        >
          <Printer size={16} className="inline mr-2" />
          Footer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
            {activeTab === 'general' && (
              <div>
                <h2 className="text-lg font-bold text-blue-950 mb-4">Company Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Company Logo</label>
                    <div className="flex items-center gap-4">
                      <img 
                        src={settings.logoUrl} 
                        alt="Logo" 
                        className="w-16 h-16 object-cover border-2 border-blue-950/10"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%231e3a5f" stroke-width="2"%3E%3Crect x="2" y="2" width="20" height="20" rx="2"/%3E%3Cpath d="M8 12h8"/%3E%3Cpath d="M8 8h4"/%3E%3Cpath d="M8 16h6"/%3E%3C/svg%3E';
                        }}
                      />
                      <button 
                        onClick={handleLogoUpload}
                        className="bg-blue-950 text-white px-4 py-2 font-bold text-sm hover:bg-blue-900 transition-colors border-2 border-blue-950 flex items-center gap-2"
                      >
                        <Upload size={16} />
                        Upload Logo
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={settings.companyName}
                      onChange={handleChange}
                      className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Address</label>
                    <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                      <MapPin size={18} className="text-gray-400 mr-2" />
                      <input
                        type="text"
                        name="companyAddress"
                        value={settings.companyAddress}
                        onChange={handleChange}
                        className="w-full text-sm font-medium text-blue-950 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Phone</label>
                    <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                      <Phone size={18} className="text-gray-400 mr-2" />
                      <input
                        type="text"
                        name="companyPhone"
                        value={settings.companyPhone}
                        onChange={handleChange}
                        className="w-full text-sm font-medium text-blue-950 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Email</label>
                    <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                      <Mail size={18} className="text-gray-400 mr-2" />
                      <input
                        type="email"
                        name="companyEmail"
                        value={settings.companyEmail}
                        onChange={handleChange}
                        className="w-full text-sm font-medium text-blue-950 outline-none"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Website</label>
                    <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                      <Globe size={18} className="text-gray-400 mr-2" />
                      <input
                        type="text"
                        name="companyWebsite"
                        value={settings.companyWebsite}
                        onChange={handleChange}
                        className="w-full text-sm font-medium text-blue-950 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'invoice' && (
              <div>
                <h2 className="text-lg font-bold text-blue-950 mb-4">Invoice Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Invoice Prefix</label>
                    <input
                      type="text"
                      name="invoicePrefix"
                      value={settings.invoicePrefix}
                      onChange={handleChange}
                      className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Next Invoice Number</label>
                    <input
                      type="number"
                      name="invoiceNumber"
                      value={settings.invoiceNumber}
                      onChange={handleChange}
                      className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Tax Rate (%)</label>
                    <div className="flex items-center border-2 border-blue-950/10 px-3 py-2">
                      <Percent size={18} className="text-gray-400 mr-2" />
                      <input
                        type="number"
                        name="taxRate"
                        value={settings.taxRate}
                        onChange={handleChange}
                        className="w-full text-sm font-medium text-blue-950 outline-none"
                        step="0.01"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Currency</label>
                    <select
                      name="currency"
                      value={settings.currency}
                      onChange={handleChange}
                      className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                    >
                      <option value="$">USD ($)</option>
                      <option value="€">EUR (€)</option>
                      <option value="£">GBP (£)</option>
                      <option value="₦">NGN (₦)</option>
                      <option value="R">ZAR (R)</option>
                      <option value="KSh">KES (KSh)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Payment Terms</label>
                    <select
                      name="paymentTerms"
                      value={settings.paymentTerms}
                      onChange={handleChange}
                      className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                    >
                      <option value="Due on receipt">Due on receipt</option>
                      <option value="Net 7 days">Net 7 days</option>
                      <option value="Net 14 days">Net 14 days</option>
                      <option value="Net 30 days">Net 30 days</option>
                      <option value="Net 60 days">Net 60 days</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="enableDiscount"
                          checked={settings.enableDiscount}
                          onChange={handleChange}
                          className="w-4 h-4 accent-blue-950"
                        />
                        <span className="text-sm font-bold text-blue-950">Enable Discount</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="enableTax"
                          checked={settings.enableTax}
                          onChange={handleChange}
                          className="w-4 h-4 accent-blue-950"
                        />
                        <span className="text-sm font-bold text-blue-950">Enable Tax</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="enableMultiCurrency"
                          checked={settings.enableMultiCurrency}
                          onChange={handleChange}
                          className="w-4 h-4 accent-blue-950"
                        />
                        <span className="text-sm font-bold text-blue-950">Multi-Currency</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div>
                <h2 className="text-lg font-bold text-blue-950 mb-4">Payment Configuration</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Default Payment Method</label>
                    <select
                      name="defaultPaymentMethod"
                      value={settings.defaultPaymentMethod}
                      onChange={handleChange}
                      className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Credit/Debit Card</option>
                      <option value="Mobile">Mobile Payment</option>
                      <option value="Bank">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Payment Methods</label>
                    <div className="space-y-2">
                      {paymentMethods.map((method) => (
                        <label key={method.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={method.enabled}
                            onChange={() => handlePaymentMethodToggle(method.id)}
                            className="w-4 h-4 accent-blue-950"
                          />
                          <span className="font-medium text-gray-700">{method.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border-t-2 border-blue-950/10 pt-4 mt-2">
                    <div className="flex items-start gap-2 p-3 bg-blue-50 border-l-4 border-blue-950">
                      <Info size={18} className="text-blue-950 mt-0.5" />
                      <p className="text-sm text-blue-950 font-medium">
                        These payment methods will be available at checkout in the POS system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'footer' && (
              <div>
                <h2 className="text-lg font-bold text-blue-950 mb-4">Invoice Footer</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Footer Text</label>
                    <textarea
                      name="footerText"
                      value={settings.footerText}
                      onChange={handleChange}
                      rows="3"
                      className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                      placeholder="Enter footer text..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Invoice Notes</label>
                    <textarea
                      name="invoiceNotes"
                      value={settings.invoiceNotes || ""}
                      onChange={handleChange}
                      rows="2"
                      className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                      placeholder="Default notes to appear on all invoices..."
                    />
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border-l-4 border-blue-950">
                    <Info size={18} className="text-blue-950 mt-0.5" />
                    <p className="text-sm text-blue-950 font-medium">
                      Footer text will appear at the bottom of every invoice.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-6 border-t-2 border-blue-950/10">
              <button
                onClick={handleReset}
                className="text-red-800 font-bold text-sm hover:text-red-900 transition-colors"
              >
                Reset to Defaults
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-950 text-white px-6 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Sidebar */}
        <div>
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Live Preview</h2>
            <div className="border-2 border-blue-950/10 p-4">
              <div className="text-center border-b-2 border-blue-950/10 pb-3 mb-3">
                <img 
                  src={settings.logoUrl} 
                  alt="Logo" 
                  className="w-12 h-12 mx-auto object-cover border-2 border-blue-950/10 mb-2"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%231e3a5f" stroke-width="2"%3E%3Crect x="2" y="2" width="20" height="20" rx="2"/%3E%3Cpath d="M8 12h8"/%3E%3Cpath d="M8 8h4"/%3E%3Cpath d="M8 16h6"/%3E%3C/svg%3E';
                  }}
                />
                <p className="font-bold text-blue-950 text-sm">{settings.companyName}</p>
                <p className="text-xs text-gray-600">{settings.companyAddress}</p>
                <p className="text-xs text-gray-600">{settings.companyPhone} | {settings.companyEmail}</p>
              </div>
              <div className="flex justify-between text-xs">
                <div>
                  <p className="font-bold text-blue-950">Invoice #: {settings.invoicePrefix}-2026-001</p>
                  <p className="text-gray-600">Date: 2026-08-05</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-950">Total: {settings.currency}245.00</p>
                  <p className="text-gray-600">Status: Pending</p>
                </div>
              </div>
              <div className="border-t-2 border-blue-950/10 mt-3 pt-3 text-center">
                <p className="text-xs text-gray-600">{settings.footerText}</p>
                <p className="text-xs text-gray-500 mt-1">{settings.paymentTerms}</p>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>Preview updates with your settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSettings;