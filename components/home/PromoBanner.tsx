'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Copy, Check } from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';

export default function PromoBanner() {
  const { siteSettings } = useProducts();
  const [copied, setCopied] = useState(false);

  const banner = siteSettings.promoBanner || {
    badge: 'LIMITED TIME OFFER',
    title: 'UP TO 30% OFF ALL PREMIUM DENIM',
    description: 'Use promo code JEANS10 at checkout for an instant extra 10% discount on all orders over ৳1,500. Free delivery included for orders above ৳2,500.',
    couponCode: 'JEANS10',
    buttonText: 'Claim Discount Now',
    buttonLink: '/shop?filter=sale',
    imageUrl: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80',
    imageTag: 'SIGNATURE FIT COLLECTION',
  };

  const handleCopyCode = () => {
    if (banner.couponCode) {
      navigator.clipboard.writeText(banner.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-950 via-slate-950 to-indigo-950 text-white shadow-2xl p-8 sm:p-10 lg:p-16 border border-blue-900/60">
          {/* Subtle Background Glow & Pattern */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1.5px,transparent_1.5px)] [background-size:20px_20px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md shadow-amber-400/20">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{banner.badge}</span>
              </div>

              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight font-display text-white drop-shadow-md">
                {banner.title}
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
                {banner.description}
              </p>

              {/* Coupon Code Pill with Copy Action */}
              {banner.couponCode && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl">
                    <span className="text-xs text-slate-300 font-medium">Coupon:</span>
                    <span className="font-mono font-black text-amber-400 text-sm tracking-wider">
                      {banner.couponCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="ml-1 p-1 hover:bg-white/20 rounded-lg text-slate-300 hover:text-white transition-colors"
                      title="Copy coupon code"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {copied && (
                    <span className="text-xs font-bold text-emerald-400 animate-fade-in">
                      Copied to clipboard!
                    </span>
                  )}
                </div>
              )}

              <div className="pt-3 flex flex-wrap items-center gap-4">
                <Link
                  href={banner.buttonLink || '/shop?filter=sale'}
                  className="bg-white hover:bg-blue-600 hover:text-white text-slate-950 font-black text-sm px-8 py-4 rounded-2xl shadow-xl transition-all duration-300 active:scale-95 flex items-center gap-2 group uppercase tracking-wider"
                >
                  <span>{banner.buttonText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-white/5 px-4 py-3 rounded-2xl border border-white/10 backdrop-blur-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Cash on Delivery & Easy Exchange</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex lg:col-span-5 justify-end relative">
              <div className="relative w-80 aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/15 rotate-2 hover:rotate-0 transition-transform duration-500 group">
                <img
                  src={banner.imageUrl || 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80'}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                {banner.imageTag && (
                  <div className="absolute bottom-5 left-5 right-5 text-center">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-400/30">
                      {banner.imageTag}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
