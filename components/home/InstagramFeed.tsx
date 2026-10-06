'use client';

import React from 'react';
import { ChevronRight, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';

const DEFAULT_LOOKBOOK_IMAGES = [
  'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=500&q=80',
];

export default function InstagramFeed() {
  const { siteSettings } = useProducts();
  const ig = siteSettings?.instagramFeed;
  const socials = siteSettings?.socialLinks;

  const badge = ig?.badge || 'FEATURED LOOKS';
  const title = ig?.title || 'Wear It. Tag It. #JeansBDStyle';
  const handle = ig?.handle || '@jeansbd';
  const profileUrl = ig?.url || 'https://instagram.com/jeansbd';
  const images = ig?.images?.length ? ig.images : DEFAULT_LOOKBOOK_IMAGES;

  return (
    <section className="py-14 bg-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header matching Image 2 */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest block mb-1">
              {badge}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              Follow us: {handle}
            </a>
            <div className="flex items-center gap-2 text-slate-600">
              {socials?.facebook && (
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
              )}
              {profileUrl && (
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
              )}
              {socials?.tiktok && (
                <a
                  href={socials.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </a>
              )}
              {socials?.youtube && (
                <a
                  href={socials.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Youtube className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Gallery Strip matching Image 2 */}
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {images.map((img, i) => (
              <a
                key={i}
                href={profileUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 shadow-xs block"
              >
                <img
                  src={img}
                  alt={`Lookbook ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Instagram className="w-5 h-5" />
                </div>
              </a>
            ))}
          </div>

          {/* Right Navigation Arrow Button matching Image 2 */}
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-500 transition-all hover:scale-110 z-10"
            aria-label="View Instagram page"
          >
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
