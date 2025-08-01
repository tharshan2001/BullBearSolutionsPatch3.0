import React from "react";
import bullBearimg from "../../assets/bullBearimg.png";

const ProductView = () => {
  return (
    <div className="w-full flex flex-col items-center mt-2">
      {/* Main Container - Transparent to show parent gradient */}
      <div className="w-full max-w-2xl rounded-b-2xl overflow-hidden bg-transparent">
        {/* Image + Gradient Wrapper */}
        <div className="relative w-full h-80">
          {/* Image with bottom fade-out using Tailwind */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={bullBearimg}
              alt="bull and bear"
              className="w-full h-full object-cover [mask-image:linear-gradient(to_bottom,black_50%,transparent_85%)]"
            />
          </div>

          {/* Gradient Overlay that blends with parent */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#101015]/70 to-[#1f1f2f]/30" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-end pb-6 px-4 text-center text-white">
            <h2 className="font-bold text-lg md:text-xl drop-shadow-lg mb-0.2">
              BULL BEAR SOLUTIONS
            </h2>
                        {/* Accent Line */}
            <div className="w-full h-[1px]  rounded-full max-w-sm bg-gradient-to-r from-[#1affd1] to-[#4dffa6]/70" />
            <p className="text-white-300 text-xs mt-3">
              Best trading strategies with our AI-powered tools
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
