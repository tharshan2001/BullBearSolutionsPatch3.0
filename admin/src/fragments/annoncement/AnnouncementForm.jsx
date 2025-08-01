import React, { useState } from "react";
import axios from "axios";
import { FaSpinner, FaTimes, FaTrash, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";

const AnnouncementForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isPublished: false,
    publishedAt: "",
    header: false,
    headerColor: "#3b82f6",
    link: [""],
  });
  const [imageFile, setImageFile] = useState(null);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    content: "",
    image: "",
    general: "",
  });

  const MAX_ATTACHMENTS = 5;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleAttachmentsChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (attachmentFiles.length + newFiles.length > MAX_ATTACHMENTS) {
      toast.error(`Maximum ${MAX_ATTACHMENTS} attachments allowed`);
      return;
    }
    setAttachmentFiles([...attachmentFiles, ...newFiles]);
  };

  const removeAttachment = (index) => {
    setAttachmentFiles(attachmentFiles.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...formData.link];
    newLinks[index] = value;
    setFormData((prev) => ({ ...prev, link: newLinks }));
  };

  const addLinkField = () => {
    setFormData((prev) => ({ ...prev, link: [...prev.link, ""] }));
  };

  const removeLinkField = (index) => {
    setFormData((prev) => ({
      ...prev,
      link: prev.link.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {
      title: !formData.title.trim() ? "Title is required" : "",
      content: !formData.content.trim() ? "Content is required" : "",
      image: !imageFile ? "Featured image is required" : "",
      general: "",
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading("Creating announcement...");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("isPublished", formData.isPublished);
    data.append("header", formData.header);
    data.append("headerColor", formData.headerColor);

    if (imageFile) data.append("imageUrl", imageFile);
    attachmentFiles.forEach((file) => data.append("files", file));

    formData.link
      .filter((link) => link.trim() !== "")
      .forEach((link) => {
        data.append("link", link);
      });

    if (formData.isPublished && formData.publishedAt) {
      data.append("publishedAt", new Date(formData.publishedAt).toISOString());
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/announcements/`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      toast.success("Announcement created successfully!", { id: loadingToast });
      setFormData({
        title: "",
        content: "",
        isPublished: false,
        publishedAt: "",
        header: false,
        headerColor: "#3b82f6",
        link: [""],
      });
      setImageFile(null);
      setAttachmentFiles([]);

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error("Submission error:", err);
      const errorMessage =
        err.response?.data?.error || "Failed to create announcement";
      setErrors((prev) => ({ ...prev, general: errorMessage }));
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isSubmitting}
        >
          <FaTimes className="text-xl" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Create Announcement
        </h2>

        {errors.general && (
          <div className="bg-red-100 border-l-4 border-red-500 p-3 mb-4 rounded text-sm text-red-700">
            <p>{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-white border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? "border-red-500" : "border-gray-300"
              } text-gray-900`}
              required
            />
            {errors.title && (
              <p className="text-red-600 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content*
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={4}
              className={`w-full px-3 py-2 bg-white border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.content ? "border-red-500" : "border-gray-300"
              } text-gray-900`}
              required
            />
            {errors.content && (
              <p className="text-red-600 text-xs mt-1">{errors.content}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Featured Image*
            </label>
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center p-2 border-2 border-dashed border-blue-400 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 text-sm text-gray-600 transition-colors">
                <span className="truncate max-w-[120px]">
                  {imageFile ? imageFile.name : "Choose image..."}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
              </label>
              {imageFile && (
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <FaTrash className="text-sm" />
                </button>
              )}
            </div>
            {errors.image && (
              <p className="text-red-600 text-xs mt-1">{errors.image}</p>
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachments (Max {MAX_ATTACHMENTS})
            </label>
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center p-2 border-2 border-dashed border-blue-400 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 text-sm text-gray-600 transition-colors">
                <span>{attachmentFiles.length} files selected</span>
                <input
                  type="file"
                  multiple
                  onChange={handleAttachmentsChange}
                  disabled={attachmentFiles.length >= MAX_ATTACHMENTS}
                  className="hidden"
                />
              </label>
              {attachmentFiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAttachmentFiles([])}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <FaTrash className="text-sm" />
                </button>
              )}
            </div>
            {attachmentFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachmentFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-xs text-gray-600 bg-gray-100 p-2 rounded"
                  >
                    <span className="truncate max-w-[180px]">{file.name}</span>
                    <div className="flex items-center gap-2">
                      <span>{(file.size / 1024).toFixed(1)}KB</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Publish Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span>Publish Now</span>
            </label>

            {formData.isPublished && (
              <input
                type="datetime-local"
                name="publishedAt"
                value={formData.publishedAt}
                onChange={handleChange}
                className="px-2 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700"
              />
            )}
          </div>

          {/* Header Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="header"
                checked={formData.header}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span>Header Announcement</span>
            </label>

            {formData.header && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Color:</span>
                <input
                  type="color"
                  name="headerColor"
                  value={formData.headerColor}
                  onChange={handleChange}
                  className="h-6 w-6 rounded border border-gray-300 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Links
            </label>
            <div className="space-y-2">
              {formData.link.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {formData.link.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLinkField(index)}
                      className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addLinkField}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500 mt-1 transition-colors"
              >
                <FaPlus className="text-xs" />
                Add Link
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 rounded-md text-white font-medium transition-colors ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500"
              } flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Announcement"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementForm;