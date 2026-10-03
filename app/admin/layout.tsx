'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutGrid,
  Layers,
  Box,
  PlusCircle,
  Split,
  Sparkles,
  Tag,
  Tags,
  Palette,
  ShoppingBag,
  Users,
  ShieldCheck,
  Percent,
  TrendingUp,
  Sliders,
  Store,
  Truck,
  CreditCard,
  LayoutTemplate,
  Rows,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { useOrder } from '@/lib/store/orderContext';
import { useProducts } from '@/lib/store/productsContext';
import { AdminThemeProvider, useAdminTheme } from '@/lib/store/adminThemeContext';
import AdminThemeToggle from '@/components/admin/AdminThemeToggle';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // If viewing login page, render full screen without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <AdminThemeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminThemeProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-200 selection:bg-blue-600 selection:text-white ${
        isDark
          ? 'bg-[#090d16] text-slate-100'
          : 'bg-[#f4f7fb] text-slate-800'
      }`}
    >
      <Suspense
        fallback={
          <aside
            className={`w-full md:w-64 border-r flex-shrink-0 p-4 ${
              isDark ? 'bg-[#0d1322] border-slate-800/80' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`h-8 rounded-xl animate-pulse ${isDark ? 'bg-slate-800/60' : 'bg-slate-200'}`} />
          </aside>
        }
      >
        <AdminSidebar />
      </Suspense>

      {/* Main Admin Area */}
      <main
        className={`flex-1 p-5 md:p-8 lg:p-10 overflow-y-auto transition-colors duration-200 ${
          isDark ? 'bg-[#090d16]/95' : 'bg-[#f4f7fb]'
        }`}
      >
        {children}
      </main>
    </div>
  );
}

function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  const currentAction = searchParams.get('action');

  const { orders } = useOrder();
  const { products, siteSettings } = useProducts();
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  // Collapsible sections state
  const isProductsActive =
    pathname.startsWith('/admin/products') ||
    pathname.startsWith('/admin/departments') ||
    pathname.startsWith('/admin/categories') ||
    pathname.startsWith('/admin/subcategories') ||
    pathname.startsWith('/admin/tags') ||
    pathname.startsWith('/admin/attributes');

  const isSettingsActive = pathname.startsWith('/admin/settings');

  const [productsOpen, setProductsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);

  return (
    <aside
      className={`w-full md:w-64 border-r flex-shrink-0 flex flex-col justify-between select-none transition-colors duration-200 ${
        isDark
          ? 'bg-[#0d1322] border-slate-800/80'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="p-4 space-y-4">
        {/* Logo & Brand */}
        <div
          className={`flex items-center justify-between px-2 py-2 border-b pb-3.5 ${
            isDark ? 'border-slate-800/60' : 'border-slate-100'
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-700 to-blue-500 rounded-lg flex items-center justify-center font-black text-sm text-white shadow-md shadow-blue-500/20">
              JB
            </div>
            <div className="flex flex-col">
              <span
                className={`font-black text-sm tracking-tight uppercase leading-none ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                JEANS <span className="text-blue-500">BD</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Control Center
              </span>
            </div>
          </Link>
          <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 text-[13px]">
          {/* 1. Dashboard */}
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
              pathname === '/admin' && !currentAction && !currentTab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-blue-500" />
            <span>Dashboard</span>
          </Link>

          {/* 2. Denim Products Group */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setProductsOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-colors ${
                isProductsActive
                  ? isDark
                    ? 'text-white bg-slate-800/40'
                    : 'text-slate-900 bg-slate-100'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Denim Products</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-slate-800 text-slate-300 border-slate-700/60'
                      : 'bg-slate-200/70 text-slate-700 border-slate-300'
                  }`}
                >
                  {products.length || 6}
                </span>
                {productsOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {/* Sub-menu with vertical tree line */}
            {productsOpen && (
              <div
                className={`ml-5 pl-3 border-l my-1 space-y-1 ${
                  isDark ? 'border-slate-800/80' : 'border-slate-200'
                }`}
              >
                <Link
                  href="/admin/products"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/admin/products' && currentAction !== 'add'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>All Products</span>
                </Link>

                <Link
                  href="/admin/products?action=add"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/admin/products' && currentAction === 'add'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </Link>

                <Link
                  href="/admin/departments"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/admin/departments'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>Departments</span>
                </Link>

                <Link
                  href="/admin/categories"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/admin/categories'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Category</span>
                </Link>

                <Link
                  href="/admin/subcategories"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/admin/subcategories'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Sub-Category</span>
                </Link>

                <Link
                  href="/admin/tags"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/admin/tags'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Tags className="w-3.5 h-3.5" />
                  <span>Tags</span>
                </Link>

                <Link
                  href="/admin/attributes"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/admin/attributes'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Attributes (Color, Size, Fits)</span>
                </Link>
              </div>
            )}
          </div>

          {/* 3. Orders */}
          <Link
            href="/admin/orders"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
              pathname === '/admin/orders'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-blue-500" />
              <span>Orders</span>
            </div>
            <span className="bg-blue-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
              {orders.length}
            </span>
          </Link>

          {/* 4. Customers */}
          <Link
            href="/admin/customers"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
              pathname === '/admin/customers'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-blue-500" />
            <span>Customers</span>
          </Link>

          {/* 5. Sub-Admins & Staff */}
          <Link
            href="/admin/staff"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
              pathname === '/admin/staff'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>Sub-Admins & Staff</span>
          </Link>

          {/* 6. Discounts & Promos */}
          <Link
            href="/admin/coupons"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
              pathname === '/admin/coupons'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Percent className="w-4 h-4 text-blue-500" />
            <span>Discounts & Promos</span>
          </Link>

          {/* 7. Sales & Analytics */}
          <Link
            href="/admin/analytics"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
              pathname === '/admin/analytics'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span>Sales & Analytics</span>
          </Link>

          {/* 8. Store Settings Group */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setSettingsOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-colors ${
                isSettingsActive
                  ? isDark
                    ? 'text-white bg-slate-800/40'
                    : 'text-slate-900 bg-slate-100'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-blue-500" />
                <span>Store Settings</span>
              </div>
              {settingsOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Sub-menu with vertical tree line */}
            {settingsOpen && (
              <div
                className={`ml-5 pl-3 border-l my-1 space-y-0.5 ${
                  isDark ? 'border-slate-800/80' : 'border-slate-200'
                }`}
              >
                <Link
                  href="/admin/settings?tab=store"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname === '/admin/settings' && (!currentTab || currentTab === 'store')
                      ? 'text-blue-500 font-bold bg-blue-500/10'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Store Details</span>
                </Link>

                <Link
                  href="/admin/settings?tab=shipping"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname === '/admin/settings' && currentTab === 'shipping'
                      ? 'text-blue-500 font-bold bg-blue-500/10'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Shipping & Delivery</span>
                </Link>

                <Link
                  href="/admin/settings?tab=payments"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname === '/admin/settings' && currentTab === 'payments'
                      ? 'text-blue-500 font-bold bg-blue-500/10'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Payment Methods</span>
                </Link>

                <Link
                  href="/admin/settings?tab=home"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname === '/admin/settings' && currentTab === 'home'
                      ? 'text-blue-500 font-bold bg-blue-500/10'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutTemplate className="w-3.5 h-3.5" />
                  <span>Home Sections</span>
                </Link>

                <Link
                  href="/admin/settings?tab=header-footer"
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname === '/admin/settings' && currentTab === 'header-footer'
                      ? 'text-blue-500 font-bold bg-blue-500/10'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Rows className="w-3.5 h-3.5" />
                  <span>Header & Footer</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Bottom Profile & Actions Section */}
      <div
        className={`p-3.5 border-t space-y-2.5 mt-auto transition-colors duration-200 ${
          isDark
            ? 'border-slate-800/80 bg-[#0a0f1d]/90'
            : 'border-slate-200 bg-slate-50/90'
        }`}
      >
        {/* Dark / Light Mode Switch */}
        <AdminThemeToggle variant="full" />

        {/* Admin Profile Card */}
        <div
          className={`border rounded-2xl p-2.5 flex items-center gap-2.5 transition-colors ${
            isDark
              ? 'bg-[#121826] border-slate-800/90'
              : 'bg-white border-slate-200/90 shadow-xs'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-500 font-black text-xs flex items-center justify-center shrink-0">
            AD
          </div>
          <div className="min-w-0 flex-1">
            <h4
              className={`font-bold text-xs leading-tight truncate ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Admin Backoffice
            </h4>
            <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
              {siteSettings?.email || 'hasansheikh9080@gmail.com'}
            </p>
          </div>
        </div>

        {/* Action Buttons: STOREFRONT & LOGOUT */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/"
            target="_blank"
            className={`font-black text-[11px] tracking-wider uppercase py-2.5 px-2 rounded-xl text-center transition-all active:scale-95 border ${
              isDark
                ? 'bg-[#161f30] hover:bg-[#1e2a42] text-slate-200 border-slate-700/60'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
            }`}
          >
            STOREFRONT
          </Link>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('jeansbd_admin_auth');
                window.location.href = '/admin/login';
              }
            }}
            className={`font-black text-[11px] tracking-wider uppercase py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
              isDark
                ? 'bg-[#240c14] hover:bg-[#34101c] text-rose-400 hover:text-rose-300 border-rose-900/60'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border-rose-200'
            }`}
          >
            <span className="text-xs">&rarr;]</span>
            <span>LOGOUT</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
