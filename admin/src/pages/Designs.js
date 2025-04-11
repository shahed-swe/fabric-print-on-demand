import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

// Dummy designs data
const dummyDesigns = [
  {
    id: 1,
    name: 'Floral Summer Pattern',
    designer: 'Alice Johnson',
    designerId: 101,
    dateSubmitted: '2023-10-15',
    status: 'pending',
    previewImage: 'https://images.unsplash.com/photo-1590422405310-11641013a0dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    type: 'Pattern',
    description: 'A beautiful floral pattern perfect for summer fabrics.'
  },
  {
    id: 2,
    name: 'Geometric Abstract',
    designer: 'Robert Brown',
    designerId: 102,
    dateSubmitted: '2023-10-14',
    status: 'approved',
    previewImage: 'https://images.unsplash.com/photo-1579493933704-420751d7b88f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    type: 'Abstract',
    description: 'Modern geometric shapes with vibrant colors.'
  },
  {
    id: 3,
    name: 'Vintage Damask',
    designer: 'Emily Davis',
    designerId: 103,
    dateSubmitted: '2023-10-12',
    status: 'rejected',
    previewImage: 'https://images.unsplash.com/photo-1573495627361-d9b87960b12d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    type: 'Vintage',
    description: 'Classic damask pattern inspired by Victorian designs.',
    rejectionReason: 'Similar to existing designs in our catalog.'
  },
  {
    id: 4,
    name: 'Kids Fun Animals',
    designer: 'Mark Wilson',
    designerId: 104,
    dateSubmitted: '2023-10-16',
    status: 'pending',
    previewImage: 'https://images.unsplash.com/photo-1594379351152-02bea0ccc82a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    type: 'Kids',
    description: 'Playful animal patterns for children\'s fabrics.'
  },
  {
    id: 5,
    name: 'Modern Stripes',
    designer: 'Sarah Miller',
    designerId: 105,
    dateSubmitted: '2023-10-13',
    status: 'approved',
    previewImage: 'https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    type: 'Stripes',
    description: 'Contemporary striped pattern with pastel colors.'
  }
];

export default function Designs() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        // In a real app:
        // const response = await axios.get('/api/admin/designs');
        // setDesigns(response.data);
        
        // For demo:
        setTimeout(() => {
          setDesigns(dummyDesigns);
          setLoading(false);
        }, 600);
      } catch (error) {
        console.error('Error fetching designs:', error);
        setLoading(false);
      }
    };
    
    fetchDesigns();
  }, []);
  
  const filteredDesigns = designs.filter(design => {
    const matchesStatus = statusFilter === 'all' || design.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      design.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      design.designer.toLowerCase().includes(searchTerm.toLowerCase()) || 
      design.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleApprove = async (design) => {
    try {
      // In a real app:
      // await axios.patch(`/api/admin/designs/${design.id}/approve`);
      
      // For demo:
      const updatedDesigns = designs.map(d => d.id === design.id ? {...d, status: 'approved'} : d);
      setDesigns(updatedDesigns);
    } catch (error) {
      console.error('Error approving design:', error);
    }
  };

  const openRejectModal = (design) => {
    setSelectedDesign(design);
    setRejectionReason('');
    setShowModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;

    try {
      // In a real app:
      // await axios.patch(`/api/admin/designs/${selectedDesign.id}/reject`, { reason: rejectionReason });
      
      // For demo:
      const updatedDesigns = designs.map(d => 
        d.id === selectedDesign.id 
          ? {...d, status: 'rejected', rejectionReason: rejectionReason} 
          : d
      );
      setDesigns(updatedDesigns);
      setShowModal(false);
      setSelectedDesign(null);
    } catch (error) {
      console.error('Error rejecting design:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  return (
    <>
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Design Submissions</h1>
        
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-3">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search designs by name, designer, or type"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        
        {/* Designs List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <p className="text-gray-500">No designs found matching your criteria.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredDesigns.map((design) => (
                <li key={design.id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-shrink-0 h-40 w-40 mb-4 sm:mb-0">
                      <img 
                        className="h-40 w-40 rounded-md object-cover" 
                        src={design.previewImage} 
                        alt={design.name} 
                      />
                    </div>
                    <div className="flex-1 ml-0 sm:ml-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800">{design.name}</h3>
                        {getStatusBadge(design.status)}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Designed by <span className="font-medium">{design.designer}</span>
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Type: {design.type}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Submitted: {design.dateSubmitted}
                      </p>
                      <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                        {design.description}
                      </p>
                      {design.rejectionReason && (
                        <p className="mt-2 text-sm text-red-600">
                          <span className="font-medium">Rejection reason:</span> {design.rejectionReason}
                        </p>
                      )}
                      {design.status === 'pending' && (
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => handleApprove(design)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <CheckCircleIcon className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(design)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <XCircleIcon className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <XCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Reject Design
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Please provide a reason for rejecting this design. This will be shared with the designer.
                      </p>
                      <div className="mt-4">
                        <textarea
                          rows={4}
                          className="shadow-sm block w-full focus:ring-primary-500 focus:border-primary-500 sm:text-sm border border-gray-300 rounded-md"
                          placeholder="Rejection reason..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
