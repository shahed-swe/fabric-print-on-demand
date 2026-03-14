import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import axios from '../config/axios';

export default function Colors() {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [colorToDelete, setColorToDelete] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    hexCode: '',
    description: '',
    sortOrder: 0,
    active: true,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchColors();
  }, [searchTerm]);

  const fetchColors = async () => {
    setLoading(true);
    try {
      const params = { sortBy: 'sortOrder' };
      if (searchTerm) params.search = searchTerm;

      const response = await axios.get('/admin/colors', { params });
      setColors(response.data.colors || response.data || []);
    } catch (error) {
      console.error('Error fetching colors:', error);
      showNotification('Failed to fetch colors', 'error');
      setColors([]);
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
    setEditingColor(null);
    setFormData({
      name: '',
      displayName: '',
      hexCode: '',
      description: '',
      sortOrder: 0,
      active: true,
    });
    setShowForm(true);
  };

  const handleEdit = (color) => {
    setEditingColor(color);
    setFormData({
      name: color.name,
      displayName: color.displayName,
      hexCode: color.hexCode,
      description: color.description || '',
      sortOrder: color.sortOrder,
      active: color.active,
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setColorToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/admin/colors/${colorToDelete}`);
      showNotification('Color deleted successfully', 'success');
      fetchColors();
    } catch (error) {
      console.error('Error deleting color:', error);
      showNotification(
        error.response?.data?.message || 'Failed to delete color',
        'error'
      );
    } finally {
      setDeleteDialogOpen(false);
      setColorToDelete(null);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.displayName || !formData.hexCode) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    // Validate hex code format
    if (!/#[0-9A-F]{6}/i.test(formData.hexCode)) {
      showNotification('Invalid hex code format (e.g., #FF5733)', 'error');
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: formData.name,
        displayName: formData.displayName,
        hexCode: formData.hexCode.toUpperCase(),
        description: formData.description,
        sortOrder: parseInt(formData.sortOrder),
        active: formData.active
      };

      if (editingColor) {
        await axios.put(`/admin/colors/${editingColor._id}`, data);
        showNotification('Color updated successfully', 'success');
      } else {
        await axios.post('/admin/colors', data);
        showNotification('Color created successfully', 'success');
      }

      setShowForm(false);
      fetchColors();
    } catch (error) {
      console.error('Error saving color:', error);
      showNotification(
        error.response?.data?.message || 'Failed to save color',
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Colors</h1>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Color
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search colors..."
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
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl my-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingColor ? 'Edit Color' : 'Add New Color'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Slug) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., dark-blue"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleFormChange}
                  placeholder="e.g., Dark Blue"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Hex Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hex Code <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="hexCode"
                    value={formData.hexCode}
                    onChange={handleFormChange}
                    placeholder="e.g., #0C0CAE"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {formData.hexCode && /#[0-9A-F]{6}/i.test(formData.hexCode) && (
                    <div
                      style={{ backgroundColor: formData.hexCode }}
                      className="w-12 h-10 rounded-lg border-2 border-gray-300"
                      title={formData.hexCode}
                    />
                  )}
                </div>
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
                  {saving ? 'Saving...' : editingColor ? 'Update' : 'Create'}
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
            <h2 className="text-lg font-bold mb-4">Delete Color?</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this color?</p>
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
          <div className="p-8 text-center text-gray-500">Loading colors...</div>
        ) : colors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No colors found. Click "Add New Color" to create one.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Display Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hex Code
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
              {colors.map((color) => (
                <tr key={color._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      style={{ backgroundColor: color.hexCode }}
                      className="w-10 h-10 rounded-lg border-2 border-gray-300"
                      title={color.hexCode}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {color.displayName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {color.hexCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        color.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {color.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {color.sortOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(color)}
                        className="text-blue-600 hover:text-blue-900 transition"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(color._id)}
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
