// src/layout/Layout.jsx
import React from "react";
import Sidebar from "./sidebar/Sidebar";
import MobileNav from "./sidebar/MobileNav";

const Layout = ({ children }) => {
  const renderChildren = () => {
    if (!children) return null;
    if (Array.isArray(children)) {
      console.warn(
        "⚠️ Layout received children as array, wrapping in fragment",
      );
      return <>{children}</>;
    }
    return children;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar renders itself only on desktop (>=1024px), MobileNav only
          below that — each returns null on the viewport it doesn't own. */}
      <Sidebar />
      <MobileNav />

      {/*
        pt-12 clears MobileNav's fixed top bar, pb-16 clears its fixed bottom
        bar. Both collapse to 0 at `lg`, matching the 1024px check in both
        nav components.
      */}
      <div className="flex-1 overflow-y-auto bg-gray-50 pt-12 pb-16 lg:pt-0 lg:pb-0">
        <div className="p-6">{renderChildren()}</div>
      </div>
    </div>
  );
};

export default Layout;
