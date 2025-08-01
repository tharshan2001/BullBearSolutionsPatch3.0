import React, { useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { SiTether } from "react-icons/si";
import toast from "react-hot-toast";
import HeaderA from "../HeaderA";
import Notice from "./Notice";

const WithdrawalForm = () => {
  const { axiosInstance } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    network: "",
    networkAddress: "",
    securityPin: "",
    currency: "USDT",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || parseFloat(formData.amount) < 10) {
      newErrors.amount = "Minimum withdrawal amount is 10 USDT";
    }
    if (!formData.network || !["TRC20", "BEP20"].includes(formData.network)) {
      newErrors.network = "Please select a valid network";
    }
    if (!formData.networkAddress.trim()) {
      newErrors.networkAddress = "Network address is required";
    } else {
      if (
        formData.network === "TRC20" &&
        !/^T[a-zA-Z0-9]{33}$/.test(formData.networkAddress)
      ) {
        newErrors.networkAddress = "Invalid TRC20 address format";
      }
      if (
        formData.network === "BEP20" &&
        !/^0x[a-fA-F0-9]{40}$/.test(formData.networkAddress)
      ) {
        newErrors.networkAddress = "Invalid BEP20 address format";
      }
    }
    if (!formData.securityPin || !/^\d{4}$/.test(formData.securityPin)) {
      newErrors.securityPin = "Please enter a valid 4-digit security PIN";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const apiEndpoint = import.meta.env.VITE_API_BASE_URL
        ? `${import.meta.env.VITE_API_BASE_URL}/api/transactions/withdraw`
        : "/api/transactions/withdraw";

      const response = await axiosInstance.post(apiEndpoint, formData, {
        withCredentials: true,
      });

      toast.success("Withdrawal request submitted successfully!");
      navigate("/account");
    } catch (error) {
      console.error("Withdrawal error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to submit withdrawal";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full px-15 pt-2 max w-full bg-[#181b2c] min-h-screen">
      <Notice/>
      <HeaderA title="Account & Transaction" onBack={() => navigate(-1)} />
      <header className="py-8 flex flex-col items-start justify-center mt-10">
        <h1 className="text-xl font-bold text-white text-center">Withdraw</h1>
        <div className="w-20 h-[1.5px] rounded-full bg-gradient-to-r from-teal-600 to-teal-300 mt-2 mb-5" />
      </header>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-10 mb-6 hover:border-[#33eed5]/30 transition-colors">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount Field */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Amount (USDT)
            </label>
            <div className="relative">
              <input
                type="number"
                name="amount"
                min="10"
                step="0.01"
                className="w-full bg-[#2a2a32] border border-[#3a3a42] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#33eed5] disabled:opacity-50"
                value={formData.amount}
                onChange={handleChange}
                disabled={loading}
              />
              <div className="absolute right-3 top-2 text-[#33eed5]">
                <SiTether className="text-xl" />
              </div>
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Network Field */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Network</label>
            <select
              name="network"
              className="w-full bg-[#2a2a32] border border-[#3a3a42] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#33eed5] disabled:opacity-50"
              value={formData.network}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select network</option>
              <option value="TRC20">TRC20</option>
              <option value="BEP20">BEP20</option>
            </select>
            {errors.network && (
              <p className="text-red-500 text-sm mt-1">{errors.network}</p>
            )}
          </div>

          {/* Network Address Field */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Network Address
            </label>
            <input
              type="text"
              name="networkAddress"
              className="w-full bg-[#2a2a32] border border-[#3a3a42] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#33eed5] disabled:opacity-50"
              value={formData.networkAddress}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.networkAddress && (
              <p className="text-red-500 text-sm mt-1">
                {errors.networkAddress}
              </p>
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
              className="w-full bg-[#2a2a32] border border-[#3a3a42] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#33eed5] disabled:opacity-50"
              value={formData.securityPin}
              onChange={handleChange}
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
            className="w-full bg-gradient-to-r from-[#33eed5] to-[#2ac0a8] text-black font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? "Processing..." : "Withdraw"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawalForm;
