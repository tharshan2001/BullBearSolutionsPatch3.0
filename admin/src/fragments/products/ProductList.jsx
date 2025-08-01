import React, { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import ProductItem from './ProductItem';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CreateProduct from './CreateProduct';
import { FaSpinner, FaExclamationTriangle, FaMoneyCheck, FaSearch, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProductList = () => {
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const { isAuthenticated, loading: authLoading } = useAdminAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  API.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        setError('Session expired. Please log in again.');
      }
      return Promise.reject(error);
    }
  );

  const {
    data: products = [],
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await API.get('/api/products');
      return response.data;  
    },
    retry: 2,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await API.delete(`/api/products/delete/${id}`);
      return response.data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries(['products']);
      const previous = queryClient.getQueryData(['products']);
      queryClient.setQueryData(['products'], old =>
        old.filter(p => p._id !== id)
      );
      return { previous };
    },
    onError: (err, id, context) => {
      setError(err.message);
      toast.error(err.message || 'Failed to delete product');
      if (context?.previous) {
        queryClient.setQueryData(['products'], context.previous);
      }
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['products']);
    },
  });

  const editMutation = useMutation({
    mutationFn: (updatedProduct) =>
      API.put(`/api/products/update/${updatedProduct._id}`, updatedProduct),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setError(null);
      toast.success('Product updated successfully');
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to update product');
      toast.error(err.response?.data?.message || 'Failed to update product');
    },
  });

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
      withCredentials: true,
    });
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleVisibilityChange = (updatedProduct) => {
      queryClient.setQueryData(['products'], old =>
        old.map(product =>
          product._id === updatedProduct._id ? updatedProduct : product
        )
      );
    };

    socket.on('productVisibilityChanged', handleVisibilityChange);

    return () => {
      socket.off('productVisibilityChanged', handleVisibilityChange);
    };
  }, [socket, queryClient]);

  const handleToggleHide = async (id, isHidden) => {
    if (!isAuthenticated) {
      setError('You must be logged in to toggle product visibility');
      toast.error('You must be logged in to toggle product visibility');
      return;
    }

    try {
      queryClient.setQueryData(['products'], old =>
        old.map(product =>
          product._id === id ? { ...product, isHidden: !isHidden } : product
        )
      );

      await API.patch(`/api/products/enable/${id}`, { isHidden: !isHidden });
      toast.success(`Product ${!isHidden ? 'hidden' : 'visible'} successfully`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle product visibility');
      toast.error(err.response?.data?.message || 'Failed to toggle product visibility');

      queryClient.setQueryData(['products'], old =>
        old.map(product =>
          product._id === id ? { ...product, isHidden } : product
        )
      );
    }
  };

  const handleDelete = async (id) => {
    if (!isAuthenticated) {
      setError('You must be logged in to delete products');
      toast.error('You must be logged in to delete products');
      return;
    }

    if (window.confirm('Are you sure you want to permanently delete this product?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        // error handled by mutation
      }
    }
  };

  const handleEdit = (updatedProduct) => {
    if (!isAuthenticated) {
      setError('You must be logged in to edit products');
      toast.error('You must be logged in to edit products');
      return;
    }
    editMutation.mutate(updatedProduct);
  };

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    if (!searchTerm.trim()) return products;

    const term = searchTerm.toLowerCase();

    const searchableFields = [
      'Title',
      'description',
      '_id',
      'category',
      'price',
      'discount',
      'sellingCount',
      'tags',
    ];

    return products.filter(product => {
      return searchableFields.some(field => {
        const value = product[field];
        if (value === undefined || value === null) return false;

        if (Array.isArray(value)) {
          return value.some(item => String(item).toLowerCase().includes(term));
        }

        return String(value).toLowerCase().includes(term);
      });
    });
  }, [products, searchTerm]);

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-70">
        <FaSpinner className="animate-spin text-3xl text-gray-500 mb-2" />
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (isError || error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 my-4 rounded">
        <div className="flex items-center">
          <FaExclamationTriangle className="mr-2 text-red-500" />
          <div>
            <strong>Error loading products:</strong>
            <p className="mt-1">{error || queryError?.message}</p>
            <button
              onClick={() => {
                setError(null);
                queryClient.refetchQueries(["products"]);
              }}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-white border border-gray-200 text-gray-700 p-10 my-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <FaMoneyCheck className="mr-2 text-xl text-gray-500" />
          <div>
            <strong>No products found</strong>
            <p className="mt-1 text-sm">There are currently no products to display.</p>
            <button
              onClick={() => queryClient.invalidateQueries(['products'])}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-500 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Fixed Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 pt-4 px-6 pb-2 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
            <FaMoneyCheck className="mr-2 text-gray-700" />
            Product Catalog
          </h2>
          <p className="text-gray-500">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by title, category, tags..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-10">
        {/* Status Messages */}
        {deleteMutation.isLoading && (
          <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-800 rounded-lg">
            <div className="flex items-center">
              <FaSpinner className="animate-spin mr-3 text-blue-500" />
              <span>Deleting product...</span>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductItem
              key={product._id}
              product={product}
              onEdit={isAuthenticated ? handleEdit : null}
              onDelete={isAuthenticated ? () => handleDelete(product._id) : null}
              onToggleHide={isAuthenticated ? handleToggleHide : null}
              isDeleting={deleteMutation.isLoading && deleteMutation.variables === product._id}
            />
          ))}
        </div>

        {/* Empty Search State */}
        {filteredProducts.length === 0 && searchTerm && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-700">No products match your search</h3>
            <p className="mt-1">Try adjusting your search term</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-500 transition-colors"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Floating Action Button */}
        {isAuthenticated && (
          <button
            onClick={() => setShowPopup(true)}
            className="fixed bottom-8 right-8 w-14 h-14 bg-teal-600 rounded-full shadow-xl text-white flex items-center justify-center hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-100"
            aria-label="Add new product"
          >
            <FaPlus className="text-xl" />
          </button>
        )}

        {/* Create Product Modal */}
        {showPopup && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div 
                className="fixed inset-0 transition-opacity" 
                aria-hidden="true"
                onClick={() => setShowPopup(false)}
              >
                <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200">
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Product</h3>
                    <button
                      onClick={() => setShowPopup(false)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mt-4">
                    <CreateProduct 
                      onCreated={(newProduct) => {
                        setShowPopup(false);
                        queryClient.invalidateQueries(['products']);
                        toast.success('Product created successfully');
                      }}
                      onClose={() => setShowPopup(false)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;