'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Tag } from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';

export default function PromoBanner() {
  const { siteSettings } = useProducts();
  const promo = siteSettings?.promoBanner;

  const badge = promo?.badge || 'LIMITED TIME OFFER';
  const title = promo?.title || 'UP TO 30% OFF';
  const subtitle = promo?.subtitle || 'ALL PREMIUM DENIM';
  const description = promo?.description || 'Upgrade your wardrobe with our exclusive denim collection.';
  const couponCode = promo?.couponCode;
  const buttonText = promo?.buttonText || 'SHOP NOW';
  const buttonLink = promo?.buttonLink || '/shop?filter=sale';
  const imageUrl1 = promo?.imageUrl || 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80';
  const imageUrl2 = promo?.imageUrl2 || 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80';
  const imageTag = promo?.imageTag || 'Good Jeans\nGood Vibes';

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#09142b] via-[#0d1d3d] to-[#1a1130] text-white shadow-2xl p-8 sm:p-12 lg:p-16 border border-blue-500/20">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />
          <div className="absolute top-0 right-1/3 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black uppercase tracking-wider border border-blue-400/30 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>{badge}</span>
                </div>

                {couponCode && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-400/30">
                    <Tag className="w-3 h-3 text-emerald-400" />
                    <span>CODE: {couponCode}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                  {title}
                </h3>
                {subtitle && (
                  <h4 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-sky-400">
                    {subtitle}
                  </h4>
                )}
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg font-normal">
                {description}
              </p>

              <div className="pt-2">
                <Link
                  href={buttonLink}
                  className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider px-8 py-4 rounded-full shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Visual Imagery matching Image 2 */}
            <div className="lg:col-span-5 flex items-center justify-center lg:justify-end gap-4 relative">
              {/* Stack of folded jeans */}
              <div className="relative w-40 sm:w-48 aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15 transform -rotate-3 hover:rotate-0 transition-transform">
                <img
                  src={imageUrl1}
                  alt="Folded Denim Jeans"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Denim model portrait with neon text */}
              <div className="relative w-44 sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 transform rotate-2 hover:rotate-0 transition-transform">
                <img
                  src={imageUrl2}
                  alt="Denim Model"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                  <span className="font-serif italic text-white text-xs drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] leading-tight whitespace-pre-line">
                    {imageTag}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
