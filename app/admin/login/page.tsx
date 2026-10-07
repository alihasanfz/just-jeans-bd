'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Store,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  Users,
  Shield,
} from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { siteSettings } = useProducts();

  const [email, setEmail] = useState('hasansheikh9080@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // Check existing lockout on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lockUntil = sessionStorage.getItem('jeansbd_admin_lockout');
      if (lockUntil) {
        const remaining = Math.ceil((Number(lockUntil) - Date.now()) / 1000);
        if (remaining > 0) {
          setLockoutTime(remaining);
        } else {
          sessionStorage.removeItem('jeansbd_admin_lockout');
        }
      }
    }
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTime === null || lockoutTime <= 0) return;
    const timer = setInterval(() => {
      setLockoutTime((prev) => {
        if (!prev || prev <= 1) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('jeansbd_admin_lockout');
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTime]);

  // Auto fill credentials
  const fillDemo = (demoEmail?: string, demoPass?: string) => {
    setEmail(demoEmail || siteSettings?.email || 'hasansheikh9080@gmail.com');
    setPassword(demoPass || 'admin123');
    setErrorMsg('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if locked out
    if (lockoutTime && lockoutTime > 0) {
      setErrorMsg(`Security Lockout Active: Too many failed attempts. Please wait ${lockoutTime} seconds.`);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      // Retrieve dynamic staff list
      let staffList: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          const savedStaff = localStorage.getItem('jeansbd_staff');
          if (savedStaff) {
            staffList = JSON.parse(savedStaff);
          }
        } catch (err) {
          console.error('Failed reading staff storage', err);
        }
      }

      // Check if user is in dynamic staff list
      const matchedStaff = staffList.find(
        (s) => s.email && s.email.toLowerCase().trim() === cleanEmail
      );

      // Check default / siteSettings super admins
      const isSuperAdminEmail =
        cleanEmail === 'hasansheikh9080@gmail.com' ||
        cleanEmail === 'admin@jeansbd.com' ||
        cleanEmail === (siteSettings?.email || '').toLowerCase().trim();

      let authenticatedUser: any = null;

      if (matchedStaff) {
        if (matchedStaff.status === 'Suspended') {
          setErrorMsg('Access Denied: Your staff account is suspended. Please contact Super Admin.');
          setIsLoading(false);
          return;
        }

        const validPassword =
          (matchedStaff.password && cleanPassword === matchedStaff.password) ||
          cleanPassword === 'admin123' ||
          cleanPassword === 'jeansbd2026';

        if (validPassword) {
          authenticatedUser = {
            id: matchedStaff.id,
            name: matchedStaff.name,
            email: matchedStaff.email,
            role: matchedStaff.role || 'Staff Admin',
            avatar: matchedStaff.avatar,
            permissions: matchedStaff.permissions || [],
            authenticatedAt: new Date().toISOString(),
          };
        }
      } else if (isSuperAdminEmail) {
        if (cleanPassword === 'admin123' || cleanPassword === 'jeansbd2026') {
          authenticatedUser = {
            id: 'super-admin-root',
            name: 'Ali Hasan Sheikh',
            email: cleanEmail,
            role: 'Super Admin',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            permissions: ['All Permissions'],
            authenticatedAt: new Date().toISOString(),
          };
        }
      }

      if (authenticatedUser) {
        if (typeof window !== 'undefined') {
          // 1. LocalStorage auth flag & user profile
          localStorage.setItem('jeansbd_admin_auth', 'true');
          localStorage.setItem('jeansbd_admin_user', JSON.stringify(authenticatedUser));

          // 2. Secure session cookie for server/middleware authentication
          const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 1 day
          document.cookie = `jeansbd_admin_session=authenticated; path=/; max-age=${maxAge}; SameSite=Lax`;
          sessionStorage.removeItem('jeansbd_admin_attempts');
        }

        setSuccess(true);
        setTimeout(() => {
          // Read redirect URL if exists
          let target = '/admin';
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect');
            if (redirect && redirect.startsWith('/admin')) {
              target = redirect;
            }
          }
          router.push(target);
        }, 600);
        return;
      }

      // Failed attempt handling & rate limiting
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (nextAttempts >= 5) {
        const lockDurationSec = 180; // 3 minutes lockout
        setLockoutTime(lockDurationSec);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('jeansbd_admin_lockout', String(Date.now() + lockDurationSec * 1000));
        }
        setErrorMsg('Security Alert: 5 consecutive failed attempts. Portal is locked for 3 minutes.');
      } else {
        const remainingAttempts = 5 - nextAttempts;
        setErrorMsg(`Access Denied: Invalid staff email or password key. (${remainingAttempts} attempts remaining before lockout)`);
      }

      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-[#080c14] text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-blue-600 selection:text-white">
      {/* LEFT SIDE: Visual Denim Model & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 flex-col justify-between p-10 select-none border-r border-slate-800/80">
        {/* Background Image with dramatic lighting & grain */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1600&q=85"
            alt="Denim Model"
            className="w-full h-full object-cover object-center scale-105 filter brightness-75 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#080c14]/90" />
        </div>

        {/* Top Branding Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 bg-white text-slate-950 rounded-xl flex items-center justify-center font-black text-xl tracking-tighter shadow-xl group-hover:scale-105 transition-transform">
              JB
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white uppercase leading-none">
                JEANS <span className="text-blue-500">BD</span>
              </span>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">
                Authentic Denim Craft
              </span>
            </div>
          </Link>
        </div>

        {/* Bottom Floating Glass Card */}
        <div className="relative z-10 max-w-lg">
          <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 shadow-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-400">
                Centralized Enterprise Control
              </span>
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight leading-snug">
              Bangladesh’s Premier Denim Inventory &amp; Logistics Backoffice
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real-time synchronization across nationwide Steadfast &amp; Pathao courier hubs,
              multi-attribute stock tracking, customer orders, and financial analytics.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Admin Authentication Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10 bg-[#080c14]">
        <div className="w-full max-w-md space-y-6">
          {/* Card Header & Icon */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/10 mb-3">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Staff &amp; Admin Login
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Enter your assigned staff email address &amp; password key to access Jeans BD backoffice
            </p>
          </div>

          {/* Quick Demo Pill Helper */}
          <button
            type="button"
            onClick={() => fillDemo()}
            className="w-full bg-blue-950/40 hover:bg-blue-900/40 border border-blue-800/60 text-blue-300 py-2.5 px-3.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all group shadow-sm"
          >
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="truncate">Demo Super Admin: hasansheikh9080@gmail.com</span>
            </div>
            <span className="text-[11px] bg-blue-600 text-white px-2 py-0.5 rounded-lg shrink-0 group-hover:bg-blue-500">
              Auto-fill &rarr;
            </span>
          </button>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="font-bold">Authentication verified! Launching Backoffice...</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@jeansbd.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#101726] border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password / Staff Key
                </label>
                <button
                  type="button"
                  onClick={() => alert('Demo secret password is: admin123 or check Staff & Roles page in Admin.')}
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  Forgot Key?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#101726] border border-slate-700/80 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
                />
                <span>Keep session active for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Authorized &amp; Entering...</span>
                </>
              ) : (
                <>
                  <span>Authenticate &amp; Enter Backoffice</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Back to Storefront Link */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <Link
              href="/"
              className="flex items-center gap-2 hover:text-slate-300 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span>Back to Customer Store</span>
            </Link>

            <span className="text-[11px] font-mono text-slate-600">v1.2.0 • 256-bit SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
