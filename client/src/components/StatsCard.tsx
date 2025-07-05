import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  value: string;
  label: string;
  delay?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({ value, label, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, delay: delay + 0.2, type: "spring" }}
        className="relative mb-2"
      >
        <div className="text-3xl md:text-4xl font-bold font-mono text-cyan-400 relative z-10">
          {value}
        </div>
        <div className="absolute inset-0 text-3xl md:text-4xl font-bold font-mono text-cyan-400 blur-lg opacity-30">
          {value}
        </div>
      </motion.div>
      <div className="text-xs md:text-sm text-gray-400 font-mono tracking-wider">
        {label}
      </div>
      <motion.div
        className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-2"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: delay + 0.5 }}
      />
    </motion.div>
  );
};
