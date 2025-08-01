import React, { useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DoneIcon from "@mui/icons-material/Done";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import WalletOutlinedIcon from "@mui/icons-material/WalletOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import profileLogo from "../../assets/BullLogo.png";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const ProfileCard = () => {
  const { user: userData, loading } = useAuth();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  if (!loading && !userData) {
    return <Navigate to="/login" replace />;
  }

  const handleCopy = () => {
    if (!userData?.code) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(userData.code)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          })
          .catch(() => {
            fallbackCopyText(userData.code);
          });
      } else {
        fallbackCopyText(userData.code);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const fallbackCopyText = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Fallback copy failed: ", err);
    }

    document.body.removeChild(textArea);
  };

  const isPremium = userData?.premium?.active || false;

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 flex-1 scroll-smooth overflow-y-auto">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );

  if (!userData)
    return (
      <div className="text-center py-8 bg-slate-900 rounded-lg border border-slate-700 text-red-400">
        Please login to view your profile
      </div>
    );

  const usdt = userData.wallet?.usdt || 0;
  const cw = userData.wallet?.cw || 0;
  const totalWallet = usdt + cw;
  const TotalAsset = totalWallet.toFixed(2);

  return (
    <div className="max-w-[600px] mx-auto px-8 py-4 mt-4">
      <div className="flex flex-col space-y-6">
        <div className="relative bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-teal-400/30 transition-colors duration-200 shadow-lg overflow-hidden">
          {/* Premium badge - top right corner */}
          {isPremium && (
            <div className="absolute -top-[1px] -right-[1px] rounded-bl-lg px-3 py-1 text-xs font-bold bg-gradient-to-r from-amber-500/70 to-amber-600 text-amber-900">
              <div className="flex items-center">
                <WorkspacePremiumOutlinedIcon className="!text-xs mr-1" />
                PREMIUM
              </div>
              <div className="absolute -bottom-[4px] -right-[1px] w-0 h-0 border-r-[4px] border-r-transparent border-t-amber-600 border-t-[4px]"></div>
            </div>
          )}

          <div className="flex items-start space-x-4 pt-1">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-800 to-teal-900 rounded-full border-2 border-gray-400 flex items-center justify-center">
                <img
                  src={userData.avatar || profileLogo}
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 max-w-[70%] truncate">
                  <h2 className="text-lg font-bold text-white truncate">
                    {userData.fullName || userData.email}
                  </h2>
                </div>
                {!isPremium && (
                  <span className="text-xs px-2 py-1 rounded-full flex-shrink-0 bg-teal-900/30 text-teal-300">
                    Standard
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {userData.email}
              </p>
              <div className="mt-4 flex items-center">
                <button
                  onClick={handleCopy}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full transition-colors ${
                    copied
                      ? "bg-teal-500/30 text-teal-300"
                      : "bg-slate-700 text-slate-300 hover:bg-teal-500/30 hover:text-teal-300"
                  }`}
                  disabled={!userData?.code}
                >
                  {copied ? (
                    <>
                      <DoneIcon className="!text-sm" />
                      <span className="text-xs">Copied!</span>
                    </>
                  ) : (
                    <>
                      <ContentCopyOutlinedIcon className="!text-sm" />
                      <span className="text-xs">Referral Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate("/Account")}
            className="mt-6 bg-slate-700 rounded-lg p-1 border border-slate-600 cursor-pointer hover:border-teal-400/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <WalletOutlinedIcon className="text-teal-300" />
                <span className="text-sm font-medium text-slate-300">
                  Wallet Balance
                </span>
              </div>
              <div className="flex items-end">
                <span className="text-lg font-bold text-teal-300">
                  {TotalAsset}
                  <ChevronRightIcon
                    className="text-teal-100 pl-2"
                    style={{ fontSize: "2rem" }}
                  />
                </span>
                <span className="text-[10px] p-1 text-white ml-1"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;