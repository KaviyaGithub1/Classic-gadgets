'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1920&auto=format&fit=crop', // MacBook aesthetic
    title: 'Experience the Future',
    subtitle: 'Apple iPhone 16 Pro',
    price: 'Starting from ₹99,999',
    buttonText: 'Shop Now'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1920&auto=format&fit=crop', // Samsung style
    title: 'Power Meets Innovation',
    subtitle: 'Samsung Galaxy S25 Ultra',
    price: 'Unleash the ultimate performance.',
    buttonText: 'Explore'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1920&auto=format&fit=crop', // Headphones
    title: 'Pure Audio Perfection',
    subtitle: 'Sony WH-1000XM5',
    price: 'Industry-leading noise cancellation.',
    buttonText: 'Listen Now'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1920&auto=format&fit=crop', // MacBook
    title: 'Mind-Blowing Speed',
    subtitle: 'MacBook Pro M3 Max',
    price: 'The ultimate pro laptop.',
    buttonText: 'Buy Now'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1434493789847-2902641492d2?q=80&w=1920&auto=format&fit=crop', // Apple Watch
    title: 'Adventure Awaits',
    subtitle: 'Apple Watch Ultra 2',
    price: 'Rugged. Capable. Essential.',
    buttonText: 'Discover'
  }
];

export const HeroSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, [isHovered]);

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div 
      className="relative w-full h-[450px] sm:h-[500px] lg:h-[650px] overflow-hidden bg-gray-950 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${SLIDES[currentIndex].image})` }}
          />
          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Slide Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
            <motion.h3 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg md:text-xl font-medium text-indigo-300 tracking-wider uppercase mb-2"
            >
              {SLIDES[currentIndex].title}
            </motion.h3>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4"
            >
              {SLIDES[currentIndex].subtitle}
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-xl md:text-2xl text-gray-300 font-light mb-8"
            >
              {SLIDES[currentIndex].price}
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Button 
                size="lg" 
                className="px-10 h-14 text-lg font-semibold rounded-full bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl"
                suppressHydrationWarning={true}
              >
                {SLIDES[currentIndex].buttonText}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button 
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10"
        suppressHydrationWarning={true}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10"
        suppressHydrationWarning={true}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex 
                ? 'w-8 h-2 bg-white' 
                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
            suppressHydrationWarning={true}
          />
        ))}
      </div>
    </div>
  );
};
