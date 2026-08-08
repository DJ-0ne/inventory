// src/layout/sidebar/Sidebar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import * as Icons from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Renders ONLY on viewports >= 1024px (lg). On mobile it renders nothing —
// mobile navigation lives entirely in MobileNav.jsx and shares no state with
// this component.
const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const { user, logout, getMenu } = useAuth();

  const menuItems = getMenu();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggle = () => {
    setIsCollapsed((prev) => {
      if (!prev) setOpenDropdown(null);
      return !prev;
    });
  };

  const toggleDropdown = (index) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenDropdown((prev) => (prev === index ? null : index));
  };

  const isActive = (link) => {
    return location.pathname === link || location.pathname.startsWith(link + "/");
  };

  const getIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent size={24} color="white" /> : null;
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      localStorage.clear();
      sessionStorage.clear();
      window.location.assign("/login");
    }
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

  const getUserInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Mobile has its own nav (MobileNav). This component contributes nothing
  // to mobile layout — no fixed bars, no drawer, no shared state.
  if (isMobile) return null;

  return (
    <div
      className={`h-screen bg-blue-950 shadow-2xl transition-all duration-500 ease-in-out z-40 relative overflow-hidden flex flex-col ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}
        ></div>
      </div>
      <div
        className="absolute right-0 top-0 h-32 w-32 bg-white/5 pointer-events-none"
        style={{ clipPath: "polygon(100% 0, 0% 100%, 100% 100%)", opacity: 0.2 }}
      ></div>

      <div className="relative z-10">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-400 to-orange-600"></div>
        <div className={`flex items-center p-5 border-b border-white/10 bg-blue-950 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <div className={`flex items-center ${isCollapsed ? "flex-col" : "space-x-4"}`}>
            <div className="relative">
              <img src="/logo.jpeg" alt="Logo" className={`object-cover border-2 border-white/40 shadow-2xl ${isCollapsed ? "w-12 h-12" : "w-14 h-14"}`} />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-orange-400 border-2 border-white rounded-full animate-pulse"></span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="text-white font-bold text-lg leading-tight">Hardware Store</h1>
                <p className="text-sm font-extrabold text-white/80 truncate">{getUserRoleDisplay(user?.role) || "Guest"}</p>
              </div>
            )}
          </div>
          {/* Single toggle button — collapsed: pinned to the edge as a small
              tab; expanded: sits inline in the header. No duplicate button
              floating outside the sidebar anymore. */}
          <button
            onClick={toggle}
            className={`bg-orange-600/50 hover:bg-orange-600 text-white p-2 shadow-lg border-2 border-orange-400/40 transition-all duration-300 hover:scale-110 hover:rotate-180 ${
              isCollapsed ? "absolute -right-3 top-5" : ""
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {!isCollapsed && user && (
          <div className="p-4 border-b border-white/10 bg-blue-950/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                {getUserInitials(user.name || user.email || "User")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">{user.name || user.email}</p>
                <p className="text-orange-300 text-xs">{getUserRoleDisplay(user.role)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="relative z-10 flex-1 overflow-y-auto py-6 px-3">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => toggleDropdown(index)}
                    className={`flex items-center w-full p-3 cursor-pointer transition-all duration-300 text-white hover:bg-orange-600/50 ${
                      isActive(item.link) ? "bg-orange-600" : ""
                    } ${isCollapsed ? "justify-center" : "justify-start"}`}
                  >
                    <div className="flex-shrink-0">{getIcon(item.icon)}</div>
                    {!isCollapsed && <span className="ml-3 font-bold whitespace-nowrap text-white flex-1 text-left">{item.title}</span>}
                    {!isCollapsed && (
                      <svg className={`w-4 h-4 transition-transform duration-300 ${openDropdown === index ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                  {!isCollapsed && openDropdown === index && (
                    <ul className="ml-6 mt-1 space-y-1 border-l-2 border-orange-400/30 pl-3">
                      {item.subItems.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            to={subItem.link}
                            className={`block py-2 px-3 text-sm font-semibold transition-all duration-300 ${
                              isActive(subItem.link) ? "text-orange-400 bg-orange-600/20" : "text-white/70 hover:text-white hover:bg-orange-600/20"
                            }`}
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.link}
                  className={`flex items-center w-full p-3 cursor-pointer transition-all duration-300 text-white hover:bg-orange-600/50 ${
                    isActive(item.link) ? "bg-orange-600" : ""
                  } ${isCollapsed ? "justify-center" : "justify-start"}`}
                >
                  <div className="flex-shrink-0">{getIcon(item.icon)}</div>
                  {!isCollapsed && <span className="ml-3 font-bold whitespace-nowrap text-white">{item.title}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className={`relative z-10 border-t border-orange-700/30 p-4 bg-orange-900/20 ${isCollapsed ? "text-center" : ""}`}>
        {!isCollapsed ? (
          <div>
            <p className="font-bold text-white text-sm">© 2026 Hardware Store</p>
            <p className="text-xs text-white/60 font-semibold">Inventory Management System</p>
            <button onClick={handleLogout} className="mt-2 w-full bg-red-800/50 hover:bg-red-800 text-white py-1.5 text-xs font-bold transition-colors border border-red-600/30">
              Logout
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="text-white hover:text-orange-400 transition-colors" title="Logout">
            <Icons.LogOut size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;