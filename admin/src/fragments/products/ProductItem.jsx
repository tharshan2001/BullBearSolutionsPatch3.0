import React, { useState } from "react";

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

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Safely calculate discounted price with correct field names
  const price = product.Price || product.price || 0;
  const discount = product.discount || 0;
  const discountedPrice = discount > 0 ? (price * (100 - discount)) / 100 : price;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedProduct({
      ...editedProduct,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ensure we send the data in the correct format expected by the backend
    const productToUpdate = {
      ...editedProduct,
      Price: parseFloat(editedProduct.price || editedProduct.Price), // Ensure Price is sent
    };
    
    // Remove the lowercase price field if it exists to avoid conflicts
    delete productToUpdate.price;
    
    await onEdit(productToUpdate);
    setIsEditing(false);
  };

  const handleToggleHideLocal = async () => {
    await onToggleHide(product._id, product.isHidden);
  };

  return (
    <div
      className={`relative border rounded-xl p-5 transition-all duration-200 ${
        isHovered ? "shadow-lg transform -translate-y-1" : "shadow-md"
      } ${product.isHidden ? "bg-gray-50 opacity-90" : "bg-white"}`}
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
                value={editedProduct.Title || ""}
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
                name="price"
                value={editedProduct.Price || editedProduct.price || ""}
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
                value={editedProduct.discount || 0}
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
                value={editedProduct.category || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                checked={editedProduct.isAvailable || false}
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
                checked={editedProduct.isHidden || false}
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
              value={editedProduct.description || ""}
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
              value={(editedProduct.tags || []).join(", ")}
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
                    {product.Title || "Untitled Product"}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {product.description || "No description available"}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {discount > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {discount}% OFF
                    </span>
                  )}
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      product.isAvailable
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.isAvailable ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-xl font-bold text-gray-900">
                  ${discountedPrice.toFixed(2)}
                </span>
                {discount > 0 && (
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    ${price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {product.category && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                )}
                {(product.tags || []).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {product.image && (
              <div className="flex-shrink-0">
                <img
                  src={
                    product.image.startsWith("http")
                      ? product.image
                      : `${API_BASE_URL}${product.image}`
                  }
                  alt={product.Title || "Product image"}
                  className="w-24 h-24 object-cover rounded-lg border-2 border-teal-600"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="mt-5 flex justify-between items-center">
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-600">
                {product.isHidden ? "Hidden" : "Visible"}
              </span>
              <button
                onClick={handleToggleHideLocal}
                type="button"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                  product.isHidden ? "bg-gray-200" : "bg-teal-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    product.isHidden ? "translate-x-1" : "translate-x-6"
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
                onClick={() => onDelete(product._id)}
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