import React, { useEffect, useState } from "react";
import axios from "axios";
import Transaction from "./Transaction";
import { useInView } from "react-intersection-observer";
import HeaderA from "../../components/HeaderA";
import { useNavigate } from "react-router-dom";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const navigate = useNavigate();

  const [loadMoreRef, inView] = useInView();

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.get(
          `${apiBaseUrl}/api/transactions/my-transactions`,
          {
            withCredentials: true,
            params: {
              page,
              limit,
              sort: "-createdAt",
            },
          }
        );

        // Deduplicate by _id
        setTransactions((prev) => {
          const ids = new Set(prev.map((t) => t._id));
          const newTx = res.data.filter((t) => !ids.has(t._id));
          return [...prev, ...newTx];
        });

        setHasMore(res.data.length === limit);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [page]);

  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [inView, isLoading, hasMore]);

  return (
    <div className="flex flex-col gap-6 p-6 items-center w-full bg-[#181b2c] min-h-screen overflow-y-auto">
      <HeaderA title="Account & Transaction" onBack={() => navigate(-1)} />

      {/* Added Transaction History header with same style */}
      <header className="py-8 flex flex-col items-start justify-start mt-5 w-full">
        <h1 className="text-xl font-bold text-white text-start">
          Transaction History
        </h1>
        <div className="w-20 h-[1.5px] rounded-full bg-gradient-to-r from-teal-600 to-teal-300 mt-2 mb-5" />
      </header>

      {transactions.map((tx) => (
        <div key={tx._id} className="w-full max-w-[600px] mx-auto">
          <Transaction tx={tx} />
        </div>
      ))}

      <div
        ref={loadMoreRef}
        className="w-full h-10 flex justify-center items-center"
      >
        {isLoading && (
          <div className="animate-pulse text-gray-500">
            Loading more transactions...
          </div>
        )}
        {!hasMore && transactions.length > 0 && (
          <div className="text-gray-500">No more transactions</div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
