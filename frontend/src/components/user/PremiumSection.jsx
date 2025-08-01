import React from "react";
import { useNavigate } from "react-router-dom";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const premiumItems = [
  {
    icon: <WorkspacePremiumOutlinedIcon className="text-[13px]" />,
    label: "Premium Features",
    path: "/premium-features"
  },
  {
    icon: <StarOutlineIcon className="text-[13px]" />,
    label: "Exclusive Content",
    path: "/exclusive-content"
  }
];

const PremiumSection = () => {
  const navigate = useNavigate();

  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <div className="mx-auto my-5 w-full px-10 max-w-[500px] md:max-w-[600px]">
      {/* Header - Identical to ReferralSection */}
      <div className="mb-2">
        <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ab6a7] to-[#33eed5] font-medium text-[13px]">
          Premium 
        </h3>
        <div className="w-11 h-[1.2px] rounded-full bg-gradient-to-r from-[#359387] to-[#33eed5] mt-1" />
      </div>

      {/* Items Container - Exact same styling */}
      <div className="rounded-xl bg-gradient-to-r from-[#44444c]/50 to-[#28272d]/50 shadow-lg overflow-hidden">
        {premiumItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between py-2 px-4 ${
              index < premiumItems.length - 1 ? "border-b border-white/10" : ""
            } cursor-pointer hover:bg-white/5 transition-all duration-200 hover:rounded-lg`}
            onClick={() => handleItemClick(item.path)}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <p className="text-white text-[12px]">{item.label}</p>
            </div>
            <ArrowForwardIosIcon className="text-white !text-[10px]" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumSection;