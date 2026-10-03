'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, PhoneCall, Sparkles } from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';

export default function AnnouncementBar() {
  const { siteSettings } = useProducts();

  return (
    <div className="bg-slate-950 text-white text-xs py-2 px-4 border-b border-slate-800">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Left Perks */}
        <div className="hidden lg:flex items-center gap-4 text-slate-300 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span>Fast Delivery 24-72 hrs Nationwide</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Authentic Denim Guarantee</span>
          </div>
        </div>

        {/* Center Marquee/Promo */}
        <div className="flex items-center gap-2 font-semibold text-[11px] sm:text-xs text-center">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse hidden sm:inline-block" />
          <span className="tracking-wide">
            {siteSettings.announcementText || 'FREE DELIVERY ACROSS BANGLADESH ON ORDERS OVER ৳2500'}
          </span>
        </div>

        {/* Right Help & Tracking */}
        <div className="flex items-center gap-3 text-slate-300 text-[11px]">
          <Link
            href="/track-order"
            className="hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            Track Order
          </Link>
          <span className="text-slate-700">|</span>
          <a
            href={`tel:${siteSettings.phone}`}
            className="flex items-center gap-1 hover:text-white transition-colors font-bold text-blue-400"
          >
            <PhoneCall className="w-3 h-3" />
            <span>{siteSettings.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
