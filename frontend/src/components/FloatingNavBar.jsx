import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import logo from "../assets/mybear.PNG";

const FloatingNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path.startsWith("/products")) return "products";
    if (path.startsWith("/announcements")) return "announcements";
    if (path.startsWith("/profile")) return "profile";
    return "home";
  };

  const activeTab = getActiveTab();

  const handleNavigation = (path) => {
    navigate(path);
    setTimeout(() => window.scrollTo(0, 0), 100);
  };

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[480px] md:max-w-[580px] z-50 pointer-events-none">
      <div className="relative h-26 md:h-90">
        {/* Navigation Bar */}
        <div className="absolute bottom-0 w-full h-17 md:h-18 bg-gray-900/95 backdrop-blur-md rounded-t-[9px] flex items-center justify-around px-6 md:px-8 shadow-lg border border-gray-700/50 pointer-events-auto">
          <NavIcon
            icon={<HomeOutlinedIcon />}
            label="Home"
            active={activeTab === "home"}
            onClick={() => handleNavigation("/")}
          />
          <NavIcon
            icon={<RocketLaunchIcon />}
            label="Modules"
            active={activeTab === "products"}
            onClick={() => handleNavigation("/products")}
          />

          <div className="w-16 md:w-20" />

          <NavIcon
            icon={<CampaignOutlinedIcon />}
            label="Updates"
            active={activeTab === "announcements"}
            onClick={() => handleNavigation("/announcements")}
          />
          <NavIcon
            icon={<PersonOutlineOutlinedIcon />}
            label="Profile"
            active={activeTab === "profile"}
            onClick={() => handleNavigation("/profile")}
          />
        </div>

        {/* Central Logo */}
        <div className="absolute left-1/2 bottom-2 transform -translate-x-1/2 z-10 transition-transform hover:scale-100 active:scale-95 pointer-events-auto cursor-pointer">
          <div className="relative">
            {/* Reduced glow effect - changed blur-md to blur-sm and adjusted size */}
            <div className="absolute inset-0.5 bg-teal-400/70 rounded-full blur-sm animate-pulse-slow -z-10" />
            <img
              src={logo}
              alt="App Logo"
              className="relative w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-lg hover:scale-105 transition-transform duration-300 z-10"
              onClick={() => handleNavigation("/subscriptions")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const NavIcon = ({ icon, label, active = false, onClick }) => {
  return (
    <div className="flex flex-col items-center justify-center pointer-events-auto cursor-pointer">
      <button
        onClick={onClick}
        className={`p-2 rounded-full transition-all duration-300 cursor-pointer ${
          active
            ? "text-teal-400 bg-teal-400/10 shadow-inner shadow-teal-400/20"
            : "text-gray-400 hover:text-teal-300 hover:bg-teal-400/5"
        }`}
      >
        {React.cloneElement(icon, {
          sx: {
            fontSize: "1.5rem",
            transition: "transform 0.3s ease",
            transform: active ? "scale(1.1)" : "scale(1)",
          },
        })}
      </button>
      <span
        className={`text-xs mt-1 transition-all duration-300 cursor-pointer ${
          active ? "text-teal-400 font-medium" : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

export default FloatingNavBar;