import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../../api/adminApi";
import { FaSpinner, FaExclamationTriangle, FaMoneyCheck } from "react-icons/fa";
import toast from "react-hot-toast";

export default function ConfigList() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [totalLevelRates, setTotalLevelRates] = useState(0);

  const { data: config, error, isLoading } = useQuery({
    queryKey: ["configs"],
    queryFn: async () => (await API.get("/api/config/getAll")).data[0],
  });

  const mutation = useMutation({
    mutationFn: (updatedData) => API.put(`/api/config`, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries(["configs"]);
      setEditing(false);
      toast.success("Configuration updated successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update configuration");
    },
  });

  useEffect(() => {
    if (config) setEditValues({
      directCommissionRate: config.directCommissionRate,
      commissionPercentage: config.commissionPercentage,
      levelRates: { ...config.levelRates },
    });
  }, [config]);

  useEffect(() => {
    if (editing && editValues.levelRates) {
      const total = Object.values(editValues.levelRates).reduce((sum, rate) => sum + rate, 0);
      setTotalLevelRates(total);
    }
  }, [editValues.levelRates, editing]);

  const handleInputChange = (e, field, level = null) => {
    setEditValues(prev => ({
      ...prev,
      ...(level !== null 
        ? { levelRates: { ...prev.levelRates, [level]: parseFloat(e.target.value) || 0 } }
        : { [field]: parseFloat(e.target.value) || 0 }
      )
    }));
  };

  const handleSave = () => {
    mutation.mutate(editValues);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <FaSpinner className="animate-spin text-3xl text-blue-500 mb-2" />
        <p className="text-gray-500">Loading configuration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 my-4 rounded">
        <div className="flex items-center">
          <FaExclamationTriangle className="mr-2 text-red-500" />
          <div>
            <strong>Error loading configuration:</strong>
            <p className="mt-1">{error.message}</p>
            <button
              onClick={() => queryClient.refetchQueries(["configs"])}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-white border border-gray-200 text-gray-700 p-10 my-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <FaMoneyCheck className="mr-2 text-xl text-blue-500" />
          <div>
            <strong>No configuration found</strong>
            <p className="mt-1 text-sm">There is currently no configuration data available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Fixed Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 pt-4 px-10 pb-2 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaMoneyCheck className="mr-2 text-blue-500" />
            Commission Pool
          </h2>
          {!editing && (
            <button 
              onClick={() => setEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Configure
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-10 pt-4 pb-10">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {['directCommissionRate', 'commissionPercentage'].map(field => (
              <div key={field} className="space-y-1">
                <label className="block text-lg text-gray-700 mb-1">
                  {field === 'directCommissionRate' ? 'Direct Rate' : 'Commission Rate'}
                </label>
                {editing ? (
                  <input
                    type="number"
                    value={editValues[field]}
                    onChange={(e) => handleInputChange(e, field)}
                    step="0.01"
                    className="w-full p-2 text-lg border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="text-xl text-blue-600 font-medium">
                    {config[field]}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold text-gray-800">Level Rates</h3>
              {editing && (
                <div className="text-lg text-gray-700">
                  Total: {totalLevelRates.toFixed(2)}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {Array.from({ length: 20 }, (_, i) => i + 1).map(level => (
                <div key={level} className="space-y-1">
                  <label className="block text-sm text-gray-500">L{level}</label>
                  {editing ? (
                    <input
                      type="number"
                      value={editValues.levelRates[level] || 0}
                      onChange={(e) => handleInputChange(e, "levelRates", level)}
                      step="0.01"
                      className="w-full p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="text-md text-blue-600">
                      {(config.levelRates[level] || 0).toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {editing && (
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {mutation.isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}