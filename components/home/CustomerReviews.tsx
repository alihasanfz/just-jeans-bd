'use client';

import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';

export default function CustomerReviews() {
  const { siteSettings } = useProducts();
  const reviewsData = siteSettings.customerReviews || {
    badge: 'VERIFIED CUSTOMER FEEDBACK',
    title: 'LOVED ACROSS BANGLADESH',
    subtitle: 'Over 15,000+ pairs delivered nationwide with a 4.9/5 satisfaction rate.',
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
    <section className="py-16 lg:py-24 bg-slate-50/70 border-y border-slate-200/60">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1 text-xs font-black text-blue-600 uppercase tracking-widest mb-2">
            <span>{reviewsData.badge}</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight uppercase mb-3">
            {reviewsData.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {reviewsData.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div>
                {/* Stars & Quote */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-200" />
                </div>

                <p className="text-sm text-slate-700 leading-relaxed italic mb-5">
                  "{r.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <span>{r.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <span className="text-[11px] text-slate-400">{r.city}</span>
                </div>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                  Verified Purchase
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
