import React from 'react';
import { motion } from 'framer-motion';

const pixelArtShapes = [
  // Simple geometric shapes in pixel art style
  '█▀▀▀█',
  '▄▄▄▄▄',
  '█████',
  '▀▀█▀▀',
  '█▄▄▄█',
  '▄█▀█▄',
  '█▀▄▀█',
  '▄▀▀▀▄',
];

interface FloatingElementProps {
  shape: string;
  delay: number;
  duration: number;
  startX: number;
  startY: number;
  color: string;
}

const FloatingElement: React.FC<FloatingElementProps> = ({
  shape,
  delay,
  duration,
  startX,
  startY,
  color
}) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        x: startX, 
        y: startY,
        scale: 0,
        rotate: 0
      }}
      animate={{ 
        opacity: [0, 0.8, 0.9, 0.3],
        x: [startX, startX + (Math.random() - 0.5) * 400],
        y: [startY, startY - 300 - Math.random() * 200],
        scale: [0, 1, 1.2, 0],
        rotate: [0, 180, 360]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 5 + 2,
        ease: "easeInOut"
      }}
      className={`absolute font-mono text-xs ${color} pointer-events-none select-none`}
      style={{ 
        textShadow: '0 0 15px currentColor, 0 0 30px currentColor, 0 0 45px currentColor',
        fontFamily: 'monospace',
        lineHeight: 1,
        whiteSpace: 'pre',
        filter: 'drop-shadow(0 0 8px currentColor)',
      }}
    >
      {/* Main element */}
      <div className="relative">
        {shape}
        {/* Duplicate for enhanced glow effect */}
        <div 
          className="absolute inset-0 blur-sm opacity-60"
          style={{ color: 'inherit' }}
        >
          {shape}
        </div>
        <div 
          className="absolute inset-0 blur-md opacity-40"
          style={{ color: 'inherit' }}
        >
          {shape}
        </div>
      </div>
    </motion.div>
  );
};

export const FloatingElements: React.FC = () => {
  const elements = React.useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      shape: pixelArtShapes[Math.floor(Math.random() * pixelArtShapes.length)],
      delay: Math.random() * 10,
      duration: Math.random() * 8 + 6,
      startX: Math.random() * window.innerWidth,
      startY: window.innerHeight + 50,
      color: [
        'text-cyan-400',
        'text-pink-400', 
        'text-yellow-400',
        'text-green-400',
        'text-purple-400',
        'text-orange-400'
      ][Math.floor(Math.random() * 6)]
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
      {elements.map((element) => (
        <FloatingElement
          key={element.id}
          shape={element.shape}
          delay={element.delay}
          duration={element.duration}
          startX={element.startX}
          startY={element.startY}
          color={element.color}
        />
      ))}
    </div>
  );
};