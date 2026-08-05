// src/layout/sidebardata/sidebarData.jsx

// Complete sidebar data with all items
export const sidebarData = [
  {
    title: "Dashboard",
    icon: "LayoutDashboard",
    link: "/dashboard"
  },
  {
    title: "Inventory",
    icon: "Package",
    link: "/inventory",
    subItems: [
      { title: "All Products", link: "/inventory/products" },
      { title: "Add Product", link: "/inventory/add-product" },
      { title: "Bulk Import", link: "/inventory/bulk-import" },
      { title: "Stock Adjustment", link: "/inventory/stock-adjustment" },
      { title: "Low Stock", link: "/inventory/low-stock" },
      { title: "Out of Stock", link: "/inventory/out-of-stock" }
    ]
  },
  {
    title: "Warehouses",
    icon: "Warehouse",
    link: "/warehouses",
    subItems: [
      { title: "All Warehouses", link: "/warehouses/all" },
      { title: "Add Warehouse", link: "/warehouses/add" },
      { title: "Stock Transfers", link: "/warehouses/transfers" }
    ]
  },
  {
    title: "Purchases",
    icon: "ShoppingBag",
    link: "/purchases",
    subItems: [
      { title: "Purchase Orders", link: "/purchases/orders" },
      { title: "Create Purchase Order", link: "/purchases/create" },
      { title: "Receive Stock", link: "/purchases/receive" },
      { title: "Suppliers", link: "/purchases/suppliers" }
    ]
  },
  {
    title: "Sales",
    icon: "ShoppingCart",
    link: "/sales",
    subItems: [
      { title: "Point of Sale (POS)", link: "/sales/pos" },
      { title: "All Sales", link: "/sales/all" },
      { title: "Sales Returns", link: "/sales/returns" }
    ]
  },
  {
    title: "Invoices",
    icon: "FileText",
    link: "/invoices",
    subItems: [
      { title: "All Invoices", link: "/invoices/all" },
      { title: "Create Invoice", link: "/invoices/create" },
      { title: "Invoice Settings", link: "/invoices/settings" }
    ]
  },
  {
    title: "Customers",
    icon: "Users",
    link: "/customers",
    subItems: [
      { title: "All Customers", link: "/customers/all" },
      { title: "Add Customer", link: "/customers/add" },
      { title: "Purchase History", link: "/customers/purchase-history" }
    ]
  },
  {
    title: "Reports",
    icon: "BarChart3",
    link: "/reports",
    subItems: [
      { title: "Sales Reports", link: "/reports/sales" },
      { title: "Daily Sales", link: "/reports/daily" },
      { title: "Weekly/Monthly/Yearly", link: "/reports/period" },
      { title: "Top Selling Products", link: "/reports/top-products" },
      { title: "Revenue Tracking", link: "/reports/revenue" },
      { title: "Profit Margin", link: "/reports/profit-margin" },
      { title: "Supplier Performance", link: "/reports/supplier-performance" }
    ]
  },
  {
    title: "Notifications",
    icon: "Bell",
    link: "/notifications",
    subItems: [
      { title: "Low Stock Alerts", link: "/notifications/low-stock" },
      { title: "Reorder Suggestions", link: "/notifications/reorder" },
      { title: "Expiry Alerts", link: "/notifications/expiry" },
      { title: "Daily Summary", link: "/notifications/daily-summary" },
      { title: "System Events", link: "/notifications/system-events" }
    ]
  },
  {
    title: "Users",
    icon: "UserCog",
    link: "/users",
    subItems: [
      { title: "All Users", link: "/users/all" },
      { title: "Add User", link: "/users/add" },
      { title: "Roles & Permissions", link: "/users/roles" },
      { title: "Audit Trail", link: "/users/audit" }
    ]
  },
  {
    title: "System",
    icon: "Settings",
    link: "/system",
    subItems: [
      { title: "Store Configuration", link: "/system/store-config" },
      { title: "Backup", link: "/system/backup" },
      { title: "Restore", link: "/system/restore" },
      { title: "API Settings", link: "/system/api" },
      { title: "Export Data", link: "/system/export" }
    ]
  }
];

// ✅ ROLE-BASED ACCESS CONTROL
const roleAccess = {
  'Administrator': {
    dashboard: true,
    inventory: true,
    warehouses: true,
    purchases: true,
    sales: true,
    invoices: true,
    customers: true,
    reports: true,
    notifications: true,
    users: true,
    system: true
  },
  'Sales Staff': {
    dashboard: true,
    inventory: true,      // View only
    warehouses: false,
    purchases: false,
    sales: true,
    invoices: true,
    customers: true,
    reports: false,
    notifications: true,
    users: false,
    system: false
  },
  'Warehouse Staff': {
    dashboard: true,
    inventory: true,
    warehouses: true,
    purchases: true,
    sales: false,
    invoices: false,
    customers: false,
    reports: false,
    notifications: true,
    users: false,
    system: false
  },
  'Procurement': {
    dashboard: true,
    inventory: true,      // View only
    warehouses: false,
    purchases: true,
    sales: false,
    invoices: false,
    customers: false,
    reports: false,
    notifications: true,
    users: false,
    system: false
  }
};

// ✅ Sub-item access control
const subItemAccess = {
  'Administrator': {
    'Add Product': true,
    'Bulk Import': true,
    'Add Warehouse': true,
    'Invoice Settings': true,
    'Sales Reports': true,
    'Daily Sales': true,
    'Weekly/Monthly/Yearly': true,
    'Top Selling Products': true,
    'Revenue Tracking': true,
    'Profit Margin': true,
    'Supplier Performance': true,
    'Daily Summary': true,
    'System Events': true,
    'All Users': true,
    'Add User': true,
    'Roles & Permissions': true,
    'Audit Trail': true,
    'Store Configuration': true,
    'Backup': true,
    'Restore': true,
    'API Settings': true,
    'Export Data': true
  },
  'Sales Staff': {
    'Add Product': false,
    'Bulk Import': false,
    'Add Warehouse': false,
    'Invoice Settings': false,
    'Sales Reports': false,
    'Daily Sales': false,
    'Weekly/Monthly/Yearly': false,
    'Top Selling Products': false,
    'Revenue Tracking': false,
    'Profit Margin': false,
    'Supplier Performance': false,
    'Daily Summary': false,
    'System Events': false,
    'All Users': false,
    'Add User': false,
    'Roles & Permissions': false,
    'Audit Trail': false,
    'Store Configuration': false,
    'Backup': false,
    'Restore': false,
    'API Settings': false,
    'Export Data': false
  },
  'Warehouse Staff': {
    'Add Product': false,
    'Bulk Import': false,
    'Add Warehouse': false,
    'Invoice Settings': false,
    'Sales Reports': false,
    'Daily Sales': false,
    'Weekly/Monthly/Yearly': false,
    'Top Selling Products': false,
    'Revenue Tracking': false,
    'Profit Margin': false,
    'Supplier Performance': false,
    'Daily Summary': false,
    'System Events': false,
    'All Users': false,
    'Add User': false,
    'Roles & Permissions': false,
    'Audit Trail': false,
    'Store Configuration': false,
    'Backup': false,
    'Restore': false,
    'API Settings': false,
    'Export Data': false
  },
  'Procurement': {
    'Add Product': false,
    'Bulk Import': false,
    'Add Warehouse': false,
    'Invoice Settings': false,
    'Sales Reports': false,
    'Daily Sales': false,
    'Weekly/Monthly/Yearly': false,
    'Top Selling Products': false,
    'Revenue Tracking': false,
    'Profit Margin': false,
    'Supplier Performance': false,
    'Daily Summary': false,
    'System Events': false,
    'All Users': false,
    'Add User': false,
    'Roles & Permissions': false,
    'Audit Trail': false,
    'Store Configuration': false,
    'Backup': false,
    'Restore': false,
    'API Settings': false,
    'Export Data': false
  }
};

// ✅ MAIN FILTERING FUNCTION - This removes items users shouldn't see
export const getSidebarData = (userRole) => {
  // If no role, return empty array (nothing to show)
  if (!userRole) return [];

  // Normalize the role string defensively (trim whitespace) so small
  // formatting differences from the backend/login payload don't silently
  // fall through to "no access found".
  const normalizedRole = String(userRole).trim();

  // Get access rules for this role.
  // IMPORTANT: fall back to an EMPTY object (no access) rather than
  // Administrator access. Falling back to Administrator meant any
  // unrecognized/mismatched role string (wrong case, typo, different
  // label, etc.) silently saw the FULL admin menu — that was the bug.
  const access = roleAccess[normalizedRole] || {};
  const subAccess = subItemAccess[normalizedRole] || {};

  // Warn loudly if the role isn't recognized at all, instead of
  // silently granting or denying everything without a trace.
  if (!roleAccess[normalizedRole]) {
    console.warn(
      `⚠️ Unrecognized role "${userRole}" — no matching entry in roleAccess. ` +
      `Defaulting to NO menu access. Check that the role string from login ` +
      `exactly matches one of: ${Object.keys(roleAccess).join(', ')}`
    );
  }

  // Step 1: Filter main menu items
  const filteredData = sidebarData
    .filter(item => {
      // Map title to key for access check
      const titleMap = {
        'Dashboard': 'dashboard',
        'Inventory': 'inventory',
        'Warehouses': 'warehouses',
        'Purchases': 'purchases',
        'Sales': 'sales',
        'Invoices': 'invoices',
        'Customers': 'customers',
        'Reports': 'reports',
        'Notifications': 'notifications',
        'Users': 'users',
        'System': 'system'
      };
      const key = titleMap[item.title] || item.title.toLowerCase();

      // Only keep if access is true
      return access[key] === true;
    })
    // Step 2: Filter sub-items
    .map(item => {
      if (item.subItems) {
        const filteredSubItems = item.subItems.filter(subItem => {
          // Check if this sub-item has specific access rules
          if (subAccess[subItem.title] !== undefined) {
            return subAccess[subItem.title] === true;
          }
          // If no specific rule, allow it (for non-sensitive items)
          return true;
        });

        // Return item with filtered subItems
        return {
          ...item,
          subItems: filteredSubItems
        };
      }
      return item;
    })
    // Step 3: Remove parent items that have no accessible sub-items
    .filter(item => {
      // If item has subItems but all were filtered out, remove the parent
      if (item.subItems && item.subItems.length === 0) {
        return false;
      }
      return true;
    });

  // For debugging - you can log what each role sees
  console.log(`🔍 ${userRole} sees:`, filteredData.map(item => item.title));

  return filteredData;
};

export default sidebarData;