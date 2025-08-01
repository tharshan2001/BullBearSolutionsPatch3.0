import React from "react";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";

const HeaderA = ({ title = "", onBack }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-[40px] bg-gray-900/20 backdrop-blur-lg flex items-center justify-center border-b border-gray-700/30">
      {/* Liquid glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 via-blue-500/5 to-purple-500/10 opacity-50"></div>
      
      {/* Container with max-width for desktop */}
      <div className="relative max-w-[600px] w-full mx-auto h-full flex items-center justify-center">
        {/* Back button */}
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute left-0 ml-2 p-1 text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
          >
            <ArrowBackIosNewOutlinedIcon className="w-2 h-1" />
          </button>
        )}
        
        {/* Centered title */}
        <h2 className="font-medium text-teal-400 text-center text-[17px] tracking-tight px-4">
          {title}
        </h2>
      </div>
    </div>
  );
};

export default HeaderA;