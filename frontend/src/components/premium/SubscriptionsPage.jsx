import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import SubscriptionCard from "./SubscriptionCard";
import HeaderA from "../HeaderA";
import { useNavigate } from "react-router-dom"; 


const SubscriptionsPage = () => {

  const navigate = useNavigate();
  const { axiosInstance } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get("/api/subscriptions", {
          withCredentials: true,
        });

        if (res.data?.success) {
          setSubscriptions(res.data.subscriptions || []);
        } else {
          setError(res.data?.message || "No subscriptions found");
          setSubscriptions([]);
        }
      } catch (error) {
        console.error("Full error:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        setError(
          error.response?.data?.message || "Failed to load subscriptions"
        );
        setSubscriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [axiosInstance]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 bg-red-900/20 rounded-lg border border-red-700/50 text-red-400">
        <p>{error}</p>
        <p className="text-sm text-slate-400 mt-2">
          Status: {error.response?.status || "Unknown"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 w-full bg-[#181b2c] min-h-screen">
      <HeaderA title="Subscriptions" onBack={() => navigate(-1)} />

      <div className="realtive flex flex-col space-y-6 mt-10">
        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl font-bold text-white">Your Subscriptions</h1>
          <p className="text-sm text-slate-400">
            Manage your active memberships and services
          </p>
        </div>

        <div className="space-y-4">
          {subscriptions.length > 0 ? (
            subscriptions.map((sub) => (
              <SubscriptionCard key={sub._id} subscription={sub} />
            ))
          ) : (
            <div className="text-center py-8 bg-slate-900/50 rounded-lg border border-slate-700/50 text-slate-400">
              No active subscriptions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
