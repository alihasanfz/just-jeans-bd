'use client';

import React from 'react';
import { Star, Quote, CheckCircle2, ThumbsUp } from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';

export default function CustomerReviews() {
  const { siteSettings } = useProducts();
  const reviewsData = siteSettings.customerReviews || {
    badge: 'VERIFIED CUSTOMER TESTIMONIALS',
    title: 'LOVED ACROSS BANGLADESH',
    subtitle: 'Over 15,000+ pairs delivered nationwide with a 4.9/5 verified satisfaction rate.',
    items: [
      {
        id: '1',
        name: 'Ashfaqur Rahman',
        city: 'Gulshan, Dhaka',
        rating: 5,
        productName: 'Vintage Washed Slim Tapered Jeans',
        comment:
          'The fabric quality is unreal! Usually imported brands charge ৳4000+ for this kind of ring-spun denim with flex stretch. Perfect waist fit and the hand-whiskering is top notch.',
      },
      {
        id: '2',
        name: 'Farzana Chowdhury',
        city: 'Nasirabad, Chattogram',
        rating: 5,
        productName: "Women's High-Rise Wide Leg Jeans",
        comment:
          'I was skeptical about ordering jeans online, but the size chart was 100% accurate. Received in Chattogram within 48 hours via Steadfast Courier. Beautiful drape!',
      },
      {
        id: '3',
        name: 'Mahir Faisal',
        city: 'Uttara, Dhaka',
        rating: 5,
        productName: 'Midnight Black Baggy Skater Jeans',
        comment:
          'Heavyweight rigid denim that stacks perfectly over my Dunks. Deep black color did not bleed during wash. Will definitely order the raw selvedge next.',
      },
    ],
  };

  const reviews = reviewsData.items && reviewsData.items.length > 0 ? reviewsData.items : [];

  return (
    <section className="py-16 lg:py-24 bg-slate-50/70 border-y border-slate-200/70 relative">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-3 border border-blue-100">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{reviewsData.badge}</span>
          </div>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-slate-950 tracking-tight uppercase mb-3 font-display">
            {reviewsData.title}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {reviewsData.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-900/5 hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                {/* Rating Stars & Quote */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-7 h-7 text-slate-200" />
                </div>

                {r.productName && (
                  <div className="text-[11px] font-bold text-blue-600 mb-2.5 truncate">
                    Purchased: {r.productName}
                  </div>
                )}

                <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
                  "{r.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                    {r.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <span>{r.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </div>
                    <span className="text-[11px] text-slate-400">{r.city}</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
