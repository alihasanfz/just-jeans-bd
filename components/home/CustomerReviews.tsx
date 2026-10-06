'use client';

import React from 'react';
import { Star } from 'lucide-react';

const REVIEWS = [
  {
    id: 'rev-1',
    name: 'Rahim Hossain',
    city: 'Dhaka',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    comment: 'Premium quality denim. Fits perfectly and very comfortable. Highly recommended!',
  },
  {
    id: 'rev-2',
    name: 'Nusrat Jahan',
    city: 'Chittagong',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    comment: 'Fast delivery and exceptional product. Love the style and quality. Will shop again!',
  },
  {
    id: 'rev-3',
    name: 'Tanjim Ahmed',
    city: 'Sylhet',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    comment: 'Best denim store in Bangladesh. Great prices and excellent customer service.',
  },
];

export default function CustomerReviews() {
  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header matching Image 2 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest block mb-2">
              OUR CUSTOMERS LOVE US
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
              Loved Across Bangladesh
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Real reviews from real customers. Join thousands who trust Jeans BD.
            </p>
          </div>

          {/* Aggregate Rating on Top Right */}
          <div className="flex flex-col md:items-end">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                ))}
              </div>
              <span className="text-xl font-black text-slate-900">4.7/5</span>
            </div>
            <span className="text-xs text-slate-400 mt-0.5">Based on 12,540+ reviews</span>
          </div>
        </div>

        {/* 3 Review Cards matching Image 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {r.name}
                    </h3>
                    <span className="text-xs text-slate-400">{r.city}</span>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex text-amber-400 gap-0.5 mb-3">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-400" />
                  ))}
                </div>

                {/* Comment Text */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  "{r.comment}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
