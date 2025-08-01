import { motion } from "framer-motion";

const animations = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.98,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.98,
    filter: "blur(4px)",
  },
};

const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      variants={animations}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1], // smooth cubic bezier
      }}
      style={{
        height: "100%",
        width: "100%",
        willChange: "transform, opacity, filter",
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
