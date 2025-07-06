import React from 'react';
import { motion } from 'framer-motion';

interface Block {
  id: number;
  size: number;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  color: string;
  speed: number;
  depth: number;
}

const colors = [
  'bg-gradient-to-br from-pink-500/20 to-purple-600/20',
  'bg-gradient-to-br from-cyan-400/20 to-blue-500/20',
  'bg-gradient-to-br from-yellow-400/20 to-orange-500/20',
  'bg-gradient-to-br from-green-400/20 to-emerald-500/20',
  'bg-gradient-to-br from-purple-500/20 to-indigo-600/20',
  'bg-gradient-to-br from-red-400/20 to-pink-500/20',
];

const generateBlocks = (count: number): Block[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 120 + 40,
    x: Math.random() * 100,
    y: Math.random() * 100,
    rotation: Math.random() * 360,
    opacity: Math.random() * 0.4 + 0.2,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: Math.random() * 0.5 + 0.2,
    depth: Math.random() * 3 + 1,
  }));
};

const AnimatedBlock: React.FC<{ block: Block }> = ({ block }) => {
  return (
    <motion.div
      className={`absolute ${block.color} backdrop-blur-sm border border-white/10 shadow-lg`}
      style={{
        width: block.size,
        height: block.size,
        left: `${block.x}%`,
        top: `${block.y}%`,
        opacity: block.opacity,
        zIndex: Math.floor(block.depth),
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05)',
        filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.1))',
      }}
      initial={{
        rotate: block.rotation,
        scale: 0,
      }}
      animate={{
        rotate: [block.rotation, block.rotation + 360],
        scale: [0, 1, 0.8, 1],
        x: [0, 50, -30, 0],
        y: [0, -30, 20, 0],
      }}
      transition={{
        duration: 20 / block.speed,
        repeat: Infinity,
        ease: "linear",
        delay: block.id * 0.1,
      }}
    />
  );
};

const GridPattern: React.FC = () => {
  return (
    <div className="absolute inset-0 opacity-8">
      <div className="grid grid-cols-12 gap-4 h-full">
        {Array.from({ length: 144 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.3, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4,
              delay: (i % 12) * 0.2,
              repeat: Infinity,
              repeatDelay: 8
            }}
            className="border border-cyan-400/30 rounded-sm"
            style={{
              boxShadow: '0 0 5px rgba(6, 182, 212, 0.2)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

const ScanLines: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent"
        animate={{
          y: ['-100%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          height: '200%',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6, 182, 212, 0.03) 2px, rgba(6, 182, 212, 0.03) 4px)',
          filter: 'drop-shadow(0 0 2px rgba(6, 182, 212, 0.3))',
        }}
      />
    </div>
  );
};

export const AnimatedBackground: React.FC = () => {
  const [blocks] = React.useState(() => generateBlocks(25));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient - Much darker */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/10 to-black" />
      
      {/* Grid pattern */}
      <GridPattern />
      
      {/* Animated blocks */}
      <div className="absolute inset-0">
        {blocks.map((block) => (
          <AnimatedBlock key={block.id} block={block} />
        ))}
      </div>
      
      {/* Scan lines effect */}
      <ScanLines />
      
      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/70" />
    </div>
  );
};