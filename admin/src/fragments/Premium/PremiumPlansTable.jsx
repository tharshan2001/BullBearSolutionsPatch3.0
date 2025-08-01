import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar, FaRegStar, FaSpinner, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import PremiumPlanForm from './PremiumPlanForm';

const PremiumPlansTable = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
  });

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await API.get('/api/premium/plans/last/admin');
        
        if (response.data.success && response.data.data) {
          setPlan(response.data.data);
        } else {
          setError('Invalid data format: Expected success and data properties');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch premium plan');
        console.error('Error fetching plan:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, []);

  const handleFormSuccess = () => {
    const fetchPlan = async () => {
      try {
        const response = await API.get('/api/premium/plans/last');
        if (response.data.success && response.data.data) {
          setPlan(response.data.data);
          toast.success('Premium plan created successfully!');
        }
      } catch (err) {
        toast.error('Failed to refresh plan data');
      }
    };
    fetchPlan();
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <FaSpinner className="animate-spin text-3xl text-blue-500 mb-2" />
        <p className="text-gray-500">Loading premium plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 my-4 rounded">
        <div className="flex items-center">
          <FaExclamationTriangle className="mr-2 text-red-500" />
          <div>
            <strong>Error loading premium plan:</strong>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 pt-4 px-6 pb-2 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Premium Plans</h2>
          <p className="text-gray-500">No premium plan available</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white border border-gray-200 text-gray-700 p-10 rounded-lg text-center shadow-sm">
            <h3 className="text-xl font-medium mb-2">No premium plans yet</h3>
            <p className="mb-6">Create your first premium plan to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-2" />
              Create Premium Plan
            </button>
          </div>
        </div>
        {showForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              <PremiumPlanForm 
                onSuccess={handleFormSuccess}
                onClose={() => setShowForm(false)}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Premium Plans</h2>
            <p className="text-gray-500">Current active premium plan</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaPlus className="mr-2" />
            New Premium Plan
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
        <div className="overflow-hidden border border-gray-200 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr key={plan._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-lg font-semibold text-gray-900">{plan.name}</div>
                    {plan.isPopular && (
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Popular
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700 max-w-xs">{plan.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">${plan.prices?.yearly?.toFixed(2) || '0.00'} <span className="text-gray-500">/year</span></div>
                    {plan.prices?.monthly && (
                      <div className="text-gray-500">${plan.prices.monthly.toFixed(2)} <span className="text-gray-500">/month</span></div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {plan.features?.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-1 mt-0.5">✓</span>
                        <span>{feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {plan.isActive ? (
                      <FaStar className="h-5 w-5 text-yellow-400" />
                    ) : (
                      <FaRegStar className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="ml-2 text-sm text-gray-700">
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for PremiumPlanForm */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <PremiumPlanForm 
              onSuccess={handleFormSuccess}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumPlansTable;