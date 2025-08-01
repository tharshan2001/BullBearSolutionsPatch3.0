import React, { useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { SiTether } from "react-icons/si";
import toast from "react-hot-toast";
import HeaderA from "../HeaderA";

const TransferForm = () => {
  const { axiosInstance } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    receiverId: "",
    amount: "",
    currency: "usdt",
    securityPin: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    receiverId: "",
    amount: "",
    currency: "",
    securityPin: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      receiverId: "",
      amount: "",
      currency: "",
      securityPin: "",
    };

    if (!formData.receiverId.trim()) {
      newErrors.receiverId = "Referral code is required";
      isValid = false;
    } else if (formData.receiverId.length < 6) {
      newErrors.receiverId = "Invalid referral code";
      isValid = false;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
      isValid = false;
    }

    if (!["usdt", "cw"].includes(formData.currency)) {
      newErrors.currency = "Please select a valid currency";
      isValid = false;
    }

    if (!formData.securityPin || !/^\d{4}$/.test(formData.securityPin)) {
      newErrors.securityPin = "Please enter a valid 4-digit PIN";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const apiEndpoint = import.meta.env.VITE_API_BASE_URL
        ? `${import.meta.env.VITE_API_BASE_URL}/api/transactions/transfer`
        : "/api/transactions/transfer";

      const response = await axiosInstance.post(apiEndpoint, formData, {
        withCredentials: true,
      });

      toast.success("Transfer completed successfully!");
      navigate("/account");
    } catch (error) {
      console.error("Transfer error:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          "Failed to complete transfer";
        toast.error(errorMessage);

        if (error.response.data?.errors) {
          setErrors((prev) => ({
            ...prev,
            ...error.response.data.errors,
          }));
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full px-15 pt-2 max w-full bg-[#181b2c] min-h-screen">
      <HeaderA title="Account & Transaction" onBack={() => navigate(-1)} />
      <header className="py-8 flex flex-col items-start justify-center mt-10">
        <h1 className="text-xl font-bold text-white text-center">Transfer</h1>
        <div className="w-20 h-[1.5px] rounded-full bg-gradient-to-r from-teal-600 to-teal-300 mt-2 mb-5" />
      </header>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-10 mb-6 hover:border-[#33eed5]/30 transition-colors">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Receiver ID/Referral Code Field */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Receiver Referral Code
            </label>
            <input
              type="text"
              name="receiverId"
              value={formData.receiverId}
              onChange={handleChange}
              className={`w-full bg-[#2a2a32] border ${
                errors.receiverId ? "border-red-500" : "border-[#3a3a42]"
              } rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#33eed5]`}
              placeholder="Enter receiver's referral code"
              disabled={loading}
            />
            {errors.receiverId && (
              <p className="text-red-500 text-sm mt-1">{errors.receiverId}</p>
            )}
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Amount</label>
            <div className="relative">
              <input
                type="number"
                name="amount"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                className={`w-full bg-[#2a2a32] border ${
                  errors.amount ? "border-red-500" : "border-[#3a3a42]"
                } rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#33eed5]`}
                placeholder="0.00"
                disabled={loading}
              />
              {formData.currency === "usdt" && (
                <div className="absolute right-3 top-2 text-[#33eed5]">
                  <SiTether className="text-xl" />
                </div>
              )}
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Currency Dropdown */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className={`w-full bg-[#2a2a32] border ${
                errors.currency ? "border-red-500" : "border-[#3a3a42]"
              } rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#33eed5]`}
              disabled={loading}
            >
              <option value="usdt">USDT</option>
              <option value="cw">CW</option>
            </select>
            {errors.currency && (
              <p className="text-red-500 text-sm mt-1">{errors.currency}</p>
            )}
          </div>

          {/* Security PIN Field */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Security PIN
            </label>
            <input
              type="password"
              name="securityPin"
              value={formData.securityPin}
              onChange={handleChange}
              className={`w-full bg-[#2a2a32] border ${
                errors.securityPin ? "border-red-500" : "border-[#3a3a42]"
              } rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#33eed5]`}
              placeholder="Enter your 4-digit security PIN"
              maxLength="4"
              disabled={loading}
            />
            {errors.securityPin && (
              <p className="text-red-500 text-sm mt-1">{errors.securityPin}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#33eed5] to-[#2ac0a8] text-black font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? "Processing..." : "Transfer Funds"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferForm;
