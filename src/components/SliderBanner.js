'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { api } from '../hooks/useApi';
import useStore from '../store/useStore';
import { translations } from '../utils/translations';

const SEEDED_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200'
];

export default function SliderBanner() {
  const { language } = useStore();
  const t = translations[language] || translations['bn'];

  const { data: sliders = [], isLoading } = useQuery({
    queryKey: ['sliders'],
    queryFn: api.getSliders
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  // Map translations to active seeded fallbacks if api yields empty list
  const fallbackSlidersMapped = t.fallbackSliders.map((item, index) => ({
    title: item.title,
    subtitle: item.subtitle,
    imageUrl: SEEDED_FALLBACK_IMAGES[index],
    actionUrl: index === 0 ? '/circulars' : index === 1 ? '#appointment-form' : '#tour-packages'
  }));

  const activeSliders = sliders.length > 0 ? sliders : fallbackSlidersMapped;

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % activeSliders.length);
  }, [activeSliders.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + activeSliders.length) % activeSliders.length);
  }, [activeSliders.length]);

  useEffect(() => {
    if (activeSliders.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [currentIndex, activeSliders, handleNext]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 }
      }
    })
  };

  const activeSlide = activeSliders[currentIndex];

  // Resolve base prefix for image URL if it's uploaded locally
  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('/') ? `http://localhost:5000${url}` : url;
  };

  return (
    <div className="relative h-[550px] md:h-[650px] w-full overflow-hidden bg-teal-950">
      
      {/* Slider Slides Container */}
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full flex items-center"
          >
            {/* Background Image with overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
              style={{ backgroundImage: `url(${getImageUrl(activeSlide.imageUrl)})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-950/90 via-teal-950/75 to-transparent" />
            
            {/* Slider Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 w-full text-white">
              <div className="max-w-2xl space-y-6">
                
                {/* Decorative Pill */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center px-4 py-1.5 bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-xs font-semibold rounded-full uppercase tracking-wider backdrop-blur-sm"
                >
                  {t.sliderTagline}
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-serif"
                >
                  {activeSlide.title}
                </motion.h1>

                {/* Description Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-base md:text-lg text-slate-200 leading-relaxed font-light"
                >
                  {activeSlide.subtitle}
                </motion.p>

                {/* Action CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="pt-4"
                >
                  <a
                    href={activeSlide.actionUrl}
                    className="inline-flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium curvy-button shadow-lg shadow-emerald-950/30 transform hover:-translate-y-0.5"
                  >
                    <span>{t.sliderContactBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </motion.div>

              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      {activeSliders.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-35 p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all backdrop-blur-sm focus:outline-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-35 p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all backdrop-blur-sm focus:outline-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-35 flex space-x-2.5">
            {activeSliders.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-8 bg-emerald-400' : 'w-2.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Curvy Bottom Section SVG overlay */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-[60px] text-teal-50 fill-current"
        >
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V30.28C1122.4,56.55,1051.81,110.19,985.66,92.83Z"></path>
        </svg>
      </div>

    </div>
  );
}
