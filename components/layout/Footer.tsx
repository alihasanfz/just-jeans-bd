'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Send,
  CheckCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';

export default function Footer() {
  const { siteSettings } = useProducts();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-900">
      {/* Top Value Badges */}
      <div className="container mx-auto px-4 lg:px-6 mb-16 pb-12 border-b border-slate-900">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3.5 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {siteSettings.trustBadges?.deliveryTitle || 'Nationwide Delivery'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {siteSettings.trustBadges?.deliverySubtitle || '24-48h Dhaka, 48-72h All BD'}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3.5 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {siteSettings.trustBadges?.cottonTitle || '100% Authentic Cotton'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {siteSettings.trustBadges?.cottonSubtitle || 'Premium Turkish Ring-Spun'}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3.5 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {siteSettings.trustBadges?.exchangeTitle || 'Hassle-Free Exchange'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {siteSettings.trustBadges?.exchangeSubtitle || '7 days size replacement'}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3.5 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {siteSettings.trustBadges?.paymentTitle || 'Secure Payment'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {siteSettings.trustBadges?.paymentSubtitle || 'COD, bKash & Nagad'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white text-slate-950 rounded-xl flex items-center justify-center font-black text-xl">
                JB
              </div>
              <span className="text-2xl font-black tracking-tight text-white uppercase">
                JEANS <span className="text-blue-500">BD</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {siteSettings.footerBrandDescription ||
                "Bangladesh's premier denim destination. Engineered with international quality fabrics, tailored cuts, and contemporary street aesthetic for both men and women."}
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                {siteSettings.googleMapUrl ? (
                  <a
                    href={siteSettings.googleMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors group"
                  >
                    <span>{siteSettings.address}</span>
                    <span className="block text-[11px] text-blue-400 group-hover:underline mt-0.5 font-medium">
                      View on Google Maps &rarr;
                    </span>
                  </a>
                ) : (
                  <span>{siteSettings.address}</span>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${siteSettings.phone}`} className="hover:text-white transition-colors">
                  {siteSettings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${siteSettings.email}`} className="hover:text-white transition-colors">
                  {siteSettings.email}
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-3">
              <a
                href={siteSettings.socialLinks.facebook || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={siteSettings.socialLinks.instagram || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={siteSettings.socialLinks.youtube || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Youtube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Men Denim */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Men's Denim
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/shop?gender=men&fit=Slim+Fit" className="hover:text-white transition-colors">
                  Slim Fit Jeans
                </Link>
              </li>
              <li>
                <Link href="/shop?gender=men&fit=Baggy+Fit" className="hover:text-white transition-colors">
                  Baggy & Skater Fits
                </Link>
              </li>
              <li>
                <Link href="/shop?gender=men&fit=Straight+Fit" className="hover:text-white transition-colors">
                  Straight Leg Denim
                </Link>
              </li>
              <li>
                <Link href="/shop?gender=men&fit=Cargo+Jeans" className="hover:text-white transition-colors">
                  Tactical Cargo Pants
                </Link>
              </li>
              <li>
                <Link href="/shop?gender=men&fit=Denim+Jacket" className="hover:text-white transition-colors">
                  Denim Trucker Jackets
                </Link>
              </li>
              <li>
                <Link href="/shop?gender=men" className="text-blue-400 font-semibold hover:underline">
                  View All Men Collection &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Women Denim */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Women's Denim
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/shop?gender=women&fit=Wide+Leg" className="hover:text-white transition-colors">
                  High-Rise Wide Leg
                </Link>
              </li>
              <li>
                <Link href="/shop?gender=women&fit=Mom+Jeans" className="hover:text-white transition-colors">
                  90s Vintage Mom Jeans
                </Link>
              </li>
              <li>
                <Link href="/shop?gender=women&fit=Skinny+Fit" className="hover:text-white transition-colors">
                  Sculpt Skinny Jeans
                </Link>
              </li>
              <li>
                <Link href="/shop?gender=women&fit=Baggy+Fit" className="hover:text-white transition-colors">
                  Women's Baggy Jeans
                </Link>
              </li>
              <li>
                <Link href="/shop?gender=women" className="text-blue-400 font-semibold hover:underline">
                  View All Women Collection &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support & Newsletter */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs mb-6">
              <li>
                <Link href="/track-order" className="text-amber-400 font-bold hover:underline">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Size Guide & Fit Advice
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  My Profile & Orders
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>

            <h5 className="text-[11px] font-black uppercase tracking-wider text-white mb-2">
              Stay in the loop
            </h5>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-3 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  aria-label="Subscribe"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribed && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium animate-fade-in">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Thank you for subscribing!</span>
                </div>
              )}
            </form>

            <div className="pt-4 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
              <Link href="/shop" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link href="/shop" className="hover:text-slate-300 transition-colors">Terms & Conditions</Link>
              <span>•</span>
              <Link href="/track-order" className="hover:text-slate-300 transition-colors">Delivery Info</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Payment Gateway Badges */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} <strong className="text-white">Jeans BD</strong>. {siteSettings.copyrightText || 'All rights reserved. Crafted for Denim Lovers in Bangladesh.'}
          </div>

          {/* Payment Methods */}
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">Accepted Payments:</span>
            <span className="bg-slate-900 border border-slate-800 text-[#e2136e] font-black text-xs px-2.5 py-1 rounded-md">
              bKash
            </span>
            <span className="bg-slate-900 border border-slate-800 text-[#f7941d] font-black text-xs px-2.5 py-1 rounded-md">
              Nagad
            </span>
            <span className="bg-slate-900 border border-slate-800 text-emerald-400 font-bold text-xs px-2.5 py-1 rounded-md">
              Cash on Delivery
            </span>
            <span className="bg-slate-900 border border-slate-800 text-blue-400 font-bold text-xs px-2.5 py-1 rounded-md">
              Visa / Mastercard
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
