import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const ProductItem = ({
  product,
  onEdit,
  onDelete,
  onToggleHide,
  isDeleting,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState({ ...product });
  const [isHovered, setIsHovered] = useState(false);
  const [socket, setSocket] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(product);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const newSocket = io(
      import.meta.env.VITE_API_BASE_URL
    );
    setSocket(newSocket);

    // Clean up on unmount
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Listen for product updates from server
    socket.on("productUpdated", (updatedProduct) => {
      if (updatedProduct._id === currentProduct._id) {
        setCurrentProduct(updatedProduct);
      }
    });

    return () => {
      socket.off("productUpdated");
    };
  }, [socket, currentProduct._id]);

  const discountedPrice =
    currentProduct.discount > 0
      ? (currentProduct.Price * (100 - currentProduct.discount)) / 100
      : currentProduct.Price;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedProduct({
      ...editedProduct,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onEdit(editedProduct);
    setIsEditing(false);
    // Emit update to server
    if (socket) {
      socket.emit("updateProduct", editedProduct);
    }
  };

  const handleToggleHide = async () => {
    const updatedHiddenStatus = !currentProduct.isHidden;
    const updatedProduct = {
      ...currentProduct,
      isHidden: updatedHiddenStatus,
    };

    try {
      await onToggleHide(currentProduct._id, updatedHiddenStatus);
      setCurrentProduct(updatedProduct);

      // Emit update to server
      if (socket) {
        socket.emit("updateProduct", updatedProduct);
      }
    } catch (error) {
      console.error("Error toggling hide status:", error);
    }
  };

  return (
    <div
      className={`relative border rounded-xl p-5 transition-all duration-200 ${
        isHovered ? "shadow-lg transform -translate-y-1" : "shadow-md"
      } ${currentProduct.isHidden ? "bg-gray-50 opacity-90" : "bg-white"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="Title"
                value={editedProduct.Title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                name="Price"
                value={editedProduct.Price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={editedProduct.discount}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={editedProduct.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                checked={editedProduct.isAvailable}
                onChange={handleInputChange}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Available
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isHidden"
                checked={editedProduct.isHidden}
                onChange={handleInputChange}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Hidden</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={editedProduct.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={editedProduct.tags?.join(", ")}
              onChange={(e) =>
                handleInputChange({
                  target: {
                    name: "tags",
                    value: e.target.value.split(",").map((tag) => tag.trim()),
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between gap-4 ">
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentProduct.Title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {currentProduct.description}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {currentProduct.discount > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {currentProduct.discount}% OFF
                    </span>
                  )}
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      currentProduct.isAvailable
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentProduct.isAvailable ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-xl font-bold text-gray-900">
                  ${discountedPrice.toFixed(2)}
                </span>
                {currentProduct.discount > 0 && (
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    ${currentProduct.Price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {currentProduct.category}
                </span>
                {currentProduct.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {currentProduct.image && (
              <div className="flex-shrink-0">
                <img
                  src={
                    currentProduct.image.startsWith("http")
                      ? currentProduct.image
                      : `${API_BASE_URL}${currentProduct.image}`
                  }
                  alt={currentProduct.Title}
                  className="w-24 h-24 object-cover rounded-lg border-2 border-teal-600"
                />
              </div>
            )}
          </div>

          <div className="mt-5 flex justify-between items-center">
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-600">
                {currentProduct.isHidden ? "Hidden" : "Visible"}
              </span>
              <button
                onClick={handleToggleHide}
                type="button"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                  currentProduct.isHidden ? "bg-gray-200" : "bg-teal-600"
                }`}
                disabled={!socket}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    currentProduct.isHidden ? "translate-x-1" : "translate-x-6"
                  }`}
                />
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 border border-teal-600 rounded-md text-sm font-medium text-teal-600 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(currentProduct)}
                disabled={isDeleting}
                className={`px-3 py-1 border border-red-600 rounded-md text-sm font-medium ${
                  isDeleting
                    ? "bg-gray-100 text-gray-500 border-gray-300"
                    : "text-red-600 hover:bg-red-50"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductItem;
