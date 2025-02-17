import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface Order {
    _id: string;
    user: {
        _id: string;
        name: string;
    };
    items: {
        _id: string;
        title: string;
        sizeQuantities: { [size: string]: number };
        price: number;
        fileId: string;
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
    userId: string; // Add this field
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
                // Fetch orders
                const ordersResponse = await axios.get('/api/checkout');
                const allOrders = ordersResponse.data;
                const filteredOrders = user?.type === 'Admin' 
                    ? allOrders 
                    : allOrders.filter((order: Order) => order.user._id === user?.id);
                setOrders(filteredOrders);

                // Fetch shipping addresses for all orders
                const uniqueUserIds = Array.from(filteredOrders.reduce((set: { add: (arg0: string) => void; }, order: Order) => {
                    set.add(order.userId);
                    return set;
                }, new Set<string>()));
                const addressesMap: { [key: string]: ShippingAddress } = {};

                for (const userId of uniqueUserIds as string[]) {
                    const addressResponse = await axios.get('/api/shipping-address', {
                        params: { userId }
                    });
                    // Store the first address for each user (you might want to modify this logic)
                    if (addressResponse.data && addressResponse.data.length > 0) {
                        addressesMap[userId] = (addressResponse.data as ShippingAddress[])[0];
                    }
                }
                
                setShippingAddresses(addressesMap);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Error fetching orders and addresses');
            }
        };

        fetchOrdersAndAddresses();
    }, [user]);

    const handleDownloadFile = async (fileId: string) => {
        try {
            const response = await axios.get(`/api/files/${fileId}`, {
                responseType: 'blob',
            });
            if (response.status === 200) {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileId);
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else {
                console.error('File not found');
                toast.error('File not found');
            }
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
            await axios.put(`/api/orders/${orderId}`, { status: newStatus });
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

    return (
        <div>
            <NavBar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-center">Orders</h1>
                {orders.length === 0 ? (
                    <p className="text-center text-gray-600">No orders found.</p>
                ) : (
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border">Order ID</th>
                                <th className="py-2 px-4 border">User</th>
                                <th className="py-2 px-4 border">Items</th>
                                <th className="py-2 px-4 border">Total</th>
                                <th className="py-2 px-4 border">Status</th>
                                <th className="py-2 px-4 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id} className="border-t">
                                    <td className="py-2 px-4 border">{order._id}</td>
                                    <td className="py-2 px-4 border">{order.user.name}</td>
                                    <td className="py-2 px-4 border">
                                        <ul>
                                            {order.items.map(item => (
                                                <li key={item._id}>
                                                    {item.title} - {Object.entries(item.sizeQuantities).map(([size, quantity]) => (
                                                        <span key={size}>{size}: {quantity} </span>
                                                    ))}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="py-2 px-4 border">{order.items.reduce((total, item) => total + item.price, 0)}</td>
                                    <td className="py-2 px-4 border">
                                        {user?.type === "Admin" ? (
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleChangeStatus(order._id, e.target.value)}
                                                className="border rounded px-2 py-1"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>
                                        ) : (
                                            order.status
                                        )}
                                    </td>
                                    <td className='py-2 px-4 border'>
                                        <div className="flex flex-col gap-2">
                                            {user?.type === "Admin" && (
                                                <>
                                                    {order.items.map(item => (
                                                        <button
                                                            key={item._id}
                                                            onClick={() => handleDownloadFile(item.fileId)}
                                                            className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 flex items-center text-sm"
                                                        >
                                                            <FaDownload className="mr-1" /> Design File
                                                        </button>
                                                    ))}
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleShowAddress(order.userId)}
                                                className="px-2 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 flex items-center text-sm"
                                                disabled={!shippingAddresses[order.userId]}
                                            >
                                                Show Address
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {showAddressModal && selectedAddress && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                            <h3 className="text-xl font-bold mb-4">Shipping Address</h3>
                            <div className="space-y-2">
                                <p><span className="font-semibold">Name:</span> {selectedAddress.fullName}</p>
                                <p><span className="font-semibold">Address:</span> {selectedAddress.streetAddress}</p>
                                <p><span className="font-semibold">City:</span> {selectedAddress.city}</p>
                                <p><span className="font-semibold">State:</span> {selectedAddress.state}</p>
                                <p><span className="font-semibold">Postal Code:</span> {selectedAddress.postalCode}</p>
                                <p><span className="font-semibold">Phone:</span> {selectedAddress.phone}</p>
                            </div>
                            <button
                                onClick={() => setShowAddressModal(false)}
                                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
