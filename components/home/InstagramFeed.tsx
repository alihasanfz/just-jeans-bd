'use client';

import React from 'react';
import { Instagram, ArrowUpRight } from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';

export default function InstagramFeed() {
  const { siteSettings } = useProducts();
  const feed = siteSettings.instagramFeed || {
    handle: '@JEANSBD_OFFICIAL',
    title: 'Wear It. Tag It. #JeansBDStyle',
    url: 'https://instagram.com/jeansbd',
    images: [
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
    ],
  };

  const images = feed.images && feed.images.length > 0 ? feed.images : [];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-pink-600 uppercase tracking-widest mb-1">
              <Instagram className="w-4 h-4" />
              <span>{feed.handle}</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase">
              {feed.title}
            </h2>
          </div>
          <a
            href={feed.url || 'https://instagram.com'}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors"
          >
            <span>Follow on Instagram</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {images.map((img, i) => (
            <div
              key={i}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-sm"
            >
              <img
                src={img}
                alt="Instagram look"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white">
                <Instagram className="w-6 h-6 transform scale-75 group-hover:scale-100 transition-transform duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
