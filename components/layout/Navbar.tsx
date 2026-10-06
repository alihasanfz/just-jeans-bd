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
import { useAuth } from '@/lib/store/authContext';
import { formatPrice } from '@/lib/utils';
import MobileNav from './MobileNav';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { products, categories } = useProducts();
  const { user, isLoggedIn } = useAuth();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Cart count
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#060a13]/95 backdrop-blur-md shadow-2xl shadow-black/50 border-b border-white/10 py-1'
            : 'bg-[#070b14]/95 backdrop-blur-md border-b border-white/10'
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo matching Image 2 */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-700 to-blue-500 text-white rounded-xl flex items-center justify-center font-black text-lg tracking-tighter shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
                JB
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white uppercase leading-none font-display">
                  JEANS<span className="text-blue-500">BD</span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-0.5">
                  PREMIUM DENIM STORE
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links matching Image 2 */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              <Link
                href="/"
                className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${
                  pathname === '/'
                    ? 'text-white bg-white/10 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Home
              </Link>

              {/* Men Menu with dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveMegaMenu('men')}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <Link
                  href="/shop?gender=men"
                  className={`px-3 py-2 rounded-xl font-bold text-sm flex items-center gap-1 transition-all ${
                    pathname.includes('gender=men')
                      ? 'text-blue-400 bg-white/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>Men</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </Link>

                {activeMegaMenu === 'men' && (
                  <div className="absolute top-full left-0 w-56 bg-[#0c1222] rounded-2xl shadow-2xl border border-white/10 p-3 animate-scale-in z-50">
                    <ul className="space-y-1 text-xs">
                      <li>
                        <Link
                          href="/shop?gender=men&fit=Baggy+Fit"
                          className="text-slate-300 hover:text-blue-400 hover:bg-white/5 font-semibold px-3 py-2 rounded-xl block transition-colors"
                        >
                          Baggy & Loose Fits
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/shop?gender=men&fit=Slim+Fit"
                          className="text-slate-300 hover:text-blue-400 hover:bg-white/5 font-semibold px-3 py-2 rounded-xl block transition-colors"
                        >
                          Slim Tapered Jeans
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/shop?gender=men&fit=Straight+Fit"
                          className="text-slate-300 hover:text-blue-400 hover:bg-white/5 font-semibold px-3 py-2 rounded-xl block transition-colors"
                        >
                          Classic Straight Leg
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/shop?gender=men&category=Denim+Jackets"
                          className="text-slate-300 hover:text-blue-400 hover:bg-white/5 font-semibold px-3 py-2 rounded-xl block transition-colors"
                        >
                          Denim Trucker Jackets
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Women Menu with dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveMegaMenu('women')}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <Link
                  href="/shop?gender=women"
                  className={`px-3 py-2 rounded-xl font-bold text-sm flex items-center gap-1 transition-all ${
                    pathname.includes('gender=women')
                      ? 'text-blue-400 bg-white/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>Women</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </Link>

                {activeMegaMenu === 'women' && (
                  <div className="absolute top-full left-0 w-56 bg-[#0c1222] rounded-2xl shadow-2xl border border-white/10 p-3 animate-scale-in z-50">
                    <ul className="space-y-1 text-xs">
                      <li>
                        <Link
                          href="/shop?gender=women&fit=Wide+Leg"
                          className="text-slate-300 hover:text-blue-400 hover:bg-white/5 font-semibold px-3 py-2 rounded-xl block transition-colors"
                        >
                          High-Rise Wide Leg
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/shop?gender=women&fit=Mom+Fit"
                          className="text-slate-300 hover:text-blue-400 hover:bg-white/5 font-semibold px-3 py-2 rounded-xl block transition-colors"
                        >
                          Vintage Mom Jeans
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/shop?gender=women&fit=Straight+Fit"
                          className="text-slate-300 hover:text-blue-400 hover:bg-white/5 font-semibold px-3 py-2 rounded-xl block transition-colors"
                        >
                          Straight Ankle Crop
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* All Denim */}
              <Link
                href="/shop"
                className={`px-3 py-2 rounded-xl font-bold text-sm flex items-center gap-1 transition-all ${
                  pathname === '/shop'
                    ? 'text-white bg-white/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>All Denim</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </Link>

              {/* New In */}
              <Link
                href="/shop?filter=new"
                className="px-3 py-2 rounded-xl font-bold text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                New In
              </Link>

              {/* Sale with HOT badge */}
              <Link
                href="/shop?filter=sale"
                className="px-3 py-2 rounded-xl font-bold text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
              >
                <span>Sale</span>
                <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-xs">
                  HOT
                </span>
              </Link>
            </nav>

            {/* Integrated Search Bar matching Image 2 */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex relative w-56 lg:w-72 xl:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search jeans, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-400 rounded-full pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
              />
            </form>

            {/* Right Action Icons matching Image 2 */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Wishlist Heart */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* User Account */}
              <Link
                href="/account"
                aria-label="Account"
                className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center gap-1.5"
                title={isLoggedIn && user ? `Account: ${user.fullName}` : 'Account / Sign In'}
              >
                {isLoggedIn && user ? (
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                    {user.fullName
                      ? user.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : 'JB'}
                  </span>
                ) : (
                  <User className="w-5 h-5" />
                )}
              </Link>

              {/* Cart Button with Red Badge */}
              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="Cart"
                className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>
        </div>
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
