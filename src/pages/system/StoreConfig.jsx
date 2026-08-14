// src/pages/system/StoreConfig.jsx
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Store,
  Globe,
  Phone,
  Mail,
  MapPin,
  Clock,
  CreditCard,
  Package,
  Truck,
  Shield,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { systemAPI } from '../../services/api';
import dataService from '../../services/dataService';

const StoreConfig = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [config, setConfig] = useState({
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    storeWebsite: '',
    timezone: 'UTC',
    currency: 'USD',
    currencySymbol: '$',
    taxRate: 0,
    shippingCost: 0,
    freeShippingThreshold: 0,
    defaultPaymentMethod: 'Credit Card',
    invoicePrefix: 'INV-',
    orderPrefix: 'ORD-',
    lowStockThreshold: 10,
    enableNotifications: true,
    enableMultiCurrency: false,
    enableMultiWarehouse: true
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    setLoading(true);
    
    // Load from localStorage
    const savedConfig = localStorage.getItem('storeConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch (e) {
        console.error('Error loading store config:', e);
        setDefaultConfig();
      }
    } else {
      setDefaultConfig();
    }
    
    setLoading(false);
  };

  const setDefaultConfig = () => {
    const defaultConfig = {
      storeName: 'Hardware Store Pro',
      storeEmail: 'store@hardwarepro.com',
      storePhone: '+1 (555) 123-4567',
      storeAddress: '123 Main Street, Suite 100, New York, NY 10001',
      storeWebsite: 'https://hardwarepro.com',
      timezone: 'America/New_York',
      currency: 'USD',
      currencySymbol: '$',
      taxRate: 8.5,
      shippingCost: 5.99,
      freeShippingThreshold: 50,
      defaultPaymentMethod: 'Credit Card',
      invoicePrefix: 'INV-',
      orderPrefix: 'ORD-',
      lowStockThreshold: 10,
      enableNotifications: true,
      enableMultiCurrency: false,
      enableMultiWarehouse: true
    };
    setConfig(defaultConfig);
    localStorage.setItem('storeConfig', JSON.stringify(defaultConfig));
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('storeConfig', JSON.stringify(config));
      
      // Also update invoice settings
      const invoiceSettings = {
        companyName: config.storeName,
        companyEmail: config.storeEmail,
        companyPhone: config.storePhone,
        companyAddress: config.storeAddress,
        companyWebsite: config.storeWebsite,
        currency: config.currency,
        currencySymbol: config.currencySymbol,
        taxRate: config.taxRate,
        invoicePrefix: config.invoicePrefix
      };
      localStorage.setItem('invoiceSettings', JSON.stringify(invoiceSettings));
      
      setSaving(false);
      showCustomModal(" Store configuration updated successfully!", "success");
    } catch (error) {
      console.error('Error updating config:', error);
      setSaving(false);
      showCustomModal("❌ Failed to update store configuration. Please try again.", "error");
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      setDefaultConfig();
      showCustomModal(" Store configuration reset to defaults!", "success");
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading store configuration...</p>
        </div>
      </div>
    );
  }

  const inputClasses = "w-full px-4 py-2 border-2 border-blue-950/10 focus:border-blue-950 outline-none font-medium transition-colors";
  const labelClasses = "block text-sm font-bold text-blue-950 mb-1";
  const sectionClasses = "border-b-2 border-blue-950/10 pb-4 mb-4";

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
          <h1 className="text-2xl font-bold text-blue-950">Store Configuration</h1>
          <p className="text-gray-600 font-medium text-sm">Manage your store settings and preferences</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button 
            onClick={loadConfig}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            <span className="text-sm">Refresh</span>
          </button>
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span className="text-sm">{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white border-2 border-blue-950/10 shadow-sm p-6">
          {/* General Information */}
          <div>
            <h2 className="text-lg font-bold text-blue-950 mb-4">
              <Store className="inline mr-2" size={20} />
              General Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Store Name</label>
                <input
                  type="text"
                  name="storeName"
                  value={config.storeName}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Store Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="storeEmail"
                    value={config.storeEmail}
                    onChange={handleChange}
                    className={`${inputClasses} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClasses}>Store Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    name="storePhone"
                    value={config.storePhone}
                    onChange={handleChange}
                    className={`${inputClasses} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClasses}>Store Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="url"
                    name="storeWebsite"
                    value={config.storeWebsite}
                    onChange={handleChange}
                    className={`${inputClasses} pl-10`}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClasses}>Store Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <textarea
                    name="storeAddress"
                    value={config.storeAddress}
                    onChange={handleChange}
                    className={`${inputClasses} pl-10 min-h-[80px]`}
                    rows="2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Localization */}
          <div className={`${sectionClasses}`}>
            <h2 className="text-lg font-bold text-blue-950 mb-4">
              <Globe className="inline mr-2" size={20} />
              Localization
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Timezone</label>
                <select
                  name="timezone"
                  value={config.timezone}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">GMT</option>
                  <option value="Europe/Paris">CET</option>
                  <option value="Asia/Dubai">GST</option>
                  <option value="Asia/Singapore">SGT</option>
                  <option value="Australia/Sydney">AEST</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>Currency</label>
                <select
                  name="currency"
                  value={config.currency}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="KES">KES - Kenyan Shilling</option>
                  <option value="NGN">NGN - Nigerian Naira</option>
                  <option value="ZAR">ZAR - South African Rand</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>Currency Symbol</label>
                <input
                  type="text"
                  name="currencySymbol"
                  value={config.currencySymbol}
                  onChange={handleChange}
                  className={inputClasses}
                  maxLength="3"
                />
              </div>
              <div>
                <label className={labelClasses}>Tax Rate (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  value={config.taxRate}
                  onChange={handleChange}
                  className={inputClasses}
                  step="0.01"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className={`${sectionClasses}`}>
            <h2 className="text-lg font-bold text-blue-950 mb-4">
              <Truck className="inline mr-2" size={20} />
              Shipping & Payment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Default Shipping Cost ($)</label>
                <input
                  type="number"
                  name="shippingCost"
                  value={config.shippingCost}
                  onChange={handleChange}
                  className={inputClasses}
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className={labelClasses}>Free Shipping Threshold ($)</label>
                <input
                  type="number"
                  name="freeShippingThreshold"
                  value={config.freeShippingThreshold}
                  onChange={handleChange}
                  className={inputClasses}
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className={labelClasses}>Default Payment Method</label>
                <select
                  name="defaultPaymentMethod"
                  value={config.defaultPaymentMethod}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invoice & Order Settings */}
          <div className={`${sectionClasses}`}>
            <h2 className="text-lg font-bold text-blue-950 mb-4">
              <CreditCard className="inline mr-2" size={20} />
              Invoice & Order Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Invoice Prefix</label>
                <input
                  type="text"
                  name="invoicePrefix"
                  value={config.invoicePrefix}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Order Prefix</label>
                <input
                  type="text"
                  name="orderPrefix"
                  value={config.orderPrefix}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Inventory & Notifications */}
          <div className={`${sectionClasses}`}>
            <h2 className="text-lg font-bold text-blue-950 mb-4">
              <Package className="inline mr-2" size={20} />
              Inventory & Notifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Low Stock Threshold</label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={config.lowStockThreshold}
                  onChange={handleChange}
                  className={inputClasses}
                  min="0"
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableNotifications"
                    checked={config.enableNotifications}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-950 border-2 border-blue-950/20 focus:ring-blue-950"
                  />
                  <span className="text-sm font-bold text-blue-950">Enable Notifications</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableMultiCurrency"
                    checked={config.enableMultiCurrency}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-950 border-2 border-blue-950/20 focus:ring-blue-950"
                  />
                  <span className="text-sm font-bold text-blue-950">Multi-Currency</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableMultiWarehouse"
                    checked={config.enableMultiWarehouse}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-950 border-2 border-blue-950/20 focus:ring-blue-950"
                  />
                  <span className="text-sm font-bold text-blue-950">Multi-Warehouse</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center gap-3 pt-4 border-t-2 border-blue-950/10">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 border-2 border-red-800/20 text-red-800 font-bold hover:bg-red-50 transition-colors"
            >
              Reset to Defaults
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={loadConfig}
                className="px-6 py-2 border-2 border-blue-950/20 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-950 text-white font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-white border-2 border-blue-950/10 shadow-sm p-4">
        <div className="flex items-start gap-3">
          <Shield className="text-blue-950 flex-shrink-0 mt-1" size={20} />
          <div>
            <p className="text-sm font-bold text-blue-950">Configuration Information</p>
            <p className="text-xs text-gray-600 font-medium">
              These settings affect the entire system including POS, invoices, and inventory management.
              Changes will take effect immediately.
            </p>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreConfig;