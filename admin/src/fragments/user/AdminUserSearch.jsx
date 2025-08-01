import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { FaSearch, FaSpinner, FaCheck, FaExclamationTriangle, FaUserEdit, FaWallet, FaChartLine, FaCrown } from 'react-icons/fa';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

const AdminUserSearch = () => {
  const [searchIdentifier, setSearchIdentifier] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    nic: '',
    phoneNumber: '',
    level: 0,
    wallet: {
      usdt: 0,
      cw: 0
    },
    sales: {
      personalSales: 0,
      directSponsorSales: 0,
      groupSales: 0
    },
    premium: {
      active: false,
      expiryDate: ''
    }
  });

  // Search for user by ID or email
  const { data: user, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['adminUser', searchIdentifier],
    queryFn: async () => {
      if (!searchIdentifier) return null;
      const response = await API.get(`/api/auth/admin/users/${searchIdentifier}`);
      return response.data;
    },
    enabled: false,
    retry: 1,
    staleTime: 1000 * 60 * 5
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (updatedData) => {
      await API.patch(`/api/auth/admin/users/${searchIdentifier}`, updatedData);
    },
    onSuccess: () => {
      toast.success('User updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchIdentifier(searchTerm.trim());
      refetch();
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserMutation.mutate(formData);
  };

  // When user data is fetched, populate the form
  React.useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        fullName: user.fullName || '',
        nic: user.nic || '',
        phoneNumber: user.phoneNumber || '',
        level: user.level || 0,
        wallet: {
          usdt: user.wallet?.usdt || 0,
          cw: user.wallet?.cw || 0
        },
        sales: {
          personalSales: user.sales?.personalSales || 0,
          directSponsorSales: user.sales?.directSponsorSales || 0,
          groupSales: user.sales?.groupSales || 0
        },
        premium: {
          active: user.premium?.active || false,
          expiryDate: user.premium?.expiryDate || ''
        }
      });
    }
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin User Management</h1>
        
        {/* Search Section */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Search User</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Enter User ID or Email..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={!searchTerm.trim()}
            >
              Search
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">You can search by user ID or email address</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white p-6 rounded-lg shadow mb-6 flex justify-center items-center h-32">
            <FaSpinner className="animate-spin text-3xl text-blue-500 mr-3" />
            <span className="text-gray-600">Searching for user...</span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded">
              <div className="flex items-center">
                <FaExclamationTriangle className="mr-2 text-red-500" />
                <div>
                  <strong>Error searching for user:</strong>
                  <p className="mt-1">{error.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Details */}
        {user && (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {user.fullName} <span className="text-blue-600">(ID: {user._id})</span>
                </h2>
                <p className="text-sm text-gray-500">Joined: {formatDate(user.createdAt)}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.premium?.active ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                  <FaCrown className="inline mr-1" />
                  {user.premium?.active ? 'Premium' : 'Standard'}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.level >= 10 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  Level {user.level}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="nic" className="block text-sm font-medium text-gray-700 mb-1">
                      NIC/Passport
                    </label>
                    <input
                      type="text"
                      name="nic"
                      id="nic"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={formData.nic}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      id="phoneNumber"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                      Level
                    </label>
                    <input
                      type="number"
                      name="level"
                      id="level"
                      min="0"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={formData.level}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Wallet Section */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center mb-4">
                  <FaWallet className="text-blue-500 mr-2" />
                  <h3 className="text-md font-medium text-gray-900">Wallet Information</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <div>
                    <label htmlFor="wallet.usdt" className="block text-sm font-medium text-gray-700 mb-1">
                      USDT Balance
                    </label>
                    <input
                      type="number"
                      name="wallet.usdt"
                      id="wallet.usdt"
                      step="0.01"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={formData.wallet.usdt}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="wallet.cw" className="block text-sm font-medium text-gray-700 mb-1">
                      CW Balance
                    </label>
                    <input
                      type="number"
                      name="wallet.cw"
                      id="wallet.cw"
                      step="0.01"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={formData.wallet.cw}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Updated
                    </label>
                    <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {formatDate(user.wallet?.lastUpdated)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Section */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center mb-4">
                  <FaChartLine className="text-green-500 mr-2" />
                  <h3 className="text-md font-medium text-gray-900">Sales Information</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="sales.personalSales" className="block text-sm font-medium text-gray-700 mb-1">
                      Personal Sales
                    </label>
                    <input
                      type="number"
                      name="sales.personalSales"
                      id="sales.personalSales"
                      step="0.01"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={formData.sales.personalSales}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="sales.directSponsorSales" className="block text-sm font-medium text-gray-700 mb-1">
                      Direct Sponsor Sales
                    </label>
                    <input
                      type="number"
                      name="sales.directSponsorSales"
                      id="sales.directSponsorSales"
                      step="0.01"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={formData.sales.directSponsorSales}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="sales.groupSales" className="block text-sm font-medium text-gray-700 mb-1">
                      Group Sales
                    </label>
                    <input
                      type="number"
                      name="sales.groupSales"
                      id="sales.groupSales"
                      step="0.01"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={formData.sales.groupSales}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Premium Section */}
              <div className="pb-6">
                <div className="flex items-center mb-4">
                  <FaCrown className="text-purple-500 mr-2" />
                  <h3 className="text-md font-medium text-gray-900">Premium Status</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="premium.active"
                      id="premium.active"
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      checked={formData.premium.active}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="premium.active" className="ml-2 block text-sm text-gray-900">
                      Premium Active
                    </label>
                  </div>

                  <div>
                    <label htmlFor="premium.expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="datetime-local"
                      name="premium.expiryDate"
                      id="premium.expiryDate"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                      value={formData.premium.expiryDate ? formData.premium.expiryDate.substring(0, 16) : ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activated Date
                    </label>
                    <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {formatDate(user.premium?.activatedDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setSearchIdentifier('');
                    setSearchTerm('');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={updateUserMutation.isLoading}
                >
                  {updateUserMutation.isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaUserEdit className="mr-2" />
                      Update User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Empty State */}
        {!user && !isLoading && !isError && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <FaSearch className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search for a user</h3>
            <p className="text-gray-500">Enter a user ID or email to view and edit their details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserSearch;