import React from "react";
import SubscriptionItem from "../Subscription/SubscriptionItem";
import API from "../../api/adminApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaSpinner, FaExclamationTriangle, FaClipboardList } from "react-icons/fa";
import toast from "react-hot-toast";

const SubscriptionsList = () => {
  const queryClient = useQueryClient();

  const {
    data: subscriptions,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      try {
        const res = await API.get("/api/subscriptions/getAll");
        if (!res.data.success) throw new Error("Failed to fetch subscriptions");
        return res.data.subscriptions;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to load subscriptions");
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const activateMutation = useMutation({
    mutationFn: async (id) => {
      const res = await API.patch(`/api/subscriptions/${id}/activate`);
      if (!res.data.success) throw new Error(res.data.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["subscriptions"]);
      toast.success("Subscription activated successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to activate subscription");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id) => {
      const res = await API.patch(`/api/subscriptions/${id}/deactivate`);
      if (!res.data.success) throw new Error(res.data.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["subscriptions"]);
      toast.success("Subscription deactivated successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to deactivate subscription");
    },
  });

  const handleActivate = async (id) => {
    try {
      await activateMutation.mutateAsync(id);
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await deactivateMutation.mutateAsync(id);
    } catch (err) {
      // Error handled by mutation
    }
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col justify-center items-center">
        <FaSpinner className="animate-spin text-3xl text-gray-500 mb-2" />
        <p className="text-gray-500">Loading subscriptions...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 my-4 rounded">
        <div className="flex items-center">
          <FaExclamationTriangle className="mr-2 text-red-500" />
          <div>
            <strong>Error loading subscriptions:</strong>
            <p className="mt-1">{error.message}</p>
            <button
              onClick={() => queryClient.refetchQueries(["subscriptions"])}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 text-gray-700 p-10 my-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <FaClipboardList className="mr-2 text-xl text-gray-500" />
          <div>
            <strong>No subscriptions found</strong>
            <p className="mt-1 text-sm">There are currently no subscriptions to display.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" flex flex-col bg-gray-50">
      {/* Fixed Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 pt-4 px-6 pb-2 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
          <FaClipboardList className="mr-2 text-gray-700" />
          Subscriptions Management
        </h2>
        <p className="text-gray-500">
          {subscriptions.length} subscription{subscriptions.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => (
            <SubscriptionItem
              key={subscription._id}
              subscription={subscription}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
              isActivating={activateMutation.isLoading && activateMutation.variables === subscription._id}
              isDeactivating={deactivateMutation.isLoading && deactivateMutation.variables === subscription._id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsList;