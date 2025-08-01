import React from "react";
import bull from "../../assets/image.png";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const Mentor = () => {
  return (
    <div className="mx-auto max-w-[500px]">
      <div
        className="relative  rounded-2xl p-3 h-[100px] bg-gradient-to-br from-slate-800 to-slate-900  border-[1px]-teal sm:h-[120px] w-full shadow-lg overflow-visible cursor-pointer hover:shadow-xl transition-shadow duration-300"
      >
        {/* Text Content */}
        <div className="relative z-20 pt-1 pl-2">
          <div className="flex items-center group">
            <h2 className="text-white text-sm sm:text-lg font-bold tracking-tight">
              Expertise Advisor
            </h2>
            {/* <span className="text-teal-300 text-base sm:text-xl pl-2 mb-3 transform translate-y-0.5 transition-transform duration-200 group-hover:translate-x-1">
              <ArrowForwardIosIcon 
                sx={{
                  fontSize: 'inherit',
                  width: '1em',
                  height: '1em',
                  stroke: 'currentColor',
                  strokeWidth: '2',
                }}
              />
            </span> */}
          </div>
          <p className="text-[#B0B3C6] text-xs font-medium mt-1">
            Your expert learning guide
          </p>
        </div>

        {/* Robot with teal glow - peeking effect */}
        <div
          className="absolute top-6 -right-[10px] w-[100px] h-[90px] 
                  sm:-right-[10px] sm:w-[100px] sm:h-[100px]
                  md:-right-[20px] md:w-[150px] md:h-[130px]
                  transform -translate-y-[20%] sm:-translate-y-[25%] z-10
                  pointer-events-none select-none"
        >
          <div className="relative w-full h-full">
            {/* Glow effect - positioned behind the image */}
            <div className="absolute inset-3 bg-teal-400 rounded-full blur-[20px] opacity-30 animate-pulse"></div>
            <img
              src={bull}
              alt="Robot Mentor"
              className="relative w-full h-full object-contain drop-shadow-2xl"
              draggable="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mentor;
