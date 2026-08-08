// src/layout/sidebar/MobileNav.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import * as Icons from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Renders ONLY on viewports < 1024px (lg). Owns 100% of its own state —
// nothing here is read by or written to Sidebar.jsx. Every menu item
// (including dropdown groups) is reachable directly from the bottom bar:
// a dropdown group opens a small sheet anchored above the bar itself,
// not the desktop sidebar/drawer.
const MobileNav = () => {
  const [isMobile, setIsMobile] = useState(false);
  // Index of the menu item whose sub-items sheet is open. null = closed.
  const [openSheet, setOpenSheet] = useState(null);
  const location = useLocation();
  const { user, logout, getMenu } = useAuth();

  const menuItems = getMenu();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close the sheet whenever the route changes.
  useEffect(() => {
    setOpenSheet(null);
  }, [location.pathname]);

  const isActive = (link) => {
    if (!link) return false;
    return (
      location.pathname === link || location.pathname.startsWith(link + "/")
    );
  };

  // A group is "active" if its own link matches, or any of its sub-items does.
  const isGroupActive = (item) => {
    if (isActive(item.link)) return true;
    return item.subItems?.some((sub) => isActive(sub.link)) ?? false;
  };

  const getIcon = (iconName, size = 20) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent size={size} color="white" /> : null;
  };

  const getUserRoleDisplay = (role) => {
    const roleMap = {
      Administrator: "Admin",
      "Sales Staff": "Sales",
      "Warehouse Staff": "Warehouse",
      Procurement: "Procurement",
    };
    return roleMap[role] || role;
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      localStorage.clear();
      sessionStorage.clear();
      window.location.assign("/");
    }
  };

  if (!isMobile) return null;

  const activeSheetItem = openSheet !== null ? menuItems[openSheet] : null;

  return (
    <>
      {/* Top bar — branding + user info only, no menu button, no drawer */}
      <div className="fixed top-0 left-0 right-0 bg-blue-950 shadow-md z-40">
        <div className="flex items-center justify-between px-4 py-1.5">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <img
                src="/logo.jpeg"
                alt="Logo"
                className="w-8 h-8 object-cover border border-white/30 shadow-lg"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-orange-400 border border-white rounded-full animate-pulse"></span>
            </div>
            <h1 className="text-white font-bold text-sm leading-tight">
              Hardware Store
            </h1>
          </div>
          <div className="text-right">
            <p className="text-white text-xs font-semibold">
              {user?.name || "User"}
            </p>
            <p className="text-orange-200 text-[10px] font-medium">
              {getUserRoleDisplay(user?.role) || "Guest"}
            </p>
          </div>
        </div>
      </div>

      {/* Backdrop for the sub-items sheet */}
      {openSheet !== null && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpenSheet(null)}
        />
      )}

      {/* Sub-items sheet — pops up directly above the bottom bar.
          Completely local to this component; does not touch Sidebar. */}
      {activeSheetItem && (
        <div className="fixed bottom-16 left-0 right-0 bg-blue-900 shadow-2xl z-50 rounded-t-2xl max-h-[60vh] overflow-y-auto border-t border-orange-400/30">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-blue-900">
            <span className="text-white font-bold text-sm">
              {activeSheetItem.title}
            </span>
            <button
              onClick={() => setOpenSheet(null)}
              className="p-1 text-white/70 hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ul className="py-2">
            {activeSheetItem.subItems.map((subItem, subIndex) => (
              <li key={subIndex}>
                <Link
                  to={subItem.link}
                  className={`flex items-center px-5 py-3 text-sm font-semibold transition-colors ${
                    isActive(subItem.link)
                      ? "text-orange-400 bg-orange-600/20"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {subItem.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom bar — every sidebar item lives here, horizontally scrollable */}
      <div className="fixed bottom-0 left-0 right-0 bg-blue-950 shadow-lg z-40">
        <div className="flex items-stretch h-16 overflow-x-auto no-scrollbar">
          {menuItems.map((item, index) =>
            item.subItems ? (
              <button
                key={index}
                onClick={() =>
                  setOpenSheet((prev) => (prev === index ? null : index))
                }
                className={`flex-shrink-0 min-w-[68px] flex flex-col items-center justify-center gap-0.5 px-2 transition-colors ${
                  isGroupActive(item) || openSheet === index
                    ? "text-white bg-orange-600/50"
                    : "text-orange-100"
                }`}
              >
                {getIcon(item.icon)}
                <span className="text-[9px] font-semibold whitespace-nowrap leading-tight">
                  {item.title}
                </span>
              </button>
            ) : (
              <Link
                key={index}
                to={item.link}
                className={`flex-shrink-0 min-w-[68px] flex flex-col items-center justify-center gap-0.5 px-2 transition-colors ${
                  isActive(item.link)
                    ? "text-white bg-orange-600/50"
                    : "text-orange-100"
                }`}
              >
                {getIcon(item.icon)}
                <span className="text-[9px] font-semibold whitespace-nowrap leading-tight">
                  {item.title}
                </span>
              </Link>
            ),
          )}
          {/* Logout — part of the sidebar's contents too, included for parity */}
          <button
            onClick={handleLogout}
            className="flex-shrink-0 min-w-[68px] flex flex-col items-center justify-center gap-0.5 px-2 text-red-300"
          >
            <Icons.LogOut size={20} color="currentColor" />
            <span className="text-[9px] font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
