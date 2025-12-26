
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Database, Activity, Clock, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';

const STEPS = [
  { text: "RESOLVING ENS...", icon: Search },
  { text: "QUERYING NODE...", icon: Database },
  { text: "SCANNING HISTORY...", icon: Activity },
  { text: "CALCULATING...", icon: Clock },
  { text: "VERIFYING PROOF...", icon: ShieldCheck },
  { text: "GENERATING CARD...", icon: CreditCard }
];

export const LoadingSequence: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = STEPS[stepIndex].icon;

  return (
    <motion.div 
      className="flex flex-col items-center justify-center space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Central Visual */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Spinner Ring */}
        <motion.div 
          className="absolute inset-0 border-2 border-white/5 rounded-full"
        />
        <motion.div 
          className="absolute inset-0 border-t-2 border-base-blue rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Glow */}
        <div className="absolute inset-0 bg-base-blue/20 blur-2xl rounded-full animate-pulse-slow" />

        {/* Changing Icon */}
        <div className="relative z-10 w-10 h-10 flex items-center justify-center bg-[#0a0a0a] rounded-xl border border-white/10 shadow-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CurrentIcon className="w-5 h-5 text-base-blue" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Text Info */}
      <div className="flex flex-col items-center space-y-3">
        <AnimatePresence mode="wait">
          <motion.p 
            key={stepIndex}
            className="text-sm font-mono text-white tracking-[0.2em] font-bold"
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -5, opacity: 0 }}
          >
            {STEPS[stepIndex].text}
          </motion.p>
        </AnimatePresence>
        
        {/* Progress Bar */}
        <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-base-blue box-shadow-[0_0_10px_rgba(0,82,255,0.5)]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: STEPS.length * 1.2, 
              ease: "linear",
              repeat: Infinity
            }}
          />
        </div>
        
        <p className="text-[10px] text-gray-500 font-mono mt-2">
          EST. TIME: ~5s
        </p>
      </div>
    </motion.div>
  );
};
