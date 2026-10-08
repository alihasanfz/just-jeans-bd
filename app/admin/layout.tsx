'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Layers,
  Box,
  PlusCircle,
  Split,
  Sparkles,
  Camera,
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
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  Activity,
  Settings,
  Lock,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { useOrder } from '@/lib/store/orderContext';
import { useProducts } from '@/lib/store/productsContext';
import { AdminThemeProvider, useAdminTheme } from '@/lib/store/adminThemeContext';
import AdminThemeToggle from '@/components/admin/AdminThemeToggle';

export interface AdminUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
  permissions?: string[];
}

export function isUserSuperAdmin(user: AdminUser | null): boolean {
  if (!user) return false;
  // Strictly check if the user is designated as Super Admin or has All Permissions
  return (
    user.role === 'Super Admin' ||
    (Array.isArray(user.permissions) && user.permissions.includes('All Permissions'))
  );
}

export function hasPermissionForPath(
  user: AdminUser | null,
  pathname: string
): boolean {
  if (!user) return true; // loading or default
  if (isUserSuperAdmin(user)) return true;

  const perms = user.permissions || [];

  // 1. Dashboard is always accessible
  if (pathname === '/admin') return true;

  // 2. Products & Catalog Group
  if (
    pathname.startsWith('/admin/products') ||
    pathname.startsWith('/admin/try-on') ||
    pathname.startsWith('/admin/departments') ||
    pathname.startsWith('/admin/categories') ||
    pathname.startsWith('/admin/subcategories') ||
    pathname.startsWith('/admin/tags') ||
    pathname.startsWith('/admin/attributes')
  ) {
    return perms.includes('Manage Products');
  }

  // 3. Orders
  if (pathname.startsWith('/admin/orders')) {
    return perms.includes('Manage Orders');
  }

  // 4. Delivery & Couriers
  if (pathname.startsWith('/admin/delivery')) {
    return perms.includes('Assign Courier (Steadfast/Pathao)') || perms.includes('Manage Orders');
  }

  // 5. Coupons & Discounts
  if (pathname.startsWith('/admin/coupons')) {
    return perms.includes('Discount Coupons');
  }

  // 6. Customers
  if (pathname.startsWith('/admin/customers')) {
    return perms.includes('Customer Data Access');
  }

  // 7. Sales Analytics
  if (pathname.startsWith('/admin/analytics')) {
    return perms.includes('Financial Reports & Analytics');
  }

  // 8. Store Settings
  if (pathname.startsWith('/admin/settings')) {
    return perms.includes('Logistics & Store Settings');
  }

  // 9. Staff Management (RBAC) - Strictly Super Admin only
  if (pathname.startsWith('/admin/staff')) {
    return isUserSuperAdmin(user);
  }

  return true;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('jeansbd_admin_auth');
      const hasCookie = document.cookie.includes('jeansbd_admin_session=');

      if (auth === 'true' || hasCookie) {
        if (!hasCookie) {
          document.cookie = 'jeansbd_admin_session=authenticated; path=/; max-age=604800; SameSite=Lax';
        }
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [pathname, router]);

  // If viewing login page, render full screen without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // While checking auth, show protective shield
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-8 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Lock className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-xs font-bold font-mono tracking-wider text-slate-300">
            VERIFYING ADMIN ACCESS...
          </span>
        </div>
      </div>
    );
  }

  // If unauthorized, block rendering while redirecting to login
  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminThemeProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-8 text-slate-400">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold font-mono tracking-wider">LOADING ADMIN CONSOLE...</span>
            </div>
          </div>
        }
      >
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </Suspense>
    </AdminThemeProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jeansbd_admin_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Sync with staff list if permissions or role were updated by super admin
          const savedStaff = localStorage.getItem('jeansbd_staff');
          if (savedStaff && parsed.email) {
            const staffList = JSON.parse(savedStaff);
            const found = staffList.find(
              (s: any) => s.email && s.email.toLowerCase() === parsed.email.toLowerCase()
            );
            if (found) {
              parsed.permissions = found.permissions || [];
              parsed.role = found.role || parsed.role;
              parsed.avatar = found.avatar || parsed.avatar;
              parsed.name = found.name || parsed.name;
              localStorage.setItem('jeansbd_admin_user', JSON.stringify(parsed));
            }
          }
          setCurrentUser(parsed);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsUserLoaded(true);
      }
    }
  }, [pathname]);

  const hasAccess = hasPermissionForPath(currentUser, pathname);

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-200 selection:bg-blue-600 selection:text-white ${
        isDark ? 'bg-[#090d16] text-slate-100' : 'bg-[#f4f7fb] text-slate-800'
      }`}
    >
      {/* Mobile Top Header */}
      <div
        className={`md:hidden flex items-center justify-between p-4 border-b sticky top-0 z-30 ${
          isDark ? 'bg-[#0d1322] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Open Admin Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-xs">
              JB
            </div>
            <span className={`font-black text-sm uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              JEANS BD <span className="text-blue-500">ADMIN</span>
            </span>
          </Link>
        </div>
        <AdminThemeToggle variant="compact" />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Suspense
          fallback={
            <aside
              className={`w-64 border-r flex-shrink-0 p-4 ${
                isDark ? 'bg-[#0d1322] border-slate-800/80' : 'bg-white border-slate-200'
              }`}
            >
              <div className={`h-8 rounded-xl animate-pulse ${isDark ? 'bg-slate-800/60' : 'bg-slate-200'}`} />
            </aside>
          }
        >
          <AdminSidebar
            currentUser={currentUser}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          />
        </Suspense>
      </div>

      {/* Mobile Drawer Modal */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-scale-in">
            <Suspense
              fallback={
                <aside className="w-full h-full bg-[#0d1322] p-4 text-slate-400 text-xs">
                  Loading menu...
                </aside>
              }
            >
              <AdminSidebar
                currentUser={currentUser}
                isCollapsed={false}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* Main Admin Area */}
      <main
        className={`flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto transition-colors duration-200 ${
          isDark ? 'bg-[#090d16]/95' : 'bg-[#f4f7fb]'
        }`}
      >
        {isUserLoaded && !hasAccess ? (
          /* Sleek Access Restricted Alert Shield Screen */
          <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div
              className={`max-w-md w-full p-8 rounded-3xl border text-center space-y-5 shadow-2xl animate-scale-up ${
                isDark ? 'bg-slate-950 border-rose-500/30' : 'bg-white border-rose-200 shadow-xl'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
                <ShieldAlert className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                  Access Restricted • RBAC Security
                </span>
                <h2 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Insufficient Permissions
                </h2>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Your staff account (<strong className="text-blue-400">{currentUser?.email}</strong>) does not have permission to view or manage this section.
                </p>
              </div>

              <div
                className={`p-3.5 rounded-2xl border text-left text-xs ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className={`text-[10px] uppercase font-bold block mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Your Current Granted Privileges:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentUser?.permissions && currentUser.permissions.length > 0 ? (
                    currentUser.permissions.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] font-semibold bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md"
                      >
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">No special privileges assigned</span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/admin"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Authorized Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}

interface AdminSidebarProps {
  currentUser?: AdminUser | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

function AdminSidebar({
  currentUser,
  isCollapsed = false,
  onToggleCollapse,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get('tab') : null;
  const currentAction = searchParams ? searchParams.get('action') : null;

  const { orders } = useOrder();
  const { products } = useProducts();
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const isSuperAdmin = isUserSuperAdmin(currentUser || null);
  const userPerms = currentUser?.permissions || [];

  // Granular permission flags
  const canManageProducts = isSuperAdmin || userPerms.includes('Manage Products');
  const canManageOrders = isSuperAdmin || userPerms.includes('Manage Orders');
  const canManageCouriers =
    isSuperAdmin ||
    userPerms.includes('Assign Courier (Steadfast/Pathao)') ||
    userPerms.includes('Manage Orders');
  const canManageCoupons = isSuperAdmin || userPerms.includes('Discount Coupons');
  const canManageCustomers = isSuperAdmin || userPerms.includes('Customer Data Access');
  const canViewAnalytics = isSuperAdmin || userPerms.includes('Financial Reports & Analytics');
  const canManageSettings = isSuperAdmin || userPerms.includes('Logistics & Store Settings');
  const canManageStaff = isSuperAdmin;

  // Collapsible sections state
  const isProductsActive =
    pathname.startsWith('/admin/products') ||
    pathname.startsWith('/admin/try-on') ||
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
      className={`h-full border-r flex-shrink-0 flex flex-col justify-between select-none transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${
        isDark ? 'bg-[#0d1322] border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="p-3.5 space-y-3 overflow-y-auto">
        {/* Logo & Brand Header */}
        <div
          className={`flex items-center justify-between px-2 py-2 border-b pb-3.5 ${
            isDark ? 'border-slate-800/60' : 'border-slate-100'
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5 group overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-700 to-blue-500 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md shadow-blue-500/20 shrink-0">
              JB
            </div>
            {!isCollapsed && (
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
            )}
          </Link>

          {/* Desktop collapse toggle / Mobile close */}
          {onCloseMobile ? (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          ) : onToggleCollapse ? (
            <button
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors ${
                isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
              }`}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          ) : null}
        </div>

        {/* Navigation */}
        <nav className="space-y-1 text-[13px]">
          {/* 1. Dashboard (Always Accessible) */}
          <Link
            href="/admin"
            onClick={onCloseMobile}
            title="Dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
              pathname === '/admin' && !currentAction && !currentTab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-blue-500 shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>

          {/* 2. Denim Products Group (RBAC: Manage Products) */}
          {canManageProducts && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setProductsOpen((prev) => !prev)}
                title="Denim Products"
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
                  <Layers className="w-4 h-4 text-amber-500 shrink-0" />
                  {!isCollapsed && <span>Products</span>}
                </div>
                {!isCollapsed && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border ${
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
                )}
              </button>

              {/* Sub-menu */}
              {productsOpen && !isCollapsed && (
                <div
                  className={`ml-5 pl-3 border-l my-1 space-y-1 ${
                    isDark ? 'border-slate-800/80' : 'border-slate-200'
                  }`}
                >
                  <Link
                    href="/admin/products"
                    onClick={onCloseMobile}
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
                    onClick={onCloseMobile}
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
                    href="/admin/try-on"
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      pathname === '/admin/try-on'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : isDark
                        ? 'text-purple-300 hover:text-white hover:bg-slate-800/40'
                        : 'text-purple-700 hover:text-purple-950 hover:bg-purple-50'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Virtual Try-On</span>
                    <span className="ml-auto bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] px-1.5 py-0.2 rounded font-black">
                      AI
                    </span>
                  </Link>

                  <Link
                    href="/admin/departments"
                    onClick={onCloseMobile}
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
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      pathname === '/admin/categories'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Categories</span>
                  </Link>

                  <Link
                    href="/admin/subcategories"
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      pathname === '/admin/subcategories'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Sub-Categories</span>
                  </Link>

                  <Link
                    href="/admin/tags"
                    onClick={onCloseMobile}
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
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      pathname === '/admin/attributes'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Attributes (Sizes, Fits)</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 3. Orders (RBAC: Manage Orders) */}
          {canManageOrders && (
            <Link
              href="/admin/orders"
              onClick={onCloseMobile}
              title="Orders"
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
                pathname === '/admin/orders'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 text-blue-500 shrink-0" />
                {!isCollapsed && <span>Orders</span>}
              </div>
              {!isCollapsed && (
                <span className="bg-blue-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm">
                  {orders.length}
                </span>
              )}
            </Link>
          )}

          {/* 4. Customers (RBAC: Customer Data Access) */}
          {canManageCustomers && (
            <Link
              href="/admin/customers"
              onClick={onCloseMobile}
              title="Customers"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
                pathname === '/admin/customers'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-blue-500 shrink-0" />
              {!isCollapsed && <span>Customers</span>}
            </Link>
          )}

          {/* 5. Delivery Management (RBAC: Assign Courier / Manage Orders) */}
          {canManageCouriers && (
            <Link
              href="/admin/delivery"
              onClick={onCloseMobile}
              title="Delivery Management"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
                pathname === '/admin/delivery'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-4 h-4 text-blue-500 shrink-0" />
              {!isCollapsed && <span>Delivery & Couriers</span>}
            </Link>
          )}

          {/* 6. Discounts & Promos (RBAC: Discount Coupons) */}
          {canManageCoupons && (
            <Link
              href="/admin/coupons"
              onClick={onCloseMobile}
              title="Discounts & Promos"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
                pathname === '/admin/coupons'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Percent className="w-4 h-4 text-blue-500 shrink-0" />
              {!isCollapsed && <span>Coupons</span>}
            </Link>
          )}

          {/* 7. Sales Analytics (RBAC: Financial Reports & Analytics) */}
          {canViewAnalytics && (
            <Link
              href="/admin/analytics"
              onClick={onCloseMobile}
              title="Sales Analytics"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
                pathname === '/admin/analytics'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />
              {!isCollapsed && <span>Analytics</span>}
            </Link>
          )}

          {/* 8. Sub-Admins & Staff (RBAC: Strictly Super Admin only) */}
          {canManageStaff && (
            <Link
              href="/admin/staff"
              onClick={onCloseMobile}
              title="Sub-Admins & Staff"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
                pathname === '/admin/staff'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
              {!isCollapsed && <span>Staff & Roles</span>}
            </Link>
          )}

          {/* 9. Store Settings Group (RBAC: Logistics & Store Settings) */}
          {canManageSettings && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setSettingsOpen((prev) => !prev)}
                title="Store Settings"
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
                  <Sliders className="w-4 h-4 text-blue-500 shrink-0" />
                  {!isCollapsed && <span>Settings</span>}
                </div>
                {!isCollapsed && (
                  settingsOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )
                )}
              </button>

              {/* Sub-menu */}
              {settingsOpen && !isCollapsed && (
                <div
                  className={`ml-5 pl-3 border-l my-1 space-y-0.5 ${
                    isDark ? 'border-slate-800/80' : 'border-slate-200'
                  }`}
                >
                  <Link
                    href="/admin/settings?tab=store"
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      pathname === '/admin/settings' && (!currentTab || currentTab === 'store')
                        ? 'text-blue-500 font-bold bg-blue-500/10'
                        : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Store Profile</span>
                  </Link>

                  <Link
                    href="/admin/settings?tab=home"
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      pathname === '/admin/settings' && currentTab === 'home'
                        ? 'text-blue-500 font-bold bg-blue-500/10'
                        : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutTemplate className="w-3.5 h-3.5 text-blue-400" />
                    <span>Home Sections</span>
                  </Link>

                  <Link
                    href="/admin/settings?tab=header-footer"
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      pathname === '/admin/settings' && currentTab === 'header-footer'
                        ? 'text-blue-500 font-bold bg-blue-500/10'
                        : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Rows className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Trust & Footer</span>
                  </Link>

                  <Link
                    href="/admin/settings?tab=payments"
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      pathname === '/admin/settings' && currentTab === 'payments'
                        ? 'text-blue-500 font-bold bg-blue-500/10'
                        : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payments</span>
                  </Link>

                  <Link
                    href="/admin/settings?tab=shipping"
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      pathname === '/admin/settings' && currentTab === 'shipping'
                        ? 'text-blue-500 font-bold bg-blue-500/10'
                        : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Shipping Fees</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Profile & Actions Section */}
      <div
        className={`p-3 border-t space-y-2 mt-auto transition-colors duration-200 ${
          isDark
            ? 'border-slate-800/80 bg-[#0a0f1d]/90'
            : 'border-slate-200 bg-slate-50/90'
        }`}
      >
        {!isCollapsed && <AdminThemeToggle variant="full" />}

        {/* Admin Profile Card */}
        {!isCollapsed && (
          <div
            className={`border rounded-2xl p-2.5 flex items-center gap-2.5 transition-colors ${
              isDark
                ? 'bg-[#121826] border-slate-800/90'
                : 'bg-white border-slate-200/90 shadow-xs'
            }`}
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name || 'Admin'}
                className="w-8 h-8 rounded-xl object-cover border border-blue-500/40 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-500 font-black text-xs flex items-center justify-center shrink-0 uppercase">
                {currentUser?.name
                  ? currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                  : 'AD'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4
                className={`font-bold text-xs leading-tight truncate ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {currentUser?.name || 'Admin User'}
              </h4>
              <p className="text-[10px] text-blue-400 font-semibold truncate mt-0.5">
                {currentUser?.role || 'Staff Admin'}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons: STOREFRONT & LOGOUT */}
        <div className={`grid ${isCollapsed ? 'grid-cols-1' : 'grid-cols-2'} gap-1.5`}>
          <Link
            href="/"
            target="_blank"
            title="View Storefront"
            className={`font-black text-[10px] tracking-wider uppercase py-2 px-2 rounded-xl text-center transition-all active:scale-95 border ${
              isDark
                ? 'bg-[#161f30] hover:bg-[#1e2a42] text-slate-200 border-slate-700/60'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
            }`}
          >
            {isCollapsed ? 'STORE' : 'STOREFRONT'}
          </Link>

          <button
            type="button"
            title="Logout"
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('jeansbd_admin_auth');
                localStorage.removeItem('jeansbd_admin_user');
                document.cookie = 'jeansbd_admin_session=; path=/; max-age=0; SameSite=Lax';
                window.location.href = '/admin/login';
              }
            }}
            className={`font-black text-[10px] tracking-wider uppercase py-2 px-2 rounded-xl flex items-center justify-center gap-1 transition-all active:scale-95 border ${
              isDark
                ? 'bg-[#240c14] hover:bg-[#34101c] text-rose-400 hover:text-rose-300 border-rose-900/60'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border-rose-200'
            }`}
          >
            <span>LOGOUT</span>
          </button>
        </div>

        {!isCollapsed && (
          <div className="flex items-center justify-between px-2 pt-1 text-[10px] text-slate-500 font-mono">
            <span>JEANS BD v1.0.0</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live</span>
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
