import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { toast } from "react-hot-toast";
import Ticon from "../../assets/T_text.png";
import HeaderA from "../../components/HeaderA";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const ProductDetails = () => {
  const { slug } = useParams();
  const { axiosInstance, user: userData } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [securityPin, setSecurityPin] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("usdt");
  const [copied, setCopied] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const paymentSectionRef = useRef(null);
  const subscribeButtonRef = useRef(null);
  const navigate = useNavigate();

  // Wallet Icons
  const WalletIcons = {
    usdt: <img src={Ticon} alt="USDT" className="w-5 h-5" />,
    cw: (
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#6F4CFF" />
        <path
          d="M16 6C10.4772 6 6 10.4772 6 16C6 21.5228 10.4772 26 16 26C21.5228 26 26 21.5228 26 16C26 10.4772 21.5228 6 16 6ZM16 24C11.5817 24 8 20.4183 8 16C8 11.5817 11.5817 8 16 8C20.4183 8 24 11.5817 24 16C24 20.4183 20.4183 24 16 24Z"
          fill="white"
        />
        <path
          d="M16 10C12.6863 10 10 12.6863 10 16C10 19.3137 12.6863 22 16 22C19.3137 22 22 19.3137 22 16C22 12.6863 19.3137 10 16 10ZM16 20C13.7909 20 12 18.2091 12 16C12 13.7909 13.7909 12 16 12C18.2091 12 20 13.7909 20 16C20 18.2091 18.2091 20 16 20Z"
          fill="white"
        />
        <circle cx="16" cy="16" r="4" fill="white" />
      </svg>
    ),
  };

  const usdt = userData?.wallet?.usdt || 0;
  const cw = userData?.wallet?.cw || 0;
  const wallets = [
    { id: "usdt", name: "USDT Wallet", balance: usdt },
    { id: "cw", name: "CW Wallet", balance: cw },
  ];

  const resolveImageUrl = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    try {
      const base = API_BASE_URL.replace(/\/api\/?$/, "");
      return `${base.replace(/\/$/, "")}/${img.replace(/^\//, "")}`;
    } catch (e) {
      console.error("Error resolving image URL:", e);
      return img;
    }
  };

  const handleCopy = () => {
    if (userData?.code) {
      navigator.clipboard.writeText(userData.code).then(() => {
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 1500);
      });
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/api/products/${slug}`);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        toast.error(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, axiosInstance]);

  const handleWalletChange = (e) => {
    setSelectedWallet(e.target.value);
  };

  const getSelectedWallet = () =>
    wallets.find((wallet) => wallet.id === selectedWallet) || wallets[0];

  const handleSubscribe = async () => {
    if (!securityPin) {
      paymentSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setShowGlow(true);
      setTimeout(() => setShowGlow(false), 2000);
      toast.error("Please enter your security PIN");
      return;
    }

    try {
      const subscribePromise = axiosInstance.post(
        "/api/subscriptions/subscribe",
        {
          productId: product._id,
          walletMethod: selectedWallet,
          securityPin,
        }
      );

      toast.promise(subscribePromise, {
        loading: "Processing subscription...",
        success: (res) => {
          // Optional: Add condition if needed
          setTimeout(() => {
            navigate("/subscriptions"); // or any other route
          }, 1500); // Delay to let toast display
          return "Subscription successful!";
        },
        error: (err) =>
          err.response?.data?.message ||
          "Failed to subscribe. Please try again.",
      });

      await subscribePromise;
    } catch (err) {
      console.error("Subscription failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-teal-400">
        Loading...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-red-400">
        {error || "Product not found"}
      </div>
    );
  }

  const discountedPrice = product.discount
    ? product.Price * (1 - product.discount / 100)
    : product.Price;

  return (
    <div className="bg-gradient-to-br from-[#1f1f2f] via-[#191c2d] to-[#101015] min-h-screen flex flex-col">
      <HeaderA title="Subscribe" onBack={() => navigate(-1)} />

      <div className="flex-1 overflow-auto">
        <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
          {product.image && (
            <img
              src={resolveImageUrl(product.image)}
              alt="Product background"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-image.png";
              }}
            />
          )}

          <div className="absolute inset-0 bg-blue/50 backdrop-blur-[1px]" />

          <div className="relative flex flex-col px-4 md:px-8 pt-8 bg-black/80 backdrop-blur-[2px] min-h-screen">
            <div className="relative p-4 md:p-6 bg-white/10 rounded-2xl mx-2 md:mx-10 px-4 md:px-10 pb-10 pt-5 mt-8 md:mt-5">
              {product.discount > 0 && (
                <div className="absolute top-3 right-3">
                  <span className="bg-teal-400 text-black text-xs font-bold px-2 py-1 rounded">
                    {product.discount}% OFF
                  </span>
                </div>
              )}

              <h2 className="text-white text-xl md:text-2xl font-bold mt-6 md:mt-8 mb-4 overflow-hidden text-ellipsis">
                {product.Title}
              </h2>

              <div className="flex flex-col items-start gap-2 mb-6">
                <div className="flex items-center gap-2">
                  {product.discount > 0 && (
                    <span className="flex items-center gap-1 text-gray-300 line-through text-sm md:text-base font-semibold">
                      <img src={Ticon} alt="T" className="w-4 h-4" />
                      {product.Price.toLocaleString()}
                    </span>
                  )}
                  <span className="flex items-center text-teal-400 text-2xl md:text-3xl font-bold">
                    <img src={Ticon} alt="T" className="w-5 h-5" />
                    {discountedPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                {product.description}
              </p>

              {product.tags?.length > 0 && (
                <div className="mt-6 md:mt-10">
                  <h3 className="text-white text-sm font-bold mb-3 md:mb-4 uppercase tracking-wider">
                    Features
                  </h3>
                  <ul className="text-gray-200 text-sm list-disc list-inside space-y-1">
                    {product.tags.map((tag, i) => (
                      <li key={i} className="leading-snug">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div
              ref={paymentSectionRef}
              className="flex flex-col items-center mt-8 md:mt-10 w-full max-w-md mx-auto pb-2 px-4 md:px-0"
            >
              <div className="w-full">
                <h3 className="text-white text-lg md:text-xl font-bold mb-4">
                  Payment Method
                </h3>

                <div className="relative w-full mb-4">
                  <select
                    className="w-full bg-white/10 text-white p-3 pr-8 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    onChange={handleWalletChange}
                    value={selectedWallet}
                  >
                    {wallets.map((wallet) => (
                      <option
                        key={wallet.id}
                        value={wallet.id}
                        className="bg-gray-800 text-white"
                      >
                        {wallet.name}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <div className="w-full bg-white/10 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {WalletIcons[selectedWallet]}
                      <span className="text-teal-400 font-medium ml-2">
                        {getSelectedWallet().name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-white font-bold mr-2">
                        {getSelectedWallet().balance.toFixed(2)}
                      </span>
                      {selectedWallet === "usdt" ? (
                        <img src={Ticon} alt="USDT" className="w-5 h-5" />
                      ) : (
                        WalletIcons.cw
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full mb-2">
                  <label className="block text-gray-300 text-sm mb-2">
                    Security Pin
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Security PIN"
                    className="w-full bg-white/10 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value)}
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#101015] border-white/10 py-2 px-4 md:px-6 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="w-full bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-gray-300 text-sm">
                  Total Subscribe Amount
                </span>
                <span className="text-teal-400 font-bold">
                  <img src={Ticon} alt="T" className="w-4 h-4 inline mr-1" />
                  {discountedPrice.toLocaleString()}{" "}
                  {getSelectedWallet().id.toUpperCase()}
                </span>
              </div>
              <button
                ref={subscribeButtonRef}
                className={`bg-teal-400/70 hover:bg-teal-500/70 text-white font-bold py-2 px-4 md:px-6 rounded-lg shadow-lg transition-all duration-200 text-sm md:text-base border border-white/10 ${
                  showGlow
                    ? "animate-pulse ring-2 ring-teal-400 ring-opacity-80"
                    : ""
                }`}
                onClick={handleSubscribe}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
