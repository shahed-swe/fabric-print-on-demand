import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { FaDownload } from 'react-icons/fa';

interface Order {
    _id: string;
    user: {
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
}

const OrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const { user } = useAuth();


    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('/api/checkout');
                const allOrders = response.data;

                if (user?.type === 'Admin') {
                    setOrders(allOrders);
                } else {
                    const userOrders = allOrders.filter((order: Order) => order.user._id === user?.id);
                    setOrders(userOrders);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
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
                alert('File not found');
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
                console.error('File not found');
                alert('File not found');
            } else {
                console.error('Error downloading file:', error);
                alert('Error downloading file');
            }
        }
    };

    const handleChangeStatus = async (orderId: string, newStatus: string) => {
        try {
            await axios.put(`/api/orders/${orderId}`, { status: newStatus });
            setOrders(orders.map(order => order._id === orderId ? { ...order, status: newStatus } : order));
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Error updating order status. Please try again.');
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
                                    {
                                        user?.type === "Admin" && (
                                            <>
                                                {order.items.map(item => (
                                                    <button
                                                        key={item._id}
                                                        onClick={() => handleDownloadFile(item.fileId)}
                                                        className="mt-1 px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 flex items-center text-sm"
                                                    >
                                                        <FaDownload className="mr-1" /> Design File
                                                    </button>
                                                ))}
                                            </>
                                        )
                                    }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
