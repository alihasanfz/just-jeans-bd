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
  Play,
  Film,
} from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';
import { parseVideoUrl } from '@/lib/utils/video';
import { HeroSlide } from '@/types';

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    badge: 'PREMIUM DENIM COLLECTION',
    title: 'STREET CULTURE BAGGY FITS',
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
    title: 'SIGNATURE RAW VINTAGE WASH',
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
    title: 'HIGH-RISE WIDE LEG',
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

function getSlideTitle(slide: any) {
  if (slide.titlePart1 && slide.titleHighlight) {
    return { part1: slide.titlePart1, highlight: slide.titleHighlight };
  }
  const fullTitle = slide.title || '';
  if (fullTitle.includes('|')) {
    const [p1, ...rest] = fullTitle.split('|');
    return { part1: p1.trim(), highlight: rest.join(' ').trim() };
  }
  const words = fullTitle.trim().split(/\s+/);
  if (words.length > 2) {
    return {
      part1: words.slice(0, -2).join(' '),
      highlight: words.slice(-2).join(' '),
    };
  }
  if (words.length === 2) {
    return { part1: words[0], highlight: words[1] };
  }
  return { part1: fullTitle, highlight: '' };
}

export default function HeroBanner() {
  const { siteSettings } = useProducts();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = siteSettings?.banners?.heroSlides?.length
    ? siteSettings.banners.heroSlides
    : FALLBACK_SLIDES;

  // Auto rotate slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Keep index within bounds if slide deleted
  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const activeSlide = slides[currentSlide] || slides[0] || FALLBACK_SLIDES[0];
  const { part1, highlight } = getSlideTitle(activeSlide);

  const trustBadges = siteSettings?.trustBadges;

  return (
    <section className="relative w-full overflow-hidden bg-[#070b14] text-white min-h-[580px] lg:min-h-[640px] xl:min-h-[680px] flex items-center select-none">
      {/* Background Slides */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Video or Image with Dark Vignette */}
            {slide.videoUrl ? (
              (() => {
                const info = parseVideoUrl(slide.videoUrl);
                if (info?.type === 'youtube' || info?.type === 'vimeo') {
                  return (
                    <div className="w-full h-full relative overflow-hidden pointer-events-none scale-125">
                      <iframe
                        src={`${info.embedUrl}&controls=0&mute=1&loop=1&playlist=${info.videoId || ''}&background=1`}
                        title={slide.title}
                        className="w-full h-full object-cover scale-150 pointer-events-none"
                        allow="autoplay; encrypted-media"
                      />
                    </div>
                  );
                }
                return (
                  <video
                    src={slide.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover object-center transform scale-105"
                  />
                );
              })()
            ) : (
              <img
                src={slide.imageUrl || 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1400&q=85'}
                alt={slide.title}
                className="w-full h-full object-cover object-right lg:object-center transform scale-105 transition-transform duration-[8000ms] ease-out"
              />
            )}
            {/* Gradient Mask */}
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
      {slides.length > 1 && (
        <>
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
        </>
      )}

      {/* Main Content Area */}
      <div className="container mx-auto px-6 sm:px-12 lg:px-20 relative z-20 py-16">
        <div className="max-w-2xl space-y-6">
          {/* Pill Badge */}
          {activeSlide.badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-widest backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>{activeSlide.badge}</span>
            </div>
          )}

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[1.05] font-display text-white drop-shadow-xl">
            {part1}
            {highlight && (
              <>
                <br />
                <span className="text-[#38bdf8] drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
                  {highlight}
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          {activeSlide.subtitle && (
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
              {activeSlide.subtitle}
            </p>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            {activeSlide.buttonText && (
              <Link
                href={activeSlide.buttonLink || '/shop'}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider px-7 py-3.5 rounded-full shadow-lg shadow-blue-600/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>{activeSlide.buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {activeSlide.button2Text && (
              <Link
                href={activeSlide.button2Link || '/shop'}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md font-bold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-full transition-all hover:scale-105 active:scale-95"
              >
                <span>{activeSlide.button2Text}</span>
              </Link>
            )}
          </div>

          {/* Floating Trust Badges Container matching Image 2 */}
          <div className="pt-6">
            <div className="inline-flex flex-wrap items-center gap-4 sm:gap-6 p-3 sm:px-6 sm:py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-white block leading-tight">
                    {trustBadges?.cottonTitle || 'Premium Quality'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {trustBadges?.cottonSubtitle || 'Denim Fabric'}
                  </span>
                </div>
              </div>

              <div className="hidden sm:block w-px h-6 bg-white/10" />

              <div className="flex items-center gap-2 text-xs">
                <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-white block leading-tight">
                    {trustBadges?.deliveryTitle || 'Free Delivery'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {trustBadges?.deliverySubtitle || 'Across Bangladesh'}
                  </span>
                </div>
              </div>

              <div className="hidden sm:block w-px h-6 bg-white/10" />

              <div className="flex items-center gap-2 text-xs">
                <RotateCcw className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-white block leading-tight">
                    {trustBadges?.exchangeTitle || 'Easy Return'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {trustBadges?.exchangeSubtitle || '7 Days Policy'}
                  </span>
                </div>
              </div>

              <div className="hidden sm:block w-px h-6 bg-white/10" />

              <div className="flex items-center gap-2 text-xs">
                <Lock className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-white block leading-tight">
                    {trustBadges?.paymentTitle || 'Secure Payment'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {trustBadges?.paymentSubtitle || 'bKash, Nagad, Card'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {slides.map((_, i) => (
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
      )}
    </section>
  );
}
