import React, { useEffect, useRef, useState } from 'react';
import CrystalCard from './CrystalCard';
import { useAuth } from '../../context/AuthProvider';
import axios from 'axios';

const CardList = () => {
  const { loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const rowRef = useRef(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.get(`${apiBaseUrl}/api/products/available`, {
          withCredentials: true,
        });

        setProducts(res.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err.response?.data?.message || 'Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchProducts();
    }
  }, [authLoading]);

  // Programmatic scroll after layout
  useEffect(() => {
    if (products.length > 0 && rowRef.current) {
      const el = rowRef.current;

      // Wait for layout to fully render
      setTimeout(() => {
        requestAnimationFrame(() => {
          const original = el.style.scrollBehavior;
          el.style.scrollBehavior = 'auto'; // disable animation
          el.scrollLeft = 110;
          el.style.scrollBehavior = original;
        });
      }, 0);
    }
  }, [products]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-10 pt-8 flex justify-center items-center min-h-[336px]">
        <div className="animate-pulse grid grid-flow-col auto-cols-[240px] gap-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-[#1c1c1c] rounded-2xl h-[300px] w-[240px]"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-10 pt-8 flex justify-center items-center min-h-[336px]">
        <div className="text-2xl font-bold text-white">Error: {error}</div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0 && !isLoading) {
    return (
      <div className="p-10 pt-8 flex justify-center items-center min-h-[336px]">
        <div className="text-2xl font-bold text-white">New Products Coming Soon!</div>
      </div>
    );
  }

  const allCards = products.map((product) => ({
    id: product._id,
    slug: product.slug,
    title: product.Title,
    subtitle: product.category,
    price: product.Price,
    image: product.image,
    bgColor: 'bg-gradient-to-t from-[#151515] to-[#242424]',
    color: 'text-white',
    priceColor: 'text-white',
  }));

  return (
    <div className="p-10 pt-8 space-y-10">
      <div
        ref={rowRef}
        className="overflow-x-auto scrollbar-hide relative z-10"
        tabIndex={0}
        style={{
          WebkitOverflowScrolling: 'touch',
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
      >
        <div className="grid auto-cols-[240px] grid-flow-col gap-6 min-w-max">
          {allCards.map((card, idx) => (
            <div
              key={`${card.id}-${idx}`}
              style={{
                cursor: 'pointer',
                pointerEvents: 'auto',
                minWidth: '240px',
              }}
            >
              <CrystalCard {...card} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardList;
