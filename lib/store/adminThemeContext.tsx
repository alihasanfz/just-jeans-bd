'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export type AdminThemeMode = 'dark' | 'light' | 'system';
export type AdminResolvedTheme = 'dark' | 'light';
export type AdminAccentColor = 'blue' | 'purple' | 'emerald' | 'rose' | 'amber';
export type AdminDensity = 'compact' | 'comfortable' | 'spacious';
export type AdminFontSize = 'sm' | 'md' | 'lg';
export type AdminLanguage = 'bn' | 'en';
export type AdminDateFormat = 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD MMM, YYYY';

export interface AdminAppearanceSettings {
  mode: AdminThemeMode;
  accentColor: AdminAccentColor;
  density: AdminDensity;
  fontSize: AdminFontSize;
  reducedMotion: boolean;
  language: AdminLanguage;
  dateFormat: AdminDateFormat;
  sidebarCollapsed: boolean;
}

export interface AccentColorDefinition {
  id: AdminAccentColor;
  name: string;
  nameBn: string;
  primaryHex: string;
  hoverHex: string;
  lightHex: string;
  glowHex: string;
  borderHex: string;
  bgClass: string;
  bgHoverClass: string;
  bgLightClass: string;
  textClass: string;
  borderClass: string;
  ringClass: string;
  gradientClass: string;
  badgeClass: string;
}

export const ACCENT_COLORS: Record<AdminAccentColor, AccentColorDefinition> = {
  blue: {
    id: 'blue',
    name: 'Denim Royal Blue',
    nameBn: 'রয়েল ব্লু (ডেনিম)',
    primaryHex: '#2563eb',
    hoverHex: '#1d4ed8',
    lightHex: 'rgba(37, 99, 235, 0.12)',
    glowHex: 'rgba(37, 99, 235, 0.35)',
    borderHex: 'rgba(37, 99, 235, 0.3)',
    bgClass: 'bg-blue-600',
    bgHoverClass: 'hover:bg-blue-500',
    bgLightClass: 'bg-blue-500/10',
    textClass: 'text-blue-500',
    borderClass: 'border-blue-500/30',
    ringClass: 'focus:ring-blue-500',
    gradientClass: 'from-blue-600 to-indigo-600',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  purple: {
    id: 'purple',
    name: 'Royal Purple',
    nameBn: 'রয়েল পার্পল',
    primaryHex: '#7c3aed',
    hoverHex: '#6d28d9',
    lightHex: 'rgba(124, 58, 237, 0.12)',
    glowHex: 'rgba(124, 58, 237, 0.35)',
    borderHex: 'rgba(124, 58, 237, 0.3)',
    bgClass: 'bg-purple-600',
    bgHoverClass: 'hover:bg-purple-500',
    bgLightClass: 'bg-purple-500/10',
    textClass: 'text-purple-500',
    borderClass: 'border-purple-500/30',
    ringClass: 'focus:ring-purple-500',
    gradientClass: 'from-purple-600 to-indigo-600',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Green',
    nameBn: 'এমারেল্ড গ্রিন',
    primaryHex: '#059669',
    hoverHex: '#047857',
    lightHex: 'rgba(5, 150, 105, 0.12)',
    glowHex: 'rgba(5, 150, 105, 0.35)',
    borderHex: 'rgba(5, 150, 105, 0.3)',
    bgClass: 'bg-emerald-600',
    bgHoverClass: 'hover:bg-emerald-500',
    bgLightClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-500',
    borderClass: 'border-emerald-500/30',
    ringClass: 'focus:ring-emerald-500',
    gradientClass: 'from-emerald-600 to-teal-600',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  rose: {
    id: 'rose',
    name: 'Crimson Rose',
    nameBn: 'ক্রিমসন রোজ',
    primaryHex: '#e11d48',
    hoverHex: '#be123c',
    lightHex: 'rgba(225, 29, 72, 0.12)',
    glowHex: 'rgba(225, 29, 72, 0.35)',
    borderHex: 'rgba(225, 29, 72, 0.3)',
    bgClass: 'bg-rose-600',
    bgHoverClass: 'hover:bg-rose-500',
    bgLightClass: 'bg-rose-500/10',
    textClass: 'text-rose-500',
    borderClass: 'border-rose-500/30',
    ringClass: 'focus:ring-rose-500',
    gradientClass: 'from-rose-600 to-pink-600',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  },
  amber: {
    id: 'amber',
    name: 'Warm Amber & Orange',
    nameBn: 'অরেঞ্জ ও অ্যাম্বার',
    primaryHex: '#d97706',
    hoverHex: '#b45309',
    lightHex: 'rgba(217, 119, 6, 0.12)',
    glowHex: 'rgba(217, 119, 6, 0.35)',
    borderHex: 'rgba(217, 119, 6, 0.3)',
    bgClass: 'bg-amber-600',
    bgHoverClass: 'hover:bg-amber-500',
    bgLightClass: 'bg-amber-500/10',
    textClass: 'text-amber-500',
    borderClass: 'border-amber-500/30',
    ringClass: 'focus:ring-amber-500',
    gradientClass: 'from-amber-500 to-orange-600',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
};

const DEFAULT_SETTINGS: AdminAppearanceSettings = {
  mode: 'dark',
  accentColor: 'blue',
  density: 'comfortable',
  fontSize: 'md',
  reducedMotion: false,
  language: 'bn',
  dateFormat: 'DD/MM/YYYY',
  sidebarCollapsed: false,
};

const STORAGE_KEY = 'jeansbd_admin_appearance_prefs';
const LEGACY_STORAGE_KEY = 'jeansbd_admin_theme';

interface AdminThemeContextType {
  // Legacy compatibility:
  theme: AdminResolvedTheme;
  toggleTheme: () => void;
  setTheme: (theme: AdminResolvedTheme) => void;

  // New Appearance API:
  mode: AdminThemeMode;
  resolvedTheme: AdminResolvedTheme;
  accentColor: AdminAccentColor;
  accent: AccentColorDefinition;
  density: AdminDensity;
  fontSize: AdminFontSize;
  reducedMotion: boolean;
  language: AdminLanguage;
  dateFormat: AdminDateFormat;
  sidebarCollapsed: boolean;
  isMounted: boolean;

  // Setters
  setMode: (mode: AdminThemeMode) => void;
  setAccentColor: (color: AdminAccentColor) => void;
  setDensity: (density: AdminDensity) => void;
  setFontSize: (size: AdminFontSize) => void;
  setReducedMotion: (reduced: boolean) => void;
  setLanguage: (lang: AdminLanguage) => void;
  setDateFormat: (format: AdminDateFormat) => void;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  updateSettings: (partial: Partial<AdminAppearanceSettings>) => void;
  resetDefaults: () => void;
  savePreferences: () => boolean;

  // Utilities
  formatDate: (date: Date | string | number | undefined | null) => string;
  formatCurrency: (amount: number) => string;
  t: (key: string) => string;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

// Bengali & English Translation Dictionary
const TRANSLATIONS: Record<string, { bn: string; en: string }> = {
  themeAppearance: { bn: 'থিম ও অ্যাপিয়ারেন্স', en: 'Theme & Appearance' },
  appearanceSettings: { bn: 'অ্যাপিয়ারেন্স সেটিংস', en: 'Appearance Settings' },
  themeMode: { bn: 'থিম মোড', en: 'Theme Mode' },
  lightMode: { bn: 'লাইট মোড', en: 'Light Mode' },
  darkMode: { bn: 'ডার্ক মোড', en: 'Dark Mode' },
  systemMode: { bn: 'সিস্টেম মোড (অটো)', en: 'System Auto Mode' },
  accentColor: { bn: 'অ্যাকসেন্ট কালার', en: 'Accent Color' },
  displayDensity: { bn: 'ডিসপ্লে ডেনসিটি', en: 'Display Density' },
  compact: { bn: 'কমপ্যাক্ট (টাইট)', en: 'Compact' },
  comfortable: { bn: 'কমফোর্টেবল (স্ট্যান্ডার্ড)', en: 'Comfortable' },
  spacious: { bn: 'স্পেসিয়াস (রিল্যাক্সড)', en: 'Spacious' },
  fontSize: { bn: 'ফন্ট সাইজ', en: 'Font Size' },
  fontSmall: { bn: 'ছোট (১৩px)', en: 'Small (13px)' },
  fontMedium: { bn: 'মাঝারি (১৪px)', en: 'Medium (14px)' },
  fontLarge: { bn: 'বড় (১৫px)', en: 'Large (15px)' },
  reducedMotion: { bn: 'মোশন ও অ্যানিমেশন রিডিউস', en: 'Reduced Motion' },
  language: { bn: 'ড্যাশবোর্ড ভাষা', en: 'Dashboard Language' },
  dateFormat: { bn: 'তারিখ ফরম্যাট', en: 'Date Format' },
  currency: { bn: 'কারেন্সি', en: 'Currency' },
  preview: { bn: 'লাইভ ইন্টারঅ্যাক্টিভ প্রিভিউ', en: 'Live Interactive Preview' },
  resetDefaults: { bn: 'ডিফল্ট রিসেট করুন', en: 'Reset to Default' },
  savePreferences: { bn: 'পছন্দসমূহ সংরক্ষণ করুন', en: 'Save Preferences' },
  savedSuccess: { bn: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!', en: 'Preferences saved successfully!' },
  systemSyncNotice: {
    bn: 'সিস্টেম মোড সক্রিয় থাকলে আপনার ডিভাইস বা ওএসের থিম অনুযায়ী ড্যাশবোর্ড স্বয়ংক্রিয়ভাবে পরিবর্তিত হবে।',
    en: 'System mode automatically synchronizes the dashboard with your device/OS color scheme.',
  },
};

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AdminAppearanceSettings>(DEFAULT_SETTINGS);
  const [systemIsDark, setSystemIsDark] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  // Load preferences on mount
  useEffect(() => {
    try {
      // 1. Check OS system color scheme
      if (typeof window !== 'undefined') {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemIsDark(mq.matches);

        const handleSchemeChange = (e: MediaQueryListEvent) => {
          setSystemIsDark(e.matches);
        };
        mq.addEventListener('change', handleSchemeChange);

        // 2. Read saved settings from localStorage
        const savedJson = localStorage.getItem(STORAGE_KEY);
        if (savedJson) {
          const parsed = JSON.parse(savedJson);
          setSettings((prev) => ({
            ...prev,
            ...parsed,
          }));
        } else {
          // Check legacy theme
          const legacy = localStorage.getItem(LEGACY_STORAGE_KEY) as AdminResolvedTheme | null;
          if (legacy === 'light' || legacy === 'dark') {
            setSettings((prev) => ({ ...prev, mode: legacy }));
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load admin appearance preferences:', e);
    } finally {
      setMounted(true);
    }
  }, []);

  // Compute resolved theme
  const resolvedTheme: AdminResolvedTheme = useMemo(() => {
    if (settings.mode === 'system') {
      return systemIsDark ? 'dark' : 'light';
    }
    return settings.mode === 'light' ? 'light' : 'dark';
  }, [settings.mode, systemIsDark]);

  // Synchronize CSS custom properties and attributes to root document
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Root theme classes
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // 2. Data attributes for scoped styling
    root.setAttribute('data-admin-theme', resolvedTheme);
    root.setAttribute('data-admin-accent', settings.accentColor);
    root.setAttribute('data-admin-density', settings.density);
    root.setAttribute('data-admin-font', settings.fontSize);
    root.setAttribute('data-admin-reduced-motion', settings.reducedMotion ? 'true' : 'false');

    // 3. CSS Variables for active accent
    const currentAccent = ACCENT_COLORS[settings.accentColor] || ACCENT_COLORS.blue;
    root.style.setProperty('--admin-accent', currentAccent.primaryHex);
    root.style.setProperty('--admin-accent-hover', currentAccent.hoverHex);
    root.style.setProperty('--admin-accent-glow', currentAccent.glowHex);
    root.style.setProperty('--admin-accent-light', currentAccent.lightHex);
    root.style.setProperty('--admin-accent-border', currentAccent.borderHex);

    // Keep legacy storage key synced for components reading it directly
    try {
      localStorage.setItem(LEGACY_STORAGE_KEY, resolvedTheme);
    } catch {}
  }, [resolvedTheme, settings.accentColor, settings.density, settings.fontSize, settings.reducedMotion]);

  // Save to localStorage helper
  const persist = useCallback((updated: AdminAppearanceSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(LEGACY_STORAGE_KEY, updated.mode === 'system' ? (systemIsDark ? 'dark' : 'light') : updated.mode);
    } catch (e) {
      console.warn('Failed to save appearance settings to localStorage', e);
    }
  }, [systemIsDark]);

  // State update helpers with auto-persistence
  const updateSettings = useCallback((partial: Partial<AdminAppearanceSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      persist(next);
      return next;
    });
  }, [persist]);

  const setMode = useCallback((newMode: AdminThemeMode) => {
    updateSettings({ mode: newMode });
  }, [updateSettings]);

  const setAccentColor = useCallback((color: AdminAccentColor) => {
    updateSettings({ accentColor: color });
  }, [updateSettings]);

  const setDensity = useCallback((density: AdminDensity) => {
    updateSettings({ density });
  }, [updateSettings]);

  const setFontSize = useCallback((fontSize: AdminFontSize) => {
    updateSettings({ fontSize });
  }, [updateSettings]);

  const setReducedMotion = useCallback((reducedMotion: boolean) => {
    updateSettings({ reducedMotion });
  }, [updateSettings]);

  const setLanguage = useCallback((language: AdminLanguage) => {
    updateSettings({ language });
  }, [updateSettings]);

  const setDateFormat = useCallback((dateFormat: AdminDateFormat) => {
    updateSettings({ dateFormat });
  }, [updateSettings]);

  const setSidebarCollapsed = useCallback((collapsed: boolean | ((prev: boolean) => boolean)) => {
    setSettings((prev) => {
      const nextCollapsed = typeof collapsed === 'function' ? collapsed(prev.sidebarCollapsed) : collapsed;
      const next = { ...prev, sidebarCollapsed: nextCollapsed };
      persist(next);
      return next;
    });
  }, [persist]);

  const resetDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    persist(DEFAULT_SETTINGS);
  }, [persist]);

  const savePreferences = useCallback(() => {
    persist(settings);
    return true;
  }, [persist, settings]);

  // Legacy toggleTheme implementation
  const toggleTheme = useCallback(() => {
    const nextResolved = resolvedTheme === 'dark' ? 'light' : 'dark';
    setMode(nextResolved);
  }, [resolvedTheme, setMode]);

  const setTheme = useCallback((t: AdminResolvedTheme) => {
    setMode(t);
  }, [setMode]);

  // Date formatter based on user's active choice
  const formatDate = useCallback((input: Date | string | number | undefined | null): string => {
    if (!input) return '—';
    try {
      const date = new Date(input);
      if (isNaN(date.getTime())) return String(input);

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthNamesBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
      const monthName = settings.language === 'bn' ? monthNamesBn[date.getMonth()] : monthNamesEn[date.getMonth()];

      switch (settings.dateFormat) {
        case 'YYYY-MM-DD':
          return `${year}-${month}-${day}`;
        case 'DD MMM, YYYY':
          return `${day} ${monthName}, ${year}`;
        case 'DD/MM/YYYY':
        default:
          return `${day}/${month}/${year}`;
      }
    } catch {
      return String(input);
    }
  }, [settings.dateFormat, settings.language]);

  // Currency formatter (৳ BDT)
  const formatCurrency = useCallback((amount: number): string => {
    const formattedNum = Number(amount || 0).toLocaleString('en-BD');
    return `৳ ${formattedNum} BDT`;
  }, []);

  // Translation helper
  const t = useCallback((key: string): string => {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[settings.language] || entry.en;
  }, [settings.language]);

  const activeAccent = ACCENT_COLORS[settings.accentColor] || ACCENT_COLORS.blue;

  const value = useMemo<AdminThemeContextType>(() => ({
    theme: mounted ? resolvedTheme : 'dark',
    toggleTheme,
    setTheme,
    mode: settings.mode,
    resolvedTheme: mounted ? resolvedTheme : 'dark',
    accentColor: settings.accentColor,
    accent: activeAccent,
    density: settings.density,
    fontSize: settings.fontSize,
    reducedMotion: settings.reducedMotion,
    language: settings.language,
    dateFormat: settings.dateFormat,
    sidebarCollapsed: settings.sidebarCollapsed,
    isMounted: mounted,
    setMode,
    setAccentColor,
    setDensity,
    setFontSize,
    setReducedMotion,
    setLanguage,
    setDateFormat,
    setSidebarCollapsed,
    updateSettings,
    resetDefaults,
    savePreferences,
    formatDate,
    formatCurrency,
    t,
  }), [
    mounted,
    resolvedTheme,
    toggleTheme,
    setTheme,
    settings.mode,
    settings.accentColor,
    activeAccent,
    settings.density,
    settings.fontSize,
    settings.reducedMotion,
    settings.language,
    settings.dateFormat,
    settings.sidebarCollapsed,
    setMode,
    setAccentColor,
    setDensity,
    setFontSize,
    setReducedMotion,
    setLanguage,
    setDateFormat,
    setSidebarCollapsed,
    updateSettings,
    resetDefaults,
    savePreferences,
    formatDate,
    formatCurrency,
    t,
  ]);

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    return {
      theme: 'dark' as AdminResolvedTheme,
      resolvedTheme: 'dark' as AdminResolvedTheme,
      mode: 'dark' as AdminThemeMode,
      accentColor: 'blue' as AdminAccentColor,
      accent: ACCENT_COLORS.blue,
      density: 'comfortable' as AdminDensity,
      fontSize: 'md' as AdminFontSize,
      reducedMotion: false,
      language: 'bn' as AdminLanguage,
      dateFormat: 'DD/MM/YYYY' as AdminDateFormat,
      sidebarCollapsed: false,
      isMounted: true,
      toggleTheme: () => {},
      setTheme: () => {},
      setMode: () => {},
      setAccentColor: () => {},
      setDensity: () => {},
      setFontSize: () => {},
      setReducedMotion: () => {},
      setLanguage: () => {},
      setDateFormat: () => {},
      setSidebarCollapsed: () => {},
      updateSettings: () => {},
      resetDefaults: () => {},
      savePreferences: () => true,
      formatDate: (d: any) => String(d || ''),
      formatCurrency: (n: number) => `৳ ${n.toLocaleString('en-BD')} BDT`,
      t: (k: string) => k,
    };
  }
  return context;
}
