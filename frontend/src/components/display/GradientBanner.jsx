import React from 'react';
import { useNavigate } from 'react-router-dom';

const GradientBanner = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/products');
  };

  return (
    <div 
      className="relative w-[calc(100%-2.5rem)] max-w-[520px] h-[70px] rounded-lg my-5 mx-auto overflow-hidden cursor-pointer"
      style={{ 
        background: 'linear-gradient(90deg, rgba(19, 78, 74, 1) 0%, rgba(15, 23, 42, 1) 100%)'
      }}
      onClick={handleClick}
    >
      <div className="h-full flex flex-col justify-center p-4 border-slate-700 border rounded-lg">
        <h2 className="text-white font-bold text-lg sm:text-xl">Your Power Your Trade</h2>
        <p className="text-slate-200 text-sm sm:text-base">2025 July 31 - 2026 June 15</p>
      </div>
    </div>
  );
};

export default GradientBanner;