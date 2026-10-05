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
  ShieldCheck,
  Flame,
  ArrowRight,
  TrendingUp,
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
  const { products, categories } = useProducts();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cart count
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Detect scroll for sticky elevation & blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut: Press "/" to open search, "Escape" to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Focus search input when open
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Filtered search results
  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.fit.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.titleBn && p.titleBn.includes(searchQuery))
        )
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const trendingTags = ['Slim Fit', 'Baggy Fit', 'Cargo Jeans', 'Vintage Wash', 'Denim Jacket', 'Black'];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-md shadow-lg shadow-slate-900/5 border-b border-slate-200/80 py-0.5'
            : 'bg-white/90 backdrop-blur-md border-b border-slate-100'
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2.5 text-slate-800 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-slate-950 text-white rounded-xl flex items-center justify-center font-black text-lg tracking-tighter shadow-md shadow-slate-950/20 group-hover:bg-blue-600 transition-all group-hover:scale-105">
                JB
              </div>
              <div className="flex flex-col">
                <span className="text-xl lg:text-2xl font-black tracking-tight text-slate-950 uppercase leading-none font-display">
                  JEANS <span className="text-blue-600">BD</span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-0.5">
                  Authentic Denim
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              <Link
                href="/"
                className={`px-3.5 py-2 rounded-xl font-bold text-sm transition-all ${
                  pathname === '/'
                    ? 'text-blue-600 bg-blue-50/60'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
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
                  className={`px-3.5 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all ${
                    pathname.includes('gender=men')
                      ? 'text-blue-600 bg-blue-50/60'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Men</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeMegaMenu === 'men' ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </Link>

                {activeMegaMenu === 'men' && (
                  <div className="absolute top-full left-0 w-[600px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 grid grid-cols-2 gap-6 animate-scale-in z-50 mt-1">
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
                        Shop By Fit (Men)
                      </h4>
                      <ul className="space-y-1.5 text-sm">
                        <li>
                          <Link
                            href="/shop?gender=men&fit=Slim+Fit"
                            className="text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-semibold px-2.5 py-1.5 rounded-lg block transition-colors"
                          >
                            Slim Fit Jeans
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/shop?gender=men&fit=Baggy+Fit"
                            className="text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-semibold px-2.5 py-1.5 rounded-lg block transition-colors"
                          >
                            Baggy & Wide Fit
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/shop?gender=men&fit=Straight+Fit"
                            className="text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-semibold px-2.5 py-1.5 rounded-lg block transition-colors"
                          >
                            Straight Leg Jeans
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/shop?gender=men&fit=Cargo+Jeans"
                            className="text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-semibold px-2.5 py-1.5 rounded-lg block transition-colors"
                          >
                            Denim Cargo Pants
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/shop?gender=men&fit=Denim+Jacket"
                            className="text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-semibold px-2.5 py-1.5 rounded-lg block transition-colors"
                          >
                            Denim Jackets & Shirts
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl p-5 flex flex-col justify-between border border-blue-100/60">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-100/70 px-2.5 py-1 rounded-full inline-block mb-2.5">
                          Featured Men Collection
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm mb-1.5">
                          Turkish Ring-Spun Denim
                        </h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Hand-washed premium cotton crafted for unmatched fit & durability.
                        </p>
                      </div>
                      <Link
                        href="/shop?gender=men"
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 mt-4 group"
                      >
                        <span>View All Men Jeans</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
                  className={`px-3.5 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all ${
                    pathname.includes('gender=women')
                      ? 'text-blue-600 bg-blue-50/60'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Women</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeMegaMenu === 'women' ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </Link>

                {activeMegaMenu === 'women' && (
                  <div className="absolute top-full left-0 w-[600px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 grid grid-cols-2 gap-6 animate-scale-in z-50 mt-1">
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
                        Shop By Fit (Women)
                      </h4>
                      <ul className="space-y-1.5 text-sm">
                        <li>
                          <Link
                            href="/shop?gender=women&fit=Wide+Leg"
                            className="text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-semibold px-2.5 py-1.5 rounded-lg block transition-colors"
                          >
                            High-Rise Wide Leg
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/shop?gender=women&fit=Mom+Jeans"
                            className="text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-semibold px-2.5 py-1.5 rounded-lg block transition-colors"
                          >
                            Vintage Mom Fit
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/shop?gender=women&fit=Skinny+Fit"
                            className="text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-semibold px-2.5 py-1.5 rounded-lg block transition-colors"
                          >
                            Sculpt Skinny Jeans
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/shop?gender=women&fit=Baggy+Fit"
                            className="text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-semibold px-2.5 py-1.5 rounded-lg block transition-colors"
                          >
                            Baggy & Cargo Fits
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-pink-50/40 rounded-2xl p-5 flex flex-col justify-between border border-pink-100/60">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 bg-pink-100/70 px-2.5 py-1 rounded-full inline-block mb-2.5">
                          Trending Now
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm mb-1.5">
                          Sculpt & High-Rise Series
                        </h5>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Designed with 4-way shape retention stretch fabric for an effortless silhouette.
                        </p>
                      </div>
                      <Link
                        href="/shop?gender=women"
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 mt-4 group"
                      >
                        <span>View All Women Jeans</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/shop"
                className={`px-3.5 py-2 rounded-xl font-bold text-sm transition-all ${
                  pathname === '/shop'
                    ? 'text-blue-600 bg-blue-50/60'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                All Denim
              </Link>

              <Link
                href="/shop?filter=new"
                className="px-3.5 py-2 rounded-xl font-bold text-sm text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>New In</span>
              </Link>

              <Link
                href="/shop?filter=sale"
                className="px-3.5 py-2 rounded-xl font-bold text-sm text-red-600 hover:text-red-700 hover:bg-red-50/60 transition-all flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Sale</span>
              </Link>

              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 transition-all flex items-center gap-1.5 ml-2 border border-slate-200 shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Admin</span>
              </Link>
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 text-slate-700 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 group"
                aria-label="Search Products"
              >
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline-block text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  /
                </span>
              </button>

              {/* Wishlist Link */}
              <Link
                href="/account/wishlist"
                className="p-2.5 text-slate-700 hover:text-red-500 rounded-xl hover:bg-slate-100 transition-all relative group"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-sm animate-scale-in">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* User Account */}
              <Link
                href="/account"
                className="p-2.5 text-slate-700 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-all hidden sm:block group"
                aria-label="Account"
              >
                <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-slate-950 hover:bg-blue-600 text-white px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all shadow-md shadow-slate-900/10 active:scale-95 group"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline-block font-medium">Bag</span>
                <span className="bg-blue-600 group-hover:bg-white group-hover:text-blue-600 text-white font-black text-xs min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center transition-colors">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Search Modal Overlay */}
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/70 backdrop-blur-md p-4 sm:p-6 lg:p-10 animate-fade-in">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
              <form onSubmit={handleSearchSubmit} className="relative p-4 sm:p-6 border-b border-slate-100">
                <div className="relative flex items-center">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search Slim Fit, Baggy, Cargo, Jacket, Size 32..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl py-3.5 pl-12 pr-12 text-sm font-semibold text-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-2 text-slate-400 hover:text-slate-700 absolute right-3 rounded-xl hover:bg-slate-200/60 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Trending suggestion chips */}
                <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                    Popular:
                  </span>
                  {trendingTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchQuery(tag)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors shrink-0"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </form>

              {/* Quick Results List */}
              <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
                {searchQuery.trim() ? (
                  <>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Search Results ({searchResults.length})
                    </div>
                    {searchResults.length === 0 ? (
                      <div className="py-12 text-center text-sm text-slate-500">
                        No denim found matching <span className="font-bold text-slate-900">"{searchQuery}"</span>.
                        <div className="text-xs text-slate-400 mt-1">
                          Try searching for "Slim", "Baggy", "Mom", "Cargo", or "Black".
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {searchResults.map((item) => (
                          <Link
                            key={item.id}
                            href={`/product/${item.slug}`}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all group"
                          >
                            <img
                              src={item.thumbnail}
                              alt={item.name}
                              className="w-14 h-16 rounded-xl object-cover bg-slate-100 group-hover:scale-105 transition-transform"
                            />
                            <div className="flex-1">
                              <h5 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                {item.name}
                              </h5>
                              {item.titleBn && (
                                <p className="text-xs text-slate-400 line-clamp-1">{item.titleBn}</p>
                              )}
                              <span className="text-xs text-slate-500 font-medium">
                                {item.fit} • {item.gender.toUpperCase()}
                              </span>
                            </div>
                            <div className="font-black text-sm text-slate-950 text-right">
                              {formatPrice(item.discountPrice || item.price)}
                              {item.discountPrice && (
                                <span className="block text-[11px] text-slate-400 line-through font-normal">
                                  {formatPrice(item.price)}
                                </span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Type a keyword above to search through all premium denim styles.
                  </div>
                )}
              </div>
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
