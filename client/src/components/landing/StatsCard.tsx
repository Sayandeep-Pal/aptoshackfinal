import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  value: string;
  label: string;
  delay: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({ value, label, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.2, type: "spring", stiffness: 200 }}
        className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2"
      >
        {value}
      </motion.div>
      <div className="text-gray-400 text-sm uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
};