import React from 'react';
import { useNavigate } from 'react-router-dom';

const ImageBanner = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/products');
  };

  return (
    <div 
      className="relative w-full sm:w-[520px] h-[70px] rounded-lg bg-cover bg-center bg-no-repeat m-5 mx-auto overflow-hidden cursor-pointer"
      style={{ backgroundImage: 'url(https://i.pinimg.com/1200x/0d/fa/e6/0dfae65f15d971b19689cd1288adb4e5.jpg)' }}
      onClick={handleClick}
    >
      {/* Simplified overlay with single gradient */}
      <div className="absolute inset-y-0 left-0 w-2/3 h-full bg-gradient-to-r from-teal-900 to-transparent flex flex-col justify-center p-4 border-slate-700 border rounded-lg border">
        <h2 className="text-white font-bold text-lg">Products</h2>
        <p className="text-slate-200 text-sm">2025 july 31-2026 june 15</p>
      </div>
    </div>
  );
};

export default ImageBanner;