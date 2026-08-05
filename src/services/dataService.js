// src/services/dataService.js

class DataService {
  constructor() {
    // Initialize data stores
    this.products = JSON.parse(localStorage.getItem('products') || '[]');
    this.orders = JSON.parse(localStorage.getItem('orders') || '[]');
    this.customers = JSON.parse(localStorage.getItem('customers') || '[]');
    this.users = JSON.parse(localStorage.getItem('users') || '[]');
    this.suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
    this.purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');
    this.listeners = {
      products: [],
      orders: [],
      customers: [],
      users: [],
      suppliers: [],
      purchaseOrders: []
    };
  }

  // Subscribe to data changes
  subscribe(collection, callback) {
    if (!this.listeners[collection]) {
      this.listeners[collection] = [];
    }
    this.listeners[collection].push(callback);
    return () => {
      this.listeners[collection] = this.listeners[collection].filter(cb => cb !== callback);
    };
  }

  // Notify listeners
  notify(collection) {
    if (this.listeners[collection]) {
      this.listeners[collection].forEach(callback => callback());
    }
  }

  // ============ PRODUCTS ============
  getProducts() { 
    return [...this.products]; 
  }
  
  getProduct(id) { 
    return this.products.find(p => p.id === id); 
  }
  
  addProduct(product) {
    const newProduct = {
      ...product,
      id: product.id || Date.now(),
      createdAt: new Date().toISOString()
    };
    this.products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(this.products));
    this.notify('products');
    return newProduct;
  }
  
  updateProduct(id, updates) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updates };
      localStorage.setItem('products', JSON.stringify(this.products));
      this.notify('products');
      return this.products[index];
    }
    return null;
  }
  
  deleteProduct(id) {
    this.products = this.products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(this.products));
    this.notify('products');
  }

  // ============ ORDERS ============
  getOrders() { 
    return [...this.orders]; 
  }
  
  getOrder(id) {
    return this.orders.find(o => o.id === id);
  }
  
  addOrder(order) {
    const newOrder = {
      ...order,
      id: order.id || `INV-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString()
    };
    this.orders.unshift(newOrder);
    localStorage.setItem('orders', JSON.stringify(this.orders));
    this.notify('orders');
    return newOrder;
  }
  
  updateOrderStatus(id, status) {
    const order = this.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      localStorage.setItem('orders', JSON.stringify(this.orders));
      this.notify('orders');
      return order;
    }
    return null;
  }

  // ============ CUSTOMERS ============
  getCustomers() { 
    return [...this.customers]; 
  }
  
  getCustomer(id) {
    return this.customers.find(c => c.id === id);
  }
  
  addCustomer(customer) {
    const newCustomer = {
      ...customer,
      id: customer.id || Date.now(),
      createdAt: new Date().toISOString()
    };
    this.customers.push(newCustomer);
    localStorage.setItem('customers', JSON.stringify(this.customers));
    this.notify('customers');
    return newCustomer;
  }
  
  updateCustomer(id, updates) {
    const index = this.customers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.customers[index] = { ...this.customers[index], ...updates };
      localStorage.setItem('customers', JSON.stringify(this.customers));
      this.notify('customers');
      return this.customers[index];
    }
    return null;
  }

  // ============ USERS ============
  getUsers() { 
    return [...this.users]; 
  }
  
  getUser(id) {
    return this.users.find(u => u.id === id);
  }
  
  addUser(user) {
    const newUser = {
      ...user,
      id: user.id || Date.now(),
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    localStorage.setItem('users', JSON.stringify(this.users));
    this.notify('users');
    return newUser;
  }

  // ============ SUPPLIERS ============
  getSuppliers() { 
    return [...this.suppliers]; 
  }
  
  addSupplier(supplier) {
    const newSupplier = {
      ...supplier,
      id: supplier.id || Date.now(),
      createdAt: new Date().toISOString()
    };
    this.suppliers.push(newSupplier);
    localStorage.setItem('suppliers', JSON.stringify(this.suppliers));
    this.notify('suppliers');
    return newSupplier;
  }

  // ============ PURCHASE ORDERS ============
  getPurchaseOrders() { 
    return [...this.purchaseOrders]; 
  }
  
  addPurchaseOrder(order) {
    const newOrder = {
      ...order,
      id: order.id || `PO-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString()
    };
    this.purchaseOrders.unshift(newOrder);
    localStorage.setItem('purchaseOrders', JSON.stringify(this.purchaseOrders));
    this.notify('purchaseOrders');
    return newOrder;
  }

  // ============ DASHBOARD STATS ============
  getStats() {
    const totalRevenue = this.orders
      .filter(o => o.status !== 'Refunded')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    
    const totalSales = this.orders.length;
    const totalProducts = this.products.length;
    const lowStockItems = this.products.filter(p => p.stock <= (p.threshold || 10)).length;
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = this.orders.filter(o => o.date === today);
    const todaySales = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      totalRevenue,
      totalSales,
      totalProducts,
      lowStockItems,
      todayOrders: todayOrders.length,
      todaySales
    };
  }

  // ============ REVENUE DATA (for charts) ============
  getRevenueData() {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const revenue = new Array(12).fill(0);
    
    this.orders.forEach(order => {
      if (order.date) {
        const date = new Date(order.date);
        const month = date.getMonth();
        revenue[month] += order.total || 0;
      }
    });

    return {
      labels: monthNames,
      datasets: [
        {
          label: `Revenue ${currentYear}`,
          data: revenue,
          borderColor: '#1e3a5f',
          backgroundColor: 'rgba(30, 58, 95, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#1e3a5f',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4
        }
      ]
    };
  }

  // ============ SALES DATA (for charts) ============
  getSalesData() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sales = new Array(7).fill(0);
    const target = new Array(7).fill(70);

    this.orders.forEach(order => {
      if (order.date) {
        const date = new Date(order.date);
        const day = date.getDay();
        // Adjust to Monday = 0
        const adjustedDay = day === 0 ? 6 : day - 1;
        sales[adjustedDay] += 1;
      }
    });

    return {
      labels: days,
      datasets: [
        {
          label: 'Sales',
          data: sales,
          backgroundColor: '#1e3a5f',
          borderRadius: 0,
          borderColor: '#1e3a5f',
          borderWidth: 1
        },
        {
          label: 'Target',
          data: target,
          backgroundColor: '#f97316',
          borderRadius: 0,
          borderColor: '#f97316',
          borderWidth: 1
        }
      ]
    };
  }

  // ============ CATEGORY DATA (for charts) ============
  getCategoryData() {
    const categories = {};
    this.products.forEach(product => {
      const category = product.category || 'Other';
      categories[category] = (categories[category] || 0) + 1;
    });

    const labels = Object.keys(categories);
    const data = Object.values(categories);
    
    // If no data, return sample data
    if (labels.length === 0) {
      return {
        labels: ['Tools', 'Paint', 'Plumbing', 'Electrical', 'Wood', 'Other'],
        datasets: [
          {
            data: [35, 20, 15, 12, 10, 8],
            backgroundColor: ['#1e3a5f', '#f97316', '#166534', '#991b1b', '#4c1d95', '#1e293b'],
            borderColor: '#ffffff',
            borderWidth: 2
          }
        ]
      };
    }

    return {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: ['#1e3a5f', '#f97316', '#166534', '#991b1b', '#4c1d95', '#1e293b'],
          borderColor: '#ffffff',
          borderWidth: 2
        }
      ]
    };
  }

  // ============ RECENT ORDERS ============
  getRecentOrders(limit = 6) {
    return this.orders.slice(0, limit).map(order => ({
      id: order.id,
      customer: order.customer || 'Walk-in Customer',
      amount: `$${(order.total || 0).toFixed(2)}`,
      status: order.status || 'Pending',
      date: order.date || new Date().toISOString().split('T')[0],
      items: order.items || order.cartItems?.length || 0
    }));
  }

  // ============ LOW STOCK ITEMS ============
  getLowStockItems() {
    return this.products
      .filter(p => p.stock <= (p.threshold || 10))
      .map(p => ({
        product: p.name,
        sku: p.sku,
        stock: p.stock,
        threshold: p.threshold || 10,
        reorder: p.reorder || 20
      }));
  }

  // ============ QUICK STATS ============
  getQuickStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = this.orders.filter(o => o.date === today);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = this.orders.length;
    const totalRevenue = this.orders.reduce((sum, o) => sum + (o.total || 0), 0);
    
    return {
      todaySales: todayRevenue,
      todayOrders: todayOrders.length,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      conversionRate: 3.8
    };
  }
}

// Create a singleton instance
const dataService = new DataService();
export default dataService;