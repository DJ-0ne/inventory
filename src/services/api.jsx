// src/services/api.jsx

// Mock data and API simulator for frontend development
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper to simulate API delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to simulate API response
const mockResponse = (data, error = null) => {
  if (error) {
    return Promise.reject({ response: { status: 400, data: error } });
  }
  return Promise.resolve({ data });
};

// Mock API handler
const mockApiCall = async (data, error = null) => {
  await delay();
  return mockResponse(data, error);
};

// ============ AUTH APIs ============
export const authAPI = {
  login: (credentials) => {
    // Mock login - accept any credentials
    const mockUser = {
      id: 1,
      name: "Admin User",
      email: credentials.email || "admin@example.com",
      role: "Administrator",
      token: "mock-jwt-token-12345",
    };
    localStorage.setItem("authToken", mockUser.token);
    localStorage.setItem("userData", JSON.stringify(mockUser));
    return mockApiCall(mockUser);
  },
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    return mockApiCall({ success: true });
  },
  register: (data) => mockApiCall({ id: Date.now(), ...data }),
  forgotPassword: (email) =>
    mockApiCall({ success: true, message: "Reset link sent to email" }),
  resetPassword: (token, password) => mockApiCall({ success: true }),
  getCurrentUser: () => {
    const userData = localStorage.getItem("userData");
    return mockApiCall(userData ? JSON.parse(userData) : null);
  },
  updateProfile: (data) => mockApiCall({ ...data, updated: true }),
  changePassword: (data) => mockApiCall({ success: true }),
};

// ============ DASHBOARD APIs ============
export const dashboardAPI = {
  getStats: () =>
    mockApiCall({
      totalRevenue: 124890,
      totalSales: 2847,
      totalProducts: 1423,
      lowStockItems: 42,
      revenueChange: 15.3,
      salesChange: 12.5,
      productsChange: 5.7,
      lowStockChange: 8.2,
    }),
  getRevenueData: () =>
    mockApiCall({
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Revenue 2025",
          data: [
            18500, 22000, 19500, 28000, 32000, 29000, 35000, 38000, 42000,
            40000, 45000, 48000,
          ],
        },
        {
          label: "Revenue 2024",
          data: [
            12000, 14000, 13500, 18000, 20000, 19000, 22000, 25000, 28000,
            26000, 30000, 32000,
          ],
        },
      ],
    }),
  getSalesData: () =>
    mockApiCall({
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      sales: [65, 78, 82, 95, 88, 92, 105],
      target: [70, 70, 70, 70, 70, 70, 70],
    }),
  getCategoryData: () =>
    mockApiCall({
      labels: ["Tools", "Paint", "Plumbing", "Electrical", "Wood", "Other"],
      data: [35, 20, 15, 12, 10, 8],
    }),
  getRecentOrders: () =>
    mockApiCall([
      {
        id: "INV-2026-001",
        customer: "John Doe",
        amount: "$245.00",
        status: "Completed",
        date: "2026-08-05",
        items: 3,
      },
      {
        id: "INV-2026-002",
        customer: "Jane Smith",
        amount: "$132.50",
        status: "Processing",
        date: "2026-08-05",
        items: 2,
      },
      {
        id: "INV-2026-003",
        customer: "Robert Johnson",
        amount: "$378.00",
        status: "Completed",
        date: "2026-08-04",
        items: 5,
      },
      {
        id: "INV-2026-004",
        customer: "Mary Williams",
        amount: "$56.00",
        status: "Refunded",
        date: "2026-08-04",
        items: 1,
      },
      {
        id: "INV-2026-005",
        customer: "Michael Brown",
        amount: "$92.50",
        status: "Pending",
        date: "2026-08-03",
        items: 2,
      },
    ]),
  getLowStockItems: () =>
    mockApiCall([
      {
        product: "Screwdriver Set",
        sku: "TOOL-001",
        stock: 5,
        threshold: 10,
        reorder: 15,
      },
      {
        product: "Paint Roller",
        sku: "PAINT-003",
        stock: 8,
        threshold: 15,
        reorder: 20,
      },
      {
        product: "Measuring Tape",
        sku: "TOOL-012",
        stock: 3,
        threshold: 20,
        reorder: 25,
      },
      {
        product: "Hammer",
        sku: "TOOL-005",
        stock: 12,
        threshold: 25,
        reorder: 30,
      },
      {
        product: "Drill Bits",
        sku: "TOOL-018",
        stock: 7,
        threshold: 15,
        reorder: 20,
      },
    ]),
  getQuickStats: () =>
    mockApiCall({
      todaySales: 8245,
      todayOrders: 67,
      avgOrderValue: 123.06,
      conversionRate: 3.8,
    }),
};

// ============ INVENTORY APIs ============
export const inventoryAPI = {
  getProducts: (params) => {
    const mockProducts = [
      {
        id: 1,
        name: "Screwdriver Set",
        sku: "TOOL-001",
        category: "Tools",
        price: 24.99,
        stock: 45,
        threshold: 10,
        status: "In Stock",
      },
      {
        id: 2,
        name: "Paint Roller",
        sku: "PAINT-003",
        category: "Paint",
        price: 8.5,
        stock: 28,
        threshold: 15,
        status: "In Stock",
      },
      {
        id: 3,
        name: "Measuring Tape",
        sku: "TOOL-012",
        category: "Tools",
        price: 12.99,
        stock: 3,
        threshold: 20,
        status: "Low Stock",
      },
      {
        id: 4,
        name: "Hammer",
        sku: "TOOL-005",
        category: "Tools",
        price: 15.99,
        stock: 12,
        threshold: 25,
        status: "Low Stock",
      },
      {
        id: 5,
        name: "Drill Bits Set",
        sku: "TOOL-018",
        category: "Tools",
        price: 29.99,
        stock: 7,
        threshold: 15,
        status: "Low Stock",
      },
      {
        id: 6,
        name: "Safety Gloves",
        sku: "SAFE-002",
        category: "Safety",
        price: 4.99,
        stock: 2,
        threshold: 10,
        status: "Out of Stock",
      },
      {
        id: 7,
        name: "Electrical Tape",
        sku: "ELEC-007",
        category: "Electrical",
        price: 3.99,
        stock: 14,
        threshold: 20,
        status: "Low Stock",
      },
      {
        id: 8,
        name: "Wood Glue",
        sku: "WOOD-004",
        category: "Wood",
        price: 5.99,
        stock: 6,
        threshold: 10,
        status: "Low Stock",
      },
    ];
    return mockApiCall(mockProducts);
  },
  getProduct: (id) =>
    mockApiCall({
      id,
      name: "Screwdriver Set",
      sku: "TOOL-001",
      category: "Tools",
      price: 24.99,
      stock: 45,
    }),
  createProduct: (data) => mockApiCall({ id: Date.now(), ...data }),
  updateProduct: (id, data) => mockApiCall({ id, ...data, updated: true }),
  deleteProduct: (id) => mockApiCall({ success: true }),
  bulkImport: (data) =>
    mockApiCall({ success: true, imported: data.length || 10 }),
  bulkExport: (params) =>
    mockApiCall(new Blob(["Mock CSV Data"], { type: "text/csv" })),
  getStockAdjustments: (params) =>
    mockApiCall([
      {
        id: 1,
        product: "Screwdriver Set",
        type: "Addition",
        quantity: 20,
        date: "2026-08-05",
        reason: "Restock",
      },
      {
        id: 2,
        product: "Measuring Tape",
        type: "Subtraction",
        quantity: 5,
        date: "2026-08-04",
        reason: "Damaged",
      },
    ]),
  createStockAdjustment: (data) => mockApiCall({ id: Date.now(), ...data }),
  getLowStock: (params) =>
    mockApiCall([
      { product: "Measuring Tape", sku: "TOOL-012", stock: 3, threshold: 20 },
      { product: "Hammer", sku: "TOOL-005", stock: 12, threshold: 25 },
    ]),
  getOutOfStock: (params) =>
    mockApiCall([
      { product: "Safety Gloves", sku: "SAFE-002", stock: 0, threshold: 10 },
    ]),
  updateStock: (id, data) => mockApiCall({ id, ...data, updated: true }),
  getCategories: () =>
    mockApiCall([
      { id: 1, name: "Tools", count: 45 },
      { id: 2, name: "Paint", count: 28 },
      { id: 3, name: "Electrical", count: 14 },
      { id: 4, name: "Wood", count: 6 },
    ]),
  createCategory: (data) => mockApiCall({ id: Date.now(), ...data }),
  updateCategory: (id, data) => mockApiCall({ id, ...data, updated: true }),
  deleteCategory: (id) => mockApiCall({ success: true }),
};

// ============ WAREHOUSE APIs ============
export const warehouseAPI = {
  getWarehouses: () =>
    mockApiCall([
      {
        id: 1,
        name: "Warehouse A",
        location: "New York",
        capacity: 1000,
        used: 750,
        status: "Active",
      },
      {
        id: 2,
        name: "Warehouse B",
        location: "Los Angeles",
        capacity: 800,
        used: 420,
        status: "Active",
      },
      {
        id: 3,
        name: "Warehouse C",
        location: "Chicago",
        capacity: 600,
        used: 580,
        status: "Active",
      },
    ]),
  getWarehouse: (id) =>
    mockApiCall({
      id,
      name: "Warehouse A",
      location: "New York",
      capacity: 1000,
      used: 750,
    }),
  createWarehouse: (data) => mockApiCall({ id: Date.now(), ...data }),
  updateWarehouse: (id, data) => mockApiCall({ id, ...data, updated: true }),
  deleteWarehouse: (id) => mockApiCall({ success: true }),
  getStockTransfers: (params) =>
    mockApiCall([
      {
        id: 1,
        product: "Screwdriver Set",
        from: "Warehouse A",
        to: "Warehouse B",
        quantity: 50,
        status: "Completed",
        date: "2026-08-05",
      },
      {
        id: 2,
        product: "Measuring Tape",
        from: "Warehouse B",
        to: "Warehouse C",
        quantity: 30,
        status: "Pending",
        date: "2026-08-04",
      },
    ]),
  createStockTransfer: (data) =>
    mockApiCall({ id: Date.now(), ...data, status: "Pending" }),
  updateStockTransfer: (id, data) =>
    mockApiCall({ id, ...data, updated: true }),
  approveTransfer: (id) =>
    mockApiCall({ success: true, message: "Transfer approved" }),
  rejectTransfer: (id) =>
    mockApiCall({ success: true, message: "Transfer rejected" }),
  getTransferHistory: (id) =>
    mockApiCall([
      { id: 1, action: "Created", date: "2026-08-05", user: "Admin" },
      { id: 2, action: "Approved", date: "2026-08-06", user: "Manager" },
    ]),
};

// ============ PURCHASE APIs ============
export const purchaseAPI = {
  getPurchaseOrders: (params) =>
    mockApiCall([
      {
        id: "PO-001",
        supplier: "ToolCo Ltd",
        total: 4500,
        status: "Received",
        date: "2026-08-05",
        items: 12,
      },
      {
        id: "PO-002",
        supplier: "ColorMaster Inc",
        total: 2800,
        status: "Pending",
        date: "2026-08-04",
        items: 8,
      },
      {
        id: "PO-003",
        supplier: "BuildRight Supplies",
        total: 6200,
        status: "Processing",
        date: "2026-08-03",
        items: 15,
      },
    ]),
  getPurchaseOrder: (id) =>
    mockApiCall({
      id,
      supplier: "ToolCo Ltd",
      total: 4500,
      status: "Received",
      date: "2026-08-05",
    }),
  createPurchaseOrder: (data) =>
    mockApiCall({ id: `PO-${Date.now()}`, ...data, status: "Pending" }),
  updatePurchaseOrder: (id, data) =>
    mockApiCall({ id, ...data, updated: true }),
  deletePurchaseOrder: (id) => mockApiCall({ success: true }),
  approvePurchaseOrder: (id) =>
    mockApiCall({ success: true, message: "Order approved" }),
  rejectPurchaseOrder: (id) =>
    mockApiCall({ success: true, message: "Order rejected" }),
  receiveStock: (id, data) =>
    mockApiCall({ success: true, received: data.items || 10 }),
  getReceiveHistory: (id) =>
    mockApiCall([
      { id: 1, date: "2026-08-05", items: 12, status: "Completed" },
    ]),
  getSuppliers: (params) =>
    mockApiCall([
      {
        id: 1,
        name: "ToolCo Ltd",
        email: "info@toolco.com",
        phone: "+1 (555) 123-4567",
        status: "Active",
        products: 45,
      },
      {
        id: 2,
        name: "ColorMaster Inc",
        email: "sales@colormaster.com",
        phone: "+1 (555) 234-5678",
        status: "Active",
        products: 32,
      },
      {
        id: 3,
        name: "BuildRight Supplies",
        email: "info@buildright.com",
        phone: "+1 (555) 345-6789",
        status: "Active",
        products: 28,
      },
    ]),
  getSupplier: (id) =>
    mockApiCall({
      id,
      name: "ToolCo Ltd",
      email: "info@toolco.com",
      phone: "+1 (555) 123-4567",
    }),
  createSupplier: (data) => mockApiCall({ id: Date.now(), ...data }),
  updateSupplier: (id, data) => mockApiCall({ id, ...data, updated: true }),
  deleteSupplier: (id) => mockApiCall({ success: true }),
  getSupplierPerformance: (id) =>
    mockApiCall({
      onTimeDelivery: 95,
      qualityScore: 4.8,
      responseTime: 2.3,
      orderAccuracy: 98,
    }),
};

// ============ SALES APIs ============
export const salesAPI = {
  createPOSOrder: (data) =>
    mockApiCall({ id: `POS-${Date.now()}`, ...data, status: "Completed" }),
  getPOSProducts: (params) =>
    mockApiCall([
      {
        id: 1,
        name: "Screwdriver Set",
        sku: "TOOL-001",
        price: 24.99,
        stock: 45,
      },
      { id: 2, name: "Paint Roller", sku: "PAINT-003", price: 8.5, stock: 28 },
      {
        id: 3,
        name: "Measuring Tape",
        sku: "TOOL-012",
        price: 12.99,
        stock: 3,
      },
    ]),
  getPOSCart: () => mockApiCall({ items: [], total: 0 }),
  updatePOSCart: (data) => mockApiCall({ ...data, updated: true }),
  clearPOSCart: () => mockApiCall({ success: true }),
  getSales: (params) =>
    mockApiCall([
      {
        id: "SALE-001",
        customer: "John Doe",
        total: 245.0,
        status: "Completed",
        date: "2026-08-05",
        items: 3,
      },
      {
        id: "SALE-002",
        customer: "Jane Smith",
        total: 132.5,
        status: "Processing",
        date: "2026-08-05",
        items: 2,
      },
      {
        id: "SALE-003",
        customer: "Robert Johnson",
        total: 378.0,
        status: "Completed",
        date: "2026-08-04",
        items: 5,
      },
    ]),
  getSale: (id) =>
    mockApiCall({
      id,
      customer: "John Doe",
      total: 245.0,
      status: "Completed",
      date: "2026-08-05",
    }),
  updateSale: (id, data) => mockApiCall({ id, ...data, updated: true }),
  deleteSale: (id) => mockApiCall({ success: true }),
  getSalesReturns: (params) =>
    mockApiCall([
      {
        id: "RET-001",
        order: "SALE-001",
        customer: "John Doe",
        amount: 45.0,
        reason: "Damaged",
        status: "Approved",
        date: "2026-08-05",
      },
    ]),
  createReturn: (data) =>
    mockApiCall({ id: `RET-${Date.now()}`, ...data, status: "Pending" }),
  updateReturn: (id, data) => mockApiCall({ id, ...data, updated: true }),
  approveReturn: (id) => mockApiCall({ success: true }),
  rejectReturn: (id) => mockApiCall({ success: true }),
};

// ============ INVOICE APIs ============
export const invoiceAPI = {
  getInvoices: (params) =>
    mockApiCall([
      {
        id: "INV-001",
        customer: "John Doe",
        amount: 245.0,
        status: "Paid",
        date: "2026-08-05",
      },
      {
        id: "INV-002",
        customer: "Jane Smith",
        amount: 132.5,
        status: "Unpaid",
        date: "2026-08-05",
      },
      {
        id: "INV-003",
        customer: "Robert Johnson",
        amount: 378.0,
        status: "Paid",
        date: "2026-08-04",
      },
    ]),
  getInvoice: (id) =>
    mockApiCall({
      id,
      customer: "John Doe",
      amount: 245.0,
      status: "Paid",
      date: "2026-08-05",
    }),
  createInvoice: (data) =>
    mockApiCall({ id: `INV-${Date.now()}`, ...data, status: "Unpaid" }),
  updateInvoice: (id, data) => mockApiCall({ id, ...data, updated: true }),
  deleteInvoice: (id) => mockApiCall({ success: true }),
  getInvoiceSettings: () =>
    mockApiCall({
      prefix: "INV-",
      nextNumber: 100,
      currency: "USD",
      taxRate: 8.5,
      terms: "Net 30",
    }),
  updateInvoiceSettings: (data) => mockApiCall({ ...data, updated: true }),
  generateInvoicePDF: (id) =>
    mockApiCall(new Blob(["Mock PDF"], { type: "application/pdf" })),
  sendInvoiceEmail: (id) =>
    mockApiCall({ success: true, message: "Email sent" }),
  markAsPaid: (id) => mockApiCall({ success: true }),
};

// ============ CUSTOMER APIs ============
export const customerAPI = {
  getCustomers: (params) =>
    mockApiCall([
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "+1 (555) 123-4567",
        totalSpent: 1245.0,
        orders: 8,
        status: "Active",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@email.com",
        phone: "+1 (555) 234-5678",
        totalSpent: 875.5,
        orders: 5,
        status: "Active",
      },
      {
        id: 3,
        name: "Robert Johnson",
        email: "robert.j@email.com",
        phone: "+1 (555) 345-6789",
        totalSpent: 2340.0,
        orders: 12,
        status: "Active",
      },
    ]),
  getCustomer: (id) =>
    mockApiCall({
      id,
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
    }),
  createCustomer: (data) => mockApiCall({ id: Date.now(), ...data }),
  updateCustomer: (id, data) => mockApiCall({ id, ...data, updated: true }),
  deleteCustomer: (id) => mockApiCall({ success: true }),
  getPurchaseHistory: (id, params) =>
    mockApiCall([
      { id: "SALE-001", date: "2026-08-05", total: 245.0, items: 3 },
      { id: "SALE-002", date: "2026-07-28", total: 132.5, items: 2 },
    ]),
  getCustomerStats: (id) =>
    mockApiCall({
      totalSpent: 1245.0,
      totalOrders: 8,
      averageOrder: 155.63,
      lastOrder: "2026-08-05",
    }),
  searchCustomers: (query) =>
    mockApiCall([{ id: 1, name: "John Doe", email: "john.doe@email.com" }]),
};

// ============ REPORT APIs ============
export const reportAPI = {
  getSalesReports: (params) =>
    mockApiCall({
      total: 2847,
      revenue: 124890,
      average: 43.85,
      data: [
        { month: "Jan", sales: 18500 },
        { month: "Feb", sales: 22000 },
        { month: "Mar", sales: 19500 },
      ],
    }),
  getDailySales: (params) =>
    mockApiCall({
      date: "2026-08-05",
      total: 8245,
      orders: 67,
      average: 123.06,
      hourlyData: [5, 8, 12, 15, 18, 14, 16, 20, 22, 18, 10, 6],
    }),
  getPeriodReports: (params) =>
    mockApiCall({
      period: "Weekly",
      data: [
        { period: "Week 1", sales: 32450, orders: 245 },
        { period: "Week 2", sales: 28900, orders: 210 },
        { period: "Week 3", sales: 35600, orders: 278 },
      ],
    }),
  getTopProducts: (params) =>
    mockApiCall([
      { name: "Screwdriver Set", units: 45, revenue: 450.0 },
      { name: "Paint Roller", units: 38, revenue: 570.0 },
      { name: "Measuring Tape", units: 32, revenue: 224.0 },
    ]),
  getRevenueTracking: (params) =>
    mockApiCall({
      current: 124890,
      previous: 98200,
      growth: 27.2,
      monthlyData: [18500, 22000, 19500, 28000, 32000, 29000],
    }),
  getProfitMargin: (params) =>
    mockApiCall({
      revenue: 124890,
      costs: 82427,
      profit: 42463,
      margin: 34.0,
      data: [
        { category: "Tools", revenue: 45000, cost: 27000 },
        { category: "Paint", revenue: 28000, cost: 18200 },
      ],
    }),
  getSupplierPerformance: (params) =>
    mockApiCall([
      {
        name: "ToolCo Ltd",
        orders: 45,
        onTime: 95,
        quality: 4.8,
        response: 2.3,
      },
      {
        name: "ColorMaster Inc",
        orders: 32,
        onTime: 88,
        quality: 4.2,
        response: 3.1,
      },
    ]),
  exportReport: (type, params) =>
    mockApiCall(new Blob(["Mock Report"], { type: "text/csv" })),
  getReportAnalytics: () =>
    mockApiCall({
      totalReports: 156,
      mostViewed: "Sales Reports",
      averageExportTime: "45s",
    }),
};

// ============ NOTIFICATION APIs ============
export const notificationAPI = {
  getLowStockAlerts: (params) =>
    mockApiCall([
      {
        id: 1,
        product: "Screwdriver Set",
        sku: "TOOL-001",
        stock: 5,
        threshold: 10,
        status: "Critical",
      },
      {
        id: 2,
        product: "Paint Roller",
        sku: "PAINT-003",
        stock: 8,
        threshold: 15,
        status: "Warning",
      },
      {
        id: 3,
        product: "Measuring Tape",
        sku: "TOOL-012",
        stock: 3,
        threshold: 20,
        status: "Critical",
      },
    ]),
  getReorderSuggestions: (params) =>
    mockApiCall([
      {
        id: 1,
        product: "Screwdriver Set",
        currentStock: 5,
        reorderPoint: 10,
        recommendedQty: 20,
        priority: "High",
      },
      {
        id: 2,
        product: "Measuring Tape",
        currentStock: 3,
        reorderPoint: 20,
        recommendedQty: 25,
        priority: "High",
      },
    ]),
  getExpiryAlerts: (params) =>
    mockApiCall([
      {
        id: 1,
        product: "Paint - White Gloss",
        batch: "B-2024-001",
        expiryDate: "2026-09-15",
        daysRemaining: 41,
        status: "Warning",
      },
      {
        id: 2,
        product: "Safety Gloves",
        batch: "B-2024-008",
        expiryDate: "2026-08-20",
        daysRemaining: 15,
        status: "Critical",
      },
    ]),
  getDailySummary: (params) =>
    mockApiCall({
      date: "2026-08-05",
      totalSales: 12500.5,
      totalOrders: 142,
      totalRevenue: 14250.75,
      averageOrderValue: 100.36,
      topProducts: [
        { name: "Screwdriver Set", units: 45, revenue: 450.0 },
        { name: "Paint Roller", units: 38, revenue: 570.0 },
      ],
      salesByHour: {
        labels: [
          "8am",
          "9am",
          "10am",
          "11am",
          "12pm",
          "1pm",
          "2pm",
          "3pm",
          "4pm",
          "5pm",
          "6pm",
          "7pm",
        ],
        data: [5, 8, 12, 15, 18, 14, 16, 20, 22, 18, 10, 6],
      },
      categoryBreakdown: {
        labels: ["Tools", "Paint", "Plumbing", "Electrical", "Wood", "Other"],
        data: [35, 20, 15, 12, 10, 8],
      },
      metrics: {
        conversionRate: 3.8,
        customerSatisfaction: 4.7,
        orderFulfillment: 97.5,
        returnRate: 2.3,
      },
    }),
  getSystemEvents: (params) =>
    mockApiCall([
      {
        id: 1,
        eventType: "Login",
        user: "john.doe@email.com",
        timestamp: "2026-08-05 09:15:23",
        severity: "Info",
        description: "User logged in",
        module: "Authentication",
        ipAddress: "192.168.1.1",
      },
      {
        id: 2,
        eventType: "Backup",
        user: "system",
        timestamp: "2026-08-05 01:00:00",
        severity: "Info",
        description: "System backup completed",
        module: "System",
        ipAddress: "localhost",
      },
      {
        id: 3,
        eventType: "Update",
        user: "admin@email.com",
        timestamp: "2026-08-04 14:30:45",
        severity: "Warning",
        description: "Product inventory updated",
        module: "Inventory",
        ipAddress: "192.168.1.15",
      },
    ]),
  updateAlertStatus: (id, status) => mockApiCall({ id, status, updated: true }),
  dismissAlert: (id) => mockApiCall({ success: true }),
  markAllAsRead: () => mockApiCall({ success: true }),
  getNotificationCount: () => mockApiCall({ count: 5 }),
  getRecentNotifications: () =>
    mockApiCall([
      {
        id: 1,
        message: "Low stock alert: Screwdriver Set",
        type: "warning",
        read: false,
        timestamp: "2026-08-05 09:15:23",
      },
      {
        id: 2,
        message: "New order received",
        type: "info",
        read: false,
        timestamp: "2026-08-05 08:30:15",
      },
    ]),
};

// ============ USER MANAGEMENT APIs ============
export const userAPI = {
  getUsers: (params) =>
    mockApiCall([
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "+1 (555) 123-4567",
        role: "Administrator",
        status: "Active",
        department: "IT",
        lastLogin: "2026-08-05 09:15:23",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@email.com",
        phone: "+1 (555) 234-5678",
        role: "Manager",
        status: "Active",
        department: "Operations",
        lastLogin: "2026-08-05 08:30:15",
      },
      {
        id: 3,
        name: "Robert Johnson",
        email: "robert.j@email.com",
        phone: "+1 (555) 345-6789",
        role: "Staff",
        status: "Active",
        department: "Sales",
        lastLogin: "2026-08-04 14:45:30",
      },
    ]),
  getUser: (id) =>
    mockApiCall({
      id,
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
      role: "Administrator",
    }),
  createUser: (data) =>
    mockApiCall({ id: Date.now(), ...data, status: "Active" }),
  updateUser: (id, data) => mockApiCall({ id, ...data, updated: true }),
  deleteUser: (id) => mockApiCall({ success: true }),
  updateUserStatus: (id, status) => mockApiCall({ id, status, updated: true }),
  getRoles: () =>
    mockApiCall([
      {
        id: 1,
        name: "Administrator",
        description: "Full system access",
        permissions: ["All Permissions"],
        userCount: 3,
      },
      {
        id: 2,
        name: "Manager",
        description: "Manage inventory and reports",
        permissions: ["Read", "Write", "Export"],
        userCount: 7,
      },
      {
        id: 3,
        name: "Supervisor",
        description: "Supervise operations",
        permissions: ["Read", "Write"],
        userCount: 12,
      },
      {
        id: 4,
        name: "Staff",
        description: "Basic operations",
        permissions: ["Read"],
        userCount: 25,
      },
      {
        id: 5,
        name: "Viewer",
        description: "View only access",
        permissions: ["View"],
        userCount: 5,
      },
    ]),
  getRole: (id) =>
    mockApiCall({
      id,
      name: "Administrator",
      description: "Full system access",
    }),
  createRole: (data) => mockApiCall({ id: Date.now(), ...data }),
  updateRole: (id, data) => mockApiCall({ id, ...data, updated: true }),
  deleteRole: (id) => mockApiCall({ success: true }),
  getPermissions: () =>
    mockApiCall([
      "View",
      "Read",
      "Write",
      "Export",
      "Import",
      "Delete",
      "Manage Users",
      "Manage System",
    ]),
  updatePermissions: (data) => mockApiCall({ ...data, updated: true }),
  getRolePermissions: (id) => mockApiCall(["Read", "Write", "Export"]),
  getAuditTrail: (params) =>
    mockApiCall([
      {
        id: 1,
        action: "Login",
        user: "john.doe@email.com",
        timestamp: "2026-08-05 09:15:23",
        details: "User logged in",
        ip: "192.168.1.1",
      },
      {
        id: 2,
        action: "Update",
        user: "jane.smith@email.com",
        timestamp: "2026-08-05 08:30:15",
        details: "Product updated",
        ip: "192.168.1.15",
      },
    ]),
  getAuditLog: (id) =>
    mockApiCall({
      id,
      action: "Login",
      user: "john.doe@email.com",
      timestamp: "2026-08-05 09:15:23",
    }),
  exportAuditLog: (params) =>
    mockApiCall(new Blob(["Mock Audit Log"], { type: "text/csv" })),
};

// ============ SYSTEM APIs ============
export const systemAPI = {
  getStoreConfig: () =>
    mockApiCall({
      storeName: "Inventory Pro Store",
      storeEmail: "store@inventorypro.com",
      storePhone: "+1 (555) 123-4567",
      storeAddress: "123 Main Street, Suite 100, New York, NY 10001",
      storeWebsite: "https://inventorypro.com",
      timezone: "America/New_York",
      currency: "USD",
      currencySymbol: "$",
      taxRate: 8.5,
      shippingCost: 5.99,
      freeShippingThreshold: 50,
      defaultPaymentMethod: "Credit Card",
      invoicePrefix: "INV-",
      orderPrefix: "ORD-",
      lowStockThreshold: 10,
      enableNotifications: true,
      enableMultiCurrency: false,
      enableMultiWarehouse: true,
    }),
  updateStoreConfig: (data) => mockApiCall({ ...data, updated: true }),
  resetStoreConfig: () => mockApiCall({ success: true }),
  createBackup: (data) =>
    mockApiCall({
      success: true,
      id: Date.now(),
      filename: `backup_${new Date().toISOString()}.sql`,
    }),
  getBackups: (params) =>
    mockApiCall([
      {
        id: 1,
        filename: "backup_2026-08-05_01-00-00.sql",
        size: "245.3 MB",
        createdAt: "2026-08-05 01:00:00",
        type: "Full",
        status: "Completed",
      },
      {
        id: 2,
        filename: "backup_2026-08-04_01-00-00.sql",
        size: "238.7 MB",
        createdAt: "2026-08-04 01:00:00",
        type: "Full",
        status: "Completed",
      },
      {
        id: 3,
        filename: "backup_2026-08-03_01-00-00.sql",
        size: "241.2 MB",
        createdAt: "2026-08-03 01:00:00",
        type: "Full",
        status: "Completed",
      },
    ]),
  restoreBackup: (id) =>
    mockApiCall({ success: true, message: "Restore initiated" }),
  deleteBackup: (id) => mockApiCall({ success: true }),
  downloadBackup: (id) =>
    mockApiCall(new Blob(["Mock Backup"], { type: "application/sql" })),
  getAPISettings: () =>
    mockApiCall({
      apiKey: "", // Removed hardcoded key - user must enter their own
      apiSecret: "", // Removed hardcoded secret - user must enter their own
      webhookUrl: "https://your-webhook-url.com/webhook",
      rateLimit: 100,
      allowedIPs: "192.168.1.0/24, 10.0.0.0/8",
      enableLogging: true,
      version: "v1",
      environment: "production",
    }),
  updateAPISettings: (data) => mockApiCall({ ...data, updated: true }),
  regenerateAPIKey: () =>
    mockApiCall({ apiKey: "new-api-key-12345", regenerated: true }),
  exportData: (params) =>
    mockApiCall(new Blob(["Mock Export Data"], { type: "text/csv" })),
  getExportHistory: (params) =>
    mockApiCall([
      {
        id: 1,
        filename: "sales_data_2026-08-01.csv",
        type: "CSV",
        size: "2.4 MB",
        date: "2026-08-01 14:30:00",
        status: "Completed",
      },
      {
        id: 2,
        filename: "inventory_export_2026-07-31.xlsx",
        type: "Excel",
        size: "5.8 MB",
        date: "2026-07-31 10:15:00",
        status: "Completed",
      },
    ]),
  deleteExport: (id) => mockApiCall({ success: true }),
  downloadExport: (id) =>
    mockApiCall(new Blob(["Mock Export"], { type: "text/csv" })),
};

// ============ LOGOUT API ============
export const logoutAPI = {
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("refreshToken");
    window.location.href = "/";
    return Promise.resolve({ success: true });
  },
};

// Default export with all APIs
export default {
  authAPI,
  dashboardAPI,
  inventoryAPI,
  warehouseAPI,
  purchaseAPI,
  salesAPI,
  invoiceAPI,
  customerAPI,
  reportAPI,
  notificationAPI,
  userAPI,
  systemAPI,
  logoutAPI,
};
