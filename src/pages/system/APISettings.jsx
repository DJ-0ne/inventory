// src/pages/system/APISettings.jsx
import React, { useState, useEffect } from 'react';
import { 
  Key, 
  RefreshCw, 
  Save, 
  Eye, 
  EyeOff,
  Copy,
  CheckCircle,
  XCircle,
  Shield,
  Globe,
  Clock,
  X,
  AlertCircle
} from 'lucide-react';
import { systemAPI } from '../../services/api';
import dataService from '../../services/dataService';

const APISettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [settings, setSettings] = useState({
    apiKey: '',
    apiSecret: '',
    webhookUrl: '',
    rateLimit: 100,
    allowedIPs: '',
    enableLogging: true,
    version: 'v1',
    environment: 'production'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    setLoading(true);
    
    // Load from localStorage
    const savedSettings = localStorage.getItem('apiSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (e) {
        console.error('Error loading API settings:', e);
        setDefaultSettings();
      }
    } else {
      setDefaultSettings();
    }
    
    setLoading(false);
  };

  const setDefaultSettings = () => {
    const defaultSettings = {
      apiKey: '',  // User must enter their own API key
      apiSecret: '',  // User must enter their own API secret
      webhookUrl: 'https://your-webhook-url.com/webhook',
      rateLimit: 100,
      allowedIPs: '192.168.1.0/24, 10.0.0.0/8',
      enableLogging: true,
      version: 'v1',
      environment: 'production'
    };
    setSettings(defaultSettings);
    localStorage.setItem('apiSettings', JSON.stringify(defaultSettings));
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
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('apiSettings', JSON.stringify(settings));
      
      // Also update store config
      const storeConfig = JSON.parse(localStorage.getItem('storeConfig') || '{}');
      storeConfig.apiSettings = settings;
      localStorage.setItem('storeConfig', JSON.stringify(storeConfig));
      
      setSaving(false);
      showCustomModal("✅ API settings saved successfully!", "success");
    } catch (error) {
      console.error('Error updating API settings:', error);
      setSaving(false);
      showCustomModal("❌ Failed to update API settings. Please try again.", "error");
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(settings.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    showCustomModal("📋 API Key copied to clipboard!", "success");
  };

  const handleRegenerateKey = () => {
    if (!window.confirm('Are you sure you want to regenerate the API key? This will invalidate the current key.')) return;
    
    // Generate new key
    const newKey = `api)_key_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setSettings(prev => ({ ...prev, apiKey: newKey }));
    localStorage.setItem('apiSettings', JSON.stringify({ ...settings, apiKey: newKey }));
    showCustomModal("🔑 API key regenerated successfully!", "success");
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all API settings to defaults?')) {
      setDefaultSettings();
      showCustomModal("🔄 API settings reset to defaults!", "success");
    }
  };

  const inputClasses = "w-full px-4 py-2 border-2 border-blue-950/10 focus:border-blue-950 outline-none font-medium transition-colors font-mono";
  const labelClasses = "block text-sm font-bold text-blue-950 mb-1";

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading API settings...</p>
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
          <h1 className="text-2xl font-bold text-blue-950">API Settings</h1>
          <p className="text-gray-600 font-medium text-sm">Manage your API keys and integration settings</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadSettings}
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

      {/* API Key Box */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-blue-950">
              <Key className="inline mr-2" size={20} />
              API Keys
            </h2>
            <p className="text-sm text-gray-600 font-medium">Your secret API keys for authentication</p>
          </div>
          <button
            onClick={handleRegenerateKey}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors"
          >
            <RefreshCw size={16} />
            Regenerate Key
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className={labelClasses}>API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                name="apiKey"
                value={settings.apiKey}
                onChange={handleChange}
                className={`${inputClasses} pr-24`}
                placeholder="Enter your API key"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 text-gray-400 hover:text-blue-950 transition-colors"
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="p-1 text-gray-400 hover:text-blue-950 transition-colors"
                >
                  {copied ? <CheckCircle size={18} className="text-green-800" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className={labelClasses}>API Secret</label>
            <input
              type={showKey ? 'text' : 'password'}
              name="apiSecret"
              value={settings.apiSecret}
              onChange={handleChange}
              className={`${inputClasses}`}
              placeholder="Enter your API secret"
            />
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white border-2 border-blue-950/10 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Webhook URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="url"
                  name="webhookUrl"
                  value={settings.webhookUrl}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10`}
                  placeholder="https://yourdomain.com/webhook"
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Rate Limit (requests/minute)</label>
              <input
                type="number"
                name="rateLimit"
                value={settings.rateLimit}
                onChange={handleChange}
                className={inputClasses}
                min="1"
                max="1000"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClasses}>Allowed IPs (comma-separated)</label>
              <input
                type="text"
                name="allowedIPs"
                value={settings.allowedIPs}
                onChange={handleChange}
                className={inputClasses}
                placeholder="192.168.1.0/24, 10.0.0.0/8"
              />
              <p className="text-xs text-gray-500 font-medium mt-1">Leave empty to allow all IPs</p>
            </div>
            <div>
              <label className={labelClasses}>API Version</label>
              <select
                name="version"
                value={settings.version}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="v1">v1</option>
                <option value="v2">v2</option>
                <option value="v3">v3</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>Environment</label>
              <select
                name="environment"
                value={settings.environment}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-center space-x-4 pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="enableLogging"
                  checked={settings.enableLogging}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-950 border-2 border-blue-950/20 focus:ring-blue-950"
                />
                <span className="text-sm font-bold text-blue-950">Enable API Logging</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 pt-4 border-t-2 border-blue-950/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 border-2 border-blue-950/20 text-red-800 font-bold hover:bg-red-50 transition-colors"
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              onClick={loadSettings}
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
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-white border-2 border-blue-950/10 shadow-sm p-4">
        <div className="flex items-start gap-3">
          <Shield className="text-blue-950 flex-shrink-0 mt-1" size={20} />
          <div>
            <p className="text-sm font-bold text-blue-950">Security Information</p>
            <p className="text-xs text-gray-600 font-medium">
              Keep your API keys secure. Never share them publicly or expose them in client-side code.
              Regenerate keys immediately if they are compromised.
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

export default APISettings;