import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FaSpinner, FaExclamationTriangle, FaPlus, FaExternalLinkAlt, FaCopy, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ResourceForm from './ResourceForm';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

const ResourcesTable = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  const fetchResources = async () => {
    try {
      const response = await API.get('/api/resources/getAdmin');
      return response.data.resources || response.data; // Handle both response formats
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch resources'
      );
    }
  };

  const { 
    data: resources, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['adminResources'],
    queryFn: fetchResources,
    retry: 1,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const handleFormSuccess = async () => {
    try {
      await refetch();
      toast.success(selectedResource ? 'Resource updated successfully!' : 'Resource created successfully!');
      setShowForm(false);
      setSelectedResource(null);
    } catch (err) {
      toast.error('Failed to refresh resources');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = (resource) => {
    setSelectedResource(resource);
    setShowForm(true);
  };

  const handleDelete = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await API.delete(`/api/resources/${resourceId}`);
        await refetch();
        toast.success('Resource deleted successfully!');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete resource');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <FaSpinner className="animate-spin text-3xl text-blue-500 mb-2" />
        <p className="text-gray-500">Loading resources...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 pt-4 px-6 pb-2 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Resources</h2>
          <p className="text-gray-500">Error loading resources</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded max-w-md">
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2 text-red-500" />
              <div>
                <strong>Error loading resources:</strong>
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

  if (!resources || resources.length === 0) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 pt-4 px-6 pb-2 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Resources</h2>
              <p className="text-gray-500">No resources available</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-2" />
              Add Resource
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white border border-gray-200 text-gray-700 p-10 rounded-lg text-center shadow-sm">
            <h3 className="text-xl font-medium mb-2">No resources yet</h3>
            <p className="mb-6">Add your first resource to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-2" />
              Add Resource
            </button>
          </div>
        </div>
        {showForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              <ResourceForm 
                onSuccess={handleFormSuccess}
                onClose={() => setShowForm(false)}
                resource={selectedResource}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Fixed Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 pt-4 px-6 pb-2 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Resources</h2>
            <p className="text-gray-500">
              {resources.length} resource{resources.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedResource(null);
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaPlus className="mr-2" />
            Add Resource
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
        <div className="overflow-hidden border border-gray-200 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resources.map((resource) => (
                <tr key={resource._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{resource.title}</div>
                    <div className="text-xs text-gray-500">ID: {resource._id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center truncate max-w-xs"
                      >
                        {resource.url}
                        <FaExternalLinkAlt className="ml-2 h-3 w-3" />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(resource.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => copyToClipboard(resource.url)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy URL"
                      >
                        <FaCopy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(resource)}
                        className="text-blue-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(resource._id)}
                        className="text-red-400 hover:text-red-600"
                        title="Delete"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for ResourceForm */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <ResourceForm 
              onSuccess={handleFormSuccess}
              onClose={() => {
                setShowForm(false);
                setSelectedResource(null);
              }}
              resource={selectedResource}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesTable;