import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthProvider";
import { toast } from "react-hot-toast";
import Ticon from "../../assets/T_text.png";
import PremiumCard from "./PremiumCard";
import { useNavigate } from "react-router-dom";

const UpgradePremium = () => {
  const {
    axiosInstance,
    user: userData,
    refreshUser,
    loading: authLoading,
  } = useAuth();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [securityPin, setSecurityPin] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("usdt");
  const [showGlow, setShowGlow] = useState(false);
  const [error, setError] = useState(null);
  const paymentSectionRef = useRef(null);
  const navigate = useNavigate();

  // Wait for user data to load first
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 rounded-full bg-teal-500/20 animate-bounce mb-2"></div>
          <span className="text-teal-400 text-sm">Loading user info...</span>
        </div>
      </div>
    );
  }

  const isPremium = Boolean(userData?.premium?.active);
  const premiumExpiry = userData?.premiumExpiry;

  const usdt = userData?.wallet?.usdt || 0;
  const cw = userData?.wallet?.cw || 0;
  const wallets = [
    { id: "usdt", name: "USDT Wallet", balance: usdt },
    { id: "cw", name: "CW Wallet", balance: cw },
  ];

  const WalletIcons = {
    usdt: <img src={Ticon} alt="USDT" className="w-5 h-5" />,
    cw: (
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#6F4CFF" />
        <path
          d="M16 6C10.4772 6 6 10.4772 6 16C6 21.5228 10.4772 26 16 26C21.5228 26 26 21.5228 26 16C26 10.4772 21.5228 6 16 6ZM16 24C11.5817 24 8 20.4183 8 16C8 11.5817 11.5817 8 16 8C20.4183 8 24 11.5817 24 16C24 20.4183 20.4183 24 16 24Z"
          fill="white"
        />
        <path
          d="M16 10C12.6863 10 10 12.6863 10 16C10 19.3137 12.6863 22 16 22C19.3137 22 22 19.3137 22 16C22 12.6863 19.3137 10 16 10ZM16 20C13.7909 20 12 18.2091 12 16C12 13.7909 13.7909 12 16 12C18.2091 12 20 13.7909 20 16C20 18.2091 18.2091 20 16 20Z"
          fill="white"
        />
        <circle cx="16" cy="16" r="4" fill="white" />
      </svg>
    ),
  };

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axiosInstance.get("/api/premium/plans/last");
        if (data.success) {
          setPlan(data.data);
        } else {
          setError(data.message || "Failed to load premium plan");
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to load premium plan";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (!isPremium) {
      fetchPlan();
    } else {
      setLoading(false);
    }
  }, [axiosInstance, isPremium]);

  const handleWalletChange = (e) => {
    setSelectedWallet(e.target.value);
    setError(null);
  };

  const handleUpgrade = async () => {
    if (!securityPin) {
      paymentSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setShowGlow(true);
      setTimeout(() => setShowGlow(false), 2000);
      setError("Please enter your security PIN");
      return;
    }

    try {
      setError(null);
      setUpgradeLoading(true);
      const upgradePromise = axiosInstance.post("/api/auth/upgrade-premium", {
        planId: plan._id,
        walletMethod: selectedWallet,
        securityPin,
      });

      toast.promise(upgradePromise, {
        loading: "Processing premium upgrade...",
        success: (res) => {
          if (res.data.success) {
            if (typeof refreshUser === "function") refreshUser();
            // Delay the redirect slightly to let toast render
            setTimeout(() => {
              window.location.href = "/";
            }, 1500); // Adjust timing as needed (1.5 sec)
            return res.data.message || "Premium upgraded successfully!";
          }
          return "Premium upgrade processed";
        },
        error: (err) => {
          const errorMsg =
            err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to upgrade premium";
          setError(errorMsg);
          return errorMsg;
        },
      });

      await upgradePromise;
    } catch (err) {
      console.error("Upgrade failed:", err);
    } finally {
      setUpgradeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 rounded-full bg-teal-500/20 animate-bounce mb-2"></div>
          <span className="text-teal-400 text-sm">
            Loading premium plans...
          </span>
        </div>
      </div>
    );
  }

  if (isPremium) {
    return <PremiumCard user={userData} expiryDate={premiumExpiry} />;
  }

  if (error && !plan) {
    return (
      <div className="flex items-center justify-center min-h-[300px] bg-gray-900">
        <div className="text-center p-6 max-w-md w-full bg-gray-800 rounded-xl border border-red-500/30 shadow-lg">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-red-400 text-lg font-semibold mb-2">
            Error Loading Plan
          </h3>
          <p className="text-gray-300 mb-5 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const price = plan?.prices?.yearly || 0;

  return (
    <div className="bg min-h-screen py-8 px-4 sm:px-6 w-full max-w-xl mx-auto">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Upgrade to Premium
          </h1>
          <p className="text-gray-400">
            Unlock exclusive features and benefits
          </p>
        </div>

        <div className="flex flex-col gap-6 p-10">
          {/* Plan Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-teal-500/30 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              POPULAR
            </div>
            <div className="flex flex-col h-full">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {plan.name}
                </h2>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-white font-bold text-3xl flex items-center">
                    <img src={Ticon} alt="T" className="w-6 h-6 mr-1" />
                    {price.toLocaleString()}
                  </span>
                  <span className="text-gray-400 text-sm">USDT</span>
                </div>
                <span className="text-gray-500 text-xs">Billed annually</span>
              </div>

              <div className="mt-auto">
                <h3 className="text-white font-semibold text-base mb-3">
                  Plan Features:
                </h3>
                <ul className="space-y-3">
                  {plan.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-teal-500/10 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <svg
                          className="w-3 h-3 text-teal-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-gray-800 rounded-xl p-6 border border-purple-500/30 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-5">
              Payment Details
            </h2>
            <div ref={paymentSectionRef} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm flex items-start">
                  <svg
                    className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-gray-300 font-medium mb-2 text-sm">
                  Select Payment Method
                </label>
                <div className="space-y-3">
                  {wallets.map((wallet) => (
                    <label
                      key={wallet.id}
                      htmlFor={`wallet-${wallet.id}`}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedWallet === wallet.id
                          ? "bg-gray-700/50"
                          : "bg-gray-700/30 hover:bg-gray-700/40"
                      }`}
                    >
                      <input
                        id={`wallet-${wallet.id}`}
                        name="wallet"
                        type="radio"
                        value={wallet.id}
                        checked={selectedWallet === wallet.id}
                        onChange={handleWalletChange}
                        className="h-4 w-4 border-gray-600 focus:ring-teal-500 text-teal-600"
                      />
                      <div className="ml-3 flex items-center">
                        <span className="mr-2">{WalletIcons[wallet.id]}</span>
                        <div>
                          <div className="text-gray-200 text-sm">
                            {wallet.name}
                          </div>
                          <div className="text-gray-400 text-xs">
                            Balance: {wallet.balance.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="securityPin"
                  className="block text-gray-300 font-medium mb-2 text-sm"
                >
                  Security PIN
                </label>
                <input
                  type="password"
                  id="securityPin"
                  maxLength={4}
                  placeholder="Enter your 4-digit PIN"
                  value={securityPin}
                  onChange={(e) => {
                    setSecurityPin(e.target.value);
                    setError(null);
                  }}
                  className={`w-full bg-gray-700/50 border ${
                    showGlow
                      ? "border-red-500 animate-pulse"
                      : "border-gray-600"
                  } rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm transition-all`}
                />
              </div>

              <button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                className={`w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 ${
                  showGlow ? "animate-pulse ring-2 ring-teal-400/50" : ""
                } ${
                  upgradeLoading
                    ? "opacity-80 cursor-not-allowed"
                    : "hover:shadow-lg hover:shadow-teal-500/20"
                } text-sm flex items-center justify-center`}
              >
                {upgradeLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  </>
                ) : (
                  "Upgrade to Premium"
                )}
              </button>

              <div className="text-center text-gray-500 text-xs mt-2">
                By upgrading, you agree to our Terms and Privacy Policy
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePremium;
