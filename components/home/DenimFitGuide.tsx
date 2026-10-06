'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Tag, Layers, Compass, Sparkles } from 'lucide-react';

const FIT_GUIDE_ITEMS = [
  {
    id: 'fit-slim',
    name: 'Slim Fit',
    desc: 'A modern fit for a sharp look.',
    linkText: 'Shop Slim Fit',
    link: '/shop?fit=Slim+Fit',
    image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=700&q=80',
    icon: Tag,
  },
  {
    id: 'fit-baggy',
    name: 'Baggy & Relaxed Fit',
    desc: 'Maximum comfort, effortless style.',
    linkText: 'Shop Baggy Fit',
    link: '/shop?fit=Baggy+Fit',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=700&q=80',
    icon: Layers,
  },
  {
    id: 'fit-straight',
    name: 'Straight Leg',
    desc: 'Timeless and versatile.',
    linkText: 'Shop Straight Fit',
    link: '/shop?fit=Straight+Fit',
    image: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=700&q=80',
    icon: Compass,
  },
  {
    id: 'fit-wide',
    name: 'High-Rise Wide Leg',
    desc: 'Extra adore, modern comfort.',
    linkText: 'Shop Wide Leg',
    link: '/shop?fit=Wide+Leg',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80',
    icon: Sparkles,
  },
];

export default function DenimFitGuide() {
  return (
    <section className="py-16 lg:py-24 bg-[#070b14] text-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header matching Image 2 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 lg:mb-12 gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-white">
              THE DENIM FIT GUIDE
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Find your perfect fit with our style guide.
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

        {/* 4 Fit Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {FIT_GUIDE_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.link}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 border border-white/10 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:border-blue-500/50"
              >
                {/* Image */}
                <img
                  src={item.image}
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
                    <p className="text-xs text-slate-300 line-clamp-1 font-normal opacity-90">
                      {item.desc}
                    </p>
                    <span className="text-xs font-bold text-blue-400 group-hover:text-white transition-colors inline-flex items-center gap-1 pt-1">
                      <span>{item.linkText}</span>
                      <span className="text-[10px]">→</span>
                    </span>
                  </div>

                  {/* Circular Arrow Button */}
                  <div className="w-8 h-8 rounded-full border border-white/30 bg-white/10 group-hover:bg-blue-600 group-hover:border-blue-600 text-white flex items-center justify-center transition-all shrink-0">
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
