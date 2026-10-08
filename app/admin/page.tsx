'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRight,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
  Calendar,
  Store,
  Users,
  Bell,
  Moon,
  Sun,
  ClipboardList,
  RefreshCw,
  XCircle,
  CreditCard,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { useOrder } from '@/lib/store/orderContext';
import { useProducts } from '@/lib/store/productsContext';
import { useAdminTheme } from '@/lib/store/adminThemeContext';
import AdminThemeToggle from '@/components/admin/AdminThemeToggle';
import { formatPrice } from '@/lib/utils';
import { safeLocalStorageSet, safeLocalStorageGet } from '@/lib/utils/db';
import CustomerMessageModal from '@/components/admin/CustomerMessageModal';
import StockAlertModal, { StockAlertItem } from '@/components/admin/StockAlertModal';

function AdminDashboardContent() {
  const { orders } = useOrder();
  const { products, updateProduct, siteSettings, updateSiteSettings } = useProducts();
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === 'dark';

  // Filters & State
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '14d' | '30d'>('7d');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Live time formatter
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Safe collections
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];

  // Metrics Calculations (Live dynamic data)
  const completedOrders = safeOrders.filter(
    (o) => o && (o.paymentStatus === 'completed' || o.orderStatus === 'Delivered')
  );
  const totalRevenueCalc = completedOrders.reduce((sum, o) => sum + (Number(o?.totalAmount) || 0), 0);
  const totalSalesCalc = safeOrders.reduce((sum, o) => sum + (Number(o?.totalAmount) || 0), 0);

  const totalSales = totalSalesCalc;
  const totalOrdersCount = safeOrders.length;
  const pendingOrdersCount = safeOrders.filter(
    (o) => o && (o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed')
  ).length;
  const processingOrdersCount = safeOrders.filter(
    (o) =>
      o &&
      (o.orderStatus === 'Processing' ||
        o.orderStatus === 'Ready to Ship' ||
        o.orderStatus === 'Shipped' ||
        o.orderStatus === 'Out for Delivery')
  ).length;
  const deliveredOrdersCount = safeOrders.filter((o) => o && o.orderStatus === 'Delivered').length;
  const cancelledOrdersCount = safeOrders.filter(
    (o) => o && (o.orderStatus === 'Cancelled' || o.orderStatus === 'Returned')
  ).length;
  const totalCustomersCount = new Set(
    safeOrders.map((o) => o?.customer?.phone).filter(Boolean)
  ).size;
  const totalProductsCount = safeProducts.length;
  const realizedRevenue = totalRevenueCalc;

  // Chart values matching Image 2
  const weeklySalesData = {
    '7d': [
      { day: 'Sat', amount: 2100, pct: 26 },
      { day: 'Sun', amount: 2850, pct: 36 },
      { day: 'Mon', amount: 3200, pct: 40 },
      { day: 'Tue', amount: 2760, pct: 35 },
      { day: 'Wed', amount: 4320, pct: 54 },
      { day: 'Thu', amount: 4980, pct: 62 },
      { day: 'Fri', amount: 5670, pct: 71, isHighlight: true },
    ],
    '14d': [
      { day: 'W1 Sat', amount: 2200, pct: 28 },
      { day: 'W1 Mon', amount: 3100, pct: 39 },
      { day: 'W1 Wed', amount: 3800, pct: 48 },
      { day: 'W1 Fri', amount: 4500, pct: 56 },
      { day: 'W2 Sun', amount: 3400, pct: 43 },
      { day: 'W2 Tue', amount: 4100, pct: 51 },
      { day: 'W2 Fri', amount: 5670, pct: 71, isHighlight: true },
    ],
    '30d': [
      { day: 'Week 1', amount: 16800, pct: 35 },
      { day: 'Week 2', amount: 22400, pct: 47 },
      { day: 'Week 3', amount: 29500, pct: 62 },
      { day: 'Week 4', amount: 38200, pct: 80, isHighlight: true },
    ],
  };

  const currentSales = (weeklySalesData && weeklySalesData[selectedTimeframe]) || weeklySalesData['7d'] || [];

  // Stock alerts start empty (previous demo items removed)
  const fallbackStockProducts: StockAlertItem[] = [];

  // Helper to sanitize stock alerts data
  const sanitizeAlerts = (items: any[]): StockAlertItem[] => {
    if (!Array.isArray(items)) return [];
    return items
      .filter((it) => it && typeof it === 'object')
      .map((it, idx) => ({
        id: String(it.id || `alert-${idx}-${Date.now()}`),
        name: String(it.name || 'Denim Jeans'),
        fit: String(it.fit || 'STRAIGHT FIT').toUpperCase(),
        stock: Number.isFinite(Number(it.stock)) ? Math.max(0, Number(it.stock)) : 25,
        image: String(it.image || 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=400&q=80'),
        productId: it.productId ? String(it.productId) : undefined,
      }));
  };

  // Dynamic stock alerts with multi-tier persistence (Cloud DB + localStorage)
  const [stockAlerts, setStockAlerts] = useState<StockAlertItem[]>([]);
  const [isAlertsInitialized, setIsAlertsInitialized] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockVal, setEditingStockVal] = useState<number>(30);

  // Direct Customer Messaging State
  const [messageOrder, setMessageOrder] = useState<any | null>(null);
  const [messageChannel, setMessageChannel] = useState<'whatsapp' | 'messenger'>('whatsapp');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  // Persist stock alerts immediately to both LocalStorage and Cloud DB
  const persistStockAlerts = (newList: StockAlertItem[]) => {
    const sanitized = sanitizeAlerts(newList);
    safeLocalStorageSet('jeansbd_admin_stock_alerts', JSON.stringify(sanitized));
    if (typeof updateSiteSettings === 'function') {
      try {
        updateSiteSettings({ stockAlerts: sanitized }).catch(() => {});
      } catch (e) {}
    }
  };

  // Load stock alerts on mount & sync from siteSettings (Cloud) or localStorage
  useEffect(() => {
    // 1. Try from siteSettings (Cloud DB) first if present
    if (Array.isArray(siteSettings?.stockAlerts) && siteSettings.stockAlerts.length > 0) {
      const sanitized = sanitizeAlerts(siteSettings.stockAlerts);
      setStockAlerts(sanitized);
      setIsAlertsInitialized(true);
      safeLocalStorageSet('jeansbd_admin_stock_alerts', JSON.stringify(sanitized));
      return;
    }

    // 2. Try from localStorage
    try {
      const saved = safeLocalStorageGet('jeansbd_admin_stock_alerts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out old legacy demo items if any
          const cleaned = parsed.filter(
            (it) =>
              it &&
              !['stock-1', 'stock-2', 'stock-3', 'stock-4'].includes(it.id) &&
              it.name !== 'Angel Wing Washed Denim' &&
              it.name !== 'Bleached Swirl Utility Denim' &&
              it.name !== 'Sword & Cross Studded Vintage..' &&
              it.name !== 'Cobblestone Textured Straight..'
          );
          const sanitized = sanitizeAlerts(cleaned);
          setStockAlerts(sanitized);
          setIsAlertsInitialized(true);
          safeLocalStorageSet('jeansbd_admin_stock_alerts', JSON.stringify(sanitized));
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved stock alerts', e);
    }

    // If neither has items and not initialized yet
    if (!isAlertsInitialized) {
      setStockAlerts([]);
      setIsAlertsInitialized(true);
    }
  }, [siteSettings?.stockAlerts, isAlertsInitialized]);

  const handleClearAllStockAlerts = () => {
    if (confirm('Are you sure you want to remove all stock alerts?')) {
      setStockAlerts([]);
      persistStockAlerts([]);
    }
  };

  const handleUpdateStock = (id: string, newStock: number) => {
    const val = Math.max(0, Number(newStock) || 0);
    const currentList = Array.isArray(stockAlerts) ? stockAlerts : [];
    const next = currentList.map((item) => (item.id === id ? { ...item, stock: val } : item));
    setStockAlerts(next);
    persistStockAlerts(next);

    const item = stockAlerts?.find((it) => it.id === id);
    if (item?.productId && typeof updateProduct === 'function') {
      try {
        updateProduct(item.productId, { totalStock: val });
      } catch (e) {}
    }
    setEditingStockId(null);
  };

  const handleRemoveStockAlert = (id: string) => {
    const currentList = Array.isArray(stockAlerts) ? stockAlerts : [];
    const next = currentList.filter((item) => item.id !== id);
    setStockAlerts(next);
    persistStockAlerts(next);
  };

  const handleAddStockAlert = (newItem: StockAlertItem) => {
    if (!newItem || !newItem.id) return;
    const currentList = Array.isArray(stockAlerts) ? stockAlerts : [];
    const filtered = currentList.filter(
      (it) => it.id !== newItem.id && (!newItem.productId || it.productId !== newItem.productId)
    );
    const next = [newItem, ...filtered];
    setStockAlerts(next);
    persistStockAlerts(next);
  };

  const openCustomerMessage = (order: any, channel: 'whatsapp' | 'messenger' = 'whatsapp') => {
    setMessageOrder(order);
    setMessageChannel(channel);
    setIsMessageModalOpen(true);
  };

  const lowStockCount = stockAlerts.length;

  // Table orders matching Image 2 with fallback
  const demoTableOrders = [
    {
      id: 'demo-1',
      orderNumber: 'ORD-84920',
      customer: {
        fullName: 'Ali Hasan Sheikh',
        phone: '01757543148',
        district: 'Dhaka',
      },
      totalAmount: 1970,
      paymentMethod: 'bkash',
      orderStatus: 'Shipped',
    },
    {
      id: 'demo-2',
      orderNumber: 'ORD-66122',
      customer: {
        fullName: 'Ali Hasan Sheikh',
        phone: '01757543148',
        district: 'Dhaka',
      },
      totalAmount: 2040,
      paymentMethod: 'cod',
      orderStatus: 'Processing',
    },
  ];

  const displayOrders = safeOrders.length > 0 ? safeOrders : demoTableOrders;

  const filteredOrders = displayOrders.filter((o) => {
    if (!o || typeof o !== 'object') return false;
    const orderNum = String(o.orderNumber || '').toLowerCase();
    const custName = String(o.customer?.fullName || '').toLowerCase();
    const custPhone = String(o.customer?.phone || '');
    const custDist = String(o.customer?.district || '').toLowerCase();
    const q = (orderSearch || '').toLowerCase().trim();
    const matchSearch =
      !q ||
      orderNum.includes(q) ||
      custName.includes(q) ||
      custPhone.includes(q) ||
      custDist.includes(q);
    const ordStatus = String(o.orderStatus || '').toLowerCase();
    const filterStatus = (orderStatusFilter || 'all').toLowerCase();
    const matchStatus =
      filterStatus === 'all' ||
      ordStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="w-full max-w-[1740px] mx-auto space-y-5 transition-colors duration-200">
      {/* 1. TOP UTILITY HEADER BAR (Matching Image 2) */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b ${
        isDark ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        {/* Search input with ⌘ K */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by order, customer, phone.."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            className={`w-full border rounded-2xl pl-9 pr-12 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors ${
              isDark
                ? 'bg-[#0d1527] border-slate-800 text-slate-200 placeholder:text-slate-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
            }`}
          />
          <span className={`absolute right-3 top-2.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
            isDark ? 'text-slate-400 bg-slate-800 border border-slate-700' : 'text-slate-500 bg-slate-100 border border-slate-200'
          }`}>
            ⌘ K
          </span>
        </div>

        {/* Right utility items */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Notification Bell */}
          <button
            title="Notifications"
            className={`relative p-2.5 rounded-2xl border transition-colors ${
              isDark
                ? 'bg-[#0d1527] border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">
              1
            </span>
          </button>

          {/* Theme Toggle */}
          <AdminThemeToggle variant="compact" />

          {/* Live Date & Time */}
          <div className="hidden lg:flex flex-col text-right pl-1">
            <span className={`text-[11px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {currentDate || 'Fri, 10 Oct 2025'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {currentTime || '10:24 AM'}
            </span>
          </div>

          {/* Admin Profile chip */}
          <div className={`flex items-center gap-2.5 pl-3 border-l ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Md. Ali Hasan Sheikh"
                className="w-8 h-8 rounded-full object-cover border border-blue-500/40"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-slate-900" />
            </div>
            <div className="hidden sm:block text-left">
              <h4 className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Md. Ali Hasan Sheikh
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GLOWING STORE PERFORMANCE OVERVIEW BANNER (Matching Image 2) */}
      <div className={`relative overflow-hidden rounded-3xl p-6 border shadow-2xl transition-all ${
        isDark
          ? 'bg-gradient-to-r from-[#0a1835] via-[#0f2249] to-[#261546] border-blue-500/20 shadow-black/50'
          : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-slate-200/50'
      }`}>
        {/* Ambient radial blur spots in background */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white shadow-xl shadow-blue-500/30 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className={`text-2xl lg:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Store Performance{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                    Overview
                  </span>
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Live Sync Active</span>
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-300/80' : 'text-slate-600'}`}>
                Real-time analytics, inventory stocks, and customer orders for Jeans BD.
              </p>
            </div>
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={toggleTheme}
              className={`px-4 py-2 rounded-2xl text-xs font-bold border flex items-center gap-1.5 transition-all active:scale-95 ${
                isDark
                  ? 'border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 text-slate-200'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-blue-400" />
              <span>{isDark ? 'Dark' : 'Light'}</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className={`px-4 py-2 rounded-2xl text-xs font-bold border flex items-center gap-1.5 transition-all active:scale-95 ${
                isDark
                  ? 'border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 text-slate-200'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Storefront</span>
            </Link>

            <Link
              href="/admin/settings?tab=home"
              className="px-4 py-2 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customize Homepage</span>
            </Link>

            <Link
              href="/admin/products?action=add"
              className="px-5 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center gap-2 shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </Link>
          </div>
        </div>
      </div>

      {/* QUICK HOMEPAGE CUSTOMIZER BAR */}
      <div className={`p-4 rounded-3xl border transition-all ${
        isDark
          ? 'bg-gradient-to-r from-slate-900/90 via-[#0d1629] to-slate-900/90 border-blue-500/20 shadow-lg'
          : 'bg-white border-blue-100 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Homepage Section Managers
            </h3>
            <span className="text-[10px] text-slate-400 font-medium hidden md:inline">
              (Quickly edit all 7 sections highlighted in your storefront)
            </span>
          </div>
          <Link
            href="/admin/settings?tab=home"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open All Homepage Settings</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-3">
          <Link
            href="/admin/settings?tab=home"
            className={`p-3 rounded-2xl border transition-all hover:border-blue-500/60 group ${
              isDark ? 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900' : 'bg-slate-50 border-slate-200 hover:bg-white'
            }`}
          >
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">Section 1</div>
            <div className={`text-xs font-bold truncate group-hover:text-blue-400 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Hero Slides Banner
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Titles, Photos, Badges</div>
          </Link>

          <Link
            href="/admin/categories"
            className={`p-3 rounded-2xl border transition-all hover:border-blue-500/60 group ${
              isDark ? 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900' : 'bg-slate-50 border-slate-200 hover:bg-white'
            }`}
          >
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">Section 2</div>
            <div className={`text-xs font-bold truncate group-hover:text-emerald-400 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Category Cards
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Names &amp; Computer Photos</div>
          </Link>

          <Link
            href="/admin/settings?tab=home"
            className={`p-3 rounded-2xl border transition-all hover:border-blue-500/60 group ${
              isDark ? 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900' : 'bg-slate-50 border-slate-200 hover:bg-white'
            }`}
          >
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-0.5">Section 3</div>
            <div className={`text-xs font-bold truncate group-hover:text-amber-400 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Flash Promo 30% Off
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Coupon, Text &amp; Models</div>
          </Link>

          <Link
            href="/admin/settings?tab=home"
            className={`p-3 rounded-2xl border transition-all hover:border-blue-500/60 group ${
              isDark ? 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900' : 'bg-slate-50 border-slate-200 hover:bg-white'
            }`}
          >
            <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-0.5">Section 4 &amp; 5</div>
            <div className={`text-xs font-bold truncate group-hover:text-sky-400 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Fit Guide &amp; Reviews
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Cards &amp; Testimonials</div>
          </Link>

          <Link
            href="/admin/settings?tab=header-footer"
            className={`p-3 rounded-2xl border transition-all hover:border-blue-500/60 group ${
              isDark ? 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900' : 'bg-slate-50 border-slate-200 hover:bg-white'
            }`}
          >
            <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-0.5">Section 6 &amp; 7</div>
            <div className={`text-xs font-bold truncate group-hover:text-purple-400 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Lookbook &amp; Footer
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Socials, Contacts, Bio</div>
          </Link>
        </div>
      </div>

      {/* 3. ROW 1: 6 KPI METRIC CARDS (Exact match to Image 2) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. TOTAL SALES */}
        <div className={`p-4 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
          isDark ? 'bg-[#0b1325]/90 border-slate-800/90 hover:border-purple-500/30 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Sales
            </span>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {formatPrice(totalSales)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/20">
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
              ↑ 12.5% <span className="text-slate-400 font-normal">vs last week</span>
            </span>
            <svg className="w-14 h-6 text-purple-400 shrink-0" viewBox="0 0 60 24" fill="none">
              <path d="M2 18 Q 15 20, 25 12 T 45 8 T 58 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 2. TOTAL ORDERS */}
        <div className={`p-4 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
          isDark ? 'bg-[#0b1325]/90 border-slate-800/90 hover:border-blue-500/30 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Orders
            </span>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {totalOrdersCount}
          </div>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/20">
            <span className="text-[10px] font-bold text-blue-400">100% tracked</span>
            <svg className="w-14 h-6 text-blue-400 shrink-0" viewBox="0 0 60 24" fill="none">
              <path d="M2 20 Q 20 22, 30 14 T 48 8 T 58 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 3. PENDING ORDERS */}
        <div className={`p-4 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
          isDark ? 'bg-[#0b1325]/90 border-slate-800/90 hover:border-amber-500/30 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Orders
            </span>
          </div>
          <div className="text-2xl font-black text-amber-400">
            {pendingOrdersCount}
          </div>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/20">
            <span className="text-[10px] font-bold text-amber-400">Need action</span>
            <svg className="w-14 h-6 text-amber-400 shrink-0" viewBox="0 0 60 24" fill="none">
              <path d="M2 16 Q 18 10, 32 18 T 50 12 T 58 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 4. PROCESSING ORDERS */}
        <div className={`p-4 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
          isDark ? 'bg-[#0b1325]/90 border-slate-800/90 hover:border-cyan-500/30 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Processing Orders
            </span>
          </div>
          <div className="text-2xl font-black text-cyan-400">
            {processingOrdersCount}
          </div>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/20">
            <span className="text-[10px] font-bold text-cyan-400">In packing/courier</span>
            <svg className="w-14 h-6 text-cyan-400 shrink-0" viewBox="0 0 60 24" fill="none">
              <path d="M2 18 Q 16 8, 30 16 T 46 6 T 58 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 5. DELIVERED ORDERS */}
        <div className={`p-4 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
          isDark ? 'bg-[#0b1325]/90 border-slate-800/90 hover:border-emerald-500/30 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Delivered Orders
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {deliveredOrdersCount}
          </div>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/20">
            <span className="text-[10px] font-bold text-emerald-400">96% success</span>
            <svg className="w-14 h-6 text-emerald-400 shrink-0" viewBox="0 0 60 24" fill="none">
              <path d="M2 16 Q 18 20, 32 12 T 48 6 T 58 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 6. CANCELLED ORDERS */}
        <div className={`p-4 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
          isDark ? 'bg-[#0b1325]/90 border-slate-800/90 hover:border-rose-500/30 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Cancelled Orders
            </span>
          </div>
          <div className="text-2xl font-black text-rose-400">
            {cancelledOrdersCount}
          </div>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/20">
            <span className="text-[10px] font-bold text-rose-400">Return/Reject</span>
            <svg className="w-14 h-6 text-rose-400 shrink-0" viewBox="0 0 60 24" fill="none">
              <path d="M2 12 Q 18 6, 32 16 T 48 10 T 58 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* 4. ROW 2: 4 KPI METRIC CARDS (Exact match to Image 2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 7. TOTAL CUSTOMERS */}
        <div className={`p-4 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
          isDark ? 'bg-[#0b1325]/90 border-slate-800/90 hover:border-blue-500/30 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Customers
            </span>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {totalCustomersCount}
          </div>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/20">
            <span className="text-[10px] font-bold text-cyan-400">+2.8% this month</span>
            <svg className="w-14 h-6 text-blue-400 shrink-0" viewBox="0 0 60 24" fill="none">
              <path d="M2 18 Q 16 22, 30 14 T 46 8 T 58 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 8. TOTAL PRODUCTS */}
        <div className={`p-4 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
          isDark ? 'bg-[#0b1325]/90 border-slate-800/90 hover:border-purple-500/30 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Products
            </span>
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {totalProductsCount}
          </div>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/20">
            <span className="text-[10px] font-bold text-purple-400">+3 categories</span>
            <svg className="w-14 h-6 text-purple-400 shrink-0" viewBox="0 0 60 24" fill="none">
              <path d="M2 16 Q 16 8, 30 14 T 46 6 T 58 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 9. LOW STOCK ALERTS */}
        <div className={`p-4 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
          isDark ? 'bg-[#0b1325]/90 border-slate-800/90 hover:border-amber-500/30 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Low Stock Alerts
            </span>
          </div>
          <div className="text-2xl font-black text-amber-400">
            {lowStockCount} items
          </div>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/20">
            <span className="text-[10px] font-bold text-amber-400">Needs attention</span>
            <svg className="w-14 h-6 text-amber-400 shrink-0" viewBox="0 0 60 24" fill="none">
              <path d="M2 18 Q 18 22, 32 12 T 48 14 T 58 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 10. REALIZED REVENUE */}
        <div className={`p-4 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
          isDark ? 'bg-[#0b1325]/90 border-slate-800/90 hover:border-teal-500/30 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Realized Revenue
            </span>
          </div>
          <div className="text-2xl font-black text-teal-400">
            {formatPrice(realizedRevenue)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/20">
            <span className="text-[10px] font-bold text-teal-400">Paid orders</span>
            <svg className="w-14 h-6 text-teal-400 shrink-0" viewBox="0 0 60 24" fill="none">
              <path d="M2 18 Q 18 12, 32 18 T 48 8 T 58 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* 5. MIDDLE SECTION: WEEKLY REVENUE & STOCK ALERTS (Exact match to Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* WEEKLY REVENUE (BDT) (8 Cols) */}
        <div className={`lg:col-span-8 p-6 rounded-3xl border shadow-xl transition-all ${
          isDark ? 'bg-[#0b1325]/90 border-slate-800/90' : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Weekly Revenue (BDT)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Daily sales performance across Bangladesh
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Pills 7D, 14D, 30D */}
              <div className={`p-1 rounded-xl flex items-center gap-1 border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                {(['7d', '14d', '30d'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                      selectedTimeframe === tf
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tf.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Avg Badge */}
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                Avg: ৳4,560 / day
              </span>
            </div>
          </div>

          {/* Chart Canvas with Y-axis and Price labels above bars */}
          <div className="relative pt-6">
            {/* Horizontal dotted guide lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pl-8">
              <div className="border-b border-dashed border-slate-800/80 w-full" />
              <div className="border-b border-dashed border-slate-800/80 w-full" />
              <div className="border-b border-dashed border-slate-800/80 w-full" />
              <div className="border-b border-dashed border-slate-800/80 w-full" />
              <div className="border-b border-slate-800/80 w-full" />
            </div>

            {/* Chart Area */}
            <div className="flex items-end gap-3 h-56 relative z-10">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between h-44 text-[10px] font-bold text-slate-500 shrink-0 pb-1">
                <span>8K</span>
                <span>6K</span>
                <span>4K</span>
                <span>2K</span>
                <span>0</span>
              </div>

              {/* 7 Columns */}
              <div className="flex-1 flex items-end justify-between gap-3 sm:gap-4 h-full pl-2">
                {currentSales.map((item) => (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    {/* Value Badge above Bar */}
                    <span className={`text-[10px] font-mono font-black transition-all ${
                      item.isHighlight ? 'text-cyan-400 font-extrabold scale-105' : 'text-slate-300'
                    }`}>
                      {formatPrice(item.amount)}
                    </span>

                    {/* Bar Pillar */}
                    <div className="w-full max-w-[58px] bg-slate-900/40 rounded-t-2xl flex items-end h-40">
                      <div
                        className={`w-full rounded-t-2xl transition-all duration-500 group-hover:scale-y-105 origin-bottom ${
                          item.isHighlight
                            ? 'bg-gradient-to-t from-blue-600 via-indigo-500 to-fuchsia-400 shadow-xl shadow-fuchsia-500/25 ring-1 ring-fuchsia-400/40'
                            : 'bg-gradient-to-t from-blue-700 via-blue-500 to-cyan-400 shadow-md shadow-blue-500/20'
                        }`}
                        style={{ height: `${item.pct}%` }}
                      />
                    </div>

                    {/* Day Label */}
                    <span className={`text-[11px] font-bold transition-colors ${
                      item.isHighlight ? 'text-white font-black' : 'text-slate-400'
                    }`}>
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STOCK ALERTS (4 Cols) */}
        <div className={`lg:col-span-4 p-6 rounded-3xl border shadow-xl transition-all ${
          isDark ? 'bg-[#0b1325]/90 border-slate-800/90' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <Bell className="w-4 h-4" />
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-1 right-1 animate-pulse" />
              </div>
              <div>
                <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Stock Alerts ({stockAlerts.length})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Items nearing depletion • Click stock to edit
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsStockModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Alert</span>
              </button>

              {stockAlerts.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllStockAlerts}
                  className="text-xs font-bold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Clear all alerts"
                >
                  Clear All
                </button>
              )}

              <Link
                href="/admin/products"
                className="text-xs font-bold text-slate-400 hover:text-blue-400 transition-colors hidden sm:inline"
              >
                Manage
              </Link>
            </div>
          </div>

          {/* Dynamic Products List with Inline Edit & Remove */}
          <div className="space-y-3">
            {(!stockAlerts || stockAlerts.length === 0) ? (
              <div className="text-center py-8 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  No Low Stock Alerts
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Previous demo items have been removed. Click below to add products from catalog.
                </p>
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Stock Alert</span>
                </button>
              </div>
            ) : (
              (Array.isArray(stockAlerts) ? stockAlerts : []).map((p, pIdx) => {
                if (!p) return null;
                const pId = p.id || `stock-${pIdx}`;
                const isEditing = editingStockId === pId;
                const pName = p.name || 'Denim Item';
                const pFit = p.fit || 'STRAIGHT FIT';
                const pStock = Number.isFinite(Number(p.stock)) ? Math.max(0, Number(p.stock)) : 0;
                const pImage = p.image || 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=400&q=80';

                return (
                  <div
                    key={pId}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all group ${
                      isDark
                        ? 'bg-[#0d172e]/60 border-slate-800/80 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={pImage}
                        alt={pName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700/60 shrink-0"
                      />
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className={`font-bold text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {pName}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {pFit}
                          </span>
                          <span className="text-slate-500 text-[10px]">•</span>
                          <span className={`text-[10px] font-bold ${
                            pStock <= 10 ? 'text-rose-400' : 'text-amber-400'
                          }`}>
                            {pStock <= 10 ? 'Critical Stock' : 'Low Stock'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-blue-500 shadow-md">
                          <button
                            type="button"
                            onClick={() => setEditingStockVal((v) => Math.max(0, v - 1))}
                            className="w-5 h-5 rounded-lg bg-slate-800 text-white font-black text-xs hover:bg-slate-700 flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={editingStockVal}
                            onChange={(e) => setEditingStockVal(parseInt(e.target.value) || 0)}
                            className="w-10 text-center bg-transparent text-white font-mono font-bold text-xs focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setEditingStockVal((v) => v + 1)}
                            className="w-5 h-5 rounded-lg bg-slate-800 text-white font-black text-xs hover:bg-slate-700 flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStock(p.id, editingStockVal)}
                            className="w-5 h-5 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-500 flex items-center justify-center cursor-pointer"
                            title="Save stock"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStockId(null)}
                            className="w-5 h-5 rounded-lg bg-slate-800 text-slate-400 text-xs hover:text-white flex items-center justify-center cursor-pointer"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStockId(p.id);
                            setEditingStockVal(p.stock);
                          }}
                          title="Click to edit stock level"
                          className="group/badge inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl shrink-0 text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:border-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
                        >
                          <span>{p.stock} left</span>
                          <span className="text-[10px] text-amber-500/70 group-hover/badge:text-amber-300">✎</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveStockAlert(p.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                        title="Remove from alerts"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 6. BOTTOM SECTION: RECENT CUSTOMER ORDERS (Exact match to Image 2) */}
      <div className={`p-6 rounded-3xl border shadow-xl transition-all ${
        isDark ? 'bg-[#0b1325]/90 border-slate-800/90' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Recent Customer Orders
              </h3>
              <p className="text-[11px] text-slate-400">
                Track and updates live customer deliveries in Bangladesh
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}>
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by order, customer, phone..."
                className="bg-transparent focus:outline-none w-44 sm:w-56 text-xs placeholder:text-slate-500"
              />
            </div>

            {/* Filter Pills */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border text-xs ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              {(['all', 'Pending', 'Shipped', 'Delivered'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                    orderStatusFilter.toLowerCase() === st.toLowerCase()
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'all' ? 'ALL' : st.toUpperCase()}
                </button>
              ))}
            </div>

            <Link
              href="/admin/orders"
              className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1"
            >
              <span>View All ({displayOrders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Table matching Image 2 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`text-[11px] font-black uppercase tracking-wider border-b ${
              isDark ? 'text-slate-400 border-slate-800/80' : 'text-slate-500 border-slate-200'
            }`}>
              <tr>
                <th className="py-3 px-3">Order No</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">District</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium ${
              isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-100 text-slate-700'
            }`}>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord, ordIdx) => {
                  if (!ord) return null;
                  const fullName = ord.customer?.fullName || 'Valued Customer';
                  const initials = fullName
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase() || 'JB';

                  const customerPhone = ord.customer?.phone || 'N/A';
                  const customerDistrict = ord.customer?.district || 'Dhaka';
                  const orderNum = ord.orderNumber || `ORD-${ordIdx + 1}`;
                  const totalAmt = Number(ord.totalAmount) || 0;
                  const payMethod = ord.paymentMethod || 'cod';
                  const ordStatus = ord.orderStatus || 'Pending';

                  const isShipped = ordStatus === 'Shipped';
                  const isProcessing = ordStatus === 'Processing' || ordStatus === 'Confirmed';
                  const isDelivered = ordStatus === 'Delivered';

                  return (
                    <tr
                      key={ord.id || `ord-row-${ordIdx}`}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Order No */}
                      <td className="py-3.5 px-3">
                        <span className={`font-mono font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {orderNum}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {fullName}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-slate-400 font-mono">
                                {customerPhone}
                              </span>
                              {/* Direct mini channel triggers */}
                              <button
                                type="button"
                                onClick={() => openCustomerMessage(ord, 'whatsapp')}
                                title="Message on WhatsApp"
                                className="text-emerald-400 hover:text-emerald-300 p-0.5 hover:bg-emerald-500/10 rounded transition-colors cursor-pointer"
                              >
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.983.541 1.879.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm3.385 8.163c-.144.405-.837.774-1.17.822-.312.043-.681.077-2.203-.554-1.944-.805-3.18-2.778-3.277-2.907-.097-.129-.788-1.047-.788-1.996 0-.949.499-1.417.676-1.611.178-.194.388-.242.517-.242.13 0 .259.002.371.008.119.006.278-.045.435.334.162.388.55 1.341.599 1.438.048.097.081.21.016.339-.065.129-.097.21-.194.323-.097.113-.205.253-.293.34-.097.097-.198.202-.085.396.113.194.502.828 1.078 1.342.741.661 1.365.865 1.559.962.194.097.307.081.42-.048.113-.129.484-.565.613-.759.129-.194.258-.162.436-.097.178.065 1.13.533 1.324.63.194.097.323.145.371.226.048.081.048.469-.096.874zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.176L2 22l4.981-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.636 0-3.167-.488-4.453-1.327l-.319-.209-2.955.775.789-2.88-.23-.366A8.136 8.136 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z"/>
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => openCustomerMessage(ord, 'messenger')}
                                title="Message on Facebook Messenger"
                                className="text-blue-400 hover:text-blue-300 p-0.5 hover:bg-blue-500/10 rounded transition-colors cursor-pointer"
                              >
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.512 3.735 7.151V22l3.414-1.874c.905.251 1.864.387 2.851.387 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.002 12.441l-2.56-2.73-5 2.73 5.5-5.84 2.62 2.73 4.94-2.73-5.5 5.84z"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* District */}
                      <td className="py-3.5 px-3">
                        <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {customerDistrict}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-3">
                        <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {formatPrice(totalAmt)}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                          payMethod === 'bkash'
                            ? 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {payMethod === 'bkash' ? 'bKash' : 'COD'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          isDelivered
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : isShipped
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isDelivered ? 'bg-emerald-400' : isShipped ? 'bg-blue-400' : 'bg-amber-400'
                          }`} />
                          <span>{ordStatus}</span>
                        </span>
                      </td>

                      {/* Quick Action */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Direct Action */}
                          <button
                            type="button"
                            onClick={() => openCustomerMessage(ord, 'whatsapp')}
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-[#25D366] text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-[#25D366] shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            title="Direct Message on WhatsApp"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.983.541 1.879.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm3.385 8.163c-.144.405-.837.774-1.17.822-.312.043-.681.077-2.203-.554-1.944-.805-3.18-2.778-3.277-2.907-.097-.129-.788-1.047-.788-1.996 0-.949.499-1.417.676-1.611.178-.194.388-.242.517-.242.13 0 .259.002.371.008.119.006.278-.045.435.334.162.388.55 1.341.599 1.438.048.097.081.21.016.339-.065.129-.097.21-.194.323-.097.113-.205.253-.293.34-.097.097-.198.202-.085.396.113.194.502.828 1.078 1.342.741.661 1.365.865 1.559.962.194.097.307.081.42-.048.113-.129.484-.565.613-.759.129-.194.258-.162.436-.097.178.065 1.13.533 1.324.63.194.097.323.145.371.226.048.081.048.469-.096.874zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.176L2 22l4.981-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.636 0-3.167-.488-4.453-1.327l-.319-.209-2.955.775.789-2.88-.23-.366A8.136 8.136 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z"/>
                            </svg>
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>

                          {/* Facebook Messenger Action */}
                          <button
                            type="button"
                            onClick={() => openCustomerMessage(ord, 'messenger')}
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-blue-500/15 hover:bg-gradient-to-r hover:from-[#0084FF] hover:to-[#A824F3] text-blue-400 hover:text-white border border-blue-500/30 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            title="Direct Message on Facebook Messenger"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.512 3.735 7.151V22l3.414-1.874c.905.251 1.864.387 2.851.387 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.002 12.441l-2.56-2.73-5 2.73 5.5-5.84 2.62 2.73 4.94-2.73-5.5 5.84z"/>
                            </svg>
                            <span className="hidden sm:inline">Messenger</span>
                          </button>

                          {/* Manage Link */}
                          <Link
                            href={`/admin/orders?order=${orderNum}`}
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-all active:scale-95 ${
                              isDark
                                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                            }`}
                          >
                            <span>Manage</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Customer Message Modal */}
      <CustomerMessageModal
        order={messageOrder}
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        initialChannel={messageChannel}
      />

      {/* Add Item to Stock Alerts Modal */}
      <StockAlertModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onAddAlert={handleAddStockAlert}
        existingAlertIds={Array.isArray(stockAlerts) ? stockAlerts.map((s) => s?.productId || s?.id || '').filter(Boolean) : []}
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[1740px] mx-auto p-8 flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold font-mono tracking-wider text-slate-400">
              LOADING DASHBOARD ANALYTICS...
            </span>
          </div>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}


