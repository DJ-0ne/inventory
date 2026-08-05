// src/pages/users/AddUser.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Shield,
  Phone,
  MapPin,
  Briefcase,
  RefreshCw,
  Save,
  X,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { userAPI } from '../../services/api';
import dataService from '../../services/dataService';
import { USER_ROLES } from '../../constants';

const AddUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone: '',
    address: '',
    department: '',
    position: '',
    status: 'Active'
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.email.includes('@')) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    if (modalType === "success") {
      navigate('/users/all');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      // Create user object
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        address: formData.address || 'N/A',
        department: formData.department || 'N/A',
        position: formData.position || 'N/A',
        status: formData.status,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'Never'
      };

      // Save to dataService
      dataService.addUser(userData);
      
      setLoading(false);
      showCustomModal(
        `✅ User created successfully!\n\nName: ${userData.name}\nEmail: ${userData.email}\nRole: ${userData.role}\nStatus: ${userData.status}`,
        "success"
      );
    } catch (error) {
      console.error('Error creating user:', error);
      setLoading(false);
      showCustomModal("❌ Failed to create user. Please try again.", "error");
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/users/all');
    }
  };

  const inputClasses = "w-full px-4 py-2 border-2 border-blue-950/10 focus:border-blue-950 outline-none font-medium transition-colors";
  const labelClasses = "block text-sm font-bold text-blue-950 mb-1";
  const errorClasses = "text-red-800 text-xs font-bold mt-1";

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
          <h1 className="text-2xl font-bold text-blue-950">Add New User</h1>
          <p className="text-gray-600 font-medium text-sm">Create a new user account with role-based permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCancel}
            className="flex items-center gap-2 bg-white border-2 border-red-800/20 px-4 py-2 text-red-800 font-bold hover:bg-red-50 transition-colors"
          >
            <X size={18} />
            <span className="text-sm">Cancel</span>
          </button>
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
            <span className="text-sm">{loading ? 'Saving...' : 'Save User'}</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-bold text-blue-950 mb-4 pb-2 border-b-2 border-blue-950/10">
                <User className="inline mr-2" size={20} />
                Personal Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClasses}>First Name <span className="text-red-800">*</span></label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <p className={errorClasses}>{errors.firstName}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Last Name <span className="text-red-800">*</span></label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <p className={errorClasses}>{errors.lastName}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Email Address <span className="text-red-800">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`${inputClasses} pl-10`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && <p className={errorClasses}>{errors.email}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Phone Number <span className="text-red-800">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`${inputClasses} pl-10`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {errors.phone && <p className={errorClasses}>{errors.phone}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`${inputClasses} pl-10 min-h-[80px]`}
                      placeholder="Enter address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account & Role Information */}
            <div>
              <h2 className="text-lg font-bold text-blue-950 mb-4 pb-2 border-b-2 border-blue-950/10">
                <Shield className="inline mr-2" size={20} />
                Account & Role
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClasses}>Role <span className="text-red-800">*</span></label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={inputClasses}
                  >
                    <option value="">Select Role</option>
                    {Object.entries(USER_ROLES).map(([key, value]) => (
                      <option key={key} value={value}>{value}</option>
                    ))}
                  </select>
                  {errors.role && <p className={errorClasses}>{errors.role}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Department</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={`${inputClasses} pl-10`}
                      placeholder="Enter department"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Enter position"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={inputClasses}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Password <span className="text-red-800">*</span></label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`${inputClasses} pl-10 pr-10`}
                      placeholder="Enter password (min 8 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-950"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className={errorClasses}>{errors.password}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Confirm Password <span className="text-red-800">*</span></label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`${inputClasses} pl-10`}
                      placeholder="Confirm password"
                    />
                  </div>
                  {errors.confirmPassword && <p className={errorClasses}>{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 pt-4 border-t-2 border-blue-950/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border-2 border-blue-950/20 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-950 text-white font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;