'use client';

/**
 * Products Dashboard Component
 * Main interface for managing digital products
 */

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  fileUrl: string | null;
  downloadLimit: number | null;
  isActive: boolean;
  stripeProductId: string | null;
  stripePriceId: string | null;
  createdAt: string;
  updatedAt: string;
  salesCount: number;
}

export default function ProductsDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    fileUrl: '',
    downloadLimit: '',
    isActive: true,
    createStripeProduct: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchProducts();
    // Restore view mode from localStorage
    const savedViewMode = localStorage.getItem('productsViewMode');
    if (savedViewMode === 'cards' || savedViewMode === 'table') {
      setViewMode(savedViewMode);
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        headers: { 'x-user-id': 'demo-user' }
      });
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'USD',
      fileUrl: '',
      downloadLimit: '',
      isActive: true,
      createStripeProduct: true
    });
    setFormErrors({});
    setIsSubmitting(false);
    setUploadingFile(false);
    setSelectedProduct(null);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name) {
      errors.name = 'Product name is required';
    } else if (formData.name.length < 3 || formData.name.length > 100) {
      errors.name = 'Name must be 3-100 characters';
    }

    const priceNum = parseFloat(formData.price);
    if (!formData.price) {
      errors.price = 'Price is required';
    } else if (isNaN(priceNum) || priceNum < 0.5) {
      errors.price = 'Minimum price is $0.50';
    }

    if (formData.description && formData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }

    if (formData.fileUrl) {
      try {
        new URL(formData.fileUrl);
      } catch {
        errors.fileUrl = 'Invalid URL format';
      }
    }

    const downloadLimitNum = parseInt(formData.downloadLimit);
    if (formData.downloadLimit && (isNaN(downloadLimitNum) || downloadLimitNum < 1)) {
      errors.downloadLimit = 'Download limit must be at least 1';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const handleFileUpload = async (file: File) => {
    setUploadingFile(true);
    setFormErrors(prev => ({ ...prev, fileUrl: '' }));

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-user-id': 'demo-user'
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        setFormErrors(prev => ({
          ...prev,
          fileUrl: errorData.error || 'Upload failed'
        }));
        return;
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, fileUrl: data.fileUrl }));
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      setFormErrors(prev => ({
        ...prev,
        fileUrl: 'Upload failed. Please try again.'
      }));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreateProduct = () => {
    setModalMode('create');
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        headers: { 'x-user-id': 'demo-user' }
      });
      const data = await response.json();

      setSelectedProduct(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        price: data.price.toString(),
        currency: data.currency,
        fileUrl: data.fileUrl || '',
        downloadLimit: data.downloadLimit?.toString() || '',
        isActive: data.isActive,
        createStripeProduct: false // Not needed for edit
      });
      setModalMode('edit');
      setShowCreateModal(true);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    }
  };

  const handleViewProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        headers: { 'x-user-id': 'demo-user' }
      });

      if (response.ok) {
        const data = await response.json();
        setViewingProduct(data);
        setShowViewModal(true);
      } else if (response.status === 404) {
        toast.error('Product not found');
      } else {
        toast.error('Failed to load product details');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to load product details');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Delete this product? It will be deactivated but sales data will be preserved.')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': 'demo-user' }
      });

      if (response.ok) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchProducts();
      } else {
        toast.error('Failed to update product');
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error('Failed to update product');
    }
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        currency: formData.currency,
        fileUrl: formData.fileUrl || undefined,
        downloadLimit: formData.downloadLimit ? parseInt(formData.downloadLimit) : undefined,
        isActive: formData.isActive
      };

      if (modalMode === 'create') {
        payload.createStripeProduct = formData.createStripeProduct;
      } else {
        payload.updateStripe = true;
      }

      const url = modalMode === 'create'
        ? '/api/products'
        : `/api/products/${selectedProduct?.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        if (modalMode === 'create') {
          toast.success(data.stripeProductId
            ? `Product created with Stripe! Product ID: ${data.stripeProductId}`
            : 'Product created successfully!');
        } else {
          toast.success(data.stripePriceId
            ? 'Product updated! New Stripe price created.'
            : 'Product updated successfully!');
        }
        resetForm();
        fetchProducts();
        setShowCreateModal(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewModeChange = (mode: 'cards' | 'table') => {
    setViewMode(mode);
    localStorage.setItem('productsViewMode', mode);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
        <p className="text-gray-600">
          Manage your digital products and track sales
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => handleViewModeChange('cards')}
            className={`px-4 py-2 rounded-lg font-medium ${
              viewMode === 'cards'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => handleViewModeChange('table')}
            className={`px-4 py-2 rounded-lg font-medium ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Table
          </button>
        </div>
        <button
          onClick={handleCreateProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          + Create Product
        </button>
      </div>

      {/* Empty State */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-500 mb-4">No products yet</p>
          <p className="text-gray-400 text-sm mb-4">
            Create your first digital product to use in campaigns
          </p>
          <button
            onClick={handleCreateProduct}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create Product →
          </button>
        </div>
      ) : (
        <>
          {/* Cards View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                    <span className="text-6xl">📦</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {product.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description || 'No description'}
                    </p>
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(product.price, product.currency)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.salesCount} sales
                      </div>
                    </div>
                    {product.fileUrl && (
                      <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                        <span>📎</span>
                        <span>File attached</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProduct(product.id)}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditProduct(product.id)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(product.id, product.isActive)}
                        className="px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {product.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="px-3 py-2 border border-red-300 rounded text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(product.price, product.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.salesCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalMode === 'create' ? 'Create Product' : 'Edit Product'}
                </h2>
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Digital Art Course"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setFormErrors({ ...formErrors, name: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your product..."
                    value={formData.description}
                    maxLength={1000}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      setFormErrors({ ...formErrors, description: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    {formData.description.length} / 1000 characters
                  </p>
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                  )}
                </div>

                {/* Price and Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.50"
                      placeholder="9.99"
                      value={formData.price}
                      onChange={(e) => {
                        setFormData({ ...formData, price: e.target.value });
                        setFormErrors({ ...formErrors, price: '' });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.price && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </div>
                </div>

                {/* Digital File URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Digital File URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={formData.fileUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, fileUrl: e.target.value });
                        setFormErrors({ ...formErrors, fileUrl: '' });
                      }}
                      className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.fileUrl ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <label className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium cursor-pointer">
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                    </label>
                  </div>
                  {uploadingFile && (
                    <p className="text-blue-600 text-sm mt-1">Uploading...</p>
                  )}
                  {formErrors.fileUrl && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.fileUrl}</p>
                  )}
                </div>

                {/* Download Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Download Limit per Purchase
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={formData.downloadLimit}
                    onChange={(e) => {
                      setFormData({ ...formData, downloadLimit: e.target.value });
                      setFormErrors({ ...formErrors, downloadLimit: '' });
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.downloadLimit ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.downloadLimit && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.downloadLimit}</p>
                  )}
                </div>

                {/* Status (Edit mode only) */}
                {modalMode === 'edit' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Product is active
                    </label>
                  </div>
                )}

                {/* Stripe Integration (Create mode only) */}
                {modalMode === 'create' && (
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="createStripeProduct"
                        checked={formData.createStripeProduct}
                        onChange={(e) => setFormData({ ...formData, createStripeProduct: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="createStripeProduct" className="text-sm font-medium text-gray-700">
                        Create product in Stripe (enables payment processing)
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      Creates corresponding product and price in your Stripe account
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || uploadingFile}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    isSubmitting || uploadingFile
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting
                    ? modalMode === 'create' ? 'Creating...' : 'Saving...'
                    : modalMode === 'create' ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
