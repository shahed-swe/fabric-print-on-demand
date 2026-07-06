import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon, PhotoIcon } from '@heroicons/react/24/outline';
import axios from '../config/axios';

export default function CustomStyles() {
  const [customStyles, setCustomStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [styleToDelete, setStyleToDelete] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStyle, setEditingStyle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    frontImage: null,
    backImage: null,
    frontImagePreview: null,
    backImagePreview: null,
    sortOrder: 0,
    active: true,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomStyles();
  }, [searchTerm]);

  const fetchCustomStyles = async () => {
    setLoading(true);
    try {
      const params = { sortBy: 'sortOrder' };
      if (searchTerm) params.search = searchTerm;

      const response = await axios.get('/admin/custom-styles', { params });
      setCustomStyles(response.data.customStyles || response.data || []);
    } catch (error) {
      console.error('Error fetching custom styles:', error);
      showNotification('Failed to fetch custom styles', 'error');
      setCustomStyles([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleAddNew = () => {
    setEditingStyle(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      frontImage: null,
      backImage: null,
      frontImagePreview: null,
      backImagePreview: null,
      sortOrder: 0,
      active: true,
    });
    setShowForm(true);
  };

  const handleEdit = (style) => {
    setEditingStyle(style);
    setFormData({
      title: style.title,
      description: style.description,
      price: style.price,
      frontImage: null,
      backImage: null,
      frontImagePreview: style.frontImage?.url || null,
      backImagePreview: style.backImage?.url || null,
      sortOrder: style.sortOrder,
      active: style.active,
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setStyleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/admin/custom-styles/${styleToDelete}`);
      showNotification('Custom style deleted successfully', 'success');
      fetchCustomStyles();
    } catch (error) {
      console.error('Error deleting custom style:', error);
      showNotification(
        error.response?.data?.message || 'Failed to delete custom style',
        'error'
      );
    } finally {
      setDeleteDialogOpen(false);
      setStyleToDelete(null);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageUpload = (e, imageType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setFormData({
        ...formData,
        [imageType]: file,
        [`${imageType}Preview`]: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.price || !formData.frontImagePreview || !formData.backImagePreview) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    setSaving(true);
    try {
      let frontImageData = editingStyle?.frontImage || null;
      let backImageData = editingStyle?.backImage || null;

      // Upload front image if new
      if (formData.frontImage) {
        const frontFormData = new FormData();
        frontFormData.append('file', formData.frontImage);
        try {
          const uploadResponse = await axios.post('/upload', frontFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          frontImageData = {
            fileId: uploadResponse.data.filename,
            url: uploadResponse.data.url,
            filename: uploadResponse.data.filename
          };
        } catch (uploadError) {
          console.error('Error uploading front image:', uploadError);
          showNotification('Failed to upload front image', 'error');
          setSaving(false);
          return;
        }
      }

      // Upload back image if new
      if (formData.backImage) {
        const backFormData = new FormData();
        backFormData.append('file', formData.backImage);
        try {
          const uploadResponse = await axios.post('/upload', backFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          backImageData = {
            fileId: uploadResponse.data.filename,
            url: uploadResponse.data.url,
            filename: uploadResponse.data.filename
          };
        } catch (uploadError) {
          console.error('Error uploading back image:', uploadError);
          showNotification('Failed to upload back image', 'error');
          setSaving(false);
          return;
        }
      }

      const data = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        frontImage: frontImageData,
        backImage: backImageData,
        sortOrder: parseInt(formData.sortOrder),
        active: formData.active
      };

      if (editingStyle) {
        await axios.put(`/admin/custom-styles/${editingStyle._id}`, data);
        showNotification('Custom style updated successfully', 'success');
      } else {
        await axios.post('/admin/custom-styles', data);
        showNotification('Custom style created successfully', 'success');
      }

      setShowForm(false);
      fetchCustomStyles();
    } catch (error) {
      console.error('Error saving custom style:', error);
      showNotification(
        error.response?.data?.message || 'Failed to save custom style',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Custom Styles</h1>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Style
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search custom styles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl my-8 max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingStyle ? 'Edit Custom Style' : 'Add New Custom Style'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g., Men's T-shirt"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Optional description"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleFormChange}
                  placeholder="e.g., 500"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Front Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Front Image <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  {formData.frontImagePreview && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">Current preview:</p>
                      <img
                        src={formData.frontImagePreview}
                        alt="Front preview"
                        className="max-h-64 w-auto mx-auto object-contain rounded-lg border border-gray-200"
                        onError={(e) => {
                          console.error('Front image failed to load:', formData.frontImagePreview);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <label className="flex items-center justify-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-400">
                    <div className="text-center">
                      <PhotoIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Click to upload front image
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'frontImage')}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {/* Back Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Back Image <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  {formData.backImagePreview && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">Current preview:</p>
                      <img
                        src={formData.backImagePreview}
                        alt="Back preview"
                        className="max-h-64 w-auto mx-auto object-contain rounded-lg border border-gray-200"
                        onError={(e) => {
                          console.error('Back image failed to load:', formData.backImagePreview);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <label className="flex items-center justify-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-400">
                    <div className="text-center">
                      <PhotoIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Click to upload back image
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'backImage')}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  id="active"
                  checked={formData.active}
                  onChange={handleFormChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingStyle ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4">Delete Custom Style?</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this custom style?</p>
            <div className="flex gap-4">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading custom styles...</div>
        ) : customStyles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No custom styles found. Click "Add New Style" to create one.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sort Order
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customStyles.map((style) => (
                <tr key={style._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium text-gray-900">{style.title}</p>
                      {style.description && (
                        <p className="text-sm text-gray-500">{style.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    ${style.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        style.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {style.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {style.sortOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(style)}
                        className="text-blue-600 hover:text-blue-900 transition"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(style._id)}
                        className="text-red-600 hover:text-red-900 transition"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
