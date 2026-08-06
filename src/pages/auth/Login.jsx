// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building, Mail, Lock, Eye, EyeOff } from 'lucide-react';

// TEMPORARY stand-in for what the backend will eventually own:
// each account's role, looked up by email. Once a real backend exists,
// replace the lookup inside handleSubmit with an actual API call
// (e.g. POST /api/login) that returns { role, name, token, ... } —
// nothing else in the app (AuthContext, sidebarData) needs to change.
const mockUsers = {
  'admin@hardware.com': { role: 'Administrator', name: 'Admin User' },
  'sales@hardware.com': { role: 'Sales Staff', name: 'Sales User' },
  'warehouse@hardware.com': { role: 'Warehouse Staff', name: 'Warehouse User' },
  'procurement@hardware.com': { role: 'Procurement', name: 'Procurement User' },
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();
      const matchedUser = mockUsers[normalizedEmail];

      if (!matchedUser) {
        setError('No account found for this email. Try one of the demo accounts below.');
        setLoading(false);
        return;
      }

      const userData = {
        id: 1,
        email: normalizedEmail,
        name: matchedUser.name,
        role: matchedUser.role,
        token: 'mock-token-123',
      };

      login(userData);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-950 p-4 border-2 border-orange-400/30">
              <Building size={40} color="white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-blue-950">Hardware Store</h1>
          <p className="text-gray-600 font-medium mt-2">Inventory Management System</p>
        </div>

        <div className="bg-white border-2 border-blue-950/10 shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-blue-950 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border-2 border-blue-950/10 focus:border-blue-950 outline-none font-medium"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-950 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 border-2 border-blue-950/10 focus:border-blue-950 outline-none font-medium"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-950"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Role is no longer selectable here — it's derived from the
                  matched account (mockUsers below), same as a real backend
                  would return it tied to the account, not the login form. */}

              {error && (
                <div className="bg-red-50 border-2 border-red-800 p-3">
                  <p className="text-red-800 text-sm font-bold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 font-medium mb-1">Demo accounts (any password):</p>
            <p className="text-xs text-gray-500 font-medium">admin@hardware.com</p>
            <p className="text-xs text-gray-500 font-medium">sales@hardware.com</p>
            <p className="text-xs text-gray-500 font-medium">warehouse@hardware.com</p>
            <p className="text-xs text-gray-500 font-medium">procurement@hardware.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;