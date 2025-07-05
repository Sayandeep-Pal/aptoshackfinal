import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const Logo: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 1.2, type: "spring", stiffness: 80 }}
      className="mb-12"
    >
      <div className="relative w-24 h-24 mx-auto">
        {/* Main logo shape */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl rotate-45 shadow-2xl"
          animate={{ 
            boxShadow: [
              "0 25px 50px rgba(6, 182, 212, 0.3)",
              "0 25px 50px rgba(6, 182, 212, 0.6)",
              "0 25px 50px rgba(6, 182, 212, 0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Inner content */}
        <div className="absolute inset-3 bg-black rounded-xl flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-cyan-400" />
        </div>
        
        {/* Corner decorations */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-xl" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br-xl" />
        
        {/* Floating particles around logo */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            animate={{
              x: [0, Math.cos(i * 60 * Math.PI / 180) * 40],
              y: [0, Math.sin(i * 60 * Math.PI / 180) * 40],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              delay: i * 0.3,
              repeat: Infinity,
            }}
            style={{
              left: '50%',
              top: '50%',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
