// src/pages/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Define route-based access control
const routeAccess = {
  '/dashboard': ['Administrator', 'Sales Staff', 'Warehouse Staff', 'Procurement'],
  
  // Inventory
  '/inventory/products': ['Administrator', 'Sales Staff', 'Warehouse Staff', 'Procurement'],
  '/inventory/add-product': ['Administrator'],
  '/inventory/bulk-import': ['Administrator'],
  '/inventory/stock-adjustment': ['Administrator', 'Warehouse Staff'],
  '/inventory/low-stock': ['Administrator', 'Sales Staff', 'Warehouse Staff', 'Procurement'],
  '/inventory/out-of-stock': ['Administrator', 'Warehouse Staff'],
  
  // Warehouses
  '/warehouses/all': ['Administrator', 'Warehouse Staff'],
  '/warehouses/add': ['Administrator'],
  '/warehouses/transfers': ['Administrator', 'Warehouse Staff'],
  
  // Purchases
  '/purchases/orders': ['Administrator', 'Warehouse Staff', 'Procurement'],
  '/purchases/create': ['Administrator', 'Procurement'],
  '/purchases/receive': ['Administrator', 'Warehouse Staff'],
  '/purchases/suppliers': ['Administrator', 'Procurement'],
  
  // Sales
  '/sales/pos': ['Administrator', 'Sales Staff'],
  '/sales/all': ['Administrator', 'Sales Staff'],
  '/sales/returns': ['Administrator', 'Sales Staff'],
  
  // Invoices
  '/invoices/all': ['Administrator', 'Sales Staff'],
  '/invoices/create': ['Administrator', 'Sales Staff'],
  '/invoices/settings': ['Administrator'],
  
  // Customers
  '/customers/all': ['Administrator', 'Sales Staff'],
  '/customers/add': ['Administrator', 'Sales Staff'],
  '/customers/purchase-history': ['Administrator', 'Sales Staff'],
  
  // Reports - Admin Only
  '/reports/sales': ['Administrator'],
  '/reports/daily': ['Administrator'],
  '/reports/period': ['Administrator'],
  '/reports/top-products': ['Administrator'],
  '/reports/revenue': ['Administrator'],
  '/reports/profit-margin': ['Administrator'],
  '/reports/supplier-performance': ['Administrator'],
  
  // Notifications
  '/notifications/low-stock': ['Administrator', 'Sales Staff', 'Warehouse Staff', 'Procurement'],
  '/notifications/reorder': ['Administrator', 'Warehouse Staff', 'Procurement'],
  '/notifications/expiry': ['Administrator', 'Warehouse Staff'],
  '/notifications/daily-summary': ['Administrator'],
  '/notifications/system-events': ['Administrator'],
  
  // Users - Admin Only
  '/users/all': ['Administrator'],
  '/users/add': ['Administrator'],
  '/users/roles': ['Administrator'],
  '/users/audit': ['Administrator'],
  
  // System - Admin Only
  '/system/store-config': ['Administrator'],
  '/system/backup': ['Administrator'],
  '/system/restore': ['Administrator'],
  '/system/api': ['Administrator'],
  '/system/export': ['Administrator']
};

// Helper to check if user can access a route
const canAccessRoute = (path, userRole) => {
  // Check exact match first
  if (routeAccess[path]) {
    return routeAccess[path].includes(userRole);
  }
  
  // Check wildcard matches (e.g., /inventory/*)
  for (const [route, roles] of Object.entries(routeAccess)) {
    if (route.endsWith('/*')) {
      const baseRoute = route.replace('/*', '');
      if (path.startsWith(baseRoute)) {
        return roles.includes(userRole);
      }
    }
  }
  
  // If route not in access list, allow access (fallback)
  return true;
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950"></div>
      </div>
    );
  }

  // ✅ IMPORTANT: If not authenticated, redirect to login
  // The `state: { from: location }` saves the current location so we can redirect back after login
  if (!isAuthenticated) {
    console.log('🔒 Not authenticated, redirecting to login from:', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access for the specific route
  if (!canAccessRoute(location.pathname, user.role)) {
    console.log('🚫 Role:', user.role, 'cannot access:', location.pathname);
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user has any of the allowed roles (if specified)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('🚫 Role:', user.role, 'not in allowed roles:', allowedRoles);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;