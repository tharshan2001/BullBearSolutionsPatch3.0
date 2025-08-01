import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaSpinner, FaExclamationTriangle, FaCopy, FaWallet, FaPlus } from 'react-icons/fa';
import NetworkAddressForm from './NetworkAddressForm'; // Make sure this path is correct

const NetworkAddressesList = ({ refreshTrigger }) => {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const networkConfig = {
    TRC20: {
      label: "TRON (TRC20)",
      color: "bg-emerald-100 border-emerald-200 text-emerald-800"
    },
    BEP20: {
      label: "BSC (BEP20)",
      color: "bg-yellow-100 border-yellow-200 text-yellow-800"
    },
    ERC20: {
      label: "Ethereum (ERC20)",
      color: "bg-blue-100 border-blue-200 text-blue-800"
    },
    SOL: {
      label: "Solana",
      color: "bg-purple-100 border-purple-200 text-purple-800"
    },
    AVAX: {
      label: "Avalanche",
      color: "bg-red-100 border-red-200 text-red-800"
    },
    MATIC: {
      label: "Polygon",
      color: "bg-indigo-100 border-indigo-200 text-indigo-800"
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/addresses/latestAdmin`,
        { withCredentials: true }
      );
      const responseData = response.data?.data || response.data;
      return Array.isArray(responseData) ? responseData : [responseData].filter(Boolean);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
      throw new Error(err.response?.data?.message || 'Failed to load addresses');
    }
  };

  const { data: addresses, isLoading, error, refetch } = useQuery({
    queryKey: ['networkAddresses', refreshTrigger, refreshKey],
    queryFn: fetchAddresses
  });

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1); // This will trigger a refetch
    refetch(); // Also explicitly refetch
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      {/* Fixed Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 pt-4 px-6 pb-2 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
              <FaWallet className="mr-2 text-gray-700" />
              Wallet Address Management
            </h2>
            <p className="text-gray-500">
              {addresses ? `${addresses.length} address group${addresses.length !== 1 ? 's' : ''} found` : 'Loading addresses...'}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <FaPlus />
            Create New
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-12">
            <FaSpinner className="animate-spin text-3xl text-blue-500 mb-2" />
            <p className="text-gray-500">Loading wallet addresses...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 my-4 rounded">
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2 text-red-500" />
              <div>
                <strong>Error loading addresses:</strong>
                <p className="mt-1">{error.message}</p>
              </div>
            </div>
          </div>
        ) : addresses?.length === 0 ? (
          <div className="bg-white border border-gray-200 text-gray-700 p-10 my-4 rounded-lg shadow-sm">
            <div className="flex flex-col items-center justify-center text-center">
              <FaWallet className="text-4xl mb-4 text-gray-400" />
              <h3 className="text-xl font-medium mb-2">No wallet addresses found</h3>
              <p className="mb-6 text-gray-500">You haven't added any wallet addresses yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <FaPlus />
                Add Your First Address
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {addresses?.map((wallet) => (
              <div key={wallet._id} className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                {/* Wallet Header */}
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">{wallet.label || 'Unnamed Wallet Group'}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">ID: {wallet._id}</span>
                      <span className="text-xs text-gray-500">Created: {formatDate(wallet.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(wallet, null, 2))}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md flex items-center gap-1 transition-colors"
                  >
                    <FaCopy className="h-3 w-3" />
                    Export
                  </button>
                </div>

                {/* Address Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                  {Object.entries(wallet)
                    .filter(([key]) => Object.keys(networkConfig).includes(key))
                    .filter(([_, value]) => value)
                    .map(([network, address]) => (
                      <div key={network} className={`rounded-lg border ${networkConfig[network].color} p-4 shadow-sm`}>
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">{networkConfig[network].label}</h4>
                          <button
                            onClick={() => copyToClipboard(address)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            title="Copy address"
                          >
                            <FaCopy className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="relative">
                          <p className="text-sm font-mono break-all bg-gray-50 px-3 py-2 rounded text-gray-700">
                            {address}
                          </p>
                          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white flex items-center justify-end pr-2 pointer-events-none">
                            <span className="text-xs text-gray-500 truncate">
                              {address.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Missing Networks */}
                {Object.entries(wallet)
                  .filter(([key]) => Object.keys(networkConfig).includes(key))
                  .filter(([_, value]) => !value).length > 0 && (
                  <div className="px-5 pb-4">
                    <h4 className="text-sm text-gray-500 mb-2">Networks not configured:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(wallet)
                        .filter(([key]) => Object.keys(networkConfig).includes(key))
                        .filter(([_, value]) => !value)
                        .map(([network]) => (
                          <span key={network} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500">
                            {networkConfig[network].label}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Network Address Form Modal */}
      {showForm && (
        <NetworkAddressForm 
          onClose={() => setShowForm(false)} 
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default NetworkAddressesList;