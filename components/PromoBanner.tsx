
import React, { useState, useEffect } from 'react';
import { PromoBannerSlide } from '../types';

interface PromoBannerProps {
  slides: PromoBannerSlide[];
}

const PromoBanner: React.FC<PromoBannerProps> = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Only start the timer if there's more than one slide to cycle through
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // If there are no slides, don't render anything
  if (slides.length === 0) {
    return null;
  }
  
  const slide = slides[currentSlide];

  // A fallback in case the current slide index is out of bounds
  if (!slide) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg h-56 my-8 text-white flex items-center p-8 group">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-700 animate-[gradient-animation_15s_ease_infinite]"></div>
        <style>{`
          @keyframes gradient-animation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          div[class*="bg-gradient-to-tr"] {
            background-size: 200% 200%;
          }
        `}</style>
      </div>
      
      {/* Exclusive Tag */}
      <div className="absolute top-0 right-0 bg-lime-300 text-black font-bold text-xs px-4 py-1.5 rounded-bl-xl tracking-wider">
        EXCLUSIVE
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <h2 className="text-4xl font-black tracking-tighter drop-shadow-md">{slide.title}</h2>
        <p className="text-xl font-semibold mt-1 opacity-90 drop-shadow-sm">{slide.subtitle}</p>
        <div className="mt-5 bg-black/20 backdrop-blur-sm inline-block px-5 py-2 rounded-full border border-white/20">
          <p className="text-sm font-bold tracking-widest">{slide.code}</p>
        </div>
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
            {slides.map((_, index) => (
            <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`}
                aria-label={`Go to slide ${index + 1}`}
            />
            ))}
        </div>
      )}
    </div>
  );
};

export default PromoBanner;
