import React from "react";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";

const settingsItems = [
  {
    icon: <WorkspacePremiumOutlinedIcon style={{ color: "#B7CAD5", fontSize: "16px" }} />,
    label: "Premium Features",
    path: "/premium"
  },
  {
    icon: <LockOutlinedIcon style={{ color: "#B7CAD5", fontSize: "16px" }} />,
    label: "Privacy & Security",
    path: "/privacy"
  },
  {
    icon: <AccountBalanceOutlinedIcon style={{ color: "#B7CAD5", fontSize: "16px" }} />,
    label: "Account & Transactions",
    path: "/Account"
  },
];

const SettingsSection = () => {
  const navigate = useNavigate();

  const handleItemClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="mx-auto w-full px-10 max-w-[500px] md:max-w-[600px]">
      {/* Header - Updated to match ReferralSection */}
      <div className="mb-2">
        <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300 font-medium text-[13px]">
          Settings
        </h3>
        <div className="w-11 h-[1.2px] rounded-full bg-gradient-to-r from-teal-600 to-teal-300 mt-1" />
      </div>

      {/* Settings Items Container - Updated styles */}
      <div className="rounded-lg bg-slate-800/50 shadow-lg overflow-hidden border border-slate-700 hover:border-teal-400/30 transition-colors duration-200">
        {settingsItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between py-3 px-4 ${
              index < settingsItems.length - 1 ? "border-b border-slate-700/50" : ""
            } cursor-pointer hover:bg-gray-500/20 transition-all duration-200`}
            onClick={() => handleItemClick(item.path)}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <p className="text-white text-[12px]">{item.label}</p>
            </div>
            <ArrowForwardIosIcon style={{ color: "#B7CAD5", fontSize: "14px" }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsSection;