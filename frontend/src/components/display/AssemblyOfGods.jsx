import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import m1 from "../../images/m1.png";
import m2 from "../../images/m2.png";
import m3 from "../../images/m3.png";
import m4 from "../../images/m4.png";
import m5 from "../../images/m5.png";
import m6 from "../../images/m6.png";
import m7 from "../../images/m7.png";
import m8 from "../../images/m8.png";
import m9 from "../../images/m9.png";
import m10 from "../../images/m10.png";
import m11 from "../../images/m11.png";
import m12 from "../../images/m12.png";
import m13 from "../../images/m13.png";
import m14 from "../../images/m14.png";
import m15 from "../../images/m15.png";
import m16 from "../../images/m16.png";

const AssemblyOfGods = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [visibleIds, setVisibleIds] = useState([]);
  const [entities, setEntities] = useState([]);
  const [previousVisibleIds, setPreviousVisibleIds] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const rowRefs = useRef([
    React.createRef(),
    React.createRef(),
    React.createRef(),
  ]);

  // All available images
  const entityImages = [
    m9,
    m10,
    m11,
    m12,
    m13,
    m14,
    m15,
    m16,
    m1,
    m2,
    m3,
    m4,
    m5,
    m6,
    m7,
    m8,
  ];

  // Function to generate random gradient
  const getRandomGradient = () => {
    const colors = [
      "from-red-200/70 to-pink-200/70",
      "from-blue-900/90 to-indigo-200/30",
      "from-green-900/90 to-teal-800/90",
      "from-yellow-900/100 to-yellow-700/60",
      "from-purple-800/100 to-violet-200/30",
      "from-cyan-900/70 to-blue-200/30",
      "from-rose-900/100 to-pink-200/30",
      "from-emerald-900/70 to-teal-200/30",
      "from-amber-700/30 to-orange-800/60",
      "from-fuchsia-200/40 to-purple-200/30",
    ];

    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Function to shuffle array and assign images randomly without repetition
  const assignRandomImages = () => {
    const shuffledImages = [...entityImages].sort(() => 0.5 - Math.random());
    const assignedImages = [];
    let imageIndex = 0;

    for (let i = 0; i < 30; i++) {
      if (imageIndex >= shuffledImages.length) {
        imageIndex = 0;
        shuffledImages.sort(() => 0.5 - Math.random());
      }
      assignedImages.push(shuffledImages[imageIndex]);
      imageIndex++;
    }

    return assignedImages;
  };

  useEffect(() => {
    setIsMounted(true);
    const assignedImages = assignRandomImages();

    const baseEntities = Array.from({ length: 30 }, (_, i) => {
      const rarities = ["common", "rare", "epic", "legendary", "sado"];
      const rarity = rarities[Math.floor(Math.random() * rarities.length)];

      return {
        id: i + 1,
        name: `Divine Entity ${i + 1}`,
        rarity,
        image: assignedImages[i],
        bgGradient: getRandomGradient(),
        useRarityBg: Math.random() > 0.5,
      };
    });

    setEntities(baseEntities);
    setVisibleIds(baseEntities.map((e) => e.id));
    setPreviousVisibleIds(baseEntities.map((e) => e.id));
    setIsLoading(false);

    // Set scroll position for each row with different values
    setTimeout(() => {
      if (rowRefs.current[0].current)
        rowRefs.current[0].current.scrollLeft = 10;
      if (rowRefs.current[1].current)
        rowRefs.current[1].current.scrollLeft = 100;
      if (rowRefs.current[2].current)
        rowRefs.current[2].current.scrollLeft = 25;
    }, 100);

    const interval = setInterval(() => {
      setVisibleIds((current) => {
        const newVisibleIds = [...current];

        // Track which entities are disappearing
        const disappearingIds = previousVisibleIds.filter(
          (id) => !current.includes(id)
        );

        // Update previous visible ids for next iteration
        setPreviousVisibleIds(current);

        // Remove random entity (if we have enough visible)
        if (current.length > 24 && Math.random() > 0.3) {
          const randomIndex = Math.floor(Math.random() * current.length);
          return current.filter((_, idx) => idx !== randomIndex);
        }
        // Add random missing entity
        else if (current.length < 30 && Math.random() > 0.3) {
          const missingIds = baseEntities
            .map((e) => e.id)
            .filter((id) => !current.includes(id));
          if (missingIds.length > 0) {
            const randomId =
              missingIds[Math.floor(Math.random() * missingIds.length)];
            return [...current, randomId];
          }
        }
        return current;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      setIsMounted(false);
    };
  }, []);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "legendary":
        return "bg-gradient-to-br from-yellow-200/20 via-amber-300/20 to-yellow-400/20";
      case "epic":
        return "bg-gradient-to-br from-purple-200/20 via-indigo-300/20 to-purple-400/20";
      case "rare":
        return "bg-gradient-to-br from-blue-200/20 via-cyan-300/20 to-blue-400/20";
      case "sado":
        return "bg-gradient-to-br from-green-200/20 via-teal-300/20 to-cyan-300/20";
      default:
        return "bg-gradient-to-br from-rose-200/20 via-pink-300/20 to-rose-400/20";
    }
  };

  // Split entities into 3 rows (10 items each)
  const row1Entities = entities.slice(0, 10);
  const row2Entities = entities.slice(10, 20);
  const row3Entities = entities.slice(20, 30);

  return (
    <AnimatePresence>
      {isMounted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="py-4 px-2 max-w-[640px] mx-auto mb-15"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="ml-5"
          >
            <header className="flex flex-col items-left justify-center mt-5">
              <h1 className="text-xl font-bold text-white text-start">TPN NFTs</h1>
              <p className="text-sm text-gray-400 mt-1">The Pantheon Nexus</p>
              <div className="w-20 h-[1.5px] rounded-full bg-gradient-to-r from-teal-600 to-teal-300" />
            </header>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="w-full"
          >
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-xl font-bold text-center mb-10 mt-10 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-blue-100 to-cyan-300"
            ></motion.h1>

            {/* Row 1 - scrollLeft = 130 */}
            <div
              ref={rowRefs.current[0]}
              className="flex overflow-x-auto gap-2 sm:gap-3 mb-2 scrollbar-hide"
              style={{ scrollBehavior: "smooth" }}
            >
              <AnimatePresence>
                {row1Entities.map((entity) => {
                  const isVisible = visibleIds.includes(entity.id);
                  const wasVisible = previousVisibleIds.includes(entity.id);
                  const justReappeared = !wasVisible && isVisible;

                  return (
                    <motion.div
                      key={entity.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={
                        isLoading
                          ? {}
                          : isVisible
                          ? {
                              opacity: 1,
                              scale: 1,
                              transition: { duration: 0.5 },
                            }
                          : {
                              opacity: 0,
                              scale: 0.8,
                              transition: { duration: 0.5 },
                            }
                      }
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5 }}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                      className="relative flex-shrink-0 aspect-square w-12 sm:w-14 rounded-md overflow-hidden"
                    >
                      <div
                        className={`absolute inset-0 ${
                          entity.useRarityBg
                            ? getRarityColor(entity.rarity)
                            : `bg-gradient-to-br ${entity.bgGradient}`
                        } flex items-center justify-center`}
                      >
                        <div className="w-3/4 h-3/4 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden">
                          <img
                            src={entity.image}
                            alt={entity.name}
                            className="w-full h-full object-contain p-1 mix-blend-multiply"
                            style={{ filter: 'brightness(1.1) contrast(1.1)' }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Row 2 - scrollLeft = 100 */}
            <div
              ref={rowRefs.current[1]}
              className="flex overflow-x-auto gap-2 sm:gap-3 mb-2 scrollbar-hide"
              style={{ scrollBehavior: "smooth" }}
            >
              <AnimatePresence>
                {row2Entities.map((entity) => {
                  const isVisible = visibleIds.includes(entity.id);
                  const wasVisible = previousVisibleIds.includes(entity.id);
                  const justReappeared = !wasVisible && isVisible;

                  return (
                    <motion.div
                      key={entity.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={
                        isLoading
                          ? {}
                          : isVisible
                          ? {
                              opacity: 1,
                              scale: 1,
                              transition: { duration: 0.5 },
                            }
                          : {
                              opacity: 0,
                              scale: 0.8,
                              transition: { duration: 0.5 },
                            }
                      }
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5 }}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                      className="relative flex-shrink-0 aspect-square w-12 sm:w-14 rounded-md overflow-hidden"
                    >
                      <div
                        className={`absolute inset-0 ${
                          entity.useRarityBg
                            ? getRarityColor(entity.rarity)
                            : `bg-gradient-to-br ${entity.bgGradient}`
                        } flex items-center justify-center`}
                      >
                        <div className="w-3/4 h-3/4 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden">
                          <img
                            src={entity.image}
                            alt={entity.name}
                            className="w-full h-full object-contain p-1 mix-blend-multiply"
                            style={{ filter: 'brightness(1.1) contrast(1.1)' }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Row 3 - scrollLeft = 115 */}
            <div
              ref={rowRefs.current[2]}
              className="flex overflow-x-auto gap-2 sm:gap-3 scrollbar-hide"
              style={{ scrollBehavior: "smooth" }}
            >
              <AnimatePresence>
                {row3Entities.map((entity) => {
                  const isVisible = visibleIds.includes(entity.id);
                  const wasVisible = previousVisibleIds.includes(entity.id);
                  const justReappeared = !wasVisible && isVisible;

                  return (
                    <motion.div
                      key={entity.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={
                        isLoading
                          ? {}
                          : isVisible
                          ? {
                              opacity: 1,
                              scale: 1,
                              transition: { duration: 0.5 },
                            }
                          : {
                              opacity: 0,
                              scale: 0.8,
                              transition: { duration: 0.5 },
                            }
                      }
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5 }}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                      className="relative flex-shrink-0 aspect-square w-12 sm:w-14 rounded-md overflow-hidden"
                    >
                      <div
                        className={`absolute inset-0 ${
                          entity.useRarityBg
                            ? getRarityColor(entity.rarity)
                            : `bg-gradient-to-br ${entity.bgGradient}`
                        } flex items-center justify-center`}
                      >
                        <div className="w-3/4 h-3/4 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden">
                          <img
                            src={entity.image}
                            alt={entity.name}
                            className="w-full h-full object-contain p-1 mix-blend-multiply"
                            style={{ filter: 'brightness(1.1) contrast(1.1)' }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 2 }}
              className="text-center mt-3 text-gray-400 text-xs italic"
            ></motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssemblyOfGods;