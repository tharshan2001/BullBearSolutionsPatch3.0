import React, { useState } from "react";
import { FiAlertTriangle, FiX, FiInfo } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Notice = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed top-11 right-4 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="bg-gray-500/90 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-4 pr-10 shadow-lg max-w-xs"
          >
            <div className="flex items-start">
              <FiAlertTriangle className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-400 mb-1">
                  Important Notice
                </h3>
                <p className="text-sm text-yellow-300">
                  All Withdrwals & Deposits Processing typically takes 1-3 working
                  days.Withdrawals will incur a 5% fee. Please ensure all
                  details are correct before submitting.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 p-1 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-full transition-all duration-200"
              aria-label="Close notice"
            >
              <FiX size={16} />
            </button>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-full transition-all duration-200 shadow-md bg-white/10 backdrop-blur-sm"
            aria-label="Show notice"
          >
            <FiInfo size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notice;
