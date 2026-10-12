'use client';

import React, { useState } from 'react';
import {
  Palette,
  Sun,
  Moon,
  Laptop,
  Check,
  RotateCcw,
  Save,
  Sparkles,
  Layout,
  Minimize2,
  Maximize2,
  Eye,
  Type,
  Zap,
  Globe,
  Calendar,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Bell,
  Search,
  CheckCircle2,
} from 'lucide-react';
import {
  useAdminTheme,
  ACCENT_COLORS,
  AdminThemeMode,
  AdminAccentColor,
  AdminDensity,
  AdminFontSize,
  AdminLanguage,
  AdminDateFormat,
} from '@/lib/store/adminThemeContext';

export default function AdminAppearanceSettings() {
  const {
    mode,
    resolvedTheme,
    accentColor,
    accent,
    density,
    fontSize,
    reducedMotion,
    language,
    dateFormat,
    sidebarCollapsed,
    setMode,
    setAccentColor,
    setDensity,
    setFontSize,
    setReducedMotion,
    setLanguage,
    setDateFormat,
    setSidebarCollapsed,
    resetDefaults,
    savePreferences,
    formatDate,
    formatCurrency,
    t,
  } = useAdminTheme();

  const isDark = resolvedTheme === 'dark';
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [sampleToggle, setSampleToggle] = useState(true);

  const handleSave = () => {
    savePreferences();
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3500);
  };

  const handleReset = () => {
    if (confirm(language === 'bn' ? 'আপনি কি সব থিম ও অ্যাপিয়ারেন্স সেটিংস ডিফল্টে ফিরিয়ে নিতে চান?' : 'Reset all theme and appearance settings to defaults?')) {
      resetDefaults();
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3500);
    }
  };

  const accentList = Object.values(ACCENT_COLORS);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Toast Notification */}
      {showSavedToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-2xl shadow-emerald-500/30 border border-emerald-400 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <p className="leading-tight">{t('savedSuccess')}</p>
            <p className="text-[10px] text-emerald-100 font-normal">
              {language === 'bn' ? 'সেটিংস নিরাপদে সংরক্ষিত হয়েছে' : 'Saved to browser storage'}
            </p>
          </div>
        </div>
      )}

      {/* Top Banner & Header */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all ${
          isDark
            ? 'bg-gradient-to-br from-[#0e1626] to-[#090d16] border-slate-800/90 shadow-xl'
            : 'bg-gradient-to-br from-white to-slate-50 border-slate-200/90 shadow-md'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${accent.badgeClass}`}
              >
                <Sparkles className="w-3 h-3" />
                {t('themeAppearance')} • JEANS BD ADMIN
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {mode === 'system' ? `System (${resolvedTheme.toUpperCase()})` : mode.toUpperCase()}
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {language === 'bn' ? 'থিম ও অ্যাপিয়ারেন্স কাস্টমাইজেশন' : 'Theme & Appearance Customization'}
            </h1>
            <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'bn'
                ? 'আপনার কাজের সুবিধার্থে ড্যাশবোর্ডের থিম মোড, অ্যাকসেন্ট কালার, ডিসপ্লে ডেনসিটি, ফন্ট সাইজ এবং ভাষা নিজের পছন্দমতো পরিবর্তন করুন। পরিবর্তনসমূহ তাৎক্ষণিকভাবে কার্যকর হবে।'
                : 'Personalize your JEANS BD management experience with dark/light/system modes, curated accent palettes, layout densities, and typographic scaling.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              title="Reset to default theme"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                isDark
                  ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('resetDefaults')}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all active:scale-95 ${accent.bgClass} ${accent.bgHoverClass}`}
              style={{
                boxShadow: `0 8px 24px ${accent.glowHex}`,
              }}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t('savePreferences')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: LIVE INTERACTIVE PREVIEW */}
      <div
        className={`p-6 rounded-3xl border transition-all ${
          isDark ? 'bg-[#0b101d] border-slate-800/80' : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent.bgLightClass} ${accent.textClass}`}>
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`font-black text-sm uppercase tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('preview')}
              </h2>
              <p className="text-[11px] text-slate-400">
                {language === 'bn'
                  ? 'নিচের উপাদানগুলোতে আপনার নির্বাচিত থিম ও অ্যাকসেন্ট কালার তাৎক্ষণিকভাবে প্রদর্শিত হচ্ছে'
                  : 'Real-time rendering of your theme, accent color, and typography settings'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${accent.bgClass} animate-pulse`} />
            <span className="text-xs font-bold" style={{ color: accent.primaryHex }}>
              {accent.name}
            </span>
          </div>
        </div>

        {/* Realistic Mini Dashboard Mockup */}
        <div
          className={`p-5 rounded-2xl border transition-all duration-300 ${
            isDark ? 'bg-[#070b14] border-slate-800/90 text-slate-200' : 'bg-slate-50/80 border-slate-200 text-slate-800'
          }`}
        >
          {/* Mock Header */}
          <div
            className={`flex items-center justify-between p-3 rounded-xl border mb-4 transition-colors ${
              isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center ${accent.bgClass}`}
              >
                JB
              </div>
              <div>
                <span className={`font-black text-xs tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  JEANS BD
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Admin Management Console</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${accent.badgeClass}`}>
                Active Accent: {accent.name}
              </span>
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs ${
                  isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Mock Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {/* Stat Card 1 */}
            <div
              className={`p-4 rounded-xl border transition-colors ${
                isDark ? 'bg-[#0d1424] border-slate-800/80' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sales</span>
                <div className={`p-1.5 rounded-lg ${accent.bgLightClass} ${accent.textClass}`}>
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatCurrency(184500)}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
                <span className="text-emerald-500 font-bold">+18.4%</span>
                <span className="text-slate-400">vs last month</span>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div
              className={`p-4 rounded-xl border transition-colors ${
                isDark ? 'bg-[#0d1424] border-slate-800/80' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">New Orders</span>
                <div className={`p-1.5 rounded-lg ${accent.bgLightClass} ${accent.textClass}`}>
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                142 Orders
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
                <span className="text-emerald-500 font-bold">+12 today</span>
                <span className="text-slate-400">• Steadfast & Pathao</span>
              </div>
            </div>

            {/* Interactive Component Card */}
            <div
              className={`p-4 rounded-xl border transition-colors flex flex-col justify-between ${
                isDark ? 'bg-[#0d1424] border-slate-800/80' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Interactive Controls</span>
              <div className="flex items-center justify-between gap-2 mt-2">
                <button
                  type="button"
                  className={`text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-transform active:scale-95 ${accent.bgClass} ${accent.bgHoverClass}`}
                >
                  Primary Action
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Toggle</span>
                  <button
                    type="button"
                    onClick={() => setSampleToggle((prev) => !prev)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      sampleToggle ? accent.bgClass : isDark ? 'bg-slate-700' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        sampleToggle ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-2">
                Date: {formatDate(new Date())}
              </span>
            </div>
          </div>

          {/* Sample Table Row */}
          <div
            className={`p-3 rounded-xl border overflow-x-auto text-xs ${
              isDark ? 'bg-[#0d1424]/90 border-slate-800/70' : 'bg-white border-slate-200'
            }`}
          >
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800/50">
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Courier</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                <tr>
                  <td className="py-2 font-mono font-bold" style={{ color: accent.primaryHex }}>
                    #JBD-91823
                  </td>
                  <td className="py-2">Tanvir Ahmed</td>
                  <td className="py-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${accent.badgeClass}`}>
                      Processing
                    </span>
                  </td>
                  <td className="py-2 text-slate-400">Pathao Courier</td>
                  <td className="py-2 text-right font-bold text-emerald-400">{formatCurrency(2450)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 2: THEME MODE SELECTION */}
      <div
        className={`p-6 rounded-3xl border transition-all ${
          isDark ? 'bg-[#0b101d] border-slate-800/80' : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-800/60">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent.bgLightClass} ${accent.textClass}`}>
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`font-black text-sm uppercase tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('themeMode')} (Dark / Light / System Mode)
            </h2>
            <p className="text-[11px] text-slate-400">
              {t('systemSyncNotice')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card: Dark Mode */}
          <button
            type="button"
            onClick={() => setMode('dark')}
            className={`p-5 rounded-2xl border text-left transition-all relative ${
              mode === 'dark'
                ? `ring-2 ${accent.borderClass} ${isDark ? 'bg-slate-900/90' : 'bg-slate-900 text-white'}`
                : isDark
                ? 'bg-[#070c17] hover:bg-slate-900/60 border-slate-800/80'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
            }`}
            style={{
              borderColor: mode === 'dark' ? accent.primaryHex : undefined,
            }}
          >
            {mode === 'dark' && (
              <span
                className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: accent.primaryHex }}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-blue-400 mb-3 shadow-md">
              <Moon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">{t('darkMode')}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Deep obsidian black background designed for focused nighttime management and minimal eye strain.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              <span>Background: #090d16</span>
            </div>
          </button>

          {/* Card: Light Mode */}
          <button
            type="button"
            onClick={() => setMode('light')}
            className={`p-5 rounded-2xl border text-left transition-all relative ${
              mode === 'light'
                ? `ring-2 ${accent.borderClass} ${isDark ? 'bg-white text-slate-900' : 'bg-white shadow-md'}`
                : isDark
                ? 'bg-[#070c17] hover:bg-slate-900/60 border-slate-800/80'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
            }`}
            style={{
              borderColor: mode === 'light' ? accent.primaryHex : undefined,
            }}
          >
            {mode === 'light' && (
              <span
                className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: accent.primaryHex }}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-3 shadow-md">
              <Sun className="w-5 h-5" />
            </div>
            <h3 className={`font-bold text-sm ${mode === 'light' && isDark ? 'text-slate-900' : isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('lightMode')}
            </h3>
            <p className={`text-[11px] mt-1 ${mode === 'light' && isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              Clean, high-clarity crisp white theme with optimal contrast for daytime and brightly lit offices.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span>Background: #f4f7fb</span>
            </div>
          </button>

          {/* Card: System Mode */}
          <button
            type="button"
            onClick={() => setMode('system')}
            className={`p-5 rounded-2xl border text-left transition-all relative ${
              mode === 'system'
                ? `ring-2 ${accent.borderClass} ${isDark ? 'bg-slate-900/90' : 'bg-white shadow-md'}`
                : isDark
                ? 'bg-[#070c17] hover:bg-slate-900/60 border-slate-800/80'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
            }`}
            style={{
              borderColor: mode === 'system' ? accent.primaryHex : undefined,
            }}
          >
            {mode === 'system' && (
              <span
                className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: accent.primaryHex }}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 shadow-md">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('systemMode')}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Synchronizes automatically with your Windows, macOS, Android or iOS system preferences in real-time.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  resolvedTheme === 'dark' ? 'bg-blue-400' : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-400">
                Current OS Match: <strong className="text-white">{resolvedTheme.toUpperCase()}</strong>
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 3: ACCENT COLOR SELECTOR */}
      <div
        className={`p-6 rounded-3xl border transition-all ${
          isDark ? 'bg-[#0b101d] border-slate-800/80' : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent.bgLightClass} ${accent.textClass}`}>
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`font-black text-sm uppercase tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('accentColor')} (5 Curated Palettes)
              </h2>
              <p className="text-[11px] text-slate-400">
                {language === 'bn'
                  ? 'নীল, পার্পল, এমারেল্ড গ্রিন, রোজ এবং অরেঞ্জ থেকে আপনার পছন্দের ব্র্যান্ড অ্যাকসেন্ট নির্বাচন করুন'
                  : 'Select your signature brand accent: Blue, Purple, Emerald, Rose, or Orange'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {accentList.map((item) => {
            const isSelected = accentColor === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setAccentColor(item.id)}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? isDark
                      ? 'bg-slate-900 border-white/30 ring-2 shadow-lg'
                      : 'bg-white border-slate-400 ring-2 shadow-md'
                    : isDark
                    ? 'bg-[#070c17] hover:bg-slate-900/50 border-slate-800/80'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
                style={{
                  boxShadow: isSelected ? `0 6px 20px ${item.glowHex}` : undefined,
                  borderColor: isSelected ? item.primaryHex : undefined,
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-8 h-8 rounded-xl shadow-md flex items-center justify-center text-white"
                      style={{ backgroundColor: item.primaryHex }}
                    >
                      {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : null}
                    </div>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: item.lightHex,
                        color: item.primaryHex,
                      }}
                    >
                      {item.primaryHex}
                    </span>
                  </div>

                  <h3 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {language === 'bn' ? item.nameBn : item.name}
                  </h3>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/40 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {item.id}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.primaryHex }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: DISPLAY, LAYOUT & TYPOGRAPHY SETTINGS */}
      <div
        className={`p-6 rounded-3xl border transition-all ${
          isDark ? 'bg-[#0b101d] border-slate-800/80' : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-800/60">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent.bgLightClass} ${accent.textClass}`}>
            <Layout className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`font-black text-sm uppercase tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('displayDensity')} & {t('fontSize')}
            </h2>
            <p className="text-[11px] text-slate-400">
              Customize interface density, sidebar behavior, typographic size, and animation motion.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Layout Density */}
          <div className="space-y-3">
            <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('displayDensity')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'compact', label: t('compact'), desc: 'Dense data' },
                  { id: 'comfortable', label: t('comfortable'), desc: 'Standard' },
                  { id: 'spacious', label: t('spacious'), desc: 'Touch / Wide' },
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDensity(d.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    density === d.id
                      ? `${accent.bgLightClass} ${accent.borderClass} font-bold`
                      : isDark
                      ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                  style={{
                    borderColor: density === d.id ? accent.primaryHex : undefined,
                    color: density === d.id ? accent.primaryHex : undefined,
                  }}
                >
                  <p className="text-xs font-bold">{d.label.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Selection */}
          <div className="space-y-3">
            <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('fontSize')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'sm', label: t('fontSmall'), size: '13px' },
                  { id: 'md', label: t('fontMedium'), size: '14px' },
                  { id: 'lg', label: t('fontLarge'), size: '15px' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFontSize(f.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    fontSize === f.id
                      ? `${accent.bgLightClass} ${accent.borderClass} font-bold`
                      : isDark
                      ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                  style={{
                    borderColor: fontSize === f.id ? accent.primaryHex : undefined,
                    color: fontSize === f.id ? accent.primaryHex : undefined,
                  }}
                >
                  <p className="text-xs font-bold">{f.label.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{f.size}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Default Behavior */}
          <div className="space-y-3">
            <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Sidebar Behavior (Expanded vs Collapsed)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  !sidebarCollapsed
                    ? `${accent.bgLightClass} ${accent.borderClass} font-bold`
                    : isDark
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                style={{
                  borderColor: !sidebarCollapsed ? accent.primaryHex : undefined,
                  color: !sidebarCollapsed ? accent.primaryHex : undefined,
                }}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="text-xs">Expanded (Standard)</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  sidebarCollapsed
                    ? `${accent.bgLightClass} ${accent.borderClass} font-bold`
                    : isDark
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                style={{
                  borderColor: sidebarCollapsed ? accent.primaryHex : undefined,
                  color: sidebarCollapsed ? accent.primaryHex : undefined,
                }}
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="text-xs">Collapsed (Icons Only)</span>
              </button>
            </div>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="space-y-3">
            <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('reducedMotion')}
            </label>
            <div
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {reducedMotion ? 'Reduced Motion (Active)' : 'Standard Animations'}
                </p>
                <p className="text-[10px] text-slate-400">
                  Disables UI transitions for accessibility and ultra-fast speed.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                  reducedMotion ? accent.bgClass : isDark ? 'bg-slate-700' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    reducedMotion ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: LANGUAGE, DATE FORMAT & CURRENCY */}
      <div
        className={`p-6 rounded-3xl border transition-all ${
          isDark ? 'bg-[#0b101d] border-slate-800/80' : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-800/60">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent.bgLightClass} ${accent.textClass}`}>
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`font-black text-sm uppercase tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('language')}, {t('dateFormat')} & {t('currency')}
            </h2>
            <p className="text-[11px] text-slate-400">
              Bangla/English toggle, date formatting standards, and Bangladeshi Taka (৳ BDT) currency display.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Language Selection */}
          <div className="space-y-3">
            <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('language')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  language === 'bn'
                    ? `${accent.bgLightClass} ${accent.borderClass} font-bold`
                    : isDark
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                style={{
                  borderColor: language === 'bn' ? accent.primaryHex : undefined,
                  color: language === 'bn' ? accent.primaryHex : undefined,
                }}
              >
                <p className="text-xs font-bold">বাংলা (Bengali)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">স্থানীয় ভাষা</p>
              </button>

              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  language === 'en'
                    ? `${accent.bgLightClass} ${accent.borderClass} font-bold`
                    : isDark
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                style={{
                  borderColor: language === 'en' ? accent.primaryHex : undefined,
                  color: language === 'en' ? accent.primaryHex : undefined,
                }}
              >
                <p className="text-xs font-bold">English</p>
                <p className="text-[10px] text-slate-400 mt-0.5">International</p>
              </button>
            </div>
          </div>

          {/* Date Format Selection */}
          <div className="space-y-3">
            <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('dateFormat')}
            </label>
            <div className="space-y-1.5">
              {(
                ['DD/MM/YYYY', 'YYYY-MM-DD', 'DD MMM, YYYY'] as AdminDateFormat[]
              ).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setDateFormat(fmt)}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    dateFormat === fmt
                      ? `${accent.bgLightClass} ${accent.borderClass} font-bold`
                      : isDark
                      ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                  style={{
                    borderColor: dateFormat === fmt ? accent.primaryHex : undefined,
                    color: dateFormat === fmt ? accent.primaryHex : undefined,
                  }}
                >
                  <span className="font-mono">{fmt}</span>
                  <span className="text-[10px] text-slate-400">
                    {formatDate(new Date())}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Currency Display (৳ BDT) */}
          <div className="space-y-3">
            <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('currency')} (৳ BDT)
            </label>
            <div
              className={`p-4 rounded-xl border flex flex-col justify-between h-[120px] transition-all ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Bangladeshi Taka</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ৳ BDT
                </span>
              </div>
              <div>
                <p className="text-xl font-black text-white tracking-tight">
                  {formatCurrency(2450)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Formatted across all Order, Courier & Analytics screens
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save & Reset Sticky Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-20 backdrop-blur-xl shadow-2xl transition-all ${
          isDark
            ? 'bg-[#090d16]/90 border-slate-800/90'
            : 'bg-white/90 border-slate-200/90 shadow-slate-300/40'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full animate-ping"
            style={{ backgroundColor: accent.primaryHex }}
          />
          <p className="text-xs text-slate-400">
            {language === 'bn'
              ? 'সেটিংস স্বয়ংক্রিয়ভাবে ব্রাউজারে সংরক্ষিত থাকে এবং রিলোডের পরও বজায় থাকবে।'
              : 'All preferences persist in browser storage across page reloads and logins.'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleReset}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              isDark
                ? 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('resetDefaults')}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-xl transition-all active:scale-95 ${accent.bgClass} ${accent.bgHoverClass}`}
            style={{
              boxShadow: `0 8px 24px ${accent.glowHex}`,
            }}
          >
            <Check className="w-4 h-4" />
            <span>{t('savePreferences')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
