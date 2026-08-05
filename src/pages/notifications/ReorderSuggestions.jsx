// src/pages/notifications/ReorderSuggestions.jsx
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  Eye
} from 'lucide-react';
import { notificationAPI } from '../../services/api';
import dataService from '../../services/dataService';
import { PRIORITY_COLORS, TABLE_HEADER_STYLES, TABLE_ROW_STYLES } from '../../constants';

const ReorderSuggestions = () => {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'priority', direction: 'desc' });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadData();
    const unsubscribeProducts = dataService.subscribe('products', loadData);
    return () => unsubscribeProducts();
  }, []);

  useEffect(() => {
    filterSuggestions();
  }, [suggestions, searchTerm, filterPriority]);

  const loadData = () => {
    setLoading(true);
    
    const allProducts = dataService.getProducts();
    setProducts(allProducts);

    // Generate reorder suggestions from products
    const suggestionsData = allProducts
      .filter(product => product.stock <= product.threshold)
      .map(product => {
        const ratio = product.stock / (product.threshold || 10);
        let priority = 'Low';
        if (ratio <= 0.3 || product.stock === 0) priority = 'High';
        else if (ratio <= 0.6) priority = 'Medium';
        
        const daysUntilOut = Math.floor((product.stock / (product.salesPerDay || 1)) || 5);
        const recommendedQty = (product.reorder || 20) * (priority === 'High' ? 1.5 : 1);
        
        return {
          id: product.id,
          product: product.name,
          sku: product.sku,
          currentStock: product.stock,
          reorderPoint: product.threshold || 10,
          recommendedQty: Math.round(recommendedQty),
          priority: priority,
          daysUntilOut: Math.max(1, daysUntilOut),
          supplier: product.supplier || 'Unknown',
          leadTime: product.leadTime || 5,
          cost: `$${product.price.toFixed(2)}`,
          totalCost: `$${(product.price * Math.round(recommendedQty)).toFixed(2)}`
        };
      });

    // If no suggestions, use mock data
    if (suggestionsData.length === 0) {
      const mockData = [
        { 
          id: 1, 
          product: 'Screwdriver Set', 
          sku: 'TOOL-001', 
          currentStock: 5, 
          reorderPoint: 10, 
          recommendedQty: 20,
          priority: 'High',
          daysUntilOut: 3,
          supplier: 'ToolCo Ltd',
          leadTime: 5,
          cost: '$4.50',
          totalCost: '$90.00'
        },
        {
          id: 2,
          product: 'Measuring Tape',
          sku: 'TOOL-012',
          currentStock: 3,
          reorderPoint: 20,
          recommendedQty: 25,
          priority: 'High',
          daysUntilOut: 2,
          supplier: 'ToolCo Ltd',
          leadTime: 4,
          cost: '$2.75',
          totalCost: '$68.75'
        },
        {
          id: 3,
          product: 'Safety Gloves',
          sku: 'SAFE-002',
          currentStock: 2,
          reorderPoint: 10,
          recommendedQty: 15,
          priority: 'High',
          daysUntilOut: 1,
          supplier: 'SafetyFirst Corp',
          leadTime: 3,
          cost: '$3.20',
          totalCost: '$48.00'
        },
        {
          id: 4,
          product: 'Paint Roller',
          sku: 'PAINT-003',
          currentStock: 8,
          reorderPoint: 15,
          recommendedQty: 20,
          priority: 'Medium',
          daysUntilOut: 7,
          supplier: 'ColorMaster Inc',
          leadTime: 6,
          cost: '$2.10',
          totalCost: '$42.00'
        },
        {
          id: 5,
          product: 'Drill Bits Set',
          sku: 'TOOL-018',
          currentStock: 7,
          reorderPoint: 15,
          recommendedQty: 20,
          priority: 'Medium',
          daysUntilOut: 8,
          supplier: 'ToolCo Ltd',
          leadTime: 5,
          cost: '$8.75',
          totalCost: '$175.00'
        },
        {
          id: 6,
          product: 'Electrical Tape',
          sku: 'ELEC-007',
          currentStock: 14,
          reorderPoint: 20,
          recommendedQty: 30,
          priority: 'Low',
          daysUntilOut: 14,
          supplier: 'ElectroParts Inc',
          leadTime: 4,
          cost: '$1.50',
          totalCost: '$45.00'
        },
        {
          id: 7,
          product: 'Wood Glue',
          sku: 'WOOD-004',
          currentStock: 6,
          reorderPoint: 10,
          recommendedQty: 15,
          priority: 'High',
          daysUntilOut: 4,
          supplier: 'WoodCraft Supplies',
          leadTime: 5,
          cost: '$3.85',
          totalCost: '$57.75'
        },
        {
          id: 8,
          product: 'Hammer',
          sku: 'TOOL-005',
          currentStock: 12,
          reorderPoint: 25,
          recommendedQty: 25,
          priority: 'Medium',
          daysUntilOut: 10,
          supplier: 'BuildRight Supplies',
          leadTime: 7,
          cost: '$6.50',
          totalCost: '$162.50'
        }
      ];
      setSuggestions(mockData);
      setFilteredSuggestions(mockData);
    } else {
      setSuggestions(suggestionsData);
      setFilteredSuggestions(suggestionsData);
    }
    
    setLoading(false);
  };

  const filterSuggestions = () => {
    let filtered = suggestions;
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(item => item.priority === filterPriority);
    }
    
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredSuggestions(filtered);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getPriorityBadge = (priority) => {
    const baseStyles = 'px-3 py-1 text-xs font-bold uppercase tracking-wider';
    const colorMap = {
      'High': 'bg-red-800 text-white',
      'Medium': 'bg-orange-600 text-white',
      'Low': 'bg-green-800 text-white',
    };
    return <span className={`${baseStyles} ${colorMap[priority] || 'bg-gray-700 text-white'}`}>{priority}</span>;
  };

  const getStockStatusColor = (stock, reorderPoint) => {
    const ratio = stock / reorderPoint;
    if (ratio <= 0.3) return 'text-red-800 font-bold';
    if (ratio <= 0.6) return 'text-orange-600 font-bold';
    return 'text-yellow-600 font-bold';
  };

  // Helper function to safely parse currency
  const safeParseCurrency = (value) => {
    if (!value) return 0;
    const parsed = parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  const StatsCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-blue-950 mt-1">{value}</p>
        </div>
        <div className={`${color} p-3 border-2 border-white/20`}>
          <Icon size={24} color="white" />
        </div>
      </div>
    </div>
  );

  const showCustomModal = (message, type, data = null) => {
    setModalMessage(message);
    setModalType(type);
    setSelectedSuggestion(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalType("");
    setSelectedSuggestion(null);
  };

  const handleViewDetails = (item) => {
    showCustomModal(
      `📦 Reorder Details\n\nProduct: ${item.product}\nSKU: ${item.sku}\nCurrent Stock: ${item.currentStock}\nReorder Point: ${item.reorderPoint}\nRecommended Qty: ${item.recommendedQty}\nPriority: ${item.priority}\nDays Until Out: ${item.daysUntilOut}\nSupplier: ${item.supplier}\nLead Time: ${item.leadTime} days\nTotal Cost: ${item.totalCost}`,
      "info",
      item
    );
  };

  const handlePlaceOrder = (item) => {
    const product = products.find(p => p.id === item.id);
    if (product) {
      // Create a purchase order
      dataService.addPurchaseOrder({
        supplier: item.supplier,
        items: [{ 
          productId: product.id, 
          name: product.name, 
          quantity: item.recommendedQty, 
          price: product.price 
        }],
        total: safeParseCurrency(item.totalCost),
        priority: item.priority,
        notes: `Auto-generated reorder for ${item.product} (Priority: ${item.priority})`
      });
      
      showCustomModal(
        `✅ Order placed successfully!\n\nProduct: ${item.product}\nQuantity: ${item.recommendedQty} units\nSupplier: ${item.supplier}\nPriority: ${item.priority}\nTotal Cost: ${item.totalCost}`,
        "success",
        item
      );
    } else {
      showCustomModal(
        `⚠️ Could not place order.\n\nProduct: ${item.product}\nPlease check product details.`,
        "error",
        item
      );
    }
  };

  const handleRefresh = () => {
    loadData();
    showCustomModal("🔄 Reorder suggestions refreshed!", "success");
  };

  const handleExport = () => {
    const headers = ['Product', 'SKU', 'Current Stock', 'Reorder Point', 'Recommended Qty', 'Priority', 'Days Until Out', 'Supplier', 'Lead Time', 'Total Cost'];
    const rows = filteredSuggestions.map(item => [
      item.product,
      item.sku,
      item.currentStock,
      item.reorderPoint,
      item.recommendedQty,
      item.priority,
      item.daysUntilOut,
      item.supplier,
      item.leadTime,
      item.totalCost
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reorder_suggestions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showCustomModal("✅ Reorder suggestions exported successfully!", "success");
  };

  const stats = [
    { label: 'Total Suggestions', value: suggestions.length, icon: ShoppingCart, color: 'bg-blue-950' },
    { label: 'High Priority', value: suggestions.filter(s => s.priority === 'High').length, icon: TrendingUp, color: 'bg-red-800' },
    { label: 'Medium Priority', value: suggestions.filter(s => s.priority === 'Medium').length, icon: Clock, color: 'bg-orange-600' },
    { label: 'Low Priority', value: suggestions.filter(s => s.priority === 'Low').length, icon: CheckCircle, color: 'bg-green-800' },
  ];

  // Calculate total cost safely
  const totalCost = filteredSuggestions.reduce((sum, item) => {
    return sum + safeParseCurrency(item.totalCost);
  }, 0);
  const estimatedTotal = `$${totalCost.toFixed(2)}`;

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading reorder suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white max-w-md w-full p-6 border-2 border-blue-950/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {modalType === "success" && <CheckCircle size={28} className="text-green-800" />}
                {modalType === "error" && <AlertCircle size={28} className="text-red-800" />}
                {modalType === "info" && <AlertCircle size={28} className="text-blue-950" />}
                <h3 className="text-lg font-bold text-blue-950">
                  {modalType === "success" ? "Success" : modalType === "error" ? "Error" : "Information"}
                </h3>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 font-medium whitespace-pre-line">{modalMessage}</p>
              {selectedSuggestion && (
                <div className="mt-3 bg-gray-50 p-3 border-l-4 border-blue-950">
                  <p className="text-sm font-bold text-blue-950">{selectedSuggestion.product}</p>
                  <p className="text-sm text-gray-600">SKU: {selectedSuggestion.sku}</p>
                  <p className="text-sm text-gray-600">Priority: {selectedSuggestion.priority}</p>
                  <p className="text-sm text-gray-600">Total Cost: {selectedSuggestion.totalCost}</p>
                </div>
              )}
            </div>
            <button
              onClick={closeModal}
              className="w-full bg-blue-950 text-white py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Reorder Suggestions</h1>
          <p className="text-gray-600 font-medium text-sm">Intelligent recommendations for inventory replenishment</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            <span className="text-sm">Refresh</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
          >
            <Download size={18} />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
        <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Est. Total Cost</p>
              <p className="text-2xl font-bold text-blue-950 mt-1">{estimatedTotal}</p>
            </div>
            <div className="bg-green-800 p-3 border-2 border-white/20">
              <Package size={24} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border-2 border-blue-950/10 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products, SKU, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-blue-950/10 focus:border-blue-950 outline-none font-medium"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border-2 border-blue-950/10 px-3 py-2 font-medium focus:border-blue-950 outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Showing {filteredSuggestions.length} of {suggestions.length} suggestions
          </div>
        </div>
      </div>

      {/* Suggestions Table */}
      <div className="bg-white border-2 border-blue-950/10 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-950/10 bg-gray-50">
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('product')} className="flex items-center gap-1 hover:text-orange-600">
                  Product
                  {sortConfig.key === 'product' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('sku')} className="flex items-center gap-1 hover:text-orange-600">
                  SKU
                  {sortConfig.key === 'sku' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('currentStock')} className="flex items-center gap-1 hover:text-orange-600">
                  Current Stock
                  {sortConfig.key === 'currentStock' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>Recommended Qty</th>
              <th className={TABLE_HEADER_STYLES}>
                <button onClick={() => handleSort('priority')} className="flex items-center gap-1 hover:text-orange-600">
                  Priority
                  {sortConfig.key === 'priority' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </button>
              </th>
              <th className={TABLE_HEADER_STYLES}>Days Until Out</th>
              <th className={TABLE_HEADER_STYLES}>Supplier</th>
              <th className={TABLE_HEADER_STYLES}>Lead Time (Days)</th>
              <th className={TABLE_HEADER_STYLES}>Total Cost</th>
              <th className={TABLE_HEADER_STYLES} style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuggestions.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-8 text-center text-gray-500 font-medium">
                  No reorder suggestions found. All products are well stocked!
                </td>
              </tr>
            ) : (
              filteredSuggestions.map((item) => (
                <tr key={item.id} className={TABLE_ROW_STYLES}>
                  <td className="py-3 font-bold text-blue-950">{item.product}</td>
                  <td className="py-3 text-gray-600 font-medium text-xs">{item.sku}</td>
                  <td className={`py-3 ${getStockStatusColor(item.currentStock, item.reorderPoint)}`}>
                    {item.currentStock} / {item.reorderPoint}
                  </td>
                  <td className="py-3 font-bold text-blue-950">{item.recommendedQty}</td>
                  <td className="py-3">{getPriorityBadge(item.priority)}</td>
                  <td className="py-3 font-bold text-gray-700">{item.daysUntilOut}</td>
                  <td className="py-3 text-gray-700 font-medium">{item.supplier}</td>
                  <td className="py-3 text-gray-600">{item.leadTime}</td>
                  <td className="py-3 font-bold text-blue-950">{item.totalCost}</td>
                  <td className="py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleViewDetails(item)}
                        className="p-1 text-blue-950 hover:bg-blue-50 transition-colors" 
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handlePlaceOrder(item)}
                        className={`px-3 py-1 text-xs font-bold text-white transition-colors ${
                          item.priority === 'High' ? 'bg-red-800 hover:bg-red-700' :
                          item.priority === 'Medium' ? 'bg-orange-600 hover:bg-orange-700' :
                          'bg-blue-950 hover:bg-blue-900'
                        }`}
                      >
                        Order
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReorderSuggestions;