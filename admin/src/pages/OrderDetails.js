import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import axios from '../config/axios';

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`/orders`);
        const foundOrder = response.data.find(o => o._id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
          setNewStatus(foundOrder.status);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) return;

    try {
      setUpdating(true);
      await axios.put(`/orders/${orderId}`, { status: newStatus });
      setOrder({ ...order, status: newStatus });
      alert('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Packed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Received':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressSteps = (status) => {
    const steps = ['Received', 'Processing', 'Packed', 'Shipped', 'Delivered'];
    const currentIndex = steps.indexOf(status);
    return steps.map((step, index) => ({
      step,
      completed: index < currentIndex,
      current: index === currentIndex,
      pending: index > currentIndex
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-6">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-primary-600 hover:text-primary-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Orders
        </button>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 text-lg">Order not found</p>
        </div>
      </div>
    );
  }

  const progressSteps = getProgressSteps(order.status);
  const itemTotal = order.items?.reduce((total, item) => total + (item.price || 0), 0) || 0;

  return (
    <div className="py-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center text-primary-600 hover:text-primary-900 mb-6 font-medium"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Orders
      </button>

      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order._id?.toString().slice(-8) || 'N/A'}
            </h1>
            <p className="text-gray-600 mt-1">
              Customer: <span className="font-semibold">{order.user?.name || 'Unknown'}</span>
            </p>
            <p className="text-gray-600">
              Email: <span className="font-semibold">{order.user?.email || 'N/A'}</span>
            </p>
            <p className="text-gray-600">
              Date: <span className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
            <p className="text-sm text-gray-500 mt-2">
              Payment: <span className="capitalize">{order.paymentStatus || 'Pending'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Items and Total */}
        <div className="lg:col-span-2">
          {/* Order Progress */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Progress</h2>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                {progressSteps.map((step, index) => (
                  <React.Fragment key={step.step}>
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 ${
                        step.completed ? 'bg-green-500 border-green-500 text-white' :
                        step.current ? 'bg-blue-500 border-blue-500 text-white' :
                        'bg-gray-200 border-gray-300 text-gray-500'
                      }`}>
                        {step.completed ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>
                      <span className={`text-xs font-medium text-center ${
                        step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.step}
                      </span>
                    </div>
                    {index < progressSteps.length - 1 && (
                      <div className={`h-0.5 flex-1 mb-8 ${
                        progressSteps.slice(0, index + 1).every(s => s.completed || s.current) ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Status Update */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Update Order Status</h3>
              <div className="flex gap-2">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Received">Received</option>
                  <option value="Processing">Processing</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={newStatus === order.status || updating}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {updating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>

            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item, index) => {
                  // Infer itemType if missing (for backward compatibility)
                  const itemType = item.itemType || (item.productId ? 'product' : 'design');
                  
                  return (
                  <div key={item._id || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      {/* Item Image/Icon */}
                      {itemType === 'product' && item.productId ? (
                        <img
                          src={item.productId.images?.find(img => img.isPrimary)?.url || item.productId.images?.[0]?.url || 'https://via.placeholder.com/80'}
                          alt={item.productId.name}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-center flex-shrink-0">
                          <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                        </div>
                      )}

                      <div className="flex-1">
                        {/* Item Type Badge */}
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mb-2 ${
                          itemType === 'design' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {itemType === 'design' ? 'Custom Design' : 'Product'}
                        </span>

                        {/* Item Title */}
                        <h4 className="font-semibold text-gray-900">
                          {itemType === 'product' ? item.productId?.name : item.designId?.title || 'Custom Design'}
                        </h4>

                        {/* Product Details */}
                        {itemType === 'product' && (
                          <div className="text-sm text-gray-600 mt-1">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.size && item.color && <span className="mx-2">•</span>}
                            {item.color && <span>Color: {item.color}</span>}
                            <div className="mt-1">Quantity: {item.quantity}</div>
                          </div>
                        )}

                        {/* Design File ID */}
                        {itemType === 'design' && item.designId?.fileId && (
                          <p className="text-sm text-gray-500 mt-1">File ID: {item.designId.fileId}</p>
                        )}

                        {/* Design Elements Summary */}
                        {itemType === 'design' && item.designId?.elements && (
                          <div className="mt-2 text-sm text-gray-600">
                            <div className="flex gap-4">
                              {(item.designId.elements.front?.texts?.length > 0 || item.designId.elements.front?.images?.length > 0) && (
                                <span className="text-green-600">
                                  Front: {item.designId.elements.front.texts?.length || 0} texts, {item.designId.elements.front.images?.length || 0} images
                                </span>
                              )}
                              {(item.designId.elements.back?.texts?.length > 0 || item.designId.elements.back?.images?.length > 0) && (
                                <span className="text-purple-600">
                                  Back: {item.designId.elements.back.texts?.length || 0} texts, {item.designId.elements.back.images?.length || 0} images
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => navigate(`/design-elements?designId=${item.designId._id}`)}
                              className="mt-2 text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                            >
                              View Design Details
                            </button>
                          </div>
                        )}

                        {/* Design Size Quantities */}
                        {itemType === 'design' && item.designId?.sizeQuantities && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {Object.entries(item.designId.sizeQuantities).map(([size, quantity]) => (
                              quantity > 0 && (
                                <span key={size} className="inline-flex items-center px-3 py-1 bg-white rounded-md text-sm text-gray-700 border border-gray-200">
                                  {size}: {quantity}
                                </span>
                              )
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary-600">
                          ৳{item.price?.toFixed(2) || '0.00'}
                        </span>
                        {itemType === 'product' && item.quantity > 1 && (
                          <div className="text-xs text-gray-500 mt-1">
                            ৳{(item.price / item.quantity).toFixed(2)} each
                          </div>
                        )}
                        {itemType === 'design' && item.quantity && (
                          <div className="text-xs text-gray-500 mt-1">
                            ৳{(item.price / item.quantity).toFixed(2)} per item
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}

                {/* Total */}
                <div className="border-t-2 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ৳{itemTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No items in this order</p>
            )}
          </div>
        </div>

        {/* Right Column - Shipping Address */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Address</h2>

            {order.shippingAddress ? (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start mb-4">
                  <svg className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {order.shippingAddress.fullName || 'N/A'}
                    </h3>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>{order.shippingAddress.streetAddress || 'N/A'}</p>
                      <p>
                        {order.shippingAddress.city || 'N/A'}, {order.shippingAddress.state || 'N/A'} {order.shippingAddress.postalCode || 'N/A'}
                      </p>
                      <p>{order.shippingAddress.country || 'N/A'}</p>
                    </div>
                    {order.shippingAddress.phone && (
                      <div className="flex items-center mt-3 text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {order.shippingAddress.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                <p className="text-sm text-gray-500">No shipping address available</p>
              </div>
            )}

            {/* Order Summary */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900 font-medium">৳{itemTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="text-gray-900 font-medium">{order.items?.length || 0}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-primary-600">৳{order.totalAmount?.toFixed(2) || itemTotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-xs text-gray-600">Payment Status:</span>
                  <p className="mt-1 inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize">
                    {order.paymentStatus || 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

