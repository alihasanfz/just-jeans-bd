'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Plus,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';

export default function Footer() {
  const { siteSettings } = useProducts();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const brandDesc = siteSettings?.footerBrandDescription ||
    "Premium quality denim for every style. From classic to trend, we've got you covered.";
  const phone = siteSettings?.phone || '01775743148';
  const emailAddr = siteSettings?.email || 'hasansheikh9080@gmail.com';
  const address = siteSettings?.address || '13-14 Zoo Road, Mollik Tower, Mirpur- 01, Dhaka -1216, Bangladesh';
  const socials = siteSettings?.socialLinks;
  const copyright = siteSettings?.copyrightText || 'All rights reserved. Crafted for Denim Lovers in Bangladesh.';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-[#070b14] text-slate-300 pt-16 pb-8 border-t border-white/10">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Main Footer Content matching Image 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-white/10">
          {/* Brand Info (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-tr from-blue-700 to-blue-500 text-white rounded-xl flex items-center justify-center font-black text-base shadow-md">
                JB
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white uppercase leading-none font-display">
                  JEANS<span className="text-blue-500">BD</span>
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-0.5">
                  PREMIUM DENIM STORE
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {brandDesc}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-1 text-slate-400">
              {socials?.facebook && (
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {socials?.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {socials?.tiktok && (
                <a
                  href={socials.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {socials?.youtube && (
                <a
                  href={socials.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop?gender=men" className="hover:text-white transition-colors">
                  Men
                </Link>
              </li>
              <li>
                <Link href="/shop?gender=women" className="hover:text-white transition-colors">
                  Women
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  All Denim
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=new" className="hover:text-white transition-colors">
                  New In
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=sale" className="hover:text-white transition-colors">
                  Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Customer Service
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Get in Touch (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Get in Touch
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-white transition-colors truncate">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a href={`mailto:${emailAddr}`} className="hover:text-white transition-colors truncate">
                  {emailAddr}
                </a>
              </li>
              <li className="flex items-start gap-2 group">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5 group-hover:text-amber-400 transition-colors" />
                <div className="space-y-1">
                  <span className="leading-snug block">{address}</span>
                  <a
                    href="#live-google-map"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>📍 View on Live Map ↓</span>
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Subscribe to Our Newsletter
            </h4>
            <p className="text-[11px] text-slate-400">
              Get the latest updates, offers and style tips.
            </p>

            <form onSubmit={handleSubscribe} className="relative flex items-center">
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/15 text-white placeholder:text-slate-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 pr-10"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-1 top-1 bottom-1 w-7 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center transition-colors"
              >
                {subscribed ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            </form>
          </div>
        </div>

        {/* FULL-WIDTH LIVE GOOGLE MAP SECTION (Exact match to "avabe full dekhabe") */}
        <div id="live-google-map" className="my-10 rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl backdrop-blur-sm">
          {/* Top Bar matching Image 1 */}
          <div className="px-5 py-3.5 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="text-sm font-black text-white tracking-wide">
                Live Google Map: Jeans Manufacturing Company Ltd
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold hidden sm:inline">
                Showroom &amp; Plant
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono hidden md:inline">
                13-14 Zoo Road, Mollik Tower, Mirpur-01, Dhaka - 1216
              </span>
              <a
                href={siteSettings?.googleMapUrl || 'https://maps.app.goo.gl/FQtyZRiWgho2owgr7'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <span>Open Live Map</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Full-width Map Iframe */}
          <div className="relative w-full h-72 sm:h-80 md:h-96 bg-slate-950">
            <iframe
              title="Jeans BD Live Google Map"
              src="https://maps.google.com/maps?q=Jeans+manufacturing+company+Ltd+Mollik+Tower+Zoo+Road+Mirpur+Dhaka&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href={siteSettings?.googleMapUrl || 'https://maps.app.goo.gl/FQtyZRiWgho2owgr7'}
              target="_blank"
              rel="noreferrer"
              className="absolute top-3 left-3 bg-white hover:bg-slate-100 text-slate-900 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xl flex items-center gap-1.5 transition-all hover:scale-105 z-10"
            >
              <span>Open in Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Bottom Bar matching Image 2 */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Jeans BD. {copyright}</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
