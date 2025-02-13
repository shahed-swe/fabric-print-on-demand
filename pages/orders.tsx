import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user || user.type !== 'Admin') {
            router.push('/');
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await axios.get('/api/checkout');
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, [user]);

    if (!user || user.type !== 'Admin') {
        return null;
    }

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
                                    <td className="py-2 px-4 border">Pending</td>
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
