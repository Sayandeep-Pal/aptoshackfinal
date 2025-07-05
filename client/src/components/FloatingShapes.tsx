import React from 'react';
import { motion } from 'framer-motion';

export const FloatingShapes: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Floating geometric shapes */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-4 h-4 ${
            i % 3 === 0 
              ? 'bg-cyan-400/20' 
              : i % 3 === 1 
              ? 'bg-purple-400/20' 
              : 'bg-pink-400/20'
          } rounded-full`}
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            delay: i * 0.8,
          }}
          style={{
            left: `${10 + (i * 12)}%`,
            top: `${20 + (i * 8)}%`,
          }}
        />
      ))}
      
      {/* Additional floating elements */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`triangle-${i}`}
          className="absolute w-6 h-6 border-2 border-cyan-400/30 rotate-45"
          animate={{
            rotate: [45, 225, 45],
            x: [-20, 20, -20],
            y: [20, -20, 20],
          }}
          transition={{
            duration: 8 + i * 1.5,
            repeat: Infinity,
            delay: i * 1.2,
          }}
          style={{
            right: `${5 + (i * 15)}%`,
            bottom: `${10 + (i * 12)}%`,
          }}
        />
      ))}
    </div>
  );
};
