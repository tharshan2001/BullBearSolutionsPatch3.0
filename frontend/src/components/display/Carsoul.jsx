import { useState, useEffect } from 'react';
import image1 from '../../assets/1.jpg';
import image2 from '../../assets/2.jpg';
import image3 from '../../assets/3.jpg';
import image4 from '../../assets/4.jpg';
import image5 from '../../assets/5.jpg';

const Carsoul = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const slides = [
    { image: image1, interval: 3000 },
    { image: image2, interval: 2500 },
    { image: image3, interval: 2000 },
    { image: image4, interval: 3000 },
    { image: image5, interval: 3500 }
  ];

  const defaultInterval = 5000;

  useEffect(() => {
    if (isHovered) return;
    
    const activeSlide = slides[activeIndex];
    const intervalTime = activeSlide.interval ?? defaultInterval;
    
    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, intervalTime);

    return () => clearTimeout(timer);
  }, [activeIndex, isHovered, slides]);

  return (
    <div className="flex justify-center w-full px-5 cursor-pointer">
      <div 
        className="relative w-full max-w-[520px] overflow-hidden rounded-3xl shadow-2xl mt-10 mb-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Container with 14:5 aspect ratio (14x5 inch poster) */}
        <div className="relative w-full" style={{ paddingBottom: '35.714%' }}> {/* 5/14 = 0.35714 */}
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === activeIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={slide.image}
                alt="Poster"
                className="w-full h-full object-contain bg-gray-100"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carsoul;