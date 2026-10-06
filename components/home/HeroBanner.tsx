'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';

interface HeroSlideData {
  id: string;
  badge: string;
  titlePart1: string;
  titleHighlight: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  button2Text: string;
  button2Link: string;
  imageUrl: string;
}

const HERO_SLIDES: HeroSlideData[] = [
  {
    id: 'slide-1',
    badge: 'PREMIUM DENIM COLLECTION',
    titlePart1: 'STREET CULTURE',
    titleHighlight: 'BAGGY FITS',
    subtitle: 'Heavyweight denim. Relaxed fit. Real street style. Made for everyday.',
    buttonText: 'SHOP NOW',
    buttonLink: '/shop?fit=Baggy+Fit',
    button2Text: 'VIEW ALL STYLES',
    button2Link: '/shop',
    imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 'slide-2',
    badge: 'TIMELESS CLASSICS 2026',
    titlePart1: 'SIGNATURE RAW',
    titleHighlight: 'VINTAGE WASH',
    subtitle: 'Authentic 13.5oz Turkish ring-spun denim with heritage selvedge detail.',
    buttonText: 'EXPLORE RAW',
    buttonLink: '/shop?filter=vintage',
    button2Text: 'MEN COLLECTION',
    button2Link: '/shop?gender=men',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 'slide-3',
    badge: 'WOMEN EDIT 2026',
    titlePart1: 'HIGH-RISE',
    titleHighlight: 'WIDE LEG',
    subtitle: 'Elevated silhouette designed for effortless comfort and sharp street poise.',
    buttonText: 'SHOP WOMEN',
    buttonLink: '/shop?gender=women',
    button2Text: 'STYLE GUIDE',
    button2Link: '/shop?fit=Wide+Leg',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1400&q=85',
  },
];

export default function HeroBanner() {
  const { siteSettings } = useProducts();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  const activeSlide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative w-full overflow-hidden bg-[#070b14] text-white min-h-[580px] lg:min-h-[640px] xl:min-h-[680px] flex items-center select-none">
      {/* Background Slides */}
      {HERO_SLIDES.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image with Dark Vignette */}
            <img
              src={slide.imageUrl}
              alt={slide.titlePart1}
              className="w-full h-full object-cover object-right lg:object-center transform scale-105 transition-transform duration-[8000ms] ease-out"
            />
            {/* Gradient Mask matching Image 2 */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-[#070b14]/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-transparent to-transparent" />
          </div>
        );
      })}

      {/* Neon Graffiti Cursive Sign on the Right ("Denim Never Goes Out of Style") */}
      <div className="hidden lg:block absolute right-16 xl:right-28 top-20 z-20 pointer-events-none opacity-85">
        <div className="font-serif italic text-3xl xl:text-4xl text-sky-200 drop-shadow-[0_0_15px_rgba(56,189,248,0.7)] rotate-[-6deg] tracking-wide leading-tight">
          Denim Never
          <br />
          <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] text-4xl xl:text-5xl font-black">
            Goes Out
          </span>
          <br />
          <span className="text-sky-300 drop-shadow-[0_0_15px_rgba(56,189,248,0.8)] text-2xl font-light">
            of Style
          </span>
        </div>
      </div>

      {/* Navigation Arrows on Screen Edges */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-105"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-105"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 sm:px-12 lg:px-20 relative z-20 py-16">
        <div className="max-w-2xl space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-widest backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>{activeSlide.badge}</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[1.05] font-display text-white drop-shadow-xl">
            {activeSlide.titlePart1}
            <br />
            <span className="text-[#38bdf8] drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
              {activeSlide.titleHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
            {activeSlide.subtitle}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href={activeSlide.buttonLink}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider px-7 py-3.5 rounded-full shadow-lg shadow-blue-600/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>{activeSlide.buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={activeSlide.button2Link}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md font-bold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-full transition-all hover:scale-105 active:scale-95"
            >
              <span>{activeSlide.button2Text}</span>
            </Link>
          </div>

          {/* Floating Trust Badges Container matching Image 2 */}
          <div className="pt-6">
            <div className="inline-flex flex-wrap items-center gap-4 sm:gap-6 p-3 sm:px-6 sm:py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-white block leading-tight">Premium Quality</span>
                  <span className="text-[10px] text-slate-400">Denim Fabric</span>
                </div>
              </div>

              <div className="hidden sm:block w-px h-6 bg-white/10" />

              <div className="flex items-center gap-2 text-xs">
                <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-white block leading-tight">Free Delivery</span>
                  <span className="text-[10px] text-slate-400">Across Bangladesh</span>
                </div>
              </div>

              <div className="hidden sm:block w-px h-6 bg-white/10" />

              <div className="flex items-center gap-2 text-xs">
                <RotateCcw className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-white block leading-tight">Easy Return</span>
                  <span className="text-[10px] text-slate-400">7 Days Policy</span>
                </div>
              </div>

              <div className="hidden sm:block w-px h-6 bg-white/10" />

              <div className="flex items-center gap-2 text-xs">
                <Lock className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-white block leading-tight">Secure Payment</span>
                  <span className="text-[10px] text-slate-400">bKash, Nagad, Card</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`transition-all duration-300 rounded-full ${
              i === currentSlide
                ? 'w-6 h-2 bg-blue-500'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
