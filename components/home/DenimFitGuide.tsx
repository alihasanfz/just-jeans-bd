'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Tag, Layers, Compass, Sparkles, type LucideIcon } from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';

const DEFAULT_FIT_ITEMS = [
  {
    id: 'fit-slim',
    name: 'Slim Fit',
    desc: 'A modern fit for a sharp look.',
    link: '/shop?fit=Slim+Fit',
    image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'fit-baggy',
    name: 'Baggy & Relaxed Fit',
    desc: 'Maximum comfort, effortless style.',
    link: '/shop?fit=Baggy+Fit',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'fit-straight',
    name: 'Straight Leg',
    desc: 'Timeless and versatile.',
    link: '/shop?fit=Straight+Fit',
    image: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'fit-wide',
    name: 'High-Rise Wide Leg',
    desc: 'Extra adore, modern comfort.',
    link: '/shop?fit=Wide+Leg',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80',
  },
];

const FIT_ICONS: LucideIcon[] = [Tag, Layers, Compass, Sparkles];

export default function DenimFitGuide() {
  const { siteSettings } = useProducts();
  const fitGuide = siteSettings?.fitGuide;

  const title = fitGuide?.title || 'THE DENIM FIT GUIDE';
  const subtitle = fitGuide?.subtitle || 'Find your perfect fit with our style guide.';
  const items = fitGuide?.items?.length ? fitGuide.items : DEFAULT_FIT_ITEMS;

  return (
    <section className="py-16 lg:py-24 bg-[#070b14] text-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header matching Image 2 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 lg:mb-12 gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-white">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {subtitle}
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 border border-slate-700 hover:border-white px-5 py-2.5 rounded-full transition-all hover:bg-white/10 self-start md:self-auto"
          >
            <span>View All Guides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Fit Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {items.map((item, idx) => {
            const Icon = FIT_ICONS[idx % FIT_ICONS.length];

            return (
              <Link
                key={item.id || idx}
                href={item.link || '/shop'}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 border border-white/10 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:border-blue-500/50"
              >
                {/* Image */}
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=700&q=80'}
                  alt={item.name}
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-108"
                  loading="lazy"
                />

                {/* Gradient Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-black/30 group-hover:via-slate-950/40 transition-all duration-300" />

                {/* Frosted Icon Top Left */}
                <div className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-sm">
                  <Icon className="w-4 h-4" />
                </div>

                {/* Bottom Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-300 font-normal">
                      {item.desc || (item as any).tagline || 'Engineered for exceptional comfort and style.'}
                    </p>
                    <span className="text-xs font-bold text-blue-400 group-hover:text-blue-300 transition-colors inline-flex items-center gap-1 pt-1">
                      <span>Shop {item.name}</span>
                      <span className="text-[10px]">→</span>
                    </span>
                  </div>

                  {/* Circular Arrow Button */}
                  <div className="w-8 h-8 rounded-full border border-white/30 bg-white/10 group-hover:bg-blue-600 group-hover:border-blue-600 text-white flex items-center justify-center transition-all shrink-0 ml-3">
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
