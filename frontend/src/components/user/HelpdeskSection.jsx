import React from "react";
import { useNavigate } from "react-router-dom";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const helpdeskItems = [
  {
    icon: <HelpOutlineOutlinedIcon style={{ color: "#B7CAD5", fontSize: "16px" }} />,
    label: "Help Center",
    path: "/help-center"
  },
  {
    icon: <LibraryBooksOutlinedIcon style={{ color: "#B7CAD5", fontSize: "16px" }} />,
    label: "Resource List",
    path: "/resources"
  },
];

const HelpdeskSection = () => {
  const navigate = useNavigate();

  const handleItemClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="mx-auto my-5 w-full px-10 max-w-[500px] md:max-w-[600px]">
      {/* Header - Matching SettingsSection */}
      <div className="mb-2">
        <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300 font-medium text-[13px]">
          Help Desk
        </h3>
        <div className="w-11 h-[1.2px] rounded-full bg-gradient-to-r from-teal-600 to-teal-300 mt-1" />
      </div>

      {/* Helpdesk Items Container - Matching SettingsSection */}
      <div className="rounded-lg bg-slate-800/50 shadow-lg overflow-hidden border border-slate-700 hover:border-teal-400/30 transition-colors duration-200">
        {helpdeskItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between py-3 px-4 ${
              index < helpdeskItems.length - 1 ? "border-b border-slate-700/50" : ""
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

export default HelpdeskSection;