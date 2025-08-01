import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";
import {
  WorkspacePremiumOutlined,
  EventOutlined,
  Autorenew,
  DiamondOutlined,
  StarBorderPurple500Outlined,
  CheckCircleOutline,
} from "@mui/icons-material";
import { CircularProgress, Alert } from "@mui/material";
import axios from "axios";
import Verified from '@mui/icons-material/Verified';

const PremiumCard = () => {
  const { user: authUser } = useAuth();
  const [premiumData, setPremiumData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  useEffect(() => {
    const fetchPremiumDetails = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/auth/profile");
        setPremiumData(data);
        if (!data.premium?.active) {
          setError("No active premium subscription");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch premium details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (authUser) fetchPremiumDetails();
  }, [authUser]);

  const premiumFeatures = [
    "Unlimited access to all courses",
    "Exclusive premium content",
    "Downloadable resources",
    "Priority customer support",
    "Ad-free experience",
    "Early access to new features"
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <CircularProgress size={24} style={{ color: "#14b8a6" }} />
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  };

  const daysRemaining = () => {
    if (!premiumData?.premium?.expiryDate) return null;
    const expiry = new Date(premiumData.premium.expiryDate);
    const today = new Date();
    const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff} day${diff !== 1 ? 's' : ''} left` : 'Expires today';
  };

  // Non-premium user UI
  if (error && error.includes("No active premium")) {
    return (
      <div className="max-w-md mx-auto">
        <div className="border border-slate-700 rounded-xl p-6 bg-slate-800/40 text-white">
          <div className="text-center mb-6">
            <DiamondOutlined className="text-teal-400" style={{ fontSize: '3rem' }} />
            <h3 className="text-xl font-bold mt-2 text-teal-400">Premium Membership</h3>
            <p className="text-slate-400 mt-1">Unlock exclusive features and content</p>
          </div>

          <div className="space-y-3 mb-6">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-start">
                <CheckCircleOutline className="text-teal-400 mr-2 mt-0.5" fontSize="small" />
                <span className="text-slate-200">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-700/50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Monthly Plan</span>
              <span className="font-bold text-teal-400">$9.99/month</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Yearly Plan (Save 20%)</span>
              <span className="font-bold text-amber-400">$95.88/year</span>
            </div>
          </div>

          <button 
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-3 rounded-lg font-bold transition-colors duration-200 flex items-center justify-center"
            onClick={() => window.location.href = `${import.meta.env.VITE_FRONTEND_URL}/upgrade`}
          >
            <StarBorderPurple500Outlined className="mr-2" />
            Upgrade to Premium
          </button>

          {premiumData?.premium?.expired && (
            <div className="mt-4 text-center text-sm text-slate-400">
              Your premium membership expired on {formatDate(premiumData.premium.expiryDate)}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-4">
        <Alert severity="error" className="bg-rose-900/50 text-rose-100 border border-rose-800 rounded-lg">
          {error}
        </Alert>
      </div>
    );
  }

  // Premium user UI
  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg overflow-hidden min-h-60 text-white p-6 border border-slate-700 group hover:border-teal-400/30 transition-colors duration-200">
        {/* Card holographic strip */}
        <div className="absolute top-4 left-0 w-full h-8 bg-gradient-to-r from-transparent via-teal-400/30 to-transparent opacity-30"></div>
        
        {/* Premium badge */}
        <div className="absolute top-6 right-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center">
          <Verified fontSize="small" className="mr-1" />
          PREMIUM
        </div>
        
        {/* Card content */}
        <div className="mt-16">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-xs text-slate-400">TIER</div>
              <div className="text-sm font-medium flex items-center text-teal-400">
                <WorkspacePremiumOutlined className="mr-1" fontSize="small" />
                LEVEL {premiumData.level}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">MEMBER SINCE</div>
              <div className="text-sm font-medium text-slate-200">
                {new Date(premiumData.premium.activatedDate).getFullYear()}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">EXPIRES</div>
              <div className="text-sm font-medium text-amber-400">
                {formatDate(premiumData.premium.expiryDate)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">STATUS</div>
              <div className="text-sm font-medium text-teal-400 flex items-center">
                <Autorenew fontSize="small" className="mr-1" />
                {daysRemaining()}
              </div>
            </div>
          </div>
        </div>
        
        {/* Card footer */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
          <div className="text-xs text-slate-400">
            {premiumData.premium.autoRenew ? 
              "Auto-renewal enabled" : "Manual renewal required"}
          </div>
          
          <div className="flex space-x-2 opacity-70">
            <div className="w-8 h-6 bg-teal-400/20 rounded-sm"></div>
            <div className="w-8 h-6 bg-slate-400/20 rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumCard;