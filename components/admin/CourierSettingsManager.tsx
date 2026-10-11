'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Zap,
  Info,
  Server,
  Layers,
  ChevronRight,
  Globe,
  Radio,
  HelpCircle,
} from 'lucide-react';
import { useProducts } from '@/lib/store/productsContext';
import { useAdminTheme } from '@/lib/store/adminThemeContext';
import { CourierSettings, SteadfastConfig, PathaoConfig } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function CourierSettingsManager() {
  const { siteSettings, updateSiteSettings } = useProducts();
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  // Local state initialized from siteSettings.courierSettings or defaults
  const courier = siteSettings.courierSettings;

  // Steadfast state
  const [sfEnabled, setSfEnabled] = useState(courier?.steadfast?.enabled ?? false);
  const [sfApiKey, setSfApiKey] = useState(courier?.steadfast?.apiKey || '');
  const [sfSecretKey, setSfSecretKey] = useState(courier?.steadfast?.secretKey || '');
  const [sfBaseUrl, setSfBaseUrl] = useState(courier?.steadfast?.baseUrl || 'https://portal.steadfast.com.bd/api/v1');
  const [sfNote, setSfNote] = useState(courier?.steadfast?.defaultNote || 'Jeans BD Premium Denim');
  const [showSfSecret, setShowSfSecret] = useState(false);

  // Pathao state
  const [pathaoEnabled, setPathaoEnabled] = useState(courier?.pathao?.enabled ?? false);
  const [pathaoClientId, setPathaoClientId] = useState(courier?.pathao?.clientId || '');
  const [pathaoClientSecret, setPathaoClientSecret] = useState(courier?.pathao?.clientSecret || '');
  const [pathaoUsername, setPathaoUsername] = useState(courier?.pathao?.username || '');
  const [pathaoPassword, setPathaoPassword] = useState(courier?.pathao?.password || '');
  const [pathaoStoreId, setPathaoStoreId] = useState(courier?.pathao?.storeId || '');
  const [pathaoIsSandbox, setPathaoIsSandbox] = useState(courier?.pathao?.isSandbox ?? false);
  const [showPathaoSecret, setShowPathaoSecret] = useState(false);
  const [showPathaoPassword, setShowPathaoPassword] = useState(false);

  // General routing rules
  const [dhakaCourier, setDhakaCourier] = useState<'Steadfast' | 'Pathao'>(courier?.defaultCourierDhaka || 'Steadfast');
  const [outsideCourier, setOutsideCourier] = useState<'Steadfast' | 'Pathao'>(courier?.defaultCourierOutsideDhaka || 'Pathao');
  const [autoDispatch, setAutoDispatch] = useState(courier?.autoDispatchOnConfirm ?? false);

  // Testing & store fetching states
  const [sfTesting, setSfTesting] = useState(false);
  const [sfTestResult, setSfTestResult] = useState<{ success: boolean; message: string; balance?: number } | null>(
    courier?.lastTested?.steadfast || null
  );

  const [pathaoTesting, setPathaoTesting] = useState(false);
  const [pathaoTestResult, setPathaoTestResult] = useState<{ success: boolean; message: string; storeCount?: number } | null>(
    courier?.lastTested?.pathao || null
  );

  const [fetchingStores, setFetchingStores] = useState(false);
  const [pathaoStores, setPathaoStores] = useState<Array<{ store_id: number | string; store_name: string; store_address?: string }>>([]);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Webhook URL
  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/courier/webhook`
    : 'https://jeansbd.com/api/courier/webhook';

  // Sync state if siteSettings loads from cloud
  useEffect(() => {
    if (siteSettings.courierSettings) {
      const c = siteSettings.courierSettings;
      setSfEnabled(c.steadfast?.enabled ?? false);
      if (c.steadfast?.apiKey) setSfApiKey(c.steadfast.apiKey);
      if (c.steadfast?.secretKey) setSfSecretKey(c.steadfast.secretKey);
      if (c.steadfast?.baseUrl) setSfBaseUrl(c.steadfast.baseUrl);
      if (c.steadfast?.defaultNote) setSfNote(c.steadfast.defaultNote);

      setPathaoEnabled(c.pathao?.enabled ?? false);
      if (c.pathao?.clientId) setPathaoClientId(c.pathao.clientId);
      if (c.pathao?.clientSecret) setPathaoClientSecret(c.pathao.clientSecret);
      if (c.pathao?.username) setPathaoUsername(c.pathao.username);
      if (c.pathao?.password) setPathaoPassword(c.pathao.password);
      if (c.pathao?.storeId) setPathaoStoreId(c.pathao.storeId);
      if (c.pathao?.isSandbox !== undefined) setPathaoIsSandbox(c.pathao.isSandbox);

      if (c.defaultCourierDhaka) setDhakaCourier(c.defaultCourierDhaka);
      if (c.defaultCourierOutsideDhaka) setOutsideCourier(c.defaultCourierOutsideDhaka);
      if (c.autoDispatchOnConfirm !== undefined) setAutoDispatch(c.autoDispatchOnConfirm);
      if (c.lastTested?.steadfast) setSfTestResult(c.lastTested.steadfast);
      if (c.lastTested?.pathao) setPathaoTestResult(c.lastTested.pathao);
    }
  }, [siteSettings]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  // Test Steadfast Connection
  const handleTestSteadfast = async () => {
    if (!sfApiKey.trim() || !sfSecretKey.trim()) {
      showNotification('error', 'Please enter both Steadfast API Key and Secret Key first.');
      return;
    }

    setSfTesting(true);
    setSfTestResult(null);

    try {
      const res = await fetch('/api/courier/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'steadfast',
          creds: {
            apiKey: sfApiKey.trim(),
            secretKey: sfSecretKey.trim(),
            baseUrl: sfBaseUrl.trim(),
          },
        }),
      });

      const data = await res.json();
      setSfTestResult(data);

      if (data.success) {
        showNotification('success', data.message || 'Steadfast connected successfully!');
      } else {
        showNotification('error', data.message || 'Steadfast connection test failed.');
      }
    } catch (err: any) {
      setSfTestResult({ success: false, message: err?.message || 'Network test failed' });
      showNotification('error', 'Could not reach server to test Steadfast API.');
    } finally {
      setSfTesting(false);
    }
  };

  // Test Pathao Connection
  const handleTestPathao = async () => {
    if (!pathaoClientId.trim() || !pathaoClientSecret.trim() || !pathaoUsername.trim() || !pathaoPassword.trim()) {
      showNotification('error', 'Please fill in all Pathao credentials (Client ID, Secret, Username, Password).');
      return;
    }

    setPathaoTesting(true);
    setPathaoTestResult(null);

    try {
      const res = await fetch('/api/courier/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'pathao',
          creds: {
            clientId: pathaoClientId.trim(),
            clientSecret: pathaoClientSecret.trim(),
            username: pathaoUsername.trim(),
            password: pathaoPassword.trim(),
            isSandbox: pathaoIsSandbox,
          },
        }),
      });

      const data = await res.json();
      setPathaoTestResult(data);

      if (data.success) {
        showNotification('success', data.message || 'Pathao connected successfully!');
        if (data.stores && data.stores.length > 0) {
          setPathaoStores(data.stores);
        }
      } else {
        showNotification('error', data.message || 'Pathao connection test failed.');
      }
    } catch (err: any) {
      setPathaoTestResult({ success: false, message: err?.message || 'Network test failed' });
      showNotification('error', 'Could not reach server to test Pathao API.');
    } finally {
      setPathaoTesting(false);
    }
  };

  // Fetch Pathao Stores
  const handleFetchStores = async () => {
    if (!pathaoClientId.trim() || !pathaoClientSecret.trim() || !pathaoUsername.trim() || !pathaoPassword.trim()) {
      showNotification('error', 'Please enter your Pathao credentials before fetching stores.');
      return;
    }

    setFetchingStores(true);

    try {
      const res = await fetch('/api/courier/pathao-stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: pathaoClientId.trim(),
          clientSecret: pathaoClientSecret.trim(),
          username: pathaoUsername.trim(),
          password: pathaoPassword.trim(),
          isSandbox: pathaoIsSandbox,
        }),
      });

      const data = await res.json();
      if (data.success && data.stores) {
        setPathaoStores(data.stores);
        if (data.stores.length > 0 && !pathaoStoreId) {
          setPathaoStoreId(String(data.stores[0].store_id));
        }
        showNotification('success', `Found ${data.stores.length} store branch(es) in your Pathao account!`);
      } else {
        showNotification('error', data.message || 'Could not load Pathao stores.');
      }
    } catch (err: any) {
      showNotification('error', 'Error requesting store list from Pathao.');
    } finally {
      setFetchingStores(false);
    }
  };

  // Save All Settings
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);

    const updatedCourierSettings: CourierSettings = {
      defaultCourierDhaka: dhakaCourier,
      defaultCourierOutsideDhaka: outsideCourier,
      autoDispatchOnConfirm: autoDispatch,
      steadfast: {
        enabled: sfEnabled,
        apiKey: sfApiKey.trim(),
        secretKey: sfSecretKey.trim(),
        baseUrl: sfBaseUrl.trim(),
        defaultNote: sfNote.trim(),
      },
      pathao: {
        enabled: pathaoEnabled,
        clientId: pathaoClientId.trim(),
        clientSecret: pathaoClientSecret.trim(),
        username: pathaoUsername.trim(),
        password: pathaoPassword.trim(),
        storeId: pathaoStoreId.trim(),
        isSandbox: pathaoIsSandbox,
        defaultDeliveryType: 48,
        defaultItemType: 2,
      },
      lastTested: {
        steadfast: sfTestResult
          ? { ...sfTestResult, timestamp: new Date().toISOString() }
          : courier?.lastTested?.steadfast,
        pathao: pathaoTestResult
          ? { ...pathaoTestResult, timestamp: new Date().toISOString() }
          : courier?.lastTested?.pathao,
      },
    };

    try {
      // 1. Save in siteSettings state & Supabase
      await updateSiteSettings({
        courierSettings: updatedCourierSettings,
      });

      // 2. Also persist via dedicated API endpoint for safety
      await fetch('/api/courier/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCourierSettings),
      });

      showNotification('success', 'Courier API configuration saved & activated successfully!');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to save courier settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border text-sm font-bold transition-all animate-in slide-in-from-top-4 ${
            toast.type === 'success'
              ? 'bg-emerald-600/95 text-white border-emerald-400/40 shadow-emerald-600/30'
              : 'bg-rose-600/95 text-white border-rose-400/40 shadow-rose-600/30'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div
        className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl border transition-all ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-[#101827] to-slate-900 border-slate-800 shadow-xl'
            : 'bg-gradient-to-br from-white via-slate-50 to-blue-50/40 border-slate-200 shadow-sm'
        }`}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Zap className="w-3.5 h-3.5" />
              <span>Automated Logistics Gateway</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Courier API Control Console
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Connect your official <strong className="text-emerald-500 font-bold">Steadfast Courier</strong> and{' '}
              <strong className="text-rose-500 font-bold">Pathao Merchant</strong> accounts to automate order dispatch,
              tracking ID assignment, customer SMS updates, and live parcel synchronization directly from your admin panel.
            </p>
          </div>

          {/* Quick status indicators */}
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold ${
                sfEnabled && sfApiKey
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${sfEnabled && sfApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>Steadfast: {sfEnabled && sfApiKey ? 'Active' : 'Not Connected'}</span>
            </div>

            <div
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold ${
                pathaoEnabled && pathaoClientId
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${pathaoEnabled && pathaoClientId ? 'bg-rose-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>Pathao: {pathaoEnabled && pathaoClientId ? (pathaoIsSandbox ? 'Sandbox' : 'Production') : 'Not Connected'}</span>
            </div>

            <button
              onClick={() => handleSaveSettings()}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Steadfast & Pathao Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ========================================================= */}
        {/* 1. STEADFAST COURIER CONFIGURATION */}
        {/* ========================================================= */}
        <div
          className={`flex flex-col rounded-3xl border transition-all overflow-hidden ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {/* Card Header */}
          <div className="p-6 border-b border-inherit bg-gradient-to-r from-emerald-500/5 to-transparent flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 font-black text-lg">
                SF
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Steadfast Courier API
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Official
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  portal.steadfast.com.bd Merchant Integration
                </p>
              </div>
            </div>

            {/* Enable switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sfEnabled}
                onChange={(e) => setSfEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-5 flex-1">
            {/* API Key */}
            <div className="space-y-1.5">
              <label className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <span>Steadfast API Key</span>
                <span className="text-[11px] text-slate-500 normal-case font-normal">Found in Merchant Profile</span>
              </label>
              <input
                type="text"
                value={sfApiKey}
                onChange={(e) => setSfApiKey(e.target.value)}
                placeholder="e.g. 5xXXXXXXXXXXxxxxxxxxxxxx"
                className={`w-full px-4 py-3 rounded-2xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-600'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Secret Key */}
            <div className="space-y-1.5">
              <label className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <span>Steadfast Secret Key</span>
                <button
                  type="button"
                  onClick={() => setShowSfSecret(!showSfSecret)}
                  className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1 font-semibold"
                >
                  {showSfSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSfSecret ? 'Hide' : 'Reveal'}</span>
                </button>
              </label>
              <div className="relative">
                <input
                  type={showSfSecret ? 'text' : 'password'}
                  value={sfSecretKey}
                  onChange={(e) => setSfSecretKey(e.target.value)}
                  placeholder="Enter your Steadfast Secret Key"
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-600'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Default Note */}
            <div className="space-y-1.5">
              <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Default Consignment Note
              </label>
              <input
                type="text"
                value={sfNote}
                onChange={(e) => setSfNote(e.target.value)}
                placeholder="e.g. Jeans BD - Premium Denim (Call customer before delivery)"
                className={`w-full px-4 py-3 rounded-2xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-600'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Live Connection Test Card */}
            {sfTestResult && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-1.5 animate-in fade-in-50 ${
                  sfTestResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {sfTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                  <span>{sfTestResult.message}</span>
                </div>
                {sfTestResult.success && sfTestResult.balance !== undefined && (
                  <p className="text-[11px] text-slate-300">
                    Steadfast Merchant Wallet Balance:{' '}
                    <strong className="text-emerald-400 font-bold">{formatPrice(sfTestResult.balance)}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Help info */}
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${isDark ? 'bg-slate-900/50 border-slate-800/80 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <div className="flex items-center gap-2 font-bold text-slate-300">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>How to get Steadfast API Keys:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                <li>Log in to your <strong>Steadfast Courier Merchant Panel</strong> (portal.steadfast.com.bd).</li>
                <li>Go to <strong>Settings</strong> or <strong>API / Developer</strong> menu.</li>
                <li>Copy the <strong>API Key</strong> and <strong>Secret Key</strong>, and paste them above.</li>
              </ol>
            </div>
          </div>

          {/* Card Footer: Test Button */}
          <div className="p-6 border-t border-inherit bg-slate-950/20 flex items-center justify-between">
            <a
              href="https://portal.steadfast.com.bd"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-semibold transition-colors"
            >
              <span>Merchant Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={handleTestSteadfast}
              disabled={sfTesting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {sfTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              <span>{sfTesting ? 'Verifying...' : 'Test Steadfast Connection'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. PATHAO COURIER MERCHANT CONFIGURATION */}
        {/* ========================================================= */}
        <div
          className={`flex flex-col rounded-3xl border transition-all overflow-hidden ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {/* Card Header */}
          <div className="p-6 border-b border-inherit bg-gradient-to-r from-rose-500/5 to-transparent flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0 font-black text-lg">
                PT
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Pathao Merchant API
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    Official
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  merchant.pathao.com Courier Integration
                </p>
              </div>
            </div>

            {/* Enable switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={pathaoEnabled}
                onChange={(e) => setPathaoEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4 flex-1">
            {/* Mode: Production vs Sandbox */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-inherit bg-slate-950/20">
              <div className="space-y-0.5">
                <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Environment Mode
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {pathaoIsSandbox ? 'Sandbox (Testing Mode)' : 'Production (Live Deliveries)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPathaoIsSandbox(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    !pathaoIsSandbox
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : isDark
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  Live Production
                </button>
                <button
                  type="button"
                  onClick={() => setPathaoIsSandbox(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pathaoIsSandbox
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : isDark
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  Sandbox
                </button>
              </div>
            </div>

            {/* Client ID & Secret */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Client ID
                </label>
                <input
                  type="text"
                  value={pathaoClientId}
                  onChange={(e) => setPathaoClientId(e.target.value)}
                  placeholder="e.g. 104"
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-600'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span>Client Secret</span>
                  <button
                    type="button"
                    onClick={() => setShowPathaoSecret(!showPathaoSecret)}
                    className="text-xs text-rose-500 hover:text-rose-400 flex items-center gap-1 font-semibold"
                  >
                    {showPathaoSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </label>
                <input
                  type={showPathaoSecret ? 'text' : 'password'}
                  value={pathaoClientSecret}
                  onChange={(e) => setPathaoClientSecret(e.target.value)}
                  placeholder="Enter Client Secret"
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-600'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Username & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Merchant Email / Username
                </label>
                <input
                  type="email"
                  value={pathaoUsername}
                  onChange={(e) => setPathaoUsername(e.target.value)}
                  placeholder="merchant@pathao.com"
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs border focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-600'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span>Account Password</span>
                  <button
                    type="button"
                    onClick={() => setShowPathaoPassword(!showPathaoPassword)}
                    className="text-xs text-rose-500 hover:text-rose-400 flex items-center gap-1 font-semibold"
                  >
                    {showPathaoPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </label>
                <input
                  type={showPathaoPassword ? 'text' : 'password'}
                  value={pathaoPassword}
                  onChange={(e) => setPathaoPassword(e.target.value)}
                  placeholder="Your Pathao password"
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-600'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Store ID & Store Fetching */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Default Pickup Store ID
                </label>
                <button
                  type="button"
                  onClick={handleFetchStores}
                  disabled={fetchingStores}
                  className="text-xs text-rose-500 hover:text-rose-400 flex items-center gap-1 font-bold transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${fetchingStores ? 'animate-spin' : ''}`} />
                  <span>{fetchingStores ? 'Fetching...' : 'Fetch Stores from Pathao'}</span>
                </button>
              </div>

              {pathaoStores.length > 0 ? (
                <select
                  value={pathaoStoreId}
                  onChange={(e) => setPathaoStoreId(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all ${
                    isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="">Select a Pathao pickup store...</option>
                  {pathaoStores.map((st) => (
                    <option key={st.store_id} value={st.store_id}>
                      {st.store_name} (ID: {st.store_id}) - {st.store_address || 'Default address'}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={pathaoStoreId}
                  onChange={(e) => setPathaoStoreId(e.target.value)}
                  placeholder="e.g. 12534 (Click 'Fetch Stores' to auto-detect)"
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-600'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              )}
            </div>

            {/* Live Connection Test Card */}
            {pathaoTestResult && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-1 animate-in fade-in-50 ${
                  pathaoTestResult.success
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-slate-500/10 border-slate-500/30 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {pathaoTestResult.success ? <CheckCircle2 className="w-4 h-4 text-rose-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                  <span>{pathaoTestResult.message}</span>
                </div>
              </div>
            )}

            {/* Help info */}
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${isDark ? 'bg-slate-900/50 border-slate-800/80 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <div className="flex items-center gap-2 font-bold text-slate-300">
                <HelpCircle className="w-4 h-4 text-rose-400" />
                <span>How to get Pathao API Keys:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                <li>Log in to your <strong>Pathao Merchant Account</strong> (merchant.pathao.com).</li>
                <li>Go to <strong>Developer / API Settings</strong> and create an API client.</li>
                <li>Copy <strong>Client ID</strong> and <strong>Client Secret</strong>, then enter your login email and password.</li>
              </ol>
            </div>
          </div>

          {/* Card Footer: Test Button */}
          <div className="p-6 border-t border-inherit bg-slate-950/20 flex items-center justify-between">
            <a
              href="https://merchant.pathao.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-semibold transition-colors"
            >
              <span>Merchant Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={handleTestPathao}
              disabled={pathaoTesting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {pathaoTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              <span>{pathaoTesting ? 'Verifying...' : 'Test Pathao Connection'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. AUTOMATION & ROUTING RULES */}
      {/* ========================================================= */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all space-y-6 ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Smart Routing & Webhook Automation
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Configure default courier rules based on delivery destination and setup instant webhook updates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Inside Dhaka */}
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Default for Inside Dhaka
            </label>
            <select
              value={dhakaCourier}
              onChange={(e) => setDhakaCourier(e.target.value as any)}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="Steadfast">Steadfast Courier (Recommended)</option>
              <option value="Pathao">Pathao Express</option>
            </select>
            <span className="text-[11px] text-slate-500 block">Orders with district = Dhaka will route here first</span>
          </div>

          {/* Outside Dhaka */}
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Default for Outside Dhaka
            </label>
            <select
              value={outsideCourier}
              onChange={(e) => setOutsideCourier(e.target.value as any)}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="Steadfast">Steadfast Courier</option>
              <option value="Pathao">Pathao Express (Recommended)</option>
            </select>
            <span className="text-[11px] text-slate-500 block">Orders to 63 other districts across Bangladesh</span>
          </div>

          {/* Auto-dispatch toggle */}
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Instant Booking on Confirmation
            </label>
            <label className="flex items-center gap-3 p-3 rounded-2xl border border-inherit bg-slate-950/20 cursor-pointer">
              <input
                type="checkbox"
                checked={autoDispatch}
                onChange={(e) => setAutoDispatch(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Auto-generate consignment when order is marked Confirmed
              </span>
            </label>
          </div>
        </div>

        {/* Webhook URL bar */}
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-black uppercase tracking-wider text-blue-400 block">
                Webhook Callback URL
              </span>
              <p className="text-[11px] text-slate-400">
                Paste this URL in Steadfast and Pathao developer webhook settings for real-time delivery status updates:
              </p>
            </div>

            <div className="flex items-center gap-2">
              <code className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 select-all">
                {webhookUrl}
              </code>
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebhook ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Big Save Button */}
        <div className="flex justify-end pt-4 border-t border-inherit">
          <button
            type="button"
            onClick={() => handleSaveSettings()}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm uppercase tracking-wider shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving Changes...' : 'Save & Activate Courier APIs'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
