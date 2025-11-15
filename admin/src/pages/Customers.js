import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

// Dummy customers data
const dummyCustomers = [
  {
    id: 1,
    name: 'Jane Cooper',
    email: 'jane.cooper@example.com',
    phone: '(555) 123-4567',
    ordersCount: 12,
    totalSpent: 1432.25,
    lastOrderDate: '2023-10-10',
    country: 'United States',
    status: 'active',
    avatar: 'https://randomuser.me/api/portraits/women/10.jpg'
  },
  {
    id: 2,
    name: 'Michael Foster',
    email: 'michael.foster@example.com',
    phone: '(555) 765-4321',
    ordersCount: 8,
    totalSpent: 976.80,
    lastOrderDate: '2023-10-05',
    country: 'Canada',
    status: 'active',
    avatar: 'https://randomuser.me/api/portraits/men/7.jpg'
  },
  {
    id: 3,
    name: 'Dries Vincent',
    email: 'dries.vincent@example.com',
    phone: '(555) 237-8901',
    ordersCount: 3,
    totalSpent: 429.70,
    lastOrderDate: '2023-09-28',
    country: 'United Kingdom',
    status: 'active',
    avatar: 'https://randomuser.me/api/portraits/men/15.jpg'
  },
  {
    id: 4,
    name: 'Lindsay Walton',
    email: 'lindsay.walton@example.com',
    phone: '(555) 345-6789',
    ordersCount: 5,
    totalSpent: 672.50,
    lastOrderDate: '2023-09-20',
    country: 'Australia',
    status: 'inactive',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg'
  },
  {
    id: 5,
    name: 'Tom Cook',
    email: 'tom.cook@example.com',
    phone: '(555) 890-1234',
    ordersCount: 1,
    totalSpent: 129.99,
    lastOrderDate: '2023-09-15',
    country: 'Germany',
    status: 'active',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  {
    id: 6,
    name: 'Courtney Henry',
    email: 'courtney.henry@example.com',
    phone: '(555) 456-7890',
    ordersCount: 15,
    totalSpent: 1876.30,
    lastOrderDate: '2023-10-12',
    country: 'France',
    status: 'active',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
  }
];

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // In a real app:
        // const response = await axios.get('/api/admin/customers');
        // setCustomers(response.data);
        
        // For demo:
        setTimeout(() => {
          setCustomers(dummyCustomers);
          setLoading(false);
        }, 600);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);
  
  const filteredCustomers = searchTerm === ''
    ? customers
    : customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.country.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Customers</h1>
      
      {/* Search */}
      <div className="mb-6">
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search by name, email, or country"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Customer List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
          <p className="text-gray-500">No customers found matching your search.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={customer.avatar} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.country}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.ordersCount}</div>
                    <div className="text-sm text-gray-500">Last order: {customer.lastOrderDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${customer.totalSpent.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
