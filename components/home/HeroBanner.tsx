'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';

export default function HeroBanner() {
  const { siteSettings } = useProducts();
  const slides = siteSettings.banners.heroSlides;
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto rotate slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[580px] lg:min-h-[660px] flex items-center">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Background Image with Dark Vignette & Gradient */}
          <div className="absolute inset-0">
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-[8000ms] ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
          </div>

          {/* Hero Content */}
          <div className="container mx-auto px-4 lg:px-6 h-full flex items-center relative z-20">
            <div className="max-w-2xl space-y-6 pt-12 pb-16">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 backdrop-blur-md text-xs font-black uppercase tracking-widest animate-fade-in">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{slide.badge}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.08] text-white">
                {slide.title}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
                {slide.subtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href={slide.buttonLink || '/shop'}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2.5 active:scale-95 group"
                >
                  <span>{slide.buttonText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {slide.button2Text && (
                  <Link
                    href={slide.button2Link || '/shop?filter=sale'}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md font-bold text-sm px-7 py-4 rounded-2xl transition-all active:scale-95"
                  >
                    {slide.button2Text}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Navigation Arrows */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 right-6 lg:right-12 z-20 flex items-center gap-3">
          <button
            onClick={prevSlide}
            className="w-12 h-12 rounded-full bg-slate-900/80 hover:bg-white hover:text-slate-900 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="w-12 h-12 rounded-full bg-slate-900/80 hover:bg-white hover:text-slate-900 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-6 lg:left-12 z-20 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
