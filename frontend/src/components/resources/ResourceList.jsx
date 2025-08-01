import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthProvider';
import axios from 'axios';
import HeaderA from "../HeaderA";
import { useNavigate } from "react-router-dom";

const ResourceList = () => {
  const { loading: authLoading } = useAuth();
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.get(`${apiBaseUrl}/api/resources`, {
          withCredentials: true,
        });

        setResources(res.data);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        setError(err.response?.data?.message || 'Failed to fetch resources');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchResources();
    }
  }, [authLoading]);

  const handleResourceClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-10 pt-8 flex justify-center items-center min-h-[200px]">
        <div className="animate-pulse w-full space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-[#1c1c1c] rounded-lg h-16 w-full"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-10 pt-8 flex justify-center items-center min-h-[200px]">
        <div className="text-2xl font-bold text-white">Error: {error}</div>
      </div>
    );
  }

  // Empty state
  if (resources.length === 0 && !isLoading) {
    return (
      <div className="p-10 pt-8 flex justify-center items-center min-h-[200px]">
        <div className="text-2xl font-bold text-white">No Resources Available</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full px-15 pt-2 max w-full bg-[#181b2c] min-h-screen">
      <HeaderA title="Resources  List" onBack={() => navigate(-1)} />
      <header className="py-8 flex flex-col items-start justify-center">
        <h1 className="text-xl font-bold text-white text-center mt-10">Resources</h1>
        <div className="w-20 h-[1.5px] rounded-full bg-gradient-to-r from-teal-600 to-teal-300 mt-2 mb-5" />
      </header>
      
      <div className="space-y-4">
        {resources.map((resource, idx) => (
          <div
            key={`${resource.title}-${idx}`}
            onClick={() => handleResourceClick(resource.url)}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-2 hover:from-[#242424] hover:to-[#33eed5]/10 transition-all cursor-pointer border border-[#3a3a42] hover:border-[#33eed5]/30"
          >
            <h3 className="text-xl font-semibold text-white">
              {resource.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceList;