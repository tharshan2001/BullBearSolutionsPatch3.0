import React, { useState } from "react";
import { FaTrash, FaEye, FaEyeSlash, FaLink, FaPaperclip, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const AnnouncementItem = ({ announcement, onDelete, deleting, onTogglePublish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(announcement.isPublished);

  // Handle publish toggle click
  const handleTogglePublish = async () => {
    if (isPublishing) return; // prevent double click

    setIsPublishing(true);

    try {
      // Call parent handler to update backend, wait for success
      await onTogglePublish(announcement._id, !isPublished);
      setIsPublished(!isPublished);
    } catch (error) {
      console.error("Failed to toggle publish status", error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Header with accent color */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: announcement.headerColor || '#0d9488' }}
      ></div>

      {/* Compact content */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-800 line-clamp-1 pr-2">
            {announcement.title}
          </h3>
          <div className="flex space-x-2 items-center">
            <button
              onClick={() => setIsVisible(!isVisible)}
              className="text-gray-500 hover:text-teal-600 p-1"
              title={isVisible ? "Hide Content" : "Show Content"}
            >
              {isVisible ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
            </button>

            <button
              onClick={handleTogglePublish}
              disabled={isPublishing}
              className={`p-1 ${isPublished ? 'text-green-600 hover:text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
              title={isPublished ? "Unpublish Announcement" : "Publish Announcement"}
            >
              {isPublished ? <FaCheckCircle size={16} /> : <FaTimesCircle size={16} />}
            </button>

            <button
              onClick={() => onDelete(announcement._id)}
              disabled={deleting}
              className={`p-1 ${deleting ? 'text-gray-400' : 'text-red-500 hover:text-red-600'}`}
              title="Delete Announcement"
            >
              <FaTrash size={14} />
            </button>
          </div>
        </div>

        {isVisible && (
          <div className="mt-2 text-sm text-gray-600">
            <p className="line-clamp-2 mb-2">{announcement.content}</p>

            {(announcement.link?.length > 0 || announcement.files?.length > 0) && (
              <div className="flex space-x-3 text-xs">
                {announcement.link?.length > 0 && (
                  <span className="flex items-center text-teal-600">
                    <FaLink className="mr-1" /> {announcement.link.length}
                  </span>
                )}
                {announcement.files?.length > 0 && (
                  <span className="flex items-center text-teal-600">
                    <FaPaperclip className="mr-1" /> {announcement.files.length}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementItem;
