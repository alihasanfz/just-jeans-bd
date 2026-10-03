'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Category } from '@/types';

interface CategoryShowcaseProps {
  categories: Category[];
}

export default function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  return (
    <section className="py-16 lg:py-24 bg-slate-50/50">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">
              Curated Denim Fits
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight uppercase">
              Shop by Category
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            From tailored modern slim cuts to relaxed streetwear baggies, find your signature fit engineered with premium fabrics.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${encodeURIComponent(category.name)}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] bg-slate-900 shadow-md hover:shadow-xl transition-all duration-500"
            >
              {/* Image */}
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-300 group-hover:from-slate-950/95" />

              {/* Tag pill */}
              <div className="absolute top-4 left-4">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-900 px-2.5 py-1 rounded-full shadow-sm">
                  {category.gender.toUpperCase()}
                </span>
              </div>

              {/* Hover Arrow */}
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <ArrowUpRight className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="text-lg font-black text-white leading-snug tracking-tight group-hover:text-blue-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-1 font-normal opacity-90">
                  {category.description}
                </p>
                <span className="text-[11px] font-bold text-blue-400 mt-2 block">
                  {category.itemCount} Designs Available
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
