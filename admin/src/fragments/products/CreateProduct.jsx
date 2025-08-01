import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

const CreateProduct = ({ onCreated, onClose }) => {
  const [form, setForm] = useState({
    Title: "",
    Price: "",
    description: "",
    imageUrl: "",
    category: "",
    tags: "",
    discount: "",
    sellingCount: "",
    isAvailable: true,
    isHidden: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      toast.error("Please select an image file (JPEG, PNG, GIF, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);
    setForm((prev) => ({ ...prev, imageUrl: "" })); // Clear URL if file selected

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setForm((prev) => ({ ...prev, imageUrl: url }));

    if (url && !imageFile) {
      setImagePreview(url);
    } else if (!url) {
      setImagePreview("");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setForm((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const toastId = toast.loading("Creating product...");

    try {
      if (!imageFile && !form.imageUrl) {
        throw new Error("Please provide either an image file or URL");
      }

      if (form.imageUrl && !/^https?:\/\/.+\..+/.test(form.imageUrl)) {
        throw new Error("Please enter a valid image URL");
      }

      const formData = new FormData();

      formData.append("Title", form.Title);
      formData.append("Price", form.Price);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("discount", form.discount);
      formData.append("sellingCount", form.sellingCount);
      formData.append("isAvailable", form.isAvailable);
      formData.append("isHidden", form.isHidden);

      formData.append(
        "tags",
        JSON.stringify(
          form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        )
      );

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (form.imageUrl) {
        formData.append("imageUrl", form.imageUrl);
      }

      const res = await API.post("/api/products/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Product created successfully!", {
        id: toastId,
        duration: 4000,
      });

      setForm({
        Title: "",
        Price: "",
        description: "",
        imageUrl: "",
        category: "",
        tags: "",
        discount: "",
        sellingCount: "",
        isAvailable: true,
        isHidden: false,
      });
      removeImage();

      if (onCreated) onCreated(res.data);
    } catch (err) {
      setLoading(false);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to create product";
      setError(errorMsg);

      toast.error(errorMsg, {
        id: toastId,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-5"
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          className="relative w-full max-w-md mx-4 bg-white/80 rounded-lg shadow-xl border border-gray-200 overflow-y-auto max-h-[90vh]"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Create Product</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none focus:outline-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="p-2 text-sm text-red-600 bg-red-50 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title*
                </label>
                <input
                  type="text"
                  name="Title"
                  value={form.Title}
                  onChange={handleChange}
                  required
                  className="w-full text-sm px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price*
                </label>
                <input
                  type="number"
                  name="Price"
                  value={form.Price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full text-sm px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={form.discount}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="1"
                  className="w-full text-sm px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full text-sm px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image*
                </label>

                {imagePreview && (
                  <div className="mb-3 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-full object-contain border rounded"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded border focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      Upload Image
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <span className="text-xs text-gray-500">or</span>
                  </div>

                  <div>
                    <input
                      type="url"
                      name="imageUrl"
                      value={form.imageUrl}
                      onChange={handleImageUrlChange}
                      placeholder="Enter image URL"
                      className="w-full text-sm px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Provide either an image file or URL
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full text-sm px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="tag1, tag2"
                  className="w-full text-sm px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Count
                </label>
                <input
                  type="number"
                  name="sellingCount"
                  value={form.sellingCount}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full text-sm px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={form.isAvailable}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span>Available</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    name="isHidden"
                    checked={form.isHidden}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span>Hidden</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loading ? "Creating..." : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateProduct;
