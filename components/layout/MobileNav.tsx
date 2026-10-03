'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ChevronDown, ChevronRight, User, Heart, ShieldAlert, Sparkles, Flame, PhoneCall, MapPin } from 'lucide-react';
import { Category } from '@/types';
import { useProducts } from '@/lib/store/productsContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

export default function MobileNav({ isOpen, onClose, categories }: MobileNavProps) {
  const { siteSettings } = useProducts();
  const [activeGender, setActiveGender] = useState<'men' | 'women'>('men');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    menFits: true,
    womenFits: false,
  });

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const menCategories = categories.filter((c) => c.gender === 'men');
  const womenCategories = categories.filter((c) => c.gender === 'women');

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-fade-in">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <Link href="/" onClick={onClose} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-base">
                JB
              </div>
              <span className="font-black text-lg text-slate-900 uppercase">
                JEANS <span className="text-blue-600">BD</span>
              </span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Gender Switcher Tabs */}
          <div className="flex border-b border-slate-100 text-sm font-bold">
            <button
              onClick={() => setActiveGender('men')}
              className={`flex-1 py-3 text-center transition-all ${
                activeGender === 'men'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-slate-500'
              }`}
            >
              MEN'S DENIM
            </button>
            <button
              onClick={() => setActiveGender('women')}
              className={`flex-1 py-3 text-center transition-all ${
                activeGender === 'women'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-slate-500'
              }`}
            >
              WOMEN'S DENIM
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1">
            <Link
              href={`/shop?gender=${activeGender}`}
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-xl font-bold text-sm text-slate-900 hover:bg-slate-50"
            >
              <span>Shop All {activeGender === 'men' ? 'Men' : 'Women'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <div className="py-2">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400 px-3 mb-1">
                Categories & Fits
              </div>
              {(activeGender === 'men' ? menCategories : womenCategories).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-slate-400">{cat.itemCount} items</span>
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <Link
                href="/shop?filter=new"
                onClick={onClose}
                className="flex items-center gap-2 p-3 rounded-xl font-bold text-sm text-slate-800 hover:bg-slate-50"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>New Arrivals</span>
              </Link>
              <Link
                href="/shop?filter=sale"
                onClick={onClose}
                className="flex items-center gap-2 p-3 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50"
              >
                <Flame className="w-4 h-4 text-red-600" />
                <span>Sale & Offers</span>
              </Link>
              <Link
                href="/track-order"
                onClick={onClose}
                className="flex items-center gap-2 p-3 rounded-xl font-bold text-sm text-blue-600 hover:bg-blue-50"
              >
                <span>Track Your Order</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer info & links */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-2.5 rounded-xl font-bold text-xs text-slate-800"
            >
              <User className="w-4 h-4" />
              <span>My Account</span>
            </Link>
            <Link
              href="/account/wishlist"
              onClick={onClose}
              className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-2.5 rounded-xl font-bold text-xs text-slate-800"
            >
              <Heart className="w-4 h-4 text-red-500" />
              <span>Wishlist</span>
            </Link>
          </div>

          <div className="space-y-2">
            <a
              href={`tel:${siteSettings.phone}`}
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Helpline: {siteSettings.phone}</span>
            </a>

            {siteSettings.googleMapUrl && (
              <a
                href={siteSettings.googleMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 py-2 rounded-xl font-bold text-[11px] shadow-sm transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Mirpur-01 Showroom Location &rarr;</span>
              </a>
            )}
          </div>

          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm"
          >
            <ShieldAlert className="w-4 h-4 text-blue-400" />
            <span>Admin Control Panel</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
