import React, { useState } from "react";
import { LogoutOutlined } from "@mui/icons-material";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const LogoutSection = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      message.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      message.error("Failed to logout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full px-10 max-w-[500px] md:max-w-[600px] mt-10">
      {/* Logout Container */}
      <div className="rounded-lg bg-slate-800/50 shadow-sm overflow-hidden border border-slate-700 hover:border-teal-400/30 transition-colors duration-200">
        <button
          onClick={handleLogout}
          disabled={loading}
          className={`w-full flex items-center justify-between py-2 px-3 hover:bg-gray-500/20 transition-all duration-150 ${
            loading ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <div className="flex items-center space-x-2">
            <LogoutOutlined className="text-xs text-red-400" />
            <p className="text-white text-xs">
              {loading ? "Logging out..." : "Logout"}
            </p>
          </div>
          {!loading && (
            <ArrowForwardIosIcon className="text-slate-300 !text-[9px]" />
          )}
        </button>
      </div>
    </div>
  );
};

export default LogoutSection;