import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaCopy, FaTimes, FaPlus } from "react-icons/fa";

const NetworkAddressForm = ({ onClose, onSuccess }) => {
  const [selectedNetworks, setSelectedNetworks] = useState([]);
  const [formData, setFormData] = useState({
    TRC20: "",
    BEP20: "",
    ERC20: "",
    SOL: "",
    AVAX: "",
    MATIC: "",
    label: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const networkConfig = {
    TRC20: {
      label: "TRON (TRC20)",
      color: "bg-emerald-100 border-emerald-200 text-emerald-800"
    },
    BEP20: {
      label: "BSC (BEP20)",
      color: "bg-yellow-100 border-yellow-200 text-yellow-800"
    },
    ERC20: {
      label: "Ethereum (ERC20)",
      color: "bg-blue-100 border-blue-200 text-blue-800"
    },
    SOL: {
      label: "Solana",
      color: "bg-purple-100 border-purple-200 text-purple-800"
    },
    AVAX: {
      label: "Avalanche",
      color: "bg-red-100 border-red-200 text-red-800"
    },
    MATIC: {
      label: "Polygon",
      color: "bg-indigo-100 border-indigo-200 text-indigo-800"
    }
  };

  const availableNetworks = Object.keys(networkConfig)
    .filter(net => !selectedNetworks.includes(net));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const addNetwork = (e) => {
    const network = e.target.value;
    if (network && !selectedNetworks.includes(network)) {
      setSelectedNetworks((prev) => [...prev, network]);
      e.target.value = "";
    }
  };

  const removeNetwork = (network) => {
    setSelectedNetworks((prev) => prev.filter((net) => net !== network));
    setFormData((prev) => ({ ...prev, [network]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    const hasAddress = selectedNetworks.some((net) => formData[net].trim() !== "");
    if (!hasAddress) {
      newErrors.general = "Please enter at least one network address.";
    }

    if (!formData.label.trim()) {
      newErrors.label = "Label is required.";
    }

    selectedNetworks.forEach((net) => {
      if (formData[net].trim() === "") {
        newErrors[net] = `${networkConfig[net].label} address is required.`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading("Saving addresses...");

    try {
      const payload = { label: formData.label };
      selectedNetworks.forEach((net) => {
        if (formData[net].trim() !== "") payload[net] = formData[net].trim();
      });

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || ""}/api/addresses`,
        payload,
        { withCredentials: true }
      );

      toast.success("Network addresses saved!", { id: loadingToast });

      setFormData({
        TRC20: "",
        BEP20: "",
        ERC20: "",
        SOL: "",
        AVAX: "",
        MATIC: "",
        label: "",
      });
      setSelectedNetworks([]);

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to save network addresses";
      toast.error(msg, { id: loadingToast });
      setErrors((prev) => ({ ...prev, general: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        )}

        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <FaPlus className="mr-2 text-blue-600" />
          Add Network Addresses
        </h2>

        {errors.general && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-3 mb-4 rounded">
            <p>{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="label"
              value={formData.label}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-50 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.label ? "border-red-500" : "border-gray-300"
              } text-gray-700`}
              placeholder="e.g. Main Wallet"
              required
            />
            {errors.label && (
              <p className="text-red-500 text-xs mt-1">{errors.label}</p>
            )}
          </div>

          {/* Network Inputs */}
          {selectedNetworks.map((net) => (
            <div key={net} className="relative">
              <div className="flex items-center mb-1">
                <span className={`w-2 h-2 rounded-full ${networkConfig[net].color.split(' ')[0]} mr-2`}></span>
                <label className="text-sm font-medium text-gray-700">
                  {networkConfig[net].label} <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name={net}
                  value={formData[net]}
                  onChange={handleChange}
                  placeholder={`Enter ${networkConfig[net].label} address`}
                  className={`w-full px-3 py-2 bg-gray-50 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 ${
                    errors[net] ? "border-red-500" : "border-gray-300"
                  } pr-8`}
                />
                <button
                  type="button"
                  onClick={() => removeNetwork(net)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-red-500 transition-colors"
                  disabled={isSubmitting}
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
              {errors[net] && (
                <p className="text-red-500 text-xs mt-1">{errors[net]}</p>
              )}
            </div>
          ))}

          {/* Add Network Selector */}
          {availableNetworks.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                onChange={addNetwork}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                disabled={isSubmitting}
                defaultValue=""
              >
                <option value="">Select a network to add</option>
                {availableNetworks.map((net) => (
                  <option key={net} value={net}>
                    {networkConfig[net].label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const select = document.querySelector('select');
                  if (select.value) {
                    addNetwork({ target: { value: select.value } });
                    select.value = "";
                  }
                }}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-gray-700 flex items-center gap-1"
                disabled={isSubmitting}
              >
                <FaPlus className="w-3 h-3" />
                Add
              </button>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || selectedNetworks.length === 0}
              className={`w-full px-4 py-2 rounded-md text-white font-medium transition-colors ${
                isSubmitting || selectedNetworks.length === 0
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Addresses"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NetworkAddressForm;