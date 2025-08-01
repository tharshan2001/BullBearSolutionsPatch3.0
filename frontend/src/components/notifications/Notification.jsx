import { useState, useEffect } from "react";
import axios from "axios";
import { NotificationTemplate } from "./NotificationTemplate";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import HeaderA from "../HeaderA";
import { useNavigate } from "react-router-dom"; 


export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/notification`,
        {
          withCredentials: true,
        }
      );

      const data = res.data;

      const allowedTypes = [
        "info",
        "success",
        "warning",
        "error",
        "transaction",
        "referral",
        "subscribe",
      ];

      const filteredNotifications = data
        .filter((n) => allowedTypes.includes(n.type))
        .map((n) => ({
          id: n._id,
          type: n.type,
          message: n.message,
          createdAt: n.createdAt,
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setNotifications(filteredNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleClose = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
        </motion.div>
        <span className="ml-2 text-sm text-gray-600">
          Loading notifications...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-10 pt-15 bg-gradient-to-br from-[#1f1f2f] via-[#191c2d] to-[#101015] w-full min-h-screen">
        <HeaderA title="Notification" onBack={() => navigate(-1)} />
      <header className="py-4 flex flex-col items-start justify-center">
        <h1 className="text-1xl font-bold text-white text-center">
          Notification
        </h1>
        <div className="w-20 h-[1.5px] rounded-full bg-gradient-to-r from-teal-600 to-teal-300 mt-2" />
      </header>

      <div className="space-y-3">
        <AnimatePresence>
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <NotificationTemplate
                  type={n.type}
                  title={n.title}
                  message={n.message}
                  date={new Date(n.createdAt).toLocaleDateString()}
                  onClose={() => handleClose(n.id)}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-8"
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
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  No notifications
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You're all caught up!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}