import React, { useEffect, useState } from "react";
import axios from "axios";
import AnnouncementCard from "./AnnouncementCard";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasAuthError, setHasAuthError] = useState(false); 
  const limit = 8;
  const navigate = useNavigate();
  const [loadMoreRef, inView] = useInView();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.get(
          `${apiBaseUrl}/api/announcements/paginated`,
          {
            withCredentials: true,
            params: {
              page,
              limit,
              sort: "-createdAt",
            },
          }
        );

        // Deduplicate based on _id
        setAnnouncements((prev) => {
          const ids = new Set(prev.map((a) => a._id));
          const newAnnouncements = res.data.filter((a) => !ids.has(a._id));
          return [...prev, ...newAnnouncements];
        });

        setHasMore(res.data.length === limit);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setHasAuthError(true);
          navigate("/login");
        } else {
          console.error("Failed to fetch announcements:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!hasAuthError) {
      fetchAnnouncements();
    }
  }, [page, hasAuthError]);

  useEffect(() => {
    if (inView && !isLoading && hasMore && !hasAuthError) {
      setPage((prev) => prev + 1);
    }
  }, [inView, isLoading, hasMore, hasAuthError]);

  return (
    <div className="flex flex-col gap-6 p-6 items-center">
      {announcements.map((announcement) => (
        <div key={announcement._id} className="w-full max-w-[500px] mx-auto">
          <AnnouncementCard announcement={announcement} />
        </div>
      ))}

      <div
        ref={loadMoreRef}
        className="w-full h-10 flex justify-center items-center"
      >
        {isLoading && (
          <div className="animate-pulse text-gray-500">
            Loading more announcements...
          </div>
        )}
        {!hasMore && announcements.length > 0 && (
          <div className="text-gray-500">No more announcements</div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementList;
