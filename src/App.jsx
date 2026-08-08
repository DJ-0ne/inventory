// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./pages/auth/ProtectedRoute";
import Login from "./pages/auth/Login";
import Layout from "./layout/Layout";

// Import all pages
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/inventory/Products";
import AddProduct from "./pages/inventory/AddProduct";
import BulkImport from "./pages/inventory/BulkImport";
import StockAdjustment from "./pages/inventory/StockAdjustment";
import LowStock from "./pages/inventory/LowStock";
import OutOfStock from "./pages/inventory/OutOfStock";
import Warehouses from "./pages/warehouses/Warehouses";
import AddWarehouse from "./pages/warehouses/AddWarehouse";
import StockTransfers from "./pages/warehouses/StockTransfers";
import PurchaseOrders from "./pages/purchases/PurchaseOrders";
import CreatePurchaseOrder from "./pages/purchases/CreatePurchaseOrder";
import ReceiveStock from "./pages/purchases/ReceiveStock";
import Suppliers from "./pages/purchases/Suppliers";
import POS from "./pages/sales/POS";
import AllSales from "./pages/sales/AllSales";
import SalesReturns from "./pages/sales/SalesReturns";
import AllInvoices from "./pages/invoices/AllInvoices";
import CreateInvoice from "./pages/invoices/CreateInvoice";
import InvoiceSettings from "./pages/invoices/InvoiceSettings";
import AllCustomers from "./pages/customers/AllCustomers";
import AddCustomer from "./pages/customers/AddCustomer";
import PurchaseHistory from "./pages/customers/PurchaseHistory";
import SalesReports from "./pages/reports/SalesReports";
import DailySales from "./pages/reports/DailySales";
import PeriodReports from "./pages/reports/PeriodReports";
import TopProducts from "./pages/reports/TopProducts";
import RevenueTracking from "./pages/reports/RevenueTracking";
import ProfitMargin from "./pages/reports/ProfitMargin";
import SupplierPerformance from "./pages/reports/SupplierPerformance";
import LowStockAlerts from "./pages/notifications/LowStockAlerts";
import ReorderSuggestions from "./pages/notifications/ReorderSuggestions";
import ExpiryAlerts from "./pages/notifications/ExpiryAlerts";
import DailySummary from "./pages/notifications/DailySummary";
import SystemEvents from "./pages/notifications/SystemEvents";
import AllUsers from "./pages/users/AllUsers";
import AddUser from "./pages/users/AddUser";
import RolesPermissions from "./pages/users/RolesPermissions";
import AuditTrail from "./pages/users/AuditTrail";
import StoreConfig from "./pages/system/StoreConfig";
import Backup from "./pages/system/Backup";
import Restore from "./pages/system/Restore";
import APISettings from "./pages/system/APISettings";
import ExportData from "./pages/system/ExportData";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ===== PUBLIC ROUTES ===== */}
          {/* ✅ Login page - accessible without authentication */}
          <Route path="/" element={<Login />} />

          {/* ===== PROTECTED ROUTES ===== */}
          {/* Root path - redirect to dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Dashboard - All Roles */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ===== INVENTORY ROUTES ===== */}
          {/* All Roles can view products */}
          <Route
            path="/inventory/products"
            element={
              <ProtectedRoute>
                <Layout>
                  <Products />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Only */}
          <Route
            path="/inventory/add-product"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <AddProduct />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/bulk-import"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <BulkImport />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin & Warehouse Staff */}
          <Route
            path="/inventory/stock-adjustment"
            element={
              <ProtectedRoute
                allowedRoles={["Administrator", "Warehouse Staff"]}
              >
                <Layout>
                  <StockAdjustment />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* All Roles */}
          <Route
            path="/inventory/low-stock"
            element={
              <ProtectedRoute>
                <Layout>
                  <LowStock />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin & Warehouse Staff */}
          <Route
            path="/inventory/out-of-stock"
            element={
              <ProtectedRoute
                allowedRoles={["Administrator", "Warehouse Staff"]}
              >
                <Layout>
                  <OutOfStock />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ===== WAREHOUSE ROUTES ===== */}
          {/* Admin & Warehouse Staff */}
          <Route
            path="/warehouses/all"
            element={
              <ProtectedRoute
                allowedRoles={["Administrator", "Warehouse Staff"]}
              >
                <Layout>
                  <Warehouses />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Only */}
          <Route
            path="/warehouses/add"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <AddWarehouse />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin & Warehouse Staff */}
          <Route
            path="/warehouses/transfers"
            element={
              <ProtectedRoute
                allowedRoles={["Administrator", "Warehouse Staff"]}
              >
                <Layout>
                  <StockTransfers />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ===== PURCHASE ROUTES ===== */}
          {/* Admin, Warehouse Staff & Procurement */}
          <Route
            path="/purchases/orders"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Administrator",
                  "Warehouse Staff",
                  "Procurement",
                ]}
              >
                <Layout>
                  <PurchaseOrders />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin & Procurement */}
          <Route
            path="/purchases/create"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Procurement"]}>
                <Layout>
                  <CreatePurchaseOrder />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin & Warehouse Staff */}
          <Route
            path="/purchases/receive"
            element={
              <ProtectedRoute
                allowedRoles={["Administrator", "Warehouse Staff"]}
              >
                <Layout>
                  <ReceiveStock />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin & Procurement */}
          <Route
            path="/purchases/suppliers"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Procurement"]}>
                <Layout>
                  <Suppliers />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ===== SALES ROUTES ===== */}
          {/* Admin & Sales Staff */}
          <Route
            path="/sales/pos"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Sales Staff"]}>
                <Layout>
                  <POS />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/all"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Sales Staff"]}>
                <Layout>
                  <AllSales />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/returns"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Sales Staff"]}>
                <Layout>
                  <SalesReturns />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ===== INVOICE ROUTES ===== */}
          {/* Admin & Sales Staff */}
          <Route
            path="/invoices/all"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Sales Staff"]}>
                <Layout>
                  <AllInvoices />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices/create"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Sales Staff"]}>
                <Layout>
                  <CreateInvoice />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Only */}
          <Route
            path="/invoices/settings"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <InvoiceSettings />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ===== CUSTOMER ROUTES ===== */}
          {/* Admin & Sales Staff */}
          <Route
            path="/customers/all"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Sales Staff"]}>
                <Layout>
                  <AllCustomers />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/add"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Sales Staff"]}>
                <Layout>
                  <AddCustomer />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/purchase-history"
            element={
              <ProtectedRoute allowedRoles={["Administrator", "Sales Staff"]}>
                <Layout>
                  <PurchaseHistory />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ===== REPORT ROUTES - Admin Only ===== */}
          <Route
            path="/reports/sales"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <SalesReports />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/daily"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <DailySales />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/period"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <PeriodReports />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/top-products"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <TopProducts />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/revenue"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <RevenueTracking />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/profit-margin"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <ProfitMargin />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/supplier-performance"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <SupplierPerformance />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ===== NOTIFICATION ROUTES ===== */}
          {/* All Roles */}
          <Route
            path="/notifications/low-stock"
            element={
              <ProtectedRoute>
                <Layout>
                  <LowStockAlerts />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin, Warehouse Staff & Procurement */}
          <Route
            path="/notifications/reorder"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Administrator",
                  "Warehouse Staff",
                  "Procurement",
                ]}
              >
                <Layout>
                  <ReorderSuggestions />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin & Warehouse Staff */}
          <Route
            path="/notifications/expiry"
            element={
              <ProtectedRoute
                allowedRoles={["Administrator", "Warehouse Staff"]}
              >
                <Layout>
                  <ExpiryAlerts />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Only */}
          <Route
            path="/notifications/daily-summary"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <DailySummary />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications/system-events"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <SystemEvents />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ===== USER ROUTES - Admin Only ===== */}
          <Route
            path="/users/all"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <AllUsers />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/add"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <AddUser />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/roles"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <RolesPermissions />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/audit"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <AuditTrail />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ===== SYSTEM ROUTES - Admin Only ===== */}
          <Route
            path="/system/store-config"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <StoreConfig />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/system/backup"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <Backup />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/system/restore"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <Restore />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/system/api"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <APISettings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/system/export"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <Layout>
                  <ExportData />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ===== CATCH ALL ===== */}
          {/* ✅ Redirect any unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
