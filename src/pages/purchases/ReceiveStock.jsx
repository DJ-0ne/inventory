// src/pages/purchases/ReceiveStock.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  Search,
  CheckCircle,
  AlertCircle,
  Package,
  Eye,
  Save,
  X,
  RefreshCw,
  Download
} from "lucide-react";
import dataService from "../../services/dataService";

const ReceiveStock = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [poNumber, setPoNumber] = useState("");
  const [selectedPO, setSelectedPO] = useState(null);
  const [receivedItems, setReceivedItems] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [searchError, setSearchError] = useState("");

  // Load purchase orders
  useEffect(() => {
    loadOrders();
    const unsubscribe = dataService.subscribe('purchaseOrders', loadOrders);
    return () => unsubscribe();
  }, []);

  const loadOrders = () => {
    const orders = dataService.getPurchaseOrders();
    // Only show pending orders for receiving
    const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Shipped');
    setPurchaseOrders(pendingOrders);
  };

  const handleSearchPO = () => {
    setSearchError("");
    
    if (!poNumber.trim()) {
      setSearchError("Please enter a PO number");
      return;
    }

    const po = purchaseOrders.find(p => p.id === poNumber.trim());
    if (po) {
      setSelectedPO(po);
      // Initialize received items
      const items = po.items.map(item => ({
        ...item,
        received: 0,
        status: "Pending"
      }));
      setReceivedItems(items);
    } else {
      setSearchError(`Purchase Order ${poNumber} not found or already received`);
      setSelectedPO(null);
      setReceivedItems([]);
    }
  };

  const handleReceiveChange = (index, value) => {
    const updated = [...receivedItems];
    const received = parseInt(value) || 0;
    const ordered = updated[index].ordered || updated[index].quantity || 0;
    
    if (received > ordered) {
      alert(`Cannot receive more than ordered (${ordered})`);
      return;
    }
    
    updated[index].received = received;
    updated[index].status = received === 0 ? "Pending" : 
                           received >= ordered ? "Complete" : "Partial";
    setReceivedItems(updated);
  };

  const handleReceiveAll = () => {
    const updated = receivedItems.map(item => ({
      ...item,
      received: item.ordered || item.quantity || 0,
      status: "Complete"
    }));
    setReceivedItems(updated);
  };

  const handleSubmit = () => {
    // Validate all items
    const allReceived = receivedItems.every(item => item.received > 0);
    const totalReceived = receivedItems.reduce((sum, item) => sum + item.received, 0);
    
    if (totalReceived === 0) {
      alert("Please receive at least one item");
      return;
    }

    // Update products stock
    receivedItems.forEach(item => {
      if (item.received > 0) {
        // Find the product in inventory
        const products = dataService.getProducts();
        const product = products.find(p => p.sku === item.sku || p.name === item.product);
        if (product) {
          dataService.updateProduct(product.id, {
            stock: product.stock + item.received,
            lastOrdered: new Date().toISOString().split('T')[0]
          });
        }
      }
    });

    // Update purchase order status
    const allComplete = receivedItems.every(item => item.received >= (item.ordered || item.quantity || 0));
    const orderStatus = allComplete ? 'Received' : 'Partial Received';
    
    // Update the order in dataService
    // Note: We'll need to add an update method
    const allOrders = dataService.getPurchaseOrders();
    const orderIndex = allOrders.findIndex(o => o.id === selectedPO.id);
    if (orderIndex !== -1) {
      allOrders[orderIndex].status = orderStatus;
      allOrders[orderIndex].receivedDate = new Date().toISOString().split('T')[0];
      allOrders[orderIndex].receivedItems = receivedItems;
      // Save back - we'll use localStorage directly since dataService doesn't have update
      localStorage.setItem('purchaseOrders', JSON.stringify(allOrders));
    }

    // Show success message
    const totalOrdered = receivedItems.reduce((sum, item) => sum + (item.ordered || item.quantity || 0), 0);
    const totalReceivedCount = receivedItems.reduce((sum, item) => sum + item.received, 0);
    
    alert(`✅ Stock received successfully!\n\nPO: ${selectedPO.id}\nSupplier: ${selectedPO.supplier}\nReceived: ${totalReceivedCount} of ${totalOrdered} items\nStatus: ${orderStatus}`);
    
    // Reset and redirect
    setSelectedPO(null);
    setPoNumber("");
    setReceivedItems([]);
    loadOrders();
    navigate('/purchases/orders');
  };

  const handleCancel = () => {
    setSelectedPO(null);
    setPoNumber("");
    setReceivedItems([]);
    setSearchError("");
  };

  const handleRefresh = () => {
    loadOrders();
    setSearchError("");
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Complete': 'bg-green-800 text-white',
      'Partial': 'bg-orange-600 text-white',
      'Pending': 'bg-gray-500 text-white'
    };
    return <span className={`px-2 py-1 text-xs font-bold ${styles[status] || 'bg-gray-500 text-white'}`}>{status}</span>;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Complete': return <CheckCircle size={14} className="text-green-800" />;
      case 'Partial': return <AlertCircle size={14} className="text-orange-600" />;
      default: return null;
    }
  };

  // Get available PO numbers for suggestions
  const availablePOs = purchaseOrders.map(p => p.id);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto"></div>
          <p className="mt-4 text-blue-950 font-bold">Loading purchase orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Receive Stock</h1>
          <p className="text-gray-600 font-medium text-sm">Process incoming stock from purchase orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            <span className="text-sm">Refresh</span>
          </button>
          <Link to="/purchases/orders">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Orders</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Available POs Stats */}
      {!selectedPO && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 border-l-4 border-blue-950 shadow-sm">
            <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Pending Orders</p>
            <p className="text-2xl font-bold text-blue-950">{purchaseOrders.length}</p>
          </div>
          <div className="bg-white p-4 border-l-4 border-orange-600 shadow-sm">
            <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Ready to Receive</p>
            <p className="text-2xl font-bold text-orange-600">
              {purchaseOrders.filter(p => p.status === 'Shipped').length}
            </p>
          </div>
          <div className="bg-white p-4 border-l-4 border-green-800 shadow-sm">
            <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Pending Items</p>
            <p className="text-2xl font-bold text-green-800">
              {purchaseOrders.reduce((sum, p) => sum + (p.items?.length || 0), 0)}
            </p>
          </div>
        </div>
      )}

      {!selectedPO ? (
        <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Search Purchase Order</h2>
          <p className="text-sm text-gray-600 font-medium mb-4">Enter the PO number to receive stock</p>
          
          <div className="flex gap-3">
            <div className="flex-1 flex items-center border-2 border-blue-950/10 px-3 py-2">
              <Search size={18} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Enter PO Number (e.g., PO-001)"
                className="w-full text-sm font-medium text-blue-950 outline-none"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchPO()}
                list="poList"
              />
              <datalist id="poList">
                {availablePOs.map(po => (
                  <option key={po} value={po} />
                ))}
              </datalist>
            </div>
            <button
              onClick={handleSearchPO}
              className="bg-blue-950 text-white px-6 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
            >
              Search
            </button>
          </div>
          
          {searchError && (
            <div className="mt-3 p-3 bg-red-50 border-2 border-red-800">
              <p className="text-red-800 text-sm font-bold flex items-center gap-2">
                <AlertCircle size={16} />
                {searchError}
              </p>
            </div>
          )}
          
          {availablePOs.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 font-medium">Available POs: {availablePOs.join(', ')}</p>
            </div>
          )}
          
          {availablePOs.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-600">
              <p className="text-yellow-800 text-sm font-medium flex items-center gap-2">
                <AlertCircle size={16} />
                No pending purchase orders available for receiving
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* PO Details */}
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-blue-950">Receive Stock: {selectedPO.id}</h2>
                <p className="text-sm text-gray-600 font-medium">Supplier: {selectedPO.supplier}</p>
                <p className="text-sm text-gray-600 font-medium">Order Date: {selectedPO.date}</p>
              </div>
              <button
                onClick={handleCancel}
                className="text-red-800 hover:text-red-900 transition-colors font-bold text-sm flex items-center gap-1"
              >
                <X size={16} />
                Cancel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-blue-950/10 bg-gray-50">
                    <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Product</th>
                    <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">SKU</th>
                    <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Ordered</th>
                    <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Received</th>
                    <th className="text-center py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {receivedItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-3 font-bold text-blue-950">{item.product}</td>
                      <td className="py-2 px-3 text-gray-600 font-medium text-xs">{item.sku || 'N/A'}</td>
                      <td className="py-2 px-3 text-center font-bold text-blue-950">
                        {item.ordered || item.quantity || 0}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          max={item.ordered || item.quantity || 0}
                          value={item.received}
                          onChange={(e) => handleReceiveChange(index, e.target.value)}
                          className="w-20 border-2 border-blue-950/10 px-2 py-1 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 text-center mx-auto block"
                          placeholder="0"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getStatusIcon(item.status)}
                          {getStatusBadge(item.status)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-blue-950/10 bg-gray-50">
                    <td colSpan="2" className="py-2 px-3 font-bold text-blue-950">Summary</td>
                    <td className="py-2 px-3 text-center font-bold text-blue-950">
                      {receivedItems.reduce((sum, item) => sum + (item.ordered || item.quantity || 0), 0)}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-blue-950">
                      {receivedItems.reduce((sum, item) => sum + item.received, 0)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {receivedItems.every(item => item.received >= (item.ordered || item.quantity || 0)) && 
                       receivedItems.some(item => item.received > 0) ? (
                        <span className="text-green-800 font-bold">All Received</span>
                      ) : receivedItems.some(item => item.received > 0) ? (
                        <span className="text-orange-600 font-bold">Partial Received</span>
                      ) : (
                        <span className="text-gray-500 font-medium">Pending</span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-blue-950/10">
              <button
                onClick={handleReceiveAll}
                className="bg-blue-950 text-white px-4 py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 flex items-center gap-2"
              >
                <Package size={16} />
                Receive All
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancel}
                  className="bg-white border-2 border-blue-950/20 text-blue-950 px-4 py-2 font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-green-800 text-white px-6 py-2 font-bold hover:bg-green-900 transition-colors border-2 border-green-800 flex items-center gap-2"
                >
                  <Save size={18} />
                  Confirm Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiveStock;