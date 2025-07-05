import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const location = useLocation();

  // Check if we're on the builder page
  const isBuilderPage = location.pathname === '/builder';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse move handler for builder page
  useEffect(() => {
    if (!isBuilderPage) {
      setIsNavbarVisible(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Show navbar when mouse is near the top (within 100px)
      if (e.clientY <= 100) {
        setIsNavbarVisible(true);
      } else {
        setIsNavbarVisible(false);
      }
    };

    // Initially hide navbar on builder page
    setIsNavbarVisible(false);

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isBuilderPage]);

  const navItems = ['Home', 'Features', 'About', 'Contact'];

  return (
    <nav
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${
        isBuilderPage 
          ? isScrolled 
            ? 'w-[47.5%] max-w-3xl' // Half of 95%
            : 'w-[45%] max-w-2.5xl' // Half of 90%
          : isScrolled 
            ? 'w-[95%] max-w-6xl' 
            : 'w-[90%] max-w-5xl'
      } ${
        isBuilderPage 
          ? isNavbarVisible 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}
    >
      <div
        className={`relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl transition-all duration-500 ${
          isBuilderPage
            ? isScrolled 
              ? 'py-1.5 px-3' // Half of py-3 px-6
              : 'py-2 px-4'   // Half of py-4 px-8
            : isScrolled 
              ? 'py-3 px-6' 
              : 'py-4 px-8'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))',
          boxShadow: '0 25px 45px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)',
        }}
      >
        {/* Enhanced decorative gradient overlay */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10 opacity-60"></div>
        
        <div className="relative flex items-center justify-between">
          {/* Enhanced Logo */}
          <div className="flex items-center space-x-3">
            <div className={`relative rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300 group ${
              isBuilderPage ? 'w-6 h-6' : 'w-10 h-10' // Half size on builder page
            }`}>
              <span className={`text-white font-bold relative z-10 ${
                isBuilderPage ? 'text-sm' : 'text-lg' // Smaller text on builder page
              }`}>R</span>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-300"></div>
            </div>
            <span className={`font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ${
              isBuilderPage ? 'text-base' : 'text-xl' // Smaller text on builder page
            }`}>
              RiseIn
            </span>
          </div>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 relative">
            {navItems.map((item, index) => (
              <button
                key={index}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`relative rounded-2xl text-white font-medium transition-all duration-300 group overflow-hidden ${
                  isBuilderPage ? 'px-3 py-1.5' : 'px-6 py-3' // Half padding on builder page
                }`}
              >
                <span className={`relative z-20 font-semibold tracking-wide ${
                  isBuilderPage ? 'text-sm' : 'text-lg' // Smaller text on builder page
                }`}>{item}</span>
                
                {/* Background layer with smooth transition */}
                <div className={`absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-sm transition-all duration-300 ${
                  hoveredItem === index ? 'opacity-100' : 'opacity-0'
                }`}></div>
                
                {/* Bottom accent line */}
                <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-300 ${
                  isBuilderPage ? 'h-0.25' : 'h-0.5' // Thinner line on builder page
                } ${
                  hoveredItem === index ? 'w-1/2 opacity-100' : 'w-0 opacity-0'
                }`}></div>
              </button>
            ))}
          </div>

          {/* Enhanced CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <div className={`${isBuilderPage ? 'scale-75' : 'scale-100'} transition-transform duration-300`}>
              <WalletSelector />
            </div>
          </div>

          {/* Enhanced Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 hover:bg-white/30 hover:border-white/50 group ${
              isBuilderPage ? 'w-6 h-6' : 'w-10 h-10' // Half size on builder page
            }`}
          >
            <div className={`${isBuilderPage ? 'space-y-0.5' : 'space-y-1.5'}`}>
              <div className={`bg-gray-700 transition-all duration-300 group-hover:bg-purple-600 ${
                isBuilderPage ? 'w-3 h-0.25' : 'w-5 h-0.5' // Half size on builder page
              } ${
                isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}></div>
              <div className={`bg-gray-700 transition-all duration-300 group-hover:bg-purple-600 ${
                isBuilderPage ? 'w-3 h-0.25' : 'w-5 h-0.5' // Half size on builder page
              } ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`}></div>
              <div className={`bg-gray-700 transition-all duration-300 group-hover:bg-purple-600 ${
                isBuilderPage ? 'w-3 h-0.25' : 'w-5 h-0.5' // Half size on builder page
              } ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}></div>
            </div>
          </button>
        </div>

        {/* Enhanced Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0'
          }`}
        >
          <div className={`pb-4 ${isBuilderPage ? 'space-y-1.5' : 'space-y-3'}`}>
            {navItems.map((item, index) => (
              <button
                key={index}
                className={`block w-full text-left rounded-xl text-white font-medium hover:bg-white/20 transition-all duration-300 group relative overflow-hidden ${
                  isBuilderPage ? 'px-2 py-1.5' : 'px-4 py-3' // Half padding on builder page
                }`}
              >
                <span className={`relative z-10 font-semibold tracking-wide ${
                  isBuilderPage ? 'text-sm' : 'text-lg' // Smaller text on builder page
                }`}>{item}</span>
                {/* Hover background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Left accent line */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-0 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full group-hover:h-3/4 transition-all duration-300"></div>
              </button>
            ))}
            <button className={`w-full rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold shadow-lg relative overflow-hidden group ${
              isBuilderPage ? 'mt-2 px-2 py-1.5' : 'mt-4 px-4 py-3' // Half spacing and padding on builder page
            }`}>
              <span className={`relative z-10 tracking-wide ${
                isBuilderPage ? 'text-sm' : 'text-base' // Smaller text on builder page
              }`}>Get Started</span>
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced floating particles effect - smaller on builder page */}
      <div className={`absolute -top-2 -left-2 rounded-full bg-purple-400/30 animate-pulse ${
        isBuilderPage ? 'w-2 h-2' : 'w-4 h-4' // Half size on builder page
      }`}>
        <div className="absolute inset-0 rounded-full bg-purple-400/20 animate-ping"></div>
      </div>
      <div className={`absolute -bottom-2 -right-2 rounded-full bg-blue-400/30 animate-pulse delay-1000 ${
        isBuilderPage ? 'w-1.5 h-1.5' : 'w-3 h-3' // Half size on builder page
      }`}>
        <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping delay-1000"></div>
      </div>
      <div className={`absolute top-1/2 -right-1 rounded-full bg-teal-400/30 animate-pulse delay-500 ${
        isBuilderPage ? 'w-1 h-1' : 'w-2 h-2' // Half size on builder page
      }`}>
        <div className="absolute inset-0 rounded-full bg-teal-400/20 animate-ping delay-500"></div>
      </div>
    </nav>
  );
};

export default Navbar;