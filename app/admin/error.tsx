'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShieldAlert, RotateCcw } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Panel Runtime Error Caught by Boundary:', error);
  }, [error]);

  const handleClearCacheAndReset = () => {
    try {
      if (typeof window !== 'undefined') {
        // Clear heavy local storage keys to instantly recover full quota
        localStorage.removeItem('jeansbd_admin_stock_alerts');
        localStorage.removeItem('jeansbd_products');
        localStorage.removeItem('jeansbd_settings');
        localStorage.removeItem('jeansbd_categories');
        sessionStorage.clear();
      }
    } catch (e) {
      console.warn('Could not clear storage', e);
    }
    // Attempt re-render or reload
    if (typeof window !== 'undefined') {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0d1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-scale-in">
        {/* Glowing Error Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center shadow-lg shadow-rose-500/10">
          <AlertTriangle className="w-8 h-8 animate-pulse" />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Control Center Protection</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            Admin Console Recovered
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            A temporary client exception was caught safely. Your data is protected. You can recover immediately by reloading or resetting cached values.
          </p>
        </div>

        {/* Error Details (compact) */}
        {error?.message && (
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 text-left text-xs font-mono text-slate-400 overflow-x-auto max-h-32">
            <span className="text-rose-400 font-bold block mb-1">Error Trace:</span>
            <span>{error.message}</span>
            {error.digest && (
              <span className="block text-[10px] text-slate-500 mt-1">Digest: {error.digest}</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            type="button"
            onClick={handleClearCacheAndReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Clear Cache &amp; Reset</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Storefront</span>
          </Link>
        </div>

        <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/60">
          JEANS BD v1.0.0 • Admin Auto-Recovery System
        </div>
      </div>
    </div>
  );
}
