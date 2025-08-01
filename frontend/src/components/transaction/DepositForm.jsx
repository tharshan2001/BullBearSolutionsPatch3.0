import React, { useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiChevronLeft } from "react-icons/fi";
import { SiTether } from "react-icons/si";
import toast from "react-hot-toast";
import HeaderA from "../HeaderA";
import Notice from "./Notice";
import Address from "./Address";

const DepositForm = () => {
  const { axiosInstance } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    amount: "",
    currency: "USDT",
    securityPin: "",
    files: null,
  });

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [formErrors, setFormErrors] = useState({
    amount: "",
    securityPin: "",
    files: "",
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      amount: "",
      securityPin: "",
      files: "",
    };

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
      valid = false;
    }

    if (!formData.securityPin || !/^\d{4}$/.test(formData.securityPin)) {
      newErrors.securityPin = "Please enter a valid 4-digit PIN";
      valid = false;
    }

    if (!formData.files) {
      newErrors.files = "Please upload proof of payment";
      valid = false;
    }

    setFormErrors(newErrors);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        files: file,
      }));
      setFormErrors((prev) => ({
        ...prev,
        files: "",
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("amount", formData.amount);
      formDataToSend.append("currency", formData.currency);
      formDataToSend.append("securityPin", formData.securityPin);
      formDataToSend.append("files", formData.files);

      const apiEndpoint = import.meta.env.VITE_API_BASE_URL
        ? `${import.meta.env.VITE_API_BASE_URL}/api/transactions/deposit`
        : "/api/transactions/deposit";

      const response = await axiosInstance.post(apiEndpoint, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      toast.success("Deposit request submitted successfully!");
      navigate("/Account");
    } catch (error) {
      console.error("Deposit error:", error);

      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          "Failed to submit deposit";
        toast.error(errorMessage);

        // Handle specific field errors if returned by server
        if (error.response.data?.errors) {
          setFormErrors((prev) => ({
            ...prev,
            ...error.response.data.errors,
          }));
        }
      } else if (error.request) {
        // Request was made but no response received
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else {
        // Something else happened
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full px-15 pt-2 pb-10 max w-full bg-[#181b2c] min-h-screen">
      <Notice/>
      <HeaderA title="Account & Transaction" onBack={() => navigate(-1)} />
      <header className="py-8 flex flex-col items-start justify-center mt-10">
        <h1 className="text-xl font-bold text-white text-center">Deposit</h1>
        <div className="w-20 h-[1.5px] rounded-full bg-gradient-to-r from-teal-600 to-teal-300 mt-2 mb-5" />
      </header>
<Address/>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-10 mb-6 hover:border-[#33eed5]/30 transition-colors">
        <form onSubmit={handleSubmit}>
          {/* Amount Field */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">
              Amount (USDT)
            </label>
            <div className="relative">
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={`w-full bg-[#2a2a32] border ${
                  formErrors.amount ? "border-red-500" : "border-[#3a3a42]"
                } rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#33eed5]`}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={loading}
              />
              <div className="absolute right-3 top-2 text-[#33eed5]">
                <SiTether className="text-xl" />
              </div>
            </div>
            {formErrors.amount && (
              <p className="text-red-500 text-sm mt-1">{formErrors.amount}</p>
            )}
          </div>

          {/* Security PIN Field */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">
              Security PIN
            </label>
            <input
              type="password"
              name="securityPin"
              value={formData.securityPin}
              onChange={handleChange}
              className={`w-full bg-[#2a2a32] border ${
                formErrors.securityPin ? "border-red-500" : "border-[#3a3a42]"
              } rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#33eed5]`}
              placeholder="Enter your 4-digit security PIN"
              maxLength="4"
              disabled={loading}
            />
            {formErrors.securityPin && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.securityPin}
              </p>
            )}
          </div>

          {/* Hidden Currency Field */}
          <input type="hidden" name="currency" value="USDT" />

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm text-gray-300 mb-1">
              Proof of Payment
            </label>
            <div
              className={`border-2 border-dashed ${
                formErrors.files ? "border-red-500" : "border-[#3a3a42]"
              } rounded-lg p-4 text-center hover:border-[#33eed5] transition-colors`}
            >
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf"
                disabled={loading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center">
                  <FiUpload className="text-[#33eed5] text-2xl mb-2" />
                  <p className="text-sm text-gray-300">
                    {formData.files
                      ? formData.files.name
                      : "Click to upload screenshot or proof"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports JPG, PNG, or PDF
                  </p>
                </div>
              </label>
            </div>
            {formErrors.files && (
              <p className="text-red-500 text-sm mt-1">{formErrors.files}</p>
            )}

            {previewImage && (
              <div className="mt-3">
                <p className="text-xs text-gray-300 mb-1">Preview:</p>
                {formData.files?.type.includes("image") ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-h-40 rounded-lg border border-[#3a3a42]"
                  />
                ) : (
                  <div className="bg-[#2a2a32] p-3 rounded-lg border border-[#3a3a42]">
                    <p className="text-sm text-gray-300">PDF file selected</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#33eed5] to-[#2ac0a8] text-black font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? "Processing..." : "Deposit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DepositForm;
