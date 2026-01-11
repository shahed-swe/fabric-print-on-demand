import React, { useState, useEffect } from 'react';
import { ChevronRightIcon, ChevronLeftIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { formatOrderIdDisplay, getOrderIdComponents } from '../utils/orderIdGenerator';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/orders');
        console.log('Orders fetched:', response.data);
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        console.error('Error response:', error.response?.data);
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
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };
  
  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const orderId = order._id?.toString() || '';
    const customerName = order.user?.name || 'Unknown';
    const customerEmail = order.user?.email || '';

    const matchesSearch = searchTerm === '' ||
      orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });
  
  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'totalAmount':
        aValue = a.totalAmount || 0;
        bValue = b.totalAmount || 0;
        break;
      case 'customer':
        aValue = (a.user?.name || 'Unknown').toLowerCase();
        bValue = (b.user?.name || 'Unknown').toLowerCase();
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);
  
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ArrowUpIcon className="h-4 w-4 inline ml-1" /> : 
      <ArrowDownIcon className="h-4 w-4 inline ml-1" />;
  };

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Orders</h1>
      
      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row md:items-end mb-6 space-y-3 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-1/4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        
        <div className="w-full md:w-1/2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
          <input
            type="text"
            id="search"
            placeholder="Search by order ID, customer name, or email"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="mt-1 block w-full border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          />
        </div>
        
        <div className="w-full md:w-1/4">
          <label htmlFor="itemsPerPage" className="block text-sm font-medium text-gray-700">Items per page</label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      
      {/* Sorting Controls */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleSort('createdAt')}
          className={`px-3 py-1 text-sm rounded-md border ${sortField === 'createdAt' ? 'bg-primary-100 border-primary-500 text-primary-700' : 'bg-white border-gray-300 text-gray-700'} hover:bg-gray-50`}
        >
          Date <SortIcon field="createdAt" />
        </button>
        <button
          onClick={() => handleSort('customer')}
          className={`px-3 py-1 text-sm rounded-md border ${sortField === 'customer' ? 'bg-primary-100 border-primary-500 text-primary-700' : 'bg-white border-gray-300 text-gray-700'} hover:bg-gray-50`}
        >
          Customer <SortIcon field="customer" />
        </button>
        <button
          onClick={() => handleSort('status')}
          className={`px-3 py-1 text-sm rounded-md border ${sortField === 'status' ? 'bg-primary-100 border-primary-500 text-primary-700' : 'bg-white border-gray-300 text-gray-700'} hover:bg-gray-50`}
        >
          Status <SortIcon field="status" />
        </button>
        <button
          onClick={() => handleSort('totalAmount')}
          className={`px-3 py-1 text-sm rounded-md border ${sortField === 'totalAmount' ? 'bg-primary-100 border-primary-500 text-primary-700' : 'bg-white border-gray-300 text-gray-700'} hover:bg-gray-50`}
        >
          Amount <SortIcon field="totalAmount" />
        </button>
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
        <>
          {/* Results Info */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedOrders.length)} of {sortedOrders.length} orders
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {paginatedOrders.map((order) => (
                <li key={order._id} onClick={() => navigate(`/orders/${order._id}`)} className="hover:bg-gray-50 cursor-pointer transition">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <p className="text-sm font-medium text-primary-600 truncate">{formatOrderIdDisplay(order, order.user).customId}</p>
                          <p className="text-xs text-gray-500 mt-1">ID: {order._id?.toString().substring(0, 8).toUpperCase() || 'N/A'}</p>
                          <div className="flex gap-3 mt-1 text-xs text-gray-500">
                            <span>Order: {getOrderIdComponents(order, order.user).orderDate}</span>
                            <span>Delivery: {getOrderIdComponents(order, order.user).deliveryDate}</span>
                          </div>
                        </div>
                        <span className={`ml-4 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
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
                          {order.user?.name || 'Unknown'}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          {order.user?.email || 'N/A'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          {new Date(order.createdAt).toLocaleDateString()} · ${order.totalAmount?.toFixed(2) || '0.00'} · {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-md shadow">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">First</span>
                      <ChevronDoubleLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Page Numbers */}
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => goToPage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              currentPage === pageNumber
                                ? 'z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return <span key={pageNumber} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">...</span>;
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Last</span>
                      <ChevronDoubleRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
