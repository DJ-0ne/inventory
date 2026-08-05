// src/layout/Layout.jsx
import React from 'react';
import Sidebar from './sidebar/Sidebar';

const Layout = ({ children }) => {
  // Safely render children - wrap in fragment if it's an array
  const renderChildren = () => {
    if (!children) return null;
    if (Array.isArray(children)) {
      console.warn('⚠️ Layout received children as array, wrapping in fragment');
      return <>{children}</>;
    }
    return children;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6">
          {renderChildren()}
        </div>
      </div>
    </div>
  );
};

export default Layout;