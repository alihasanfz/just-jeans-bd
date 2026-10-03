'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';

export default function PromoBanner() {
  const { siteSettings } = useProducts();
  const banner = siteSettings.promoBanner || {
    badge: 'LIMITED TIME OFFER',
    title: 'UP TO 30% OFF ALL PREMIUM DENIM',
    description: 'Use promo code JEANS10 at checkout for an instant extra 10% discount on all orders over ৳1,500. Free delivery included for orders above ৳2,500.',
    couponCode: 'JEANS10',
    buttonText: 'Claim Discount Now',
    buttonLink: '/shop?filter=sale',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
    imageTag: 'SIGNATURE FIT COLLECTION',
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white shadow-2xl p-8 lg:p-14 border border-blue-900/50">
          {/* Background Denim Graphic Overlay */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{banner.badge}</span>
              </div>

              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight">
                {banner.title}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
                {banner.description.includes(banner.couponCode) ? (
                  <>
                    {banner.description.split(banner.couponCode)[0]}
                    <strong className="text-white underline font-mono text-base">{banner.couponCode}</strong>
                    {banner.description.split(banner.couponCode)[1]}
                  </>
                ) : (
                  banner.description
                )}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href={banner.buttonLink || '/shop?filter=sale'}
                  className="bg-white hover:bg-slate-100 text-slate-950 font-black text-sm px-8 py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 group"
                >
                  <span>{banner.buttonText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Cash on Delivery Available</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex justify-end relative">
              <div className="relative w-80 aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src={banner.imageUrl || 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80'}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                {banner.imageTag && (
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
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
