import React from 'react';
import { useNavigate } from 'react-router-dom';
import holTealVideo from '../../assets/holTeal.mp4';

const VideoBanner = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/rates');
  };

  return (
    <div 
      className="relative w-[calc(100%-2.5rem)] max-w-[520px] h-[70px] rounded-lg my-5 mx-auto overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      {/* Video background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute w-full h-full object-cover"
      >
        <source src={holTealVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Semi-transparent slate overlay */}
      <div className="absolute inset-0 bg-slate-800/90 rounded-lg"></div>
      
      {/* Content with gradient */}
      <div className="absolute inset-y-0 left-0 w-2/3 h-full bg-gradient-to-r from-teal-900/70 to-transparent flex flex-col justify-center p-4 rounded-lg">
        <h2 className="text-white font-bold text-lg">Current Forex Rates</h2>
        <p className="text-slate-200 text-sm">Live Updates</p>
      </div>
    </div>
  );
};

export default VideoBanner;