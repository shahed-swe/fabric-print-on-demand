import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PhotoIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import axios from '../config/axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const SUBCATEGORIES = ['Men\'s', 'Women\'s', 'Unisex', 'Kids'];
const FIT_OPTIONS = ['Regular Fit', 'Slim Fit', 'Oversized', 'Relaxed Fit'];
const PRINT_AREAS = ['Front', 'Back', 'Left Sleeve', 'Right Sleeve'];

// Dummy product for edit mode
const dummyProduct = {
  id: 1,
  name: 'Classic Cotton T-Shirt',
  shortDescription: 'Comfortable everyday t-shirt',
  description: '<p>Beautiful <strong>high-quality</strong> cotton t-shirt perfect for everyday wear.</p>',
  basePrice: 25.99,
  price: 30.00,
  material: '100% Cotton',
  weight: '180 GSM',
  fit: 'Regular Fit',
  subcategory: 'Unisex',
  category: 'T-Shirt',
  status: 'active',
  featured: false,
  sku: 'TSH-001',
  images: [
    {
      url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      alt: 'Front view',
      isPrimary: true,
      sortOrder: 0
    }
  ],
  sizes: [
    { size: 'S', stockQuantity: 10, enabled: true },
    { size: 'M', stockQuantity: 15, enabled: true },
    { size: 'L', stockQuantity: 12, enabled: true },
    { size: 'XL', stockQuantity: 8, enabled: true }
  ],
  colors: [
    { name: 'White', hexCode: '#FFFFFF', stockQuantity: 20, enabled: true },
    { name: 'Black', hexCode: '#000000', stockQuantity: 15, enabled: true }
  ],
  sizeChart: {
    measurements: [
      { size: 'S', chest: '36-38"', length: '27"', shoulder: '16"', sleeve: '8"' },
      { size: 'M', chest: '38-40"', length: '28"', shoulder: '17"', sleeve: '8"' },
      { size: 'L', chest: '40-42"', length: '29"', shoulder: '18"', sleeve: '8.5"' },
      { size: 'XL', chest: '42-44"', length: '30"', shoulder: '19"', sleeve: '8.5"' }
    ]
  },
  careInstructions: ['Machine wash cold', 'Tumble dry low', 'Do not bleach'],
  features: ['Pre-shrunk', 'Double-stitched', 'Tag-free'],
  printableAreas: [
    { name: 'Front', maxWidth: 12, maxHeight: 16, enabled: true },
    { name: 'Back', maxWidth: 12, maxHeight: 16, enabled: true }
  ],
  tags: ['cotton', 't-shirt', 'casual'],
  metaTitle: 'Classic Cotton T-Shirt',
  metaDescription: 'High-quality cotton t-shirt for everyday wear'
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    shortDescription: '',
    description: '',
    basePrice: '',
    price: '',
    material: '',
    weight: '',
    fit: 'Regular Fit',
    subcategory: 'Unisex',
    category: '',
    status: 'draft',
    featured: false,
    sizes: [],
    colors: [],
    images: [],
    sizeChart: { measurements: [] },
    careInstructions: [''],
    features: [''],
    printableAreas: [],
    tags: '',
    metaTitle: '',
    metaDescription: ''
  });

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [categories, setCategories] = useState([]);

  // Memoize Quill modules to prevent re-renders
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ]
  }), []);

  const quillFormats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link'
  ], []);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();

    // Fetch product if in edit mode
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const response = await axios.get(`/admin/products/${id}`);
          const product = response.data;
          setFormData({
            ...product,
            category: product.category?._id || '',
            tags: product.tags?.join(', ') || '',
            careInstructions: product.careInstructions?.length ? product.careInstructions : [''],
            features: product.features?.length ? product.features : [''],
            sizes: product.sizes || [],
            colors: product.colors || [],
            images: product.images || [],
            sizeChart: product.sizeChart || { measurements: [] },
            printableAreas: product.printableAreas || []
          });
          setLoading(false);
        } catch (error) {
          console.error('Error fetching product:', error);
          setError('Failed to load product data');
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleDescriptionChange = (value) => {
    setFormData({ ...formData, description: value });
  };

  // Image handling
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file, index) => ({
      url: URL.createObjectURL(file),
      alt: file.name,
      isPrimary: formData.images.length === 0 && index === 0,
      sortOrder: formData.images.length + index,
      file // Store file for upload
    }));
    setFormData({ 
      ...formData, 
      images: [...formData.images, ...newImages] 
    });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    // If removed image was primary, make first image primary
    if (formData.images[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    setFormData({ ...formData, images: newImages });
  };

  const setPrimaryImage = (index) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    setFormData({ ...formData, images: newImages });
  };

  // Size handling
  const toggleSize = (size) => {
    const existingSize = formData.sizes.find(s => s.size === size);
    if (existingSize) {
      setFormData({
        ...formData,
        sizes: formData.sizes.filter(s => s.size !== size)
      });
    } else {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, { size, stockQuantity: 0, enabled: true }]
      });
    }
  };

  const updateSizeStock = (size, stockQuantity) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.map(s => 
        s.size === size ? { ...s, stockQuantity: parseInt(stockQuantity) || 0 } : s
      )
    });
  };

  // Color handling
  const addColor = () => {
    setFormData({
      ...formData,
      colors: [...formData.colors, { name: '', hexCode: '#000000', stockQuantity: 0, enabled: true }]
    });
  };

  const removeColor = (index) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, i) => i !== index)
    });
  };

  const updateColor = (index, field, value) => {
    setFormData({
      ...formData,
      colors: formData.colors.map((c, i) => 
        i === index ? { ...c, [field]: value } : c
      )
    });
  };

  // Care instructions
  const addCareInstruction = () => {
    setFormData({
      ...formData,
      careInstructions: [...formData.careInstructions, '']
    });
  };

  const updateCareInstruction = (index, value) => {
    setFormData({
      ...formData,
      careInstructions: formData.careInstructions.map((inst, i) => 
        i === index ? value : inst
      )
    });
  };

  const removeCareInstruction = (index) => {
    setFormData({
      ...formData,
      careInstructions: formData.careInstructions.filter((_, i) => i !== index)
    });
  };

  // Features
  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const updateFeature = (index, value) => {
    setFormData({
      ...formData,
      features: formData.features.map((feat, i) => 
        i === index ? value : feat
      )
    });
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  // Print areas
  const togglePrintArea = (areaName) => {
    const existingArea = formData.printableAreas.find(a => a.name === areaName);
    if (existingArea) {
      setFormData({
        ...formData,
        printableAreas: formData.printableAreas.filter(a => a.name !== areaName)
      });
    } else {
      setFormData({
        ...formData,
        printableAreas: [...formData.printableAreas, { 
          name: areaName, 
          maxWidth: 12, 
          maxHeight: 16, 
          enabled: true 
        }]
      });
    }
  };

  const updatePrintArea = (areaName, field, value) => {
    setFormData({
      ...formData,
      printableAreas: formData.printableAreas.map(a => 
        a.name === areaName ? { ...a, [field]: parseFloat(value) || 0 } : a
      )
    });
  };

  // Size chart
  const addSizeChartRow = () => {
    setFormData({
      ...formData,
      sizeChart: {
        measurements: [...(formData.sizeChart.measurements || []), 
          { size: '', chest: '', length: '', shoulder: '', sleeve: '' }
        ]
      }
    });
  };

  const updateSizeChartRow = (index, field, value) => {
    const measurements = [...formData.sizeChart.measurements];
    measurements[index] = { ...measurements[index], [field]: value };
    setFormData({
      ...formData,
      sizeChart: { measurements }
    });
  };

  const removeSizeChartRow = (index) => {
    setFormData({
      ...formData,
      sizeChart: {
        measurements: formData.sizeChart.measurements.filter((_, i) => i !== index)
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setUploadProgress(0);

    try {
      // Upload images to MinIO first
      setUploadingImages(true);
      const uploadedImages = [];
      const totalImages = formData.images.filter(img => img.file).length;
      let uploadedCount = 0;
      
      for (let i = 0; i < formData.images.length; i++) {
        const img = formData.images[i];
        
        // If image has a file property, it needs to be uploaded
        if (img.file) {
          try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', img.file);
            
            const uploadResponse = await axios.post('/upload', formDataUpload, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            
            uploadedImages.push({
              url: uploadResponse.data.url,
              alt: img.alt || img.file.name,
              isPrimary: img.isPrimary,
              sortOrder: img.sortOrder || i
            });
            
            uploadedCount++;
            setUploadProgress(Math.round((uploadedCount / totalImages) * 100));
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw new Error(`Failed to upload image: ${img.alt || 'Unknown'}`);
          }
        } else {
          // Image already exists (editing mode)
          uploadedImages.push({
            url: img.url,
            alt: img.alt,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder || i
          });
        }
      }
      
      setUploadingImages(false);

      // Prepare data for API
      const productData = {
        ...formData,
        images: uploadedImages, // Use uploaded images
        basePrice: parseFloat(formData.basePrice) || 0,
        price: parseFloat(formData.price),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        careInstructions: formData.careInstructions.filter(inst => inst.trim()),
        features: formData.features.filter(feat => feat.trim())
      };

      // Remove empty arrays/objects
      if (productData.sizeChart?.measurements?.length === 0) {
        delete productData.sizeChart;
      }

      let response;
      if (isEditMode) {
        // Update existing product
        response = await axios.put(`/admin/products/${id}`, productData);
        console.log('Product updated:', response.data);
      } else {
        // Create new product
        response = await axios.post('/admin/products', productData);
        console.log('Product created:', response.data);
      }
      
      // Redirect to products page
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.response?.data?.message || error.message || 'Failed to save product');
      setSaving(false);
      setUploadingImages(false);
      setUploadProgress(0);
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
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['basic', 'variants', 'images', 'details', 'seo'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab === 'basic' ? 'Basic Info' : tab === 'variants' ? 'Sizes & Colors' : tab === 'details' ? 'Product Details' : tab}
            </button>
          ))}
        </nav>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="mt-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  id="sku"
                  className="mt-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="TSH-001"
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
                  Short Description
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  id="shortDescription"
                  className="mt-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  placeholder="Brief product description for listings"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Rich Text)
                </label>
                <ReactQuill 
                  theme="snow"
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white"
                  style={{ height: '250px', marginBottom: '50px' }}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700">
                  Base Price ($) *
                </label>
                <input
                  type="number"
                  name="basePrice"
                  id="basePrice"
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.basePrice}
                  onChange={handleChange}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Selling Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
                  Subcategory
                </label>
                <select
                  id="subcategory"
                  name="subcategory"
                  className="mt-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.subcategory}
                  onChange={handleChange}
                >
                  {SUBCATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="mt-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-6 flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  id="featured"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                  Featured Product
                </label>
              </div>
            </div>
          )}

          {/* Variants Tab */}
          {activeTab === 'variants' && (
            <div className="space-y-8">
              {/* Sizes */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Available Sizes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {AVAILABLE_SIZES.map((size) => {
                    const sizeData = formData.sizes.find(s => s.size === size);
                    const isSelected = !!sizeData;
                    return (
                      <div key={size} className="border rounded-lg p-3">
                        <label className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSize(size)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">{size}</span>
                        </label>
                        {isSelected && (
                          <input
                            type="number"
                            placeholder="Stock"
                            min="0"
                            value={sizeData.stockQuantity}
                            onChange={(e) => updateSizeStock(size, e.target.value)}
                            className="mt-1 block w-full text-sm border-gray-300 rounded-md"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Colors */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Colors</h3>
                  <button
                    type="button"
                    onClick={addColor}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Color
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <input
                        type="color"
                        value={color.hexCode}
                        onChange={(e) => updateColor(index, 'hexCode', e.target.value)}
                        className="h-10 w-10 rounded border-gray-300"
                      />
                      <input
                        type="text"
                        placeholder="Color name"
                        value={color.name}
                        onChange={(e) => updateColor(index, 'name', e.target.value)}
                        className="flex-1 text-sm border-gray-300 rounded-md"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        min="0"
                        value={color.stockQuantity}
                        onChange={(e) => updateColor(index, 'stockQuantity', parseInt(e.target.value) || 0)}
                        className="w-24 text-sm border-gray-300 rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Print Areas */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Printable Areas</h3>
                <div className="space-y-3">
                  {PRINT_AREAS.map((area) => {
                    const areaData = formData.printableAreas.find(a => a.name === area);
                    const isSelected = !!areaData;
                    return (
                      <div key={area} className="border rounded-lg p-3">
                        <label className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePrintArea(area)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">{area}</span>
                        </label>
                        {isSelected && (
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <div>
                              <label className="block text-xs text-gray-600">Max Width (inches)</label>
                              <input
                                type="number"
                                value={areaData.maxWidth}
                                onChange={(e) => updatePrintArea(area, 'maxWidth', e.target.value)}
                                className="mt-1 block w-full text-sm border-gray-300 rounded-md"
                                min="0"
                                step="0.1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600">Max Height (inches)</label>
                              <input
                                type="number"
                                value={areaData.maxHeight}
                                onChange={(e) => updatePrintArea(area, 'maxHeight', e.target.value)}
                                className="mt-1 block w-full text-sm border-gray-300 rounded-md"
                                min="0"
                                step="0.1"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
              
              {/* Upload Area */}
              <div className="mb-6">
                <label className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-primary-400">
                  <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <span className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                        Upload images
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="sr-only" 
                    onChange={handleImageUpload} 
                  />
                </label>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="h-40 w-full object-cover rounded-lg"
                    />
                    {image.isPrimary && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs rounded">
                        Primary
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      {!image.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(index)}
                          className="px-2 py-1 bg-white text-xs rounded hover:bg-gray-100"
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-8">
              {/* Material & Specs */}
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="material" className="block text-sm font-medium text-gray-700">
                    Material
                  </label>
                  <input
                    type="text"
                    name="material"
                    id="material"
                    className="mt-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.material}
                    onChange={handleChange}
                    placeholder="100% Cotton"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                    Weight (GSM)
                  </label>
                  <input
                    type="text"
                    name="weight"
                    id="weight"
                    className="mt-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="180 GSM"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="fit" className="block text-sm font-medium text-gray-700">
                    Fit
                  </label>
                  <select
                    id="fit"
                    name="fit"
                    className="mt-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.fit}
                    onChange={handleChange}
                  >
                    {FIT_OPTIONS.map(fit => (
                      <option key={fit} value={fit}>{fit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Features */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">Features</label>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g., Pre-shrunk"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Care Instructions */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">Care Instructions</label>
                  <button
                    type="button"
                    onClick={addCareInstruction}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add Instruction
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.careInstructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={instruction}
                        onChange={(e) => updateCareInstruction(index, e.target.value)}
                        className="flex-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g., Machine wash cold"
                      />
                      <button
                        type="button"
                        onClick={() => removeCareInstruction(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Size Chart */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">Size Chart</label>
                  <button
                    type="button"
                    onClick={addSizeChartRow}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add Row
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chest</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Length</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Shoulder</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sleeve</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.sizeChart.measurements.map((row, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.size}
                              onChange={(e) => updateSizeChartRow(index, 'size', e.target.value)}
                              className="w-full text-sm border-gray-300 rounded"
                              placeholder="S"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.chest}
                              onChange={(e) => updateSizeChartRow(index, 'chest', e.target.value)}
                              className="w-full text-sm border-gray-300 rounded"
                              placeholder='36-38"'
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.length}
                              onChange={(e) => updateSizeChartRow(index, 'length', e.target.value)}
                              className="w-full text-sm border-gray-300 rounded"
                              placeholder='27"'
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.shoulder}
                              onChange={(e) => updateSizeChartRow(index, 'shoulder', e.target.value)}
                              className="w-full text-sm border-gray-300 rounded"
                              placeholder='16"'
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.sleeve}
                              onChange={(e) => updateSizeChartRow(index, 'sleeve', e.target.value)}
                              className="w-full text-sm border-gray-300 rounded"
                              placeholder='8"'
                            />
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => removeSizeChartRow(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  id="tags"
                  placeholder="Enter tags separated by commas"
                  className="mt-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.tags}
                  onChange={handleChange}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Separate tags with commas (e.g. cotton, t-shirt, casual)
                </p>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  id="metaTitle"
                  className="mt-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  placeholder="SEO-friendly title"
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  id="metaDescription"
                  rows={3}
                  className="mt-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  placeholder="SEO-friendly description (150-160 characters)"
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-between">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => navigate('/products')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            disabled={saving}
          >
            {uploadingImages ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading images... {uploadProgress}%
              </span>
            ) : saving ? (
              'Saving...'
            ) : (
              isEditMode ? 'Update Product' : 'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
