import { useEffect, useState } from 'react';

const LoadingSpinner = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1f1f2f] via-[#191c2d] to-[#101015] z-50">
      {/* Spinner Container */}
      <div className="relative w-24 h-24">
        {/* Background circle for better visibility */}
        <div className="absolute inset-0 rounded-full border-[10px] border-gray-900/20"></div>
        
        {/* Glowing Teal Spinner */}
        <div 
          className="absolute inset-0 rounded-full border-[10px] border-transparent border-t-[#00E6D8] border-r-[#00E6D8] animate-spin"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(0, 230, 216, 0.7))',
            background: `conic-gradient(transparent 0%, transparent ${100 - progress}%, rgba(0, 230, 216, 0.3) ${100 - progress}%, rgba(0, 230, 216, 0.3) 100%)`
          }}
        ></div>
        
        {/* Percentage Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-2xl font-bold text-[#00E6D8]"
            style={{ 
              textShadow: '0 0 10px rgba(0, 230, 216, 0.8), 0 0 2px #000' 
            }}
          >
            {progress}%
          </span>
        </div>
      </div>
      
      {/* Loading Text */}
      <p 
        className="mt-4 text-[#00E6D8] font-medium"
        style={{
          textShadow: '0 0 8px rgba(0, 230, 216, 0.7), 0 0 2px #000'
        }}
      >
        Loading...
      </p>
    </div>
  );
};

export default LoadingSpinner;