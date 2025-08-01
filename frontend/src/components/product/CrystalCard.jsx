import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import TText from '../../assets/T_text.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || API_BASE_URL.replace(/\/api\/?$/, '');

const CrystalCard = ({ 
  id,
  slug,
  title = '', 
  subtitle = '', 
  price = 0, 
  image = '', 
  bgColor = 'bg-gradient-to-t from-[#151515] to-[#242424]', 
  color = 'text-white', 
  priceColor = 'text-white' 
}) => {
  const navigate = useNavigate();

  const imageUrl = image?.startsWith('http')
    ? image
    : `${IMAGE_BASE_URL.replace(/\/$/, '')}/${image.replace(/^\//, '')}`;

  const handleClick = () => {
    // Navigate using slug, hide the id from URL
    navigate(`/products/detailed/${slug}`);
  };

  return (
    <div 
      onClick={handleClick}
      style={{ cursor: 'pointer', pointerEvents: 'auto', zIndex: 100 }}
      className={`rounded-xl p-5 w-full max-w-[220px] h-[330px] flex flex-col justify-between ${bgColor} border border-white/10 hover:border-white/20 transition-all duration-300 group relative overflow-visible`}
    >
      {/* Text Content */}
      <div className="space-y-3 z-10">
        <h3 className={`text-lg font-medium ${color} leading-tight`}>
          {title}
        </h3>
        <p className={`text-xs ${color === 'text-white' ? 'text-white/60' : 'text-black/60'} leading-relaxed`}>
          {subtitle}
        </p>
      </div>

      {/* Price */}
      <div className="flex items-center z-10">
        <img src={TText} alt="T currency" className="w-4 h-4 mr-1" />
        <span className={`text-base ${priceColor} font-semibold`}>
          {price.toLocaleString()}
        </span>
      </div>

      {/* Image with Enhanced Glow Effect */}
      <div className="relative flex-1 flex items-end justify-center mt-2">
        {/* Glow Layers */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-teal-400/30 via-teal-400/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 blur-[20px] transition-all duration-500"
          style={{ transform: 'translateY(20px) scale(0.95)', transformOrigin: 'bottom center' }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t from-teal-400/15 to-transparent rounded-xl blur-[10px] opacity-70"
          style={{ transform: 'translateY(15px) scale(0.98)', transformOrigin: 'bottom center' }}
        />
        <div className="relative z-20 w-full h-full flex items-end justify-center transform group-hover:-translate-y-1 transition-all duration-300">
          <img 
            src={imageUrl} 
            alt={title} 
            className="h-[140px] w-auto object-contain object-bottom drop-shadow-[0_0_15px_rgba(45,212,191,0.4)] group-hover:drop-shadow-[0_0_25px_rgba(45,212,191,0.7)] transition-all duration-300" 
            loading="lazy"
          />
        </div>
      </div>

      {/* Optional Glow Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(45,212,191,0.03)_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  );
};

CrystalCard.propTypes = {
  id: PropTypes.string,
  slug: PropTypes.string.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  price: PropTypes.number,
  image: PropTypes.string,
  bgColor: PropTypes.string,
  color: PropTypes.string,
  priceColor: PropTypes.string
};

export default CrystalCard;
