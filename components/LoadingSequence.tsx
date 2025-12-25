'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  { text: "Resolving ENS...", icon: "🔍" },
  { text: "Querying Base Node...", icon: "🌐" },
  { text: "Scanning Transaction History...", icon: "📜" },
  { text: "Calculating Block Timestamps...", icon: "⏱️" },
  { text: "Verifying Genesis Proof...", icon: "✅" },
  { text: "Generating Flex Card...", icon: "🎴" }
];

export const LoadingSequence: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMsgIndex((prev) => {
        const next = (prev + 1) % MESSAGES.length;
        return next;
      });
    }, 1200);
    
    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 50);
    
    return () => clearInterval(progressInterval);
  }, []);

  return (
    <motion.div 
      className="flex flex-col items-center justify-center space-y-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated Logo/Spinner */}
      <div className="relative w-20 h-20">
        {/* Outer rotating ring */}
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-dashed border-base-blue/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Middle spinning ring */}
        <motion.div 
          className="absolute inset-2 rounded-full border-2 border-transparent border-t-base-blue border-r-base-blue/50"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner pulsing circle */}
        <motion.div 
          className="absolute inset-4 rounded-full bg-gradient-to-br from-base-blue/30 to-purple-500/20"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        
        {/* Center icon */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          key={msgIndex}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
        >
          <span className="text-2xl">{MESSAGES[msgIndex].icon}</span>
        </motion.div>
        
        {/* Glow effect */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-base-blue/20 blur-xl"
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [0.8, 1.1, 0.8]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      
      {/* Message with animation */}
      <div className="h-8 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span 
            key={msgIndex}
            className="text-sm font-mono text-base-blue uppercase tracking-widest text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {MESSAGES[msgIndex].text}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-base-blue via-purple-500 to-base-blue rounded-full"
          style={{ 
            width: `${progress}%`,
          }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {MESSAGES.map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index === msgIndex 
                ? 'bg-base-blue shadow-[0_0_8px_rgba(0,82,255,0.6)]' 
                : index < msgIndex 
                  ? 'bg-base-blue/50' 
                  : 'bg-white/20'
            }`}
            animate={{
              scale: index === msgIndex ? 1.2 : 1,
            }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>

      {/* Subtle hint */}
      <motion.p 
        className="text-gray-500 text-[10px] uppercase tracking-wider"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Analyzing blockchain data...
      </motion.p>
    </motion.div>
  );
};
