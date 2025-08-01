import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaSpinner, FaPlus, FaTimes } from 'react-icons/fa';

const PremiumPlanForm = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prices: {
      yearly: '',
      monthly: ''
    },
    features: [],
    isActive: true,
    isPopular: false,
  });
  const [newFeature, setNewFeature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? parseFloat(value) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddFeature = (e) => {
    e.preventDefault();
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddFeature(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await API.post('/api/premium/plans', formData);
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create premium plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Plan Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Plan Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Pricing Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Yearly Price */}
          <div>
            <label htmlFor="prices.yearly" className="block text-sm font-medium text-gray-700 mb-1">
              Yearly Price *
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                id="prices.yearly"
                name="prices.yearly"
                value={formData.prices.yearly}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500">USD/year</span>
              </div>
            </div>
          </div>

          {/* Monthly Price */}
          <div>
            <label htmlFor="prices.monthly" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Price
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                id="prices.monthly"
                name="prices.monthly"
                value={formData.prices.monthly}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500">USD/month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <label htmlFor="newFeature" className="block text-sm font-medium text-gray-700 mb-1">
            Features
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              id="newFeature"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a feature"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-2" />
              Add
            </button>
          </div>
          
          {formData.features.length > 0 && (
            <ul className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-md border border-gray-200">
              {formData.features.map((feature, index) => (
                <li key={index} className="flex justify-between items-center bg-white px-3 py-2 rounded border border-gray-200 shadow-sm">
                  <span className="text-gray-800">{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="text-red-500 hover:text-red-700"
                    aria-label={`Remove feature ${feature}`}
                  >
                    <FaTimes />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Status Checkboxes */}
        <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active Plan
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPopular"
              name="isPopular"
              checked={formData.isPopular}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPopular" className="ml-2 block text-sm text-gray-700">
              Popular Plan
            </label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-4 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Creating...
            </>
          ) : 'Create Plan'}
        </button>
      </div>
    </form>
  );
};

export default PremiumPlanForm;