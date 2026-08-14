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

//  ROLE-BASED ACCESS CONTROL
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
    inventory: true,
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
    inventory: true,
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

//  SUB-ITEM ACCESS CONTROL - EXACT MATCHES
const subItemAccess = {
  'Administrator': {
    'All Products': true,
    'Add Product': true,
    'Bulk Import': true,
    'Stock Adjustment': true,
    'Low Stock': true,
    'Out of Stock': true,
    'All Warehouses': true,
    'Add Warehouse': true,
    'Stock Transfers': true,
    'Purchase Orders': true,
    'Create Purchase Order': true,
    'Receive Stock': true,
    'Suppliers': true,
    'Point of Sale (POS)': true,
    'All Sales': true,
    'Sales Returns': true,
    'All Invoices': true,
    'Create Invoice': true,
    'Invoice Settings': true,
    'All Customers': true,
    'Add Customer': true,
    'Purchase History': true,
    'Sales Reports': true,
    'Daily Sales': true,
    'Weekly/Monthly/Yearly': true,
    'Top Selling Products': true,
    'Revenue Tracking': true,
    'Profit Margin': true,
    'Supplier Performance': true,
    'Low Stock Alerts': true,
    'Reorder Suggestions': true,
    'Expiry Alerts': true,
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
    'All Products': true,
    'Low Stock': true,
    'Point of Sale (POS)': true,
    'All Sales': true,
    'Sales Returns': true,
    'All Invoices': true,
    'Create Invoice': true,
    'All Customers': true,
    'Add Customer': true,
    'Purchase History': true,
    'Low Stock Alerts': true
  },
  'Warehouse Staff': {
    'All Products': true,
    'Stock Adjustment': true,
    'Low Stock': true,
    'Out of Stock': true,
    'All Warehouses': true,
    'Stock Transfers': true,
    'Purchase Orders': true,
    'Receive Stock': true,
    'Low Stock Alerts': true,
    'Reorder Suggestions': true,
    'Expiry Alerts': true
  },
  'Procurement': {
    'All Products': true,
    'Low Stock': true,
    'Purchase Orders': true,
    'Create Purchase Order': true,
    'Suppliers': true,
    'Low Stock Alerts': true,
    'Reorder Suggestions': true
  }
};

//  MAIN FILTERING FUNCTION
export const getSidebarData = (userRole) => {
  if (!userRole) return [];

  const normalizedRole = String(userRole).trim();

  const access = roleAccess[normalizedRole] || {};
  const subAccess = subItemAccess[normalizedRole] || {};

  if (!roleAccess[normalizedRole]) {
    console.warn(
      `⚠️ Unrecognized role "${userRole}". Available roles: ${Object.keys(roleAccess).join(', ')}`
    );
  }

  const filteredData = sidebarData
    .filter(item => {
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
      return access[key] === true;
    })
    .map(item => {
      if (item.subItems) {
        const filteredSubItems = item.subItems.filter(subItem => {
          // Check if this sub-item has specific access rules
          if (subAccess[subItem.title] !== undefined) {
            return subAccess[subItem.title] === true;
          }
          // Default: don't show if not explicitly allowed
          return false;
        });

        return {
          ...item,
          subItems: filteredSubItems
        };
      }
      return item;
    })
    .filter(item => {
      if (item.subItems && item.subItems.length === 0) {
        return false;
      }
      return true;
    });

  console.log(`🔍 ${userRole} sees:`, filteredData.map(item => item.title));
  return filteredData;
};

export default sidebarData;