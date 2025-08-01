import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

const ProductList = () => {
  const { loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const IMAGE_BASE_URL =
    import.meta.env.VITE_IMAGE_BASE_URL ||
    API_BASE_URL.replace(/\/api\/?$/, "");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await axios.get(`${API_BASE_URL}/api/products/available`, {
          withCredentials: true,
        });

        setProducts(res.data);
        setCurrentIndex(0);
      } catch (err) {
        setError(err.message || "Failed to fetch products");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchProducts();
    }
  }, [authLoading]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const handleSubscribe = () => {
    const currentProduct = products[currentIndex];
    navigate(`/products/detailed/${currentProduct.slug}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 flex items-center justify-center">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 flex items-center justify-center">
        <div className="text-xl text-red-400">{error}</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 flex items-center justify-center">
        <div className="text-xl">No products available</div>
      </div>
    );
  }

  const currentProduct = products[currentIndex];
  const imageUrl = currentProduct.image
    ? `${IMAGE_BASE_URL}${currentProduct.image.startsWith("/") ? "" : "/"}${
        currentProduct.image
      }`
    : null;
  const title =
    currentProduct.Title || currentProduct.title || currentProduct.name;

  return (
    <div className="text-white px-6 mb-10 mt-8">
      <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
        {/* Product Card */}
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-xl p-4 md:p-6 backdrop-blur-sm">
          {/* Holographic effect strip */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-400/30 to-transparent opacity-20"></div>

          {/* Left Controller (only shown when multiple products exist) */}
          {products.length > 1 && (
            <button
              onClick={handlePrev}
              className="
                absolute left-2 md:left-4 top-1/2 -translate-y-1/2
                w-6 h-6
                bg-gradient-to-br from-teal-600/90 to-teal-800/90
                backdrop-blur-sm
                rounded-full border border-teal-400/30
                p-0.5 hover:border-teal-300/50 hover:bg-teal-700/90
                transition-all duration-300
                flex items-center justify-center
                z-10
                shadow-lg shadow-teal-900/50
                hover:shadow-teal-800/50
                hover:scale-110
              "
              aria-label="Previous product"
            >
              <ChevronLeft
                className="text-teal-100"
                style={{ fontSize: "1rem" }}
              />
            </button>
          )}

          <div className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="flex-1">
              <div className="flex flex-row items-center gap-4 md:gap-6 mb-2 md:mb-6">
                {/* Product Image with Enhanced Glow Effect */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 group">
                  {/* Glow Layers */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-teal-400/30 via-teal-400/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 blur-[20px] transition-all duration-500"
                    style={{
                      transform: "translateY(20px) scale(0.95)",
                      transformOrigin: "bottom center",
                    }}
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-teal-400/15 to-transparent rounded-xl blur-[10px] opacity-70"
                    style={{
                      transform: "translateY(15px) scale(0.98)",
                      transformOrigin: "bottom center",
                    }}
                  />
                  <div className="relative z-20 w-[90px] h-[90px] sm:w-[120px] sm:h-[120px] flex items-center justify-center transform group-hover:-translate-y-1 transition-all duration-300 pl-3 sm:pl-0 -ml-2 sm:ml-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(45,212,191,0.4)] group-hover:drop-shadow-[0_0_25px_rgba(45,212,191,0.7)] transition-all duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-gray-400">Product Image</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 md:space-y-4 text-left">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      {title}
                    </h2>
                    <p
                      className="
                        text-lg md:text-xl font-semibold
                        bg-gradient-to-r from-teal-400 to-teal-600
                        bg-clip-text text-transparent
                        inline-block
                      "
                    >
                      USDT {currentProduct.Price || currentProduct.price}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controller (only shown when multiple products exist) */}
          {products.length > 1 && (
            <button
              onClick={handleNext}
              className="
                absolute right-2 md:right-4 top-1/2 -translate-y-1/2
                w-6 h-6
                bg-gradient-to-br from-teal-600/90 to-teal-800/90
                backdrop-blur-sm
                rounded-full border border-teal-400/30
                p-0.5 hover:border-teal-300/50 hover:bg-teal-700/90
                transition-all duration-300
                flex items-center justify-center
                z-10
                shadow-lg shadow-teal-900/50
                hover:shadow-teal-800/50
                hover:scale-110
              "
              aria-label="Next product"
            >
              <ChevronRight
                className="text-teal-100"
                style={{ fontSize: "1rem" }}
              />
            </button>
          )}

          {/* Subscribe Button */}
          <div className="relative z-10 flex justify-end sm:justify-end px-3">
            <button
              onClick={handleSubscribe}
              className="
                bg-gradient-to-r from-teal-500 to-teal-600
                hover:from-teal-400 hover:to-teal-500
                text-white font-bold 
                py-1 px-4 rounded-lg 
                transition-all duration-200
                shadow-lg hover:shadow-teal-500/20
                transform hover:-translate-y-0.5
                text-sm md:text-base
              "
            >
              Subscribe Now
            </button>
          </div>
        </div>

        {/* Terms & Conditions Section - Tiny Typography */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-xl p-4 md:p-6 backdrop-blur-sm">
          <h2 className="text-sm font-semibold mb-2 text-slate-300">
            DISCLAIMER
          </h2>

          <div className="text-xs text-slate-400 leading-tight space-y-2">
            <p>
              The information and training provided by Bull Bear Solutions (BBS)
              are intended <strong>solely for educational purposes</strong> and{" "}
              <strong>
                do not constitute financial, investment, or trading advice
              </strong>
              .
            </p>
            <p>
              Trading in the Foreign Exchange (Forex) market involves a{" "}
              <strong>high level of risk</strong> and may not be suitable for
              all individuals. <strong>Past performance</strong> of any trading
              strategy or methodology is{" "}
              <strong>not indicative of future results</strong>. Due to the
              leveraged nature of forex products, trading can result in
              significant profits or substantial losses. Individuals should only
              trade with capital they can afford to lose.
            </p>
            <p>
              BBS does <strong>not provide investment recommendations</strong>,
              and we{" "}
              <strong>do not manage client funds or trading accounts</strong>.
              We are <strong>not licensed</strong> as financial advisors,
              brokers, or dealers. Any trading examples or demonstrations
              included in our educational content are{" "}
              <strong>purely hypothetical</strong> and are used for illustrative
              purposes only.
            </p>
            <p>
              By enrolling in our courses or accessing our educational
              materials, you acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>
                You are solely responsible for your own trading decisions.
              </li>
              <li>
                You will not hold BBS, its trainers, staff, or affiliates liable
                for any loss or damage resulting from the use or reliance on the
                information provided.
              </li>
            </ul>
            <p>
              We strongly recommend that you{" "}
              <strong>consult with a licensed financial advisor</strong> or
              conduct thorough independent research before making any trading or
              investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
