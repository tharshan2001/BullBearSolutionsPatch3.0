import { useState } from "react";
import { Lock, Fingerprint } from "@mui/icons-material";
import ResetPasswordForm from "../components/secure/ResetPasswordForm";
import ResetPinForm from "../components/secure/ResetPinForm";
import { useNavigate } from "react-router-dom";
import HeaderA from "../components/HeaderA";

const PrivacyPage = () => {
  const [activeTab, setActiveTab] = useState("password");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#1f1f2f] via-[#191c2d] to-[#101015] p-4 ">
      <HeaderA title="Privacy & Security" onBack={() => navigate(-1)} />

      <div className="flex flex-col items-center mt-8 max-w-md mx-auto w-full mt-19">
        {/* Simplified tab selector */}
        <div className="flex w-full border-b border-[#2a2e42]">
          <button
            onClick={() => setActiveTab("password")}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "password" 
                ? "text-teal-600 border-b-2 border-teal-400" 
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Lock className="w-4 h-4" />
            Password
          </button>
          <button
            onClick={() => setActiveTab("pin")}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "pin" 
                ? "text-teal-400 border-b-2 border-teal-400" 
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            PIN
          </button>
        </div>

        {/* Content area */}
        <div className="w-full mt-6">
          {activeTab === "password" ? <ResetPasswordForm /> : <ResetPinForm />}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;