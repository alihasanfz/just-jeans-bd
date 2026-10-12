'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon, Laptop, Palette, Sliders, ChevronDown, Check } from 'lucide-react';
import { useAdminTheme, ACCENT_COLORS, AdminThemeMode, AdminAccentColor } from '@/lib/store/adminThemeContext';

interface AdminThemeToggleProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export default function AdminThemeToggle({
  variant = 'compact',
  className = '',
}: AdminThemeToggleProps) {
  const {
    mode,
    resolvedTheme,
    accentColor,
    accent,
    setMode,
    setAccentColor,
    isMounted,
    language,
  } = useAdminTheme();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDark = resolvedTheme === 'dark';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const accentList = Object.values(ACCENT_COLORS);

  // Full Variant (Sidebar bottom)
  if (variant === 'full') {
    return (
      <div
        className={`p-3 rounded-2xl border transition-all ${
          isDark
            ? 'bg-[#121826]/95 border-slate-800/80 text-slate-300'
            : 'bg-white border-slate-200/90 text-slate-700 shadow-sm'
        } ${className}`}
      >
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" style={{ color: accent.primaryHex }} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'bn' ? 'থিম ও মোড' : 'Theme & Accent'}
            </span>
          </div>

          <Link
            href="/admin/settings/appearance"
            title="Appearance Settings"
            className="text-[10px] text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <span>{language === 'bn' ? 'কাস্টমাইজ' : 'Custom'}</span>
          </Link>
        </div>

        {/* 3-Segment Theme Mode Pill Control */}
        <div
          className={`grid grid-cols-3 p-1 rounded-xl border text-[11px] font-bold transition-colors ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() => setMode('light')}
            className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
              mode === 'light'
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Light Mode"
          >
            <Sun className={`w-3.5 h-3.5 ${mode === 'light' ? 'text-amber-500' : ''}`} />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('dark')}
            className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
              mode === 'dark'
                ? `${accent.bgClass} text-white shadow-sm font-black`
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Dark Mode"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('system')}
            className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
              mode === 'system'
                ? `${accent.bgClass} text-white shadow-sm font-black`
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="System Mode (Auto sync with OS)"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Auto</span>
          </button>
        </div>

        {/* Quick Accent Color Swatches */}
        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800/40 px-0.5">
          <span className="text-[10px] text-slate-400 font-medium">Accent:</span>
          <div className="flex items-center gap-1.5">
            {accentList.map((item) => {
              const isSelected = accentColor === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAccentColor(item.id)}
                  title={`${item.name} (${item.primaryHex})`}
                  className={`w-4 h-4 rounded-full transition-transform active:scale-90 flex items-center justify-center ${
                    isSelected ? 'ring-2 ring-white scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: item.primaryHex }}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Compact Variant (Header / Top Navbar)
  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Change Theme & Accent Color"
        className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 shadow-sm ${
          isDark
            ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-slate-600'
            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 shadow-slate-200/50'
        } ${className}`}
      >
        <div className="relative flex items-center justify-center">
          {mode === 'system' ? (
            <Laptop className="w-4 h-4" style={{ color: accent.primaryHex }} />
          ) : resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4" style={{ color: accent.primaryHex }} />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </div>

        <span className="hidden sm:inline font-semibold">
          {mode === 'system' ? 'Auto' : resolvedTheme === 'dark' ? 'Dark' : 'Light'}
        </span>

        {/* Dynamic Accent Color Dot */}
        <span
          className="w-2.5 h-2.5 rounded-full shadow-sm"
          style={{
            backgroundColor: accent.primaryHex,
            boxShadow: `0 0 8px ${accent.glowHex}`,
          }}
        />

        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* Quick Theme & Accent Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-64 p-3 rounded-2xl border shadow-2xl z-50 animate-scale-in ${
            isDark
              ? 'bg-[#0f172a] border-slate-800 text-slate-200 shadow-black/60'
              : 'bg-white border-slate-200 text-slate-800 shadow-xl'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/40">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
              Appearance Quick Switch
            </span>
            <Link
              href="/admin/settings/appearance"
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-bold text-blue-400 hover:underline flex items-center gap-1"
            >
              <Sliders className="w-3 h-3" />
              <span>Full Settings</span>
            </Link>
          </div>

          {/* Theme Modes */}
          <div className="space-y-1 mb-3">
            {(
              [
                { id: 'dark', label: 'Dark Mode', icon: Moon },
                { id: 'light', label: 'Light Mode', icon: Sun },
                { id: 'system', label: 'System Mode (OS Sync)', icon: Laptop },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const isSelected = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMode(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? `${accent.bgLightClass} font-bold`
                      : isDark
                      ? 'hover:bg-slate-800/60 text-slate-300'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  style={{
                    color: isSelected ? accent.primaryHex : undefined,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              );
            })}
          </div>

          {/* Accent Color Palettes */}
          <div className="pt-2 border-t border-slate-800/40">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
              Accent Palette
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {accentList.map((item) => {
                const isSelected = accentColor === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setAccentColor(item.id);
                    }}
                    title={item.name}
                    className={`h-7 rounded-xl flex items-center justify-center transition-transform active:scale-90 ${
                      isSelected ? 'ring-2 ring-white scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: item.primaryHex }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
