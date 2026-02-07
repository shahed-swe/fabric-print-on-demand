import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { orderService } from '../services/order';
import { shippingService } from '../services/shipping';
import { designService } from '../services/design';

interface Order {
    _id: string;
    user: {
        _id: string;
        name: string;
    };
    items: {
        _id: string;
        itemType: 'product' | 'design';
        designId?: {
            _id: string;
            title: string;
            sizeQuantities: { [size: string]: number };
            fileId: string;
            price: number;
        };
        productId?: {
            _id: string;
            name: string;
            images: { url: string; isPrimary: boolean }[];
        };
        size?: string;
        color?: string;
        quantity: number;
        price: number;
    }[];
    paymentStatus: string;
    status: string;
    shippingAddress: {
        fullName: string;
        streetAddress: string;
        city: string;
        state: string;
        postalCode: string;
        phone: string;
    };
    userId: string;
    totalAmount: number;
}

interface ShippingAddress {
    _id: string;
    fullName: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    userId: string;
}

const OrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [shippingAddresses, setShippingAddresses] = useState<{ [key: string]: ShippingAddress }>({});
    const { user } = useAuth();
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);

    useEffect(() => {
        const fetchOrdersAndAddresses = async () => {
            try {
                const ordersData = await orderService.getOrders();
                console.log('Orders fetched:', ordersData);
                
                // Make sure we have orders data before proceeding
                if (!ordersData || !Array.isArray(ordersData)) {
                    console.error('Invalid orders data format:', ordersData);
                    return;
                }
                console.log(user)
                // Filter orders based on user role
                const filteredOrders = user?.type === 'Admin' 
                    ? ordersData 
                    : ordersData.filter((order: Order) => 
                        order.userId === user?._id || (order.user && order.user._id === user?._id)
                    );
                
                console.log('Filtered orders:', filteredOrders);
                setOrders(filteredOrders);

                // Fetch shipping addresses for each unique user
                const uniqueUserIds = Array.from(new Set(filteredOrders.map(order => order.userId)));
                console.log('Unique user IDs:', uniqueUserIds);
                
                const addressesMap: { [key: string]: ShippingAddress } = {};

                for (const userId of uniqueUserIds) {
                    if (!userId) continue; // Skip if userId is undefined
                    
                    try {
                        const addresses = await shippingService.getAddresses(userId);
                        console.log(`Addresses for user ${userId}:`, addresses);
                        
                        if (addresses && addresses.length > 0) {
                            addressesMap[userId] = addresses[0];
                        }
                    } catch (addressError) {
                        console.error(`Error fetching addresses for user ${userId}:`, addressError);
                    }
                }
                
                console.log('Addresses map:', addressesMap);
                setShippingAddresses(addressesMap);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (user) {
            fetchOrdersAndAddresses();
        }
    }, [user]);

    const handleDownloadFile = async (fileId: string) => {
        try {
            const blob = await designService.getFile(fileId);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${fileId}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('File downloaded successfully');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
                console.error('File not found');
                toast.error('File not found');
            } else {
                console.error('Error downloading file:', error);
                toast.error('Error downloading file');
            }
        }
    };

    const handleChangeStatus = async (orderId: string, newStatus: string) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(order => order._id === orderId ? { ...order, status: newStatus } : order));
            toast.success('Order status updated successfully');
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Error updating order status. Please try again.');
        }
    };

    // Modify handleShowAddress to use the shipping addresses map
    const handleShowAddress = (userId: string) => {
        const address = shippingAddresses[userId];
        if (address) {
            setSelectedAddress(address);
            setShowAddressModal(true);
        } else {
            toast.error('No shipping address found');
        }
    };
    console.log(orders)

    // Helper function to get status color
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'processing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'packed':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'shipped':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Helper function to format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
                    <p className="text-gray-600">Track and manage your custom print orders</p>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
                            <div className="mb-4">
                                <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                            <p className="text-gray-600 mb-4">You haven't placed any orders yet. Start creating your custom designs!</p>
                            <a 
                                href="/print-on-demand" 
                                className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
                            >
                                Start Designing
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map(order => (
                            <div key={order._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                                {/* Order Header */}
                                <div className="border-b border-gray-200 p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                        <div className="mb-4 sm:mb-0">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Order #{order._id.slice(-8)}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Customer: {order.user.name}
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:items-end">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Payment: {order.paymentStatus}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Body */}
                                <div className="p-6">
                                    {/* Order Progress Timeline */}
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-lg font-semibold text-gray-900">Order Progress</h4>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="mb-6">
                                            <div className="flex items-center mb-2">
                                                {['Processing', 'Packed', 'Shipped', 'Delivered'].map((step, index) => {
                                                    const normalizedStatus = order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase();
                                                    const isCompleted = ['Processing', 'Packed', 'Shipped', 'Delivered'].indexOf(normalizedStatus) >= index;
                                                    const isCurrent = ['Processing', 'Packed', 'Shipped', 'Delivered'].indexOf(normalizedStatus) === index;
                                                    
                                                    return (
                                                        <React.Fragment key={step}>
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                                                                isCompleted 
                                                                    ? 'bg-green-500 border-green-500 text-white' 
                                                                    : isCurrent 
                                                                        ? 'bg-blue-500 border-blue-500 text-white'
                                                                        : 'bg-gray-200 border-gray-300 text-gray-500'
                                                            }`}>
                                                                {isCompleted ? (
                                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                ) : (
                                                                    <span className="text-sm font-semibold">{index + 1}</span>
                                                                )}
                                                            </div>
                                                            {index < 3 && (
                                                                <div className={`flex-1 h-0.5 ${
                                                                    ['Processing', 'Packed', 'Shipped', 'Delivered'].indexOf(order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()) > index 
                                                                        ? 'bg-green-500' 
                                                                        : 'bg-gray-300'
                                                                }`} />
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                            <div className="flex items-center">
                                                {['Processing', 'Packed', 'Shipped', 'Delivered'].map((step, index) => {
                                                    const normalizedStatus = order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase();
                                                    const isCompleted = ['Processing', 'Packed', 'Shipped', 'Delivered'].indexOf(normalizedStatus) >= index;
                                                    const isCurrent = ['Processing', 'Packed', 'Shipped', 'Delivered'].indexOf(normalizedStatus) === index;
                                                    
                                                    return (
                                                        <React.Fragment key={step}>
                                                            <div className="w-10 flex-shrink-0">
                                                                <span className={`text-xs font-medium ${
                                                                    isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                                                                }`}>
                                                                    {step}
                                                                </span>
                                                            </div>
                                                            {index < 3 && <div className="flex-1" />}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Detailed Timeline */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h5 className="font-semibold text-gray-900 mb-3">Order Timeline</h5>
                                            <div className="space-y-3">
                                                {/* Generate mock timeline events based on status */}
                                                {order.status.toLowerCase() === 'delivered' && (
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-sm font-medium text-gray-900">Package Delivered</span>
                                                                <span className="text-xs text-gray-500">Today 18:29</span>
                                                            </div>
                                                            <p className="text-sm text-gray-600">
                                                              Package delivered! 
                                                              {shippingAddresses[order.userId] ? (
                                                                <span> at {shippingAddresses[order.userId].city}, {shippingAddresses[order.userId].state}</span>
                                                              ) : (
                                                                <span> [Location information not available]</span>
                                                              )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {(['shipped', 'delivered'].includes(order.status.toLowerCase())) && (
                                                    <>
                                                        <div className="flex items-start space-x-3">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-sm font-medium text-gray-900">Order Shipped</span>
                                                                    <span className="text-xs text-gray-500">Yesterday 07:17</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600">Your order is on the way to delivery facility</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start space-x-3">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-sm font-medium text-gray-900">Departed from Distribution Center</span>
                                                                    <span className="text-xs text-gray-500">2 days ago 01:18</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600">Package is being sorted and will soon head to the delivery facility</p>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                
                                                {(['processing', 'packed', 'shipped', 'delivered'].includes(order.status.toLowerCase())) && (
                                                    <>
                                                        <div className="flex items-start space-x-3">
                                                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-sm font-medium text-gray-900">Order Processing</span>
                                                                    <span className="text-xs text-gray-500">3 days ago 15:45</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600">Order will be handed over to printing facility soon</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start space-x-3">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-sm font-medium text-gray-900">Order Received</span>
                                                                    <span className="text-xs text-gray-500">4 days ago 21:14</span>
                                                                </div>
                                                                <p className="text-sm text-gray-600">Order received and payment confirmed</p>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Items Section */}
                                        <div>
                                            <h4 className="text-md font-semibold text-gray-900 mb-3">Order Items</h4>
                                            <div className="space-y-3">
                                                {order.items.map((item, index) => {
                                                    // Infer itemType if missing (for backward compatibility with old orders)
                                                    const itemType = item.itemType || (item.productId ? 'product' : 'design');
                                                    
                                                    return (
                                                    <div key={item._id || index} className="bg-gray-50 rounded-lg p-4">
                                                        <div className="flex items-start gap-3">
                                                            {/* Item Image/Icon */}
                                                            {itemType === 'product' && item.productId ? (
                                                                <img
                                                                    src={item.productId.images?.find((img: any) => img.isPrimary)?.url || item.productId.images?.[0]?.url || 'https://via.placeholder.com/80'}
                                                                    alt={item.productId.name}
                                                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                                                />
                                                            ) : itemType === 'design' && item.designId?.frontImageFileId ? (
                                                                <img
                                                                    src={`${process.env.NEXT_PUBLIC_API_URL || 'https://backend.customprintingservices.com.au/api'}/files/${item.designId.frontImageFileId}`}
                                                                    alt="Design front view"
                                                                    className="w-16 h-16 object-cover rounded-lg border border-purple-200"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-16 h-16 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-center flex-shrink-0">
                                                                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                                    </svg>
                                                                </div>
                                                            )}

                                                            <div className="flex-1">
                                                                {/* Item Type Badge */}
                                                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mb-1 ${
                                                                    itemType === 'design' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                    {itemType === 'design' ? 'Custom Design' : 'Product'}
                                                                </span>

                                                                {/* Item Title */}
                                                                <h5 className="font-medium text-gray-900 mb-1">
                                                                    {itemType === 'product' ? item.productId?.name : item.designId?.title}
                                                                </h5>

                                                                {/* Product Details */}
                                                                {itemType === 'product' && (
                                                                    <div className="text-sm text-gray-600">
                                                                        {item.size && <span>Size: {item.size}</span>}
                                                                        {item.size && item.color && <span className="mx-2">•</span>}
                                                                        {item.color && <span>Color: {item.color}</span>}
                                                                        <div className="mt-1">Quantity: {item.quantity}</div>
                                                                    </div>
                                                                )}

                                                                {/* Design Size Quantities */}
                                                                {itemType === 'design' && item.designId?.sizeQuantities && (
                                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                                        {Object.entries(item.designId.sizeQuantities).map(([size, quantity]) => (
                                                                            quantity > 0 && (
                                                                                <span key={size} className="inline-flex items-center px-2 py-1 bg-white rounded-md text-sm text-gray-700 border">
                                                                                    {size}: {quantity}
                                                                                </span>
                                                                            )
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Price */}
                                                            <div className="text-right">
                                                                <span className="text-lg font-semibold text-orange-600">
                                                                    ${item.price.toFixed(2)}
                                                                </span>
                                                                {itemType === 'product' && item.quantity > 1 && (
                                                                    <div className="text-xs text-gray-500">
                                                                        ${(item.price / item.quantity).toFixed(2)} each
                                                                    </div>
                                                                )}
                                                                {itemType === 'design' && item.quantity && (
                                                                    <div className="text-xs text-gray-500">
                                                                        ${(item.price / item.quantity).toFixed(2)} per item
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    );
                                                })}
                                            </div>
                                            
                                            {/* Total */}
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                                                    <span className="text-xl font-bold text-orange-600">
                                                        ${order.items.reduce((total, item) => total + item.price, 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shipping Address & Actions Section */}
                                        <div className="space-y-4">
                                            {/* Shipping Address Card */}
                                            <div>
                                                <h4 className="text-md font-semibold text-gray-900 mb-3">Shipping Address</h4>
                                                {shippingAddresses[order.userId] ? (
                                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                                                        <div className="flex items-start mb-3">
                                                            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <div className="flex-1">
                                                                <h5 className="font-semibold text-gray-900 mb-1">
                                                                    {shippingAddresses[order.userId].fullName}
                                                                </h5>
                                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                                    {shippingAddresses[order.userId].streetAddress}
                                                                </p>
                                                                <p className="text-sm text-gray-700">
                                                                    {shippingAddresses[order.userId].city}, {shippingAddresses[order.userId].state} {shippingAddresses[order.userId].postalCode}
                                                                </p>
                                                                <div className="flex items-center mt-2 text-sm text-gray-600">
                                                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                    </svg>
                                                                    {shippingAddresses[order.userId].phone}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                        <p className="text-sm text-gray-500 text-center">No shipping address available</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Admin Actions */}
                                            {user?.type === "Admin" && (
                                                <div>
                                                    <h4 className="text-md font-semibold text-gray-900 mb-3">Admin Actions</h4>
                                                    
                                                    {/* Status Update */}
                                                    <div className="mb-3">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Update Status
                                                        </label>
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleChangeStatus(order._id, e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white shadow-sm focus:border-orange-500 focus:ring-orange-500"
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Processing">Processing</option>
                                                            <option value="Packed">Packed</option>
                                                            <option value="Shipped">Shipped</option>
                                                            <option value="Delivered">Delivered</option>
                                                        </select>
                                                    </div>

                                                    {/* Download Buttons */}
                                                    <div className="space-y-2">
                                                        {order.items
                                                            .filter(item => item.itemType === 'design' && item.designId?.fileId)
                                                            .map(item => (
                                                                <button
                                                                    key={item._id}
                                                                    onClick={() => item.designId && handleDownloadFile(item.designId.fileId)}
                                                                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                                                                >
                                                                    <FaDownload className="mr-2" />
                                                                    Download Design File
                                                                </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
