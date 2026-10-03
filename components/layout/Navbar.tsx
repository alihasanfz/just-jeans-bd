'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '@/lib/store/cartContext';
import { useWishlist } from '@/lib/store/wishlistContext';
import { useProducts } from '@/lib/store/productsContext';
import { formatPrice } from '@/lib/utils';
import MobileNav from './MobileNav';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { products, categories, siteSettings } = useProducts();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cart count
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Detect scroll for sticky elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search input when open
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Filtered search results
  const searchResults = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.fit.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.titleBn && p.titleBn.includes(searchQuery))
      ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200'
            : 'bg-white border-b border-slate-100'
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 text-slate-800 hover:text-blue-600 rounded-xl transition-colors"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xl tracking-tighter shadow-md group-hover:bg-blue-600 transition-colors">
                JB
              </div>
              <div className="flex flex-col">
                <span className="text-xl lg:text-2xl font-black tracking-tight text-slate-950 uppercase leading-none">
                  JEANS <span className="text-blue-600">BD</span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                  Authentic Denim
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              <Link
                href="/"
                className={`px-3 py-2 rounded-lg font-bold text-sm transition-colors ${
                  pathname === '/' ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
                }`}
              >
                Home
              </Link>

              {/* Men Menu with Mega Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveMegaMenu('men')}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <Link
                  href="/shop?gender=men"
                  className={`px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-1 transition-colors ${
                    pathname.includes('gender=men') ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  <span>Men</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </Link>

                {activeMegaMenu === 'men' && (
                  <div className="absolute top-full left-0 w-[580px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 grid grid-cols-2 gap-6 animate-fade-in z-50">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                        Shop By Fit (Men)
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <Link
                            href="/shop?gender=men&fit=Slim+Fit"
                            className="text-slate-700 hover:text-blue-600 font-semibold block py-1 transition-colors"
                          >
                            Slim Fit Jeans
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/shop?gender=men&fit=Baggy+Fit"
                            className="text-slate-700 hover:text-blue-600 font-semibold block py-1 transition-colors"
                          >
                            Baggy & Wide Fit
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/shop?gender=men&fit=Straight+Fit"
                            className="text-slate-700 hover:text-blue-600 font-semibold block py-1 transition-colors"
                          >
                            Straight Leg Jeans
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/shop?gender=men&fit=Cargo+Jeans"
                            className="text-slate-700 hover:text-blue-600 font-semibold block py-1 transition-colors"
                          >
                            Denim Cargo Pants
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/shop?gender=men&fit=Denim+Jacket"
                            className="text-slate-700 hover:text-blue-600 font-semibold block py-1 transition-colors"
                          >
                            Denim Jackets & Shirts
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 flex flex-col justify-between border border-slate-100">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mb-2">
                          Featured Men Collection
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm mb-1">
                          Turkish Ring-Spun Denim
                        </h5>
                        <p className="text-xs text-slate-500">
                          Hand-washed premium denim crafted for unmatched fit & endurance.
                        </p>
                      </div>
                      <Link
                        href="/shop?gender=men"
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-4"
                      >
                        <span>View All Men Jeans</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Women Menu with Mega Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveMegaMenu('women')}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <Link
                  href="/shop?gender=women"
                  className={`px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-1 transition-colors ${
                    pathname.includes('gender=women') ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  <span>Women</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </Link>

                {activeMegaMenu === 'women' && (
                  <div className="absolute top-full left-0 w-[580px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 grid grid-cols-2 gap-6 animate-fade-in z-50">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                        Shop By Fit (Women)
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <Link
                            href="/shop?gender=women&fit=Wide+Leg"
                            className="text-slate-700 hover:text-blue-600 font-semibold block py-1 transition-colors"
                          >
                            High-Rise Wide Leg
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/shop?gender=women&fit=Mom+Jeans"
                            className="text-slate-700 hover:text-blue-600 font-semibold block py-1 transition-colors"
                          >
                            Vintage Mom Fit
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/shop?gender=women&fit=Skinny+Fit"
                            className="text-slate-700 hover:text-blue-600 font-semibold block py-1 transition-colors"
                          >
                            Sculpt Skinny Jeans
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/shop?gender=women&fit=Baggy+Fit"
                            className="text-slate-700 hover:text-blue-600 font-semibold block py-1 transition-colors"
                          >
                            Baggy & Cargo Fits
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 flex flex-col justify-between border border-slate-100">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-2">
                          Trending Now
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm mb-1">
                          Sculpt & High-Rise Series
                        </h5>
                        <p className="text-xs text-slate-500">
                          Designed with 4-way shape retention stretch fabric.
                        </p>
                      </div>
                      <Link
                        href="/shop?gender=women"
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-4"
                      >
                        <span>View All Women Jeans</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/shop"
                className={`px-3 py-2 rounded-lg font-bold text-sm transition-colors ${
                  pathname === '/shop' ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
                }`}
              >
                All Denim
              </Link>

              <Link
                href="/shop?filter=new"
                className="px-3 py-2 rounded-lg font-bold text-sm text-slate-700 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>New In</span>
              </Link>

              <Link
                href="/shop?filter=sale"
                className="px-3 py-2 rounded-lg font-bold text-sm text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Sale</span>
              </Link>

              <Link
                href="/admin"
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 transition-all flex items-center gap-1 ml-2"
              >
                <ShieldAlert className="w-3 h-3 text-blue-600" />
                <span>Admin</span>
              </Link>
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 text-slate-700 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="Search Products"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                href="/account/wishlist"
                className="p-2.5 text-slate-700 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* User Account */}
              <Link
                href="/account"
                className="p-2.5 text-slate-700 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-colors hidden sm:block"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-slate-900 hover:bg-blue-600 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="hidden sm:inline-block">Bag</span>
                <span className="bg-blue-600 sm:bg-white sm:text-slate-900 text-white font-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Search Overlay */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-2xl p-4 md:p-6 animate-fade-in z-50">
            <div className="container mx-auto max-w-3xl">
              <form onSubmit={handleSearchSubmit} className="relative mb-4">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search Slim Fit, Baggy Jeans, Cargo, Jackets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 rounded-2xl py-3.5 pl-12 pr-12 text-base font-medium text-slate-900 focus:outline-none transition-colors"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="p-1 text-slate-400 hover:text-slate-800 absolute right-4 top-4"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>

              {/* Quick Results */}
              {searchQuery.trim() && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      No jeans found matching "{searchQuery}". Try searching for "Slim", "Baggy", "Mom", or "Black".
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {searchResults.map((item) => (
                        <Link
                          key={item.id}
                          href={`/product/${item.slug}`}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-4 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            className="w-12 h-14 rounded-lg object-cover bg-slate-100"
                          />
                          <div className="flex-1">
                            <h5 className="font-bold text-sm text-slate-900 line-clamp-1">
                              {item.name}
                            </h5>
                            <span className="text-xs text-slate-500">{item.fit} • {item.gender.toUpperCase()}</span>
                          </div>
                          <div className="font-black text-sm text-slate-900">
                            {formatPrice(item.discountPrice || item.price)}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        categories={categories}
      />
    </>
  );
}
