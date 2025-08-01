import React, { useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiArrowDown } from "react-icons/fi";
import { SiTether } from "react-icons/si";
import toast from "react-hot-toast";
import HeaderA from "../HeaderA";

const SwapForm = () => {
  const { axiosInstance } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    amount: "",
    securityPin: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    amount: "",
    securityPin: "",
  });

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

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      amount: "",
      securityPin: "",
    };

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
      isValid = false;
    }

    if (!formData.securityPin || !/^\d{4}$/.test(formData.securityPin)) {
      newErrors.securityPin = "Please enter a valid 4-digit PIN";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/api/transactions/swap",
        {
          amount: parseFloat(formData.amount),
          securityPin: formData.securityPin,
        },
        {
          withCredentials: true,
        }
      );

      toast.success(`Successfully swapped ${formData.amount} USDT to CW!`);
      navigate("/account");
    } catch (error) {
      console.error("Swap error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to complete swap. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full px-15 pt-2 max w-full bg-[#181b2c] min-h-screen">
      <HeaderA title="Account & Transaction" onBack={() => navigate(-1)} />
      <header className="py-8 flex flex-col items-start justify-center">
        <h1 className="text-xl font-bold text-white text-center mt-10">Swap</h1>
        <div className="w-20 h-[1.5px] rounded-full bg-gradient-to-r from-teal-600 to-teal-300 mt-2 mb-5" />
      </header>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-10 mb-6 hover:border-[#33eed5]/30 transition-colors">
        <div className="mb-6">
          <div className="bg-[#2a2a32] rounded-xl p-4 border border-[#3a3a42]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">From</span>
              <span className="text-xs text-gray-500">Balance: - USDT</span>
            </div>
            <div className="flex items-center">
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="bg-transparent text-white text-xl w-full focus:outline-none"
                placeholder="0.0"
                step="0.01"
                min="0"
                disabled={loading}
              />
              <div className="flex items-center bg-[#1a1a1a] px-3 py-1 rounded-lg">
                <SiTether className="text-[#33eed5] mr-2" />
                <span className="text-white">USDT</span>
              </div>
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          <div className="flex justify-center my-3">
            <div className="bg-[#33eed5] p-2 rounded-full">
              <FiArrowDown className="text-black" />
            </div>
          </div>

          <div className="bg-[#2a2a32] rounded-xl p-4 border border-[#3a3a42]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">To</span>
              <span className="text-xs text-gray-500">Balance: - CW</span>
            </div>
            <div className="flex items-center">
              <input
                type="text"
                value={formData.amount || "0.0"}
                readOnly
                className="bg-transparent text-gray-400 text-xl w-full"
              />
              <div className="flex items-center bg-[#1a1a1a] px-3 py-1 rounded-lg">
                <span className="text-white">CW</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Security PIN
          </label>
          <input
            type="password"
            name="securityPin"
            value={formData.securityPin}
            onChange={handleChange}
            className="w-full bg-[#2a2a32] border border-[#3a3a42] rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#33eed5]"
            placeholder="Enter your 4-digit PIN"
            maxLength="4"
            disabled={loading}
          />
          {errors.securityPin && (
            <p className="text-red-500 text-xs mt-1">{errors.securityPin}</p>
          )}
        </div>

        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || !formData.amount || !formData.securityPin}
          className="w-full bg-gradient-to-r from-[#33eed5] to-[#2ac0a8] text-black font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Swap"
          )}
        </button>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>1 USDT ≈ 1 CW</p>
          <p className="mt-1">Network fee: 0.5%</p>
        </div>
      </div>
    </div>
  );
};

export default SwapForm;
