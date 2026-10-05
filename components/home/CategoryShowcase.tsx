'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles, Settings } from 'lucide-react';
import { Category } from '@/types';

const FALLBACK_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80';

interface CategoryShowcaseProps {
  categories: Category[];
}

export default function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <section className="py-16 lg:py-24 bg-slate-50/60 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-3 border border-blue-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Denim Silhouettes</span>
            </div>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-slate-950 tracking-tight uppercase font-display">
              Shop by Category
            </h2>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <p className="text-sm text-slate-500 max-w-md md:text-right leading-relaxed">
              From tailored modern slim cuts to relaxed streetwear baggies, find your signature fit engineered with premium Turkish ring-spun fabrics.
            </p>
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors px-2 py-1 rounded-md hover:bg-white border border-transparent hover:border-slate-200"
              title="Admin: Change Category Names & Photos"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Manage Categories</span>
            </Link>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category) => {
            const imgSrc = failedImages[category.id]
              ? FALLBACK_CATEGORY_IMAGE
              : (category.image || FALLBACK_CATEGORY_IMAGE);

            return (
              <Link
                key={category.id}
                href={`/shop?category=${encodeURIComponent(category.name)}`}
                className="group relative rounded-3xl overflow-hidden aspect-[4/5] bg-slate-950 shadow-md hover:shadow-2xl hover:shadow-slate-900/20 transition-all duration-500 hover:-translate-y-1.5"
              >
                {/* Image */}
                <img
                  src={imgSrc}
                  alt={category.name}
                  onError={() => setFailedImages((prev) => ({ ...prev, [category.id]: true }))}
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />

              {/* Multi-stage Cinematic Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent transition-opacity duration-300 group-hover:via-slate-950/20" />

              {/* Tag pill */}
              <div className="absolute top-4 left-4">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/95 backdrop-blur-md text-slate-950 px-3 py-1 rounded-full shadow-sm">
                  {category.gender.toUpperCase()}
                </span>
              </div>

              {/* Hover Floating Action Arrow */}
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-blue-600 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-md">
                <ArrowUpRight className="w-5 h-5" />
              </div>

              {/* Category Info Container */}
              <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6 transition-transform duration-300">
                <h3 className="text-lg lg:text-xl font-black text-white leading-tight tracking-tight group-hover:text-blue-400 transition-colors font-display">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 line-clamp-1 font-normal opacity-90">
                  {category.description}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[11px] font-bold text-blue-400 bg-blue-500/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-blue-400/30">
                    {category.itemCount || 8}+ Styles
                  </span>
                  <span className="text-[11px] text-slate-400 group-hover:text-white transition-colors">
                    Explore &rarr;
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
        </div>
      </div>
    </section>
  );
}
