// src/pages/inventory/BulkImport.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  X,
  Trash2,
  RefreshCw
} from "lucide-react";
import dataService from "../../services/dataService";

const BulkImport = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [results, setResults] = useState(null);
  const [previewData, setPreviewData] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImported(false);
      setResults(null);
      setPreviewData([]);
      // Preview the file content
      previewFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setImported(false);
      setResults(null);
      setPreviewData([]);
      previewFile(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Preview file content (simulated)
  const previewFile = (file) => {
    // In a real app, you'd parse CSV/Excel here
    // For demo, we'll show sample preview data
    const sampleData = [
      { name: "Hammer", sku: "TOOL-001", category: "Tools", price: 24.99, stock: 50, supplier: "ToolCo Ltd" },
      { name: "Paint Roller", sku: "PAINT-003", category: "Paint", price: 12.50, stock: 30, supplier: "ColorMaster Inc" },
      { name: "Screwdriver Set", sku: "TOOL-005", category: "Tools", price: 45.00, stock: 25, supplier: "ToolCo Ltd" },
      { name: "Measuring Tape", sku: "TOOL-012", category: "Tools", price: 8.99, stock: 40, supplier: "ToolCo Ltd" },
    ];
    setPreviewData(sampleData);
  };

  const handleImport = () => {
    if (!file) return;
    setImporting(true);

    // Simulate import process
    setTimeout(() => {
      setImporting(false);
      setImported(true);
      
      // Simulate import results
      const totalProducts = previewData.length + Math.floor(Math.random() * 10);
      const successCount = Math.floor(totalProducts * 0.9);
      const failedCount = totalProducts - successCount;
      
      setResults({
        total: totalProducts,
        success: successCount,
        failed: failedCount,
        errors: failedCount > 0 ? [
          { row: 3, message: "Invalid price format" },
          { row: 7, message: "SKU already exists" },
          { row: 12, message: "Category not found" }
        ].slice(0, failedCount) : []
      });

      // Actually import the products to dataService
      previewData.forEach(product => {
        const newProduct = {
          ...product,
          sku: product.sku || `HW-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3)}`,
          cost: product.cost || product.price * 0.5,
          threshold: product.threshold || 10,
          reorder: product.reorder || 20,
          status: product.stock <= 10 ? (product.stock === 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock',
          date: new Date().toISOString().split('T')[0]
        };
        dataService.addProduct(newProduct);
      });

    }, 3000);
  };

  const downloadTemplate = () => {
    // Create template CSV
    const headers = ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Cost', 'Reorder Level', 'Supplier', 'Description'];
    const sampleRow = ['Hammer', 'TOOL-001', 'Tools', '24.99', '50', '12.50', '20', 'ToolCo Ltd', 'Standard claw hammer'];
    
    let csv = headers.join(',') + '\n';
    csv += sampleRow.join(',') + '\n';
    csv += ',,,,,,,,\n'.repeat(5); // Empty rows for user to fill

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const removeFile = () => {
    setFile(null);
    setImported(false);
    setResults(null);
    setPreviewData([]);
  };

  const handleViewProducts = () => {
    navigate('/inventory/products');
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b-2 border-blue-950/20">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Bulk Import Products</h1>
          <p className="text-gray-600 font-medium text-sm">Import multiple products at once using CSV or Excel files</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link to="/inventory/products">
            <button className="flex items-center gap-2 bg-white border-2 border-blue-950/20 px-4 py-2 text-blue-950 font-bold hover:bg-gray-50 transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Products</span>
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Import Area */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Upload File</h2>
            
            {/* File Upload Area */}
            {!file && (
              <div
                className="border-2 border-dashed border-blue-950/30 p-12 text-center hover:border-blue-950 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <Upload size={48} className="text-blue-950/30 mx-auto mb-4" />
                <p className="text-blue-950 font-bold text-lg">Drop your file here</p>
                <p className="text-gray-600 font-medium text-sm">or click to browse</p>
                <p className="text-gray-500 text-xs font-medium mt-2">Supported formats: .csv, .xlsx, .xls</p>
                <input
                  id="fileInput"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}

            {/* File Preview */}
            {file && (
              <div className="border-2 border-blue-950/10 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <FileText size={32} className="text-blue-950" />
                    <div>
                      <p className="font-bold text-blue-950">{file.name}</p>
                      <p className="text-sm text-gray-600 font-medium">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {!imported && (
                      <button
                        onClick={removeFile}
                        className="text-red-800 hover:text-red-900 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <span className={`px-2 py-1 text-xs font-bold ${file ? 'bg-green-800 text-white' : 'bg-gray-300 text-gray-600'}`}>
                      {file ? 'Ready' : 'No File'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Data */}
            {file && previewData.length > 0 && !imported && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-blue-950 mb-2">Preview (First 4 rows)</h3>
                <div className="border-2 border-blue-950/10 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(previewData[0]).map((key) => (
                          <th key={key} className="text-left py-2 px-3 font-bold text-blue-950 uppercase tracking-wider">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index} className="border-t border-gray-100">
                          {Object.values(row).map((value, i) => (
                            <td key={i} className="py-2 px-3 text-gray-700 font-medium">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-2">
                  Showing preview of {previewData.length} products from your file
                </p>
              </div>
            )}

            {/* Import Button */}
            {file && !imported && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full bg-blue-950 text-white py-3 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Start Import ({previewData.length} products)
                  </>
                )}
              </button>
            )}

            {/* Import Results */}
            {imported && results && (
              <div className="mt-4 border-2 border-green-800/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={20} className="text-green-800" />
                  <h3 className="font-bold text-green-800">Import Completed</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 text-center">
                    <p className="text-2xl font-bold text-blue-950">{results.total}</p>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Total</p>
                  </div>
                  <div className="bg-green-50 p-3 text-center border-l-2 border-green-800">
                    <p className="text-2xl font-bold text-green-800">{results.success}</p>
                    <p className="text-xs font-bold text-green-800 uppercase tracking-wider">Success</p>
                  </div>
                  <div className="bg-red-50 p-3 text-center border-l-2 border-red-800">
                    <p className="text-2xl font-bold text-red-800">{results.failed}</p>
                    <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Failed</p>
                  </div>
                </div>
                {results.errors && results.errors.length > 0 && (
                  <div className="border-2 border-red-800/20 p-3">
                    <h4 className="font-bold text-red-800 text-sm mb-2 flex items-center gap-2">
                      <AlertCircle size={16} />
                      Errors
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {results.errors.map((error, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span className="font-bold text-red-800">Row {error.row}:</span>
                          <span className="text-gray-700">{error.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={handleViewProducts}
                  className="w-full mt-4 bg-green-800 text-white py-2 font-bold hover:bg-green-700 transition-colors border-2 border-green-800"
                >
                  View Products
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Instructions</h2>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <span className="font-bold text-blue-950">1.</span>
                <p className="text-gray-700 font-medium">Download the template file below</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-950">2.</span>
                <p className="text-gray-700 font-medium">Fill in your product data in the template</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-950">3.</span>
                <p className="text-gray-700 font-medium">Upload the completed file</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-950">4.</span>
                <p className="text-gray-700 font-medium">Review the import results</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border-2 border-blue-950/10 shadow-sm">
            <h2 className="text-lg font-bold text-blue-950 mb-4">Template</h2>
            <button
              onClick={downloadTemplate}
              className="w-full bg-white border-2 border-blue-950/20 text-blue-950 py-2 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download Template CSV
            </button>
            <div className="mt-3 text-xs text-gray-500 font-medium">
              <p><span className="text-red-800">*</span> Required fields: Name, SKU, Category, Price, Stock</p>
              <p>Optional: Cost, Reorder Level, Supplier, Description</p>
              <p className="mt-1 text-blue-950">Max file size: 5MB</p>
            </div>
          </div>

          {imported && results && (
            <div className="mt-4 bg-white p-6 border-2 border-blue-950/10 shadow-sm">
              <button
                onClick={() => {
                  setFile(null);
                  setImported(false);
                  setResults(null);
                  setPreviewData([]);
                }}
                className="w-full bg-blue-950 text-white py-2 font-bold hover:bg-blue-900 transition-colors border-2 border-blue-950 flex items-center justify-center gap-2"
              >
                <Upload size={18} />
                Import Another File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImport;