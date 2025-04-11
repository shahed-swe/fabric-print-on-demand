import React, { useState, useEffect } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

// Dummy orders data
const dummyOrders = [
  { 
    id: 'ORD-1234', 
    customer: 'John Doe', 
    email: 'john@example.com',
    total: 129.99, 
    status: 'Delivered', 
    date: '2023-10-15',
    items: 3
  },
  { 
    id: 'ORD-1235', 
    customer: 'Jane Smith', 
    email: 'jane@example.com',
    total: 89.50, 
    status: 'Processing', 
    date: '2023-10-16',
    items: 2
  },
  { 
    id: 'ORD-1236', 
    customer: 'Robert Johnson', 
    email: 'robert@example.com',
    total: 210.75, 
    status: 'Shipped', 
    date: '2023-10-16',
    items: 1
  },
  { 
    id: 'ORD-1237', 
    customer: 'Emily Davis', 
    email: 'emily@example.com',
    total: 45.25, 
    status: 'Processing', 
    date: '2023-10-17',
    items: 1
  },
  { 
    id: 'ORD-1238', 
    customer: 'Michael Brown', 
    email: 'michael@example.com',
    total: 178.30, 
    status: 'Pending', 
    date: '2023-10-17',
    items: 4
  },
  { 
    id: 'ORD-1239', 
    customer: 'Sarah Wilson', 
    email: 'sarah@example.com',
    total: 67.80, 
    status: 'Delivered', 
    date: '2023-10-14',
    items: 2
  },
  { 
    id: 'ORD-1240', 
    customer: 'David Miller', 
    email: 'david@example.com',
    total: 152.40, 
    status: 'Cancelled', 
    date: '2023-10-13',
    items: 3
  }
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // In a real app:
        // const response = await axios.get('/api/admin/orders');
        // setOrders(response.data);
        
        // For demo:
        setTimeout(() => {
          setOrders(dummyOrders);
          setLoading(false);
        }, 600);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const statusOptions = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Orders</h1>
      
      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row md:items-center mb-6 space-y-3 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-1/4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        
        <div className="w-full md:w-3/4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
          <input
            type="text"
            id="search"
            placeholder="Search by order ID, customer name, or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1 block w-full border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          />
        </div>
      </div>
      
      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
          <p className="text-gray-500">No orders found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <li key={order.id}>
                <a href={`#order-${order.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-primary-600 truncate">{order.id}</p>
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {order.customer}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          {order.email}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          {order.date} · ${order.total.toFixed(2)} · {order.items} item{order.items > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
