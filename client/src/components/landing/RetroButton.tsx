import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface RetroButtonProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export const RetroButton: React.FC<RetroButtonProps> = ({
  children,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  onClick,
  className = ''
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25',
    secondary: 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-pink-500/25',
    accent: 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-gray-900 shadow-yellow-500/25'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      whileHover={{ 
        scale: 1.05,
        boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)',
        rotateX: -5
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        group relative font-mono font-bold rounded-lg shadow-2xl transition-all duration-300 
        border border-white/20 backdrop-blur-sm overflow-hidden
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Animated background pattern */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }}
      />

      {/* Button content */}
      <div className="relative z-10 flex items-center justify-center space-x-2">
        {Icon && (
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
        )}
        <span className="tracking-wider uppercase">{children}</span>
      </div>

      {/* Glowing edges */}
      <div className="absolute inset-0 rounded-lg border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/50 rounded-tl-lg" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/50 rounded-br-lg" />
    </motion.button>
  );
};