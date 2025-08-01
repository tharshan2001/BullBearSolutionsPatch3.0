import React, { useState } from "react";
import AnnouncementItem from "../annoncement/AnnouncementItem";
import API from "../../api/adminApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaSpinner, FaExclamationTriangle, FaBullhorn, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import AnnouncementForm from "./AnnouncementForm";

const AnnouncementsList = () => {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    data: announcements = [],
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      try {
        const res = await API.get("/api/announcements");
        if (!res.data || !Array.isArray(res.data)) {
          throw new Error("Invalid data format received");
        }
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || err.message || "Failed to load announcements");
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await API.delete(`/api/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["announcements"]);
      toast.success("Announcement deleted successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete announcement");
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, publish }) => {
      const endpoint = `/api/announcements/${id}/${publish ? "show" : "hide"}`;
      await API.patch(endpoint);
      return publish;
    },
    onSuccess: (publish) => {
      queryClient.invalidateQueries(["announcements"]);
      toast.success(`Announcement ${publish ? "published" : "unpublished"} successfully`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update publish status");
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleTogglePublish = (id, publish) => {
    togglePublishMutation.mutate({ id, publish });
  };

  const handleAnnouncementCreated = () => {
    setShowCreateForm(false);
    queryClient.invalidateQueries(["announcements"]);
    toast.success("Announcement created successfully");
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col justify-center items-center">
        <FaSpinner className="animate-spin text-3xl text-gray-500 mb-2" />
        <p className="text-gray-500">Loading announcements...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 my-4 rounded">
        <div className="flex items-center">
          <FaExclamationTriangle className="mr-2 text-red-500" />
          <div>
            <strong>Error loading announcements:</strong>
            <p className="mt-1">{error.message}</p>
            <button
              onClick={() => queryClient.refetchQueries(["announcements"])}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50">
      {/* Fixed Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 pt-4 px-6 pb-2 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
              <FaBullhorn className="mr-2 text-gray-700" />
              Announcements Management
            </h2>
            <p className="text-gray-500">
              {announcements.length} announcement{announcements.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <FaPlus className="mr-2" />
            New Announcement
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
        {announcements.length === 0 ? (
          <div className="bg-white border border-gray-200 text-gray-700 p-10 my-4 rounded-lg shadow-sm">
            <div className="flex flex-col items-center text-center">
              <FaBullhorn className="text-4xl text-gray-500 mb-4" />
              <div>
                <strong>No announcements found</strong>
                <p className="mt-1 text-sm">There are currently no announcements to display.</p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              >
                <FaPlus className="mr-2" />
                Create Announcement
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((announcement) => (
              <AnnouncementItem
                key={announcement._id}
                announcement={announcement}
                onDelete={handleDelete}
                deleting={deleteMutation.isLoading && deleteMutation.variables === announcement._id}
                onTogglePublish={handleTogglePublish}
                publishing={togglePublishMutation.isLoading && togglePublishMutation.variables?.id === announcement._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
              onClick={() => setShowCreateForm(false)}
            >
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Announcement</h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-4">
                  <AnnouncementForm 
                    onSuccess={handleAnnouncementCreated}
                    onClose={() => setShowCreateForm(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsList;