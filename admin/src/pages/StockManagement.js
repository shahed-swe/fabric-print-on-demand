import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { MagnifyingGlassIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

export default function StockManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [stockUpdates, setStockUpdates] = useState({});
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/admin/products');
      setProducts(response.data.products || response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleSelectProduct = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
      // Remove stock updates for unselected product
      const newStockUpdates = { ...stockUpdates };
      delete newStockUpdates[productId];
      setStockUpdates(newStockUpdates);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
      setStockUpdates({});
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p._id)));
    }
  };

  const updateStock = (productId, sizeIndex, colorIndex, change, type) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    const updates = stockUpdates[productId] || {
      sizes: [...product.sizes],
      colors: [...product.colors]
    };

    if (type === 'size') {
      const newQuantity = Math.max(0, updates.sizes[sizeIndex].stockQuantity + change);
      updates.sizes[sizeIndex] = {
        ...updates.sizes[sizeIndex],
        stockQuantity: newQuantity
      };
    } else if (type === 'color') {
      const newQuantity = Math.max(0, updates.colors[colorIndex].stockQuantity + change);
      updates.colors[colorIndex] = {
        ...updates.colors[colorIndex],
        stockQuantity: newQuantity
      };
    }

    setStockUpdates({
      ...stockUpdates,
      [productId]: updates
    });
  };

  const setStockValue = (productId, sizeIndex, colorIndex, value, type) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    const updates = stockUpdates[productId] || {
      sizes: [...product.sizes],
      colors: [...product.colors]
    };

    const numValue = Math.max(0, parseInt(value) || 0);

    if (type === 'size') {
      updates.sizes[sizeIndex] = {
        ...updates.sizes[sizeIndex],
        stockQuantity: numValue
      };
    } else if (type === 'color') {
      updates.colors[colorIndex] = {
        ...updates.colors[colorIndex],
        stockQuantity: numValue
      };
    }

    setStockUpdates({
      ...stockUpdates,
      [productId]: updates
    });
  };

  const handleSaveStocks = async () => {
    setSaving(true);
    try {
      const updates = Array.from(selectedProducts).map(productId => ({
        productId,
        ...stockUpdates[productId]
      }));

      await Promise.all(
        updates.map(update =>
          axios.patch(`/admin/products/${update.productId}/stock`, {
            sizes: update.sizes,
            colors: update.colors
          })
        )
      );

      setNotification({
        show: true,
        message: `Successfully updated stock for ${updates.length} product(s)`,
        type: 'success'
      });

      // Refresh products
      await fetchProducts();
      setSelectedProducts(new Set());
      setStockUpdates({});

      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error updating stock:', error);
      setNotification({
        show: true,
        message: error.response?.data?.message || 'Failed to update stock',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = searchTerm
    ? products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  const getDisplayStock = (product, index, type) => {
    if (stockUpdates[product._id]) {
      return type === 'size'
        ? stockUpdates[product._id].sizes[index].stockQuantity
        : stockUpdates[product._id].colors[index].stockQuantity;
    }
    return type === 'size'
      ? product.sizes[index].stockQuantity
      : product.colors[index].stockQuantity;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Stock Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Select products and update their stock quantities for sizes and colors.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          {selectedProducts.size > 0 && (
            <button
              type="button"
              onClick={handleSaveStocks}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto disabled:opacity-50"
            >
              {saving ? 'Saving...' : `Update Stock (${selectedProducts.size})`}
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative rounded-md shadow-sm max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Search by name or SKU..."
          />
        </div>
      </div>

      {/* Products List */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                      <input
                        type="checkbox"
                        checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                        onChange={handleSelectAll}
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                      />
                    </th>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Product
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Sizes Stock
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Colors Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedProducts.has(product._id);
                    return (
                      <tr key={product._id} className={isSelected ? 'bg-primary-50' : ''}>
                        <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectProduct(product._id)}
                            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                          />
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded object-cover"
                                src={product.images?.[0]?.url || 'https://via.placeholder.com/150'}
                                alt={product.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-gray-500">{product.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {isSelected ? (
                            <div className="space-y-2">
                              {product.sizes?.map((size, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className="w-12 text-xs font-medium">{size.size}:</span>
                                  <button
                                    onClick={() => updateStock(product._id, idx, null, -10, 'size')}
                                    className="p-1 rounded hover:bg-gray-200"
                                  >
                                    <MinusIcon className="h-4 w-4" />
                                  </button>
                                  <input
                                    type="number"
                                    value={getDisplayStock(product, idx, 'size')}
                                    onChange={(e) => setStockValue(product._id, idx, null, e.target.value, 'size')}
                                    className="w-20 rounded border-gray-300 text-center text-sm focus:border-primary-500 focus:ring-primary-500"
                                    min="0"
                                  />
                                  <button
                                    onClick={() => updateStock(product._id, idx, null, 10, 'size')}
                                    className="p-1 rounded hover:bg-gray-200"
                                  >
                                    <PlusIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs space-y-1">
                              {product.sizes?.map((size, idx) => (
                                <div key={idx}>
                                  {size.size}: <span className="font-medium">{size.stockQuantity}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {isSelected ? (
                            <div className="space-y-2">
                              {product.colors?.map((color, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 w-24">
                                    <div
                                      className="w-4 h-4 rounded border border-gray-300"
                                      style={{ backgroundColor: color.hexCode }}
                                    />
                                    <span className="text-xs truncate">{color.name}</span>
                                  </div>
                                  <button
                                    onClick={() => updateStock(product._id, null, idx, -10, 'color')}
                                    className="p-1 rounded hover:bg-gray-200"
                                  >
                                    <MinusIcon className="h-4 w-4" />
                                  </button>
                                  <input
                                    type="number"
                                    value={getDisplayStock(product, idx, 'color')}
                                    onChange={(e) => setStockValue(product._id, null, idx, e.target.value, 'color')}
                                    className="w-20 rounded border-gray-300 text-center text-sm focus:border-primary-500 focus:ring-primary-500"
                                    min="0"
                                  />
                                  <button
                                    onClick={() => updateStock(product._id, null, idx, 10, 'color')}
                                    className="p-1 rounded hover:bg-gray-200"
                                  >
                                    <PlusIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs space-y-1">
                              {product.colors?.map((color, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <div
                                    className="w-3 h-3 rounded border border-gray-300"
                                    style={{ backgroundColor: color.hexCode }}
                                  />
                                  {color.name}: <span className="font-medium">{color.stockQuantity}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed bottom-4 right-4 px-6 py-4 rounded-md shadow-lg ${
          notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
