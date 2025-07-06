import React from 'react';
import { motion } from 'framer-motion';

export const FloatingShapes: React.FC = () => {
  const shapes = [
    { id: 1, size: 'w-20 h-20', color: 'bg-gradient-to-br from-cyan-500 to-blue-600', x: '10%', y: '20%' },
    { id: 2, size: 'w-16 h-16', color: 'bg-gradient-to-br from-purple-500 to-pink-600', x: '85%', y: '15%' },
    { id: 3, size: 'w-24 h-24', color: 'bg-gradient-to-br from-emerald-500 to-teal-600', x: '15%', y: '70%' },
    { id: 4, size: 'w-12 h-12', color: 'bg-gradient-to-br from-orange-500 to-red-600', x: '80%', y: '75%' },
    { id: 5, size: 'w-18 h-18', color: 'bg-gradient-to-br from-indigo-500 to-purple-600', x: '50%', y: '10%' },
    { id: 6, size: 'w-14 h-14', color: 'bg-gradient-to-br from-pink-500 to-rose-600', x: '90%', y: '45%' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className={`absolute ${shape.size} ${shape.color} rounded-lg opacity-20 blur-sm`}
          style={{ left: shape.x, top: shape.y }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8 + shape.id,
            repeat: Infinity,
            ease: "easeInOut",
            delay: shape.id * 0.5,
          }}
        />
      ))}
    </div>
  );
};