import { useNavigate } from "react-router-dom";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const referralItems = [
  {
    icon: <PersonAddOutlinedIcon style={{ color: "#B7CAD5", fontSize: "16px" }} />, // Increased from 13px
    label: "Refer a Friend",
    path: "/refer-friend"
  },
  {
    icon: <GroupOutlinedIcon style={{ color: "#B7CAD5", fontSize: "16px" }} />, // Increased from 13px
    label: "My Team",
    path: "/myteam"
  },
];

const ReferralSection = () => {
  const navigate = useNavigate();

  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <div className="mx-auto my-5 w-full px-10 max-w-[500px] md:max-w-[600px]">
      {/* Header */}
      <div className="mb-2">
        <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300 font-medium text-[13px]">
          Referral Program
        </h3>
        <div className="w-11 h-[1.2px] rounded-full bg-gradient-to-r from-teal-600 to-teal-300 mt-1" />
      </div>

      {/* Items Container */}
      <div className="rounded-lg bg-slate-800/50 shadow-lg overflow-hidden border border-slate-700 hover:border-teal-400/30 transition-colors duration-200">
        {referralItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between py-3 px-4 ${
              index < referralItems.length - 1 ? "border-b border-slate-700/50" : ""
            } cursor-pointer hover:bg-gray-500/20 transition-all duration-200`}
            onClick={() => handleItemClick(item.path)}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <p className="text-white text-[12px]">{item.label}</p>
            </div>
            <ArrowForwardIosIcon style={{ color: "#B7CAD5", fontSize: "14px" }} /> {/* Increased from 10px */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferralSection;