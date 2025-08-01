import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ErrorOutline, Refresh } from "@mui/icons-material";

const CurrencyConverter = () => {
  const [exchangeData, setExchangeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSuccess, setLastSuccess] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [autoRefreshCount, setAutoRefreshCount] = useState(0);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const refreshIntervalRef = useRef(null);

  const API_KEY = "b215ff457f6eea2b52966bb7b60d3be81060";
  const API_URL = `https://api.fxratesapi.com/latest?api_key=${API_KEY}`;
  const MAX_HOURLY_HITS = 50;
  const AUTO_REFRESH_LIMIT = 50;
  const AUTO_REFRESH_INTERVAL = (60 * 60 * 1000) / MAX_HOURLY_HITS; // 72 seconds between hits

  const currencyPairs = [
    { code: "EUR", pair: "EUR/USD", inverse: true, name: "Euro" },
    { code: "GBP", pair: "GBP/USD", inverse: true, name: "British Pound" },
    { code: "AUD", pair: "AUD/USD", inverse: true, name: "Australian Dollar" },
    { code: "NZD", pair: "NZD/USD", inverse: true, name: "New Zealand Dollar" },
    { code: "JPY", pair: "USD/JPY", inverse: false, name: "Japanese Yen" },
    { code: "CHF", pair: "USD/CHF", inverse: false, name: "Swiss Franc" },
    { code: "CAD", pair: "USD/CAD", inverse: false, name: "Canadian Dollar" },
    { code: "CNY", pair: "USD/CNY", inverse: false, name: "Chinese Yuan" },
    { code: "INR", pair: "USD/INR", inverse: false, name: "Indian Rupee" },
  ];

  // Get cached data from localStorage
  const getCachedData = () => {
    const cached = localStorage.getItem("fxCache");
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // Use cache if less than 1 hour old
        if (Date.now() - timestamp < 3600000) {
          return data;
        }
      } catch (e) {
        console.error("Failed to parse cached data", e);
      }
    }
    return null;
  };

  // Save to localStorage
  const cacheData = (data) => {
    try {
      localStorage.setItem(
        "fxCache",
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      console.error("Failed to cache data", e);
    }
  };

  const fetchExchangeRates = async (isRetry = false, isManual = false) => {
    // Skip if we're auto-refreshing and hit the limit
    if (isAutoRefreshing && autoRefreshCount >= AUTO_REFRESH_LIMIT && !isManual) {
      return;
    }

    try {
      const cachedData = getCachedData();
      if (cachedData && !isRetry && !isManual) {
        setExchangeData(cachedData);
        setLastSuccess(new Date(cachedData.updated));
        setError(null);
        setLoading(false);
        return;
      }

      const response = await axios.get(API_URL, { 
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.data || !response.data.rates) {
        throw new Error("Invalid API response format");
      }

      const newData = {
        base: response.data.base,
        rates: response.data.rates,
        updated: new Date(response.data.timestamp * 1000).toISOString(),
      };

      setExchangeData(newData);
      cacheData(newData);
      setLastSuccess(new Date());
      setError(null);
      setRetryCount(0);

      if (!isManual) {
        setAutoRefreshCount(prev => prev + 1);
      }
    } catch (err) {
      console.error("API Error:", err);
      const errorMsg =
        err.response?.data?.error?.message ||
        err.message ||
        "Failed to fetch exchange rates";
      
      setError({ 
        message: errorMsg, 
        timestamp: new Date(),
        code: err.response?.data?.error?.code
      });
      
      // Exponential backoff for rate limits
      if (err.response?.status === 429) {
        const delay = Math.min(1000 * 2 ** retryCount, 30000);
        setTimeout(() => {
          setRetryCount(retryCount + 1);
          fetchExchangeRates(true);
        }, delay);
      }

      // Fallback to cached data if no data exists
      const cachedData = getCachedData();
      if (!exchangeData && cachedData) {
        setExchangeData(cachedData);
      } else if (!exchangeData) {
        // Final fallback to hardcoded data
        setExchangeData({
          base: "USD",
          rates: {
            EUR: 0.8528,
            GBP: 0.736,
            AUD: 1.5318,
            NZD: 1.6672,
            JPY: 146.65,
            CHF: 0.7966,
            CAD: 1.3667,
            CNY: 7.1799,
            INR: 85.75,
          },
          updated: new Date().toISOString(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const startAutoRefresh = () => {
    setIsAutoRefreshing(true);
    setAutoRefreshCount(0);
    refreshIntervalRef.current = setInterval(() => {
      fetchExchangeRates();
    }, AUTO_REFRESH_INTERVAL);
  };

  const stopAutoRefresh = () => {
    setIsAutoRefreshing(false);
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  const handleManualRefresh = () => {
    fetchExchangeRates(false, true);
  };

  useEffect(() => {
    // Initial fetch
    fetchExchangeRates();
    
    // Start auto-refresh
    startAutoRefresh();

    return () => {
      stopAutoRefresh();
    };
  }, []);

  useEffect(() => {
    // Stop auto-refresh when we hit the limit
    if (autoRefreshCount >= AUTO_REFRESH_LIMIT) {
      stopAutoRefresh();
    }
  }, [autoRefreshCount]);

  if (loading && !exchangeData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-8 mt-4">
      <header className="py-2 flex flex-col items-start justify-center">
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-sm font-bold text-white text-center">
              Major Pair Rates (MT5)
              {error && (
                <span className="text-red-400 text-xs ml-2 flex items-center">
                  <ErrorOutline fontSize="small" className="mr-1" />
                  Connection Issues
                </span>
              )}
            </h1>
            <div className="w-24 h-[1px] rounded-full bg-gradient-to-r from-teal-600 to-teal-300 mt-1" />
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="p-1 rounded-full hover:bg-slate-700/50 transition-colors"
            title="Refresh manually"
          >
            <Refresh fontSize="small" className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-900/50 border-l-4 border-red-500 text-red-200 p-3 rounded-lg flex items-start text-sm">
          <ErrorOutline className="mr-2 mt-0.5 flex-shrink-0" fontSize="small" />
          <div>
            <p className="font-bold">
              {error.code === "PE-R001" ? "Rate Limit Exceeded" : "API Error"}
            </p>
            <p>{error.message}</p>
            {error.code === "PE-R001" && (
              <p className="text-xs mt-1 text-red-300">
                Please wait while we automatically retry...
              </p>
            )}
            <p className="text-xs mt-1 text-red-300">
              Last successful update:{" "}
              {lastSuccess ? lastSuccess.toLocaleTimeString() : "Never"}
            </p>
            <button
              onClick={() => fetchExchangeRates(true)}
              className="mt-1 px-2 py-0.5 bg-red-800/50 hover:bg-red-700/70 rounded text-xs transition-colors border border-red-700"
              disabled={error.code === "PE-R001"}
            >
              {error.code === "PE-R001" ? "Retrying..." : "Retry Now"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {currencyPairs.map(({ code, pair, inverse, name }) => {
          let rate = exchangeData?.rates?.[code];
          if (!rate) return null;
          
          let displayRate = inverse ? 1 / rate : rate;
          let formatted =
            displayRate >= 10 ? displayRate.toFixed(2) : displayRate.toFixed(4);

          return (
            <div
              key={pair}
              className={`
                relative bg-gradient-to-br from-slate-800 to-slate-900
                rounded-lg border ${
                  error ? "border-red-900/50" : "border-slate-700"
                }
                p-3 hover:border-teal-400/30 transition-colors duration-200
                w-full group overflow-hidden ${error ? "opacity-80" : ""}
              `}
            >
              <div
                className={`
                absolute top-0 left-0 w-full h-0.5 
                ${
                  error
                    ? "bg-gradient-to-r from-transparent via-red-500/50 to-transparent"
                    : "bg-gradient-to-r from-transparent via-teal-400/30 to-transparent"
                }
                opacity-20
              `}
              ></div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-0.5">
                  <span
                    className={`text-sm font-semibold ${
                      error ? "text-red-200" : "text-white"
                    }`}
                  >
                    {pair}
                  </span>
                  <span
                    className={`text-xs ${
                      error ? "text-red-300/70" : "text-slate-400"
                    }`}
                  >
                    {name}
                  </span>
                </div>

                <span
                  className={`text-sm font-mono ${
                    error ? "text-red-300" : "text-teal-300"
                  }`}
                >
                  {formatted}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={`text-center text-xs mb-10 ${
          error ? "text-red-300/80" : "text-slate-400"
        } mt-1`}
      >
        <p>
          Base: {exchangeData?.base || "USD"} • Updated:{" "}
          {exchangeData?.updated ? new Date(exchangeData.updated).toLocaleTimeString() : "Unknown"}
          {error && " (may be outdated)"}
        </p>
        <p
          className={`mt-0.5 ${
            error ? "text-red-400/70" : "text-teal-400/70"
          } animate-pulse`}
        >
          {error ? "Attempting to reconnect..." : 
            isAutoRefreshing ? 
              `Auto-refreshing (${autoRefreshCount}/${AUTO_REFRESH_LIMIT})` : 
              "Click refresh button to update"}
        </p>
      </div>
    </div>
  );
};

export default CurrencyConverter;