import React from "react";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useNavigate } from "react-router-dom";

const HeaderB = ({ title = "" }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-[40px] bg-gray-900/20 backdrop-blur-lg flex items-center justify-center border-b border-gray-700/30">
      {/* Liquid glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 via-blue-500/5 to-purple-500/10 opacity-50"></div>
      
      {/* Container with max-width for desktop */}
      <div className="relative max-w-[600px] w-full mx-auto h-full flex items-center justify-center">
        {/* Centered title */}
        <h2 className="font-medium text-teal-400 text-center text-[17px] tracking-tight px-4">
          {title}
        </h2>

        {/* Notification bell icon on the right */}
        <button 
          onClick={() => navigate("/notification")}
          className="absolute right-5 mr-2 p-1 text-teal-400 hover:text-teal-300 transition-colors rounded-full hover:bg-teal-400/10 cursor-pointer"
        >
          <NotificationsActiveIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default HeaderB;