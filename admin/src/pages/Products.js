import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

// For demo purposes, using dummy data
const dummyProducts = [
  {
    id: 1,
    name: 'Floral Print Fabric',
    price: 24.99,
    material: 'Cotton',
    image: 'https://images.unsplash.com/photo-1590422405310-11641013a0dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    stock: 45,
    category: 'Floral',
    status: 'active',
  },
  {
    id: 2,
    name: 'Abstract Pattern Textile',
    price: 19.99,
    material: 'Polyester',
    image: 'https://images.unsplash.com/photo-1528459061998-56fd57ad86e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    stock: 32,
    category: 'Abstract',
    status: 'active',
  },
  {
    id: 3,
    name: 'Premium Cotton Blend',
    price: 29.99,
    material: 'Cotton',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    stock: 18,
    category: 'Solid',
    status: 'active',
  },
  {
    id: 4,
    name: 'Geometric Design Fabric',
    price: 34.99,
    material: 'Polyester',
    image: 'https://images.unsplash.com/photo-1579493933704-420751d7b88f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    stock: 27,
    category: 'Geometric',
    status: 'active',
  },
  {
    id: 5,
    name: 'Vintage Lace Material',
    price: 27.50,
    material: 'Cotton',
    image: 'https://images.unsplash.com/photo-1573495627361-d9b87960b12d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    stock: 12,
    category: 'Vintage',
    status: 'inactive',
  },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({
    message: '',
    type: 'success', // 'success', 'error', 'warning'
  });
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await axios.get('/api/admin/products');
        // setProducts(response.data);
        
        // For demo purposes:
        setTimeout(() => {
          setProducts(dummyProducts);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  const handleEdit = (id) => {
    navigate(`/products/edit/${id}`);
  };
  
  const handleDelete = (id) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    try {
      // In a real app:
      // await axios.delete(`/api/admin/products/${productToDelete}`);
      
      // For demo:
      setProducts(products.filter(product => product.id !== productToDelete));
      setNotification({
        message: 'Product deleted successfully',
        type: 'success',
      });
      setShowNotification(true);
    } catch (error) {
      console.error('Error deleting product:', error);
      setNotification({
        message: 'Failed to delete product',
        type: 'error',
      });
      setShowNotification(true);
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };
  
  const filteredProducts = searchTerm 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  const getStatusBadgeClass = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <div className="py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <button
            onClick={() => navigate('/products/new')}
            className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add New Product
          </button>
        </div>

        {/* Search field */}
        <div className="mb-6">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search products by name, material, or category"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">No products found. Try adjusting your search or add a new product.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <li key={product.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img className="h-12 w-12 rounded-md object-cover" src={product.image} alt={product.name} />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-primary-600 truncate">{product.name}</p>
                            <div className="flex mt-1">
                              <span className="text-sm text-gray-500 mr-4">{product.material}</span>
                              <span className="text-sm text-gray-500">{product.category}</span>
                            </div>
                          </div>
                          <div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(product.status)}`}>
                              {product.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-800">
                              ${product.price.toFixed(2)}
                            </p>
                            <p className={`mt-2 flex items-center text-sm ${
                              product.stock < 20 ? 'text-red-600 font-bold' : 'text-gray-500'
                            } sm:mt-0 sm:ml-6`}>
                              Stock: {product.stock}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm sm:mt-0">
                            <button
                              onClick={() => handleEdit(product.id)}
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Delete Product
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this product? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {showNotification && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-md shadow-lg ${
          notification.type === 'success' ? 'bg-green-50 text-green-800' : 
          notification.type === 'error' ? 'bg-red-50 text-red-800' : 
          'bg-yellow-50 text-yellow-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {notification.type === 'success' && (
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {notification.type === 'error' && (
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setShowNotification(false)}
                  className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 011.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
