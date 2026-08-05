// src/pages/inventory/AddProduct.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Plus, 
  Trash2,
  Upload,
  Barcode,
  RefreshCw
} from "lucide-react";
import dataService from "../../services/dataService";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    cost: "",
    stock: "",
    reorder: "",
    threshold: "",
    description: "",
    supplier: "",
    location: "",
    weight: "",
    dimensions: ""
  });

  const [variants, setVariants] = useState([]);
  const [variantName, setVariantName] = useState("");
  const [variantPrice, setVariantPrice] = useState("");

  const categories = ["Tools", "Paint", "Power Tools", "Plumbing", "Electrical", "Wood", "Hardware", "Safety", "Other"];
  const suppliers = ["ToolCo Ltd", "ColorMaster Inc", "BuildRight Supplies", "SafetyFirst Corp", "ElectroParts Inc", "WoodCraft Supplies"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const generateSKU = () => {
    const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : "PRD";
    const random = Math.floor(1000 + Math.random() * 9000);
    const sku = `${prefix}-${random}`;
    setFormData({ ...formData, sku });
  };

  const addVariant = () => {
    if (variantName && variantPrice) {
      setVariants([...variants, { 
        id: Date.now(), 
        name: variantName, 
        price: parseFloat(variantPrice) 
      }]);
      setVariantName("");
      setVariantPrice("");
    }
  };

  const removeVariant = (id) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!formData.name || !formData.category || !formData.price || !formData.stock) {
      alert("Please fill in all required fields (Name, Category, Price, Stock)");
      setLoading(false);
      return;
    }

    // Create product object
    const product = {
      name: formData.name,
      sku: formData.sku || `HW-${Date.now().toString().slice(-6)}`,
      category: formData.category,
      price: parseFloat(formData.price) || 0,
      cost: parseFloat(formData.cost) || 0,
      stock: parseInt(formData.stock) || 0,
      threshold: parseInt(formData.threshold || formData.reorder) || 10,
      reorder: parseInt(formData.reorder) || 20,
      supplier: formData.supplier || 'Unknown',
      description: formData.description || '',
      location: formData.location || '',
      weight: formData.weight || '',
      dimensions: formData.dimensions || '',
      variants: variants,
      status: parseInt(formData.stock) <= parseInt(formData.threshold || formData.reorder || 10) 
        ? (parseInt(formData.stock) === 0 ? 'Out of Stock' : 'Low Stock')
        : 'In Stock',
      date: new Date().toISOString().split('T')[0]
    };

    // Save to data service
    dataService.addProduct(product);
    setLoading(false);
    alert('Product added successfully!');
    navigate('/inventory/products');
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/inventory/products');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Add New Product</h1>
          <p className="text-gray-600 font-medium text-sm">Create a new product entry in the inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/inventory/products">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Products</span>
            </button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                    Product Name <span className="text-red-800">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">SKU</label>
                  <div className="flex">
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                      placeholder="Auto-generated if left blank"
                    />
                    <button 
                      type="button" 
                      onClick={generateSKU}
                      className="bg-blue-950 text-white px-3 border-2 border-blue-950 hover:bg-blue-900 transition-colors"
                      title="Generate SKU"
                    >
                      <Barcode size={18} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                    Category <span className="text-red-800">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Supplier</label>
                  <select
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950 bg-white"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((sup, index) => (
                      <option key={index} value={sup}>{sup}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Pricing & Stock</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                    Selling Price <span className="text-red-800">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Cost Price</label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                    Stock Quantity <span className="text-red-800">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Reorder Level</label>
                  <input
                    type="number"
                    name="reorder"
                    value={formData.reorder}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="20"
                    min="0"
                  />
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border-2 border-blue-950/10">
                <p className="text-sm text-blue-950 font-medium">
                  <span className="font-bold">Status:</span> 
                  {parseInt(formData.stock) <= parseInt(formData.reorder || 20) 
                    ? (parseInt(formData.stock) === 0 
                        ? ' Out of Stock' 
                        : ' Low Stock') 
                    : ' In Stock'}
                </p>
                <p className="text-xs text-gray-600 mt-1">Auto-calculated based on stock vs reorder level</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Description</h2>
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Product Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Enter product description..."
                ></textarea>
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Product Variants</h2>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  className="flex-1 border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Variant name (e.g., Large, Red)"
                />
                <input
                  type="number"
                  value={variantPrice}
                  onChange={(e) => setVariantPrice(e.target.value)}
                  className="w-32 border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                  placeholder="Price"
                  step="0.01"
                />
                <button
                  type="button"
                  onClick={addVariant}
                  className="bg-blue-950 text-white px-4 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950"
                >
                  <Plus size={18} />
                </button>
              </div>
              {variants.length > 0 && (
                <div className="border-2 border-blue-950/10 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Variant</th>
                        <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Price</th>
                        <th className="text-left py-2 px-3 font-bold text-blue-950 text-xs uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant) => (
                        <tr key={variant.id} className="border-t border-gray-100">
                          <td className="py-2 px-3 font-medium text-blue-950">{variant.name}</td>
                          <td className="py-2 px-3 font-bold text-blue-950">${variant.price.toFixed(2)}</td>
                          <td className="py-2 px-3">
                            <button
                              type="button"
                              onClick={() => removeVariant(variant.id)}
                              className="text-red-800 hover:text-red-900 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Additional Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Location / Shelf</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="e.g., Aisle 3, Shelf B"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">Dimensions (L x W x H)</label>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-950/10 px-3 py-2 text-sm font-medium text-blue-950 outline-none focus:border-blue-950"
                    placeholder="e.g., 10 x 5 x 3 cm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
              <h2 className="text-lg font-bold text-blue-950 mb-4">Actions</h2>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 mb-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {loading ? 'Saving...' : 'Save Product'}
              </button>
              <button
                type="button"
                className="w-full bg-white border-2 border-blue-950/20 text-blue-950 py-3 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                onClick={handleCancel}
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;