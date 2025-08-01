import { useState, useEffect } from "react";
import {
  FaUsers,
  FaChartLine,
  FaShoppingBag,
  FaCogs,
  FaWallet,
  FaChevronLeft,
  FaChevronRight,
  FaCubes,
  FaBroadcastTower,
  FaRegNewspaper,
  FaPercentage,
  FaBoxOpen,
  FaDatabase,
  FaQuestionCircle,
  FaUserCircle
} from "react-icons/fa";
import { MdWorkspacePremium } from "react-icons/md";
import { useAdminAuth } from "../context/AdminAuthContext";

const AdminPanel = () => {
  const { admin, logout } = useAdminAuth();

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("admin-sidebar-state");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [activeUrl, setActiveUrl] = useState(() => {
    const saved = localStorage.getItem("admin-active-route");
    return saved !== null ? saved : "/admin/dashboard";
  });

  const [isLoading, setIsLoading] = useState(true);

  const navItems = [
    {
      id: "User",
      title: "UserManagement",
      url: "/admin/user",
      icon: <FaUsers />,          // Users icon for user management
    },
    {
      id: "dashboard",
      title: "Transaction",
      url: "/admin/transaction",
      icon: <FaChartLine />,      // ChartLine for transaction/analytics
    },
    {
      id: "products",
      title: "Products",
      url: "/admin/products",
      icon: <FaBoxOpen />,        // BoxOpen for products
    },
    {
      id: "config",
      title: "Commission",
      url: "/admin/config",
      icon: <FaPercentage />,     // Percentage icon fits commission
    },
    {
      id: "subscriptions",
      title: "Subscription",
      url: "/admin/subscription",
      icon: <FaCubes />,          // Cubes for subscriptions (packages)
    },
    {
      id: "announcements",
      title: "Announcements",
      url: "/admin/announcement",
      icon: <FaRegNewspaper />,   // Newspaper for announcements/news
    },
    {
      id: "premiumPlans",
      title: "Premium Plans",
      url: "/admin/planTable",
      icon: <MdWorkspacePremium />,  // Premium plan icon (material)
    },
    {
      id: "wallet",
      title: "Wallet",
      url: "/admin/wallet",
      icon: <FaWallet />,         // Wallet for wallet
    },
    {
      id: "Resource",
      title: "Resource",
      url: "/admin/resource",
      icon: <FaDatabase />,       // Database icon for resource
    },
    {
      id: "HelpCenter",
      title: "Help Center",
      url: "/admin/message",
      icon: <FaQuestionCircle />, // Question circle for help center
    },
  ];

  useEffect(() => {
    localStorage.setItem("admin-sidebar-state", JSON.stringify(sidebarOpen));
    localStorage.setItem("admin-active-route", activeUrl);
  }, [sidebarOpen, activeUrl]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeUrl]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-72" : "w-20"
        } bg-white text-gray-700 transition-all duration-300 ease-in-out flex flex-col shadow-lg border-r border-gray-200 z-20`}
      >
        {/* Profile Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white">
          {sidebarOpen ? (
            <div className="flex items-center space-x-4 overflow-hidden">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow border-2 border-blue-200">
                {admin?.avatar ? (
                  <img
                    src={admin.avatar}
                    alt="Admin Avatar"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="text-3xl" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate text-gray-800 text-lg tracking-wide">
                  {admin?.name || "Admin User"}
                </p>
                <p className="text-xs text-gray-500 truncate font-mono">
                  {admin?.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mx-auto shadow border-2 border-blue-200">
              {admin?.avatar ? (
                <img
                  src={admin.avatar}
                  alt="Admin Avatar"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="text-xl" />
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 border border-gray-200 shadow-sm"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <FaChevronLeft className="text-gray-600 hover:text-blue-500" />
              ) : (
                <FaChevronRight className="text-gray-600 hover:text-blue-500" />
              )}
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveUrl(item.url)}
              className={`
                group w-full text-left relative
                rounded-lg border border-gray-200
                px-4 py-3 flex items-center gap-3
                font-medium tracking-wide
                transition-all duration-200
                shadow-sm
                bg-white
                hover:border-blue-300 hover:bg-blue-50
                focus:outline-none focus:ring-2 focus:ring-blue-100
                ${
                  activeUrl === item.url
                    ? "border-blue-300 bg-blue-50 shadow-md"
                    : ""
                }
              `}
            >
              {/* Active indicator */}
              {activeUrl === item.url && (
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-lg"></div>
              )}

              <span
                className={`text-xl ${
                  sidebarOpen ? "mr-2" : "mx-auto"
                } text-blue-500 group-hover:text-blue-600 transition-colors`}
              >
                {item.icon}
              </span>
              {sidebarOpen && (
                <>
                  <span className="text-gray-700 group-hover:text-blue-600 flex-1 text-left text-base">
                    {item.title}
                  </span>
                  <FaChevronRight className="text-gray-400 group-hover:text-blue-500 text-sm" />
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className={`
              w-full text-left relative
              rounded-lg border border-gray-200
              px-4 py-3 flex items-center gap-3
              font-medium tracking-wide
              transition-all duration-200
              shadow-sm
              bg-white
              hover:border-red-300 hover:bg-red-50
              focus:outline-none focus:ring-2 focus:ring-red-100
            `}
          >
            <span
              className={`text-xl ${
                sidebarOpen ? "mr-2" : "mx-auto"
              } text-red-500 group-hover:text-red-600 transition-colors`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            {sidebarOpen && (
              <span className="text-gray-700 group-hover:text-red-600">
                Logout
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <main className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500"></div>
            </div>
          ) : (
            <iframe
              src={activeUrl}
              title="Admin Content"
              className="w-full h-full border-0 bg-white rounded-lg shadow-sm m-6 px-10"
              onLoad={() => setIsLoading(false)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;