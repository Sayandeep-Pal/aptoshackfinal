import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface RetroCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  glowColor?: string;
}

export const RetroCard: React.FC<RetroCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0,
  glowColor = 'cyan'
}) => {
  const glowColors = {
    cyan: 'shadow-cyan-400/20 hover:shadow-cyan-400/40 border-cyan-400/30 hover:border-cyan-400/60',
    pink: 'shadow-pink-400/20 hover:shadow-pink-400/40 border-pink-400/30 hover:border-pink-400/60',
    yellow: 'shadow-yellow-400/20 hover:shadow-yellow-400/40 border-yellow-400/30 hover:border-yellow-400/60',
    green: 'shadow-green-400/20 hover:shadow-green-400/40 border-green-400/30 hover:border-green-400/60',
  };

  const iconColors = {
    cyan: 'text-cyan-400',
    pink: 'text-pink-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        scale: 1.02,
        rotateY: 5,
        z: 50
      }}
      className={`group relative bg-black/60 backdrop-blur-sm p-8 rounded-lg border-2 ${glowColors[glowColor as keyof typeof glowColors]} transition-all duration-500 shadow-2xl overflow-hidden`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
          }}
        />
      </div>

      {/* Glowing corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-lg" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/50 rounded-br-lg" />

      <div className="relative z-10">
        {/* Icon with glow effect */}
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className={`w-16 h-16 mb-6 ${iconColors[glowColor as keyof typeof iconColors]} relative`}
        >
          <div className={`absolute inset-0 ${iconColors[glowColor as keyof typeof iconColors]} opacity-20 blur-xl`}>
            <Icon className="w-16 h-16" />
          </div>
          <Icon className="w-16 h-16 relative z-10" />
        </motion.div>

        {/* Title with retro styling */}
        <h3 className="text-xl font-bold text-white mb-4 font-mono tracking-wider uppercase">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-300 leading-relaxed text-sm">
          {description}
        </p>

        {/* Animated underline */}
        <motion.div
          className={`h-0.5 bg-gradient-to-r from-${glowColor}-400 to-transparent mt-4 origin-left`}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: delay + 0.3 }}
        />
      </div>

      {/* Hover glow effect */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br from-${glowColor}-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg`}
      />
    </motion.div>
  );
};