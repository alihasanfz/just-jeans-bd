'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAdminTheme } from '@/lib/store/adminThemeContext';

interface AdminThemeToggleProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export default function AdminThemeToggle({
  variant = 'compact',
  className = '',
}: AdminThemeToggleProps) {
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === 'dark';

  if (variant === 'full') {
    return (
      <div
        className={`flex items-center justify-between p-2 rounded-2xl border transition-all ${
          isDark
            ? 'bg-[#121826]/90 border-slate-800/80 text-slate-300'
            : 'bg-white border-slate-200/90 text-slate-700 shadow-sm'
        } ${className}`}
      >
        <div className="flex items-center gap-2 px-1">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
              isDark
                ? 'bg-blue-500/10 text-blue-400'
                : 'bg-amber-500/10 text-amber-600'
            }`}
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-tight">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
            <span className="text-[10px] text-slate-400">
              {isDark ? 'Sleek Dark Theme' : 'Clean Light Theme'}
            </span>
          </div>
        </div>

        {/* Sliding Pill Switch */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark and light mode"
          className={`relative w-12 h-6 rounded-full transition-colors p-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
            isDark ? 'bg-blue-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-out ${
              isDark ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    );
  }

  // Compact Pill Button (for Header)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 shadow-sm ${
        isDark
          ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-slate-600'
          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 shadow-slate-200/50'
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 text-blue-400 animate-fade-in" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 animate-fade-in" />
        )}
      </div>
      <span className="hidden sm:inline font-semibold">
        {isDark ? 'Dark' : 'Light'}
      </span>
      <span
        className={`w-2 h-2 rounded-full ${
          isDark ? 'bg-blue-400 shadow-sm shadow-blue-400/50' : 'bg-amber-500 shadow-sm shadow-amber-500/50'
        }`}
      />
    </button>
  );
}
