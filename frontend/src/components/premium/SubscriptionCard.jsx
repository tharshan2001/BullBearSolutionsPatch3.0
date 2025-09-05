import React from "react";
import { useNavigate } from "react-router-dom";

const SubscriptionCard = ({ subscription }) => {
  const navigate = useNavigate();
  const { product, status, autoRenew, subscribedAt, expiresAt } = subscription;

  // If product is missing, render placeholder
  if (!product) {
    return (
      <div className="border border-slate-700 rounded-xl p-4 bg-slate-800/40">
        <p className="text-slate-400">Product unavailable</p>
      </div>
    );
  }

  // Image handling
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const IMAGE_BASE_URL =
    import.meta.env.VITE_IMAGE_BASE_URL ||
    API_BASE_URL.replace(/\/api\/?$/, "");
  const imageUrl = product.image?.startsWith("http")
    ? product.image
    : product.image
    ? `${IMAGE_BASE_URL.replace(/\/$/, "")}/${product.image.replace(/^\//, "")}`
    : "https://via.placeholder.com/56?text=No+Image";

  // Helpers
  const handleClick = () =>
    navigate(`/products/detailed/${product.slug || ""}`);
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "N/A";

  const getDaysRemaining = () => {
    if (status.toLowerCase() !== "active" || !expiresAt) return null;
    const diffTime = new Date(expiresAt) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0
      ? `${diffDays} day${diffDays !== 1 ? "s" : ""} left`
      : "Expires today";
  };

  const getStatusStyle = () => {
    const base =
      "px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5";
    switch (status.toLowerCase()) {
      case "active":
        return `${base} bg-teal-500/10 text-teal-400`;
      case "expired":
        return `${base} bg-rose-500/10 text-rose-400`;
      case "cancelled":
        return `${base} bg-amber-500/10 text-amber-400`;
      default:
        return `${base} bg-slate-700 text-slate-300`;
    }
  };

  const StatusIcon = ({ status }) => {
    switch (status.toLowerCase()) {
      case "active":
        return <span className="text-teal-400">✓</span>;
      case "expired":
        return <span className="text-rose-400">✕</span>;
      case "cancelled":
        return <span className="text-amber-400">↻</span>;
      default:
        return <span className="text-slate-300">•</span>;
    }
  };

  return (
    <div
      onClick={handleClick}
      className="border border-slate-700 rounded-xl p-4 bg-slate-800/40 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer hover:border-teal-400/30 group"
    >
      <div className="flex items-start gap-4">
        <img
          src={imageUrl}
          alt={product.Title || "No Title"}
          className="w-14 h-14 rounded-lg object-cover border border-slate-700 group-hover:border-teal-400/50 transition-colors"
          onError={(e) => {
            if (!e.target.dataset.fallback) {
              e.target.src = "https://via.placeholder.com/56?text=No+Image";
              e.target.dataset.fallback = "true"; // mark that fallback has been applied
            }
          }}
        />

        <div className="flex-1 space-y-1.5">
          <div className="flex justify-between items-start">
            <h3 className="text-white font-medium truncate pr-2">
              {product.Title || "No Title"}
            </h3>
            <span className="text-teal-400 font-medium text-sm whitespace-nowrap">
              ${product.Price ?? "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className={getStatusStyle()}>
              <StatusIcon status={status} />
              {status}
            </div>
            {status.toLowerCase() === "active" && expiresAt && (
              <span className="text-xs text-slate-400">
                {getDaysRemaining()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Renewal</span>
          <span
            className={`font-medium ${
              autoRenew ? "text-teal-400" : "text-amber-400"
            }`}
          >
            {autoRenew ? "Automatic" : "Manual"}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Subscribed</span>
          <span className="text-slate-200">{formatDate(subscribedAt)}</span>
        </div>

        {expiresAt && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">
              {status.toLowerCase() === "active" ? "Expires" : "Expired"}
            </span>
            <span
              className={`font-medium ${
                status === "active" ? "text-amber-400" : "text-rose-400"
              }`}
            >
              {formatDate(expiresAt)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCard;
