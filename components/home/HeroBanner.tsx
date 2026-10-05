'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  ShieldCheck,
  Truck,
  Star,
  Layers,
  Compass,
} from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';

export default function HeroBanner() {
  const { siteSettings } = useProducts();
  const slides = siteSettings?.banners?.heroSlides || [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  // 3D Parallax & Tilt state
  const [tilt, setTilt] = useState({ x: 0, y: 0, px: 50, py: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // Auto rotate slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // 3D Mouse Movement handler
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalizing between -1 and 1
    const xPct = (x / rect.width) * 2 - 1;
    const yPct = (y / rect.height) * 2 - 1;

    // Tilt limits: Max 12 deg rotation for natural 3D depth
    const rotateY = xPct * 10;
    const rotateX = -yPct * 10;

    setTilt({
      x: rotateX,
      y: rotateY,
      px: (x / rect.width) * 100,
      py: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, px: 50, py: 50 });
  };

  if (!slides || slides.length === 0) return null;

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center select-none"
      style={{
        perspective: '1400px',
      }}
    >
      {/* 3D Ambient Neon Flare & Glow Effects */}
      <div
        className="absolute pointer-events-none transition-transform duration-700 ease-out z-10 w-[550px] h-[550px] rounded-full blur-[140px] opacity-25"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, #6366f1 50%, transparent 70%)',
          left: `${tilt.px - 25}%`,
          top: `${tilt.py - 25}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/20 to-rose-500/10 rounded-full blur-[120px] pointer-events-none z-10" />

      {/* 3D Floating Particles Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-10" />

      {/* Slides Deck with 3D Depth Transforms */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;

        return (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              isActive
                ? 'opacity-100 scale-100 z-20 pointer-events-auto'
                : 'opacity-0 scale-95 z-0 pointer-events-none'
            }`}
            style={{
              transformStyle: 'preserve-3d',
              transform: isActive
                ? `rotateX(${tilt.x * 0.4}deg) rotateY(${tilt.y * 0.4}deg)`
                : 'scale(0.95)',
              transition: isHovered
                ? 'transform 0.15s ease-out, opacity 0.8s ease-in-out'
                : 'transform 0.8s ease-out, opacity 0.8s ease-in-out',
            }}
          >
            {/* Background 3D Layer with Dynamic Parallax Shift */}
            <div
              className="absolute inset-0 transition-transform duration-300 ease-out overflow-hidden"
              style={{
                transform: `scale(1.1) translate(${tilt.y * -0.6}px, ${tilt.x * 0.6}px) translateZ(-40px)`,
              }}
            >
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover object-center transform transition-transform duration-[10000ms] ease-out scale-105"
              />
              
              {/* Cinematic Vignettes */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/60" />
              
              {/* Dynamic 3D Glare Sheet */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  background: `linear-gradient(${120 + tilt.y * 2}deg, rgba(255,255,255,0.2) 0%, transparent 60%)`,
                }}
              />
            </div>

            {/* Content Container (Layer with forward 3D translate) */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-30">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full py-16">
                
                {/* Left Column: 3D Typography & CTA (7 cols) */}
                <div
                  className="lg:col-span-7 xl:col-span-7 space-y-6"
                  style={{
                    transform: `translateZ(50px) translate(${tilt.y * 0.8}px, ${tilt.x * -0.8}px)`,
                    transition: isHovered ? 'transform 0.15s ease-out' : 'transform 0.8s ease-out',
                  }}
                >
                  {/* 3D Floating Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 backdrop-blur-xl text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{slide.badge || 'PREMIUM 3D DENIM COLLECTION'}</span>
                  </div>

                  {/* Main Title with 3D Depth Typography */}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.06] text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal drop-shadow-md">
                    {slide.subtitle}
                  </p>

                  {/* CTA Buttons with 3D Hover Lift */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      href={slide.buttonLink || '/shop'}
                      className="relative group overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider px-8 py-4 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 border border-blue-400/40"
                      style={{
                        transform: 'translateZ(25px)',
                      }}
                    >
                      <span className="relative z-10">{slide.buttonText || 'EXPLORE COLLECTION'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform relative z-10" />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </Link>

                    {slide.button2Text && (
                      <Link
                        href={slide.button2Link || '/shop?filter=sale'}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-xl font-bold text-sm uppercase tracking-wider px-7 py-4 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg hover:border-white/40"
                        style={{
                          transform: 'translateZ(15px)',
                        }}
                      >
                        <Flame className="w-4 h-4 text-rose-400" />
                        <span>{slide.button2Text}</span>
                      </Link>
                    )}
                  </div>

                  {/* Micro Trust Pills */}
                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-300">
                    <div className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                      <Truck className="w-3.5 h-3.5 text-blue-400" />
                      <span>24-48h Delivery</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>100% Cotton Weave</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>4.9★ Rated</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: 3D Holographic Floating Showcase Card (5 cols) */}
                <div className="hidden lg:flex lg:col-span-5 justify-center items-center relative">
                  <div
                    className="relative w-full max-w-sm rounded-3xl p-6 bg-slate-900/75 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-200"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: `translateZ(75px) rotateX(${tilt.x * -0.8}deg) rotateY(${tilt.y * -0.8}deg)`,
                    }}
                  >
                    {/* Holographic Sheen Layer */}
                    <div
                      className="absolute inset-0 rounded-3xl pointer-events-none opacity-40"
                      style={{
                        background: `radial-gradient(circle at ${tilt.px}% ${tilt.py}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
                      }}
                    />

                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
                          <Layers className="w-4 h-4" />
                        </div>
                        <span className="font-black text-xs text-white tracking-widest uppercase">
                          JUST JEANS 3D
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        ORIGINAL FIT
                      </span>
                    </div>

                    {/* Card Body - Live Specs */}
                    <div className="space-y-3.5 mb-5">
                      <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">FABRIC DENSITY</div>
                        <div className="text-sm font-black text-white mt-0.5 flex items-center justify-between">
                          <span>13.5 oz Turkish Ring-Spun Cotton</span>
                          <span className="text-blue-400 text-xs">100% Pure</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">FIT STYLE</div>
                          <div className="text-xs font-black text-white mt-0.5">Ergonomic Cut</div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">WASH GRADE</div>
                          <div className="text-xs font-black text-white mt-0.5">Vintage Stone Wash</div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive 3D Orbiting Floating Chip */}
                    <div
                      className="absolute -top-5 -right-5 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-[11px] px-3.5 py-1.5 rounded-full shadow-[0_10px_20px_rgba(244,63,94,0.4)] flex items-center gap-1.5 border border-white/30 animate-bounce"
                      style={{
                        transform: 'translateZ(40px)',
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>NEW ARRIVAL 2026</span>
                    </div>

                    <div
                      className="absolute -bottom-4 -left-4 bg-slate-950/90 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 border border-blue-500/40 backdrop-blur-xl"
                      style={{
                        transform: 'translateZ(30px)',
                      }}
                    >
                      <Compass className="w-3.5 h-3.5 text-blue-400" />
                      <span>Ready to Ship in Dhaka</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })}

      {/* Slide Navigation Controls (3D Floating Glass) */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 right-6 lg:right-12 z-30 flex items-center gap-3">
          <button
            onClick={prevSlide}
            className="w-12 h-12 rounded-2xl bg-slate-900/80 hover:bg-blue-600 text-white border border-white/20 backdrop-blur-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={nextSlide}
            className="w-12 h-12 rounded-2xl bg-slate-900/80 hover:bg-blue-600 text-white border border-white/20 backdrop-blur-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}

      {/* 3D Modern Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-6 lg:left-12 z-30 flex items-center gap-2.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                idx === currentSlide
                  ? 'w-10 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]'
                  : 'w-2.5 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
