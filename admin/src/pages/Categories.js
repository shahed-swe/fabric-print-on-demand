import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

// Dummy categories data
const dummyCategories = [
  { id: 1, name: 'Floral', productsCount: 24, description: 'Floral pattern fabrics', slug: 'floral' },
  { id: 2, name: 'Abstract', productsCount: 18, description: 'Abstract pattern designs', slug: 'abstract' },
  { id: 3, name: 'Geometric', productsCount: 15, description: 'Geometric pattern fabrics', slug: 'geometric' },
  { id: 4, name: 'Solid', productsCount: 32, description: 'Solid color fabrics', slug: 'solid' },
  { id: 5, name: 'Vintage', productsCount: 9, description: 'Vintage style fabrics', slug: 'vintage' },
  { id: 6, name: 'Modern', productsCount: 21, description: 'Modern design fabrics', slug: 'modern' },
  { id: 7, name: 'Kids', productsCount: 17, description: 'Kid-friendly patterns', slug: 'kids' },
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ id: null, name: '', description: '', slug: '' });
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // In a real app:
        // const response = await axios.get('/api/admin/categories');
        // setCategories(response.data);
        
        // For demo:
        setTimeout(() => {
          setCategories(dummyCategories);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleEdit = (category) => {
    setCurrentCategory(category);
    setIsEditMode(true);
    setShowModal(true);
  };
  
  const handleAdd = () => {
    setCurrentCategory({ id: null, name: '', description: '', slug: '' });
    setIsEditMode(false);
    setShowModal(true);
  };
  
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    try {
      // In a real app:
      // await axios.delete(`/api/admin/categories/${deleteId}`);
      
      // For demo:
      setCategories(categories.filter(cat => cat.id !== deleteId));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditMode) {
        // In a real app:
        // await axios.put(`/api/admin/categories/${currentCategory.id}`, currentCategory);
        
        // For demo:
        setCategories(categories.map(cat => 
          cat.id === currentCategory.id ? currentCategory : cat
        ));
      } else {
        // In a real app:
        // const response = await axios.post('/api/admin/categories', currentCategory);
        // const newCategory = response.data;
        
        // For demo:
        const newCategory = {
          ...currentCategory,
          id: Math.max(...categories.map(c => c.id)) + 1,
          productsCount: 0
        };
        setCategories([...categories, newCategory]);
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory({ ...currentCategory, [name]: value });
    
    // Auto-generate slug when name changes
    if (name === 'name') {
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setCurrentCategory(prev => ({ ...prev, slug }));
    }
  };

  return (
    <>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Category
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {categories.map((category) => (
                <li key={category.id}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">{category.name}</h3>
                        <p className="mt-1 text-sm text-gray-600">{category.description}</p>
                        <p className="mt-1 text-xs text-gray-500">Slug: {category.slug}</p>
                      </div>
                      <div className="mt-4 sm:mt-0 flex items-center">
                        <div className="bg-gray-100 px-2.5 py-1 rounded-full text-sm text-gray-800">
                          {category.productsCount} {category.productsCount === 1 ? 'product' : 'products'}
                        </div>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-primary-600 hover:text-primary-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {isEditMode ? 'Edit Category' : 'Add New Category'}
                    </h3>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={currentCategory.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={currentCategory.description}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
                    <input
                      type="text"
                      name="slug"
                      id="slug"
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={currentCategory.slug}
                      onChange={handleInputChange}
                    />
                    <p className="mt-1 text-xs text-gray-500">Used for URL: /categories/{currentCategory.slug}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isEditMode ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Delete Category
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this category? All products associated with this category will be untagged. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
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
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
