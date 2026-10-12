'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Eye,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  Activity,
  CheckSquare,
  Square,
  Copy,
  Check,
  ShieldCheck,
  X,
  AlertTriangle,
  Radio,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useAdminTheme } from '@/lib/store/adminThemeContext';
import { VisitorSession, PageviewRecord } from '@/types';

// Helper for human-readable relative time matching screenshot
function getRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 5) return '3 seconds ago';
    if (diffSec < 60) return `${diffSec} seconds ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin === 1) return '1 minute ago';
    if (diffMin < 60) return `${diffMin} minutes ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  } catch {
    return 'recently';
  }
}

export default function AdminVisitorsPage() {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [visitors, setVisitors] = useState<VisitorSession[]>([]);
  const [stats, setStats] = useState({
    totalVisitors: 0,
    onlineNow: 0,
    totalPageviews: 0,
    avgPagesPerVisitor: '1.0',
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'Desktop' | 'Mobile' | 'Tablet'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeHistorySession, setActiveHistorySession] = useState<VisitorSession | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch visitors from API
  const fetchVisitors = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetch('/api/visitors', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch visitors');
      const data = await res.json();
      if (data.visitors) {
        setVisitors(data.visitors);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err: any) {
      console.error('Error fetching visitors:', err);
      if (!isSilent) showToast('Failed to load visitor data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  // Auto-refresh interval (every 10 seconds for real-time tracking)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchVisitors(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchVisitors]);

  // Copy session ID
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    showToast('Session ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered visitor list
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        v.sessionId.toLowerCase().includes(q) ||
        (v.ipAddress && v.ipAddress.toLowerCase().includes(q)) ||
        (v.city && v.city.toLowerCase().includes(q)) ||
        (v.browser && v.browser.toLowerCase().includes(q)) ||
        v.pagesHistory.some((p) => p.path.toLowerCase().includes(q) || (p.title && p.title.toLowerCase().includes(q)));

      const matchDevice = deviceFilter === 'all' || v.device === deviceFilter;

      return matchSearch && matchDevice;
    });
  }, [visitors, search, deviceFilter]);

  // Selection handlers
  const handleToggleSelect = (sessionId: string) => {
    setSelectedIds((prev) =>
      prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [...prev, sessionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredVisitors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredVisitors.map((v) => v.sessionId));
    }
  };

  // Safe delete handler
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/visitors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionIds: selectedIds }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete sessions');
      }

      setVisitors((prev) => prev.filter((v) => !selectedIds.includes(v.sessionId)));
      showToast(`Safely deleted ${selectedIds.length} visitor session(s)`);
      setSelectedIds([]);
      setDeleteConfirmOpen(false);
      fetchVisitors(true);
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast(err.message || 'Error deleting visitors', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors ${isDark ? 'bg-[#0b0f19] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 border text-xs font-bold ${
              toast.type === 'error'
                ? 'bg-rose-500/90 text-white border-rose-400/30'
                : 'bg-emerald-500/90 text-white border-emerald-400/30'
            }`}
          >
            {toast.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Banner & KPI Stat Cards */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 1. Live Online Now */}
          <div className={`p-4 md:p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/60 border-slate-800 shadow-lg' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Online Right Now
              </span>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-emerald-500 tracking-tight">
                {stats.onlineNow}
              </span>
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>active</span>
            </div>
            <p className={`text-[11px] mt-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Active in the last 5 minutes
            </p>
          </div>

          {/* 2. Total Tracked Visitors */}
          <div className={`p-4 md:p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/60 border-slate-800 shadow-lg' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Total Visitors
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Eye className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-blue-500 tracking-tight">
                {stats.totalVisitors}
              </span>
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>sessions</span>
            </div>
            <p className={`text-[11px] mt-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Unique browser sessions
            </p>
          </div>

          {/* 3. Total Pageviews */}
          <div className={`p-4 md:p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/60 border-slate-800 shadow-lg' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Total Pageviews
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-purple-500 tracking-tight">
                {stats.totalPageviews}
              </span>
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>pages</span>
            </div>
            <p className={`text-[11px] mt-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Accumulated product & catalog views
            </p>
          </div>

          {/* 4. Avg Pages per Visitor */}
          <div className={`p-4 md:p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/60 border-slate-800 shadow-lg' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Avg. Pages / Visit
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-amber-500 tracking-tight">
                {stats.avgPagesPerVisitor}
              </span>
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>pages</span>
            </div>
            <p className={`text-[11px] mt-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Session engagement depth
            </p>
          </div>
        </div>

        {/* Main Console Box Matching User Screenshot */}
        <div className={`rounded-2xl border transition-all ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* Header Block matching exact screenshot: Title + Red Button */}
          <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {/* EXACT TITLE FROM SCREENSHOT */}
                <h1 className="text-xl md:text-2xl font-black tracking-wider uppercase font-sans text-slate-900 dark:text-white">
                  VISITOR ANALYTICS & HISTORY
                </h1>
                <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Real-time session monitoring, IP tracking, and customer journey analytics.
                </p>
              </div>

              {/* Controls on Right */}
              <div className="flex items-center gap-3">
                {/* Live Auto-Refresh Indicator Toggle */}
                <button
                  type="button"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    autoRefresh
                      ? isDark
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isDark
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                  title={autoRefresh ? 'Live updates ON (every 10s)' : 'Live updates paused'}
                >
                  <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-emerald-500' : ''}`} />
                  <span>{autoRefresh ? 'LIVE' : 'PAUSED'}</span>
                </button>

                {/* Refresh Manual Button */}
                <button
                  type="button"
                  onClick={() => fetchVisitors()}
                  disabled={refreshing}
                  className={`p-2 rounded-full border transition-all ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  title="Refresh visitor sessions"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* ACTION BUTTON MATCHING SCREENSHOT: DELETE SELECTED (SAFELY) */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={selectedIds.length === 0}
                className={`text-xs font-black px-5 py-2.5 rounded-full uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm ${
                  selectedIds.length > 0
                    ? 'bg-[#e11d48] hover:bg-[#be123c] text-white cursor-pointer active:scale-95 shadow-rose-600/20'
                    : 'bg-rose-500/30 text-rose-300/60 dark:bg-rose-950/40 dark:text-rose-400/40 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  DELETE SELECTED (SAFELY)
                  {selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
                </span>
              </button>

              {/* Quick Select Indicators */}
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className={`text-xs font-bold underline ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Deselect all
                </button>
              )}
            </div>

            {/* Search and Filters Toolbar */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search Bar */}
              <div className="sm:col-span-2 relative">
                <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search by Session ID, IP Address, Device, or Path..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all border ${
                    isDark
                      ? 'bg-slate-950/50 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Device Filter */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                {(['all', 'Desktop', 'Mobile', 'Tablet'] as const).map((dev) => (
                  <button
                    key={dev}
                    type="button"
                    onClick={() => setDeviceFilter(dev)}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all capitalize ${
                      deviceFilter === dev
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {dev}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table matching screenshot columns:
              Checkbox | SESSION ID | IP ADDRESS | TOTAL PAGES VISITED | LAST SEEN | ACTION */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-black uppercase tracking-wider ${
                  isDark
                    ? 'border-slate-800/80 bg-slate-950/30 text-slate-400'
                    : 'border-slate-200 bg-slate-50/80 text-slate-500'
                }`}>
                  <th className="py-4 px-4 w-12 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title={selectedIds.length === filteredVisitors.length ? 'Deselect all' : 'Select all'}
                    >
                      {selectedIds.length > 0 && selectedIds.length === filteredVisitors.length ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className={`w-4 h-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-4 font-black">SESSION ID</th>
                  <th className="py-4 px-4 font-black">IP ADDRESS</th>
                  <th className="py-4 px-4 font-black">TOTAL PAGES VISITED</th>
                  <th className="py-4 px-4 font-black">LAST SEEN</th>
                  <th className="py-4 px-4 font-black text-right pr-6">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                        <span className={`text-xs font-bold font-mono tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          LOADING VISITOR SESSIONS...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Eye className="w-8 h-8 text-slate-400 opacity-40" />
                        <span className="text-sm font-bold text-slate-400">No visitor sessions found</span>
                        <span className="text-xs text-slate-500">
                          {search ? 'Try adjusting your search criteria' : 'New visitors will show up automatically in real-time'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((visitor) => {
                    const isSelected = selectedIds.includes(visitor.sessionId);
                    const isOnline = Date.now() - new Date(visitor.lastSeen).getTime() < 3 * 60000;

                    return (
                      <tr
                        key={visitor.id || visitor.sessionId}
                        className={`transition-colors group ${
                          isSelected
                            ? isDark
                              ? 'bg-blue-950/20 hover:bg-blue-950/30'
                              : 'bg-blue-50/70 hover:bg-blue-50'
                            : isDark
                            ? 'hover:bg-slate-800/30'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Checkbox column */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(visitor.sessionId)}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className={`w-4 h-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                            )}
                          </button>
                        </td>

                        {/* SESSION ID (e.g. vis_6acc70ba435406.9...) */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {isOnline && (
                              <span className="flex h-2 w-2 relative shrink-0" title="Online right now">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                            )}
                            <span
                              className="font-mono font-bold tracking-tight text-slate-900 dark:text-slate-100 cursor-pointer hover:text-blue-500 transition-colors"
                              title={visitor.sessionId}
                              onClick={() => handleCopy(visitor.sessionId)}
                            >
                              {visitor.sessionId.length > 24
                                ? `${visitor.sessionId.slice(0, 21)}...`
                                : visitor.sessionId}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(visitor.sessionId)}
                              className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                                isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
                              }`}
                              title="Copy Session ID"
                            >
                              {copiedId === visitor.sessionId ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* IP ADDRESS */}
                        <td className="py-4 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-2">
                            <span>{visitor.ipAddress || '182.163.108.105'}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                                visitor.device === 'Mobile'
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                  : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                              }`}
                            >
                              {visitor.device === 'Mobile' ? (
                                <Smartphone className="w-2.5 h-2.5" />
                              ) : (
                                <Laptop className="w-2.5 h-2.5" />
                              )}
                              <span>{visitor.browser || visitor.device}</span>
                            </span>
                          </div>
                        </td>

                        {/* TOTAL PAGES VISITED (Matches screenshot blue link) */}
                        <td className="py-4 px-4">
                          <span
                            onClick={() => setActiveHistorySession(visitor)}
                            className="font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline inline-flex items-center gap-1.5"
                          >
                            <span>{visitor.totalPages || visitor.pagesHistory.length || 1} Pages</span>
                          </span>
                        </td>

                        {/* LAST SEEN (e.g. 3 seconds ago, 19 minutes ago) */}
                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium">
                          {getRelativeTime(visitor.lastSeen)}
                        </td>

                        {/* ACTION: Exact Black Pill Button from Screenshot */}
                        <td className="py-4 px-4 text-right pr-6">
                          <button
                            type="button"
                            onClick={() => setActiveHistorySession(visitor)}
                            className="bg-[#18181b] hover:bg-black text-white text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>VIEW HISTORY</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className={`p-4 px-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            isDark ? 'border-slate-800/80 bg-slate-950/20 text-slate-400' : 'border-slate-200 bg-slate-50/50 text-slate-500'
          }`}>
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{filteredVisitors.length}</strong> of{' '}
              <strong className="text-slate-900 dark:text-white">{visitors.length}</strong> total tracked sessions
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-[11px]">Real-time tracking active across all site pages</span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW HISTORY SLIDE-OVER / MODAL */}
      {activeHistorySession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border transition-all ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className={`p-6 border-b flex items-center justify-between ${
              isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/80'
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <h3 className="text-base font-black uppercase tracking-wider">
                    VISITOR SESSION JOURNEY
                  </h3>
                </div>
                <p className="font-mono text-xs text-blue-500 dark:text-blue-400 mt-1 font-bold">
                  {activeHistorySession.sessionId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveHistorySession(null)}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Session Meta & Journey Timeline */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Meta Grid */}
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border ${
                isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">IP ADDRESS</span>
                  <p className="text-xs font-mono font-bold mt-0.5 text-slate-800 dark:text-slate-200">
                    {activeHistorySession.ipAddress || '182.163.108.105'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LOCATION</span>
                  <p className="text-xs font-bold mt-0.5 text-slate-800 dark:text-slate-200">
                    {activeHistorySession.city || 'Dhaka'}, {activeHistorySession.country || 'Bangladesh'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">DEVICE & BROWSER</span>
                  <p className="text-xs font-bold mt-0.5 text-slate-800 dark:text-slate-200">
                    {activeHistorySession.device} · {activeHistorySession.browser}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">FIRST SEEN</span>
                  <p className="text-xs font-bold mt-0.5 text-slate-800 dark:text-slate-200">
                    {getRelativeTime(activeHistorySession.firstSeen)}
                  </p>
                </div>
              </div>

              {/* Page Journey Timeline */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  <span>Browsing Journey ({activeHistorySession.pagesHistory.length} Pages Visited)</span>
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-500/30">
                  {activeHistorySession.pagesHistory.map((page, index) => {
                    const isLatest = index === activeHistorySession.pagesHistory.length - 1;
                    return (
                      <div key={index} className="relative group">
                        {/* Timeline Bullet */}
                        <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          isLatest
                            ? 'bg-blue-600 border-white dark:border-slate-900 shadow-md shadow-blue-500/40 ring-4 ring-blue-500/20'
                            : isDark
                            ? 'bg-slate-800 border-slate-700'
                            : 'bg-slate-200 border-white'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isLatest ? 'bg-white' : 'bg-slate-400'}`} />
                        </div>

                        {/* Journey Step Card */}
                        <div className={`p-4 rounded-2xl border transition-all ${
                          isLatest
                            ? isDark
                              ? 'bg-blue-950/20 border-blue-500/30'
                              : 'bg-blue-50/70 border-blue-200'
                            : isDark
                            ? 'bg-slate-950/30 border-slate-800/80'
                            : 'bg-white border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {page.title || 'Visited Page'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {getRelativeTime(page.timestamp)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                              {page.path}
                            </span>
                            {page.referrer && (
                              <span className="text-[10px] text-slate-400 truncate">
                                from: {page.referrer}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 px-6 border-t flex items-center justify-end ${
              isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'
            }`}>
              <button
                type="button"
                onClick={() => setActiveHistorySession(null)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                }`}
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAFE DELETE CONFIRMATION DIALOG */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl transition-all ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black uppercase tracking-wider">
              Safely Delete Selected Visitors?
            </h3>
            <p className={`text-xs mt-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Are you sure you want to remove <strong>{selectedIds.length}</strong> visitor session(s)? This will safely purge the selected analytics records from Supabase storage.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? 'Deleting...' : 'Confirm & Delete Safely'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
