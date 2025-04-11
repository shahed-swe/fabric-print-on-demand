import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PhotoIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

// Dummy product for edit mode
const dummyProduct = {
  id: 1,
  name: 'Floral Print Fabric',
  description: 'Beautiful floral pattern fabric perfect for dresses and home decor.',
  price: 24.99,
  material: 'Cotton',
  category: 'Floral',
  stock: 45,
  status: 'active',
  image: 'https://images.unsplash.com/photo-1590422405310-11641013a0dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  dimensions: '1.5m x 2m',
  weight: '0.5kg',
  tags: ['floral', 'cotton', 'print', 'fabric'],
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    material: '',
    category: '',
    stock: '',
    status: 'active',
    image: '',
    dimensions: '',
    weight: '',
    tags: '',
  });

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      // In a real app:
      // const fetchProduct = async () => {
      //   try {
      //     const response = await axios.get(`/api/admin/products/${id}`);
      //     const product = response.data;
      //     setFormData({
      //       ...product,
      //       tags: product.tags.join(', '),
      //     });
      //     setImagePreview(product.image);
      //     setLoading(false);
      //   } catch (error) {
      //     console.error('Error fetching product:', error);
      //     setError('Failed to load product data');
      //     setLoading(false);
      //   }
      // };
      // fetchProduct();

      // For demo:
      setTimeout(() => {
        setFormData({
          ...dummyProduct,
          tags: dummyProduct.tags.join(', '),
        });
        setImagePreview(dummyProduct.image);
        setLoading(false);
      }, 600);
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // For a real app, you would handle file upload to a server or cloud storage
    // For this demo, we'll just create a local URL for preview
    const previewUrl = URL.createObjectURL(file);
    setFormData({ ...formData, image: file });
    setImagePreview(previewUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Prepare data for API
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      // In a real app:
      // if (isEditMode) {
      //   await axios.put(`/api/admin/products/${id}`, productData);
      // } else {
      //   await axios.post('/api/admin/products', productData);
      // }

      // For demo, just simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to products page
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {isEditMode ? 'Edit Product' : 'Add New Product'}
      </h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Product Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price ($)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="price"
                  id="price"
                  required
                  min="0"
                  step="0.01"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Stock
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="stock"
                  id="stock"
                  required
                  min="0"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.stock}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="mt-1">
                <select
                  id="status"
                  name="status"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="material" className="block text-sm font-medium text-gray-700">
                Material
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="material"
                  id="material"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.material}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="category"
                  id="category"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">
                Dimensions
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="dimensions"
                  id="dimensions"
                  placeholder="e.g., 2m x 1.5m"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.dimensions}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                Weight
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="weight"
                  id="weight"
                  placeholder="e.g., 0.5kg"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.weight}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="sm:col-span-6">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="tags"
                  id="tags"
                  placeholder="Enter tags separated by commas"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.tags}
                  onChange={handleChange}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Separate tags with commas (e.g. cotton, floral, blue)
              </p>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Product Image
              </label>
              <div className="mt-1 flex items-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="h-32 w-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                      onClick={() => {
                        setImagePreview('');
                        setFormData({ ...formData, image: '' });
                      }}
                    >
                      <span className="sr-only">Remove image</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                        >
                          <span>Upload an image</span>
                          <input id="image-upload" name="image-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
            onClick={() => navigate('/products')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={saving}
          >
            {saving ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
