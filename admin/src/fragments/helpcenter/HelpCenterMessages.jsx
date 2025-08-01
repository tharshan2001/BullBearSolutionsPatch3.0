import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { FaSpinner, FaExclamationTriangle, FaCheck, FaEnvelope, FaEnvelopeOpen, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

const HelpCenterMessages = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'read', 'unread'
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMessages = async () => {
    try {
      const response = await API.get('/api/help-center');
      return response.data || [];
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch messages'
      );
    }
  };

  const { 
    data: messages, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['helpCenterMessages'],
    queryFn: fetchMessages,
    retry: 1,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId) => {
      await API.patch(`/api/help-center/${messageId}/read`);
    },
    onSuccess: () => {
      refetch();
      toast.success('Message marked as read');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark message as read');
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkAsRead = (messageId) => {
    markAsReadMutation.mutate(messageId);
  };

  const filteredMessages = messages?.filter(message => {
    // Apply status filter
    const statusMatch = 
      filter === 'all' || 
      (filter === 'read' && message.read) || 
      (filter === 'unread' && !message.read);
    
    // Apply search filter
    const searchMatch = message.mailid.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <FaSpinner className="animate-spin text-3xl text-blue-500 mb-2" />
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 pt-4 px-6 pb-2 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Help Center Messages</h2>
          <p className="text-gray-500">Error loading messages</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded max-w-md">
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2 text-red-500" />
              <div>
                <strong>Error loading messages:</strong>
                <p className="mt-1">{error.message}</p>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 pt-4 px-6 pb-2 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Help Center Messages</h2>
            <p className="text-gray-500">No messages available</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white border border-gray-200 text-gray-700 p-10 rounded-lg text-center shadow-sm">
            <h3 className="text-xl font-medium mb-2">No messages yet</h3>
            <p className="mb-6">When users contact you through the help center, their messages will appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Fixed Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 pt-4 px-6 pb-2 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Help Center Messages</h2>
          <div className="text-gray-500">
            {filteredMessages?.length || 0} message{filteredMessages?.length !== 1 ? 's' : ''} shown
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Filter Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'unread' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'read' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Read
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by email..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
        <div className="overflow-hidden border border-gray-200 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMessages?.map((message) => (
                <tr 
                  key={message._id} 
                  className={`hover:bg-gray-50 cursor-pointer ${message.read ? 'bg-gray-50' : 'bg-white'}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {message.read ? (
                      <FaEnvelopeOpen className="text-gray-400" title="Read" />
                    ) : (
                      <FaEnvelope className="text-blue-500" title="Unread" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{message.FullName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{message.mailid}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{message.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(message.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      {!message.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(message._id);
                          }}
                          className="text-green-600 hover:text-green-800 flex items-center"
                          title="Mark as read"
                        >
                          <FaCheck className="mr-1" />
                          <span className="hidden sm:inline">Mark Read</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Message Details</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">From</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedMessage.FullName}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedMessage.mailid}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Received</h4>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedMessage.createdAt)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Message</h4>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              {!selectedMessage.read && (
                <button
                  onClick={() => {
                    handleMarkAsRead(selectedMessage._id);
                    setSelectedMessage(null);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FaCheck className="mr-2" />
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpCenterMessages;