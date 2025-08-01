import React, { useState, useEffect } from "react";
import {
  FiEye,
  FiChevronRight,
  FiMoreVertical,
  FiDownload,
  FiUpload,
  FiRepeat,
  FiRefreshCw,
} from "react-icons/fi";
import { SiTether } from "react-icons/si";
import Tooltip from "@mui/material/Tooltip";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import HeaderA from "../HeaderA";

const Account = () => {
  const { axiosInstance } = useAuth();
  const [hiddenBalance, setHiddenBalance] = useState(false);
  const [walletData, setWalletData] = useState({
    usdt: 0,
    cw: 0,
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch wallet data
  const fetchWallet = async () => {
    try {
      const res = await axiosInstance.get("/api/auth/wallet");
      setWalletData(res.data);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const toggleBalanceVisibility = () => {
    setHiddenBalance(!hiddenBalance);
  };

  const formatBalance = (amount) => amount?.toFixed(4) ?? "0.0000";
  const formatUsd = (amount) => `$${amount?.toFixed(2)}`;

  const wallets = [
    {
      id: 1,
      name: "USDT Wallet",
      icon: <SiTether className="text-[#26a17a] text-xl" />,
      balance: formatBalance(walletData.usdt),
      currency: "USDT",
      value: formatUsd(walletData.usdt),
    },
    {
      id: 2,
      name: "CW Wallet",
      icon: <div className="text-[#33eed5] text-xl font-bold">CW</div>,
      balance: formatBalance(walletData.cw),
      currency: "CW",
      value: formatUsd(walletData.cw),
    },
  ];

  const totalValue = walletData.usdt + walletData.cw;

  const handleActionClick = (actionName) => {
    switch (actionName) {
      case "Deposit":
        navigate("./deposit");
        break;
      case "Withdraw":
        navigate("./withdraw");
        break;
      case "Transfer":
        navigate("./transfer");
        break;
      case "Swap":
        navigate("./swap");
        break;
      default:
        break;
    }
  };

  const actions = [
    { id: 1, name: "Deposit", icon: <FiDownload className="text-white" /> },
    { id: 2, name: "Withdraw", icon: <FiUpload className="text-white" /> },
    { id: 3, name: "Transfer", icon: <FiRepeat className="text-white" /> },
    { id: 4, name: "Swap", icon: <FiRefreshCw className="text-white" /> },
  ];

  return (
    <div className="mx-auto w-full px-4 max-w-[500px] mt-1">
      {/* Header */}
      <header className="py-8 flex flex-col items-start justify-center mt-5">
        <h1 className="text-1xl font-bold text-white text-center">Account</h1>
        <div className="w-20 h-[1.5px] rounded-full bg-gradient-to-r from-teal-600 to-teal-300 mt-2 mb-5" />
      </header>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-[#33eed5]/10 to-[#2ac0a8]/10 rounded-lg border border-[#33eed5]/20 p-4 mb-6 hover:border-[#33eed5]/30 transition-colors">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-white">Total Balance</span>
            <Tooltip
              title={hiddenBalance ? "Show balance" : "Hide balance"}
              arrow
            >
              <button onClick={toggleBalanceVisibility}>
                <FiEye
                  className={hiddenBalance ? "text-gray-400" : "text-[#33eed5]"}
                />
              </button>
            </Tooltip>
          </div>
          <div className="flex items-center">
            <span className="text-white">
              {hiddenBalance ? "••••••" : formatUsd(totalValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-4 hover:border-teal-400/30 transition-colors duration-200 cursor-pointer mb-15">
        <div className="flex flex-wrap justify-around gap-y-4">
          {actions.map((action) => (
            <Tooltip key={action.id} title={action.name} arrow>
              <button
                className="flex flex-col items-center group px-2"
                onClick={() => handleActionClick(action.name)}
              >
                <div className="w-12 h-12 rounded-full bg-[#33eed5]/20 flex items-center justify-center mb-2 border border-[#33eed5]/30 group-hover:bg-[#33eed5]/30 group-hover:border-[#33eed5]/50 transition-all">
                  {action.icon}
                </div>
                <span className="text-sm text-white group-hover:text-[#33eed5] transition-colors">
                  {action.name}
                </span>
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Wallets Section */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-white mb-4">Wallets</h2>
        <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-4 sm:space-y-0">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="px-10 p-2 relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700  hover:border-teal-400/30 transition-colors duration-200 cursor-pointer duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#33eed5]/10 flex items-center justify-center border border-[#33eed5]/20">
                    {wallet.icon}
                  </div>
                  <div>
                    <div className="font-medium text-white">{wallet.name}</div>
                    <div className="text-xs text-[#a0a0a8]">
                      {wallet.currency}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xl text-white">
                  {hiddenBalance ? "•••••••" : wallet.balance}
                </div>
                <div className="text-xs text-[#a0a0a8]">
                  ≈ {hiddenBalance ? "•*****•" : wallet.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Account;
