import React, { useState } from "react";
import API from "../../api/adminApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaSpinner, FaExclamationTriangle, FaMoneyCheck, FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";
import Transaction from "./Transaction";

const ManageTransactions = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Fetch transactions and filter out swap transactions
  const {
    data: transactions = [],
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      try {
        const res = await API.get("/api/transactions/transactions");
        
        if (!Array.isArray(res.data)) {
          throw new Error("Invalid transactions data format");
        }
        
        // Filter out swap transactions
        return res.data.filter(tx => tx.type !== 'swap');
      } catch (err) {
        throw new Error(
          err.response?.data?.message ||
          err.message ||
          "Failed to load transactions"
        );
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(tx => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tx._id.toLowerCase().includes(searchLower) ||
      (tx.user?.email && tx.user.email.toLowerCase().includes(searchLower)) ||
      (tx.user?.username && tx.user.username.toLowerCase().includes(searchLower)) ||
      tx.status.toLowerCase().includes(searchLower) ||
      tx.type.toLowerCase().includes(searchLower) ||
      tx.amount.toString().includes(searchTerm)
    );
  });

  // Filter by active category
  const categorizedTransactions = filteredTransactions.filter(tx => {
    if (activeCategory === "all") return true;
    return tx.status === activeCategory;
  });

  // Get counts for each category (excluding swap transactions)
  const categoryCounts = {
    all: filteredTransactions.length,
    pending: filteredTransactions.filter(tx => tx.status === 'pending').length,
    completed: filteredTransactions.filter(tx => tx.status === 'completed').length,
    cancelled: filteredTransactions.filter(tx => tx.status === 'cancelled').length,
    rejected: filteredTransactions.filter(tx => tx.status === 'rejected').length,
  };

  // Approve Deposit mutation
  const approveDepositMutation = useMutation({
    mutationFn: async (id) => {
      const res = await API.patch(`/api/transactions/${id}/approve-deposit`);
      if (res.status !== 200) {
        throw new Error(res.data?.message || "Deposit approval failed");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      toast.success("Deposit approved successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to approve deposit");
    },
  });

  // Approve Withdrawal mutation
  const approveWithdrawalMutation = useMutation({
    mutationFn: async (id) => {
      const res = await API.patch(`/api/transactions/${id}/approve-withdrawal`);
      if (res.status !== 200) {
        throw new Error(res.data?.message || "Withdrawal approval failed");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      toast.success("Withdrawal approved successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to approve withdrawal");
    },
  });

  // Reject mutation (works for all transaction types except swap)
  const rejectMutation = useMutation({
    mutationFn: async (id) => {
      const res = await API.patch(`/api/transactions/${id}/reject`);
      if (res.status !== 200) {
        throw new Error(res.data?.message || "Rejection failed");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions"]);
      toast.success("Transaction rejected successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to reject transaction");
    },
  });

  const handleApprove = async (tx) => {
    try {
      if (tx.type === 'deposit') {
        await approveDepositMutation.mutateAsync(tx._id);
      } else if (tx.type === 'withdrawal') {
        await approveWithdrawalMutation.mutateAsync(tx._id);
      }
    } catch (err) {
      console.error("Approval error:", err);
    }
  };

  const handleReject = async (tx) => {
    try {
      await rejectMutation.mutateAsync(tx._id);
    } catch (err) {
      console.error("Rejection error:", err);
    }
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <FaSpinner className="animate-spin text-3xl text-gray-500 mb-2" />
        <p className="text-gray-500">Loading transactions...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 my-4 rounded">
        <div className="flex items-center">
          <FaExclamationTriangle className="mr-2 text-red-500" />
          <div>
            <strong>Error loading transactions:</strong>
            <p className="mt-1">{error.message}</p>
            <button
              onClick={() => queryClient.refetchQueries(["transactions"])}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 text-gray-700 p-10 my-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <FaMoneyCheck className="mr-2 text-xl text-gray-500" />
          <div>
            <strong>No transactions found</strong>
            <p className="mt-1 text-sm">There are currently no transactions to manage.</p>
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
            Manage Transactions
          </h2>
          <p className="text-gray-500">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} found
            (excluding swaps)
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search transactions by ID, email, status, type, or amount..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'pending', 'completed', 'rejected'].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                activeCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category} ({categoryCounts[category]})
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Transactions List */}
      <div className="flex-1 overflow-y-auto px-6 pt-4">
        {categorizedTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No {activeCategory === 'all' ? '' : activeCategory} transactions found
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {categorizedTransactions.map((tx) => (
              <Transaction
                key={tx._id}
                tx={tx}
                onApprove={['deposit', 'withdrawal'].includes(tx.type) ? () => handleApprove(tx) : null}
                onReject={() => handleReject(tx)}
                isApproving={
                  (approveDepositMutation.isLoading && approveDepositMutation.variables === tx._id) ||
                  (approveWithdrawalMutation.isLoading && approveWithdrawalMutation.variables === tx._id)
                }
                isRejecting={rejectMutation.isLoading && rejectMutation.variables === tx._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTransactions;