import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 flex items-center justify-center bg-white dark:bg-[#030303] z-[9999]"
  >
    <div className="flex flex-col items-center">
      {/* Minimalist Progress Container */}
      <div className="w-48 h-[2px] bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
        <motion.div
          className="absolute inset-0 bg-indigo-600 dark:bg-indigo-400"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      
      {/* Subtle Text */}
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-4 text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-[0.3em] uppercase"
      >
        Loading
      </motion.span>
    </div>
  </motion.div>
);

export default LoadingIndicator;
