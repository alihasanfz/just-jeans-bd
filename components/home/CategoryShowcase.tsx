'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Layers,
  Flame,
  Tag,
  Compass,
  Shirt,
} from 'lucide-react';
import { Category } from '@/types';

interface CategoryShowcaseProps {
  categories?: Category[];
}

const CATEGORY_ITEMS = [
  {
    id: 'cat-mens-jeans',
    name: "Men's Jeans",
    link: '/shop?gender=men',
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=700&q=80',
    icon: ShoppingBag,
  },
  {
    id: 'cat-womens-jeans',
    name: "Women's Jeans",
    link: '/shop?gender=women',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80',
    icon: Sparkles,
  },
  {
    id: 'cat-denim-jackets',
    name: 'Denim Jackets',
    link: '/shop?category=Denim+Jackets',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80',
    icon: Shirt,
  },
  {
    id: 'cat-baggy-fits',
    name: 'Baggy Fits',
    link: '/shop?fit=Baggy+Fit',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=700&q=80',
    icon: Layers,
  },
  {
    id: 'cat-straight-leg',
    name: 'Straight Leg',
    link: '/shop?fit=Straight+Fit',
    image: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=700&q=80',
    icon: Compass,
  },
  {
    id: 'cat-slim-fit',
    name: 'Slim Fit',
    link: '/shop?fit=Slim+Fit',
    image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=700&q=80',
    icon: Tag,
  },
  {
    id: 'cat-cargo-jeans',
    name: 'Cargo Jeans',
    link: '/shop?fit=Cargo+Jeans',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=700&q=80',
    icon: Flame,
  },
  {
    id: 'cat-vintage-collection',
    name: 'Vintage Collection',
    link: '/shop?filter=vintage',
    image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=700&q=80',
    icon: Sparkles,
  },
];

export default function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header matching Image 2 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 lg:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 uppercase tracking-widest mb-2">
              <span>◇ SHOP BY CATEGORY</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
              Find Your Perfect Style
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Explore our wide range of denim for men and women. Quality, comfort and style — all in one place.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 border border-slate-300 hover:border-slate-900 px-5 py-2.5 rounded-full transition-all hover:bg-slate-50 self-start md:self-auto"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 8 Category Cards (2 Rows of 4 Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {CATEGORY_ITEMS.map((cat) => {
            const Icon = cat.icon;

            return (
              <Link
                key={cat.id}
                href={cat.link}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Background Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-108"
                  loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20 group-hover:via-slate-950/20 transition-all duration-300" />

                {/* Glass Icon on Top Left */}
                <div className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-sm">
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content at Bottom */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      {cat.name}
                    </h3>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-blue-400 transition-colors inline-flex items-center gap-1 mt-1">
                      <span>Shop Now</span>
                      <span className="text-[10px]">→</span>
                    </span>
                  </div>

                  {/* Circular Arrow Button */}
                  <div className="w-8 h-8 rounded-full border border-white/30 bg-white/10 group-hover:bg-blue-600 group-hover:border-blue-600 text-white flex items-center justify-center transition-all">
                    <ArrowRight className="w-3.5 h-3.5 transform -rotate-45 group-hover:rotate-0 transition-transform" />
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
