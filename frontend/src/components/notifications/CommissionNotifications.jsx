import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CommissionNotificationTemplate from "./CommissionNotificationTemplate";
import HeaderA from "../HeaderA";
import { useNavigate } from "react-router-dom";

export default function CommissionNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/commission-notifications`,
        {
          withCredentials: true,
          params: {
            limit: pagination.limit,
            page: pagination.page,
          },
          timeout: 5000,
        }
      );

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to fetch notifications");
      }

      const data = res.data.data || [];
      const { pagination: resPagination } = res.data;

      const processedNotifications = data.map((n) => ({
        id: n._id,
        type: n.type,
        title: `$${n.amount?.toFixed(2) || "0.00"}`,
        message:
          n.message || `You earned a ${n.type.replace(/_/g, " ")} commission`,
        createdAt: n.createdAt,
        metaData: n,
      }));

      setNotifications((prev) =>
        pagination.page === 1
          ? processedNotifications
          : [...prev, ...processedNotifications]
      );

      if (resPagination) {
        setPagination(resPagination);
      }
    } catch (error) {
      console.error("Error fetching commission notifications:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load commission history";

      setError(errorMessage);

      if (retryCount < 2) {
        const retryDelay = [2000, 5000][retryCount];
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          fetchNotifications();
        }, retryDelay);
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, retryCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRetry = () => {
    setRetryCount(0);
    fetchNotifications();
  };

  const loadMore = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center py-8" aria-live="polite">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
        </motion.div>
        <span className="ml-2 text-sm text-gray-600">
          Loading commission history...
        </span>
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <div
          className="text-red-500 p-4 bg-red-50 rounded-md mb-4"
          role="alert"
        >
          {error}
          <button
            onClick={handleRetry}
            className="ml-3 text-sm font-medium text-red-700 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Retry loading commission history"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-10 pt-15  bg-gradient-to-br from-[#1f1f2f] via-[#191c2d] to-[#101015] w-full min-h-screen ">
      <header className="py-4 flex flex-col items-start justify-center">
        <h1 className="text-1xl font-bold text-white text-center">
          Commission History
        </h1>
        <div className="w-20 h-[1.5px] rounded-full bg-gradient-to-r from-teal-600 to-teal-300 mt-2" />
      </header>
      <HeaderA title="Account & Transaction" onBack={() => navigate(-1)} />

      <div className="space-y-3">
        {error && (
          <div
            className="text-red-500 p-4 bg-red-50 rounded-md mb-4"
            role="alert"
          >
            {error} (showing cached data)
          </div>
        )}

        <AnimatePresence>
          {notifications.length > 0 ? (
            <>
              {notifications.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.2 }}
                  layout
                  whileHover={{ scale: 1.01 }}
                >
                  <CommissionNotificationTemplate
                    type={n.type}
                    title={n.title}
                    message={n.message}
                    date={formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  />
                </motion.div>
              ))}

              {pagination.page < pagination.totalPages && (
                <button
                  onClick={loadMore}
                  className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-8"
              aria-live="polite"
            >
              <div className="text-gray-500 dark:text-gray-400">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  No commission history yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Your commission earnings will appear here
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
