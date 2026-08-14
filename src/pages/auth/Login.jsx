// src/pages/auth/.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Building, Mail, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  //  Get the page user was trying to access before login
  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Auto-detect role based on email
  const detectRole = (email) => {
    const emailLower = email.toLowerCase();

    if (emailLower.includes("admin") || emailLower.includes("administrator")) {
      return "Administrator";
    } else if (emailLower.includes("sales") || emailLower.includes("cashier")) {
      return "Sales Staff";
    } else if (
      emailLower.includes("warehouse") ||
      emailLower.includes("stock")
    ) {
      return "Warehouse Staff";
    } else if (
      emailLower.includes("procurement") ||
      emailLower.includes("buyer") ||
      emailLower.includes("purchase")
    ) {
      return "Procurement";
    }
    return "Sales Staff"; // Default
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const detectedRole = detectRole(formData.email);

      const userData = {
        id: 1,
        name: formData.email.split("@")[0] || "User",
        email: formData.email || "user@hardware.com",
        role: detectedRole,
        token: "mock-token-123",
      };

      login(userData);

      //  Navigate to dashboard (or the page they were trying to access)
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Quick login buttons
  const quickLogins = [
    {
      label: "Admin",
      email: "admin@hardware.com",
      color: "bg-blue-950 hover:bg-blue-900",
    },
    {
      label: "Sales",
      email: "sales@hardware.com",
      color: "bg-orange-600 hover:bg-orange-700",
    },
    {
      label: "Warehouse",
      email: "warehouse@hardware.com",
      color: "bg-green-800 hover:bg-green-700",
    },
    {
      label: "Procurement",
      email: "procurement@hardware.com",
      color: "bg-purple-800 hover:bg-purple-700",
    },
  ];

  const handleQuickLogin = (email) => {
    const detectedRole = detectRole(email);
    const userData = {
      id: 1,
      name: email.split("@")[0] || "User",
      email: email,
      role: detectedRole,
      token: "mock-token-123",
    };
    login(userData);
    navigate("/dashboard", { replace: true });
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
          <p className="text-gray-600 font-medium mt-2">
            Inventory Management System
          </p>
        </div>

        <div className="bg-white border-2 border-blue-950/10 shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-blue-950 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
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
                <p className="text-xs text-gray-400 mt-1">
                  Role auto-detected from email:
                  <span className="font-bold text-blue-950 ml-1">
                    {formData.email
                      ? detectRole(formData.email)
                      : "Not detected"}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-950 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
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
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t-2 border-blue-950/10">
            <p className="text-xs text-gray-500 text-center font-medium mb-3">
              Quick Login (Auto-detects role from email)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickLogins.map((login) => (
                <button
                  key={login.label}
                  onClick={() => handleQuickLogin(login.email)}
                  className={`${login.color} text-white py-2 text-sm font-bold transition-colors border-2 border-transparent`}
                >
                  {login.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
